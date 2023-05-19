<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <v-img height="300" src="@/assets/logo.svg" />

      <div class="text-body-2 font-weight-light mb-n1">6Welcome to</div>

      <h1 class="text-h2 font-weight-bold">Vuetify</h1>

      <div class="py-14" />

      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-btn
            href="https://vuetifyjs.com/components/all/"
            min-width="164"
            rel="noopener noreferrer"
            target="_blank"
            variant="text"
          >
            <v-icon
              icon="mdi-view-dashboard"
              size="large"
              start
            />

            Components
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn
            color="primary"
            href="https://vuetifyjs.com/introduction/why-vuetify/#feature-guides"
            min-width="228"
            rel="noopener noreferrer"
            size="x-large"
            target="_blank"
            variant="flat"
          >
            <v-icon
              icon="mdi-speedometer"
              size="large"
              start
            />

            Get Started
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn
            href="https://community.vuetifyjs.com/"
            min-width="164"
            rel="noopener noreferrer"
            target="_blank"
            variant="text"
          >
            <v-icon
              icon="mdi-account-group"
              size="large"
              start
            />

            Community
          </v-btn>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
  //
  import { onMounted, inject } from 'vue'
  import {joinRoom} from 'trystero/ipfs'

  import { Message } from "didcomm";
  
const Kilt = inject('kilt')

//  import Gun from "gun/gun";
//  import 'gun/sea'

class ExampleDIDResolver  {
  //knownDids : DIDDoc[];
  
  constructor(knownDids) {
    this.knownDids = knownDids;
  }

  async resolve(did){
    return this.knownDids.find((ddoc) => ddoc.id === did) || null;
  }
}

class ExampleSecretsResolver  {
  //knownSecrets: Secret[];

  constructor(knownSecrets) {
    this.knownSecrets = knownSecrets;
  }

  async get_secret(secretId){
    return this.knownSecrets.find((secret) => secret.id === secretId) || null;
  }

  async find_secrets(secretIds) {
    return secretIds.filter((id) =>
      this.knownSecrets.find((secret) => secret.id === id)
    );
  }
}


//  const gun = Gun({
//     peers:['https://gun-manhattan.herokuapp.com/gun', 'https://peer.wallie.io/gun']
//  })
  //'http://localhost:8765/gun', 
  
  const config = {appId: 'dcomm_chat'}
  let room = null
  
  

  onMounted(async () => {
 //   const user = gun.user()
 //   user.auth('user', 'prtsword2qwersdf')

 
    room = joinRoom(config, 'yoyodyne')
    const [sendMsg, getMsg] = room.makeAction('msg')
    room.onPeerJoin(peerId => {
      console.log(`${peerId} joined`)
 //     user.get("KEY2").put({ data: `setting ${peerId} joined` }, ack =>
 //         console.log("Put ack: " + JSON.stringify(ack))
 //       );
      sendMsg(`hello ${peerId}` ,peerId)
      
    })
    room.onPeerLeave(peerId => console.log(`${peerId} left`))
    
    getMsg((data, peerId) => {
      console.log(`msg ${data} from ${peerId}`)
//      user.get("KEY2")
//        .get("data")
//        .once(data => {
          // render it, but only once. No updates.
//          console.log(`getting ${JSON.stringify(data)} joined`)
//        });
    })

   /* --> index.html
    window.kilt = {}
    Object.defineProperty(window.kilt, 'meta', { 
      value: { versions: { credentials: '3.2' } }, 
      enumerable: false
    })
  */

    await Kilt.connect('wss://spiritnet.kilt.io/')
        const api = Kilt.ConfigService.get('api')

        const encodedJohnDoeDetails = await api.call.did.queryByWeb3Name('john_doe')

        // This function will throw if johnDoeOwner does not exist
        const {
          document: { uri }
        } = Kilt.Did.linkedInfoFromChain(encodedJohnDoeDetails)
        console.log(`My name is john_doe and this is my DID: "${uri}"`)

        await Kilt.disconnect()

  

  const ALICE_DID = "did:example:alice";

const ALICE_DID_DOC = {
  id: "did:example:alice",
  keyAgreement: [
    "did:example:alice#key-x25519-not-in-secrets-1",
    "did:example:alice#key-x25519-1",
    "did:example:alice#key-p256-1",
    "did:example:alice#key-p521-1",
  ],
  authentication: [
    "did:example:alice#key-1",
    "did:example:alice#key-2",
    "did:example:alice#key-3",
  ],
  verificationMethod: [
    {
      id: "did:example:alice#key-x25519-1",
      type: "JsonWebKey2020",
      controller: "did:example:alice#key-x25519-1",
      publicKeyJwk: {
        crv: "X25519",
        kty: "OKP",
        x: "avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs",
      },
    },
    {
      id: "did:example:alice#key-p256-1",
      type: "JsonWebKey2020",
      controller: "did:example:alice#key-p256-1",
      publicKeyJwk: {
        crv: "P-256",
        kty: "EC",
        x: "L0crjMN1g0Ih4sYAJ_nGoHUck2cloltUpUVQDhF2nHE",
        y: "SxYgE7CmEJYi7IDhgK5jI4ZiajO8jPRZDldVhqFpYoo",
      },
    },
    {
      id: "did:example:alice#key-p521-1",
      type: "JsonWebKey2020",
      controller: "did:example:alice#key-p521-1",
      publicKeyJwk: {
        crv: "P-521",
        kty: "EC",
        x: "AHBEVPRhAv-WHDEvxVM9S0px9WxxwHL641Pemgk9sDdxvli9VpKCBdra5gg_4kupBDhz__AlaBgKOC_15J2Byptz",
        y: "AciGcHJCD_yMikQvlmqpkBbVqqbg93mMVcgvXBYAQPP-u9AF7adybwZrNfHWCKAQwGF9ugd0Zhg7mLMEszIONFRk",
      },
    },
    {
      id: "did:example:alice#key-not-in-secrets-1",
      type: "JsonWebKey2020",
      controller: "did:example:alice#key-not-in-secrets-1",
      publicKeyJwk: {
        crv: "Ed25519",
        kty: "OKP",
        x: "G-boxFB6vOZBu-wXkm-9Lh79I8nf9Z50cILaOgKKGww",
      },
    },
    {
      id: "did:example:alice#key-1",
      type: "JsonWebKey2020",
      controller: "did:example:alice#key-1",
      publicKeyJwk: {
        crv: "Ed25519",
        kty: "OKP",
        x: "G-boxFB6vOZBu-wXkm-9Lh79I8nf9Z50cILaOgKKGww",
      },
    },
    {
      id: "did:example:alice#key-2",
      type: "JsonWebKey2020",
      controller: "did:example:alice#key-2",
      publicKeyJwk: {
        crv: "P-256",
        kty: "EC",
        x: "2syLh57B-dGpa0F8p1JrO6JU7UUSF6j7qL-vfk1eOoY",
        y: "BgsGtI7UPsObMRjdElxLOrgAO9JggNMjOcfzEPox18w",
      },
    },
    {
      id: "did:example:alice#key-3",
      type: "JsonWebKey2020",
      controller: "did:example:alice#key-3",
      publicKeyJwk: {
        crv: "secp256k1",
        kty: "EC",
        x: "aToW5EaTq5mlAf8C5ECYDSkqsJycrW-e1SQ6_GJcAOk",
        y: "JAGX94caA21WKreXwYUaOCYTBMrqaX4KWIlsQZTHWCk",
      },
    },
  ],
  service: [],
};

const ALICE_SECRETS = [
  {
    id: "did:example:alice#key-1",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "Ed25519",
      d: "pFRUKkyzx4kHdJtFSnlPA9WzqkDT1HWV0xZ5OYZd2SY",
      kty: "OKP",
      x: "G-boxFB6vOZBu-wXkm-9Lh79I8nf9Z50cILaOgKKGww",
    },
  },
  {
    id: "did:example:alice#key-2",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-256",
      d: "7TCIdt1rhThFtWcEiLnk_COEjh1ZfQhM4bW2wz-dp4A",
      kty: "EC",
      x: "2syLh57B-dGpa0F8p1JrO6JU7UUSF6j7qL-vfk1eOoY",
      y: "BgsGtI7UPsObMRjdElxLOrgAO9JggNMjOcfzEPox18w",
    },
  },
  {
    id: "did:example:alice#key-3",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "secp256k1",
      d: "N3Hm1LXA210YVGGsXw_GklMwcLu_bMgnzDese6YQIyA",
      kty: "EC",
      x: "aToW5EaTq5mlAf8C5ECYDSkqsJycrW-e1SQ6_GJcAOk",
      y: "JAGX94caA21WKreXwYUaOCYTBMrqaX4KWIlsQZTHWCk",
    },
  },
  {
    id: "did:example:alice#key-x25519-1",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "X25519",
      d: "r-jK2cO3taR8LQnJB1_ikLBTAnOtShJOsHXRUWT-aZA",
      kty: "OKP",
      x: "avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs",
    },
  },
  {
    id: "did:example:alice#key-p256-1",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-256",
      d: "sB0bYtpaXyp-h17dDpMx91N3Du1AdN4z1FUq02GbmLw",
      kty: "EC",
      x: "L0crjMN1g0Ih4sYAJ_nGoHUck2cloltUpUVQDhF2nHE",
      y: "SxYgE7CmEJYi7IDhgK5jI4ZiajO8jPRZDldVhqFpYoo",
    },
  },
  {
    id: "did:example:alice#key-p521-1",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-521",
      d: "AQCQKE7rZpxPnX9RgjXxeywrAMp1fJsyFe4cir1gWj-8t8xWaM_E2qBkTTzyjbRBu-JPXHe_auT850iYmE34SkWi",
      kty: "EC",
      x: "AHBEVPRhAv-WHDEvxVM9S0px9WxxwHL641Pemgk9sDdxvli9VpKCBdra5gg_4kupBDhz__AlaBgKOC_15J2Byptz",
      y: "AciGcHJCD_yMikQvlmqpkBbVqqbg93mMVcgvXBYAQPP-u9AF7adybwZrNfHWCKAQwGF9ugd0Zhg7mLMEszIONFRk",
    },
  },
];

const BOB_DID = "did:example:bob";

const BOB_DID_DOC = {
  id: "did:example:bob",
  keyAgreement: [
    "did:example:bob#key-x25519-1",
    "did:example:bob#key-x25519-2",
    "did:example:bob#key-x25519-3",
    "did:example:bob#key-p256-1",
    "did:example:bob#key-p256-2",
    "did:example:bob#key-p384-1",
    "did:example:bob#key-p384-2",
    "did:example:bob#key-p521-1",
    "did:example:bob#key-p521-2",
  ],
  authentication: [],
  verificationMethod: [
    {
      id: "did:example:bob#key-x25519-1",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-x25519-1",
      publicKeyJwk: {
        crv: "X25519",
        kty: "OKP",
        x: "GDTrI66K0pFfO54tlCSvfjjNapIs44dzpneBgyx0S3E",
      },
    },
    {
      id: "did:example:bob#key-x25519-2",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-x25519-2",
      publicKeyJwk: {
        crv: "X25519",
        kty: "OKP",
        x: "UT9S3F5ep16KSNBBShU2wh3qSfqYjlasZimn0mB8_VM",
      },
    },
    {
      id: "did:example:bob#key-x25519-3",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-x25519-3",
      publicKeyJwk: {
        crv: "X25519",
        kty: "OKP",
        x: "82k2BTUiywKv49fKLZa-WwDi8RBf0tB0M8bvSAUQ3yY",
      },
    },
    {
      id: "did:example:bob#key-p256-1",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-p256-1",
      publicKeyJwk: {
        crv: "P-256",
        kty: "EC",
        x: "FQVaTOksf-XsCUrt4J1L2UGvtWaDwpboVlqbKBY2AIo",
        y: "6XFB9PYo7dyC5ViJSO9uXNYkxTJWn0d_mqJ__ZYhcNY",
      },
    },
    {
      id: "did:example:bob#key-p256-2",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-p256-2",
      publicKeyJwk: {
        crv: "P-256",
        kty: "EC",
        x: "n0yBsGrwGZup9ywKhzD4KoORGicilzIUyfcXb1CSwe0",
        y: "ov0buZJ8GHzV128jmCw1CaFbajZoFFmiJDbMrceCXIw",
      },
    },
    {
      id: "did:example:bob#key-p384-1",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-p384-1",
      publicKeyJwk: {
        crv: "P-384",
        kty: "EC",
        x: "MvnE_OwKoTcJVfHyTX-DLSRhhNwlu5LNoQ5UWD9Jmgtdxp_kpjsMuTTBnxg5RF_Y",
        y: "X_3HJBcKFQEG35PZbEOBn8u9_z8V1F9V1Kv-Vh0aSzmH-y9aOuDJUE3D4Hvmi5l7",
      },
    },
    {
      id: "did:example:bob#key-p384-2",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-p384-2",
      publicKeyJwk: {
        crv: "P-384",
        kty: "EC",
        x: "2x3HOTvR8e-Tu6U4UqMd1wUWsNXMD0RgIunZTMcZsS-zWOwDgsrhYVHmv3k_DjV3",
        y: "W9LLaBjlWYcXUxOf6ECSfcXKaC3-K9z4hCoP0PS87Q_4ExMgIwxVCXUEB6nf0GDd",
      },
    },
    {
      id: "did:example:bob#key-p521-1",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-p521-1",
      publicKeyJwk: {
        crv: "P-521",
        kty: "EC",
        x: "Af9O5THFENlqQbh2Ehipt1Yf4gAd9RCa3QzPktfcgUIFADMc4kAaYVViTaDOuvVS2vMS1KZe0D5kXedSXPQ3QbHi",
        y: "ATZVigRQ7UdGsQ9j-omyff6JIeeUv3CBWYsZ0l6x3C_SYqhqVV7dEG-TafCCNiIxs8qeUiXQ8cHWVclqkH4Lo1qH",
      },
    },
    {
      id: "did:example:bob#key-p521-2",
      type: "JsonWebKey2020",
      controller: "did:example:bob#key-p521-2",
      publicKeyJwk: {
        crv: "P-521",
        kty: "EC",
        x: "ATp_WxCfIK_SriBoStmA0QrJc2pUR1djpen0VdpmogtnKxJbitiPq-HJXYXDKriXfVnkrl2i952MsIOMfD2j0Ots",
        y: "AEJipR0Dc-aBZYDqN51SKHYSWs9hM58SmRY1MxgXANgZrPaq1EeGMGOjkbLMEJtBThdjXhkS5VlXMkF0cYhZELiH",
      },
    },
  ],
  service: [],
};

const BOB_SECRETS = [
  {
    id: "did:example:bob#key-x25519-1",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "X25519",
      d: "b9NnuOCB0hm7YGNvaE9DMhwH_wjZA1-gWD6dA0JWdL0",
      kty: "OKP",
      x: "GDTrI66K0pFfO54tlCSvfjjNapIs44dzpneBgyx0S3E",
    },
  },
  {
    id: "did:example:bob#key-x25519-2",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "X25519",
      d: "p-vteoF1gopny1HXywt76xz_uC83UUmrgszsI-ThBKk",
      kty: "OKP",
      x: "UT9S3F5ep16KSNBBShU2wh3qSfqYjlasZimn0mB8_VM",
    },
  },
  {
    id: "did:example:bob#key-x25519-3",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "X25519",
      d: "f9WJeuQXEItkGM8shN4dqFr5fLQLBasHnWZ-8dPaSo0",
      kty: "OKP",
      x: "82k2BTUiywKv49fKLZa-WwDi8RBf0tB0M8bvSAUQ3yY",
    },
  },
  {
    id: "did:example:bob#key-p256-1",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-256",
      d: "PgwHnlXxt8pwR6OCTUwwWx-P51BiLkFZyqHzquKddXQ",
      kty: "EC",
      x: "FQVaTOksf-XsCUrt4J1L2UGvtWaDwpboVlqbKBY2AIo",
      y: "6XFB9PYo7dyC5ViJSO9uXNYkxTJWn0d_mqJ__ZYhcNY",
    },
  },
  {
    id: "did:example:bob#key-p256-2",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-256",
      d: "agKz7HS8mIwqO40Q2dwm_Zi70IdYFtonN5sZecQoxYU",
      kty: "EC",
      x: "n0yBsGrwGZup9ywKhzD4KoORGicilzIUyfcXb1CSwe0",
      y: "ov0buZJ8GHzV128jmCw1CaFbajZoFFmiJDbMrceCXIw",
    },
  },
  {
    id: "did:example:bob#key-p384-1",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-384",
      d: "ajqcWbYA0UDBKfAhkSkeiVjMMt8l-5rcknvEv9t_Os6M8s-HisdywvNCX4CGd_xY",
      kty: "EC",
      x: "MvnE_OwKoTcJVfHyTX-DLSRhhNwlu5LNoQ5UWD9Jmgtdxp_kpjsMuTTBnxg5RF_Y",
      y: "X_3HJBcKFQEG35PZbEOBn8u9_z8V1F9V1Kv-Vh0aSzmH-y9aOuDJUE3D4Hvmi5l7",
    },
  },
  {
    id: "did:example:bob#key-p384-2",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-384",
      d: "OiwhRotK188BtbQy0XBO8PljSKYI6CCD-nE_ZUzK7o81tk3imDOuQ-jrSWaIkI-T",
      kty: "EC",
      x: "2x3HOTvR8e-Tu6U4UqMd1wUWsNXMD0RgIunZTMcZsS-zWOwDgsrhYVHmv3k_DjV3",
      y: "W9LLaBjlWYcXUxOf6ECSfcXKaC3-K9z4hCoP0PS87Q_4ExMgIwxVCXUEB6nf0GDd",
    },
  },
  {
    id: "did:example:bob#key-p521-1",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-521",
      d: "AV5ocjvy7PkPgNrSuvCxtG70NMj6iTabvvjSLbsdd8OdI9HlXYlFR7RdBbgLUTruvaIRhjEAE9gNTH6rWUIdfuj6",
      kty: "EC",
      x: "Af9O5THFENlqQbh2Ehipt1Yf4gAd9RCa3QzPktfcgUIFADMc4kAaYVViTaDOuvVS2vMS1KZe0D5kXedSXPQ3QbHi",
      y: "ATZVigRQ7UdGsQ9j-omyff6JIeeUv3CBWYsZ0l6x3C_SYqhqVV7dEG-TafCCNiIxs8qeUiXQ8cHWVclqkH4Lo1qH",
    },
  },
  {
    id: "did:example:bob#key-p521-2",
    type: "JsonWebKey2020",
    privateKeyJwk: {
      crv: "P-521",
      d: "ABixMEZHsyT7SRw-lY5HxdNOofTZLlwBHwPEJ3spEMC2sWN1RZQylZuvoyOBGJnPxg4-H_iVhNWf_OtgYODrYhCk",
      kty: "EC",
      x: "ATp_WxCfIK_SriBoStmA0QrJc2pUR1djpen0VdpmogtnKxJbitiPq-HJXYXDKriXfVnkrl2i952MsIOMfD2j0Ots",
      y: "AEJipR0Dc-aBZYDqN51SKHYSWs9hM58SmRY1MxgXANgZrPaq1EeGMGOjkbLMEJtBThdjXhkS5VlXMkF0cYhZELiH",
    },
  },
];

const msg = new Message({
    id: "1234567890",
    typ: "application/didcomm-plain+json",
    type: "http://example.com/protocols/lets_do_lunch/1.0/proposal",
    from: "did:example:alice",
    to: ["did:example:bob"],
    created_time: 1516269022,
    expires_time: 1516385931,
    body: { messagespecificattribute: "and its value" },
  });

  // --- Packing encrypted and authenticated message ---
  let didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
  let secretsResolver = new ExampleSecretsResolver(ALICE_SECRETS);

  const [encryptedMsg, encryptMetadata] = await msg.pack_encrypted(
    BOB_DID,
    ALICE_DID,
    ALICE_DID,
    didResolver,
    secretsResolver,
    {
      forward: false, // TODO: should be true by default
    }
  );

  console.log("Encryption metadata is\n", encryptMetadata);

  // --- Sending message ---
  console.log("Sending message\n", encryptedMsg);

  // --- Unpacking message ---
  didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
  secretsResolver = new ExampleSecretsResolver(BOB_SECRETS);

  const [unpackedMsg, unpackMetadata] = await Message.unpack(
    encryptedMsg,
    didResolver,
    secretsResolver,
    {}
  );

  console.log("Reveived message is\n", unpackedMsg.as_value());
  console.log("Reveived message unpack metadata is\n", unpackMetadata);

})
</script>
