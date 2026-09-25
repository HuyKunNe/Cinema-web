import { movieApi } from '@/shared/api'

const MOVIE_STATUS_LABELS: Record<movieApi.MovieResponseStatus, string> = {
  UPCOMING: 'Sắp chiếu',
  NOW_SHOWING: 'Đang chiếu',
  ENDED: 'Đã kết thúc',
  INACTIVE: 'Ngừng hiển thị',
}

export function getMovieStatusLabel(status: movieApi.MovieResponseStatus | undefined): string {
  if (!status) {
    return 'Chưa xác định'
  }

  return MOVIE_STATUS_LABELS[status]
}

export function formatMovieDuration(durationMinutes: number | undefined): string | null {
  if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
    return null
  }

  return `${durationMinutes} phút`
}

export function formatMovieReleaseDate(releaseDate: string | undefined): string | null {
  if (!releaseDate) {
    return null
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(releaseDate)

  if (!match) {
    return releaseDate
  }

  const [, year, month, day] = match

  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
  }).format(date)
}

export function getMovieGenreLabel(
  genres: readonly movieApi.GenreResponse[] | undefined,
): string | null {
  const names =
    genres?.map((genre) => genre.name?.trim()).filter((name): name is string => Boolean(name)) ?? []

  return names.length > 0 ? names.join(' · ') : null
}

export function getSafeMovieTrailerUrl(value: string | undefined): string | null {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}
