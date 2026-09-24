<template>
  <div class="flex min-h-screen flex-col bg-background text-content">
    <a
      href="#main-content"
      class="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-secondary px-4 py-2 font-semibold text-background transition-transform focus:translate-y-0"
    >
      Chuyển đến nội dung chính
    </a>

    <header class="border-b border-outline bg-surface-header">
      <div class="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-8">
        <RouterLink
          to="/"
          aria-label="Cinema - Trang chủ"
          class="text-xl font-bold tracking-[0.18em] text-secondary"
        >
          CINEMA
        </RouterLink>
      </div>
    </header>

    <main id="main-content" class="grid flex-1 place-items-center px-4 py-12" tabindex="-1">
      <section class="w-full max-w-md rounded-2xl border border-outline bg-surface p-6 md:p-8">
        <RouterView />
      </section>
    </main>

    <footer class="border-t border-outline px-4 py-6 text-center text-sm text-content-muted">
      Điện ảnh kết nối cảm xúc
    </footer>
  </div>
</template>
