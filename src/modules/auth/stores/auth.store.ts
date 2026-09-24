import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from 'oidc-client-ts'

import { getOidcUserManager } from '@/modules/auth/services/oidc.service'
import type { AuthenticationStatus, AuthIdentity } from '@/modules/auth/types/auth.types'

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
  const errorMessage = ref<string | null>(null)

  const isInitialized = computed(() => status.value !== 'idle' && status.value !== 'loading')
  const isLoading = computed(() => status.value === 'loading')
  const isAuthenticated = computed(() => status.value === 'authenticated')

  let initializationPromise: Promise<void> | null = null

  function applyOidcUser(user: User | null): void {
    errorMessage.value = null

    if (!user) {
      identity.value = null
      status.value = 'anonymous'
      return
    }

    if (user.expired === true) {
      identity.value = null
      status.value = 'expired'
      return
    }

    identity.value = toAuthIdentity(user)
    status.value = 'authenticated'
  }

  function markAnonymous(): void {
    identity.value = null
    errorMessage.value = null
    status.value = 'anonymous'
  }

  async function restoreSession(): Promise<void> {
    status.value = 'loading'
    errorMessage.value = null

    try {
      const user = await getOidcUserManager().getUser()
      applyOidcUser(user)
    } catch {
      identity.value = null
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
    errorMessage,
    isInitialized,
    isLoading,
    isAuthenticated,
    initialize,
    applyOidcUser,
    markAnonymous,
  }
})
