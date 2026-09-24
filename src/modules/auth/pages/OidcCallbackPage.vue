<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/modules/auth/composables/useAuth'

const router = useRouter()
const { completeSignIn, markAnonymous } = useAuth()

const isProcessing = ref(true)
const callbackError = ref<string | null>(null)

onMounted(async () => {
  let returnUrl: string

  try {
    returnUrl = await completeSignIn()
  } catch {
    markAnonymous()
    callbackError.value = 'Không thể hoàn tất đăng nhập. Vui lòng bắt đầu lại.'
    isProcessing.value = false
    return
  }

  try {
    await router.replace(returnUrl)
  } catch {
    callbackError.value = 'Đăng nhập thành công nhưng không thể mở trang tiếp theo.'
    isProcessing.value = false
  }
})
</script>

<template>
  <div class="text-center" aria-live="polite">
    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary-hover">
      Cinema identity
    </p>

    <h1 class="mt-2 text-2xl font-bold">
      {{ isProcessing ? 'Đang hoàn tất đăng nhập' : 'Không thể tiếp tục' }}
    </h1>

    <p v-if="isProcessing" class="mt-3 text-sm leading-6 text-content-muted">
      Cinema đang xác thực phản hồi đăng nhập. Vui lòng không đóng trang này.
    </p>

    <template v-else>
      <p class="mt-3 text-sm leading-6 text-danger" role="alert">
        {{ callbackError }}
      </p>

      <RouterLink
        to="/auth/login"
        class="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
      >
        Thử đăng nhập lại
      </RouterLink>

      <RouterLink
        to="/"
        class="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-outline px-5 py-3 font-semibold transition-colors hover:bg-surface-raised"
      >
        Về trang chủ
      </RouterLink>
    </template>
  </div>
</template>
