<script setup>
import { themeConfig } from "@themeConfig"
import { emailValidator, requiredValidator } from "@/utils/validators"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import recaptcha from "@/auth/recaptcha-v3"
import { useRouter } from "vue-router"

// Importación de imagenes
import logoCliente from "@images/img/cobranding-elecciones.png"
import { useI18n } from "vue-i18n"

const router = useRouter()
const { t } = useI18n()

const refVForm = ref()
const user = ref("")
const email = ref("")
const isLoading = ref(false)

const sendRequest = async () => {
  try {
    const recaptchaToken = await recaptcha.execute("Login")

    const requestBody = {
      username: user.value,
      email: email.value,
      recaptcha_token: recaptchaToken,
    }

    isLoading.value = true

    const { data } = await axios.post("/auth/recovery", requestBody)

    await Swal.fire({ text: data, icon: "success" })

    isLoading.value = false
    router.push({ name: "login" })
  } catch (error) {
    isLoading.value = false
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) sendRequest()
  })
}

onMounted(() => {
  recaptcha.loadInstance().then(() => {
    recaptcha.show()
  })
})
</script>

<template>
  <VRow class="d-flex align-center">
    <VCol cols="12" class="d-flex flex-column justify-center mt-5 pb-0">
      <VImg :src="logoCliente" max-height="135" />
      <div class="text-center my-3">
        <div class="text-h5 text-sm-h4 text-primary font-weight-bold">
          {{ t("auth.page_title") }}
        </div>
        <div class="heading2 text-primary font-weight-bold">
          {{ t("auth.page_subtitle") }}
        </div>
      </div>
    </VCol>
    <VCol cols="12" class="d-flex flex-column align-center pt-0">
      <VCard :max-width="400" class="mt-5 mt-sm-0 pa-2 elevation-21">
        <VCardText class="pt-2">
          <VAlert
            color="secondary"
            variant="tonal"
            icon="tabler-mail"
            class="text-body-2"
            border="top"
            prominent
          >
            Ingrese su usuario y correo electrónico, se le enviarán las instrucciones para
            restablecer su contraseña
          </VAlert>
        </VCardText>

        <VCardText>
          <VForm ref="refVForm" @submit.prevent="onSubmit">
            <VRow>
              <!-- usuario -->
              <VCol cols="12">
                <VTextField
                  v-model="user"
                  type="text"
                  :rules="[requiredValidator]"
                  :label="t('auth.username')"
                />
              </VCol>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="email"
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                  :label="t('auth.email')"
                />
              </VCol>

              <!-- reset password -->
              <VCol cols="12" class="d-flex justify-center">
                <VBtn :loading="isLoading" rounded="pill" type="submit">
                  {{ t("auth.request_password") }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
      <div class="text-center my-4">
        <RouterLink :to="{ name: 'login' }">
          {{ t("auth.login") }}
        </RouterLink>
      </div>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
name: "restore-password"
meta:
  layout: blank-new
  authRequired: false
</route>
