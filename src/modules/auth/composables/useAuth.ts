import { storeToRefs } from 'pinia'
import type { User } from 'oidc-client-ts'

import {
  completeOidcSignIn,
  startOidcSignIn,
  startOidcSignOut,
} from '@/modules/auth/services/oidc.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { createSignInState, getReturnUrlFromState } from '@/modules/auth/utils/auth-return-url'

export function useAuth() {
  const authStore = useAuthStore()

  const {
    status,
    identity,
    roles,
    permissions,
    errorMessage,
    isInitialized,
    isLoading,
    isAuthenticated,
  } = storeToRefs(authStore)

  const initialize = () => authStore.initialize()
  const applyOidcUser = (user: User | null) => authStore.applyOidcUser(user)
  const markAnonymous = () => authStore.markAnonymous()

  const hasRole = (role: string) => authStore.hasRole(role)
  const hasPermission = (permission: string) => authStore.hasPermission(permission)

  const signIn = (returnUrl: unknown = '/') => startOidcSignIn(createSignInState(returnUrl))

  const completeSignIn = async (): Promise<string> => {
    const user = await completeOidcSignIn()

    authStore.applyOidcUser(user)

    return getReturnUrlFromState(user.state)
  }

  const signOut = async (): Promise<void> => {
    await startOidcSignOut()

    authStore.markAnonymous()
  }

  return {
    status,
    identity,
    roles,
    permissions,
    errorMessage,
    isInitialized,
    isLoading,
    isAuthenticated,
    initialize,
    applyOidcUser,
    markAnonymous,
    hasRole,
    hasPermission,
    signIn,
    completeSignIn,
    signOut,
  }
}

