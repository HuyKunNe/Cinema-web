import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiClientError, inventoryApi, movieApi } from '@/shared/api'
import { createTestRouter } from '@/test/create-test-router'

import MovieDetailPage from './MovieDetailPage.vue'

vi.mock('@/shared/api', async () => {
  const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api')

  return {
    ...actual,

    movieApi: {
      ...actual.movieApi,
      getMovieById: vi.fn(),
    },

    inventoryApi: {
      ...actual.inventoryApi,
      listShowtimesByMovie: vi.fn(),
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

async function mountPage() {
  const router = await createTestRouter('/movies/movie-123')

  const queryClient = createQueryClient()

  const wrapper = mount(MovieDetailPage, {
    global: {
      plugins: [
        router,

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
    router,
    queryClient,
  }
}

describe('MovieDetailPage', () => {
  beforeEach(() => {
    vi.mocked(movieApi.getMovieById).mockReset()

    vi.mocked(inventoryApi.listShowtimesByMovie).mockReset()
  })

  it('renders movie detail and showtimes', async () => {
    vi.mocked(movieApi.getMovieById).mockResolvedValue({
      id: 'movie-123',
      title: 'Cinema Test',
      description: 'Mô tả phim.',
      durationMinutes: 120,

      status: movieApi.MovieResponseStatus.NOW_SHOWING,
    })

    vi.mocked(inventoryApi.listShowtimesByMovie).mockResolvedValue([
      {
        id: 'showtime-1',
        movieId: 'movie-123',
        cinemaId: 'cinema-1',
        cinemaName: 'Cinema A',
        roomName: 'Phòng 1',

        startsAt: '2099-10-01T19:30:00+07:00',

        status: inventoryApi.ShowtimeResponseStatus.OPEN_FOR_BOOKING,
      },
    ])

    const { wrapper } = await mountPage()

    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Cinema Test')

    expect(wrapper.text()).toContain('Cinema A')

    expect(wrapper.text()).toContain('Phòng 1')

    expect(wrapper.text()).toContain('19:30')

    wrapper.unmount()
  })

  it('renders a movie not found state', async () => {
    vi.mocked(movieApi.getMovieById).mockRejectedValue(
      new ApiClientError({
        kind: 'http',
        status: 404,
        message: 'Not found',
      }),
    )

    vi.mocked(inventoryApi.listShowtimesByMovie).mockResolvedValue([])

    const { wrapper } = await mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('Không tìm thấy phim')

    wrapper.unmount()
  })

  it('keeps movie detail visible when showtimes fail', async () => {
    vi.mocked(movieApi.getMovieById).mockResolvedValue({
      id: 'movie-123',
      title: 'Cinema Test',
    })

    vi.mocked(inventoryApi.listShowtimesByMovie).mockRejectedValue(
      new ApiClientError({
        kind: 'http',
        status: 503,
        message: 'Không thể tải lịch chiếu.',
        requestId: 'showtime-request-1',
      }),
    )

    const { wrapper } = await mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('Cinema Test')

    expect(wrapper.text()).toContain('Không thể tải lịch chiếu')

    expect(wrapper.text()).toContain('showtime-request-1')

    wrapper.unmount()
  })
})
