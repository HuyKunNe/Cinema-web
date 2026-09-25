import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'

import {
  ADMIN_AREA_ROLES,
  AUTH_PERMISSIONS,
  AUTH_ROLES,
} from '@/modules/auth/constants/authorization.constants'

import { createAppRouter } from './index'

const routeCases = [
  ['/', 'home', 'Trang chủ | Cinema'],
  ['/movies', 'movies', 'Phim | Cinema'],
  ['/showtimes', 'showtimes', 'Lịch chiếu | Cinema'],
  ['/bookings', 'bookings', 'Vé của tôi | Cinema'],

  ['/admin', 'admin-dashboard', 'Tổng quan quản trị | Cinema'],
  ['/admin/movies', 'admin-movies', 'Quản lý phim | Cinema'],
  ['/admin/cinemas', 'admin-cinemas', 'Quản lý rạp | Cinema'],
  ['/admin/rooms', 'admin-rooms', 'Quản lý phòng chiếu | Cinema'],
  ['/admin/seat-layouts', 'admin-seat-layouts', 'Sơ đồ ghế | Cinema'],
  ['/admin/showtimes', 'admin-showtimes', 'Quản lý suất chiếu | Cinema'],
  ['/admin/bookings', 'admin-bookings', 'Quản lý đặt vé | Cinema'],
  ['/admin/payments', 'admin-payments', 'Quản lý thanh toán | Cinema'],
  ['/admin/users', 'admin-users', 'Quản lý người dùng | Cinema'],
  ['/admin/promotions', 'admin-promotions', 'Quản lý khuyến mãi | Cinema'],
  ['/admin/settings', 'admin-settings', 'Cấu hình hệ thống | Cinema'],

  ['/auth/login', 'login', 'Đăng nhập | Cinema'],
  ['/auth/callback', 'oidc-callback', 'Đang đăng nhập | Cinema'],
  ['/auth/session-expired', 'session-expired', 'Phiên đăng nhập đã hết hạn | Cinema'],

  ['/forbidden', 'forbidden', 'Không có quyền truy cập | Cinema'],

  ['/duong-dan-khong-ton-tai', 'not-found', 'Không tìm thấy trang | Cinema'],

  ['/movies/movie-123', 'movie-detail', 'Chi tiết phim | Cinema'],

  ['/showtimes/showtime-123/seats', 'showtime-seats', 'Chọn ghế | Cinema'],
] as const

describe('application router', () => {
  beforeEach(() => {
    document.title = ''
  })

  it.each(routeCases)(
    'resolves %s to route %s',
    async (path, expectedRouteName, expectedDocumentTitle) => {
      const router = createAppRouter(createMemoryHistory())

      await router.push(path)
      await router.isReady()

      expect(router.currentRoute.value.name).toBe(expectedRouteName)
      expect(document.title).toBe(expectedDocumentTitle)
    },
  )

  it('protects the customer bookings route with authentication', () => {
    const router = createAppRouter(createMemoryHistory())
    const route = router.resolve('/bookings')

    expect(route.meta.requiresAuth).toBe(true)
    expect(route.meta.requiredRoles).toBeUndefined()
    expect(route.meta.requiredPermissions).toBeUndefined()
  })

  it('protects the admin dashboard with admin-area roles', () => {
    const router = createAppRouter(createMemoryHistory())
    const route = router.resolve('/admin')

    expect(route.meta.requiresAuth).toBe(true)
    expect(route.meta.requiredRoles).toEqual(ADMIN_AREA_ROLES)
    expect(route.meta.requiredPermissions).toBeUndefined()
  })

  it('merges admin-area roles with movie permission requirements', () => {
    const router = createAppRouter(createMemoryHistory())
    const route = router.resolve('/admin/movies')

    expect(route.meta.requiresAuth).toBe(true)
    expect(route.meta.requiredRoles).toEqual(ADMIN_AREA_ROLES)

    expect(route.meta.requiredPermissions).toEqual([AUTH_PERMISSIONS.MOVIE_MANAGE])
  })

  it('requires inventory permission for inventory administration routes', () => {
    const router = createAppRouter(createMemoryHistory())

    const paths = ['/admin/cinemas', '/admin/rooms', '/admin/seat-layouts']

    for (const path of paths) {
      const route = router.resolve(path)

      expect(route.meta.requiresAuth).toBe(true)
      expect(route.meta.requiredRoles).toEqual(ADMIN_AREA_ROLES)

      expect(route.meta.requiredPermissions).toEqual([AUTH_PERMISSIONS.INVENTORY_MANAGE])
    }
  })

  it('requires the expected permission for operational admin routes', () => {
    const router = createAppRouter(createMemoryHistory())

    const cases = [
      ['/admin/showtimes', AUTH_PERMISSIONS.SHOWTIME_MANAGE],
      ['/admin/bookings', AUTH_PERMISSIONS.BOOKING_READ],
      ['/admin/payments', AUTH_PERMISSIONS.PAYMENT_READ],
      ['/admin/users', AUTH_PERMISSIONS.USER_MANAGE],
    ] as const

    for (const [path, permission] of cases) {
      const route = router.resolve(path)

      expect(route.meta.requiresAuth).toBe(true)
      expect(route.meta.requiredRoles).toEqual(ADMIN_AREA_ROLES)
      expect(route.meta.requiredPermissions).toEqual([permission])
    }
  })

  it('restricts settings and promotions to ADMIN', () => {
    const router = createAppRouter(createMemoryHistory())

    for (const path of ['/admin/promotions', '/admin/settings']) {
      const route = router.resolve(path)

      expect(route.meta.requiresAuth).toBe(true)

      expect(route.meta.requiredRoles).toEqual([AUTH_ROLES.ADMIN])

      expect(route.meta.requiredPermissions).toBeUndefined()
    }
  })

  it('keeps authentication protocol routes free from protected-route metadata', () => {
    const router = createAppRouter(createMemoryHistory())
    const callbackRoute = router.resolve('/auth/callback')

    expect(callbackRoute.meta.requiresAuth).toBeUndefined()
    expect(callbackRoute.meta.guestOnly).toBeUndefined()
    expect(callbackRoute.meta.requiredRoles).toBeUndefined()
    expect(callbackRoute.meta.requiredPermissions).toBeUndefined()
  })

  it('marks login and session-expired routes as guest-only', () => {
    const router = createAppRouter(createMemoryHistory())

    for (const path of ['/auth/login', '/auth/session-expired']) {
      const route = router.resolve(path)

      expect(route.meta.guestOnly).toBe(true)
      expect(route.meta.requiresAuth).toBeUndefined()
    }
  })

  it('protects the forbidden page from anonymous access', () => {
    const router = createAppRouter(createMemoryHistory())
    const route = router.resolve('/forbidden')

    expect(route.meta.requiresAuth).toBe(true)
    expect(route.meta.requiredRoles).toBeUndefined()
    expect(route.meta.requiredPermissions).toBeUndefined()
  })

  it('restores the default scroll position', () => {
    const router = createAppRouter(createMemoryHistory())
    const scrollBehavior = router.options.scrollBehavior

    expect(scrollBehavior).toBeTypeOf('function')
  })

  it('protects seat selection with booking create permission', () => {
    const router = createAppRouter(createMemoryHistory())

    const route = router.resolve('/showtimes/showtime-123/seats')

    expect(route.meta.requiresAuth).toBe(true)

    expect(route.meta.requiredPermissions).toEqual([AUTH_PERMISSIONS.BOOKING_CREATE])
  })
})
