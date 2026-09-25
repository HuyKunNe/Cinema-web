import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { AUTH_PERMISSIONS, AUTH_ROLES } from '@/modules/auth/constants/authorization.constants'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { createTestRouter } from '@/test/create-test-router'

import AdminSidebar from './AdminSidebar.vue'

function createAuthenticatedPinia(roles: readonly string[], permissions: readonly string[] = []) {
  const pinia = createPinia()
  const authStore = useAuthStore(pinia)

  authStore.$patch({
    status: 'authenticated',
    roles: [...roles],
    permissions: [...permissions],
  })

  return pinia
}

function createAdminPinia() {
  return createAuthenticatedPinia(
    [AUTH_ROLES.ADMIN],
    [
      AUTH_PERMISSIONS.BOOKING_CREATE,
      AUTH_PERMISSIONS.BOOKING_READ,
      AUTH_PERMISSIONS.BOOKING_CANCEL,
      AUTH_PERMISSIONS.MOVIE_MANAGE,
      AUTH_PERMISSIONS.SHOWTIME_MANAGE,
      AUTH_PERMISSIONS.INVENTORY_MANAGE,
      AUTH_PERMISSIONS.PAYMENT_READ,
      AUTH_PERMISSIONS.USER_MANAGE,
    ],
  )
}

function getAdminNavigationLabels(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper
    .get('nav[aria-label="Điều hướng quản trị"]')
    .findAll('a')
    .map((link) => link.text().trim())
}

describe('AdminSidebar', () => {
  it('marks only the current admin route', async () => {
    const router = await createTestRouter('/admin/settings')
    const pinia = createAdminPinia()

    const wrapper = mount(AdminSidebar, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.get('a[href="/admin/settings"]').attributes('aria-current')).toBe('page')

    expect(wrapper.get('a[href="/admin"]').attributes('aria-current')).toBeUndefined()

    wrapper.unmount()
  })

  it('shows every admin navigation item for ADMIN with all required permissions', async () => {
    const router = await createTestRouter('/admin')
    const pinia = createAdminPinia()

    const wrapper = mount(AdminSidebar, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(getAdminNavigationLabels(wrapper)).toEqual([
      'Tổng quan',
      'Phim',
      'Rạp',
      'Phòng chiếu',
      'Sơ đồ ghế',
      'Suất chiếu',
      'Đặt vé',
      'Thanh toán',
      'Người dùng',
      'Khuyến mãi',
      'Cấu hình',
    ])

    wrapper.unmount()
  })

  it('shows only permitted admin navigation items for STAFF', async () => {
    const router = await createTestRouter('/admin')

    const pinia = createAuthenticatedPinia(
      [AUTH_ROLES.STAFF],
      [
        AUTH_PERMISSIONS.BOOKING_READ,
        AUTH_PERMISSIONS.BOOKING_CANCEL,
        AUTH_PERMISSIONS.MOVIE_MANAGE,
        AUTH_PERMISSIONS.SHOWTIME_MANAGE,
        AUTH_PERMISSIONS.INVENTORY_MANAGE,
        AUTH_PERMISSIONS.PAYMENT_READ,
      ],
    )

    const wrapper = mount(AdminSidebar, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(getAdminNavigationLabels(wrapper)).toEqual([
      'Tổng quan',
      'Phim',
      'Rạp',
      'Phòng chiếu',
      'Sơ đồ ghế',
      'Suất chiếu',
      'Đặt vé',
      'Thanh toán',
    ])

    expect(wrapper.find('a[href="/admin/users"]').exists()).toBe(false)
    expect(wrapper.find('a[href="/admin/promotions"]').exists()).toBe(false)
    expect(wrapper.find('a[href="/admin/settings"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('hides the admin navigation from USER even when booking:read is present', async () => {
    const router = await createTestRouter('/admin')

    const pinia = createAuthenticatedPinia([AUTH_ROLES.USER], [AUTH_PERMISSIONS.BOOKING_READ])

    const wrapper = mount(AdminSidebar, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(getAdminNavigationLabels(wrapper)).toEqual([])

    expect(wrapper.find('a[href="/admin/bookings"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('hides a STAFF menu item when its required permission is missing', async () => {
    const router = await createTestRouter('/admin')

    const pinia = createAuthenticatedPinia(
      [AUTH_ROLES.STAFF],
      [AUTH_PERMISSIONS.BOOKING_READ, AUTH_PERMISSIONS.PAYMENT_READ],
    )

    const wrapper = mount(AdminSidebar, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(getAdminNavigationLabels(wrapper)).toEqual(['Tổng quan', 'Đặt vé', 'Thanh toán'])

    expect(wrapper.find('a[href="/admin/movies"]').exists()).toBe(false)
    expect(wrapper.find('a[href="/admin/showtimes"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('exposes dialog semantics when used as a mobile drawer', async () => {
    const router = await createTestRouter('/admin')
    const pinia = createAdminPinia()

    const wrapper = mount(AdminSidebar, {
      props: {
        closable: true,
      },

      global: {
        plugins: [pinia, router],
      },
    })

    const sidebar = wrapper.get('aside')

    expect(sidebar.attributes('role')).toBe('dialog')
    expect(sidebar.attributes('aria-modal')).toBe('true')

    await wrapper.get('button[aria-label="Đóng menu quản trị"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })

  it('focuses the close button when the mobile drawer opens', async () => {
    const router = await createTestRouter('/admin')
    const pinia = createAdminPinia()

    const wrapper = mount(AdminSidebar, {
      attachTo: document.body,

      props: {
        closable: true,
      },

      global: {
        plugins: [pinia, router],
      },
    })

    await nextTick()

    const closeButton = wrapper.get('button[aria-label="Đóng menu quản trị"]')

    expect(document.activeElement).toBe(closeButton.element)

    wrapper.unmount()
  })
})
