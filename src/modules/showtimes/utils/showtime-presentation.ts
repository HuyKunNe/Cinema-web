import { inventoryApi } from '@/shared/api'

export type ShowtimeDateOption = Readonly<{
  key: string
  label: string
}>

export type CinemaShowtimeGroup = Readonly<{
  key: string
  cinemaName: string
  showtimes: readonly inventoryApi.ShowtimeResponse[]
}>

function parseDateTime(value: string | undefined): Date | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function localDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value

  const month = parts.find((part) => part.type === 'month')?.value

  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    return ''
  }

  return `${year}-${month}-${day}`
}

export function getShowtimeDateKey(startsAt: string | undefined): string | null {
  const date = parseDateTime(startsAt)

  if (!date) {
    return null
  }

  const key = localDateKey(date)

  return key || null
}

export function formatShowtimeDate(startsAt: string | undefined): string | null {
  const date = parseDateTime(startsAt)

  if (!date) {
    return null
  }

  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

export function formatShowtimeTime(startsAt: string | undefined): string {
  const date = parseDateTime(startsAt)

  if (!date) {
    return '--:--'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getShowtimeDateOptions(
  showtimes: readonly inventoryApi.ShowtimeResponse[],
): readonly ShowtimeDateOption[] {
  const dates = new Map<string, Date>()

  for (const showtime of showtimes) {
    const date = parseDateTime(showtime.startsAt)

    if (!date) {
      continue
    }

    const key = localDateKey(date)

    if (key && !dates.has(key)) {
      dates.set(key, date)
    }
  }

  return [...dates.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, date]) => ({
      key,

      label: new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }).format(date),
    }))
}

export function filterShowtimesByDate(
  showtimes: readonly inventoryApi.ShowtimeResponse[],
  dateKey: string | null,
): readonly inventoryApi.ShowtimeResponse[] {
  if (!dateKey) {
    return []
  }

  return showtimes.filter((showtime) => getShowtimeDateKey(showtime.startsAt) === dateKey)
}

function showtimeTimestamp(showtime: inventoryApi.ShowtimeResponse): number {
  const date = parseDateTime(showtime.startsAt)

  return date?.getTime() ?? Number.MAX_SAFE_INTEGER
}

export function groupShowtimesByCinema(
  showtimes: readonly inventoryApi.ShowtimeResponse[],
): readonly CinemaShowtimeGroup[] {
  const groups = new Map<
    string,
    {
      cinemaName: string
      showtimes: inventoryApi.ShowtimeResponse[]
    }
  >()

  for (const showtime of showtimes) {
    const cinemaName = showtime.cinemaName?.trim() || 'Rạp chưa xác định'

    const key = showtime.cinemaId?.trim() || cinemaName

    const existing = groups.get(key)

    if (existing) {
      existing.showtimes.push(showtime)
      continue
    }

    groups.set(key, {
      cinemaName,
      showtimes: [showtime],
    })
  }

  return [...groups.entries()]
    .map(([key, group]) => ({
      key,
      cinemaName: group.cinemaName,

      showtimes: [...group.showtimes].sort(
        (first, second) => showtimeTimestamp(first) - showtimeTimestamp(second),
      ),
    }))
    .sort((first, second) => first.cinemaName.localeCompare(second.cinemaName, 'vi'))
}

export function getShowtimeUnavailableReason(
  showtime: inventoryApi.ShowtimeResponse,
  now: Date = new Date(),
): string | null {
  if (!showtime.id?.trim()) {
    return 'Suất chiếu không khả dụng'
  }

  const startsAt = parseDateTime(showtime.startsAt)

  if (!startsAt) {
    return 'Không xác định thời gian chiếu'
  }

  if (startsAt.getTime() <= now.getTime()) {
    return 'Suất chiếu đã bắt đầu'
  }

  switch (showtime.status) {
    case inventoryApi.ShowtimeResponseStatus.OPEN_FOR_BOOKING:
      return null

    case inventoryApi.ShowtimeResponseStatus.SCHEDULED:
      return 'Chưa mở bán'

    case inventoryApi.ShowtimeResponseStatus.CLOSED:
      return 'Đã đóng bán'

    case inventoryApi.ShowtimeResponseStatus.CANCELLED:
      return 'Đã hủy'

    case inventoryApi.ShowtimeResponseStatus.COMPLETED:
      return 'Đã kết thúc'

    default:
      return 'Chưa mở bán'
  }
}

export function isShowtimeBookable(showtime: inventoryApi.ShowtimeResponse, now?: Date): boolean {
  return getShowtimeUnavailableReason(showtime, now) === null
}
