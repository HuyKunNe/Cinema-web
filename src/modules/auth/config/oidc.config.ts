type OidcEnvKey =
  | 'VITE_OIDC_AUTHORITY'
  | 'VITE_OIDC_CLIENT_ID'
  | 'VITE_OIDC_REDIRECT_URI'
  | 'VITE_OIDC_POST_LOGOUT_REDIRECT_URI'
  | 'VITE_OIDC_SCOPE'

type OidcEnv = Partial<Record<OidcEnvKey, string>>

export type OidcConfig = Readonly<{
  authority: string
  clientId: string
  redirectUri: string
  postLogoutRedirectUri: string
  scope: string
}>

function required(env: OidcEnv, key: OidcEnvKey): string {
  const value = env[key]?.trim()

  if (!value) {
    throw new Error(`Thiếu cấu hình ${key}`)
  }

  return value
}

function httpUrl(value: string, key: OidcEnvKey): URL {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error(`${key} phải là URL tuyệt đối`)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${key} phải sử dụng HTTP hoặc HTTPS`)
  }

  return url
}

export function resolveOidcConfig(env: OidcEnv, origin: string): OidcConfig {
  const appOrigin = new URL(origin).origin

  const authority = required(env, 'VITE_OIDC_AUTHORITY')
  httpUrl(authority, 'VITE_OIDC_AUTHORITY')

  const clientId = required(env, 'VITE_OIDC_CLIENT_ID')
  const redirectUri = required(env, 'VITE_OIDC_REDIRECT_URI')
  const postLogoutRedirectUri = required(env, 'VITE_OIDC_POST_LOGOUT_REDIRECT_URI')
  const scope = required(env, 'VITE_OIDC_SCOPE')

  const callback = httpUrl(redirectUri, 'VITE_OIDC_REDIRECT_URI')
  const logout = httpUrl(postLogoutRedirectUri, 'VITE_OIDC_POST_LOGOUT_REDIRECT_URI')

  if (
    callback.origin !== appOrigin ||
    callback.pathname !== '/auth/callback' ||
    callback.search ||
    callback.hash
  ) {
    throw new Error('OIDC redirect URI phải trỏ đến /auth/callback cùng origin')
  }

  if (logout.origin !== appOrigin) {
    throw new Error('OIDC post-logout redirect URI phải cùng origin')
  }

  if (!scope.split(/\s+/).includes('openid')) {
    throw new Error('OIDC scope phải bao gồm openid')
  }

  return {
    authority,
    clientId,
    redirectUri,
    postLogoutRedirectUri,
    scope,
  }
}

export function readOidcConfig(): OidcConfig {
  return resolveOidcConfig(import.meta.env, window.location.origin)
}
