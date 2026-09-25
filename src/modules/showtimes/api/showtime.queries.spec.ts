import { describe, expect, it } from 'vitest'

import { showtimeQueries, showtimeQueryKeys } from './showtime.queries'

describe('showtime queries', () => {
  it('creates a detail query key', () => {
    expect(showtimeQueryKeys.detail('showtime-123')).toEqual(['showtime', 'detail', 'showtime-123'])
  })

  it('creates a movie showtime query key', () => {
    expect(showtimeQueryKeys.byMovie('movie-123')).toEqual(['showtime', 'by-movie', 'movie-123'])
  })

  it('creates a deterministic time-range query key', () => {
    expect(
      showtimeQueryKeys.timeRange({
        from: '2026-09-25T00:00:00Z',
        to: '2026-09-26T00:00:00Z',
      }),
    ).toEqual([
      'showtime',
      'time-range',
      {
        from: '2026-09-25T00:00:00Z',
        to: '2026-09-26T00:00:00Z',
      },
    ])
  })

  it('binds showtime by movie to the same key', () => {
    const options = showtimeQueries.byMovie('movie-123')

    expect(options.queryKey).toEqual(['showtime', 'by-movie', 'movie-123'])
  })
})
