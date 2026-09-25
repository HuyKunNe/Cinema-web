import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import { createPiniaProvider } from './providers/pinia'
import { primeVueOptions } from './providers/primevue'
import { vueQueryOptions } from './providers/vue-query'
import router from './router'
import { installAuthRouteGuard } from './router/auth-route-guard'
import { installAuthSessionLifecycle } from './router/auth-session-lifecycle'
import { getOidcAccessToken } from '@/modules/auth/services/oidc.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { configureApiHttpClient } from '@/shared/api/http-client'

export function bootstrapApplication(selector = '#app') {
  const app = createApp(App)
  const pinia = createPiniaProvider()
  const authStore = useAuthStore(pinia)

  configureApiHttpClient({
    getAccessToken: getOidcAccessToken,

    onUnauthorized: () => {
      authStore.markExpired()
    },
  })
  installAuthRouteGuard(router, pinia)

  app.use(pinia)
  app.use(router)
  app.use(VueQueryPlugin, vueQueryOptions)
  app.use(PrimeVue, primeVueOptions)

  installAuthSessionLifecycle(router, pinia)

  app.mount(selector)

  return app
}
