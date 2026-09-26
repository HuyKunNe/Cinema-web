<script setup lang="ts">
import { computed, useId } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { RefreshCw } from '@lucide/vue'

import { movieApi } from '@/shared/api'

import { movieQueries } from '@/modules/movies/api/movie.queries'
import HomeMovieCard from '@/modules/movies/components/HomeMovieCard.vue'
import HomeHero from '@/modules/movies/components/HomeHero.vue'
import HomePromotionStrip from '@/modules/movies/components/HomePromotionStrip.vue'
import { HomeQuickBooking } from '@/modules/showtimes'

const nowShowingTitleId = useId()

const moviesQuery = useQuery(movieQueries.list())

const nowShowingMovies = computed(() =>
  (moviesQuery.data.value ?? [])
    .filter((movie) => movie.status === movieApi.MovieResponseStatus.NOW_SHOWING)
    .slice(0, 6),
)

const featuredMovie = computed(() => nowShowingMovies.value[0])

const error = computed(() => moviesQuery.error.value)

function retry(): void {
  void moviesQuery.refetch()
}
</script>

<template>
  <div class="overflow-hidden bg-background">
    <HomeHero :movie="featuredMovie" />

    <div class="px-4 md:px-8">
      <div class="mx-auto max-w-[1300px]">
        <HomeQuickBooking
          class="-mt-[7px] xl:-translate-x-[10px]"
          :movies="nowShowingMovies"
        />

        <section class="mt-[7px]" :aria-labelledby="nowShowingTitleId">
          <h2 :id="nowShowingTitleId" class="text-[23px] font-bold leading-7 text-content">
            Phim đang chiếu
          </h2>

          <div
            class="mt-[7px] h-[3px] w-[34px] rounded-sm bg-primary"
            aria-hidden="true"
          />

          <p
            v-if="moviesQuery.isFetching.value && !moviesQuery.isPending.value"
            class="mt-4 text-sm text-content-muted"
            aria-live="polite"
          >
            Đang cập nhật danh sách phim…
          </p>

          <div
            v-if="moviesQuery.isPending.value"
            class="mt-[15px] flex gap-[18px] overflow-x-auto pb-2"
            aria-label="Đang tải phim đang chiếu"
          >
            <article
              v-for="index in 6"
              :key="index"
              class="h-[270px] w-[200px] shrink-0 overflow-hidden rounded-[13px] bg-surface"
              aria-hidden="true"
            >
              <div class="h-[188px] animate-pulse bg-surface-raised" />

              <div class="space-y-3 p-3">
                <div class="h-[17px] w-4/5 animate-pulse rounded bg-surface-raised" />

                <div class="h-[13px] w-3/5 animate-pulse rounded bg-surface-raised" />
              </div>
            </article>
          </div>

          <div
            v-else-if="error"
            class="mt-[15px] rounded-[13px] border border-danger bg-surface p-6"
            role="alert"
          >
            <h3 class="text-lg font-bold text-content">Không thể tải phim đang chiếu</h3>

            <p class="mt-2 text-sm leading-6 text-content-muted">
              {{ error.message }}
            </p>

            <p v-if="error.requestId" class="mt-2 text-xs text-content-muted">
              Mã yêu cầu: {{ error.requestId }}
            </p>

            <button
              type="button"
              class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-content transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="moviesQuery.isFetching.value"
              :aria-busy="moviesQuery.isFetching.value"
              @click="retry"
            >
              <RefreshCw class="h-4 w-4" aria-hidden="true" />

              Thử lại
            </button>
          </div>

          <div
            v-else-if="nowShowingMovies.length === 0"
            class="mt-[15px] rounded-[13px] border border-outline bg-surface p-6 text-center"
          >
            <h3 class="text-lg font-bold text-content">Chưa có phim đang chiếu</h3>

            <p class="mt-2 text-sm leading-6 text-content-muted">
              Danh sách sẽ xuất hiện khi có phim được mở lịch chiếu.
            </p>
          </div>

          <div v-else class="mt-[15px] flex gap-[18px] overflow-x-auto">
            <HomeMovieCard
              v-for="movie in nowShowingMovies"
              :key="movie.id ?? `${movie.title}-${movie.releaseDate}`"
              :movie="movie"
            />
          </div>
        </section>

        <HomePromotionStrip class="mt-[29px] mb-[14px]" />
      </div>
    </div>
  </div>
</template>
