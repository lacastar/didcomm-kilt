// Utilities
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const login = ref('')
  const kiltApi = ref(null)
  //const name = ref('Eduardo')
  //const doubleCount = computed(() => count.value * 2)
  function setLogin(name) {
    login.value = name
  }
  function setKiltApi(api) {
    kiltApi.value = api
  }
  
  return { login, setLogin, kiltApi, setKiltApi }
})