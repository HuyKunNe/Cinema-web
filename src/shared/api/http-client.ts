import axios, { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { readApiConfig, type ApiConfig } from '@/shared/api/config/api.config'

const API_REQUEST_TIMEOUT_MS = 15_000

const AUTHORIZATION_HEADER = 'Authorization'
const REQUEST_ID_HEADER = 'X-Request-Id'

export type AccessTokenProvider = () => Promise<string | null>

export type UnauthorizedHandler = () => void

export type RequestIdFactory = () => string

export type ApiHttpClientDependencies = Readonly<{
  getAccessToken: AccessTokenProvider
  onUnauthorized?: UnauthorizedHandler
  createRequestId?: RequestIdFactory
}>

function createDefaultRequestId(): string {
  return globalThis.crypto.randomUUID()
}

function hasBearerAuthorization(config: InternalAxiosRequestConfig | undefined): boolean {
  if (!config) {
    return false
  }

  const headers = AxiosHeaders.from(config.headers)

  const authorization = headers.get(AUTHORIZATION_HEADER)

  return typeof authorization === 'string' && authorization.startsWith('Bearer ')
}

export function createApiHttpClient(
  config: ApiConfig,
  dependencies: ApiHttpClientDependencies,
): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseUrl,
    timeout: API_REQUEST_TIMEOUT_MS,

    headers: {
      Accept: 'application/json',
    },
  })

  client.interceptors.request.use(async (requestConfig) => {
    const headers = AxiosHeaders.from(requestConfig.headers)

    /*
     * Authorization is owned by this boundary.
     * Feature code and generated clients must not inject tokens.
     */
    headers.delete(AUTHORIZATION_HEADER)

    const accessToken = (await dependencies.getAccessToken())?.trim() ?? ''

    if (accessToken) {
      headers.set(AUTHORIZATION_HEADER, `Bearer ${accessToken}`)
    }

    if (!headers.has(REQUEST_ID_HEADER)) {
      const createRequestId = dependencies.createRequestId ?? createDefaultRequestId

      headers.set(REQUEST_ID_HEADER, createRequestId())
    }

    requestConfig.headers = headers

    return requestConfig
  })

  client.interceptors.response.use(
    (response) => response,

    (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        hasBearerAuthorization(error.config)
      ) {
        dependencies.onUnauthorized?.()
      }

      return Promise.reject(error)
    },
  )

  return client
}

let configuredApiHttpClient: AxiosInstance | undefined

export function configureApiHttpClient(dependencies: ApiHttpClientDependencies): AxiosInstance {
  configuredApiHttpClient = createApiHttpClient(readApiConfig(), dependencies)

  return configuredApiHttpClient
}

export function getApiHttpClient(): AxiosInstance {
  if (!configuredApiHttpClient) {
    throw new Error('API HTTP client chưa được cấu hình')
  }

  return configuredApiHttpClient
}
