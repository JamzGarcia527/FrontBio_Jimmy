<script setup>
import { useTheme } from 'vuetify'
import { useThemeConfig } from '@core/composable/useThemeConfig'
import { hexToRgb } from '@layouts/utils'
import Swal from './plugins/sweetalert2'
import { useUserConfigStore } from "@/stores/userconfig"

const {
  syncInitialLoaderTheme,
  syncVuetifyThemeWithTheme: syncConfigThemeWithVuetifyTheme,
  isAppRtl,
} = useThemeConfig()

const { global } = useTheme()
const userConfig = useUserConfigStore()

const disableOptions = () => {
  const buttons = document.querySelectorAll("button.notAllowedEmulator")
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].setAttribute("disabled", "true")
    buttons[i].onclick = () => false
  }
  const inputs = document.querySelectorAll("input.notAllowedEmulator")
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].setAttribute("disabled", "true")
    inputs[i].onclick = () => false
  }
  const divs = document.querySelectorAll("div.notAllowedEmulator")
  for (var i = 0; i < divs.length; i++) {
    divs[i].setAttribute("disabled", "true")
    divs[i].onclick = () => false
  }

  const form = document.querySelectorAll('form')
  for (var b = 0; b < form.length; b++) {
    form[b].onsubmit = () => false 
  }
}

const isEmulated = computed(() => Boolean(userConfig.isEmulated))

const interval = setInterval(() => {
  if (isEmulated.value) 
    disableOptions()
}, 1000)

onUnmounted(() => {
  clearInterval(interval)
})

// ℹ️ Sync current theme with initial loader theme
syncInitialLoaderTheme()
syncConfigThemeWithVuetifyTheme()

// https://stackoverflow.com/a/70821518
// const localStorageTabKey = 'idcan-unique-tab'
// window.addEventListener('load', function () {
//   if (localStorage.getItem(localStorageTabKey) == null) {
//     // new tab
//     localStorage.setItem(localStorageTabKey, 'true')
//     window.addEventListener('unload', function() {
//       localStorage.removeItem(localStorageTabKey)
//     })
//   } else {
//     alert('Cannot open multiple instances')
//   }
// })


// https://stackoverflow.com/a/71069585

const showBlockingDialog = () => {
  Swal.fire({
    text: 'No puede abrir multiples pestañas',
    icon: 'info',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    backdrop: 'rgba(0,0,0,1)',
  }).then(() => {
    showBlockingDialog()
  })
}

const channel = new BroadcastChannel('IDCAN-UNIQUE-TAB-VALIDATOR')
let isOriginal = true
channel.postMessage('another-tab')

// note that listener is added after posting the message
channel.addEventListener('message', msg => {
  if (msg.data === 'another-tab' && isOriginal) {
    // message received from 2nd tab
    // reply to all new tabs that the website is already open
    channel.postMessage('already-open')
  }
  if (msg.data === 'already-open') {
    isOriginal = false

    // message received from original tab
    window.close()
    showBlockingDialog()
  }
})
</script>

<template>
  <VLocaleProvider :rtl="isAppRtl">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />
      <div v-if="isEmulated" class="ribbon">
        <a onclick="javascript:void(0)">Modo Emulación</a>
      </div>
    </VApp>
  </VLocaleProvider>
</template>
