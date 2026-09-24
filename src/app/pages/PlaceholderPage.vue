<script setup lang="ts">
import { useId } from 'vue'

type Props = {
  eyebrow?: string
  title: string
  description: string
  backTo?: string
  backLabel?: string
}

withDefaults(defineProps<Props>(), {
  eyebrow: 'Đang phát triển',
  backTo: '/',
  backLabel: 'Về trang chủ',
})

const titleId = useId()
</script>

<template>
  <section
    class="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center px-4 py-16 md:px-8"
    :aria-labelledby="titleId"
  >
    <div class="max-w-2xl rounded-2xl border border-outline bg-surface p-6 md:p-10">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-hover">
        {{ eyebrow }}
      </p>

      <h1 :id="titleId" class="mt-3 text-3xl font-bold md:text-5xl">
        {{ title }}
      </h1>

      <p class="mt-5 max-w-xl leading-7 text-content-muted">
        {{ description }}
      </p>

      <RouterLink
        :to="backTo"
        class="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-content transition-colors hover:bg-primary-hover"
      >
        {{ backLabel }}
      </RouterLink>
    </div>
  </section>
</template>
