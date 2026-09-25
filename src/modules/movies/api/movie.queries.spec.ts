import { describe, expect, expectTypeOf, it } from 'vitest'

import type { movieApi } from '@/shared/api'

import { movieQueries, movieQueryKeys } from './movie.queries'

describe('movie queries', () => {
  it('creates stable movie query keys', () => {
    expect(movieQueryKeys.all).toEqual(['movie'])

    expect(movieQueryKeys.list()).toEqual(['movie', 'list'])

    expect(movieQueryKeys.detail('movie-123')).toEqual(['movie', 'detail', 'movie-123'])
  })

  it('binds the movie list query to the list key', () => {
    const options = movieQueries.list()

    expect(options.queryKey).toEqual(['movie', 'list'])

    expectTypeOf<Awaited<ReturnType<typeof movieApi.listMovies>>>().toEqualTypeOf<
      movieApi.MovieResponse[]
    >()
  })

  it('binds movie detail to its movie ID', () => {
    const options = movieQueries.detail('movie-123')

    expect(options.queryKey).toEqual(['movie', 'detail', 'movie-123'])
  })
})
