import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { createTestRouter } from '@/test/create-test-router'

import CustomerHeader from './CustomerHeader.vue'

describe('CustomerHeader', () => {
  it('renders customer navigation and login link', async () => {
    const router = await createTestRouter()

    const wrapper = mount(CustomerHeader, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    const navigation = wrapper.get('nav[aria-label="Điều hướng chính"]')

    expect(navigation.findAll('a').map((link) => link.text())).toEqual([
      'Phim',
      'Lịch chiếu',
      'Vé của tôi',
    ])

    expect(wrapper.get('a[aria-label="Cinema - Trang chủ"]').attributes('href')).toBe('/')

    expect(wrapper.get('a[href="/auth/login"]').text()).toBe('Đăng nhập')

    wrapper.unmount()
  })

  it('marks the current customer route', async () => {
    const router = await createTestRouter('/showtimes')

    const wrapper = mount(CustomerHeader, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.get('a[href="/showtimes"]').attributes('aria-current')).toBe('page')

    expect(wrapper.get('a[href="/movies"]').attributes('aria-current')).toBeUndefined()

    wrapper.unmount()
  })
})
