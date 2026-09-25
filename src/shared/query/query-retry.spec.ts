import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/shared/api'

import { shouldRetryApiQuery } from './query-retry'

describe('shouldRetryApiQuery', () => {
  it('retries a network error once', () => {
    const error = new ApiClientError({
      kind: 'network',
      message: 'Network error',
    })

    expect(shouldRetryApiQuery(0, error)).toBe(true)

    expect(shouldRetryApiQuery(1, error)).toBe(false)
  })

  it('retries a timeout once', () => {
    const error = new ApiClientError({
      kind: 'timeout',
      message: 'Timeout',
    })

    expect(shouldRetryApiQuery(0, error)).toBe(true)

    expect(shouldRetryApiQuery(1, error)).toBe(false)
  })

  it('retries a server error once', () => {
    const error = new ApiClientError({
      kind: 'http',
      status: 503,
      message: 'Unavailable',
    })

    expect(shouldRetryApiQuery(0, error)).toBe(true)

    expect(shouldRetryApiQuery(1, error)).toBe(false)
  })

  it.each([400, 401, 403, 404, 409, 423, 429])('does not retry HTTP %s', (status) => {
    const error = new ApiClientError({
      kind: 'http',
      status,
      message: 'HTTP error',
    })

    expect(shouldRetryApiQuery(0, error)).toBe(false)
  })

  it('does not retry a cancelled request', () => {
    const error = new ApiClientError({
      kind: 'cancelled',
      message: 'Cancelled',
    })

    expect(shouldRetryApiQuery(0, error)).toBe(false)
  })

  it('does not retry an unknown error', () => {
    expect(shouldRetryApiQuery(0, new Error('Unknown'))).toBe(false)
  })
})
