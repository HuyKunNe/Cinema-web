import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter, type RouteRecordRaw, type Router } from 'vue-router'

const TestPage = defineComponent({
  template: '<div>Test page</div>',
})

const testRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: TestPage },
  { path: '/movies', name: 'movies', component: TestPage },
  { path: '/showtimes', name: 'showtimes', component: TestPage },
  { path: '/bookings', name: 'bookings', component: TestPage },
  { path: '/auth/login', name: 'login', component: TestPage },

  { path: '/admin', name: 'admin-dashboard', component: TestPage },
  { path: '/admin/movies', name: 'admin-movies', component: TestPage },
  { path: '/admin/cinemas', name: 'admin-cinemas', component: TestPage },
  { path: '/admin/rooms', name: 'admin-rooms', component: TestPage },
  {
    path: '/admin/seat-layouts',
    name: 'admin-seat-layouts',
    component: TestPage,
  },
  {
    path: '/admin/showtimes',
    name: 'admin-showtimes',
    component: TestPage,
  },
  {
    path: '/admin/bookings',
    name: 'admin-bookings',
    component: TestPage,
  },
  {
    path: '/admin/payments',
    name: 'admin-payments',
    component: TestPage,
  },
  { path: '/admin/users', name: 'admin-users', component: TestPage },
  {
    path: '/admin/promotions',
    name: 'admin-promotions',
    component: TestPage,
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    component: TestPage,
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: TestPage,
  },
]

export const createTestRouter = async (initialPath = '/'): Promise<Router> => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: testRoutes,
  })

  await router.push(initialPath)
  await router.isReady()

  return router
}
