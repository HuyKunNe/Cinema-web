<script setup lang="ts">
const navigationItems = [
  {
    label: 'Phim',
    to: '/movies',
  },
  {
    label: 'Lịch chiếu',
    to: '/showtimes',
  },
  {
    label: 'Vé của tôi',
    to: '/bookings',
  },
] as const
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-outline bg-surface-header">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-8">
      <RouterLink
        to="/"
        aria-label="Cinema - Trang chủ"
        class="shrink-0 text-xl font-bold tracking-[0.18em] text-secondary"
      >
        CINEMA
      </RouterLink>

      <nav class="hidden min-w-0 flex-1 items-center gap-1 md:flex" aria-label="Điều hướng chính">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.to"
          v-slot="{ href, navigate, isActive }"
          :to="item.to"
          custom
        >
          <a
            :href="href"
            :aria-current="isActive ? 'page' : undefined"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-subtle text-content'
                : 'text-content-muted hover:bg-surface-raised hover:text-content',
            ]"
            @click="navigate"
          >
            {{ item.label }}
          </a>
        </RouterLink>
      </nav>

      <RouterLink
        to="/auth/login"
        class="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-content transition-colors hover:bg-primary-hover"
      >
        Đăng nhập
      </RouterLink>
    </div>
  </header>
</template>
