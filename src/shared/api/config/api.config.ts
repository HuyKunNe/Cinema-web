type ApiEnvKey = 'VITE_API_BASE_URL'

type ApiEnv = Partial<Record<ApiEnvKey, string>>

export type ApiConfig = Readonly<{
  baseUrl: string
}>

function required(env: ApiEnv, key: ApiEnvKey): string {
  const value = env[key]?.trim()

  if (!value) {
    throw new Error(`Thiếu cấu hình ${key}`)
  }

  return value
}

function httpUrl(value: string, key: ApiEnvKey): URL {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error(`${key} phải là URL tuyệt đối`)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${key} phải sử dụng HTTP hoặc HTTPS`)
  }

  if (url.username || url.password) {
    throw new Error(`${key} không được chứa credentials`)
  }

  if (url.search || url.hash) {
    throw new Error(`${key} không được chứa query hoặc fragment`)
  }

  return url
}

function normalizeBaseUrl(url: URL): string {
  return url.toString().replace(/\/+$/, '')
}

export function resolveApiConfig(env: ApiEnv): ApiConfig {
  const rawBaseUrl = required(env, 'VITE_API_BASE_URL')

  const baseUrl = httpUrl(rawBaseUrl, 'VITE_API_BASE_URL')

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
  }
}

export function readApiConfig(): ApiConfig {
  return resolveApiConfig(import.meta.env)
}
