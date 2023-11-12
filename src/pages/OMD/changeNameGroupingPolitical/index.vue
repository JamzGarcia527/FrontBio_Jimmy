<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import { keyPressOnlyNumber, pasteOnlyNumber  } from '@/utils/events'

// Validators
import {
  requiredVuelidate,
  maxLengthVuelidate,
} from '@/utils/validators/vuelidate'

// Translate i18n
import { useI18n } from 'vue-i18n'

// Defining variables
const { t } = useI18n()
const isLoading = ref(false)
const formDisabled = ref(false)
const formDisabled2 = ref(false)
const codeGroupingPolitical = ref('')
const dataEndpoint = ref({})
const nameGrupingPolitical = ref("")

const form = ref({ 
  idGroupingPolitical: null,
  newNameGroupingPolitical: null,
  reason: null,
})

// Forms rules
const rules = computed(() => ({ 
  newNameGroupingPolitical: { requiredVuelidate, maxLength: maxLengthVuelidate(60) },
  reason: { requiredVuelidate, maxLength: maxLengthVuelidate(500) },
}))

const v$ = useVuelidate(rules, form)

// Chnage Name Groping Political
const sendData = async () => {

  v$.value.$touch()
  if (v$.value.$invalid) return
  
  Swal.fire({
    html: "¿Está seguro de aplicar los cambios?",
    icon: "question",
    customClass: { confirmButton: "bg-primary" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {

      form.value.idGroupingPolitical = parseInt(codeGroupingPolitical.value)
  
      const { 
        idGroupingPolitical,
        newNameGroupingPolitical,
        reason,
      } = form.value

      const requestBody = {
        idGroupinPolitical: idGroupingPolitical,
        newNameGroupinPolitical: newNameGroupingPolitical.toUpperCase(),
        reason:reason,
      }

      try {
        await axios.post('/v1/omd', requestBody).then(() => {
      
          Swal.fire({
            icon: 'success',
            text: 'El nombre de la agrupación política fue actualizado exitosamente.',
          })  
          clearForm()
          codeGroupingPolitical.value = ''
          nameGrupingPolitical.value = ''
      
          return true
        } )      
      } catch (error) {
        if (error.response && error.response.status <= 500) {
          const { message } = error.response.data

          // Mostrar el mensaje de error original
          await Swal.fire({
            icon: 'warning',
            text: message,
          })
        }
    
        return false
      } finally {
        isLoading.value = false
        formDisabled.value = false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

const getData = async () => {
  try {
    const { data } = await axios.get(`grouping-political/${codeGroupingPolitical.value}`)

    dataEndpoint.value = data
    nameGrupingPolitical.value = data.name.toUpperCase()
    form.value.newNameGroupingPolitical = data.name.toUpperCase()
  } catch (error) {
    if (error.response && error.response.status !== 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || t('validations.errorAlert'),
      })
      formDisabled2.value = false
    }
  }

}

// Clear form
const clearForm = () => {

  form.value = {}
  v$.value.$reset()
}
</script> 
  
<template>
  <div>
    <VBreadcrumbs :items="[ t('OMD.group_political.breadcrumbs'), t('OMD.group_political.title2') ]" />
    <VCard flat :title="t('OMD.group_political.title')">
      <VCardText>
        <VForm ref="refForm" :disabled="formDisabled2" class="mt-2" @submit.prevent="sendData">
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="codeGroupingPolitical"
                :label="t('OMD.group_political.codeGroupingPolitical')"
                :placeholder="t('OMD.group_political.codeGroupingPolitical')"
                @focusout="getData"
                @keypress="keyPressOnlyNumber"
                @paste="pasteOnlyNumber"
              />
            </VCol>
          </VRow>
          <VRow justify="end">
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="nameGrupingPolitical"
                :label="t('OMD.group_political.nameGrupPoli')"
                clearable
                :placeholder="t('OMD.group_political.nameGrupPoli')"
                disabled
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.newNameGroupingPolitical"
                :label="t('OMD.group_political.nameGrupPoliNew')"
                clearable
                :placeholder="t('OMD.group_political.nameGrupPoliNew')"
                :error-messages="v$.newNameGroupingPolitical.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
            >
              <VTextarea 
                v-model.trim="form.reason" 
                variant="outlined"
                clearable
                :label="t('OMD.group_political.motive')"
                :placeholder="t('OMD.group_political.motive')"
                :error-messages="v$.reason.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              class="d-flex gap-4"
            >
              <VBtn type="submit" :loading="isLoading">
                {{ t('OMD.group_political.btnCreate') }}
              </VBtn>

              <VBtn
                type="reset"
                color="secondary"
                variant="tonal"
                @click="clearForm"
              >
                {{ t('user.cancel') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "omd-change-name-grouping-political"
meta:
  authRequired: true
</route>
