import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from 'oidc-client-ts'

import {
  getOidcUserManager,
  subscribeToAccessTokenExpired,
} from '@/modules/auth/services/oidc.service'
import type { AuthenticationStatus, AuthIdentity } from '@/modules/auth/types/auth.types'
import { readAccessTokenAuthorization } from '@/modules/auth/utils/access-token-claims'

const SESSION_RESTORE_ERROR = 'Không thể khôi phục phiên đăng nhập.'

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function toAuthIdentity(user: User): AuthIdentity {
  const name = optionalString(user.profile.name)
  const username = optionalString(user.profile.preferred_username)
  const email = optionalString(user.profile.email)

  return {
    subject: user.profile.sub,
    displayName: name ?? username ?? email,
    email,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const status = ref<AuthenticationStatus>('idle')
  const identity = ref<AuthIdentity | null>(null)
  const roles = ref<readonly string[]>([])
  const permissions = ref<readonly string[]>([])
  const errorMessage = ref<string | null>(null)

  const isInitialized = computed(() => status.value !== 'idle' && status.value !== 'loading')
  const isLoading = computed(() => status.value === 'loading')
  const isAuthenticated = computed(() => status.value === 'authenticated')

  let initializationPromise: Promise<void> | null = null
  let unsubscribeAccessTokenExpired: (() => void) | null = null

  function clearAuthorization(): void {
    roles.value = []
    permissions.value = []
  }

  function markExpired(): void {
    identity.value = null
    clearAuthorization()
    errorMessage.value = null
    status.value = 'expired'
  }

  function ensureOidcLifecycleSubscription(): void {
    if (unsubscribeAccessTokenExpired) {
      return
    }

    unsubscribeAccessTokenExpired = subscribeToAccessTokenExpired(markExpired)
  }

  function applyOidcUser(user: User | null): void {
    errorMessage.value = null

    if (!user) {
      identity.value = null
      clearAuthorization()
      status.value = 'anonymous'
      return
    }

    ensureOidcLifecycleSubscription()

    if (user.expired === true) {
      markExpired()
      return
    }

    const authorization = readAccessTokenAuthorization(user.access_token)

    identity.value = toAuthIdentity(user)
    roles.value = authorization.roles
    permissions.value = authorization.permissions
    status.value = 'authenticated'
  }

  function markAnonymous(): void {
    identity.value = null
    clearAuthorization()
    errorMessage.value = null
    status.value = 'anonymous'
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  async function restoreSession(): Promise<void> {
    status.value = 'loading'
    errorMessage.value = null

    try {
      ensureOidcLifecycleSubscription()

      const user = await getOidcUserManager().getUser()

      applyOidcUser(user)
    } catch {
      identity.value = null
      clearAuthorization()
      status.value = 'error'
      errorMessage.value = SESSION_RESTORE_ERROR
    }
  }

  function initialize(): Promise<void> {
    if (isInitialized.value && status.value !== 'error') {
      return Promise.resolve()
    }

    initializationPromise ??= restoreSession().finally(() => {
      initializationPromise = null
    })

    return initializationPromise
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
    markExpired,
    hasRole,
    hasPermission,
  }
})
