<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { maxLengthVuelidate, requiredVuelidate } from '@/utils/validators/vuelidate'
import { useVuelidate }  from '@vuelidate/core'
import { useI18n } from 'vue-i18n'
import { useAppAbility } from "@/plugins/casl/useAppAbility"
import { initialAbility } from "@/plugins/casl/ability"

import banner from '@images/pages/dialog-banner-sm.webp'
import useJwt from "@/auth/service/useJwt"
import { useRoute, useRouter } from 'vue-router'
import { useUserConfigStore } from "@/stores/userconfig"

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userConfig = useUserConfigStore()
const ability = useAppAbility()


const isLoading = ref(false)
const messageError = ref(null)
const form = ref({})

const rules = computed(() => ({
  username: { requiredVuelidate, maxLength: maxLengthVuelidate(20) },
})) 

const v$ = useVuelidate(rules, form)

const dialog = ref(false)


const clearForm = () => {
  form.value = {}
  v$.value.$reset()
}

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  messageError.value = null
  isLoading.value = true

  axios.post('v1/emulate/start', { ...form.value })
    .then(response => {
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        emulated,
        idle_time,
        emulatedId,
        currentPhase,
        user,
      } = response.data

      localStorage.clear()

      // Guardar en local storage
      useJwt.setToken(accessToken.token)
      useJwt.setRefreshToken(refreshToken.token)
      userConfig.setUserConfig({ ...user, emulated, emulatedId, idle_time, currentPhase })

      const abilities = userConfig.permissions
        .map(e => ({ ...e }))
        .concat(initialAbility)

      ability.update(abilities)
      

      if (route.name != "index") {
        router.replace({ name: "index" })
          .then(() => {
            isLoading.value = false
            dialog.value = false
          })
      }
    }).catch(error => {
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        messageError.value = message
      } else {
        Swal.fire({ icon: "warning", text: "No fue posible ejecutar emulación por favor contacte a soporte." })
      }
      throw new Error(error)
    }).finally(() => isLoading.value = false)
}

watch(dialog, () => clearForm())
onUnmounted(() => clearForm())
</script>

<template>
  <VDialog
    v-model="dialog"
    class="v-dialog-sm"
    persistent
  >
    <template #activator="{ props: dialogProps }">
      <VCard v-bind="dialogProps" class="rounded-lg" width="100">
        <div class="d-flex flex-column align-center text-primary pa-2">
          <VIcon icon="tabler-users" size="48" />
          <div class="text-center">
            {{ t('emulate_user.btn_emulate') }}
          </div>
        </div>
      </VCard>   
    </template>

    <!-- Dialog close btn -->
    <DialogCloseBtn @click="() => dialog = false" />

    <VCard>
      <VImg :src="banner" height="90" cover />
      <VCardItem>
        <VCardTitle class="text-center">
          {{ t('emulate_user.form.title') }}
        </VCardTitle>
      </VCardItem>
      <VForm @submit.prevent="handlerSubmit">
        <VCardText>
          <VTextField 
            v-model="form.username"
            prepend-inner-icon="tabler-user"
            :label="t('emulate_user.form.username')"
            :error="!!messageError"
            :error-messages="v$.username.$errors[0]?.$message"
            :hint="t('emulate_user.form.username_help')"
            @update:model-value="() => messageError = null"
          />
          <div v-if="messageError" class="text-error text-caption ms-4">
            {{ messageError }} 
          </div>
          <div class="text-center mt-10">
            <VBtn type="submit" :loading="isLoading">
              {{ t('emulate_user.form.btn_start') }}
            </VBtn>
          </div>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
