import type { ApiClientError } from '@/shared/api'

import '@tanstack/vue-query'

type ApiQueryDomain =
  | 'movie'
  | 'genre'
  | 'cinema'
  | 'room'
  | 'seat'
  | 'showtime'
  | 'show-seat'
  | 'booking'
  | 'user'
  | 'payment'

type ApiQueryKey = readonly [ApiQueryDomain, ...ReadonlyArray<unknown>]

declare module '@tanstack/vue-query' {
  interface Register {
    defaultError: ApiClientError
    queryKey: ApiQueryKey
    mutationKey: ApiQueryKey
  }
}

export {}
