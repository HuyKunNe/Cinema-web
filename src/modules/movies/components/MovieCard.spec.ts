import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { movieApi } from '@/shared/api'

import MovieCard from './MovieCard.vue'

function mountMovieCard(movie: movieApi.MovieResponse) {
  return mount(MovieCard, {
    props: {
      movie,
    },

    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('MovieCard', () => {
  it('renders movie metadata from the API contract', () => {
    const wrapper = mountMovieCard({
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
    })

    expect(wrapper.get('h2').text()).toBe('Cinema Test')

    expect(wrapper.text()).toContain('Đang chiếu')

    expect(wrapper.text()).toContain('125 phút')

    expect(wrapper.text()).toContain('Hành động · Phiêu lưu')
  })

  it('renders a poster fallback when posterUrl is missing', () => {
    const wrapper = mountMovieCard({
      title: 'Không poster',
    })

    expect(wrapper.text()).toContain('Chưa có poster')

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('links movies with an ID to their detail route', () => {
    const wrapper = mountMovieCard({
      id: 'movie-123',
      title: 'Cinema Test',
    })

    const link = wrapper.getComponent(RouterLinkStub)

    expect(link.props('to')).toEqual({
      name: 'movie-detail',
      params: {
        movieId: 'movie-123',
      },
    })
  })
})
