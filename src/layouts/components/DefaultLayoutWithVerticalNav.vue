<script setup>
import navItems from '@/navigation/vertical'
import { useThemeConfig } from '@core/composable/useThemeConfig'
import ChangePassword from '@/components/chagepassword/change_password.vue'
import IdleSession from '@/components/shared/IdleSession.vue'
import img from '@/assets/images/img/logo-navbar-lg.webp'

// Components
import Footer from '@/layouts/components/Footer.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'
import { useRouter } from 'vue-router'
import { useUserConfigStore } from '@/stores/userconfig'

const { appRouteTransition, isLessThanOverlayNavBreakpoint } = useThemeConfig()
const { width: windowWidth } = useWindowSize()
const router = useRouter()
const userconfig = useUserConfigStore()

const fixMenuItem = value => {
  return value
    .filter(e => {
      if (e.route == null && Array.isArray(e.menuChildren))
        return e.menuChildren.some(a => a.route != 'blank')
      
      return e.route != 'blank'
    }).map(e => {
      const item = {
        title: e.title, 
        action: 'navigation', 
        subject: 'menu',
      }

      if (e.route) item.to = { name: e.route }
      if (e.icon) item.icon = { icon: e.icon }
      if (e.menuChildren && Array.isArray(e.menuChildren)) 
        item.children = fixMenuItem(e.menuChildren)

      return item
    })
}

const navigation = computed(() => {
  const navItemsDB = fixMenuItem(userconfig.menu)


  return [
    ...navItemsDB, 

    // ...navItems,
  ]
})

const logout = () => {
  router.push({ name: 'logout' })
}
</script>

<template>
  <VerticalNavLayout
    :nav-items="navigation"
  >
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <VBtn
          v-if="isLessThanOverlayNavBreakpoint(windowWidth)"
          icon
          variant="text"
          color="default"
          class="ms-n3"
          size="small"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            icon="tabler-menu-2"
            size="24"
          />
        </VBtn>

        <VImg :src="img" class="img-navbar py-5" height="80%" />  

        <VSpacer />
        <NavBarNotifications class="me-2" />
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <RouterView v-slot="{ Component }">
      <Transition
        :name="appRouteTransition"
        mode="out-in"
      >
        <Component :is="Component" />
      </Transition>
    </RouterView>

    <!-- 👉 Footer -->
    <template #footer>
      <ChangePassword v-if="!userconfig.isEmulated" />
      <IdleSession v-if="userconfig.idleTime > 0" :timeout="userconfig.idleTime" @idle="logout" />
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
