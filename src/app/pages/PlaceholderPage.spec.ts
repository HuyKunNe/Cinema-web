import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createTestRouter } from '@/test/create-test-router'

import PlaceholderPage from './PlaceholderPage.vue'

describe('PlaceholderPage', () => {
  it('renders the supplied content and return destination', async () => {
    const router = await createTestRouter('/admin/settings')

    const wrapper = mount(PlaceholderPage, {
      props: {
        eyebrow: 'Quản trị',
        title: 'Cấu hình hệ thống',
        description: 'Nội dung đang được phát triển.',
        backTo: '/admin',
        backLabel: 'Về tổng quan',
      },

      global: {
        plugins: [router],
      },
    })

    expect(wrapper.get('h1').text()).toBe('Cấu hình hệ thống')
    expect(wrapper.text()).toContain('Quản trị')
    expect(wrapper.text()).toContain('Nội dung đang được phát triển.')

    const returnLink = wrapper.get('a[href="/admin"]')

    expect(returnLink.text()).toBe('Về tổng quan')

    wrapper.unmount()
  })

  it('connects the section landmark with its heading', async () => {
    const router = await createTestRouter('/movies')

    const wrapper = mount(PlaceholderPage, {
      props: {
        title: 'Phim',
        description: 'Danh sách phim đang được phát triển.',
      },

      global: {
        plugins: [router],
      },
    })

    const section = wrapper.get('section')
    const heading = wrapper.get('h1')

    expect(section.attributes('aria-labelledby')).toBe(heading.attributes('id'))

    expect(wrapper.get('a[href="/"]').text()).toBe('Về trang chủ')

    wrapper.unmount()
  })
})
