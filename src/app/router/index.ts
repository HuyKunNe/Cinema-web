import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'

import { routes } from './routes'

export const createAppRouter = (history: RouterHistory) => {
  const router = createRouter({
    history,
    routes,

    scrollBehavior: (_to, _from, savedPosition) => {
      return savedPosition ?? { top: 0 }
    },
  })

  router.afterEach((to) => {
    const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'Cinema'

    document.title = `${pageTitle} | Cinema`
  })

  return router
}

const router = createAppRouter(createWebHistory(import.meta.env.BASE_URL))

export default router
