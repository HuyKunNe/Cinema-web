import { describe, expect, it } from 'vitest'

import { readAccessTokenAuthorization } from './access-token-claims'

function encodeBase64Url(value: string): string {
  return window.btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function createAccessToken(payload: Record<string, unknown>): string {
  const header = encodeBase64Url(
    JSON.stringify({
      alg: 'none',
      typ: 'JWT',
    }),
  )

  const encodedPayload = encodeBase64Url(JSON.stringify(payload))

  return `${header}.${encodedPayload}.signature`
}

describe('readAccessTokenAuthorization', () => {
  it('reads roles and permissions from the access token payload', () => {
    const accessToken = createAccessToken({
      sub: '019c3000-0000-7000-8000-000000000001',
      roles: ['ADMIN'],
      permissions: ['movie:manage', 'user:manage'],
    })

    expect(readAccessTokenAuthorization(accessToken)).toEqual({
      roles: ['ADMIN'],
      permissions: ['movie:manage', 'user:manage'],
    })
  })

  it('trims, deduplicates and sorts authorization claims', () => {
    const accessToken = createAccessToken({
      roles: ['STAFF', ' ADMIN ', 'STAFF', '', null],
      permissions: ['showtime:manage', ' movie:manage ', 'showtime:manage', '', 123],
    })

    expect(readAccessTokenAuthorization(accessToken)).toEqual({
      roles: ['ADMIN', 'STAFF'],
      permissions: ['movie:manage', 'showtime:manage'],
    })
  })

  it('returns empty authorization when claims are missing', () => {
    const accessToken = createAccessToken({
      sub: '019c3000-0000-7000-8000-000000000001',
    })

    expect(readAccessTokenAuthorization(accessToken)).toEqual({
      roles: [],
      permissions: [],
    })
  })

  it('ignores claims with unsupported types', () => {
    const accessToken = createAccessToken({
      roles: 'ADMIN',
      permissions: {
        movie: 'manage',
      },
    })

    expect(readAccessTokenAuthorization(accessToken)).toEqual({
      roles: [],
      permissions: [],
    })
  })

  it.each([
    undefined,
    '',
    'not-a-jwt',
    'header.payload',
    'header..signature',
    'header.invalid-base64.signature',
  ])('returns empty authorization for malformed token %s', (accessToken) => {
    expect(readAccessTokenAuthorization(accessToken)).toEqual({
      roles: [],
      permissions: [],
    })
  })
})
