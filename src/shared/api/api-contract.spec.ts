import { describe, expect, expectTypeOf, it } from 'vitest'

import { bookingApi, inventoryApi, movieApi, userApi } from './index'

describe('generated API contracts', () => {
  it('exposes the expected movie contract', () => {
    expectTypeOf<ReturnType<typeof movieApi.listMovies>>().toEqualTypeOf<
      Promise<movieApi.MovieResponse[]>
    >()

    expectTypeOf<movieApi.MovieResponse['id']>().toEqualTypeOf<string | undefined>()

    expectTypeOf<movieApi.MovieResponse['title']>().toEqualTypeOf<string | undefined>()

    expectTypeOf<movieApi.MovieResponse['posterUrl']>().toEqualTypeOf<string | undefined>()

    expect(movieApi.MovieResponseStatus).toEqual({
      UPCOMING: 'UPCOMING',
      NOW_SHOWING: 'NOW_SHOWING',
      ENDED: 'ENDED',
      INACTIVE: 'INACTIVE',
    })
  })

  it('exposes the expected showtime contract', () => {
    expectTypeOf<ReturnType<typeof inventoryApi.listShowtimesByMovie>>().toEqualTypeOf<
      Promise<inventoryApi.ShowtimeResponse[]>
    >()

    expectTypeOf<inventoryApi.ShowtimeResponse['movieId']>().toEqualTypeOf<string | undefined>()

    expectTypeOf<inventoryApi.ShowtimeResponse['startsAt']>().toEqualTypeOf<string | undefined>()

    expect(inventoryApi.ShowtimeResponseStatus).toEqual({
      SCHEDULED: 'SCHEDULED',
      OPEN_FOR_BOOKING: 'OPEN_FOR_BOOKING',
      CLOSED: 'CLOSED',
      CANCELLED: 'CANCELLED',
      COMPLETED: 'COMPLETED',
    })
  })

  it('exposes the expected show-seat contract', () => {
    expectTypeOf<inventoryApi.ShowSeatResponse['seatNumber']>().toEqualTypeOf<string | undefined>()

    expectTypeOf<inventoryApi.ShowSeatResponse['price']>().toEqualTypeOf<number | undefined>()

    expectTypeOf<inventoryApi.ShowSeatResponse['holdExpiresAt']>().toEqualTypeOf<
      string | undefined
    >()

    expect(inventoryApi.ShowSeatResponseStatus).toEqual({
      AVAILABLE: 'AVAILABLE',
      HELD: 'HELD',
      BOOKED: 'BOOKED',
      UNAVAILABLE: 'UNAVAILABLE',
    })
  })

  it('does not expose internal seat reservation operations', () => {
    expect(inventoryApi).not.toHaveProperty('hold')

    expect(inventoryApi).not.toHaveProperty('book')

    expect(inventoryApi).not.toHaveProperty('release')
  })

  it('exposes the expected booking request contract', () => {
    expectTypeOf<bookingApi.CreateBookingRequest>().toMatchTypeOf<{
      clientRequestId: string
      showtimeId: string
      seatNumbers: string[]
    }>()
  })

  it('exposes the expected booking lifecycle contract', () => {
    expectTypeOf<bookingApi.BookingResponse['expiresAt']>().toEqualTypeOf<string | undefined>()

    expectTypeOf<bookingApi.BookingResponse['seats']>().toEqualTypeOf<
      bookingApi.BookingSeatResponse[] | undefined
    >()

    expect(bookingApi.BookingResponseStatus).toEqual({
      PENDING: 'PENDING',
      RESERVED: 'RESERVED',
      REJECTED: 'REJECTED',
      CONFIRMED: 'CONFIRMED',
      PAYMENT_FAILED: 'PAYMENT_FAILED',
      CANCELLED: 'CANCELLED',
      EXPIRED: 'EXPIRED',
    })
  })

  it('exposes the expected current-user contract', () => {
    expectTypeOf<ReturnType<typeof userApi.getCurrentProfile>>().toEqualTypeOf<
      Promise<userApi.CurrentUserProfileResponse>
    >()

    expectTypeOf<userApi.CurrentUserProfileResponse['email']>().toEqualTypeOf<string | undefined>()

    expect(userApi.CurrentUserProfileResponseStatus).toEqual({
      PENDING_VERIFICATION: 'PENDING_VERIFICATION',
      ACTIVE: 'ACTIVE',
      LOCKED: 'LOCKED',
      DISABLED: 'DISABLED',
    })
  })
})
