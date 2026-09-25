import type { AxiosRequestConfig } from 'axios'

import { getApiHttpClient } from '@/shared/api/http-client'

export async function apiMutator<T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> {
  const client = getApiHttpClient()

  const response = await client.request<T>({
    ...config,
    ...options,

    /*
     * Runtime traffic must always use the configured API Gateway.
     * A generated operation or caller cannot redirect a request
     * directly to a microservice.
     */
    baseURL: client.defaults.baseURL,

    /*
     * OpenAPI owns the operation path and HTTP method.
     */
    url: config.url,
    method: config.method,

    /*
     * OpenAPI-generated request payload/query parameters remain
     * authoritative. Request options are intended for concerns
     * such as signal, timeout and additional safe headers.
     */
    params: config.params,
    data: config.data,
  })

  return response.data
}
