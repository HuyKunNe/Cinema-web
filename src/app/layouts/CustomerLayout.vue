<script setup lang="ts">
import CustomerHeader from '@/app/components/navigation/CustomerHeader.vue'
import MobileBottomNav from '@/app/components/navigation/MobileBottomNav.vue'
</script>

<template>
  <div
    class="min-h-screen bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] text-content md:pb-0"
  >
    <a
      href="#main-content"
      class="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-secondary px-4 py-2 font-semibold text-background transition-transform focus:translate-y-0"
    >
      Chuyển đến nội dung chính
    </a>

    <CustomerHeader />

    <main id="main-content" class="min-h-[calc(100vh-4rem)]" tabindex="-1">
      <RouterView />
    </main>

    <footer class="border-t border-outline px-4 py-8 text-sm text-content-muted">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <strong class="tracking-[0.18em] text-secondary">CINEMA</strong>

        <span>Điện ảnh kết nối cảm xúc</span>
      </div>
    </footer>

    <MobileBottomNav />
  </div>
</template>
