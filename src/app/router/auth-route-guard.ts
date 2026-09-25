import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { normalizeReturnUrl } from '@/modules/auth/utils/auth-return-url'

export function installAuthRouteGuard(router: Router, pinia: Pinia): () => void {
  const authStore = useAuthStore(pinia)

  return router.beforeEach(async (to) => {
    const requiredRoles = to.meta.requiredRoles ?? []
    const requiredPermissions = to.meta.requiredPermissions ?? []

    const requiresAuthorization = requiredRoles.length > 0 || requiredPermissions.length > 0

    const requiresAuth = to.meta.requiresAuth === true || requiresAuthorization

    const guestOnly = to.meta.guestOnly === true

    if (!requiresAuth && !guestOnly) {
      return true
    }

    await authStore.initialize()

    if (guestOnly) {
      if (authStore.status !== 'authenticated') {
        return true
      }

      return normalizeReturnUrl(to.query.returnUrl)
    }

    if (authStore.status !== 'authenticated') {
      const returnUrl = normalizeReturnUrl(to.fullPath)

      if (authStore.status === 'expired') {
        return {
          name: 'session-expired',
          query: {
            returnUrl,
          },
          replace: true,
        }
      }

      return {
        name: 'login',
        query: {
          returnUrl,
        },
        replace: true,
      }
    }

    const hasRequiredRole =
      requiredRoles.length === 0 || requiredRoles.some((role) => authStore.hasRole(role))

    if (!hasRequiredRole) {
      return {
        name: 'forbidden',
        replace: true,
      }
    }

    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      authStore.hasPermission(permission),
    )

    if (!hasRequiredPermissions) {
      return {
        name: 'forbidden',
        replace: true,
      }
    }

    return true
  })
}
