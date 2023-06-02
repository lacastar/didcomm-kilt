// Utilities
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { inject } from 'vue'
import { computed } from 'vue'

import { mnemonicGenerate, mnemonicToMiniSecret } from '@polkadot/util-crypto'
import { ed25519PairFromSeed } from '@polkadot/util-crypto'
import { base58Encode, base58Decode } from '@polkadot/util-crypto'

import { X25519KeyAgreementKey2019 } from '@digitalbazaar/x25519-key-agreement-key-2019'

import Keyring from '@polkadot/keyring'

import { Message } from "didcomm"

import { useGunStore } from './gun'

//import * as jose from 'jose'

class DIDResolver {
  constructor(knownDids, kilt) {
    this.knownDids = knownDids
    this.kilt = kilt
  }

  async resolve(did) {
    //return this.kilt.Did.exportToDidDocument(this.knownDids[did], "application/json")
    //console.log("resolving local: " + did)
    if(this.knownDids[did]) return this.knownDids[did]
    //console.log("resolving with kilt: " + did)
    const resolved = await kilt.Did.resolve(did)
    //console.log("resolved with kilt: " + JSON.stringify(resolved))
    if(resolved){
      const document = this.kilt.Did.exportToDidDocument(resolved.document, "application/json")
      //console.log("resolved: " + document)
      //patching for didcomm
      document.service = []
      return document
    }
  }
}

class SecretsResolver {
  constructor(knownSecrets) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId) {
    //console.log(`secretId: ${JSON.stringify(secretId)} found: ${!!this.knownSecrets[secretId]}`)
    return this.knownSecrets[secretId]
  }

  async find_secrets(secretIds) {
    return secretIds.filter((id) => {
      //console.log(`secretIds: ${JSON.stringify(id)} found: ${!!this.knownSecrets[id]}`)
      return this.knownSecrets[id]
    }
    );
  }
}


export const useKiltStore = defineStore('kilt', () => {
  const api = inject('kiltapi')
  const kilt = inject('kilt')

  const gun = useGunStore()

  const accountMnemonic = ref("")
  const account = ref(null)

  const didMap = ref({})
  const activeDid = ref(null)

  const peerDidMap = ref({})
  const inviteDidMap = ref({})
  const chatDidMap = ref({})

  const chatMap = ref({})
  const messageIds = ref({})

  //const doubleCount = computed(() => count.value * 2)

  async function generateAccount() {
    accountMnemonic.value = mnemonicGenerate()
    //console.log("set " + accountMnemonic.value)

    //const keyring = new kilt.Utils.Keyring({
    //  ss58Format: 38,
    //  type: 'sr25519',
    //})


    account.value = kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(accountMnemonic.value)
    )
    //account.value = keyring.addFromMnemonic(accountMnemonic.value)
    gun.saveAccount(accountMnemonic.value)
  }

  function regenerateAccount(mnemonic) {
    accountMnemonic.value = mnemonic
    account.value = kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(mnemonic)
    )
    //const keyring = new kilt.Utils.Keyring({
    //  ss58Format: 38,
    //  type: 'sr25519',
    //})
    //account.value = keyring.addFromMnemonic(accountMnemonic.value)
    //console.log("REGEN ACCOUNT: " + JSON.stringify(account.value))
  }

  async function createCompleteFullDid(
    submitterAccount,
    { authentication, encryption, attestation, delegation },
    signCallback
  ) {
    //console.log(`get api`)
    //const api = Kilt.ConfigService.get('api')

    //console.log(`get store tx`)
    const fullDidCreationTx = await kilt.Did.getStoreTx(
      {
        authentication: [authentication],
        keyAgreement: [encryption],
        assertionMethod: [attestation],
        capabilityDelegation: [delegation],
        // Example service.
        service: [
          {
            id: '#my-service',
            type: ['service-type'],
            serviceEndpoint: [import.meta.env.VITE_DC_SERVICE_ENDPOINT],
          },
        ],
      },
      submitterAccount.address,
      signCallback
    )

    //console.log(`submit tx`)
    await kilt.Blockchain.signAndSubmitTx(fullDidCreationTx, submitterAccount)

    // The new information is fetched from the blockchain and returned.
    //console.log(`fetch did`)
    const fullDid = kilt.Did.getFullDidUriFromKey(authentication)
    //console.log(`query did`)
    const encodedUpdatedDidDetails = await api.call.did.query(
      kilt.Did.toChain(fullDid)
    )
    //console.log(`get document`)
    const { document } = kilt.Did.linkedInfoFromChain(encodedUpdatedDidDetails)
    if (!document) {
      throw new Error('Full DID was not successfully created.')
    }

    return { fullDidDocument: document, fullDid }

  }

  async function generateDid(name) {
    const mnemonic = mnemonicGenerate()
    //console.log(`mnemonic: ${mnemonic}`)

    const authentication = kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(mnemonic)
    )

    const encryption = kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
      mnemonicToMiniSecret(mnemonic)
    )
    //const attestation = authentication.derive('//attestation')
    //const delegation = authentication.derive('//delegation')

    console.log(`creating DID`)
    /*const { fullDidDocument, fullDid } = await createCompleteFullDid(
      account.value, { authentication, encryption, attestation, delegation },
      async ({ data }) => ({
        signature: authentication.sign(data),
        keyType: authentication.type,
      })
    )*/
    const lightDID = kilt.Did.createLightDidDocument({
      authentication: [authentication],
      keyAgreement: [encryption],
    })

    const did = {
      name,
      mnemonic,
      //fullDid,
      //fullDidDocument,
      fullDid:lightDID.uri,
      fullDidDocument:lightDID,
      authentication,
      encryption,
      //attestation,
      //delegation,
      state: "OK"
    }

    //dids.value.push(did)
    didMap.value[did.fullDid] = {
      did,
      invites: {},
      peers: []
    }
    gun.saveDid(name, mnemonic)

    if (!activeDid.value) activeDid.value = did
  }

  async function regenerateDid(name, mnemonic) {
    //console.log(`mnemonic:[${mnemonic}]`)
    const authentication = kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(mnemonic)
    )
    //console.log(`auth:[${authentication}]`)
    const encryption = kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
      mnemonicToMiniSecret(mnemonic)
    )
    //console.log(`enc:[${authentication}]`)
    //const attestation = authentication.derive('//attestation')
    //const delegation = authentication.derive('//delegation')

    //const fullDid = kilt.Did.getFullDidUriFromKey(authentication)

    //const { metadata, fullDidDocument } = await kilt.Did.resolve(fullDid)
    const lightDID = kilt.Did.createLightDidDocument({
      authentication: [authentication],
      keyAgreement: [encryption],
    })
    let state = "ok"
    //if (metadata.deactivated) {
    //  state = "deleted"
    //} else if (fullDidDocument === undefined) {
    //  state = "NA"
    //}

    const did = {
      name,
      mnemonic,
      //fullDid,
      //fullDidDocument,
      fullDid:lightDID.uri,
      fullDidDocument:lightDID,
      authentication,
      encryption,
      //attestation,
      //delegation,
      state
    }

    //dids.value.push(did)
    didMap.value[did.fullDid] = {
      did,
      invites: {},
      peers: []
    }
    //console.log(`didMap: ${JSON.stringify(didMap.value)}`)

    if (activeDid.value == null) activeDid.value = did

    return did.fullDid
  }

  function setActiveDid(did) {
    activeDid.value = did
  }

  function createCompleteLightDid(authentication, encryption, room) {
    const service = [
      {
        id: '#dcom',
        type: ['DComInvitationV1'],
        //serviceEndpoint: [`http://localhost/comm/${room}`],
        serviceEndpoint: [`${import.meta.env.VITE_DC_SERVICE_ENDPOINT}comm/${room}`],
      },
    ]

    const lightDID = kilt.Did.createLightDidDocument({
      authentication: [authentication],
      keyAgreement: [encryption],
      service,
    })
    //console.log(lightDID.uri)

    return lightDID
  }


  async function createInviteLink(room) {
    //const authentication = activeDid.value.authentication.derive(`//invite`) //ed25519
    //const encryption = activeDid.value.authentication.derive(`//invite/bob`) //->x25519

    const did = await createPeerDid(room, null, activeDid.value, null)

    /*
    const authentication = kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(activeDid.value.mnemonic, room)
    )
    const encryption = kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
      mnemonicToMiniSecret(activeDid.value.mnemonic, room)
    )

    const oobPeerDID = createCompleteLightDid(authentication, encryption, room)
    */
    const oobPeerDID = did.did

    const oob_message = {
      "type": "https://didcomm.org/out-of-band/2.0/invitation",
      "id": "invite_" + self.crypto.randomUUID(),
      "from": oobPeerDID.uri,
      "body": {
        "goal_code": "connect",
        "goal": "Establishconnection",
        "accept": [
          "didcomm/v2",
          "didcomm/aip2;env=rfc587"
        ],
      }
    }

    const inviteurl = `${import.meta.env.VITE_DC_SERVICE_ENDPOINT}comm?_oob=` + btoa(JSON.stringify(oob_message).replace(/\s/g, ''))

    /*const did = {
      did: oobPeerDID,
      authentication,
      encryption,
      state: "ok",
    }*/
    //inviteDidMap.value[room] = did
    peerDidMap.value[room] = did
    //didMap.value[activeDid.value.fullDid].invites.push(did)

    return { oobPeerDID, inviteurl }

  }
  async function regenerateInviteDid(room, parentDid, diduri, name, peerdiduri) {
    //console.log(`didMap: ${JSON.stringify(didMap.value)}`)
    const parent = didMap.value[parentDid].did

    /*const authentication = kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(parent.mnemonic, room)
    )
    const encryption = kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
      mnemonicToMiniSecret(parent.mnemonic, room)
    )*/
    //const keyring = new Keyring({type:"ed25519"})
    const authentication = ed25519PairFromSeed(mnemonicToMiniSecret(parent.mnemonic, room + (peerdiduri?"":"pre")), true)

    //console.log(`AUTH: ${JSON.stringify(authentication)}`)
    const enc = await X25519KeyAgreementKey2019.fromEd25519VerificationKey2018({
      keyPair: {
        privateKeyBase58: base58Encode(authentication.secretKey),
        publicKeyBase58: base58Encode(authentication.publicKey),
      }
    })
    const encryption = {
      "type": "x25519",
      publicKey: base58Decode(enc.publicKeyBase58),
      privateKey: base58Decode(enc.privateKeyBase58)
    }


    const { metadata, document } = await kilt.Did.resolve(diduri)
    let peer = null
    if (peerdiduri) {
      const { metadata, document } = await kilt.Did.resolve(peerdiduri)
      peer = document
    }
    const peerDidExp = kilt.Did.exportToDidDocument(document, "application/json")
    //console.log(`meta: ${JSON.stringify(metadata)}`)
    //console.log(`fulldoc: ${JSON.stringify(document)}`)
    let state = "ok"
    if (metadata.deactivated) {
      state = "deleted"
    } else if (document === undefined) {
      state = "NA"
    }

    const did = {
      name,
      did: document,
      peer,
      authentication,
      encryption,
      jwkauth: {
        "id": peerDidExp.authentication[0],
        "controller": peerDidExp.id,
        "type": "Ed25519VerificationKey2018",
        privateKeyBase58: base58Encode(authentication.secretKey),
        publicKeyBase58: base58Encode(authentication.publicKey),
      },
      jwkenc: {
        "id": peerDidExp.keyAgreement[0],
        "controller": peerDidExp.id,
        "type": "X25519KeyAgreementKey2019",
        "publicKeyBase58": enc.publicKeyBase58,
        "privateKeyBase58": enc.privateKeyBase58,
      },
      parentDid,
      state,
      room,
    }
    //inviteDidMap.value[room] = did
    peerDidMap.value[room] = did

    didMap.value[parentDid].invites[peerdiduri]=did
    //console.log("inserted: " + room + " as " + JSON.stringify(did))
  }


  function getDids() {
    return Object.values(didMap.value)
  }

  const inviteList = computed(() => Object.values(didMap.value[activeDid.value.fullDid].invites))
  const peerList = computed(() => Object.entries(chatDidMap.value))
  const names = computed(() => {
    const ret = {}
    Object.values(didMap.value[activeDid.value.fullDid].invites).forEach(item => ret[item.name]=true)
    Object.entries(chatDidMap.value).forEach((key,value) => ret[value.named]=true)
    return ret
  })
  

  function verifyOOB(oob) {
    const inv = JSON.parse(atob(oob))
    //console.log(`RECEIVED OOB: ${JSON.stringify(inv)}`)
    if (inv.type != 'https://didcomm.org/out-of-band/2.0/invitation'
      || inv.body.goal_code != 'connect'
      || inv.body.goal != 'Establishconnection'
    ) {
      console.log("unsupported invite")
      return null
    }
    return inv
  }

  async function createPeerDid(room, name, parentDid, peer) {
    const keyring = new Keyring({ type: "ed25519" })
    const authentication = ed25519PairFromSeed(mnemonicToMiniSecret(parentDid.mnemonic, room + (peer?"":"pre")), true)

    //console.log(`AUTH: ${JSON.stringify(authentication)}`)
    const enc = await X25519KeyAgreementKey2019.fromEd25519VerificationKey2018({
      keyPair: {
        privateKeyBase58: base58Encode(authentication.secretKey),
        publicKeyBase58: base58Encode(authentication.publicKey),
      }
    })
    const encryption = {
      "type": "x25519",
      publicKey: base58Decode(enc.publicKeyBase58),
      privateKey: base58Decode(enc.privateKeyBase58)
    }
    //console.log(`ENC: ${JSON.stringify(enc)}`)

    const peerDid = createCompleteLightDid(keyring.addFromPair(authentication), encryption, room)
    let state = "ok"
    /*if (metadata.deactivated) {
      state = "deleted"
    } else if (document === undefined) {
      state = "NA"
    }*/

    const peerDidExp = kilt.Did.exportToDidDocument(peerDid, "application/json")

    return {
      name,
      room,
      did: peerDid,
      peer,
      authentication,
      encryption,
      jwkauth: {
        "id": peerDidExp.authentication[0],
        "controller": peerDid.uri,
        "type": "Ed25519VerificationKey2018",
        privateKeyBase58: base58Encode(authentication.secretKey),
        publicKeyBase58: base58Encode(authentication.publicKey),
      },
      jwkenc: {
        "id": peerDidExp.keyAgreement[0],
        "controller": peerDid.uri,
        "type": "X25519KeyAgreementKey2019",
        "publicKeyBase58": enc.publicKeyBase58,
        "privateKeyBase58": enc.privateKeyBase58,
      },
      parentDid,
      state,
    }

  }

  function getRoomFromDocument(document){
    const endpoint = document.service[0].serviceEndpoint[0]
    return endpoint.substring(endpoint.lastIndexOf("/") + 1, endpoint.length)
  }



  async function connectPeer(oob, name) {
    const { metadata, document } = await kilt.Did.resolve(oob.from)

    //const endpoint = document.service[0].serviceEndpoint[0]
    //const room = endpoint.substring(endpoint.lastIndexOf("/") + 1, endpoint.length)
    const room = getRoomFromDocument(document)

    /*
    const keyring = new Keyring({type:"ed25519"})
    const authentication = ed25519PairFromSeed(mnemonicToMiniSecret(activeDid.value.mnemonic, room), true)
    
    //console.log(`AUTH: ${JSON.stringify(authentication)}`)
    const enc = await X25519KeyAgreementKey2019.fromEd25519VerificationKey2018({keyPair : {
      privateKeyBase58: base58Encode(authentication.secretKey),
      publicKeyBase58: base58Encode(authentication.publicKey), 
    }})
    const encryption = {
      "type":"x25519",
      publicKey: base58Decode(enc.publicKeyBase58),
      privateKey: base58Decode(enc.privateKeyBase58)
    }
    //console.log(`ENC: ${JSON.stringify(enc)}`)

    const peerDid = createCompleteLightDid(keyring.addFromPair(authentication), encryption, room)
    let state = "ok"
    if (metadata.deactivated) {
      state = "deleted"
    } else if (document === undefined) {
      state = "NA"
    }

    const peerDidExp = kilt.Did.exportToDidDocument(peerDid, "application/json")
    

    const did = {
      name,
      did: peerDid,
      peer: document,
      authentication,
      encryption,
      jwkauth: {
        "id":  peerDidExp.authentication[0],
        "controller": peerDid.uri,
        "type": "Ed25519VerificationKey2018",
        privateKeyBase58: base58Encode(authentication.secretKey),
        publicKeyBase58: base58Encode(authentication.publicKey), 
      },
      jwkenc: {
        "id": peerDidExp.keyAgreement[0],
        "controller": peerDid.uri, 
        "type": "X25519KeyAgreementKey2019",
        "publicKeyBase58": enc.publicKeyBase58,
        "privateKeyBase58": enc.privateKeyBase58,
      },
      state
    }
    */
    const did = await createPeerDid(room, name, activeDid.value, document)
    peerDidMap.value[room] = did
    didMap.value[activeDid.value.fullDid].peers.push(did)

    //return {peerDid, room}
    return { did, room }
  }



  async function generateInviteAcceptMessage(room) {

    const msg = new Message({
      id: "invite_accept_" + self.crypto.randomUUID(),
      typ: "application/didcomm-plain+json",
      type: "http://example.com/protocols/invite/1.0/accept",
      from: peerDidMap.value[room].did.uri,
      to: [peerDidMap.value[room].peer.uri],
      created_time: Math.floor(Date.now() / 1000),
      expires_time: Math.floor(Date.now() / 1000) + 60 * 60,
      body: { accept: "yes" },
    })



    const didResolver = new DIDResolver({
      [peerDidMap.value[room].did.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[room].did, "application/json"),
      [peerDidMap.value[room].peer.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[room].peer, "application/json"),
    }, kilt)


    const secretsResolver = new SecretsResolver({
      [peerDidMap.value[room].jwkauth.id]: peerDidMap.value[room].jwkauth,
      [peerDidMap.value[room].jwkenc.id]: peerDidMap.value[room].jwkenc,
    })

    //TODO find out the incompatibility so no patching should be done to service:
    const t = await didResolver.resolve(peerDidMap.value[room].peer.uri)
    t.service = []
    const tt = await didResolver.resolve(peerDidMap.value[room].did.uri)
    tt.service = []


    const [encryptedMsg, encryptMetadata] = await msg.pack_encrypted(
      peerDidMap.value[room].peer.uri, //to 
      peerDidMap.value[room].did.uri,//from 
      null, //signer 
      didResolver,
      secretsResolver,
      {
        forward: false, // TODO: should be true by default
      }
    )

    //console.log(`meta: ${JSON.stringify(encryptMetadata)}`)
    //console.log(`msg: ${encryptedMsg}`)

    return { encryptedMsg, encryptMetadata }
  }

  async function rotateDidMessage(room, receivedMsg) {
    const didResolver = new DIDResolver({
      [peerDidMap.value[room].did.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[room].did, "application/json"),
  //    [peerDidMap.value[room].peer.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[room].peer, "application/json"),
    }, kilt)


    const secretsResolver = new SecretsResolver({
      [peerDidMap.value[room].jwkauth.id]: peerDidMap.value[room].jwkauth,
      [peerDidMap.value[room].jwkenc.id]: peerDidMap.value[room].jwkenc,
    })

    //TODO find out the incompatibility so no patching should be done to service:
    //const peerdid = await didResolver.resolve(peerDidMap.value[room].peer.uri)
    //peerdid.service = []
    const olddid = await didResolver.resolve(peerDidMap.value[room].did.uri)
    olddid.service = []

    const [unpackedMsg, unpackedMetadata] = await Message.unpack(
      receivedMsg.encryptedMsg,
      didResolver,
      secretsResolver,
      {}
    )

    //console.log(`REC: meta: ${JSON.stringify(unpackedMetadata)} \n msg: ${JSON.stringify(unpackedMsg)}`)
    //const newRoom = self.crypto.randomUUID()
    //const name = peerDidMap.value[room].name
    const peer = (await kilt.Did.resolve(unpackedMetadata.encrypted_from_kid)).document //peerDidMap.value[room].peer
    const parentDid = peerDidMap.value[room].parentDid

    peerDidMap.value[room].peer = peer
    const newdid = await createPeerDid(room, peerDidMap.value[room].name, activeDid.value, peer)
    peerDidMap.value[room] = newdid
    didMap.value[parentDid].peers.push(newdid)

    //const newdid = await createPeerDid(newRoom, name, activeDid.value, peer, ) //TODO multi did support, lookup parentdid instead of active did!!!!
    //peerDidMap.value[newRoom] = newdid
    //newdid.oldroom = room
    //didMap.value[parentDid].peers.push(newdid)

    const alg = "EdDSA"
    //const usages = ["sign"]
    //const jwk = await window.crypto.subtle.importKey("jwk", peerDidMap.value[room].jwkauth, {name: "ECDSA" },
    //  false, //whether the key is extractable (i.e. can be used in exportKey),
    //  usages
    //)
    //const privateKey = await jose.importJWK(peerDidMap.value[room].jwkauth)
    /*const from_prior  = await new jose.SignJWT({
        "sub": newdid.did.uri,
        "iss": olddid.id,
        "iat": Math.floor(Date.now() / 1000) 
      }).setProtectedHeader({ 
        alg,
        "typ": "JWT",
        "crv": "ED25519",
        "kid": olddid.authentication[0] 
      })
      .setIssuedAt()
      .setIssuer(olddid.id)
      .setAudience(peer.uri)
      .setExpirationTime('1h')
      .sign(privateKey)
    */
    const from_prior  = "TODO"
    //console.log(`from_prior ${from_prior}`)
    const rotate_did_message = new Message({
      id : "rotate_did_" + self.crypto.randomUUID(),
      typ: "application/didcomm-plain+json",
      type : "dchat-protocol/1.0",
      from : peerDidMap.value[room].did.uri,
      to : [peer.uri],
      created_time: Math.floor(Date.now() / 1000),
      expires_time: Math.floor(Date.now() / 1000) + 60 * 60,
      //from_prior : from_prior,
      body : {msg: "I'm rotating my peer DID"},
  })
    console.log(`rotate_did_message ${rotate_did_message}`)
    
    //const rdidResolver = new DIDResolver({
    //  [peerDidMap.value[newRoom].did.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[newRoom].did, "application/json"),
    //  [peerDidMap.value[newRoom].peer.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[newRoom].peer, "application/json"),
    //}, kilt)

    //const _did = await rdidResolver.resolve(peerDidMap.value[newRoom].did.uri)
    //_did.service = []
    //const _peer = await rdidResolver.resolve(peerDidMap.value[newRoom].peer.uri)
    //_peer.service = []


    //const rsecretsResolver = new SecretsResolver({
    //  [peerDidMap.value[newRoom].jwkauth.id]: peerDidMap.value[newRoom].jwkauth,
    //  [peerDidMap.value[newRoom].jwkenc.id]: peerDidMap.value[newRoom].jwkenc,
    //})
    const rdidResolver = new DIDResolver({
        [peerDidMap.value[room].did.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[room].did, "application/json"),
        [peerDidMap.value[room].peer.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[room].peer, "application/json"),
    }, kilt)
  
    const _did = await rdidResolver.resolve(peerDidMap.value[room].did.uri)
    _did.service = []
    const _peer = await rdidResolver.resolve(peerDidMap.value[room].peer.uri)
    _peer.service = []
  
  
      //const rsecretsResolver = new SecretsResolver({
      //  [peerDidMap.value[newRoom].jwkauth.id]: peerDidMap.value[newRoom].jwkauth,
      //  [peerDidMap.value[newRoom].jwkenc.id]: peerDidMap.value[newRoom].jwkenc,
      //})

    const rsecretsResolver = new SecretsResolver({
        [peerDidMap.value[room].jwkauth.id]: peerDidMap.value[room].jwkauth,
        [peerDidMap.value[room].jwkenc.id]: peerDidMap.value[room].jwkenc,
    })

    //console.log(`packing ${rotate_did_message}`)
    
    const [encryptedMsg, encryptedMetadata] = await rotate_did_message.pack_encrypted(
      //peerDidMap.value[newRoom].peer.uri, //to 
      //peerDidMap.value[newRoom].did.uri,//from 
      peerDidMap.value[room].peer.uri, //to 
      peerDidMap.value[room].did.uri,//from 
      null, //signer 
      rdidResolver,
      rsecretsResolver,
      {
        forward: false, // TODO: should be true by default
      }
    )

    //console.log(`meta: ${JSON.stringify(encryptedMetadata)}`)
    //console.log(`msg: ${encryptedMsg}`)

    return { encryptedMsg, encryptedMetadata, newdid }
  }

  async function receivedDidRotate(room, receivedMsg) {
    const didResolver = new DIDResolver({
      [peerDidMap.value[room].did.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[room].did, "application/json"),
      [peerDidMap.value[room].peer.uri]: kilt.Did.exportToDidDocument(peerDidMap.value[room].peer, "application/json"),
    }, kilt)


    const secretsResolver = new SecretsResolver({
      [peerDidMap.value[room].jwkauth.id]: peerDidMap.value[room].jwkauth,
      [peerDidMap.value[room].jwkenc.id]: peerDidMap.value[room].jwkenc,
    })

    const peerdid = await didResolver.resolve(peerDidMap.value[room].peer.uri)
    peerdid.service = []
    const olddid = await didResolver.resolve(peerDidMap.value[room].did.uri)
    olddid.service = []

    //console.log("unpacking")
    const [unpackedMsg, unpackedMetadata] = await Message.unpack(
      receivedMsg,
      didResolver,
      secretsResolver,
      {}
    )

    //console.log(`DID Rotate: msg: ${JSON.stringify(unpackedMsg.as_value())} \n ${JSON.stringify(unpackedMetadata)}`)
    const rotatedDid = await kilt.Did.resolve(unpackedMsg.as_value().from)

    const peer = rotatedDid.document //peerDidMap.value[room].peer
    peerDidMap.value[room].peer = peer
      
    return peerDidMap.value[room]
    

  }

  async function regenerateChatDid(room, parentDid, diduri, named, peerdiduri){
    const parent = didMap.value[parentDid].did

    /*const authentication = kilt.Utils.Crypto.makeKeypairFromSeed(
      mnemonicToMiniSecret(parent.mnemonic, room)
    )
    const encryption = kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(
      mnemonicToMiniSecret(parent.mnemonic, room)
    )*/
    //const keyring = new Keyring({type:"ed25519"})
    const authentication = ed25519PairFromSeed(mnemonicToMiniSecret(parent.mnemonic, room + (peerdiduri?"":"pre")), true)

    //console.log(`AUTH: ${JSON.stringify(authentication)}`)
    const enc = await X25519KeyAgreementKey2019.fromEd25519VerificationKey2018({
      keyPair: {
        privateKeyBase58: base58Encode(authentication.secretKey),
        publicKeyBase58: base58Encode(authentication.publicKey),
      }
    })
    const encryption = {
      "type": "x25519",
      publicKey: base58Decode(enc.publicKeyBase58),
      privateKey: base58Decode(enc.privateKeyBase58)
    }


    const { metadata, document } = await kilt.Did.resolve(diduri)
    let peer = null
    if (peerdiduri) {
      const { metadata, document } = await kilt.Did.resolve(peerdiduri)
      peer = document
    }
    const peerDidExp = kilt.Did.exportToDidDocument(document, "application/json")
    //console.log(`meta: ${JSON.stringify(metadata)}`)
    //console.log(`fulldoc: ${JSON.stringify(document)}`)
    let state = "ok"
    if (metadata.deactivated) {
      state = "deleted"
    } else if (document === undefined) {
      state = "NA"
    }

    const did = {
      named,
      did: document,
      peer,
      authentication,
      encryption,
      jwkauth: {
        "id": peerDidExp.authentication[0],
        "controller": peerDidExp.id,
        "type": "Ed25519VerificationKey2018",
        privateKeyBase58: base58Encode(authentication.secretKey),
        publicKeyBase58: base58Encode(authentication.publicKey),
      },
      jwkenc: {
        "id": peerDidExp.keyAgreement[0],
        "controller": peerDidExp.id,
        "type": "X25519KeyAgreementKey2019",
        "publicKeyBase58": enc.publicKeyBase58,
        "privateKeyBase58": enc.privateKeyBase58,
      },
      parentDid,
      state,
    }
    if(!chatDidMap.value[room]) chatDidMap.value[room] = did
    //chatMap.value[room]=[]
    if(!chatMap.value[room]) chatMap.value[room]=[]
  }
  async function onMsg(room, msg){
    //console.log("INCOMING: " + room + " " + msg)
    // decrypt
    const message = JSON.parse(msg)
    if(message["recipients"][0].header.kid!=chatDidMap.value[room].jwkenc.id) return
    const didResolver = new DIDResolver({
      [chatDidMap.value[room].did.uri]: kilt.Did.exportToDidDocument(chatDidMap.value[room].did, "application/json"),
      [chatDidMap.value[room].peer.uri]: kilt.Did.exportToDidDocument(chatDidMap.value[room].peer, "application/json"),
    }, kilt)


    const secretsResolver = new SecretsResolver({
      [chatDidMap.value[room].jwkauth.id]: chatDidMap.value[room].jwkauth,
      [chatDidMap.value[room].jwkenc.id]: chatDidMap.value[room].jwkenc,
    })

    const peerdid = await didResolver.resolve(chatDidMap.value[room].peer.uri)
    peerdid.service = []
    const olddid = await didResolver.resolve(chatDidMap.value[room].did.uri)
    olddid.service = []

    //console.log("unpacking")
    const [unpackedMsg, unpackedMetadata] = await Message.unpack(
      msg,
      didResolver,
      secretsResolver,
      {}
    )

    //console.log(`DID Rotate: msg: ${JSON.stringify(unpackedMsg.as_value())} \n ${JSON.stringify(unpackedMetadata)}`)
    const decryptedMessage = unpackedMsg.as_value()
    // add to chatMap
    if(messageIds.value[decryptedMessage.id]) return
    messageIds.value[decryptedMessage.id] = true
    decryptedMessage.self = decryptedMessage.body.meta == "self"
    if (decryptedMessage.self){
      decryptedMessage.to = chatDidMap.value[room].peer.uri
    }
    
    //chatMap.value[room].push({decryptedMessage,unpackedMetadata} )
    console.log("pushed: " + room + " " + decryptedMessage.id)
    if(chatMap.value[room].length==0){
      chatMap.value[room].push({decryptedMessage,unpackedMetadata} )
    }else{
      for(let i=0; i < chatMap.value[room].length;i++){
        chatMap.value[room].splice(i,0,{decryptedMessage,unpackedMetadata} )
        break

        /*if(chatMap.value[room][i].created_time < decryptedMessage.created_time){
          let temp = chatMap.value[room][i]
          chatMap.value[room][i] = {decryptedMessage,unpackedMetadata}
          i++
          while(i < chatMap.value[room].length){
            let t = chatMap.value[room][i]
            chatMap.value[room][i] = temp
            temp = t
            i++ 
          }
          chatMap.value[room].push(temp)
          break
        }*/
      }
    }
    
  }
  const selectedChatroom = ref(null)
  
  function selectChatRoom(room){
    console.log("selectChatForRoom " + room)
    
    selectedChatroom.value=room
  }

  const chatForRoom = computed(() => {
    console.log("chatForRoom")
    if(selectedChatroom.value==null || chatMap.value[selectedChatroom.value]==null){
      console.log("empty room")
      return []
    } 
    console.log("return elements: " + chatMap.value[selectedChatroom.value].length)
    return chatMap.value[selectedChatroom.value] 
  })

  async function generateMsg(room, msg){
    // generate message
    const id = "basic_" + self.crypto.randomUUID()
    const message = new Message({
      id,
      typ: "application/didcomm-plain+json",
      type: "https://didcomm.org/basicmessage/2.0/message",
      from: chatDidMap.value[room].did.uri,
      to: [chatDidMap.value[room].peer.uri],
      created_time: Math.floor(Date.now() / 1000),
      expires_time: Math.floor(Date.now() / 1000) + 60 * 60,
      body: { content: msg },
    })

    const message_self = new Message({
      id,
      typ: "application/didcomm-plain+json",
      type: "https://didcomm.org/basicmessage/2.0/message",
      from: chatDidMap.value[room].did.uri,
      to: [chatDidMap.value[room].did.uri],
      created_time: Math.floor(Date.now() / 1000),
      expires_time: Math.floor(Date.now() / 1000) + 60 * 60,
      body: { content: msg , meta: "self"},
    })


    const didResolver = new DIDResolver({
      [chatDidMap.value[room].did.uri]: kilt.Did.exportToDidDocument(chatDidMap.value[room].did, "application/json"),
      [chatDidMap.value[room].peer.uri]: kilt.Did.exportToDidDocument(chatDidMap.value[room].peer, "application/json"),
    }, kilt)


    const secretsResolver = new SecretsResolver({
      [chatDidMap.value[room].jwkauth.id]: chatDidMap.value[room].jwkauth,
      [chatDidMap.value[room].jwkenc.id]: chatDidMap.value[room].jwkenc,
    })

    //TODO find out the incompatibility so no patching should be done to service:
    const t = await didResolver.resolve(chatDidMap.value[room].peer.uri)
    t.service = []
    const tt = await didResolver.resolve(chatDidMap.value[room].did.uri)
    tt.service = []


    const [encryptedMsg, encryptMetadata] = await message.pack_encrypted(
      chatDidMap.value[room].peer.uri, //to 
      chatDidMap.value[room].did.uri,//from 
      null, //signer 
      didResolver,
      secretsResolver,
      {
        forward: false, // TODO: should be true by default
      }
    )
    const [encryptedMsgSelf, encryptMetadataSelf] = await message_self.pack_encrypted(
      chatDidMap.value[room].did.uri, //to 
      chatDidMap.value[room].did.uri,//from 
      null, //signer 
      didResolver,
      secretsResolver,
      {
        forward: false, // TODO: should be true by default
      }
    )

    return [encryptedMsg, encryptMetadata, encryptedMsgSelf]
  }

  return {
    generateAccount,
    account,
    accountMnemonic,
    regenerateAccount,
    didMap,
    generateDid,
    regenerateDid,
    setActiveDid,
    activeDid,
    createInviteLink,
    getDids,
    regenerateInviteDid,
    inviteList,
    verifyOOB,
    connectPeer,
    generateInviteAcceptMessage,
    rotateDidMessage,
    receivedDidRotate,
    regenerateChatDid,
    peerList,
    chatMap,
    chatForRoom,
    selectChatRoom,
    onMsg,
    generateMsg,
    names,
  }
})