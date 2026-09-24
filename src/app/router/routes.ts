import type { RouteRecordRaw } from 'vue-router'

import AdminLayout from '@/app/layouts/AdminLayout.vue'
import AuthLayout from '@/app/layouts/AuthLayout.vue'
import BlankLayout from '@/app/layouts/BlankLayout.vue'
import CustomerLayout from '@/app/layouts/CustomerLayout.vue'

const PlaceholderPage = () => import('@/app/pages/PlaceholderPage.vue')
type AdminPlaceholderRoute = Readonly<{
  path: string
  name: string
  title: string
  description: string
}>

const adminPlaceholderRoutes = [
  {
    path: 'movies',
    name: 'admin-movies',
    title: 'Quản lý phim',
    description:
      'Danh sách phim và trình chỉnh sửa phim sẽ được triển khai sau khi API contract được xác nhận.',
  },
  {
    path: 'cinemas',
    name: 'admin-cinemas',
    title: 'Quản lý rạp',
    description:
      'Thông tin rạp và cấu hình vận hành rạp sẽ được triển khai trong phase Administration.',
  },
  {
    path: 'rooms',
    name: 'admin-rooms',
    title: 'Quản lý phòng chiếu',
    description:
      'Thông tin phòng chiếu sẽ được triển khai sau khi Cinema và Room API contract được xác nhận.',
  },
  {
    path: 'seat-layouts',
    name: 'admin-seat-layouts',
    title: 'Sơ đồ ghế',
    description: 'Trình cấu hình sơ đồ ghế sẽ được triển khai trong phase Administration.',
  },
  {
    path: 'showtimes',
    name: 'admin-showtimes',
    title: 'Quản lý suất chiếu',
    description:
      'Lịch và trạng thái suất chiếu sẽ được triển khai sau khi Showtime API contract được xác nhận.',
  },
  {
    path: 'bookings',
    name: 'admin-bookings',
    title: 'Quản lý đặt vé',
    description:
      'Tra cứu và theo dõi booking sẽ được triển khai sau khi Booking API contract được xác nhận.',
  },
  {
    path: 'payments',
    name: 'admin-payments',
    title: 'Quản lý thanh toán',
    description:
      'Theo dõi và đối soát thanh toán sẽ được triển khai sau khi Payment API contract được xác nhận.',
  },
  {
    path: 'users',
    name: 'admin-users',
    title: 'Quản lý người dùng',
    description: 'Quản lý người dùng và quyền truy cập sẽ được triển khai cùng permission model.',
  },
  {
    path: 'promotions',
    name: 'admin-promotions',
    title: 'Quản lý khuyến mãi',
    description: 'Danh sách và cấu hình khuyến mãi sẽ được triển khai trong phase Administration.',
  },
  {
    path: 'settings',
    name: 'admin-settings',
    title: 'Cấu hình hệ thống',
    description:
      'Các thiết lập vận hành sẽ được triển khai sau khi contract cấu hình được xác nhận.',
  },
] as const satisfies readonly AdminPlaceholderRoute[]

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

      {
        path: 'movies',
        name: 'movies',
        component: PlaceholderPage,
        props: {
          eyebrow: 'Khám phá',
          title: 'Phim',
          description:
            'Danh sách phim đang chiếu và sắp chiếu sẽ được triển khai sau khi Movie API contract được xác nhận.',
        },

        meta: {
          title: 'Phim',
        },
      },

      {
        path: 'showtimes',
        name: 'showtimes',
        component: PlaceholderPage,
        props: {
          eyebrow: 'Lịch chiếu',
          title: 'Tìm suất chiếu',
          description:
            'Tìm kiếm suất chiếu theo phim, rạp và ngày sẽ được triển khai sau khi Showtime API contract được xác nhận.',
        },

        meta: {
          title: 'Lịch chiếu',
        },
      },

      {
        path: 'bookings',
        name: 'bookings',
        component: PlaceholderPage,
        props: {
          eyebrow: 'Tài khoản',
          title: 'Vé của tôi',
          description:
            'Danh sách booking, trạng thái xử lý và vé điện tử sẽ được triển khai cùng authentication và Booking API.',
        },

        meta: {
          title: 'Vé của tôi',
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

      ...adminPlaceholderRoutes.map((route) => ({
        path: route.path,
        name: route.name,
        component: PlaceholderPage,
        props: {
          eyebrow: 'Quản trị',
          title: route.title,
          description: route.description,
          backTo: '/admin',
          backLabel: 'Về tổng quan',
        },

        meta: {
          title: route.title,
        },
      })),
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
