<template>
  <div class="text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-danger">403</p>

    <h1 class="mt-3 text-2xl font-bold">Bạn không có quyền truy cập</h1>

    <p class="mt-3 text-sm leading-6 text-content-muted">
      Tài khoản hiện tại không có quyền sử dụng chức năng này.
    </p>

    <RouterLink
      to="/"
      class="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold transition-colors hover:bg-primary-hover"
    >
      Về trang chủ
    </RouterLink>
  </div>
</template>
