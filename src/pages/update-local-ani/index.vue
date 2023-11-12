<script setup>
import { useI18n } from "vue-i18n"
import { useVuelidate } from '@vuelidate/core'
import FormViewData from "@/components/update-local-ani/FormViewData.vue"
import FormEditData from "@/components/update-local-ani/FormEditData.vue"
import DialogCreate from "@/components/update-local-ani/DialogCreate.vue"
import axios from "@/plugins/axios"
import Swal from '@/plugins/sweetalert2'

// Validators
import {
  integerVuelidate,
  requiredVuelidate,
} from '@/utils/validators/vuelidate'

const { t } = useI18n()
const loading = ref()
const disabled = ref()
const dialogCreateIsOpen = ref(false)
const disabledFormFind = ref(false)
const cleanFormViewData = ref(false)
const isDifferent = ref(null)
const alertIsVisible = ref(false)

const dataAniByDni = ref({})

const formFind = ref({
  dni: null,
})

const rules = computed(() => ({
  dni: { requiredVuelidate, integerVuelidate },
}))

const v$ = useVuelidate(rules, formFind)

const handlerFindByDni = async () => {

  v$.value.$touch()
  if (v$.value.$invalid) return
  try {
    cleanFormViewData.value = false
    loading.value = true
    disabled.value = true

    const { dni } = formFind.value

    // endpoint para consultar info por dni
    const response = await axios.get(`/ani/find/${dni}`)

    if (response.data) {
      disabledFormFind.value = true
    }

    dataAniByDni.value = response.data

  } catch (error) {
    // capturar errores
    if (error.response && error.response.status <= 500) {
      if (error.response.status == 400) {
        dialogCreateIsOpen.value = true
        disabledFormFind.value = true
      }

      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }

    return false
  } finally {
    loading.value = false
    disabled.value = false
  }
}

const handlerUpdated = async value => {

  const { dni } = value 
  try {
    // endpoint para consultar info por dni
    const { data } = await axios.get(`/ani/${dni}`)

    dataAniByDni.value = data
  
    return true
  } catch (error) {
    // capturar errores
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }

    return false
  }
  
}

const handlerCloseDialog = () => {
  dialogCreateIsOpen.value = false
}

const handlerCreated = () => {
  dialogCreateIsOpen.value = false
}

const handlerClearForm = () => {
  formFind.value = {}
  v$.value.$reset()
  disabledFormFind.value = false
}

const handlerCleanFormEdit = () => {
  handlerClearForm()
  cleanFormViewData.value = true
}

const handlerCleanFormView = () => {
  cleanFormViewData.value = false
}

const handlerisDifferent = value => {
  if (value) {
    isDifferent.value = true
    alertIsVisible.value = false
  } else {
    isDifferent.value = false
    alertIsVisible.value = true
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('update_local_ani.breadcrumbs.title'), t('update_local_ani.breadcrumbs.page')]" />
    <VCard>
      <VCardText>
        <VForm ref="refForm" :disabled="disabled" @submit.prevent="handlerFindByDni">
          <VRow class="mb-2">
            <VCol cols="12" md="8">
              <VTextField
                v-model.trim="formFind.dni"
                :disabled="disabledFormFind" 
                :label="t('update_local_ani.formFind.dni')" :error-messages="v$.dni.$errors[0]?.$message"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VBtn
                v-if="!disabledFormFind" block type="submit" 
                :loading="loading" :disabled="disabled || formFind.dni == null || formFind.dni === ''"
              >
                {{ t('common.consult') }}  
              </VBtn>
              <VBtn v-if="disabledFormFind" color="secondary" block @click="handlerClearForm">
                {{ t('common.btn_reset') }}  
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
        <VDivider class="mb-5" />
        <VAlert
          v-if="alertIsVisible"
          density="compact"
          color="primary"
          text="No ha realizado cambios en la información"
        />

        <VRow class="mt-5">
          <VCol cols="12" md="6">
            <VCard>
              <VCardItem>
                <VCardTitle>INFORMACIÓN ANI</VCardTitle>
                <VCardSubtitle>Información de solo lectura</VCardSubtitle>
              </VCardItem>
              <VCardText>
                <FormViewData :clean-form="cleanFormViewData" :data="dataAniByDni" @cleaned-form="handlerCleanFormView" />
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard>
              <VCardItem>
                <VCardTitle>ACTUALIZAR INFORMACIÓN ANI</VCardTitle>
                <VCardSubtitle>Todos los campos en este espacio son editables</VCardSubtitle>
              </VCardItem>
              <VCardText>
                <FormEditData :data="dataAniByDni" @updated="handlerUpdated" @cleaned-form="handlerCleanFormEdit" @is-different="handlerisDifferent" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <DialogCreate :is-open-dialog="dialogCreateIsOpen" :dni="formFind.dni" @created="handlerCreated" @close-dialog="handlerCloseDialog" />
  </div>
</template>

<route lang="yaml">
name: "update-local-ani"
meta:
  authRequired: true
</route>
