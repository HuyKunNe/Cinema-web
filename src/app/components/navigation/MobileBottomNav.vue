<script setup lang="ts">
import type { Component } from 'vue'
import { CalendarDays, Home, Ticket, UserRound } from '@lucide/vue'

type NavigationItem = Readonly<{
  label: string
  to: string
  icon: Component
  exact?: boolean
}>

const navigationItems: readonly NavigationItem[] = [
  {
    label: 'Trang chủ',
    to: '/',
    icon: Home,
    exact: true,
  },
  {
    label: 'Lịch chiếu',
    to: '/showtimes',
    icon: CalendarDays,
  },
  {
    label: 'Vé của tôi',
    to: '/bookings',
    icon: Ticket,
  },
  {
    label: 'Tài khoản',
    to: '/auth/login',
    icon: UserRound,
  },
]
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-50 border-t border-outline bg-surface-header pb-[env(safe-area-inset-bottom)] md:hidden"
    aria-label="Điều hướng trên thiết bị di động"
  >
    <div class="grid h-16 grid-cols-4">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.to"
        v-slot="{ href, navigate, isActive, isExactActive }"
        :to="item.to"
        custom
      >
        <a
          :href="href"
          :aria-current="(item?.exact ? isExactActive : isActive) ? 'page' : undefined"
          :class="[
            'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-medium transition-colors',
            (item?.exact ? isExactActive : isActive)
              ? 'bg-primary-subtle text-secondary'
              : 'text-content-muted hover:bg-surface-raised hover:text-content',
          ]"
          @click="navigate"
        >
          <component :is="item.icon" :size="21" :stroke-width="1.8" aria-hidden="true" />

          <span>{{ item.label }}</span>
        </a>
      </RouterLink>
    </div>
  </nav>
</template>
