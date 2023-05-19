// Utilities
import { defineStore } from 'pinia'
import { ref } from 'vue'
//import {joinRoom} from 'trystero/ipfs'
import { useGunStore } from './gun'

export const useRTCStore = defineStore('rtc', () => {
  const rooms = ref({})
  //const config = ref({appId: 'didcomm_app'})
  
  
  //const doubleCount = computed(() => count.value * 2)


  // invitation flow: 
  //  peers are listening for connections
  //  inviters send: "hello" to new peers
  //  invetees respond with the DIDComm handshake
  //  inviter respond with DIDrotate message
  //  both move to new room
  

  function initInviteRoom(name, roomid, rotateMsgGenerator) {
    //const room = joinRoom(config.value, roomid)
    //const [sendInvite, getInvite] = room.makeAction('invite')
    //const [sendRotate, getRotate] = room.makeAction('rotate')

    console.log(`init invite room ${roomid}`)

    //room.onPeerJoin(peerId => {
    //  console.log(`${peerId} joined`)
    // console.log(`sending hello to ${peerId}`)
    //  sendInvite(`hello` ,peerId)
    //})

    //console.log(`send hello`)
    //sendInvite(`hello`)
    const gun = useGunStore()
    gun.getInvite(roomid, rotateMsgGenerator)

    //getInvite((data, peerId) => {
    //  console.log(`Invite msg ${data} from ${peerId}`)
    //  if(data.startsWith("hello")){
    //    console.log(`ignoring`)
    //    return  //ignore
    //  }
      // parese DIDComm
    //  const { encryptedMsg, encryptedMetadata, newdid } = rotateMsgGenerator(data)
      // send DID rotation
    //  console.log(`send rotate to ${peerId}`)
    //  sendRotate(encryptedMsg)
    //  initChatRoom(name, newdid.room)
    //})

    //rooms.value[name] = {
    //  room,
    //  sendMsg,
    //  getMsg,
    //}
  }

  async function respondInviteRoom(name, roomid, msgGenerator, rotate) {
    //const room = joinRoom(config.value, roomid)
    //const [sendInvite, getInvite] = room.makeAction('invite')
    //const [sendRotate, getRotate] = room.makeAction('rotate')


    console.log(`init response room ${roomid}`)

    //room.onPeerJoin(peerId => {
    //  console.log(`${peerId} joined`)
      //sendMsg(`hello ${peerId}` ,peerId)

    //})


    //getInvite(async (data, peerId) => {
    //  console.log(`invite msg ${data} from ${peerId}`)
    //  if(data.startsWith("hello")){
    //    console.log(`send invite to ${peerId}`)
    //    sendInvite(await msgGenerator(roomid), peerId)
    //  }
    //})
    const gun = useGunStore()
    gun.sendInvite(await msgGenerator(roomid), roomid)

    //getRotate(async (data, peerId) => {
    //  console.log(`rotate msg ${data} from ${peerId}`)
    //  rotate(roomid, data)
    //})


    //rooms.value[name] = {
    // room,
    //  sendMsg,
    //  getMsg,
    //}
  }

  function initChatRoom(name, roomid){
    console.log(`init chat room ${roomid}`)
    const room = joinRoom(config.value, roomid)
    const [sendMessage, getMessage] = room.makeAction('message')
  }
  
  return { initInviteRoom, respondInviteRoom, initChatRoom }
})