import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { createTestRouter } from '@/test/create-test-router'

import CustomerHeader from './CustomerHeader.vue'

function createAnonymousPinia() {
  const pinia = createPinia()
  const authStore = useAuthStore(pinia)

  authStore.markAnonymous()

  return pinia
}

describe('CustomerHeader', () => {
  it('renders customer navigation and login button', async () => {
    const router = await createTestRouter()
    const pinia = createAnonymousPinia()

    const wrapper = mount(CustomerHeader, {
      global: {
        plugins: [pinia, router],
      },
    })

    const navigation = wrapper.get('nav[aria-label="Điều hướng chính"]')

    expect(navigation.findAll('a').map((link) => link.text())).toEqual([
      'Phim',
      'Lịch chiếu',
      'Vé của tôi',
    ])

    expect(wrapper.get('a[aria-label="Cinema - Trang chủ"]').attributes('href')).toBe('/')

    expect(wrapper.get('button').text()).toBe('Đăng nhập')

    wrapper.unmount()
  })

  it('marks the current customer route', async () => {
    const router = await createTestRouter('/showtimes')
    const pinia = createAnonymousPinia()

    const wrapper = mount(CustomerHeader, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.get('a[href="/showtimes"]').attributes('aria-current')).toBe('page')

    expect(wrapper.get('a[href="/movies"]').attributes('aria-current')).toBeUndefined()

    wrapper.unmount()
  })
})
