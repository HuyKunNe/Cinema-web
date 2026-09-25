import { queryOptions } from '@tanstack/vue-query'

import { inventoryApi } from '@/shared/api'

export const showtimeQueryKeys = {
  all: ['showtime'] as const,

  details: () => [...showtimeQueryKeys.all, 'detail'] as const,

  detail: (showtimeId: string) => [...showtimeQueryKeys.details(), showtimeId] as const,

  byMovie: (movieId: string) => [...showtimeQueryKeys.all, 'by-movie', movieId] as const,

  timeRanges: () => [...showtimeQueryKeys.all, 'time-range'] as const,

  timeRange: (params: inventoryApi.GetByTimeRangeParams) =>
    [
      ...showtimeQueryKeys.timeRanges(),
      {
        from: params.from,
        to: params.to,
      },
    ] as const,
}

export const showtimeQueries = {
  detail: (showtimeId: string) =>
    queryOptions({
      queryKey: showtimeQueryKeys.detail(showtimeId),

      queryFn: () => inventoryApi.getShowtimeById(showtimeId),
    }),

  byMovie: (movieId: string) =>
    queryOptions({
      queryKey: showtimeQueryKeys.byMovie(movieId),

      queryFn: () => inventoryApi.listShowtimesByMovie(movieId),
    }),

  timeRange: (params: inventoryApi.GetByTimeRangeParams) =>
    queryOptions({
      queryKey: showtimeQueryKeys.timeRange(params),

      queryFn: () => inventoryApi.listShowtimesByTimeRange(params),
    }),
}
