import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiClientError, movieApi } from '@/shared/api'

import MovieCatalogPage from './MovieCatalogPage.vue'

vi.mock('@/shared/api', async () => {
  const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api')

  return {
    ...actual,

    movieApi: {
      ...actual.movieApi,

      listMovies: vi.fn(),
    },
  }
})

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

function mountPage() {
  const queryClient = createQueryClient()

  const wrapper = mount(MovieCatalogPage, {
    global: {
      plugins: [
        [
          VueQueryPlugin,
          {
            queryClient,
          },
        ],
      ],
    },
  })

  return {
    wrapper,
    queryClient,
  }
}

describe('MovieCatalogPage', () => {
  beforeEach(() => {
    vi.mocked(movieApi.listMovies).mockReset()
  })

  it('renders movies returned by the catalog query', async () => {
    vi.mocked(movieApi.listMovies).mockResolvedValue([
      {
        id: 'movie-1',
        title: 'Phim A',

        status: movieApi.MovieResponseStatus.NOW_SHOWING,
      },

      {
        id: 'movie-2',
        title: 'Phim B',

        status: movieApi.MovieResponseStatus.UPCOMING,
      },
    ])

    const { wrapper } = mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('Phim A')

    expect(wrapper.text()).toContain('Phim B')

    wrapper.unmount()
  })

  it('renders the empty state', async () => {
    vi.mocked(movieApi.listMovies).mockResolvedValue([])

    const { wrapper } = mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('Chưa có phim')

    wrapper.unmount()
  })

  it('renders normalized API errors and request ID', async () => {
    vi.mocked(movieApi.listMovies).mockRejectedValue(
      new ApiClientError({
        kind: 'http',
        status: 503,
        message: 'Hệ thống tạm thời không thể xử lý yêu cầu.',
        requestId: 'request-movie-123',
      }),
    )

    const { wrapper } = mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('Không thể tải danh sách phim')

    expect(wrapper.text()).toContain('request-movie-123')

    expect(wrapper.get('button').text()).toContain('Thử lại')

    wrapper.unmount()
  })
})
