<script setup lang="ts">
import { ref } from 'vue'
import { Menu } from '@lucide/vue'

import AdminSidebar from '@/app/components/navigation/AdminSidebar.vue'

const isSidebarOpen = ref(false)

const openSidebar = () => {
  isSidebarOpen.value = true
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-background text-content lg:flex" @keyup.esc="closeSidebar">
    <a
      href="#main-content"
      class="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-secondary px-4 py-2 font-semibold text-background transition-transform focus:translate-y-0"
    >
      Chuyển đến nội dung chính
    </a>

    <div class="hidden h-screen w-64 shrink-0 border-r border-outline lg:sticky lg:top-0 lg:block">
      <AdminSidebar />
    </div>

    <div v-if="isSidebarOpen" class="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        class="absolute inset-0 bg-background/80"
        aria-label="Đóng menu quản trị"
        @click="closeSidebar"
      ></button>

      <AdminSidebar
        id="admin-mobile-sidebar"
        closable
        class="relative h-full w-72 border-r border-outline shadow-2xl"
        @close="closeSidebar"
      />
    </div>

    <div class="min-w-0 flex-1">
      <header
        class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline bg-surface-header px-4 lg:px-8"
      >
        <div class="flex min-w-0 items-center gap-3">
          <button
            type="button"
            class="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-raised hover:text-content lg:hidden"
            aria-label="Mở menu quản trị"
            aria-controls="admin-mobile-sidebar"
            :aria-expanded="isSidebarOpen"
            @click="openSidebar"
          >
            <Menu :size="23" aria-hidden="true" />
          </button>

          <div class="min-w-0">
            <p class="truncate text-xs uppercase tracking-[0.2em] text-content-muted">
              Cinema administration
            </p>

            <p class="truncate font-semibold">Vận hành hệ thống</p>
          </div>
        </div>

        <div class="shrink-0 rounded-full border border-outline px-3 py-2 text-sm lg:px-4">
          Quản trị viên
        </div>
      </header>

      <main id="main-content" class="p-5 lg:p-8" tabindex="-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>
