import { isUserLoggedIn } from '@/auth/utils'
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...setupLayouts(routes),
  ],
})


// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach((to, _, next) => {
  const isLoggedIn = isUserLoggedIn()
  if (to.meta.redirectIfLoggedIn && isLoggedIn) return next({ name: 'index' })

  const authRequired = to.matched.some(route => Boolean(route.meta.authRequired))
  if (authRequired && !isLoggedIn) {
    if (to.fullPath !== '/') {
      return next({ name: 'login', query: { redirectFrom: to.fullPath } })
    } else {
      return next({ name: 'login' })
    }
  }

  // TODO: forzar a cambio de contraseña.
  // const data = getUserData();
  // const changePasswordRequired = data?.user?.changePassword || false;
  // if (changePasswordRequired && (to.name !== 'logout' && to.name !== 'change-password')) return next({ name: 'change-password' })

  // TODO: Validar accesos con CASL
  return next()
})

export default router
