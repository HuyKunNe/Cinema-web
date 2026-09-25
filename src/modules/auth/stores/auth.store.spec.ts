import { createPinia } from 'pinia'
import type { User } from 'oidc-client-ts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from './auth.store'

const oidcMocks = vi.hoisted(() => {
  let accessTokenExpiredListener: (() => void) | null = null

  return {
    getUser: vi.fn(),
    subscribeToAccessTokenExpired: vi.fn((listener: () => void) => {
      accessTokenExpiredListener = listener

      return vi.fn()
    }),
    getAccessTokenExpiredListener: () => accessTokenExpiredListener,
    resetAccessTokenExpiredListener: () => {
      accessTokenExpiredListener = null
    },
  }
})

vi.mock('@/modules/auth/services/oidc.service', () => ({
  getOidcUserManager: () => ({
    getUser: oidcMocks.getUser,
  }),

  subscribeToAccessTokenExpired: oidcMocks.subscribeToAccessTokenExpired,
}))

function encodeBase64Url(value: string): string {
  return window
    .btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function createAccessToken(payload: Record<string, unknown>): string {
  const header = encodeBase64Url(
    JSON.stringify({
      alg: 'none',
      typ: 'JWT',
    }),
  )

  const encodedPayload = encodeBase64Url(JSON.stringify(payload))

  return `${header}.${encodedPayload}.signature`
}

function createUser({
  expired = false,
  roles = ['ADMIN'],
  permissions = ['movie:manage', 'user:manage'],
}: {
  expired?: boolean
  roles?: readonly string[]
  permissions?: readonly string[]
} = {}): User {
  return {
    expired,
    access_token: createAccessToken({
      roles,
      permissions,
    }),

    profile: {
      sub: '019c3000-0000-7000-8000-000000000001',
      name: 'Local Admin',
      preferred_username: 'admin',
      email: 'admin@cinema.local',
    },
  } as unknown as User
}

describe('auth store', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    oidcMocks.resetAccessTokenExpiredListener()
  })

  it('applies an authenticated OIDC user and authorization claims', () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)

    authStore.applyOidcUser(
      createUser({
        roles: ['ADMIN'],
        permissions: ['user:manage', 'movie:manage'],
      }),
    )

    expect(authStore.status).toBe('authenticated')

    expect(authStore.identity).toEqual({
      subject: '019c3000-0000-7000-8000-000000000001',
      displayName: 'Local Admin',
      email: 'admin@cinema.local',
    })

    expect(authStore.roles).toEqual(['ADMIN'])

    expect(authStore.permissions).toEqual([
      'movie:manage',
      'user:manage',
    ])

    expect(authStore.isAuthenticated).toBe(true)

    expect(authStore.hasRole('ADMIN')).toBe(true)
    expect(authStore.hasRole('USER')).toBe(false)

    expect(authStore.hasPermission('movie:manage')).toBe(true)
    expect(authStore.hasPermission('payment:read')).toBe(false)
  })

  it('marks an already expired OIDC user as expired', () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)

    authStore.applyOidcUser(
      createUser({
        expired: true,
      }),
    )

    expect(authStore.status).toBe('expired')
    expect(authStore.identity).toBeNull()
    expect(authStore.roles).toEqual([])
    expect(authStore.permissions).toEqual([])
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('clears identity and authorization when marked anonymous', () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)

    authStore.applyOidcUser(createUser())

    expect(authStore.status).toBe('authenticated')
    expect(authStore.roles).toContain('ADMIN')

    authStore.markAnonymous()

    expect(authStore.status).toBe('anonymous')
    expect(authStore.identity).toBeNull()
    expect(authStore.roles).toEqual([])
    expect(authStore.permissions).toEqual([])
    expect(authStore.errorMessage).toBeNull()
  })

  it('clears identity and authorization when the access token expires', () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)

    authStore.applyOidcUser(createUser())

    const listener = oidcMocks.getAccessTokenExpiredListener()

    expect(listener).toBeTypeOf('function')

    listener?.()

    expect(authStore.status).toBe('expired')
    expect(authStore.identity).toBeNull()
    expect(authStore.roles).toEqual([])
    expect(authStore.permissions).toEqual([])
    expect(authStore.errorMessage).toBeNull()
  })

  it('restores an authenticated session from the OIDC user manager', async () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)

    oidcMocks.getUser.mockResolvedValueOnce(
      createUser({
        roles: ['STAFF'],
        permissions: [
          'booking:read',
          'movie:manage',
          'showtime:manage',
        ],
      }),
    )

    await authStore.initialize()

    expect(oidcMocks.getUser).toHaveBeenCalledTimes(1)

    expect(authStore.status).toBe('authenticated')
    expect(authStore.roles).toEqual(['STAFF'])

    expect(authStore.permissions).toEqual([
      'booking:read',
      'movie:manage',
      'showtime:manage',
    ])
  })

  it('restores an anonymous session when no managed OIDC user exists', async () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)

    oidcMocks.getUser.mockResolvedValueOnce(null)

    await authStore.initialize()

    expect(authStore.status).toBe('anonymous')
    expect(authStore.identity).toBeNull()
    expect(authStore.roles).toEqual([])
    expect(authStore.permissions).toEqual([])
  })

  it('does not restore the session again after initialization', async () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)

    oidcMocks.getUser.mockResolvedValueOnce(createUser())

    await authStore.initialize()
    await authStore.initialize()

    expect(oidcMocks.getUser).toHaveBeenCalledTimes(1)
  })

  it('clears authorization and exposes a safe error when session restore fails', async () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)

    authStore.$patch({
      status: 'error',
      roles: ['ADMIN'],
      permissions: ['user:manage'],
    })

    oidcMocks.getUser.mockRejectedValueOnce(
      new Error('raw provider failure containing secrets'),
    )

    await authStore.initialize()

    expect(authStore.status).toBe('error')
    expect(authStore.identity).toBeNull()
    expect(authStore.roles).toEqual([])
    expect(authStore.permissions).toEqual([])

    expect(authStore.errorMessage).toBe(
      'Không thể khôi phục phiên đăng nhập.',
    )

    expect(authStore.errorMessage).not.toContain(
      'raw provider failure',
    )
  })
})
