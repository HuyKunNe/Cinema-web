import { describe, expect, it } from 'vitest'

import { resolveOidcConfig } from './oidc.config'

const origin = 'http://localhost:5173'

const env = {
  VITE_OIDC_AUTHORITY: 'http://localhost:8082',
  VITE_OIDC_CLIENT_ID: 'registered-spa-client',
  VITE_OIDC_REDIRECT_URI: `${origin}/auth/callback`,
  VITE_OIDC_POST_LOGOUT_REDIRECT_URI: `${origin}/`,
  VITE_OIDC_SCOPE: 'openid profile',
}

describe('OIDC configuration', () => {
  it('accepts a valid SPA configuration', () => {
    expect(resolveOidcConfig(env, origin)).toMatchObject({
      authority: 'http://localhost:8082',
      clientId: 'registered-spa-client',
      scope: 'openid profile',
    })
  })

  it('requires a client ID', () => {
    expect(() => resolveOidcConfig({ ...env, VITE_OIDC_CLIENT_ID: '' }, origin)).toThrow(
      'VITE_OIDC_CLIENT_ID',
    )
  })

  it('rejects a callback on another origin', () => {
    expect(() =>
      resolveOidcConfig(
        {
          ...env,
          VITE_OIDC_REDIRECT_URI: 'https://other.example/auth/callback',
        },
        origin,
      ),
    ).toThrow('cùng origin')
  })

  it('requires the openid scope', () => {
    expect(() => resolveOidcConfig({ ...env, VITE_OIDC_SCOPE: 'profile' }, origin)).toThrow(
      'openid',
    )
  })
})
