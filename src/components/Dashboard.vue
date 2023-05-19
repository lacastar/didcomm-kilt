<template>
    <v-app>
        <template v-if="!appStore.login">
            <Login />
        </template>
        <template v-else>
        <v-container >
            <v-row justify="center" align="center">
                <v-col v-for="n in cards" :key="n.title" cols="6" md="4" lg="3" >
                    <v-card class="mx-auto" variant="outlined">
                        <v-card-item>
                            <div>
                                <div class="text-overline mb-1">
                                    {{ n.subtitle }}
                                </div>
                                <div class="text-h6 mb-1">
                                    {{ n.title }}
                                </div>
                                <div class="text-caption">{{ n.text }}</div>
                            </div>
                        </v-card-item>

                        <v-card-actions>
                            <v-btn icon="mdi-send" variant="outlined" color="primary" :to="n.link">
                                
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        </template>
    </v-app>
</template>
  
<script setup>
import {ref} from 'vue'
import Login from "./Login.vue"

import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const cards = ref([
        {
            title: "Chat",
            subtitle: "DID communications",
            text: "DID encrypted",
            link: "/comm",
        },
        {
            title: "DIDs",
            subtitle: "Decentralized identifiers",
            text: "Manage your DIDs",
            link: "/did",
        },
        {
            title: "Account",
            subtitle: "KILT account",
            text: "Inspect account",
            link: "/account",
        },
        ])
</script>