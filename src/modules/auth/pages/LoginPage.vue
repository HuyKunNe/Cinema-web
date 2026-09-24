<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useAuth } from '@/modules/auth/composables/useAuth'

const route = useRoute()
const {
  identity,
  errorMessage: sessionError,
  isAuthenticated,
  isLoading,
  initialize,
  signIn,
  signOut,
} = useAuth()

const isSubmitting = ref(false)
const flowError = ref<string | null>(null)

const isBusy = computed(() => isLoading.value || isSubmitting.value)
const visibleError = computed(() => flowError.value ?? sessionError.value)

onMounted(() => {
  void initialize()
})

async function handleSignIn(): Promise<void> {
  isSubmitting.value = true
  flowError.value = null

  try {
    await signIn(route.query.returnUrl)
  } catch {
    flowError.value = 'Không thể bắt đầu đăng nhập. Vui lòng thử lại.'
    isSubmitting.value = false
  }
}

async function handleSignOut(): Promise<void> {
  isSubmitting.value = true
  flowError.value = null

  try {
    await signOut()
  } catch {
    flowError.value = 'Không thể hoàn tất đăng xuất. Vui lòng thử lại.'
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary-hover">
      Tài khoản Cinema
    </p>

    <h1 class="mt-2 text-2xl font-bold">
      {{ isAuthenticated ? 'Bạn đã đăng nhập' : 'Đăng nhập' }}
    </h1>

    <template v-if="isAuthenticated">
      <p class="mt-3 text-sm leading-6 text-content-muted">
        {{ identity?.displayName ?? identity?.email ?? 'Tài khoản của bạn' }}
      </p>

      <RouterLink
        to="/"
        class="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
      >
        Về trang chủ
      </RouterLink>

      <button
        type="button"
        class="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-outline px-5 py-3 font-semibold transition-colors hover:bg-surface-raised disabled:cursor-wait disabled:opacity-60"
        :disabled="isBusy"
        :aria-busy="isSubmitting"
        @click="handleSignOut"
      >
        {{ isSubmitting ? 'Đang đăng xuất…' : 'Đăng xuất' }}
      </button>
    </template>

    <template v-else>
      <p id="login-description" class="mt-3 text-sm leading-6 text-content-muted">
        Đăng nhập an toàn qua hệ thống định danh Cinema.
      </p>

      <button
        type="button"
        aria-describedby="login-description login-status"
        class="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        :disabled="isBusy"
        :aria-busy="isBusy"
        @click="handleSignIn"
      >
        {{ isBusy ? 'Đang chuẩn bị…' : 'Tiếp tục đăng nhập' }}
      </button>

      <p id="login-status" class="mt-4 text-xs text-content-muted" aria-live="polite">
        Authorization Code với PKCE. Cinema không lưu mật khẩu của bạn trong trình duyệt.
      </p>
    </template>

    <p v-if="visibleError" class="mt-4 text-sm text-danger" role="alert">
      {{ visibleError }}
    </p>
  </div>
</template>
