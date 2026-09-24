import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createTestRouter } from '@/test/create-test-router'

import AdminSidebar from './AdminSidebar.vue'

describe('AdminSidebar', () => {
  it('marks only the current admin route', async () => {
    const router = await createTestRouter('/admin/settings')

    const wrapper = mount(AdminSidebar, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.get('a[href="/admin/settings"]').attributes('aria-current')).toBe('page')

    expect(wrapper.get('a[href="/admin"]').attributes('aria-current')).toBeUndefined()

    wrapper.unmount()
  })

  it('exposes dialog semantics when used as a mobile drawer', async () => {
    const router = await createTestRouter('/admin')

    const wrapper = mount(AdminSidebar, {
      props: {
        closable: true,
      },

      global: {
        plugins: [router],
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

    const wrapper = mount(AdminSidebar, {
      attachTo: document.body,

      props: {
        closable: true,
      },

      global: {
        plugins: [router],
      },
    })

    await nextTick()

    const closeButton = wrapper.get('button[aria-label="Đóng menu quản trị"]')

    expect(document.activeElement).toBe(closeButton.element)

    wrapper.unmount()
  })
})
