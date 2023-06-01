<template>
    <v-app>
        <template v-if="!appStore.login">
            <Login />
        </template>
        <template v-else>
        <v-container >
            <v-btn fab color="primary" :to="{path: '/'}">
                <v-icon>mdi-menu</v-icon>
            </v-btn>
            <v-row justify="center" valign="center">
                <v-col cols="6" md="4" lg="3" v-if="!kiltStore.account">
                    <v-card class="mx-auto" variant="outlined">
                        <v-card-item>
                            <div>
                                <div class="text-h6 mb-1">
                                    Create account
                                </div>
                                <div class="text-caption">Create a new KILT account</div>
                            </div>
                        </v-card-item>

                        <v-card-actions>
                            <v-btn variant="outlined" @click="createAccount">
                                Create
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
                <v-col cols="6" md="4" lg="3" >
                    <v-card class="mx-auto" variant="outlined">
                        <v-card-item>
                            <div>
                                <div class="text-h6 mb-1">
                                    KILT Account
                                </div>
                                <div class="text-caption">{{kiltStore.account?.address}}<br>
                                    <template v-if="showMnemonic">
                                        <v-icon icon="mdi-eye" @click="showMnemonic = false"/><br>{{kiltStore.accountMnemonic }}
                                    </template>
                                    <template v-else>
                                        <v-icon icon="mdi-eye" @click="showMnemonic = true"/>
                                    </template>
                                </div>
                            </div>
                        </v-card-item>

                        <!--<v-card-actions>
                            <v-btn variant="outlined">
                                Create
                            </v-btn>
                        </v-card-actions>-->
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        </template>
    </v-app>
</template>
  
<script setup>
import { useKiltStore } from '@/store/kilt'
import Login from "./Login.vue"
import { useAppStore } from '@/store/app'
import { ref } from "vue"

const showMnemonic = ref(false)

const appStore = useAppStore()
const kiltStore = useKiltStore()


const createAccount = function(){
    kiltStore.generateAccount()
}


</script>