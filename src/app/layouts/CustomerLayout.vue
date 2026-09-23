<template>
  <div class="min-h-screen bg-background text-content">
    <header class="border-b border-outline bg-surface-header">
      <div class="mx-auto flex h-17 max-w-7xl items-center justify-between px-4 md:px-8">
        <RouterLink to="/" class="text-xl font-bold tracking-[0.18em] text-secondary">
          CINEMA
        </RouterLink>

        <RouterLink
          to="/auth/login"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-content transition hover:bg-primary-hover"
        >
          Đăng nhập
        </RouterLink>
      </div>
    </header>

    <main id="main-content" class="min-h-[calc(100vh-4.25rem)]">
      <RouterView />
    </main>

    <footer class="border-t border-outline px-4 py-8 text-sm text-content-muted">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <strong class="tracking-[0.18em] text-secondary"> CINEMA </strong>

        <span>Điện ảnh kết nối cảm xúc</span>
      </div>
    </footer>
  </div>
</template>
