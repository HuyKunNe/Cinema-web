import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { ApiClientError } from './api-error'
import { createApiHttpClient } from './http-client'

const apiConfig = {
  baseUrl: 'http://localhost:8080',
}

function successAdapter(capture: (config: InternalAxiosRequestConfig) => void) {
  return async (config: InternalAxiosRequestConfig) => {
    capture(config)

    return {
      data: {
        success: true,
      },

      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config,
    }
  }
}

function unauthorizedAdapter() {
  return async (config: InternalAxiosRequestConfig) => {
    const response = {
      data: null,
      status: 401,
      statusText: 'Unauthorized',
      headers: new AxiosHeaders(),
      config,
    }

    throw new AxiosError('Unauthorized', AxiosError.ERR_BAD_REQUEST, config, undefined, response)
  }
}

describe('API HTTP client', () => {
  it('uses the Gateway base URL and request timeout', () => {
    const client = createApiHttpClient(apiConfig, {
      getAccessToken: async () => null,
    })

    expect(client.defaults.baseURL).toBe('http://localhost:8080')

    expect(client.defaults.timeout).toBe(15_000)
  })

  it('adds the managed access token to API requests', async () => {
    let captured: InternalAxiosRequestConfig | undefined

    const client = createApiHttpClient(apiConfig, {
      getAccessToken: async () => 'access-token',

      createRequestId: () => 'request-123',
    })

    await client.get('/api/v1/movies', {
      adapter: successAdapter((config) => {
        captured = config
      }),
    })

    const headers = AxiosHeaders.from(captured?.headers)

    expect(headers.get('Authorization')).toBe('Bearer access-token')

    expect(headers.get('X-Request-Id')).toBe('request-123')
  })

  it('does not add Authorization for an anonymous request', async () => {
    let captured: InternalAxiosRequestConfig | undefined

    const client = createApiHttpClient(apiConfig, {
      getAccessToken: async () => null,

      createRequestId: () => 'request-anonymous',
    })

    await client.get('/api/v1/movies', {
      adapter: successAdapter((config) => {
        captured = config
      }),
    })

    const headers = AxiosHeaders.from(captured?.headers)

    expect(headers.has('Authorization')).toBe(false)

    expect(headers.get('X-Request-Id')).toBe('request-anonymous')
  })

  it('keeps an existing request ID', async () => {
    let captured: InternalAxiosRequestConfig | undefined

    const createRequestId = vi.fn(() => 'generated-request-id')

    const client = createApiHttpClient(apiConfig, {
      getAccessToken: async () => null,
      createRequestId,
    })

    await client.get('/api/v1/movies', {
      headers: {
        'X-Request-Id': 'existing-request-id',
      },

      adapter: successAdapter((config) => {
        captured = config
      }),
    })

    const headers = AxiosHeaders.from(captured?.headers)

    expect(headers.get('X-Request-Id')).toBe('existing-request-id')

    expect(createRequestId).not.toHaveBeenCalled()
  })

  it('owns the Authorization header at the shared HTTP boundary', async () => {
    let captured: InternalAxiosRequestConfig | undefined

    const client = createApiHttpClient(apiConfig, {
      getAccessToken: async () => 'managed-token',

      createRequestId: () => 'request-123',
    })

    await client.get('/api/v1/movies', {
      headers: {
        Authorization: 'Bearer manually-injected-token',
      },

      adapter: successAdapter((config) => {
        captured = config
      }),
    })

    const headers = AxiosHeaders.from(captured?.headers)

    expect(headers.get('Authorization')).toBe('Bearer managed-token')
  })

  it('signals session expiration when an authenticated API request returns 401', async () => {
    const onUnauthorized = vi.fn()

    const client = createApiHttpClient(apiConfig, {
      getAccessToken: async () => 'expired-token',

      onUnauthorized,

      createRequestId: () => 'request-401',
    })

    await expect(
      client.get('/api/v1/bookings', {
        adapter: unauthorizedAdapter(),
      }),
    ).rejects.toBeInstanceOf(ApiClientError)

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('does not mark the session expired for an anonymous 401 response', async () => {
    const onUnauthorized = vi.fn()

    const client = createApiHttpClient(apiConfig, {
      getAccessToken: async () => null,

      onUnauthorized,

      createRequestId: () => 'request-401',
    })

    await expect(
      client.get('/api/v1/bookings', {
        adapter: unauthorizedAdapter(),
      }),
    ).rejects.toBeInstanceOf(ApiClientError)

    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})
