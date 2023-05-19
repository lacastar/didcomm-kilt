<template>
    <v-app>
        <template v-if="!appStore.login">
            <Login />
        </template>
        <template v-else>
        <v-container >
            <v-row justify="center" valign="center">
                <v-col cols="6" md="4" lg="3" >
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
                                    {{kiltStore.accountMnemonic }}
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

const appStore = useAppStore()
const kiltStore = useKiltStore()

const createAccount = function(){
    kiltStore.generateAccount()
}

</script>