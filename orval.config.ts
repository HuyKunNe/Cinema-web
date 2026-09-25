import { defineConfig } from 'orval'

const mutator = {
  path: './src/shared/api/orval-mutator.ts',
  name: 'apiMutator',
} as const

function openApiUrl(environmentKey: string, defaultUrl: string): string {
  const value = process.env[environmentKey]?.trim()

  return value || defaultUrl
}

export default defineConfig({
  movie: {
    input: {
      target: openApiUrl('CINEMA_MOVIE_OPENAPI_URL', 'http://localhost:8081/v3/api-docs'),
    },

    output: {
      mode: 'single',
      client: 'axios-functions',
      httpClient: 'axios',

      target: './src/shared/api/generated/movie/client.ts',

      schemas: './src/shared/api/generated/movie/model',

      clean: true,
      formatter: 'prettier',

      override: {
        mutator,
      },
    },
  },

  user: {
    input: {
      target: openApiUrl('CINEMA_USER_OPENAPI_URL', 'http://localhost:8082/v3/api-docs'),
    },

    output: {
      mode: 'single',
      client: 'axios-functions',
      httpClient: 'axios',

      target: './src/shared/api/generated/user/client.ts',

      schemas: './src/shared/api/generated/user/model',

      clean: true,
      formatter: 'prettier',

      override: {
        mutator,
      },
    },
  },

  inventory: {
    input: {
      target: openApiUrl('CINEMA_INVENTORY_OPENAPI_URL', 'http://localhost:8083/v3/api-docs'),
    },

    output: {
      mode: 'single',
      client: 'axios-functions',
      httpClient: 'axios',

      target: './src/shared/api/generated/inventory/client.ts',

      schemas: './src/shared/api/generated/inventory/model',

      clean: true,
      formatter: 'prettier',

      override: {
        mutator,
      },
    },
  },

  booking: {
    input: {
      target: openApiUrl('CINEMA_BOOKING_OPENAPI_URL', 'http://localhost:8084/v3/api-docs'),
    },

    output: {
      mode: 'single',
      client: 'axios-functions',
      httpClient: 'axios',

      target: './src/shared/api/generated/booking/client.ts',

      schemas: './src/shared/api/generated/booking/model',

      clean: true,
      formatter: 'prettier',

      override: {
        mutator,
      },
    },
  },

  payment: {
    input: {
      target: openApiUrl('CINEMA_PAYMENT_OPENAPI_URL', 'http://localhost:8085/v3/api-docs'),
    },

    output: {
      mode: 'single',
      client: 'axios-functions',
      httpClient: 'axios',

      target: './src/shared/api/generated/payment/client.ts',

      schemas: './src/shared/api/generated/payment/model',

      clean: true,
      formatter: 'prettier',

      override: {
        mutator,
      },
    },
  },
})
