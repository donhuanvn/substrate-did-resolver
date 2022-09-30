const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const { hexToU8a, isHex } = require('@polkadot/util')

const isPolkadotAddress = (address) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))

    return true
  } catch (error) {
    return false
  }
}

const updateDDOContext = (ddo, context) => {
  if (ddo['@context'] === undefined) {
    ddo['@context'] = [context]
    return
  }
  if (!ddo['@context'].find(ctx => ctx === context)) {
    ddo['@context'].push(context)
    return
  }
}

const Errors = {
  notFound: 'notFound',
  invalidDid: 'invalidDid',
  unknownNetwork: 'unknownNetwork'
}

const VerificationMethodTypes = {
  Ed25519VerificationKey2018: {
    '@context': 'https://w3id.org/security/suites/ed25519-2018/v1',
    'name': 'Ed25519VerificationKey2018'
  },
  EcdsaSecp256k1RecoveryMethod2020: {
    '@context': 'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
    'name': 'EcdsaSecp256k1RecoveryMethod2020'
  },
  X25519KeyAgreementKey2019: {
    '@context': 'https://w3id.org/security/suites/x25519-2019/v1',
    'name': 'X25519KeyAgreementKey2019'
  }
}

module.exports = {
  isPolkadotAddress,
  updateDDOContext,
  Errors,
  VerificationMethodTypes
}
