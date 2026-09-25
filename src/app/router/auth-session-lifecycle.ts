import type { Pinia } from 'pinia'
import { watch, type WatchStopHandle } from 'vue'
import type { Router } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { normalizeReturnUrl } from '@/modules/auth/utils/auth-return-url'

export function installAuthSessionLifecycle(router: Router, pinia: Pinia): WatchStopHandle {
  const authStore = useAuthStore(pinia)

  return watch(
    [() => authStore.status, () => router.currentRoute.value.fullPath],
    ([status]) => {
      if (status !== 'expired') {
        return
      }

      const route = router.currentRoute.value

      if (route.name === 'session-expired') {
        return
      }

      if (route.meta.requiresAuth !== true) {
        return
      }

      const returnUrl = normalizeReturnUrl(route.fullPath)

      void router
        .replace({
          name: 'session-expired',
          query: {
            returnUrl,
          },
        })
        .catch(() => undefined)
    },
    {
      flush: 'post',
    },
  )
}
