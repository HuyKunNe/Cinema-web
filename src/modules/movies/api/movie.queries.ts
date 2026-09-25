import { queryOptions } from '@tanstack/vue-query'

import { movieApi } from '@/shared/api'

export const movieQueryKeys = {
  all: ['movie'] as const,

  lists: () => [...movieQueryKeys.all, 'list'] as const,

  list: () => [...movieQueryKeys.lists()] as const,

  details: () => [...movieQueryKeys.all, 'detail'] as const,

  detail: (movieId: string) => [...movieQueryKeys.details(), movieId] as const,
}

export const movieQueries = {
  list: () =>
    queryOptions({
      queryKey: movieQueryKeys.list(),
      queryFn: () => movieApi.listMovies(),
    }),

  detail: (movieId: string) =>
    queryOptions({
      queryKey: movieQueryKeys.detail(movieId),

      queryFn: () => movieApi.getMovieById(movieId),
    }),
}
