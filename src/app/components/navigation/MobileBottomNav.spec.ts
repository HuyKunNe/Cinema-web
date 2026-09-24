import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createTestRouter } from '@/test/create-test-router'

import MobileBottomNav from './MobileBottomNav.vue'

describe('MobileBottomNav', () => {
  it('renders the four mobile navigation destinations', async () => {
    const router = await createTestRouter()

    const wrapper = mount(MobileBottomNav, {
      global: {
        plugins: [router],
      },
    })

    const navigation = wrapper.get('nav[aria-label="Điều hướng trên thiết bị di động"]')

    expect(navigation.findAll('a').map((link) => link.text())).toEqual([
      'Trang chủ',
      'Lịch chiếu',
      'Vé của tôi',
      'Tài khoản',
    ])

    wrapper.unmount()
  })

  it('uses exact active state for the home route', async () => {
    const router = await createTestRouter('/showtimes')

    const wrapper = mount(MobileBottomNav, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.get('a[href="/showtimes"]').attributes('aria-current')).toBe('page')

    expect(wrapper.get('a[href="/"]').attributes('aria-current')).toBeUndefined()

    wrapper.unmount()
  })
})
