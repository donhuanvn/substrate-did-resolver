const { ApiPromise, WsProvider } = require('@polkadot/api')
const { encodeAddress } = require('@polkadot/keyring')
const {
  isPolkadotAddress,
  updateDDOContext,
  Errors,
  VerificationMethodTypes: VeriMethodTypes
} = require('./helpers')

class SubstrateDidResolver {
  #api = null
  #provider = null
  constructor(option) {
    this.option = option
  }
  async #init() {
    this.#provider = new WsProvider(this.option.wsUrl)
    this.#api = await ApiPromise.create({ provider: this.#provider })
  }

  async resolve(did, parsed, _resolver, _options) {
    // console.log("did:", did)
    // console.log("parsed:", parsed)
    // console.log("_resolver:", _resolver)
    // console.log("_options:", _options)

    if (!isPolkadotAddress(parsed.id)) {
      return {
        didResolutionMetadata: {
          error: Errors.invalidDid,
          message: `Not a valid did:substrate:${parsed.id}`,
        },
        didDocumentMetadata: {},
        didDocument: null,
      }
    }

    // build base DID document
    const ownerResult = await this.#api.query.palletDid.ownerOf(parsed.id)
    const owner = ownerResult.isEmpty ? did : ownerResult.toString()
    let didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: VeriMethodTypes.Ed25519VerificationKey2018.name,
          controller: did,
          blockchainAccountId: owner
        }
      ],
      authentication: [`${did}#controller`],
      assertionMethod: [`${did}#controller`],
      service: [],
      keyAgreement: [],
    }

    // temporary variables for sequential building process
    const temp = {
      delegateCount: 0,
      serviceCount: 0,
    }

    await this.#buildDDOWithDelegateData(did, parsed, temp, didDocument)
    await this.#buildDDOWithAttributeData(did, parsed, temp, didDocument)

    // console.log("DID Document:", didDocument)

    return {
      didDocumentMetadata: {
        deactivated: false,
        versionMeta: {/* Unsupported */ },
        versionMetaNext: {/* Unsupported */ }
      },
      didResolutionMetadata: { contentType: 'application/did+ld+json' },
      didDocument
    }
  }


  async #buildDDOWithDelegateData(did, parsed, temp, ddo) {
    // Query the current block number that aims to check validity of delegates below.
    const nowBlockNumber = (await this.#api.rpc.chain.getHeader()).number

    // Query related delegate entries from on-chain storage. This is a storage 3-map.
    const delegatesResult = await this.#api.query.palletDid.delegateOf.entries(parsed.id)
    delegatesResult.map(([key, delegateValidity]) => {
      // console.log("key:", key.args.map(k => k.toHuman()))
      // console.log("delegateValidity:", delegateValidity.toHuman())

      // skip entries out of validity.
      if (delegateValidity.toHex() <= nowBlockNumber.toHex()) {
        return
      }

      const [identity, delegateType, delegate] = key.args // order of 3-key as defined in pallet-did

      // In this DDO build, only delegate types 'sigAuth' and 'veriKey' will be considered.
      if (delegateType.eq('sigAuth') || delegateType.eq('veriKey')) {
        temp.delegateCount++
        const id = `${did}#delegate-${temp.delegateCount}`
        ddo.verificationMethod.push(
          {
            id,
            type: VeriMethodTypes.Ed25519VerificationKey2018.name, // According to default keyring of substrate (Ed25519 or Sr25519).
            controler: did,
            blockchainAccountId: delegate.toString()
          }
        )
        // a 'sigAuth' delegate can be used to authenticate this DID.
        if (delegateType.eq('sigAuth')) {
          ddo.authentication.push(id)
        }
        // update context
        updateDDOContext(ddo, VeriMethodTypes.Ed25519VerificationKey2018['@context'])
      }
    })
  }

  async #buildDDOWithAttributeData(did, parsed, temp, ddo) {
    // Query a related owner entry from on-chain storage. This is a storage map.
    const ownerResult = await this.#api.query.palletDid.ownerOf(parsed.id)
    // With a DID that hasn't ever been changed owner, that will not have entry in on-chain storage (OwnerOf).
    const owner = ownerResult.isEmpty ? did : ownerResult.toString()
    // console.log(`Owner of ${did} is ${owner}`)

    const nowBlockNumber = (await this.#api.rpc.chain.getHeader()).number

    // Query related attribute entries from on-chain storage. This is a storage double map.
    const attributesResult = await this.#api.query.palletDid.attributeOf.entries(parsed.id)
    attributesResult.map(([key, attr]) => {
      // console.log('key:', key.args.map(k => k.toHuman()))
      // console.log('attr:', attr.toHuman())

      // skip entries out of validity.
      if (attr.validity.toHex() <= nowBlockNumber.toHex()) {
        return
      }

      // In this DDO build, only attributes of public key or service enpoint will
      // be considered. These are classified by their keys which comply with format
      // as below:
      // 
      // did/svc/[ServiceName]
      // did/pub/<key algorithm>/<key purpose>/<encoding>
      //
      // In more detail:
      //
      // did/pub/(Secp256k1|RSA|Ed25519|X25519)/(veriKey|sigAuth|enc)/(hex|base64|base58)
      //
      // This is refered to implementation of ethr-did-resolver. Due to limitation of
      // human resouce and demonstration purpose only, this just implements according to:
      //
      // did/pub/(Secp256k1|Ed25519|X25519)/(veriKey|sigAuth|enc)/(hex|base64|base58) (:D)
      //
      const attrName = String.fromCharCode(...attr.name)
      const match = attrName.match(/^did\/(pub|svc)\/(\w+)(\/(\w+))?(\/(\w+))?$/)
      if (!match) {
        return
      }

      if (match[1] === 'svc') {
        // Short validition
        const serviceName = match[2]
        if (!serviceName || attr.value.isEmpty) {
          return
        }
        // Everything is okie
        temp.serviceCount++
        ddo.service.push({
          id: `${did}#service-${temp.serviceCount}`,
          type: serviceName,
          serviceEndpoint: String.fromCharCode(...attr.value)
        })

      } else if (match[1] === 'pub') {
        // Short validation
        const algorithm = match[2]
        const purpose = match[4]
        const keyType = match[6]
        if (!['Secp256k1', 'Ed25519', 'X25519'].find(v => algorithm === v) ||
          !['veriKey', 'sigAuth', 'enc'].find(v => purpose === v) ||
          !['hex', 'base58'].find(v => keyType === v) ||
          attr.value.isEmpty) {
          return
        }
        // console.log(algorithm, purpose, keyType)
        // console.log("Hex:", attr.value.toHex())

        // Everything seems to be okie
        const id = `${did}#delegate-${++temp.delegateCount}`
        if (purpose === 'veriKey') {
          // Do nothing.
        } else if (purpose === 'sigAuth') {
          ddo.authentication.push(id)
        } else if (purpose === 'enc') {
          ddo.keyAgreement.push(id)
        } else {
          throw "Something went wrong"
        }

        let veriItem = {
          id,
          type: null,
          controler: did,
        }
        switch (algorithm) {
          case 'Secp256k1':
            veriItem.type = VeriMethodTypes.EcdsaSecp256k1RecoveryMethod2020.name
            updateDDOContext(ddo, VeriMethodTypes.EcdsaSecp256k1RecoveryMethod2020['@context'])
            break
          case 'Ed25519':
            veriItem.type = VeriMethodTypes.Ed25519VerificationKey2018.name
            updateDDOContext(ddo, VeriMethodTypes.Ed25519VerificationKey2018['@context'])
            break
          case 'X25519':
            veriItem.type = VeriMethodTypes.X25519KeyAgreementKey2019.name
            updateDDOContext(ddo, VeriMethodTypes.X25519KeyAgreementKey2019['@context'])
            break
          default:
            throw "Something went wrong"
        }

        switch (keyType) {
          case 'hex':
            veriItem['publicKeyHex'] = attr.value.toHex()
            break
          case 'base64':
            veriItem['publicKeyBase64'] = String.fromCharCode(...attr.value)
          case 'base58':
            // due to a pratical problem that a storage value can be 
            // a hex of AccountId or a hex string of Base58
            veriItem['publicKeyBase58'] = isPolkadotAddress(attr.value)
              ? encodeAddress(attr.value)
              : String.fromCharCode(...attr.value)
            break
          default:
            throw "Something went wrong"
        }

        ddo.verificationMethod.push(veriItem)
      }
    })
  }

  async build() {
    await this.#init()
    return { substrate: this.resolve.bind(this) }
  }
}

const getResolver = async (option) => {
  const intance = new SubstrateDidResolver(option)
  return await intance.build()
}


module.exports = { getResolver }
