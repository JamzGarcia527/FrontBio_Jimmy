<script setup>
import { maxLengthValidator, requiredValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import recaptcha from "@/auth/recaptcha-v3"

// Importación de imagenes
import logoCliente from "@images/img/cobranding-elecciones.png"
import useJwt from "@/auth/service/useJwt"

import { useUserConfigStore } from "@/stores/userconfig"
import { useRouter } from "vue-router"
import { useAppAbility } from "@/plugins/casl/useAppAbility"
import { initialAbility } from "@/plugins/casl/ability"

const userConfig = useUserConfigStore()
const router = useRouter()
const ability = useAppAbility()

const isPasswordVisible = ref(false)
const isLoading = ref(false)
const form = ref(null)

const errorSignIn = reactive({
  hasError: false,
  message: null,
  type: "warning",
  errors: {},
})

const username = ref("")
const password = ref("")

const rules = reactive({
  username: [requiredValidator, maxLengthValidator(20)],
  password: [requiredValidator, maxLengthValidator(20)],
})

const signIn = async () => {
  errorSignIn.hasError = false

  const { valid } = await form.value.validate()
  if (!valid) return false
  isLoading.value = true

  try {
    const requestBody = { 
      username: username.value,
      password: password.value,

      //recaptcha_token: recaptchaToken,
    }

    const  response  = await useJwt.login(requestBody)

    
    useJwt.setToken(response.data.token) 
    console.log( ...response.data.listMenu)

    // userConfig.setUserConfig({ ...response.data.listMenu })
    
    if(response.data.accessToken == null){
      router.replace({ name: "home-page" }).then(() => {
        isLoading.value = false

        //  recaptcha.hide()
      })
    }

    //router.push({ name: "home-page" })

    //  isLoading.value = false
    /*const {
      access_token: accessToken,
      refresh_token: refreshToken,
      emulated,
      idle_time,
      currentPhase,
      user,
    } = response.data

    // Guardar en local storage
    useJwt.setToken(accessToken.token)
    useJwt.setRefreshToken(refreshToken.token)
    userConfig.setUserConfig({ ...user, emulated, idle_time, currentPhase })

    const abilities = userConfig.permissions
      .map(e => ({ ...e }))
      .concat(initialAbility)

    ability.update(abilities)*/

    /*router.replace({ name: "index" }).then(() => {
      console.log('enviar index')
      isLoading.value = false
      recaptcha.hide()
    })*/
  } catch (error) { 
    
    isLoading.value = false
    errorSignIn.hasError = true
    errorSignIn.type = "warning"

    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      // Swal.fire({ icon: "warning", text: message })
    } else {
      //   Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })

    }

    if (!navigator.onLine) {
      errorSignIn.message = "Por favor, valide su conexión a internet."
    } else if (error instanceof TypeError === false && error?.response?.status === 400) {
      const { message = "Credenciales incorrectas.", errors = {} } = error.response.data

      errorSignIn.message = message
      errorSignIn.errors = errors
    } else {
      errorSignIn.message = "No es posible iniciar sesión, por favor intente más tarde."
      throw new Error(error)
    }
  }
}

onMounted(() => {
  recaptcha.loadInstance().then(() => {
    recaptcha.show()
  })
})

const { t } = useI18n()
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
        <VCardText v-if="errorSignIn.hasError">
          <VAlert :color="errorSignIn.type" border="start" variant="tonal">
            <p class="text-caption mb-0">
              {{ errorSignIn.message }}
            </p>

            <template v-if="Object.values(errorSignIn.errors).length > 0">
              <ul class="text-caption mt-2">
                <li v-for="(message, index) in errorSignIn.errors" :key="index">
                  {{ message }}
                </li>
              </ul>
            </template>
          </VAlert>
        </VCardText>
        <VCardText>
          <VForm ref="form" @submit.prevent="signIn">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model.trim="username"
                  :label="t('auth.username')"
                  type="text"
                  :rules="rules.username"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="password"
                  :label="t('auth.password')"
                  :rules="rules.password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="() => (isPasswordVisible = !isPasswordVisible)"
                />
              </VCol>

              <VCol cols="12" class="text-center">
                <VBtn :loading="isLoading" type="submit">
                  {{ t("auth.login") }}
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol cols="12" class="text-center">
                <span>{{ t("auth.forgot_password") }}</span>
                <RouterLink class="text-primary ms-2" :to="{ name: 'restore-password' }">
                  {{ t("auth.restore_password") }}
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

.heading1 {
  font-size: 32px;
  font-weight: 700 !important;
}

.heading2 {
  font-size: 1.125rem;
  font-weight: 400 !important;
}
</style>

<route lang="yaml">
meta:
  layout: blank-new
  action: read
  subject: Auth
  redirectIfLoggedIn: true
</route>
