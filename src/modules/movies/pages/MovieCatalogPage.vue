<script setup lang="ts">
import { computed, useId } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { RefreshCw } from '@lucide/vue'

import MovieCard from '@/modules/movies/components/MovieCard.vue'
import { movieQueries } from '@/modules/movies/api/movie.queries'

const titleId = useId()

const moviesQuery = useQuery(movieQueries.list())

const movies = computed(() => moviesQuery.data.value ?? [])

const error = computed(() => moviesQuery.error.value)

function retry(): void {
  void moviesQuery.refetch()
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14" :aria-labelledby="titleId">
    <header class="max-w-3xl">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-hover">Khám phá</p>

      <h1 :id="titleId" class="mt-3 text-3xl font-bold md:text-5xl">Phim</h1>

      <p class="mt-4 leading-7 text-content-muted">
        Khám phá các phim đang chiếu, sắp chiếu và thông tin phát hành từ Cinema.
      </p>
    </header>

    <p
      v-if="moviesQuery.isFetching.value && !moviesQuery.isPending.value"
      class="mt-6 text-sm text-content-muted"
      aria-live="polite"
    >
      Đang cập nhật danh sách phim…
    </p>

    <!-- Initial loading -->
    <div
      v-if="moviesQuery.isPending.value"
      class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Đang tải danh sách phim"
    >
      <article
        v-for="index in 8"
        :key="index"
        class="overflow-hidden rounded-2xl border border-outline bg-surface"
        aria-hidden="true"
      >
        <div class="aspect-[2/3] animate-pulse bg-surface-raised" />

        <div class="space-y-3 p-5">
          <div class="h-5 w-3/4 animate-pulse rounded bg-surface-raised" />

          <div class="h-4 w-1/2 animate-pulse rounded bg-surface-raised" />

          <div class="h-4 w-full animate-pulse rounded bg-surface-raised" />
        </div>
      </article>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="mt-10 rounded-2xl border border-danger bg-surface p-6 md:p-8"
      role="alert"
    >
      <h2 class="text-xl font-bold">Không thể tải danh sách phim</h2>

      <p class="mt-3 max-w-xl leading-7 text-content-muted">
        {{ error.message }}
      </p>

      <p v-if="error.requestId" class="mt-2 text-sm text-content-muted">
        Mã yêu cầu:
        {{ error.requestId }}
      </p>

      <button
        type="button"
        class="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-content transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="moviesQuery.isFetching.value"
        @click="retry"
      >
        <RefreshCw class="h-4 w-4" aria-hidden="true" />

        Thử lại
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="movies.length === 0"
      class="mt-10 rounded-2xl border border-outline bg-surface p-8 text-center md:p-12"
    >
      <h2 class="text-xl font-bold">Chưa có phim</h2>

      <p class="mx-auto mt-3 max-w-xl leading-7 text-content-muted">
        Hiện chưa có phim nào trong catalog. Danh sách sẽ xuất hiện khi dữ liệu được cập nhật.
      </p>
    </div>

    <!-- Content -->
    <div v-else class="mt-10 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <MovieCard
        v-for="movie in movies"
        :key="movie.id ?? `${movie.title}-${movie.releaseDate}`"
        :movie="movie"
      />
    </div>
  </section>
</template>
