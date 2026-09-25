import {
  UserManager,
  WebStorageStateStore,
  type User,
  type UserManagerSettings,
} from 'oidc-client-ts'

import { readOidcConfig, type OidcConfig } from '@/modules/auth/config/oidc.config'
import type { SignInState } from '@/modules/auth/types/auth.types'

const USER_STORE_PREFIX = 'cinema.oidc.user.'
const STATE_STORE_PREFIX = 'cinema.oidc.state.'

export type AccessTokenExpiredListener = () => void

let oidcUserManager: UserManager | undefined

export function createOidcUserManager(
  config: OidcConfig,
  storage: Storage = window.sessionStorage,
): UserManager {
  const settings: UserManagerSettings = {
    authority: config.authority,
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    post_logout_redirect_uri: config.postLogoutRedirectUri,
    response_type: 'code',
    scope: config.scope,
    disablePKCE: false,
    loadUserInfo: false,
    automaticSilentRenew: false,
    monitorSession: false,
    revokeTokensOnSignout: false,
    stateStore: new WebStorageStateStore({
      prefix: STATE_STORE_PREFIX,
      store: storage,
    }),
    userStore: new WebStorageStateStore({
      prefix: USER_STORE_PREFIX,
      store: storage,
    }),
  }

  return new UserManager(settings)
}

export function getOidcUserManager(): UserManager {
  oidcUserManager ??= createOidcUserManager(readOidcConfig())

  return oidcUserManager
}

export function subscribeToAccessTokenExpired(listener: AccessTokenExpiredListener): () => void {
  const events = getOidcUserManager().events

  events.addAccessTokenExpired(listener)

  return () => {
    events.removeAccessTokenExpired(listener)
  }
}

export function startOidcSignIn(state: SignInState): Promise<void> {
  return getOidcUserManager().signinRedirect({ state })
}

export function completeOidcSignIn(): Promise<User> {
  return getOidcUserManager().signinRedirectCallback()
}

export function startOidcSignOut(): Promise<void> {
  return getOidcUserManager().signoutRedirect()
}
