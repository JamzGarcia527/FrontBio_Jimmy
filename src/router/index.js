import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { isUserLoggedIn } from '@/auth/utils'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ℹ️ We are redirecting to different pages based on role.
    // NOTE: Role is just for UI purposes. ACL is based on abilities.
    {
      path: '/',
      redirect: to => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')

        

        const userRole = userData && userData.role ? userData.role : null
        if (userRole === 'admin')
          return { name: 'home-page' }
        if (userRole === 'client')
          return { name: 'access-control' }
        
        return { name: 'login', query: to.query }
      },
    },
    {
      path: '/pages/user-profile',
      redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
    },
    {
      path: '/pages/account-settings',
      redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
    },
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
