import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { AUTH_PERMISSIONS, AUTH_ROLES } from '@/modules/auth/constants/authorization.constants'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { createTestRouter } from '@/test/create-test-router'

import AdminSidebar from './AdminSidebar.vue'

function createAdminPinia() {
  const pinia = createPinia()
  const authStore = useAuthStore(pinia)

  authStore.$patch({
    status: 'authenticated',
    roles: [AUTH_ROLES.ADMIN],
    permissions: [
      AUTH_PERMISSIONS.BOOKING_CREATE,
      AUTH_PERMISSIONS.BOOKING_READ,
      AUTH_PERMISSIONS.BOOKING_CANCEL,
      AUTH_PERMISSIONS.MOVIE_MANAGE,
      AUTH_PERMISSIONS.SHOWTIME_MANAGE,
      AUTH_PERMISSIONS.INVENTORY_MANAGE,
      AUTH_PERMISSIONS.PAYMENT_READ,
      AUTH_PERMISSIONS.USER_MANAGE,
    ],
  })

  return pinia
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
