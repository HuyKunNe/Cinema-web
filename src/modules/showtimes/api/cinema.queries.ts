import { queryOptions } from '@tanstack/vue-query'

import { inventoryApi } from '@/shared/api'

export const cinemaQueryKeys = {
  all: ['cinema'] as const,

  active: () => [...cinemaQueryKeys.all, 'active'] as const,
}

export const cinemaQueries = {
  active: () =>
    queryOptions({
      queryKey: cinemaQueryKeys.active(),
      queryFn: () => inventoryApi.listActiveCinemas(),
    }),
}
