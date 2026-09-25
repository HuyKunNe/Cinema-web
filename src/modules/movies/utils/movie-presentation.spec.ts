import { describe, expect, it } from 'vitest'

import { movieApi } from '@/shared/api'

import {
  formatMovieDuration,
  formatMovieReleaseDate,
  getMovieGenreLabel,
  getMovieStatusLabel,
} from './movie-presentation'

describe('movie presentation', () => {
  it('maps movie statuses to Vietnamese labels', () => {
    expect(getMovieStatusLabel(movieApi.MovieResponseStatus.NOW_SHOWING)).toBe('Đang chiếu')

    expect(getMovieStatusLabel(movieApi.MovieResponseStatus.UPCOMING)).toBe('Sắp chiếu')
  })

  it('handles a missing movie status', () => {
    expect(getMovieStatusLabel(undefined)).toBe('Chưa xác định')
  })

  it('formats movie duration', () => {
    expect(formatMovieDuration(120)).toBe('120 phút')

    expect(formatMovieDuration(undefined)).toBeNull()

    expect(formatMovieDuration(0)).toBeNull()
  })

  it('formats a backend local release date', () => {
    expect(formatMovieReleaseDate('2026-09-25')).toContain('2026')
  })

  it('joins available genre names', () => {
    expect(
      getMovieGenreLabel([
        {
          name: 'Hành động',
        },
        {
          name: 'Phiêu lưu',
        },
      ]),
    ).toBe('Hành động · Phiêu lưu')
  })

  it('ignores empty genre names', () => {
    expect(
      getMovieGenreLabel([
        {
          name: '',
        },
        {},
      ]),
    ).toBeNull()
  })
})
