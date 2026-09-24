<template>
  <div class="text-center">
    <h1 class="text-2xl font-bold">Phiên đăng nhập đã hết hạn</h1>

    <p class="mt-3 text-sm leading-6 text-content-muted">
      Hãy đăng nhập lại để tiếp tục thao tác đang thực hiện.
    </p>

    <RouterLink
      to="/auth/login"
      class="mt-8 inline-flex w-full justify-center rounded-xl bg-primary px-5 py-3 font-semibold transition hover:bg-primary-hover"
    >
      Đăng nhập lại
    </RouterLink>
  </div>
</template>
