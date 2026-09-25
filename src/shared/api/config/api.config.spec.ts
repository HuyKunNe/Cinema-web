import { describe, expect, it } from 'vitest'

import { resolveApiConfig } from './api.config'

describe('API configuration', () => {
  it('accepts a valid Gateway base URL', () => {
    expect(
      resolveApiConfig({
        VITE_API_BASE_URL: 'http://localhost:8080',
      }),
    ).toEqual({
      baseUrl: 'http://localhost:8080',
    })
  })

  it('removes the trailing slash from the Gateway base URL', () => {
    expect(
      resolveApiConfig({
        VITE_API_BASE_URL: 'http://localhost:8080/',
      }),
    ).toEqual({
      baseUrl: 'http://localhost:8080',
    })
  })

  it('requires the API base URL', () => {
    expect(() =>
      resolveApiConfig({
        VITE_API_BASE_URL: '',
      }),
    ).toThrow('VITE_API_BASE_URL')
  })

  it('requires an absolute URL', () => {
    expect(() =>
      resolveApiConfig({
        VITE_API_BASE_URL: '/api',
      }),
    ).toThrow('URL tuyệt đối')
  })

  it('rejects unsupported protocols', () => {
    expect(() =>
      resolveApiConfig({
        VITE_API_BASE_URL: 'ftp://localhost:8080',
      }),
    ).toThrow('HTTP hoặc HTTPS')
  })

  it('rejects credentials in the API base URL', () => {
    expect(() =>
      resolveApiConfig({
        VITE_API_BASE_URL: 'http://username:password@localhost:8080',
      }),
    ).toThrow('credentials')
  })

  it('rejects query parameters in the API base URL', () => {
    expect(() =>
      resolveApiConfig({
        VITE_API_BASE_URL: 'http://localhost:8080?version=1',
      }),
    ).toThrow('query hoặc fragment')
  })

  it('rejects fragments in the API base URL', () => {
    expect(() =>
      resolveApiConfig({
        VITE_API_BASE_URL: 'http://localhost:8080#api',
      }),
    ).toThrow('query hoặc fragment')
  })
})
