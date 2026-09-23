import { createRouter, createWebHistory } from 'vue-router'

import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes,

  scrollBehavior: (_to, _from, savedPosition) => {
    return savedPosition ?? { top: 0 }
  },
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'Cinema'

  document.title = `${pageTitle} | Cinema`
})

export default router
