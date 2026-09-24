import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'

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

  ['/duong-dan-khong-ton-tai', 'not-found', 'Không tìm thấy trang | Cinema'],
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

  it('restores the default scroll position', () => {
    const router = createAppRouter(createMemoryHistory())
    const scrollBehavior = router.options.scrollBehavior

    expect(scrollBehavior).toBeTypeOf('function')
  })
})
