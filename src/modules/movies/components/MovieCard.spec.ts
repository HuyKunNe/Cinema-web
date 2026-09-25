import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { movieApi } from '@/shared/api'

import MovieCard from './MovieCard.vue'

describe('MovieCard', () => {
  it('renders movie metadata from the API contract', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: {
          id: 'movie-1',
          title: 'Cinema Test',
          description: 'Mô tả phim.',
          durationMinutes: 125,
          releaseDate: '2026-09-25',

          status: movieApi.MovieResponseStatus.NOW_SHOWING,

          genres: [
            {
              name: 'Hành động',
            },
            {
              name: 'Phiêu lưu',
            },
          ],
        },
      },
    })

    expect(wrapper.get('h2').text()).toBe('Cinema Test')

    expect(wrapper.text()).toContain('Đang chiếu')

    expect(wrapper.text()).toContain('125 phút')

    expect(wrapper.text()).toContain('Hành động · Phiêu lưu')
  })

  it('renders a poster fallback when posterUrl is missing', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: {
          title: 'Không poster',
        },
      },
    })

    expect(wrapper.text()).toContain('Chưa có poster')

    expect(wrapper.find('img').exists()).toBe(false)
  })
})
