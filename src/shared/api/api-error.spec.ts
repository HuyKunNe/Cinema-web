import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  ApiClientError,
  isApiClientError,
  normalizeApiError,
} from './api-error'

function createConfig(
  requestId = 'request-123',
): InternalAxiosRequestConfig {
  return {
    headers: new AxiosHeaders({
      'X-Request-Id': requestId,
    }),
  } as InternalAxiosRequestConfig
}

function createHttpError(
  status: number,
  data: unknown,
  requestId = 'response-request-id',
): AxiosError {
  const config = createConfig(
    'request-request-id',
  )

  return new AxiosError(
    'Request failed',
    AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    {
      data,
      status,
      statusText: 'Error',
      headers: new AxiosHeaders({
        'X-Request-Id': requestId,
      }),
      config,
    },
  )
}

describe('normalizeApiError', () => {
  it('normalizes the standard backend error envelope', () => {
    const error = createHttpError(
      409,
      {
        success: false,
        timestamp:
          '2026-09-25T06:00:00Z',
        data: null,

        error: {
          code: 'BOOKING_CONFLICT',
          message:
            'Booking state conflict',
          category: 'BUSINESS',
          details: null,
        },
      },
    )

    expect(
      normalizeApiError(error),
    ).toMatchObject({
      kind: 'http',
      status: 409,
      code: 'BOOKING_CONFLICT',
      message: 'Booking state conflict',
      category: 'BUSINESS',
      details: [],
      requestId:
        'response-request-id',
    })
  })

  it('normalizes validation details', () => {
    const error = createHttpError(
      400,
      {
        success: false,

        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          category: 'VALIDATION',

          details: [
            {
              field: 'email',
              message:
                'Email is required',
            },
            {
              field: 'seatIds',
              message:
                'At least one seat is required',
            },
          ],
        },
      },
    )

    const normalized =
      normalizeApiError(error)

    expect(normalized.details).toEqual([
      {
        field: 'email',
        message: 'Email is required',
      },
      {
        field: 'seatIds',
        message:
          'At least one seat is required',
      },
    ])
  })

  it('uses a safe status fallback when the response body is malformed', () => {
    const error = createHttpError(
      403,
      '<html>Forbidden</html>',
    )

    expect(
      normalizeApiError(error),
    ).toMatchObject({
      kind: 'http',
      status: 403,
      code: null,
      category: null,
      message:
        'Bạn không có quyền thực hiện yêu cầu này.',
      details: [],
    })
  })

  it('prefers the response request ID', () => {
    const normalized =
      normalizeApiError(
        createHttpError(
          500,
          null,
          'gateway-request-id',
        ),
      )

    expect(normalized.requestId).toBe(
      'gateway-request-id',
    )
  })

  it('falls back to the request header when the response has no request ID', () => {
    const config = createConfig(
      'frontend-request-id',
    )

    const error = new AxiosError(
      'Request failed',
      AxiosError.ERR_BAD_RESPONSE,
      config,
      undefined,
      {
        data: null,
        status: 500,
        statusText:
          'Internal Server Error',
        headers: new AxiosHeaders(),
        config,
      },
    )

    expect(
      normalizeApiError(error).requestId,
    ).toBe('frontend-request-id')
  })

  it('normalizes timeout errors', () => {
    const error = new AxiosError(
      'timeout',
      AxiosError.ECONNABORTED,
      createConfig(),
    )

    expect(
      normalizeApiError(error),
    ).toMatchObject({
      kind: 'timeout',
      status: null,
      message:
        'Yêu cầu đã hết thời gian chờ.',
    })
  })

  it('normalizes network errors', () => {
    const config = createConfig()

    const error = new AxiosError(
      'Network Error',
      AxiosError.ERR_NETWORK,
      config,
      {},
    )

    expect(
      normalizeApiError(error),
    ).toMatchObject({
      kind: 'network',
      status: null,
      message:
        'Không thể kết nối đến máy chủ.',
    })
  })

  it('normalizes cancelled requests', () => {
    const error = new AxiosError(
      'canceled',
      AxiosError.ERR_CANCELED,
      createConfig(),
    )

    expect(
      normalizeApiError(error),
    ).toMatchObject({
      kind: 'cancelled',
      status: null,
      message: 'Yêu cầu đã bị hủy.',
    })
  })

  it('does not expose an unknown raw error message', () => {
    const normalized =
      normalizeApiError(
        new Error(
          'database password leaked here',
        ),
      )

    expect(normalized).toMatchObject({
      kind: 'unknown',
      status: null,
      code: null,
      category: null,
      message:
        'Đã xảy ra lỗi không xác định.',
    })

    expect(normalized.message).not.toContain(
      'database password',
    )
  })

  it('returns an existing ApiClientError unchanged', () => {
    const original = new ApiClientError({
      kind: 'http',
      status: 404,
      message: 'Not found',
    })

    expect(
      normalizeApiError(original),
    ).toBe(original)

    expect(
      isApiClientError(original),
    ).toBe(true)
  })
})
