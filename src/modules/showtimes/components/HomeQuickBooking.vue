<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { movieApi } from '@/shared/api'

import { cinemaQueries } from '@/modules/showtimes/api/cinema.queries'

type Props = Readonly<{
  movies: readonly movieApi.MovieResponse[]
}>

defineProps<Props>()

const router = useRouter()

const cinemasQuery = useQuery(cinemaQueries.active())

const cinemas = computed(() => cinemasQuery.data.value ?? [])

const selectedMovieId = ref('')
const selectedCinemaId = ref('')
const selectedDate = ref(getTodayValue())

function getTodayValue(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function searchShowtimes(): void {
  void router.push({
    name: 'showtimes',
    query: {
      ...(selectedMovieId.value ? { movieId: selectedMovieId.value } : {}),
      ...(selectedCinemaId.value ? { cinemaId: selectedCinemaId.value } : {}),
      date: selectedDate.value,
    },
  })
}
</script>

<template>
  <section
    id="quick-booking"
    class="relative z-10 min-h-[84px] rounded-[14px] bg-surface p-4 xl:h-[84px]"
    aria-label="Tìm suất chiếu nhanh"
  >
    <form
      class="grid gap-3 md:grid-cols-2 xl:flex xl:items-center xl:gap-6"
      @submit.prevent="searchShowtimes"
    >
      <label
        class="relative h-[52px] w-full rounded-[10px] border border-outline bg-surface-raised xl:w-[286px]"
      >
        <span class="absolute left-4 top-2 text-xs font-medium text-content-muted">Chọn phim</span>

        <select
          v-model="selectedMovieId"
          class="h-full w-full appearance-none bg-transparent px-4 pb-1 pt-5 text-[13px] font-medium text-content focus-visible:outline-none"
        >
          <option value="">Tất cả phim</option>

          <option v-for="movie in movies" :key="movie.id ?? movie.title" :value="movie.id">
            {{ movie.title ?? 'Phim chưa có tên' }}
          </option>
        </select>
      </label>

      <label
        class="relative h-[52px] w-full rounded-[10px] border border-outline bg-surface-raised xl:w-[286px]"
      >
        <span class="absolute left-4 top-2 text-xs font-medium text-content-muted">Chọn rạp</span>

        <select
          v-model="selectedCinemaId"
          class="h-full w-full appearance-none bg-transparent px-4 pb-1 pt-5 text-[13px] font-medium text-content focus-visible:outline-none disabled:cursor-wait disabled:text-content-muted"
          :disabled="cinemasQuery.isPending.value"
        >
          <option value="">
            {{ cinemasQuery.isPending.value ? 'Đang tải rạp…' : 'Tất cả rạp' }}
          </option>

          <option v-for="cinema in cinemas" :key="cinema.id ?? cinema.name" :value="cinema.id">
            {{ cinema.name ?? 'Rạp chưa có tên' }}
          </option>
        </select>
      </label>

      <label
        class="relative h-[52px] w-full rounded-[10px] border border-outline bg-surface-raised xl:w-[286px]"
      >
        <span class="absolute left-4 top-2 text-xs font-medium text-content-muted">Chọn ngày</span>

        <input
          v-model="selectedDate"
          type="date"
          class="h-full w-full bg-transparent px-4 pb-1 pt-5 text-[13px] font-medium text-content focus-visible:outline-none"
          required
        />
      </label>

      <button
        type="submit"
        class="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-primary text-sm font-semibold text-content transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary xl:ml-2 xl:w-80"
      >
        Tìm suất chiếu
      </button>
    </form>

    <p v-if="cinemasQuery.error.value" class="sr-only" role="alert">
      Không thể tải danh sách rạp. Bạn vẫn có thể tìm kiếm theo phim và ngày.
    </p>
  </section>
</template>
