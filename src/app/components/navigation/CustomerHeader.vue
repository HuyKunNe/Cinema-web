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
    label: 'Vé của tôi',
    to: '/bookings',
  },
] as const

const route = useRoute()

const { identity, isAuthenticated, initialize, signIn, signOut } = useAuth()

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

      <div v-if="isAuthenticated" class="ml-auto flex shrink-0 items-center gap-3">
        <span class="hidden max-w-48 truncate text-sm text-content-muted lg:block">
          {{ identity?.displayName ?? identity?.email ?? 'Tài khoản' }}
        </span>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-lg border border-outline px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-raised disabled:cursor-wait disabled:opacity-60"
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
        class="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-content transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
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
