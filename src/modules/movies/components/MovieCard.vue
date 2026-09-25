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
  <article
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-outline bg-surface"
  >
    <!-- Poster -->
    <div class="aspect-[2/3] shrink-0 overflow-hidden bg-surface-raised">
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

    <!-- Content -->
    <div class="flex flex-1 flex-col p-5">
      <!-- Title + status -->
      <div class="flex min-h-12 items-start justify-between gap-3">
        <h2 class="line-clamp-2 min-w-0 flex-1 text-lg font-bold leading-6 text-content">
          {{ title }}
        </h2>

        <span
          class="shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold leading-4"
          :class="statusClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Genre -->
      <div class="mt-3 min-h-5">
        <p v-if="genres" class="line-clamp-1 text-sm leading-5 text-content-muted" :title="genres">
          {{ genres }}
        </p>

        <p v-else class="text-sm leading-5 text-content-muted opacity-60">Chưa cập nhật thể loại</p>
      </div>

      <!-- Metadata -->
      <dl class="mt-3 grid min-h-10 grid-cols-2 gap-3 text-sm">
        <div>
          <dt class="text-xs leading-4 text-content-muted opacity-70">Thời lượng</dt>

          <dd class="mt-1 truncate leading-5 text-content-muted">
            {{ duration ?? 'Chưa cập nhật' }}
          </dd>
        </div>

        <div>
          <dt class="text-xs leading-4 text-content-muted opacity-70">Khởi chiếu</dt>

          <dd class="mt-1 truncate leading-5 text-content-muted">
            {{ releaseDate ?? 'Chưa cập nhật' }}
          </dd>
        </div>
      </dl>

      <!-- Description -->
      <div class="mt-4 min-h-[4.5rem]">
        <p v-if="movie.description" class="line-clamp-3 text-sm leading-6 text-content-muted">
          {{ movie.description }}
        </p>

        <p v-else class="text-sm leading-6 text-content-muted opacity-60">
          Chưa có mô tả cho phim này.
        </p>
      </div>

      <!-- CTA -->
      <RouterLink
        v-if="movie.id"
        :to="{
          name: 'movie-detail',
          params: {
            movieId: movie.id,
          },
        }"
        class="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-semibold text-content transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        :aria-label="`Xem chi tiết phim ${title}`"
      >
        Xem chi tiết
      </RouterLink>
    </div>
  </article>
</template>
