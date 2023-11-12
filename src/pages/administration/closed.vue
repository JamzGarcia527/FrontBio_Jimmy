<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import banner from '@images/pages/dialog-banner-sm.webp'
import { keyPressOnlyNumber, pasteOnlyNumber } from '@/utils/events'
import { useI18n } from 'vue-i18n'
import { useVuelidate } from "@vuelidate/core" 
import { helpers, required } from '@vuelidate/validators'
import { number } from '@intlify/core-base'

const { t } = useI18n()

// Properties
const showModal = ref(false)
const isLoading = ref(false)

const form = reactive({
  password: null,
  rangeInitial: null,
  rangeEnd: null,
})

const formClear = reactive({
  password: null,
  rangeInitial: null,
  rangeEnd: null,
})

const rules = computed(() => ({
  password: {
    required: helpers.withMessage(t('validations.fields_required'), required),
  },
  rangeInitial: {
    required: helpers.withMessage(t('validations.fields_required'), required),
    min: helpers.withMessage("Rango Inválido.", value => value <= form.rangeEnd),
  },
  rangeEnd: {
    required: helpers.withMessage(t('validations.fields_required'), required),
    max: helpers.withMessage("Rango Inválido.", value => value >= form.rangeInitial),
  },
}))

const v$ = useVuelidate(rules, form)

const closeModal = () => {
  Object.assign(form, formClear)
  
  showModal.value = false

  v$.value.$reset()
}

const handlerSubmit = async () => {
  v$.value.$touch()

  if (v$.value.$invalid) return

  isLoading.value = true

  try {
    await axios.post(`v1/inscriptions/regenerate-inscription/massive`, form)
    
    closeModal()

    Swal.fire({ text: "Proceso Exitoso.", icon: "success" })
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response && e.response.status < 500) {
      const { data } = e.response

      text = data.message
    }
    Swal.fire({ text, icon: "warning" })
  } finally {
    isLoading.value = false
  }
}

const handler = async () =>  {
  Swal.fire({
    title: "Ingresar contraseña de confirmación",
    input: "password",
    inputPlaceholder: "Contraseña de confirmación",
    showCancelButton: true,
    customClass: { 
      confirmButton: "bg-primary notAllowedEmulator",
      cancelButton: "bg-danger",
    },
    showLoaderOnConfirm: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Enviar",
    preConfirm: async password => {
      if (String(password).trim().length == 0) {
        Swal.showValidationMessage("La contraseña es obligatoria")
        
        return false
      }
      
      try {
        await axios.post(`v1/user/grouping-political/inactive`, {
          password: password,
        })
        
        Swal.fire({ text: "Operación Procesada", icon: "success" })

        return true
      } catch (e) {
        let text = 'No es posible realizar operación, por favor intenta más tarde.'
        if (e.response && e.response.status < 500) {
          const { data } = e.response

          text = data.message
        }
        Swal.fire({ text, icon: "warning" })
        
        return false
      }
    },
    allowOutsideClick: false,
  })  
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('update_local_ani.breadcrumbs.title'), $t('sketches_pending.breadcrumbs.page') ]" />
    <VCard>
      <VCardText class="text-center">
        <VBtn 
          prepend-icon="tabler-user-down" 
          class="w-25" @click="handler"
        >
          Enviar Operación
        </VBtn>

        <VBtn 
          prepend-icon="tabler-file-digit" 
          class="w-25 ml-5" 
          @click="showModal = true"
        >
          Regenerar Masivo
        </VBtn>
      </VCardText>
    </VCard>

    <VDialog
      v-model="showModal"
      max-width="450"
      persistent
    >
      <DialogCloseBtn @click="closeModal" />
      
      <VImg :src="banner" cover />
      
      <VCard>
        <VCardText>
          <VForm @submit.prevent="handlerSubmit">
            <VRow justify="center" class="mx-5">
              <VCol cols="12">
                <VTextField
                  v-model.number="form.rangeInitial"
                  label="Rango Inicial"
                  :error-messages="v$.rangeInitial.$errors[0]?.$message"
                  class="required"
                  :disabled="isLoading"
                  @keypress="keyPressOnlyNumber"
                  @paste="pasteOnlyNumber"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model.number="form.rangeEnd"
                  label="Rango Final"
                  :error-messages="v$.rangeEnd.$errors[0]?.$message"
                  class="required"
                  :disabled="isLoading"
                  @keypress="keyPressOnlyNumber"
                  @paste="pasteOnlyNumber"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model.trim="form.password"
                  label="Contraseña de Confirmación"
                  :error-messages="v$.password.$errors[0]?.$message"
                  class="required"
                  :disabled="isLoading"
                />
              </VCol>
            </VRow>
            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                :disabled="isLoading"
                @click="closeModal"
              >
                Cancelar
              </VBtn>
              <VBtn :loading="isLoading" class="notAllowedEmulator" :disabled="isLoading" type="submit">
                Enviar
              </VBtn>
            </VCardText>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "administration-closed"
meta:
  authRequired: true
</route>