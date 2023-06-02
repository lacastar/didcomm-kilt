// Utilities
import { defineStore } from 'pinia'
import { ref } from 'vue'
import Gun from "gun/gun"
import SEA from 'gun/sea'
import "gun/lib/unset.js"

import { useAppStore } from './app'
import { useKiltStore } from './kilt'
import { useRTCStore } from './rtc'

//import { useRouter } from 'vue-router'

const appStore = useAppStore()
const rtcStore = useRTCStore()

export const useGunStore = defineStore('gun', () => {
  const gunUser = ref(null)
  const gun = Gun({peers: JSON.parse(import.meta.env.VITE_GUN_PEERS) })
  const user = gun.user()
  const authenticated = ref(false)
  const gunError = ref("")
  //const router = useRouter()

  const secret = ref(null)
 //   user.auth('user', 'prtsword2qwersdf')
  //const name = ref('Eduardo')
  //const doubleCount = computed(() => count.value * 2)
  //function increment() {
  //  count.value++
  //}
  function registerGunUser(name, password) {
    gunError.value = ""
    user.create(name, password, function(ack){
      // done creating user!
      //console.log("gun create: "+JSON.stringify(ack))
      if(ack.err){
        gunError.value = ack.err
      }else{
        loginGunUser(name, password)
      }
    });
  }
  async function loginGunUser(name, password) {
    gunError.value = ""
    user.auth(name, password, function(ack){
      //console.log("gun login err: "+ JSON.stringify(ack.err))
      if(ack.err) {
        gunError.value = ack.err
      }else {
        authenticated.value =  user.is
        appStore.setLogin(name)
        secret.value = name + password

        const kiltStore = useKiltStore()
        user.get("account").once(async function(account){
          // render it, but only once. No updates.
          if(account){
            const acc= await SEA.decrypt(account, secret.value)
            //console.log("account from gun: " + acc)
            kiltStore.regenerateAccount(acc)
          }
        })

        user.get("dids").map().on(async function(did){
          //console.log("dids from gun: " + JSON.stringify(did))
          if(did){
              const named = await SEA.decrypt(did.n, secret.value)
              const mnemonic = await SEA.decrypt(did.m, secret.value)
              //console.log(`${named}: ${mnemonic}`)
              const diduri = await kiltStore.regenerateDid(named, mnemonic)
              const encodeduri = await SEA.encrypt(diduri, secret.value)

              //user.get("invites").map(inv => inv.p === encodeduri? inv : undefined).once(async function(inv){
              //console.log("DIDURI: " + diduri)
              user.get("invites").map().on(async function(inv){
                
                //console.log("invites from gun: " + JSON.stringify(inv))
                if(inv){
                    const named = await SEA.decrypt(inv.n, secret.value)
                    const room = await SEA.decrypt(inv.r, secret.value)
                    const parent = await SEA.decrypt(inv.p, secret.value)
                    const diduri = await SEA.decrypt(inv.u, secret.value)
                    const peerdiduri = inv.f?await SEA.decrypt(inv.f, secret.value):null
      
                    console.log(`${named}: ${room} -- ${parent} -- ${diduri} -- ${peerdiduri}`)
                    await kiltStore.regenerateInviteDid(room, parent, diduri, named, peerdiduri)
                    if(peerdiduri){
                      rtcStore.respondInviteRoom(named, room, kiltStore.generateInviteAcceptMessage, kiltStore.receivedDidRotate)
                    }else{
                      rtcStore.initInviteRoom(named, room, kiltStore.rotateDidMessage)
                    }
      
                }
              })

              user.get("chat").map().on(async function(chat){
                //console.log("chats from gun: " + JSON.stringify(chat))
                if(chat){
                    const named = await SEA.decrypt(chat.n, secret.value)
                    const room = await SEA.decrypt(chat.r, secret.value)
                    const parent = await SEA.decrypt(chat.p, secret.value)
                    const diduri = await SEA.decrypt(chat.u, secret.value)
                    const peerdiduri = await SEA.decrypt(chat.f, secret.value)
      
                    //console.log(`${named}: ${room} -- ${parent} -- ${diduri} -- ${peerdiduri}`)
                    //
                    await kiltStore.regenerateChatDid(room, parent, diduri, named, peerdiduri)
                    //rtcStore.initChatRoom()
                    gun.get(room).get("chat").map().on(async function(msg){
                      if(msg){
                        kiltStore.onMsg(room, JSON.parse(msg))
                      }
                    })
                }
              })

          }
        })

        
        
        //router.replace({ path: '/' })

      }
    })
  }

  async function saveAccount(mnemonic){
    user.get('account').put(await SEA.encrypt(mnemonic, secret.value))
  }
  async function saveDid(name, mnemonic){
    user.get('dids').set({n: await SEA.encrypt(name, secret.value), m: await SEA.encrypt(mnemonic, secret.value)})
  }
  async function saveInviteRoom(name, room, parentdid, diduri, peerdiduri){
    user.get('invites').get(room).put({
      n: await SEA.encrypt(name, secret.value), 
      r: await SEA.encrypt(room, secret.value), 
      p: await SEA.encrypt(parentdid, secret.value),
      u: await SEA.encrypt(diduri, secret.value),
      f: peerdiduri ? await SEA.encrypt(peerdiduri, secret.value) : "",
    })
  }
  async function saveChatRoom(name, room, parentdid, diduri, peerdiduri){
    user.get('chat').set({
      n: await SEA.encrypt(name, secret.value), 
      r: await SEA.encrypt(room, secret.value), 
      p: await SEA.encrypt(parentdid, secret.value),
      u: await SEA.encrypt(diduri, secret.value),
      f: await SEA.encrypt(peerdiduri, secret.value),
    })
  }

  function sendInvite(message, roomid){
    console.log("sending accept invite to " + roomid)
    gun.get(roomid).get("invite").put({"msg" : JSON.stringify(message)})
    gun.get(roomid).get("rotate").get("msg").on(async function(rotate, key){
      //console.log(`rotate msg ${JSON.stringify(rotate)} from ${roomid} key ${key}`)
      if(rotate){
        const kiltStore = useKiltStore()
        const newdid = await kiltStore.receivedDidRotate(roomid, JSON.parse(rotate))
        saveChatRoom(newdid.name, roomid, newdid.parentDid, newdid.did.uri, newdid.peer.uri)
        gun.get(roomid).get("rotate").get("msg").off()
        gun.get(roomid).get("invite").put(null)
        gun.get(roomid).get("rotate").put(null)
        user.get('invites').get(roomid).put(null)
      }
    })
  }

  //function getInvite(roomid, rotateMsgGenerator){
  function getInvite(roomid){
    console.log(`invite listener for ${roomid}`)
    gun.get(roomid).get("invite").get("msg").on(async function(data,key){
      //console.log(`got invite msg ${data} from ${roomid} key ${key}`)
      if(data){
        const kiltStore = useKiltStore()
        //const { encryptedMsg, encryptedMetadata, newdid } = await rotateMsgGenerator(JSON.parse(data))
        const { encryptedMsg, encryptedMetadata, newdid } = await kiltStore.rotateDidMessage(roomid, JSON.parse(data))
        saveChatRoom(newdid.name, newdid.room, newdid.parentDid.fullDid, newdid.did.uri, newdid.peer.uri)
        // send DID rotation
        //console.log("encryptedMsg: " + JSON.stringify(encryptedMsg))
        gun.get(roomid).get("rotate").put({"msg": JSON.stringify(encryptedMsg)})
        gun.get(roomid).get("invite").get("msg").off()
        user.get('invites').get(roomid).put(null)
      }
    })
  }

  function sendMessage(room, msg){
    gun.get(room).get("chat").set(msg)
  }

  return { 
    gunUser, 
    registerGunUser, 
    loginGunUser, 
    authenticated, 
    gunError, 
    saveAccount, 
    saveDid, 
    saveInviteRoom,
    sendInvite,
    getInvite,
    saveChatRoom,
    sendMessage,
  }
})