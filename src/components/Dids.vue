<template>
    <v-app>
        <template v-if="!appStore.login">
            <Login />
        </template>
        <template v-else>
        <v-container>
            <v-btn fab color="primary" :to="{path: '/'}">
                <v-icon>mdi-menu</v-icon>
            </v-btn>
            <v-dialog v-model="createDialog" width="300">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Create</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field label="Name" v-model="didName" required></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="cancelCreate">
                            Cancel
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" @click="doCreate">
                            Create
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            
            <v-row justify="center" align="center">
                <v-col cols="6" md="4" lg="3" v-if="!kiltStore.activeDid">
                    <v-card class="mx-auto" variant="outlined">
                        <v-card-item>
                            <div>
                                <div class="text-h6 mb-1">
                                    Create a light DID
                                </div>
                                <div class="text-caption">Create a new KILT DID</div>
                            </div>
                        </v-card-item>

                        <v-card-actions>
                            <v-btn variant="outlined" @click="createDialog = true">
                                Create
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
                <v-col v-for="did in kiltStore.getDids()" :key="did.did.address" cols="6" md="4" lg="3">
                    <v-card class="mx-auto" variant="outlined">
                        <v-card-item>
                            <div>
                                <div class="text-overline mb-1">
                                    {{ did.did.web3 }}
                                </div>
                                <div class="text-h6 mb-1">
                                    {{ did.did.name }}
                                </div>
                                <div class="text-caption">{{ did.did.fullDid }}</div>
                            </div>
                        </v-card-item>

                        <v-card-actions>
                           <!-- <v-btn variant="outlined">
                                Button
                            </v-btn>-->
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
            <!--<v-btn v-if="kiltStore.getDids()==0" fab color="primary" @click="createDialog = true">
                <v-icon>mdi-plus</v-icon>
            </v-btn>-->
        </v-container>
        </template>
    </v-app>
</template>
  
<script setup>
import { useKiltStore } from '@/store/kilt'
import { ref } from 'vue'
import Login from "./Login.vue"
import { useAppStore } from '@/store/app'

const appStore = useAppStore()

const kiltStore = useKiltStore()

const createDialog = ref(false)
const didName = ref("")

const cancelCreate = function(){
    didName.value = ""
    createDialog.value = false
}

const doCreate = function(){
    kiltStore.generateDid(didName.value)
    cancelCreate()
}
</script>