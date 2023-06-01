/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */


// Components
import App from './App.vue'


// Composables
import { createApp } from 'vue'


// Plugins
import { registerPlugins } from '@/plugins'


import  'https://unpkg.com/@kiltprotocol/sdk-js@0.32.1-5/dist/sdk-js.min.umd.js'


// import * as Kilt from '@kiltprotocol/sdk-js';
//Kilt.init({ address: "wss://spiritnet.kilt.io:443" });

/*
import VueGun from "vue-gun";
import Gun from "gun";

// eslint-disable-next-line no-unused-vars
import SEA from "gun/sea"; // Required for SEA functions and user authentication

var gun = Gun({peers:['http://localhost:8765/gun', 'https://gun-manhattan.herokuapp.com/gun']}
   // [
  //"http://localhost:8765/gun"
  // "https://mvp-gun.herokuapp.com/gun",
  // "https://e2eec.herokuapp.com/gun"
//]
);
gun.SEA = SEA;
//Vue.use(VueGun, {
//  gun: gun // must be passed in at `gun` key
//});*/



const app = createApp(App)
/*.use(VueGun, {
    gun: gun // must be passed in at `gun` key
  })*/

registerPlugins(app)
console.log(`running in mode: ${import.meta.env.MODE}`)
console.log(`KILT endpoint: ${import.meta.env.VITE_KILT_WSS_ADDRESS}` )
await window.kilt.connect(import.meta.env.VITE_KILT_WSS_ADDRESS)
const api = window.kilt.ConfigService.get('api')
  

app.provide('kilt', window.kilt)
app.provide('kiltapi', api)
//app.provide('polkadotjs', window.__polkadotjs)
app.mount('#app')
