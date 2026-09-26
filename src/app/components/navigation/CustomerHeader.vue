<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useAuth } from '@/modules/auth/composables/useAuth'

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
    label: 'Rạp',
    to: {
      path: '/',
      hash: '#quick-booking',
    },
  },
  {
    label: 'Khuyến mãi',
    to: {
      path: '/',
      hash: '#promotions',
    },
  },
] as const

const route = useRoute()

const { isAuthenticated, initialize, signIn, signOut } = useAuth()

const isSigningIn = ref(false)
const isSigningOut = ref(false)
const authError = ref<string | null>(null)

onMounted(() => {
  void initialize()
})

async function handleSignIn(): Promise<void> {
  isSigningIn.value = true
  authError.value = null

  try {
    const returnUrl = route.fullPath === '/' ? '/' : route.fullPath

    await signIn(returnUrl)
  } catch {
    authError.value = 'Không thể bắt đầu đăng nhập.'
    isSigningIn.value = false
  }
}

async function handleSignOut(): Promise<void> {
  isSigningOut.value = true
  authError.value = null

  try {
    await signOut()
  } catch {
    authError.value = 'Không thể hoàn tất đăng xuất.'
    isSigningOut.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-outline bg-surface-header">
    <div class="relative flex h-[68px] items-center px-4 md:px-8 lg:px-10">
      <RouterLink
        to="/"
        aria-label="Cinema - Trang chủ"
        class="shrink-0 text-[22px] font-bold leading-[27px] text-secondary lg:ml-2"
      >
        CINEMA
      </RouterLink>

      <nav
        class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[72px] lg:flex"
        aria-label="Điều hướng chính"
      >
        <RouterLink
          v-for="item in navigationItems"
          :key="item.label"
          :to="item.to"
          class="whitespace-nowrap text-sm font-medium text-content transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div v-if="isAuthenticated" class="ml-auto flex shrink-0 items-center">
        <button
          type="button"
          class="inline-flex h-10 w-[124px] items-center justify-center rounded-[9px] border border-outline text-[13px] font-semibold text-content transition-colors hover:bg-surface-raised disabled:cursor-wait disabled:opacity-60"
          :disabled="isSigningOut"
          :aria-busy="isSigningOut"
          @click="handleSignOut"
        >
          {{ isSigningOut ? 'Đang đăng xuất…' : 'Đăng xuất' }}
        </button>
      </div>

      <button
        v-else
        type="button"
        class="ml-auto inline-flex h-10 w-[124px] shrink-0 items-center justify-center rounded-[9px] bg-primary text-[13px] font-semibold text-content transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        :disabled="isSigningIn"
        :aria-busy="isSigningIn"
        @click="handleSignIn"
      >
        {{ isSigningIn ? 'Đang chuyển…' : 'Đăng nhập' }}
      </button>

      <p v-if="authError" class="sr-only" role="alert">
        {{ authError }}
      </p>
    </div>
  </header>
</template>
