import { describe, expect, it } from 'vitest'

import { inventoryApi } from '@/shared/api'

import {
  filterShowtimesByDate,
  formatShowtimeTime,
  getShowtimeDateKey,
  getShowtimeDateOptions,
  getShowtimeUnavailableReason,
  groupShowtimesByCinema,
  isShowtimeBookable,
} from './showtime-presentation'

describe('showtime presentation', () => {
  it('derives local date keys from ISO timestamps', () => {
    expect(getShowtimeDateKey('2099-10-01T19:30:00+07:00')).toBe('2099-10-01')
  })

  it('formats showtime time', () => {
    expect(formatShowtimeTime('2099-10-01T19:30:00+07:00')).toContain('19:30')
  })

  it('builds unique sorted date options', () => {
    const result = getShowtimeDateOptions([
      {
        startsAt: '2099-10-02T19:00:00+07:00',
      },
      {
        startsAt: '2099-10-01T20:00:00+07:00',
      },
      {
        startsAt: '2099-10-01T22:00:00+07:00',
      },
    ])

    expect(result.map((option) => option.key)).toEqual(['2099-10-01', '2099-10-02'])
  })

  it('filters showtimes by selected date', () => {
    const result = filterShowtimesByDate(
      [
        {
          id: 'showtime-1',
          startsAt: '2099-10-01T19:00:00+07:00',
        },
        {
          id: 'showtime-2',
          startsAt: '2099-10-02T19:00:00+07:00',
        },
      ],
      '2099-10-01',
    )

    expect(result).toHaveLength(1)

    expect(result[0]?.id).toBe('showtime-1')
  })

  it('groups showtimes by cinema and sorts their times', () => {
    const groups = groupShowtimesByCinema([
      {
        id: 'late',
        cinemaId: 'cinema-1',
        cinemaName: 'Cinema A',
        startsAt: '2099-10-01T21:00:00+07:00',
      },
      {
        id: 'early',
        cinemaId: 'cinema-1',
        cinemaName: 'Cinema A',
        startsAt: '2099-10-01T18:00:00+07:00',
      },
    ])

    expect(groups).toHaveLength(1)

    expect(groups[0]?.showtimes.map((showtime) => showtime.id)).toEqual(['early', 'late'])
  })

  it('allows future OPEN_FOR_BOOKING showtimes', () => {
    const showtime = {
      id: 'showtime-1',
      startsAt: '2099-10-01T19:30:00+07:00',

      status: inventoryApi.ShowtimeResponseStatus.OPEN_FOR_BOOKING,
    }

    expect(isShowtimeBookable(showtime)).toBe(true)

    expect(getShowtimeUnavailableReason(showtime)).toBeNull()
  })

  it('disables scheduled showtimes that are not open yet', () => {
    const showtime = {
      id: 'showtime-1',
      startsAt: '2099-10-01T19:30:00+07:00',

      status: inventoryApi.ShowtimeResponseStatus.SCHEDULED,
    }

    expect(isShowtimeBookable(showtime)).toBe(false)

    expect(getShowtimeUnavailableReason(showtime)).toBe('Chưa mở bán')
  })

  it('disables past showtimes', () => {
    expect(
      getShowtimeUnavailableReason(
        {
          id: 'showtime-1',
          startsAt: '2020-01-01T10:00:00Z',

          status: inventoryApi.ShowtimeResponseStatus.OPEN_FOR_BOOKING,
        },
        new Date('2020-01-01T11:00:00Z'),
      ),
    ).toBe('Suất chiếu đã bắt đầu')
  })
})
