import type { VueQueryPluginOptions } from '@tanstack/vue-query'

export const vueQueryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },

      mutations: {
        retry: false,
      },
    },
  },
}
