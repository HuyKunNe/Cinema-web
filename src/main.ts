import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const vueQueryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },

      mutations: {
        retry: false,
      },
    },
  },
}

app.use(createPinia())

app.use(router)

app.use(VueQueryPlugin, vueQueryOptions)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.mount('#app')
