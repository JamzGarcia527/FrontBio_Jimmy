<script setup>
import { useUserConfigStore } from '@/stores/userconfig'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n() 
const userConfigStore = useUserConfigStore()
const router = useRouter()

document.documentElement.style.setProperty('--initial-loader-bg', '#FFFFFF')
document.documentElement.style.setProperty('--initial-loader-color', '#003057')

const logout = async () => {
  await userConfigStore.initUserConfig()
  localStorage.clear()
  
  router.replace({ name: 'login' })
}

logout()
</script>

<template>
  <div id="loading-bg">
    <div class="loading-logo">
      <img src="/logo.png" alt="Logo">
      <p>{{ t('auth.logout') }}...</p>
    </div>
    <div class="loading">
      <div class="effect-1 effects" />
      <div class="effect-2 effects" />
      <div class="effect-3 effects" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#loading-bg {
  position: absolute;
  display: block;
  background: var(--initial-loader-bg, #fff);
  block-size: 90%;
  inline-size: 90%;
}

.loading-logo {
  position: absolute;
  inset-block-start: 35%;
  inset-inline-start: calc(50% - 80px);
  text-align: center;
}

.loading {
  position: absolute;
  box-sizing: border-box;
  border: 3px solid transparent;
  block-size: 55px;
  /* stylelint-disable-next-line order/properties-order */
  border-radius: 50%;
  inline-size: 55px;
  inset-block-start: 50%;
  inset-inline-start: calc(50% - 35px);
}

.loading .effect-1,
.loading .effect-2,
.loading .effect-3 {
  position: absolute;
  box-sizing: border-box;
  border: 3px solid transparent;
  block-size: 100%;
  border-inline-start: 3px solid var(--initial-loader-color, #eee);
  /* stylelint-disable-next-line order/properties-order */
  border-radius: 50%;
  inline-size: 100%;
}

.loading .effect-1 {
  animation: rotate 1s ease infinite;
}

.loading .effect-2 {
  animation: rotate-opacity 1s ease infinite 0.1s;
}

.loading .effect-3 {
  animation: rotate-opacity 1s ease infinite 0.2s;
}

.loading .effects {
  transition: all 0.3s ease;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(1turn);
  }
}

@keyframes rotate-opacity {
  0% {
    opacity: 0.1;
    transform: rotate(0deg);
  }

  100% {
    opacity: 1;
    transform: rotate(1turn);
  }
}
</style>

<route lang="yaml">
name: logout
meta:
  layout: blank
  action: read
  subject: Auth
  authRequired: false
</route>
  