<template>
  <div class="text-center">
    <h1 class="text-2xl font-bold">Đăng nhập</h1>

    <p id="login-description" class="mt-3 text-sm leading-6 text-content-muted">
      Đăng nhập an toàn qua hệ thống định danh Cinema.
    </p>

    <button
      type="button"
      disabled
      aria-describedby="login-description login-status"
      class="mt-8 w-full cursor-not-allowed rounded-xl bg-primary px-5 py-3 font-semibold opacity-60"
    >
      Tiếp tục đăng nhập
    </button>

    <p id="login-status" class="mt-4 text-xs text-content-muted">
      OIDC Authorization Code + PKCE sẽ được kết nối trong F2.
    </p>
  </div>
</template>
