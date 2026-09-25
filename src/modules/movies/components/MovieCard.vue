<script setup lang="ts">
import { computed, ref } from 'vue'
import { Film } from '@lucide/vue'

import { movieApi } from '@/shared/api'

import {
  formatMovieDuration,
  formatMovieReleaseDate,
  getMovieGenreLabel,
  getMovieStatusLabel,
} from '@/modules/movies/utils/movie-presentation'

type Props = Readonly<{
  movie: movieApi.MovieResponse
}>

const props = defineProps<Props>()

const posterFailed = ref(false)

const title = computed(() => props.movie.title?.trim() || 'Phim chưa có tên')

const showPoster = computed(() => Boolean(props.movie.posterUrl) && !posterFailed.value)

const duration = computed(() => formatMovieDuration(props.movie.durationMinutes))

const releaseDate = computed(() => formatMovieReleaseDate(props.movie.releaseDate))

const genres = computed(() => getMovieGenreLabel(props.movie.genres))

const statusLabel = computed(() => getMovieStatusLabel(props.movie.status))

const statusClass = computed(() => {
  switch (props.movie.status) {
    case movieApi.MovieResponseStatus.NOW_SHOWING:
      return 'border-success text-success'

    case movieApi.MovieResponseStatus.UPCOMING:
      return 'border-secondary text-secondary'

    case movieApi.MovieResponseStatus.ENDED:
      return 'border-outline text-content-muted'

    case movieApi.MovieResponseStatus.INACTIVE:
      return 'border-danger text-danger'

    default:
      return 'border-outline text-content-muted'
  }
})
</script>

<template>
  <article class="group overflow-hidden rounded-2xl border border-outline bg-surface">
    <div class="aspect-[2/3] overflow-hidden bg-surface-raised">
      <img
        v-if="showPoster"
        :src="movie.posterUrl"
        :alt="`Poster phim ${title}`"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
        @error="posterFailed = true"
      />

      <div
        v-else
        class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-content-muted"
        role="img"
        :aria-label="`Chưa có poster cho phim ${title}`"
      >
        <Film class="h-10 w-10" aria-hidden="true" />

        <span class="text-sm"> Chưa có poster </span>
      </div>
    </div>

    <div class="space-y-4 p-5">
      <div class="flex items-start justify-between gap-3">
        <h2 class="min-w-0 text-lg font-bold leading-6 text-content">
          {{ title }}
        </h2>

        <span
          class="shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold"
          :class="statusClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <p v-if="genres" class="text-sm text-content-muted">
        {{ genres }}
      </p>

      <dl v-if="duration || releaseDate" class="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <div v-if="duration">
          <dt class="sr-only">Thời lượng</dt>

          <dd class="text-content-muted">
            {{ duration }}
          </dd>
        </div>

        <div v-if="releaseDate">
          <dt class="sr-only">Ngày phát hành</dt>

          <dd class="text-content-muted">
            {{ releaseDate }}
          </dd>
        </div>
      </dl>

      <p v-if="movie.description" class="line-clamp-3 text-sm leading-6 text-content-muted">
        {{ movie.description }}
      </p>
      <RouterLink
        v-if="movie.id"
        :to="{
          name: 'movie-detail',
          params: {
            movieId: movie.id,
          },
        }"
        class="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-semibold text-content transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        :aria-label="`Xem chi tiết phim ${title}`"
      >
        Xem chi tiết
      </RouterLink>
    </div>
  </article>
</template>
