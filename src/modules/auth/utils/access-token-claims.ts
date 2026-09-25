import type { AuthAuthorization } from '@/modules/auth/types/auth.types'

type JwtPayload = Readonly<Record<string, unknown>>

const EMPTY_AUTHORIZATION: AuthAuthorization = {
  roles: [],
  permissions: [],
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  const binary = window.atob(padded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

function readStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return [
    ...new Set(
      value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  ].sort()
}

function parseJwtPayload(accessToken: string): JwtPayload | null {
  const segments = accessToken.split('.')

  if (segments.length !== 3) {
    return null
  }

  const payload = segments[1]

  if (!payload) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(payload))

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null
    }

    return parsed as JwtPayload
  } catch {
    return null
  }
}

export function readAccessTokenAuthorization(accessToken: string | undefined): AuthAuthorization {
  if (!accessToken) {
    return EMPTY_AUTHORIZATION
  }

  const payload = parseJwtPayload(accessToken)

  if (!payload) {
    return EMPTY_AUTHORIZATION
  }

  return {
    roles: readStringArray(payload.roles),
    permissions: readStringArray(payload.permissions),
  }
}
