import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

const REQUEST_ID_HEADER = 'X-Request-Id'

export type ApiErrorKind = 'http' | 'timeout' | 'network' | 'cancelled' | 'unknown'

export type ApiValidationError = Readonly<{
  field: string
  message: string
}>

type ApiClientErrorOptions = Readonly<{
  kind: ApiErrorKind
  message: string
  status?: number | null
  code?: string | null
  category?: string | null
  details?: readonly ApiValidationError[]
  requestId?: string | null
}>

type UnknownRecord = Record<string, unknown>

type ParsedBackendError = Readonly<{
  code: string | null
  message: string | null
  category: string | null
  details: readonly ApiValidationError[]
}>

export class ApiClientError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  readonly code: string | null
  readonly category: string | null
  readonly details: readonly ApiValidationError[]
  readonly requestId: string | null

  constructor(options: ApiClientErrorOptions) {
    super(options.message)

    this.name = 'ApiClientError'

    this.kind = options.kind
    this.status = options.status ?? null
    this.code = options.code ?? null
    this.category = options.category ?? null
    this.details = options.details ? [...options.details] : []
    this.requestId = options.requestId ?? null
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()

  return normalized || null
}

function parseValidationErrors(value: unknown): readonly ApiValidationError[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((entry) => {
    if (!isRecord(entry)) {
      return []
    }

    const field = optionalString(entry.field)
    const message = optionalString(entry.message)

    if (!field || !message) {
      return []
    }

    return [
      {
        field,
        message,
      },
    ]
  })
}

function parseBackendError(data: unknown): ParsedBackendError {
  if (!isRecord(data)) {
    return {
      code: null,
      message: null,
      category: null,
      details: [],
    }
  }

  const error = data.error

  if (!isRecord(error)) {
    return {
      code: null,
      message: null,
      category: null,
      details: [],
    }
  }

  return {
    code: optionalString(error.code),
    message: optionalString(error.message),
    category: optionalString(error.category),
    details: parseValidationErrors(error.details),
  }
}

function readHeader(
  headers: AxiosResponse['headers'] | InternalAxiosRequestConfig['headers'] | undefined,
  name: string,
): string | null {
  if (!headers) {
    return null
  }

  if (headers instanceof AxiosHeaders) {
    return optionalString(headers.get(name))
  }

  const normalizedName = name.toLowerCase()

  const entry = Object.entries(headers).find(
    ([headerName]) => headerName.toLowerCase() === normalizedName,
  )

  if (!entry) {
    return null
  }

  const value = entry[1]

  if (Array.isArray(value)) {
    return optionalString(value[0])
  }

  return optionalString(value)
}

function readRequestId(error: AxiosError): string | null {
  return (
    readHeader(error.response?.headers, REQUEST_ID_HEADER) ??
    readHeader(error.config?.headers, REQUEST_ID_HEADER)
  )
}

function fallbackHttpMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Yêu cầu không hợp lệ.'

    case 401:
      return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'

    case 403:
      return 'Bạn không có quyền thực hiện yêu cầu này.'

    case 404:
      return 'Không tìm thấy tài nguyên yêu cầu.'

    case 409:
      return 'Yêu cầu xung đột với trạng thái hiện tại.'

    case 423:
      return 'Tài nguyên đang được xử lý. Vui lòng thử lại.'

    case 429:
      return 'Có quá nhiều yêu cầu. Vui lòng thử lại sau.'

    default:
      if (status >= 500) {
        return 'Hệ thống tạm thời không thể xử lý yêu cầu.'
      }

      return 'Không thể hoàn tất yêu cầu.'
  }
}

function normalizeAxiosError(error: AxiosError): ApiClientError {
  const requestId = readRequestId(error)

  if (error.code === AxiosError.ERR_CANCELED) {
    return new ApiClientError({
      kind: 'cancelled',
      message: 'Yêu cầu đã bị hủy.',
      requestId,
    })
  }

  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return new ApiClientError({
      kind: 'timeout',
      message: 'Yêu cầu đã hết thời gian chờ.',
      requestId,
    })
  }

  if (error.response) {
    const status = error.response.status

    const backendError = parseBackendError(error.response.data)

    return new ApiClientError({
      kind: 'http',
      status,
      code: backendError.code,
      category: backendError.category,
      details: backendError.details,
      requestId,

      message: backendError.message ?? fallbackHttpMessage(status),
    })
  }

  if (error.request) {
    return new ApiClientError({
      kind: 'network',
      message: 'Không thể kết nối đến máy chủ.',
      requestId,
    })
  }

  return new ApiClientError({
    kind: 'unknown',
    message: 'Đã xảy ra lỗi không xác định.',
    requestId,
  })
}

export function normalizeApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error
  }

  if (error instanceof AxiosError) {
    return normalizeAxiosError(error)
  }

  return new ApiClientError({
    kind: 'unknown',
    message: 'Đã xảy ra lỗi không xác định.',
  })
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}
