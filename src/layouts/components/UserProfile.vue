<script setup>
import avatar1 from '@images/avatars/avatar-generic.webp'
import axios from '@/plugins/axios'
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'
import { useUserConfigStore } from '@/stores/userconfig'
import moment from 'moment'
import Swal from '@/plugins/sweetalert2'
import useJwt from "@/auth/service/useJwt"

import { useAppAbility } from "@/plugins/casl/useAppAbility"
import { initialAbility } from "@/plugins/casl/ability"
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const ability = useAppAbility()

const daysPendingForUploadSymbol = ref(null)
const daysPendingForUploadPhoto = ref(null)
const menu = ref(false)
const { t } = useI18n()

const userConfig = useUserConfigStore()

const daysPending = computed(() => {
  if (userConfig.currentPhase?.name == 'E6') return userConfig.currentPhase.daysLeft
  if (userConfig.currentPhase?.name == 'E7') return userConfig.currentPhase.daysLeft

  return null
})

const phaseSystem = computed(() => {
  if (userConfig.currentPhase?.name == 'E6') return 'E6 (inscripción de candidaturas)'
  if (userConfig.currentPhase?.name == 'E7') return 'E7 (modificación de candidaturas)'
  
  return null
})

const getDaysPendingPerUpload = async () => {
  try {
    const { data } = await axios.get(`/v1/parameter`)

    const dateLogoOrSymbol = data.find(obj => obj.key === 'FLCLS')?.value
    const dateUploadPhto = data.find(obj => obj.key === 'FLFC')?.value

    const currentDate = moment(new Date()).format('YYYY-MM-DD')
    const parameterDateLogoOrSymbol = moment(dateLogoOrSymbol, 'YYYY-MM-DD') // Convertir la fecha del endpoint a un objeto moment
    const daysDifferenceLogoOrSymbol = Math.max(parameterDateLogoOrSymbol.diff(currentDate, 'days'), 0) // Obtener la diferencia en días, asegurándose de que sea al menos 0

    const parameterDateUploadPhoto = moment(dateUploadPhto, 'YYYY-MM-DD') // Convertir la fecha del endpoint a un objeto moment
    const daysDifferenceUploadPhoto = Math.max(parameterDateUploadPhoto.diff(currentDate, 'days'), 0) // Obtener la diferencia en días, asegurándose de que sea al menos 0

    daysPendingForUploadPhoto.value = daysDifferenceUploadPhoto
    daysPendingForUploadSymbol.value = daysDifferenceLogoOrSymbol

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: "warning",
        text: message || t('common.not_operation'),
      })
    }

    return false
  }
}

const isEmulated = computed(() => userConfig.isEmulated)
const emulatedId = computed(() => userConfig.userData.emulatedId)
const username = computed(() => userConfig.userData.username)

const closeEmulation = () => {
  axios.post('v1/emulate/close', { 
    id: emulatedId.value,
    userEmulate: username.value,
  }).then(response => {
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      emulated,
      idle_time,
      currentPhase,
      user,
    } = response.data

    localStorage.clear()

    // Guardar en local storage
    useJwt.setToken(accessToken.token)
    useJwt.setRefreshToken(refreshToken.token)
    userConfig.setUserConfig({ ...user, emulated, idle_time, currentPhase })

    const abilities = userConfig.permissions
      .map(e => ({ ...e }))
      .concat(initialAbility)

    ability.update(abilities)
      

    if (route.name != "index") {
      router.replace({ name: "index" })
    }
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    } else {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar emulación por favor contacte a soporte." })
    }
    throw new Error(error)
  })
}

onMounted(() => {
  // getDaysPendingPerUpload()
})
</script>

<template>
  <div v-if="daysPending" class="demo-space-x">
    <VBadge 
      color="secondary"
      variant="tonal"
      :content="daysPending"
      location="end top"
    >
      <VTooltip
        activator="parent"
        location="bottom end"
      >
        <p class="text-justify">
          {{ t('daysPendingPerStage.description') }} 
          <span class="font-weight-bold"> {{ daysPending }} {{ t('daysPendingPerStage.daysWord') }} </span> 
          {{ t('daysPendingPerStage.description_next') }} 
          <span class="font-weight-bold"> {{ t('daysPendingPerStage.phase') }} {{ phaseSystem }} </span>
        </p>
      </VTooltip>
      <VIcon
        class="me-1"
        icon="tabler-bell-ringing"
        size="43"
      />
    </VBadge>
  </div>
  <div v-if="daysPendingForUploadPhoto != null || daysPendingForUploadSymbol != null" class="demo-space-x">
    <VBadge 
      color="secondary"
      variant="tonal"
      :content="daysPendingForUploadPhoto > 0 && daysPendingForUploadSymbol > 0 ? 2 : daysPendingForUploadPhoto === 0 && daysPendingForUploadSymbol === 0 ? 0 : 1"
      location="end top"
    >
      <VMenu
        v-model="menu"
        location="top"
      >
        <template #activator="{ props }">
          <VIcon
            class="me-1"
            icon="tabler-camera"
            size="43"
            v-bind="props"
          />
        </template>

        <VCard max-width="300" class="mt-4">
          <div v-if="daysPendingForUploadPhoto > 0 || daysPendingForUploadSymbol > 0">
            <VCardText v-if="daysPendingForUploadPhoto > 0" class="text-justify">
              {{ t('daysPendingPerUploadPhotoCandidate.description') }} {{ daysPendingForUploadPhoto }} {{ t('daysPendingPerUploadPhotoCandidate.description_next') }} 
            </VCardText>

            <VDivider
              v-if="daysPendingForUploadPhoto > 0"
            />

            <VCardText v-if="daysPendingForUploadSymbol > 0" class="text-justify">
              {{ t('daysPendingPerUploadSymbol.description') }} {{ daysPendingForUploadSymbol }} {{ t('daysPendingPerUploadSymbol.description_next') }} 
            </VCardText>
          </div>
          <div v-else>
            <VCardText class="text-justify">
              {{ t('daysPendingPerUploadSymbol.no_notifications') }}
            </VCardText>
          </div>
        </VCard>
      </VMenu>
    </VBadge>
  </div>

  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem class="v-list-item__no-overflow">
            <VListItemTitle class="font-weight-semibold">
              {{ userConfig.fullName }}
            </VListItemTitle>
            <VListItemSubtitle>{{ userConfig.role }}</VListItemSubtitle>
            <VListItemSubtitle v-if="userConfig.currentPhase" class="mt-2">
              <Strong>ETAPA DEL PROCESO:</Strong> {{ userConfig.currentPhase.name }}
            </VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 change_password -->
          <VListItem :to="{ name: 'user-change-password' }" class="v-list-item__no-overflow">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-lock-open-variant-outline"
                size="22"
              />
            </template>

            <VListItemTitle>{{ t('auth.change_password') }}</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />


          <!-- 👉 Logout -->
          <VListItem v-if="isEmulated" @click="closeEmulation">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>{{ t('emulate_user.logout') }}</VListItemTitle>
          </VListItem>
          <VListItem v-else to="/logout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>{{ t('auth.logout') }}</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
