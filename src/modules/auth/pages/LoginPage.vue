<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useAuth } from '@/modules/auth/composables/useAuth'

const route = useRoute()
const { signIn } = useAuth()

const isRedirecting = ref(true)
const flowError = ref<string | null>(null)

async function redirectToLogin(): Promise<void> {
  isRedirecting.value = true
  flowError.value = null

  try {
    await signIn(route.query.returnUrl)
  } catch {
    flowError.value = 'Không thể chuyển đến trang đăng nhập. Vui lòng thử lại.'
    isRedirecting.value = false
  }
}

onMounted(() => {
  void redirectToLogin()
})
</script>

<template>
  <div class="text-center">
    <template v-if="isRedirecting">
      <h1 class="text-xl font-semibold">Đang chuyển đến trang đăng nhập…</h1>

      <p class="mt-3 text-sm text-content-muted">Vui lòng chờ trong giây lát.</p>
    </template>

    <template v-else>
      <h1 class="text-xl font-semibold">Không thể mở trang đăng nhập</h1>

      <p v-if="flowError" class="mt-3 text-sm text-danger" role="alert">
        {{ flowError }}
      </p>

      <button
        type="button"
        class="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
        @click="redirectToLogin"
      >
        Thử lại
      </button>

      <RouterLink
        to="/"
        class="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-outline px-5 py-3 font-semibold transition-colors hover:bg-surface-raised"
      >
        Về trang chủ
      </RouterLink>
    </template>
  </div>
</template>
