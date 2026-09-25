import { describe, expect, it } from 'vitest'

import { createSignInState, getReturnUrlFromState, normalizeReturnUrl } from './auth-return-url'

const origin = 'http://localhost:5173'

describe('normalizeReturnUrl', () => {
  it.each([
    '/',
    '/movies',
    '/bookings',
    '/admin/users',
    '/admin/bookings?page=2',
    '/movies?status=now-showing#results',
  ])('keeps safe internal return URL %s', (returnUrl) => {
    expect(normalizeReturnUrl(returnUrl, origin)).toBe(returnUrl)
  })

  it.each([
    'https://evil.example',
    'http://evil.example/admin',
    '//evil.example/admin',
    'javascript:alert(1)',
    'admin/users',
    '',
  ])('rejects unsafe return URL %s', (returnUrl) => {
    expect(normalizeReturnUrl(returnUrl, origin)).toBe('/')
  })

  it.each([
    '/auth/login',
    '/auth/callback',
    '/auth/session-expired',
    '/auth/login?returnUrl=/admin',
    '/auth/session-expired?returnUrl=/bookings',
  ])('prevents authentication redirect loop for %s', (returnUrl) => {
    expect(normalizeReturnUrl(returnUrl, origin)).toBe('/')
  })

  it('falls back when the value is not a string', () => {
    expect(normalizeReturnUrl(undefined, origin)).toBe('/')
    expect(normalizeReturnUrl(null, origin)).toBe('/')
    expect(normalizeReturnUrl({ returnUrl: '/admin' }, origin)).toBe('/')
  })
})

describe('createSignInState', () => {
  it('stores a normalized internal return URL', () => {
    expect(createSignInState('/bookings')).toEqual({
      returnUrl: '/bookings',
    })
  })

  it('does not store an unsafe return URL', () => {
    expect(createSignInState('https://evil.example')).toEqual({
      returnUrl: '/',
    })
  })
})

describe('getReturnUrlFromState', () => {
  it('reads a safe return URL from OIDC state', () => {
    expect(
      getReturnUrlFromState({
        returnUrl: '/admin/movies',
      }),
    ).toBe('/admin/movies')
  })

  it('rejects an unsafe return URL from OIDC state', () => {
    expect(
      getReturnUrlFromState({
        returnUrl: '//evil.example',
      }),
    ).toBe('/')
  })

  it('falls back when OIDC state is missing or malformed', () => {
    expect(getReturnUrlFromState(undefined)).toBe('/')
    expect(getReturnUrlFromState(null)).toBe('/')
    expect(getReturnUrlFromState({})).toBe('/')
  })
})
