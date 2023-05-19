<template>
    <v-app>
        <v-container>
            <v-dialog v-model="loginDialog" width="300">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Login</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field label="Login" v-model="loginName" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field label="Password" v-model="password" type="password" required></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                        <v-alert
                        closable
                        variant="outlined"
                        density="compact"
                        v-model="loginAlert"
                        type="error"
                        title="Registration error"
                        :text="loginError"
                    ></v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="cancelLogin">
                            Cancel
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" @click="doLogin">
                            Login
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-model="registerDialog" width="300">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Register</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="loginName" label="Login" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field label="Password" v-model="password" type="password" required></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                        <v-alert
                        closable
                        variant="outlined"
                        density="compact"
                        v-model="registerAlert"
                        type="error"
                        title="Registration error"
                        :text="registerError"
                    ></v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="cancelRegister">
                            Cancel
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" @click="doRegister">
                            Register
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-row justify="center" align="center">
                <v-col cols="6" md="4" lg="3">
                    <v-card class="mx-auto" variant="outlined">
                        <v-card-item>
                            <div>
                                <div class="text-overline mb-1">
                                    Existing user
                                </div>
                                <div class="text-h6 mb-1">
                                    Login
                                </div>
                                <div class="text-caption">Login as an existing user</div>
                            </div>
                        </v-card-item>

                        <v-card-actions>
                            <v-btn variant="outlined" @click="loginDialog = true">
                                Login
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
                <v-col cols="6" md="4" lg="3">
                    <v-card class="mx-auto" variant="outlined">
                        <v-card-item>
                            <div>
                                <div class="text-overline mb-1">
                                    New user
                                </div>
                                <div class="text-h6 mb-1">
                                    Register new user
                                </div>
                                <div class="text-caption">Create a new user</div>
                            </div>
                        </v-card-item>

                        <v-card-actions>
                            <v-btn variant="outlined" @click="registerDialog = true">
                                Register
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-app>
</template>
  
<script setup>
import { useGunStore } from '@/store/gun'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const gunStore = useGunStore()
const router = useRouter()

const loginDialog = ref(false)
const registerDialog = ref(false)
const loginName = ref("")
const password = ref("")
const loginAlert = ref(false)
const loginError = ref("")
const registerAlert = ref(false)
const registerError = ref("")


function resetForm() {
    loginName.value = ""
    password.value = ""
}

const doLogin = function () {
    gunStore.loginGunUser(loginName.value, password.value)
    if(gunStore.gunError){
        loginError.value = gunStore.gunError
        loginAlert.value = true
        return
    }
    loginDialog.value = false
    resetForm()
}
const cancelLogin = function () {
    loginDialog.value = false
    resetForm()
}

const doRegister = function () {
    gunStore.registerGunUser(loginName.value, password.value)
    console.log("err: " + gunStore.gunError)
    if(gunStore.gunError){
        registerError.value = gunStore.gunError
        registerAlert.value = true
        return
    }
    registerDialog.value = false
    resetForm()
    router.replace({ path: '/' })
}

const cancelRegister = function () {
    registerDialog.value = false
    resetForm()
}

</script>