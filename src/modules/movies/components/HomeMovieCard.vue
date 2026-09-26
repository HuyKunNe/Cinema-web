<script setup lang="ts">
import { computed, ref } from 'vue'
import { Film } from '@lucide/vue'

import { movieApi } from '@/shared/api'

import {
  formatMovieDuration,
  getMovieGenreLabel,
} from '@/modules/movies/utils/movie-presentation'

type Props = Readonly<{
  movie: movieApi.MovieResponse
}>

const props = defineProps<Props>()

const posterFailed = ref(false)

const title = computed(() => props.movie.title?.trim() || 'Phim chưa có tên')

const showPoster = computed(() => Boolean(props.movie.posterUrl) && !posterFailed.value)

const metadata = computed(() => {
  const genres = getMovieGenreLabel(props.movie.genres)
  const duration = formatMovieDuration(props.movie.durationMinutes)

  if (genres && duration) {
    return `${genres} • ${duration}`
  }

  return genres ?? duration ?? 'Chưa cập nhật'
})
</script>

<template>
  <RouterLink
    v-if="movie.id"
    :to="{
      name: 'movie-detail',
      params: {
        movieId: movie.id,
      },
    }"
    class="group relative block h-[270px] w-[200px] shrink-0 overflow-hidden rounded-[13px] bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
    :aria-label="`Xem chi tiết phim ${title}`"
  >
    <div class="h-[188px] overflow-hidden bg-surface-raised">
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
        class="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-content-muted"
        role="img"
        :aria-label="`Chưa có poster cho phim ${title}`"
      >
        <Film class="h-8 w-8" aria-hidden="true" />

        <span class="text-xs">Chưa có poster</span>
      </div>
    </div>

    <h3
      class="absolute left-3 top-[204px] line-clamp-2 w-[176px] text-sm font-bold leading-[17px] text-content"
    >
      {{ title }}
    </h3>

    <p
      class="absolute bottom-[13px] left-3 w-[176px] truncate text-[11px] leading-[13px] text-content-muted"
      :title="metadata"
    >
      {{ metadata }}
    </p>
  </RouterLink>

  <article
    v-else
    class="relative h-[270px] w-[200px] shrink-0 overflow-hidden rounded-[13px] bg-surface"
  >
    <div class="flex h-[188px] items-center justify-center bg-surface-raised text-content-muted">
      <Film class="h-8 w-8" aria-hidden="true" />
    </div>

    <h3
      class="absolute left-3 top-[204px] line-clamp-2 w-[176px] text-sm font-bold leading-[17px] text-content"
    >
      {{ title }}
    </h3>

    <p
      class="absolute bottom-[13px] left-3 w-[176px] truncate text-[11px] leading-[13px] text-content-muted"
      :title="metadata"
    >
      {{ metadata }}
    </p>
  </article>
</template>
