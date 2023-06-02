<template>
    <v-app>
        <template v-if="!kiltStore.activeDid">
            <Login />
        </template>
        <template v-else>
            <v-system-bar>
                <v-btn fab color="primary" :to="{ path: '/' }">
                    <v-icon>mdi-menu</v-icon>
                </v-btn>
                <!--<v-spacer></v-spacer>

            <v-icon>mdi-square</v-icon>

            <v-icon>mdi-circle</v-icon>

            <v-icon>mdi-triangle</v-icon>-->
            </v-system-bar>

            <v-dialog v-model="msgInfoDialog">
                <v-card>
                    <v-card-title>
                        <span class="text-h8">{{ selectedMessage.decryptedMessage.id }} in {{ selectedPeer }}</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-card-item>
                                        <span>decrypted message:</span><br>
                                        <pre
                                            class="text-caption">{{ JSON.stringify(selectedMessage.decryptedMessage, null, 2) }}</pre>
                                        <span>unpacked metadata:</span><br>
                                        <pre
                                            class="text-caption">{{ JSON.stringify(selectedMessage.unpackedMetadata, null, 2) }}</pre>
                                    </v-card-item>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="msgInfoDialog = false">
                            OK
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-model="inviteDialog">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">{{ inviteLink ? "Share" : "Generate" }} invite link</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-if="!inviteLink" label="Peer name" v-model="inviteName" required
                                        hint="A short, but unique alias for your friend"></v-text-field>
                                    <v-card-item v-else>
                                        <div>
                                            <div class="text-h6 mb-1">
                                                Send this link in a trusted channel to your friend
                                            </div>

                                            <v-tabs v-model="inviteTab" bg-color="primary">
                                                <v-tab value="link"><v-icon icon="mdi-link" /></v-tab>
                                                <v-tab value="qr"><v-icon icon="mdi-qrcode-scan" /></v-tab>
                                            </v-tabs>
                                            <v-window v-model="inviteTab">
                                                <v-window-item value="link">
                                                    <div class="text-caption"><v-icon icon="mdi-content-copy" @click="copyInviteLinkToClipboard" /> {{ inviteLink }}</div>
                                                </v-window-item>
                                                <v-window-item value="qr">
                                                    <vue-qr :text="inviteLink"></vue-qr>
                                                </v-window-item>
                                            </v-window>                                                    
                                        </div>
                                    </v-card-item>
                                </v-col>
                                <!-- <v-col cols="12">
                                    <v-text-field label="TODO: Active DID select" v-model="inviteName" required></v-text-field>
                                </v-col>-->
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn v-if="!inviteLink" color="blue-darken-1" variant="text" @click="inviteDialog = false">
                            Cancel
                        </v-btn>
                        <v-btn v-if="!inviteLink && !kiltStore.names[inviteName]" color="blue-darken-1" variant="text" @click="doInvite">
                            Generate
                        </v-btn>
                        <v-btn v-if="inviteLink" color="blue-darken-1" variant="text" @click="finishInvite">
                            OK
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-model="incomingInviteDialog" width="300">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Accept invoming invite</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field label="Peer name" v-model="inviteName" required></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="incomingInvite = null">
                            Decline
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" @click="acceptInvite">
                            Accept
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-navigation-drawer v-model="drawer" theme="dark" absolute permanent :rail="rail" @click="rail = false">
                <v-list-item :title="kiltStore.activeDid.name" nav>
                    <!-- prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg" -->
                    <template v-slot:prepend>
                        <!--<v-icon v-if="selectedPeer==peer">{{ icon }}</v-icon>-->
                        <Identicon :size="32" :theme="'polkadot'"
                            :value="'5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'" />
                    </template>
                    <template v-slot:append>
                        <v-btn variant="text" icon="mdi-chevron-left" @click.stop="rail = !rail"></v-btn>
                    </template>
                </v-list-item>

                <v-divider></v-divider>

                <v-list>
                    <v-list-item link>
                        <v-list-item-title>Peers</v-list-item-title>
                        <template v-slot:append>
                            <v-btn variant="text" :icon="peers ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                @click.stop="peers = !peers"></v-btn>
                        </template>
                    </v-list-item>
                    <template v-if="peers">
                        <v-list-item v-for="[room, did] in kiltStore.peerList" :key="room" link 
                            @click="selectRoom(room)"
                            :variant="selectedPeer == room ? 'tonal' : 'plain'">


                            <v-list-item-title>{{ did.named }}</v-list-item-title>
                            <!--<template v-slot:append><v-icon icon="mdi-dots-vertical" @click=""></v-icon></template>-->
                        </v-list-item>
                    </template>
                </v-list>

                <v-divider></v-divider>
                <v-list>
                    <v-list-item link>
                        <v-list-item-title>Invites</v-list-item-title>
                        <template v-slot:append>
                            <v-btn variant="text" :icon="invites ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                @click.stop="invites = !invites"></v-btn>
                        </template>
                    </v-list-item>
                    <v-list-item link @click="invite()">

                        <template v-slot:prepend>
                            <v-btn variant="text" icon="mdi-account-plus-outline" @click="invite()"></v-btn>
                        </template>
                        <v-list-item-title>New</v-list-item-title>
                    </v-list-item>
                    <template v-if="invites">
                        <v-list-item v-for="inv in kiltStore.inviteList" :key="inv.name" link>
                            <v-list-item-title>{{ inv.name }}</v-list-item-title>
                            <template v-slot:append>
                                <v-menu transition="scale-transition">
                                    <template v-slot:activator="{ props }">
                                        <v-icon color="primary" icon="mdi-dots-vertical" v-bind="props" />
                                    </template>
                                    <v-list>
                                        <v-list-item>
                                            <v-list-item-title @click="showInvite(inv)">Show</v-list-item-title>
                                        </v-list-item>
                                        <!--<v-list-item>
                                            <v-list-item-title>Delete</v-list-item-title>
                                        </v-list-item>-->
                                    </v-list>
                                </v-menu>
                                
                            </template>

                            
                        </v-list-item>
                    </template>
                </v-list>

            </v-navigation-drawer>

            <v-main>
                <v-container class="py-8 px-6" fluid>
                    <v-row v-if="selectedPeer">
                        <v-col cols="12">
                            <v-text-field v-model="message" outlined label="Type your Basic DIDComm message here..."
                                @click:append="sendMessage" @keydown.enter="sendMessage"
                                append-icon="mdi-send"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row v-if="selectedPeer && kiltStore.chatForRoom.length > 0">
                        <v-col cols="12">
                            <v-card>

                                <v-list lines="two">
                                    <v-list-subheader>Room# {{ selectedPeer }} </v-list-subheader>
                                    <template  v-for="msg in kiltStore.chatForRoom" :key="msg.decryptedMessage.id">
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon
                                                    :icon="msg.decryptedMessage.self ? 'mdi-send' : 'mdi-inbox-arrow-down-outline'"></v-icon>
                                                <!--<v-avatar  color="grey-darken-1"></v-avatar>-->
                                            </template>

                                            <v-list-item-title :variant="msg.decryptedMessage.self ? 'tonal' : 'plain'">{{
                                                msg.decryptedMessage.body.content }} </v-list-item-title>

                                            <v-list-item-subtitle>
                                                Id# {{ msg.decryptedMessage.id }}
                                            </v-list-item-subtitle>
                                            <template v-slot:append>
                                                <v-icon icon="mdi-information-outline" @click="showInfo(msg)"></v-icon>
                                            </template>
                                            <!--<v-tooltip activator="parent" location="start">{{JSON.stringify(msg)}}</v-tooltip>-->
                                        </v-list-item>

                                        <v-divider inset></v-divider>
                                    </template>
                                </v-list>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-main>
        </template>
    </v-app>
</template>
  
<script setup>

import { ref, computed } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

import { storeToRefs } from "pinia"

import { useKiltStore } from '@/store/kilt'
import { useRTCStore } from '@/store/rtc'
import { useGunStore } from '@/store/gun'

import Identicon from '@polkadot/vue-identicon'
import vueQr from 'vue-qr/src/packages/vue-qr.vue'

import Login from "./Login.vue"

const router = useRouter()

const kiltStore = useKiltStore()
const { chatForRoom } = storeToRefs(kiltStore)
const rtcStore = useRTCStore()
const gunStore = useGunStore()

const drawer = ref(null)
const rail = ref(true)
const peers = ref(true)
const invites = ref(true)

const incomingInvite = ref(null)
const incomingInviteDialog = computed(() => incomingInvite.value != null)

const inviteDialog = ref(false)
const inviteName = ref("")
const inviteLink = ref(null)
const inviteTab = ref(null)
const message = ref("")

const msgInfoDialog = ref(false)
const selectedMessage = ref(null)



const invite = function () {
    inviteName.value = ""
    inviteDialog.value = true
}

const selectedPeer = ref(null)

const finishInvite = function () {
    inviteLink.value = null
    inviteDialog.value = false
}
const selectRoom = function (room){
    selectedPeer.value = room
    kiltStore.selectChatRoom(room)
}

const showInvite = async function(invite){
    const { oobPeerDID, inviteurl } = await kiltStore.createInviteLink(invite.room)
    inviteLink.value = inviteurl
    inviteDialog.value = true
}
const doInvite = async function () {
    const room = self.crypto.randomUUID()
    const { oobPeerDID, inviteurl } = await kiltStore.createInviteLink(room)
    console.log("INVITE: " + inviteurl)
    //console.log(oobPeerDID.uri)

    gunStore.saveInviteRoom(inviteName.value, room, kiltStore.activeDid.fullDid, oobPeerDID.uri)
    //rtcStore.initInviteRoom(inviteName.value, room, kiltStore.rotateDidMessage)

    inviteLink.value = inviteurl
}

const acceptInvite = async function () {
    const { did, room } = await kiltStore.connectPeer(incomingInvite.value)
    //rtcStore.respondInviteRoom(inviteName.value, room, kiltStore.generateInviteAcceptMessage, kiltStore.receivedDidRotate)
    await gunStore.saveInviteRoom(inviteName.value, room, kiltStore.activeDid.fullDid, did.did.uri, did.peer.uri)

    inviteName.value = ""
    router.replace({ path: '/comm' })
    incomingInvite.value = null

}

const sendMessage = async function (event) {
    if (!message.value) return
    if (event) event.preventDefault()
    const [encryptedMsg, encryptMetadata, encryptedMsgSelf] = await kiltStore.generateMsg(selectedPeer.value, message.value)
    console.log(`Sending in ${selectedPeer.value}: ${JSON.stringify(encryptedMsg)} \n meta ${JSON.stringify(encryptMetadata)}`)
    gunStore.sendMessage(selectedPeer.value, JSON.stringify(encryptedMsg))
    gunStore.sendMessage(selectedPeer.value, JSON.stringify(encryptedMsgSelf))
    message.value = ""
}

const showInfo = function (msg) {
    msgInfoDialog.value = true
    selectedMessage.value = msg
}

const copyInviteLinkToClipboard = function () {
    navigator.clipboard.writeText(inviteLink.value);
}

onMounted(async () => {
    const route = useRoute()
    const oob = route.query['_oob']
    if (oob) {
        incomingInvite.value = kiltStore.verifyOOB(oob)
    }
})

</script>