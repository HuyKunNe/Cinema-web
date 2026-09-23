import type { RouteRecordRaw } from 'vue-router'

import AdminLayout from '@/app/layouts/AdminLayout.vue'
import AuthLayout from '@/app/layouts/AuthLayout.vue'
import BlankLayout from '@/app/layouts/BlankLayout.vue'
import CustomerLayout from '@/app/layouts/CustomerLayout.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: CustomerLayout,

    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/modules/movies/pages/HomePage.vue'),

        meta: {
          title: 'Trang chủ',
        },
      },
    ],
  },

  {
    path: '/admin',
    component: AdminLayout,

    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/modules/admin/pages/AdminDashboardPage.vue'),

        meta: {
          title: 'Tổng quan quản trị',
        },
      },
    ],
  },

  {
    path: '/auth/callback',
    component: BlankLayout,

    children: [
      {
        path: '',
        name: 'oidc-callback',
        component: () => import('@/modules/auth/pages/OidcCallbackPage.vue'),

        meta: {
          title: 'Đang đăng nhập',
        },
      },
    ],
  },

  {
    path: '/auth',
    component: AuthLayout,

    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/modules/auth/pages/LoginPage.vue'),

        meta: {
          title: 'Đăng nhập',
        },
      },

      {
        path: 'session-expired',
        name: 'session-expired',
        component: () => import('@/modules/auth/pages/SessionExpiredPage.vue'),

        meta: {
          title: 'Phiên đăng nhập đã hết hạn',
        },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    component: BlankLayout,

    children: [
      {
        path: '',
        name: 'not-found',
        component: () => import('@/app/pages/NotFoundPage.vue'),

        meta: {
          title: 'Không tìm thấy trang',
        },
      },
    ],
  },
]
