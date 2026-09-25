<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { ArrowLeft, Film, Play, RefreshCw } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import { movieQueries } from '@/modules/movies/api/movie.queries'
import {
  formatMovieDuration,
  formatMovieReleaseDate,
  getMovieGenreLabel,
  getMovieStatusLabel,
  getSafeMovieTrailerUrl,
} from '@/modules/movies/utils/movie-presentation'
import { showtimeQueries } from '@/modules/showtimes/api/showtime.queries'
import {
  filterShowtimesByDate,
  formatShowtimeTime,
  getShowtimeDateOptions,
  getShowtimeUnavailableReason,
  groupShowtimesByCinema,
  isShowtimeBookable,
} from '@/modules/showtimes/utils/showtime-presentation'

const route = useRoute()
const router = useRouter()

const titleId = useId()
const posterFailed = ref(false)

const movieId = computed(() => {
  const value = route.params.movieId

  return typeof value === 'string' ? value.trim() : ''
})

const movieQuery = useQuery(computed(() => movieQueries.detail(movieId.value)))

const showtimesQuery = useQuery(computed(() => showtimeQueries.byMovie(movieId.value)))

const movie = computed(() => movieQuery.data.value ?? null)

const movieError = computed(() => movieQuery.error.value)

const showtimeError = computed(() => showtimesQuery.error.value)

const showtimes = computed(() => showtimesQuery.data.value ?? [])

const title = computed(() => movie.value?.title?.trim() || 'Phim chưa có tên')

const duration = computed(() => formatMovieDuration(movie.value?.durationMinutes))

const releaseDate = computed(() => formatMovieReleaseDate(movie.value?.releaseDate))

const genres = computed(() => getMovieGenreLabel(movie.value?.genres))

const statusLabel = computed(() => getMovieStatusLabel(movie.value?.status))

const trailerUrl = computed(() => getSafeMovieTrailerUrl(movie.value?.trailerUrl))

const showPoster = computed(() => Boolean(movie.value?.posterUrl) && !posterFailed.value)

const dateOptions = computed(() => getShowtimeDateOptions(showtimes.value))

const requestedDate = computed(() =>
  typeof route.query.date === 'string' ? route.query.date : null,
)

const selectedDate = computed(() => {
  const requested = requestedDate.value

  if (requested && dateOptions.value.some((option) => option.key === requested)) {
    return requested
  }

  return dateOptions.value[0]?.key ?? null
})

const selectedShowtimes = computed(() => filterShowtimesByDate(showtimes.value, selectedDate.value))

const cinemaGroups = computed(() => groupShowtimesByCinema(selectedShowtimes.value))

watch(
  [dateOptions, requestedDate],
  ([options, requested]) => {
    const fallback = options[0]?.key

    if (!fallback) {
      return
    }

    if (requested && options.some((option) => option.key === requested)) {
      return
    }

    void router.replace({
      query: {
        ...route.query,
        date: fallback,
      },
    })
  },
  {
    immediate: true,
  },
)

function selectDate(date: string): void {
  void router.replace({
    query: {
      ...route.query,
      date,
    },
  })
}

function retryMovie(): void {
  void movieQuery.refetch()
}

function retryShowtimes(): void {
  void showtimesQuery.refetch()
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
    <RouterLink
      to="/movies"
      class="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-content-muted transition-colors hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
    >
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />

      Danh sách phim
    </RouterLink>

    <!-- Movie loading -->
    <section
      v-if="movieQuery.isPending.value"
      class="mt-8 grid gap-8 lg:grid-cols-[minmax(240px,320px)_1fr]"
      aria-label="Đang tải thông tin phim"
    >
      <div class="aspect-[2/3] animate-pulse rounded-2xl bg-surface-raised" aria-hidden="true" />

      <div class="space-y-5" aria-hidden="true">
        <div class="h-10 w-3/4 animate-pulse rounded bg-surface-raised" />

        <div class="h-5 w-1/2 animate-pulse rounded bg-surface-raised" />

        <div class="h-32 w-full animate-pulse rounded bg-surface-raised" />
      </div>
    </section>

    <!-- Movie not found -->
    <section
      v-else-if="movieError?.status === 404"
      class="mt-8 rounded-2xl border border-outline bg-surface p-8"
      role="alert"
    >
      <h1 class="text-2xl font-bold">Không tìm thấy phim</h1>

      <p class="mt-3 text-content-muted">Phim này không tồn tại hoặc không còn khả dụng.</p>

      <RouterLink
        to="/movies"
        class="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
      >
        Xem danh sách phim
      </RouterLink>
    </section>

    <!-- Movie error -->
    <section
      v-else-if="movieError"
      class="mt-8 rounded-2xl border border-danger bg-surface p-8"
      role="alert"
    >
      <h1 class="text-2xl font-bold">Không thể tải thông tin phim</h1>

      <p class="mt-3 text-content-muted">
        {{ movieError.message }}
      </p>

      <p v-if="movieError.requestId" class="mt-2 text-sm text-content-muted">
        Mã yêu cầu:
        {{ movieError.requestId }}
      </p>

      <button
        type="button"
        class="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
        @click="retryMovie"
      >
        <RefreshCw class="h-4 w-4" aria-hidden="true" />

        Thử lại
      </button>
    </section>

    <template v-else-if="movie">
      <!-- Movie detail -->
      <section
        class="mt-8 grid gap-8 lg:grid-cols-[minmax(240px,320px)_1fr] lg:gap-12"
        :aria-labelledby="titleId"
      >
        <div class="aspect-[2/3] overflow-hidden rounded-2xl border border-outline bg-surface">
          <img
            v-if="showPoster"
            :src="movie.posterUrl"
            :alt="`Poster phim ${title}`"
            class="h-full w-full object-cover"
            @error="posterFailed = true"
          />

          <div
            v-else
            class="flex h-full flex-col items-center justify-center gap-3 text-content-muted"
            role="img"
            :aria-label="`Chưa có poster cho phim ${title}`"
          >
            <Film class="h-12 w-12" aria-hidden="true" />

            <span> Chưa có poster </span>
          </div>
        </div>

        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-hover">
            Chi tiết phim
          </p>

          <h1 :id="titleId" class="mt-3 text-3xl font-bold md:text-5xl">
            {{ title }}
          </h1>

          <div class="mt-5 flex flex-wrap gap-2">
            <span class="rounded-full border border-outline px-3 py-1.5 text-sm">
              {{ statusLabel }}
            </span>

            <span
              v-if="duration"
              class="rounded-full border border-outline px-3 py-1.5 text-sm text-content-muted"
            >
              {{ duration }}
            </span>

            <span
              v-if="releaseDate"
              class="rounded-full border border-outline px-3 py-1.5 text-sm text-content-muted"
            >
              {{ releaseDate }}
            </span>
          </div>

          <p v-if="genres" class="mt-5 text-sm font-medium text-secondary">
            {{ genres }}
          </p>

          <p
            v-if="movie.description"
            class="mt-6 max-w-3xl whitespace-pre-line leading-7 text-content-muted"
          >
            {{ movie.description }}
          </p>

          <p v-else class="mt-6 text-content-muted">Chưa có mô tả cho phim này.</p>

          <a
            v-if="trailerUrl"
            :href="trailerUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl border border-outline px-5 py-3 font-semibold transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Play class="h-4 w-4" aria-hidden="true" />

            Xem trailer
          </a>
        </div>
      </section>

      <!-- Showtimes -->
      <section class="mt-14 border-t border-outline pt-10" aria-labelledby="showtimes-title">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-hover">
              Lịch chiếu
            </p>

            <h2 id="showtimes-title" class="mt-2 text-2xl font-bold md:text-3xl">
              Chọn suất chiếu
            </h2>
          </div>

          <p
            v-if="showtimesQuery.isFetching.value && !showtimesQuery.isPending.value"
            class="text-sm text-content-muted"
            aria-live="polite"
          >
            Đang cập nhật lịch chiếu…
          </p>
        </div>

        <!-- Showtime loading -->
        <div
          v-if="showtimesQuery.isPending.value"
          class="mt-8 space-y-6"
          aria-label="Đang tải lịch chiếu"
        >
          <div class="flex gap-3" aria-hidden="true">
            <div
              v-for="index in 4"
              :key="index"
              class="h-11 w-28 animate-pulse rounded-xl bg-surface-raised"
            />
          </div>

          <div class="h-36 animate-pulse rounded-2xl bg-surface-raised" aria-hidden="true" />
        </div>

        <!-- Showtime error -->
        <div
          v-else-if="showtimeError"
          class="mt-8 rounded-2xl border border-danger bg-surface p-6"
          role="alert"
        >
          <h3 class="text-lg font-bold">Không thể tải lịch chiếu</h3>

          <p class="mt-2 text-content-muted">
            {{ showtimeError.message }}
          </p>

          <p v-if="showtimeError.requestId" class="mt-2 text-sm text-content-muted">
            Mã yêu cầu:
            {{ showtimeError.requestId }}
          </p>

          <button
            type="button"
            class="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
            @click="retryShowtimes"
          >
            <RefreshCw class="h-4 w-4" aria-hidden="true" />

            Thử lại
          </button>
        </div>

        <!-- No showtimes -->
        <div
          v-else-if="showtimes.length === 0"
          class="mt-8 rounded-2xl border border-outline bg-surface p-8 text-center"
        >
          <h3 class="text-lg font-bold">Chưa có lịch chiếu</h3>

          <p class="mt-2 text-content-muted">Hiện chưa có suất chiếu cho phim này.</p>
        </div>

        <template v-else>
          <!-- Date selector -->
          <div class="mt-8 flex gap-3 overflow-x-auto pb-2" aria-label="Chọn ngày chiếu">
            <button
              v-for="option in dateOptions"
              :key="option.key"
              type="button"
              class="min-h-11 shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              :class="
                selectedDate === option.key
                  ? 'border-primary bg-primary text-content'
                  : 'border-outline bg-surface text-content-muted hover:bg-surface-raised hover:text-content'
              "
              :aria-pressed="selectedDate === option.key"
              @click="selectDate(option.key)"
            >
              {{ option.label }}
            </button>
          </div>

          <!-- No showtimes selected day -->
          <div
            v-if="cinemaGroups.length === 0"
            class="mt-8 rounded-2xl border border-outline bg-surface p-8 text-center"
          >
            <h3 class="text-lg font-bold">Không có suất chiếu trong ngày này</h3>

            <p class="mt-2 text-content-muted">Chọn một ngày khác để xem các suất còn lại.</p>
          </div>

          <!-- Cinema groups -->
          <div v-else class="mt-8 space-y-6">
            <article
              v-for="group in cinemaGroups"
              :key="group.key"
              class="rounded-2xl border border-outline bg-surface p-5 md:p-6"
            >
              <h3 class="text-lg font-bold">
                {{ group.cinemaName }}
              </h3>

              <div class="mt-5 flex flex-wrap gap-3">
                <div
                  v-for="showtime in group.showtimes"
                  :key="showtime.id ?? `${showtime.roomId}-${showtime.startsAt}`"
                  class="min-w-24"
                >
                  <RouterLink
                    v-if="isShowtimeBookable(showtime)"
                    :to="{
                      name: 'showtime-seats',
                      params: {
                        showtimeId: showtime.id ?? '',
                      },
                    }"
                    class="flex min-h-11 flex-col items-center justify-center rounded-xl border border-primary px-4 py-2 text-center font-semibold transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    <span>
                      {{ formatShowtimeTime(showtime.startsAt) }}
                    </span>

                    <span
                      v-if="showtime.roomName"
                      class="mt-0.5 text-xs font-normal text-content-muted"
                    >
                      {{ showtime.roomName }}
                    </span>
                  </RouterLink>

                  <div v-else class="text-center">
                    <button
                      type="button"
                      disabled
                      class="min-h-11 w-full cursor-not-allowed rounded-xl border border-outline bg-surface-raised px-4 py-2 text-content-muted opacity-70"
                    >
                      {{ formatShowtimeTime(showtime.startsAt) }}
                    </button>

                    <span class="mt-1 block max-w-32 text-xs text-content-muted">
                      {{ getShowtimeUnavailableReason(showtime) }}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>
