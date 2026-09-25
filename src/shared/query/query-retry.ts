import { isApiClientError, type ApiClientError } from '@/shared/api'

const MAX_QUERY_RETRIES = 1

function isRetryableApiError(error: ApiClientError): boolean {
  if (error.kind === 'network') {
    return true
  }

  if (error.kind === 'timeout') {
    return true
  }

  if (error.kind !== 'http') {
    return false
  }

  return error.status !== null && error.status >= 500
}

export function shouldRetryApiQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) {
    return false
  }

  if (!isApiClientError(error)) {
    return false
  }

  return isRetryableApiError(error)
}
