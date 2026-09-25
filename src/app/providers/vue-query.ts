import type { VueQueryPluginOptions } from '@tanstack/vue-query'

import { shouldRetryApiQuery } from '@/shared/query/query-retry'

export const vueQueryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetryApiQuery,
        refetchOnWindowFocus: true,
      },

      mutations: {
        retry: false,
      },
    },
  },
}
