import type { SignInState } from '@/modules/auth/types/auth.types'

const DEFAULT_RETURN_URL = '/'

const BLOCKED_AUTH_PATHS = new Set(['/auth/login', '/auth/callback', '/auth/session-expired'])

export function normalizeReturnUrl(
  value: unknown,
  origin: string = window.location.origin,
): string {
  if (typeof value !== 'string') {
    return DEFAULT_RETURN_URL
  }

  const candidate = value.trim()

  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return DEFAULT_RETURN_URL
  }

  try {
    const url = new URL(candidate, origin)

    if (url.origin !== new URL(origin).origin || BLOCKED_AUTH_PATHS.has(url.pathname)) {
      return DEFAULT_RETURN_URL
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_RETURN_URL
  }
}

export function createSignInState(returnUrl: unknown): SignInState {
  return {
    returnUrl: normalizeReturnUrl(returnUrl),
  }
}

export function getReturnUrlFromState(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('returnUrl' in state)) {
    return DEFAULT_RETURN_URL
  }

  return normalizeReturnUrl(state.returnUrl)
}
