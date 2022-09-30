# Substrate DID Resolver
(This implementation is strongly referred to the [ethr-did-resolver](https://github.com/decentralized-identity/ethr-did-resolver.git)).

This library is intended to use ethereum addresses or secp256k1 publicKeys as fully self-managed
[Decentralized Identifiers](https://w3c.github.io/did-core/#identifier) and wrap them in a
[DID Document](https://w3c.github.io/did-core/#did-document-properties)

It supports the proposed [Decentralized Identifiers](https://w3c.github.io/did-core/#identifier) spec from the
[W3C Credentials Community Group](https://w3c-ccg.github.io).

It requires the `did-resolver` library, which is the primary interface for resolving DIDs.

This DID method relies on the [pallet-did](https://github.com/substrate-developer-hub/pallet-did.git).

## Setup example:
```
const { Resolver } = require('did-resolver')
const { getResolver } = require('@donhuanvn96/substrate-did-resolver')

const main = async () => {
  const providerConfig = {
    wsUrl: "ws://127.0.0.1:9944"
  }
  
  const substrateDidResolver = await getResolver(providerConfig)
  const didResolver = new Resolver(substrateDidResolver)

  const doc = await didResolver.resolve('did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
  console.log(JSON.stringify(doc, null, 4))
  
  process.exit(0)
}

main().then(() => console.log('completed!'))

```

## Output example:
```
{
    "didDocumentMetadata": {
        "deactivated": false,
        "versionMeta": {},
        "versionMetaNext": {}
    },
    "didResolutionMetadata": {
        "contentType": "application/did+ld+json"
    },
    "didDocument": {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/ed25519-2018/v1",
            "https://w3id.org/security/suites/secp256k1recovery-2020/v2",
            "https://w3id.org/security/suites/x25519-2019/v1"
        ],
        "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "verificationMethod": [
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#controller",
                "type": "Ed25519VerificationKey2018",
                "controller": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                "blockchainAccountId": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY"
            },
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-1",
                "type": "Ed25519VerificationKey2018",
                "controler": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                "blockchainAccountId": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY"
            },
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-2",
                "type": "Ed25519VerificationKey2018",
                "controler": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                "blockchainAccountId": "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY"
            },
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-3",
                "type": "EcdsaSecp256k1RecoveryMethod2020",
                "controler": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                "publicKeyBase58": "4Fwn759SGcdwkC1Pa59VFVNfhfKbFFsijuLUQenM2c9V"
            },
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-4",
                "type": "Ed25519VerificationKey2018",
                "controler": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                "publicKeyHex": "0x90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22"
            },
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-5",
                "type": "Ed25519VerificationKey2018",
                "controler": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                "publicKeyBase58": "5EAQWHMWtaUwj1VRvYx7NQo2LXr14kUgHsG3TFKSaXYcjk28"
            },
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-6",
                "type": "X25519KeyAgreementKey2019",
                "controler": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                "publicKeyHex": "0x306721211d5404bd9da88e0204360a1a9ab8b87c66c1bc2fcdd37f3c2222cc20"
            }
        ],
        "authentication": [
            "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#controller",
            "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-1",
            "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-3",
            "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-4",
            "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-5"
        ],
        "assertionMethod": [
            "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#controller"
        ],
        "service": [
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#service-1",
                "type": "loragateway",
                "serviceEndpoint": "https://lora.hcmut.io"
            },
            {
                "id": "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#service-2",
                "type": "securitycamera",
                "serviceEndpoint": "https://camera.hcmut.io"
            }
        ],
        "keyAgreement": [
            "did:substrate:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY#delegate-6"
        ]
    }
}
```
