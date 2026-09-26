<script setup lang="ts">
import { computed } from 'vue'

import { movieApi } from '@/shared/api'

type Props = Readonly<{
  movie?: movieApi.MovieResponse
}>

const props = defineProps<Props>()

const title = computed(() => props.movie?.title?.trim() || 'CINEMA')

const description = computed(
  () =>
    props.movie?.description?.trim() ||
    'Khám phá những bộ phim đang chiếu và chọn suất chiếu phù hợp với bạn.',
)

const releaseLabel = computed(() => {
  const releaseDate = props.movie?.releaseDate
  const match = releaseDate ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(releaseDate) : null

  if (!match) {
    return 'Đang chiếu tại Cinema'
  }

  const [, , month, day] = match

  return `Khởi chiếu ${day}.${month}`
})

const bookingTarget = computed(() => {
  if (!props.movie?.id) {
    return '/movies'
  }

  return {
    name: 'movie-detail',
    params: {
      movieId: props.movie.id,
    },
  }
})
</script>

<template>
  <section class="h-[300px] overflow-hidden bg-hero-background" aria-labelledby="home-hero-title">
    <div
      class="mx-auto flex h-full max-w-[1300px] justify-between px-4 md:px-8 min-[1364px]:px-0"
    >
      <div class="min-w-0 pt-[60px]">
        <h1
          id="home-hero-title"
          class="truncate text-[54px] font-bold uppercase leading-[65px] text-content"
        >
          {{ title }}
        </h1>

        <p class="mt-[3px] text-xl font-semibold leading-6 text-secondary">
          {{ releaseLabel }}
        </p>

        <p class="mt-[14px] max-w-[620px] truncate text-[15px] leading-[18px] text-content">
          {{ description }}
        </p>

        <RouterLink
          :to="bookingTarget"
          class="mt-6 inline-flex h-12 w-[190px] items-center justify-center rounded-[10px] bg-primary text-sm font-semibold text-content transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Đặt vé ngay
        </RouterLink>
      </div>

      <div
        class="relative mt-5 mr-[70px] hidden h-[260px] w-[260px] shrink-0 overflow-hidden rounded-xl bg-hero-artwork lg:block"
        aria-hidden="true"
      >
        <div class="absolute left-[78px] top-[21px] h-[104px] w-[104px] rounded-full bg-hero-moon" />

        <div
          class="absolute left-[112px] top-[81px] h-[135px] w-9 rounded-[22px] bg-background"
        />
      </div>
    </div>
  </section>
</template>
