<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue'
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

import {
  ADMIN_AREA_ROLES,
  AUTH_PERMISSIONS,
  AUTH_ROLES,
  type AuthPermission,
  type AuthRole,
} from '@/modules/auth/constants/authorization.constants'
import { useAuth } from '@/modules/auth/composables/useAuth'

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
  requiredRoles?: readonly AuthRole[]
  requiredPermission?: AuthPermission
}>

const props = withDefaults(defineProps<Props>(), {
  closable: false,
})

const emit = defineEmits<Emits>()

const { hasRole, hasPermission } = useAuth()

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
    requiredRoles: ADMIN_AREA_ROLES,
  },
  {
    label: 'Phim',
    to: '/admin/movies',
    icon: Clapperboard,
    requiredRoles: ADMIN_AREA_ROLES,
    requiredPermission: AUTH_PERMISSIONS.MOVIE_MANAGE,
  },
  {
    label: 'Rạp',
    to: '/admin/cinemas',
    icon: Building2,
    requiredRoles: ADMIN_AREA_ROLES,
    requiredPermission: AUTH_PERMISSIONS.INVENTORY_MANAGE,
  },
  {
    label: 'Phòng chiếu',
    to: '/admin/rooms',
    icon: DoorOpen,
    requiredRoles: ADMIN_AREA_ROLES,
    requiredPermission: AUTH_PERMISSIONS.INVENTORY_MANAGE,
  },
  {
    label: 'Sơ đồ ghế',
    to: '/admin/seat-layouts',
    icon: Armchair,
    requiredRoles: ADMIN_AREA_ROLES,
    requiredPermission: AUTH_PERMISSIONS.INVENTORY_MANAGE,
  },
  {
    label: 'Suất chiếu',
    to: '/admin/showtimes',
    icon: CalendarDays,
    requiredRoles: ADMIN_AREA_ROLES,
    requiredPermission: AUTH_PERMISSIONS.SHOWTIME_MANAGE,
  },
  {
    label: 'Đặt vé',
    to: '/admin/bookings',
    icon: Ticket,
    requiredRoles: ADMIN_AREA_ROLES,
    requiredPermission: AUTH_PERMISSIONS.BOOKING_READ,
  },
  {
    label: 'Thanh toán',
    to: '/admin/payments',
    icon: CreditCard,
    requiredRoles: ADMIN_AREA_ROLES,
    requiredPermission: AUTH_PERMISSIONS.PAYMENT_READ,
  },
  {
    label: 'Người dùng',
    to: '/admin/users',
    icon: Users,
    requiredRoles: ADMIN_AREA_ROLES,
    requiredPermission: AUTH_PERMISSIONS.USER_MANAGE,
  },
  {
    label: 'Khuyến mãi',
    to: '/admin/promotions',
    icon: Tags,
    requiredRoles: [AUTH_ROLES.ADMIN],
  },
  {
    label: 'Cấu hình',
    to: '/admin/settings',
    icon: Settings,
    requiredRoles: [AUTH_ROLES.ADMIN],
  },
]

const visibleNavigationItems = computed(() =>
  navigationItems.filter((item) => {
    const hasRequiredRole = !item.requiredRoles || item.requiredRoles.some((role) => hasRole(role))

    const hasRequiredPermission = !item.requiredPermission || hasPermission(item.requiredPermission)

    return hasRequiredRole && hasRequiredPermission
  }),
)
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
        <span class="text-xl font-bold tracking-[0.12em] text-secondary"> CINEMA </span>

        <span class="text-sm font-semibold"> ADMIN </span>
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
        <li v-for="item in visibleNavigationItems" :key="item.to">
          <RouterLink v-slot="{ href, navigate, isActive, isExactActive }" :to="item.to" custom>
            <a
              :href="href"
              :aria-current="(item.exact ? isExactActive : isActive) ? 'page' : undefined"
              :class="[
                'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                (item.exact ? isExactActive : isActive)
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
