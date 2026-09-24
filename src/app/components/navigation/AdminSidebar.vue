<script setup lang="ts">
import { onMounted, ref, type Component } from 'vue'
import {
  Armchair,
  Building2,
  CalendarDays,
  Clapperboard,
  CreditCard,
  DoorOpen,
  Home,
  LayoutDashboard,
  Settings,
  Tags,
  Ticket,
  Users,
  X,
} from '@lucide/vue'

type Props = {
  closable?: boolean
}

type Emits = {
  close: []
}

type NavigationItem = Readonly<{
  label: string
  to: string
  icon: Component
  exact?: boolean
}>

const props = withDefaults(defineProps<Props>(), {
  closable: false,
})

const emit = defineEmits<Emits>()

const closeButtonRef = ref<HTMLButtonElement | null>(null)

onMounted(() => {
  if (props.closable) {
    closeButtonRef.value?.focus()
  }
})

const navigationItems: readonly NavigationItem[] = [
  {
    label: 'Tổng quan',
    to: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Phim',
    to: '/admin/movies',
    icon: Clapperboard,
  },
  {
    label: 'Rạp',
    to: '/admin/cinemas',
    icon: Building2,
  },
  {
    label: 'Phòng chiếu',
    to: '/admin/rooms',
    icon: DoorOpen,
  },
  {
    label: 'Sơ đồ ghế',
    to: '/admin/seat-layouts',
    icon: Armchair,
  },
  {
    label: 'Suất chiếu',
    to: '/admin/showtimes',
    icon: CalendarDays,
  },
  {
    label: 'Đặt vé',
    to: '/admin/bookings',
    icon: Ticket,
  },
  {
    label: 'Thanh toán',
    to: '/admin/payments',
    icon: CreditCard,
  },
  {
    label: 'Người dùng',
    to: '/admin/users',
    icon: Users,
  },
  {
    label: 'Khuyến mãi',
    to: '/admin/promotions',
    icon: Tags,
  },
  {
    label: 'Cấu hình',
    to: '/admin/settings',
    icon: Settings,
  },
]
</script>

<template>
  <aside
    class="flex h-full flex-col bg-surface-header text-content"
    :role="closable ? 'dialog' : undefined"
    :aria-modal="closable ? 'true' : undefined"
    aria-label="Thanh bên quản trị"
  >
    <div class="flex min-h-16 items-center justify-between border-b border-outline px-5">
      <RouterLink
        to="/admin"
        aria-label="Cinema Admin - Tổng quan"
        class="flex items-baseline gap-2"
        @click="emit('close')"
      >
        <span class="text-xl font-bold tracking-[0.12em] text-secondary">CINEMA</span>
        <span class="text-sm font-semibold">ADMIN</span>
      </RouterLink>

      <button
        v-if="closable"
        ref="closeButtonRef"
        type="button"
        class="inline-flex size-11 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-raised hover:text-content"
        aria-label="Đóng menu quản trị"
        @click="emit('close')"
      >
        <X :size="22" aria-hidden="true" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto p-3" aria-label="Điều hướng quản trị">
      <ul class="space-y-1">
        <li v-for="item in navigationItems" :key="item.to">
          <RouterLink v-slot="{ href, navigate, isActive, isExactActive }" :to="item.to" custom>
            <a
              :href="href"
              :aria-current="(item?.exact ? isExactActive : isActive) ? 'page' : undefined"
              :class="[
                'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                (item?.exact ? isExactActive : isActive)
                  ? 'bg-primary-subtle text-content'
                  : 'text-content-muted hover:bg-surface-raised hover:text-content',
              ]"
              @click="
                (event) => {
                  navigate(event)
                  emit('close')
                }
              "
            >
              <component :is="item.icon" :size="20" :stroke-width="1.8" aria-hidden="true" />

              <span>{{ item.label }}</span>
            </a>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="border-t border-outline p-3">
      <RouterLink
        to="/"
        class="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:bg-surface-raised hover:text-content"
        @click="emit('close')"
      >
        <Home :size="20" :stroke-width="1.8" aria-hidden="true" />
        <span>Trang khách hàng</span>
      </RouterLink>
    </div>
  </aside>
</template>
