<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { normalizeReturnUrl } from '@/modules/auth/utils/auth-return-url'

const route = useRoute()

const loginDestination = computed(() => ({
  name: 'login',
  query: {
    returnUrl: normalizeReturnUrl(route.query.returnUrl),
  },
}))
</script>

<template>
  <div class="text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary-hover">
      Phiên làm việc
    </p>

    <h1 class="mt-2 text-2xl font-bold">Phiên đăng nhập đã hết hạn</h1>

    <p class="mt-3 text-sm leading-6 text-content-muted">
      Hãy đăng nhập lại để tiếp tục thao tác đang thực hiện.
    </p>

    <RouterLink
      :to="loginDestination"
      class="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
    >
      Đăng nhập lại
    </RouterLink>

    <RouterLink
      to="/"
      class="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-outline px-5 py-3 font-semibold transition-colors hover:bg-surface-raised"
    >
      Về trang chủ
    </RouterLink>
  </div>
</template>
