/* eslint-disable import/order */
import '@/@iconify/icons-bundle'
import App from '@/App.vue'
import i18n from '@/plugins/i18n'
import layoutsPlugin from '@/plugins/layouts'
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import router from '@/router'
import ability from '@/plugins/casl/ability'
import { abilitiesPlugin } from '@casl/vue'
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { VueQueryPlugin } from '@tanstack/vue-query'

loadFonts()

import '@/utils/securityAkamai'

// import '@/@fakedb'

// Create Pinia instance
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)



// Create vue app
const app = createApp(App)


// Use plugins
app.use(vuetify)
app.use(pinia)
app.use(router)
app.use(layoutsPlugin)
app.use(i18n)
app.use(VueQueryPlugin)
app.use(abilitiesPlugin, ability, { useGlobalProperties: true })

// Mount vue app
app.mount('#app')
