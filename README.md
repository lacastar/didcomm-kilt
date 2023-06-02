# A DID Messaging app

With KILT you can create DIDs (decentralized identifiers) and verifiable credentials, providing secure, practical identity solutions. DIDComm specifies standardized protocols for general DID related use-cases. Starting from a simple chat application integrating these protocols could make a decent platform for both secure private communications and official business.

The architecture is decentralized and the communication is asynchronous - although it uses WebRTC in the background (sort of).
The frontend is a Vue SPA where you can create a light DID that will be you primary identity. (It is possible to use a full DID as well, even the code is there to create an account, but for the sake of simplicity, simplification of testing and lack of time it was scrapped from the UI just as well as the possibility to switch between DIDs) KILT is used for managing the DIDs, deriving keys and generating keypairs and mnemonics.
The persistency layer is GUN DB, because I wanted to try it out for a while, and if it delivers on its promises (mostly) it fits pretty well this use-case. So your account information is stored there and it should be available peer-to-peer as well - kind of. I have my doubts regarding its security, but all information is encrypted that passes through it - thanks to DIDComm ;) - so there is no evident problem here, but I do have my concerns by now.
Peer-to-peer communication was supposed to be done by WebRTC, but the library (dmotz/trystero) stopped working like 2 days ago, so as a last minute fix it is done by GUN as well.

So once a light DID is created it can be used to generate invite links for friends. For each invite a new light DID is derived from the original and a new channel is created. The link must be sent out of band to the recipient. After accepting the invitation a new light DID is generated for the recipient as well that generates a message encoded by the sender's keys. Once the sender receives this message it rotates it's DID and notifies about this the recipient. This was every connection has a dedicated DID from both parties. Once the connection is ready it is possible to send DIDComm basic messages to eachother.

# Please do not try it in production yet, it is just not there yet. Right now it is a tech demo.

# Known bugs and shortcomings

* during did rotation from_prior header field JWT is not set (jose is there, but there was no time to set it up correctly)
* many "busieness" validations are missing (protocol type field, etc), but the right formats and encryptions are enforced
* pending invites are duplicated, tripled or worse... it is due to GUN's streaming. can be fixed easily
* the didcomm library chokes on the service field of the DID document, so it must be patched before pack and unpack
* code and UX quality is on par with a dumpster fire, I am sorry about that... last minute rewriting of the communication layer took it's toll

# Live demo
Is available at [https://didcomm-kilt.vercel.app/](https://github.com/lacastar/didcomm-kilt/edit/main/README.md)

# Running

## clone from Github

## create an .env file and set three settings:

### Which KILT chain to use: VITE_KILT_WSS_ADDRESS = wss://peregrine.kilt.io/parachain-public-ws

### GUN super peers to connect to (you can use this, or spin up your own, but keep in mind, that it is not really reliable): VITE_GUN_PEERS = ["https://gun-manhattan.herokuapp.com/gun"]

### This is the endpoint where this app is hosted (it is used in the invite link and DID service endpoints as well): VITE_DC_SERVICE_ENDPOINT = http://localhost:3000/

I used yarn, but others should work as well.

# essentials

## Project setup

```
# yarn
yarn

# npm
npm install

# pnpm
pnpm install
```

### Compiles and hot-reloads for development

```
# yarn
yarn dev

# npm
npm run dev

# pnpm
pnpm dev
```

### Compiles and minifies for production

```
# yarn
yarn build

# npm
npm run build

# pnpm
pnpm build
```

### Lints and fixes files

```
# yarn
yarn lint

# npm
npm run lint

# pnpm
pnpm lint
```

### Customize configuration

See [Configuration Reference](https://vitejs.dev/config/).
