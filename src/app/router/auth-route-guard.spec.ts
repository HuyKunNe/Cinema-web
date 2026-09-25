import { createPinia } from 'pinia'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'

import {
  ADMIN_AREA_ROLES,
  AUTH_PERMISSIONS,
  AUTH_ROLES,
} from '@/modules/auth/constants/authorization.constants'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

import { installAuthRouteGuard } from './auth-route-guard'

const TestPage = defineComponent({
  template: '<div>Test page</div>',
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: TestPage,
  },
  {
    path: '/bookings',
    name: 'bookings',
    component: TestPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/auth/login',
    name: 'login',
    component: TestPage,
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/auth/session-expired',
    name: 'session-expired',
    component: TestPage,
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: TestPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/admin',
    component: TestPage,
    meta: {
      requiresAuth: true,
      requiredRoles: ADMIN_AREA_ROLES,
    },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: TestPage,
      },
      {
        path: 'movies',
        name: 'admin-movies',
        component: TestPage,
        meta: {
          requiredPermissions: [AUTH_PERMISSIONS.MOVIE_MANAGE],
        },
      },
      {
        path: 'bookings',
        name: 'admin-bookings',
        component: TestPage,
        meta: {
          requiredPermissions: [AUTH_PERMISSIONS.BOOKING_READ],
        },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: TestPage,
        meta: {
          requiredPermissions: [AUTH_PERMISSIONS.USER_MANAGE],
        },
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: TestPage,
        meta: {
          requiredRoles: [AUTH_ROLES.ADMIN],
        },
      },
    ],
  },
]

function createGuardedRouter() {
  const pinia = createPinia()

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  installAuthRouteGuard(router, pinia)

  return {
    router,
    authStore: useAuthStore(pinia),
  }
}

function authenticate(
  authStore: ReturnType<typeof useAuthStore>,
  roles: readonly string[],
  permissions: readonly string[] = [],
): void {
  authStore.$patch({
    status: 'authenticated',
    roles: [...roles],
    permissions: [...permissions],
  })
}

describe('auth route guard', () => {
  it('allows public routes without authentication', async () => {
    const { router } = createGuardedRouter()

    await router.push('/')

    expect(router.currentRoute.value.name).toBe('home')
  })

  it('redirects an anonymous user to login with a return URL', async () => {
    const { router, authStore } = createGuardedRouter()

    authStore.markAnonymous()

    await router.push('/bookings')

    expect(router.currentRoute.value.name).toBe('login')

    expect(router.currentRoute.value.query).toEqual({
      returnUrl: '/bookings',
    })
  })

  it('redirects an expired session to the session-expired page', async () => {
    const { router, authStore } = createGuardedRouter()

    authStore.markExpired()

    await router.push('/bookings')

    expect(router.currentRoute.value.name).toBe('session-expired')

    expect(router.currentRoute.value.query).toEqual({
      returnUrl: '/bookings',
    })
  })

  it('allows an authenticated user to access a protected customer route', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.USER])

    await router.push('/bookings')

    expect(router.currentRoute.value.name).toBe('bookings')
  })

  it('redirects an authenticated user away from a guest-only route', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.USER])

    await router.push('/auth/login?returnUrl=/bookings')

    expect(router.currentRoute.value.name).toBe('bookings')
  })

  it('keeps an anonymous user on a guest-only route', async () => {
    const { router, authStore } = createGuardedRouter()

    authStore.markAnonymous()

    await router.push('/auth/login')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('denies a USER from entering the admin area even when the user has booking:read', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.USER], [AUTH_PERMISSIONS.BOOKING_READ])

    await router.push('/admin/bookings')

    expect(router.currentRoute.value.name).toBe('forbidden')
  })

  it('allows STAFF into the admin area when the required permission is present', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.STAFF], [AUTH_PERMISSIONS.MOVIE_MANAGE])

    await router.push('/admin/movies')

    expect(router.currentRoute.value.name).toBe('admin-movies')
  })

  it('denies STAFF when the required permission is missing', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.STAFF], [AUTH_PERMISSIONS.BOOKING_READ])

    await router.push('/admin/movies')

    expect(router.currentRoute.value.name).toBe('forbidden')
  })

  it('denies STAFF from an ADMIN-only route', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.STAFF])

    await router.push('/admin/settings')

    expect(router.currentRoute.value.name).toBe('forbidden')
  })

  it('allows ADMIN to access an ADMIN-only route', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.ADMIN])

    await router.push('/admin/settings')

    expect(router.currentRoute.value.name).toBe('admin-settings')
  })

  it('requires ADMIN to still have the permission required by a permission-aware route', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.ADMIN])

    await router.push('/admin/users')

    expect(router.currentRoute.value.name).toBe('forbidden')
  })

  it('allows ADMIN when the required permission is present', async () => {
    const { router, authStore } = createGuardedRouter()

    authenticate(authStore, [AUTH_ROLES.ADMIN], [AUTH_PERMISSIONS.USER_MANAGE])

    await router.push('/admin/users')

    expect(router.currentRoute.value.name).toBe('admin-users')
  })
})
