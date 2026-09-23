import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import { createPiniaProvider } from './providers/pinia'
import { primeVueOptions } from './providers/primevue'
import { vueQueryOptions } from './providers/vue-query'
import router from './router'

export function bootstrapApplication(selector = '#app') {
  const app = createApp(App)

  app.use(createPiniaProvider())
  app.use(router)
  app.use(VueQueryPlugin, vueQueryOptions)
  app.use(PrimeVue, primeVueOptions)

  app.mount(selector)

  return app
}
