<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from "vue-i18n"
import { requiredEspecialSelectValidator, requiredValidator, maxLengthValidator,emailValidator } from "@/utils/validators"
import { useRouter } from 'vue-router'


const { t } = useI18n()
const router = useRouter()
const form = ref(null)

const formEdit = ref({
  typeNotification: null,
  destinationEmail: '',
  description: '',
  contenidoHTML:'',
})

async function cargarArchivo(){

  const contenido = ``

  formEdit.value.contenidoHTML =  contenido

}

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const stateOptions = computed(() => {
  const array = [
    { title: 'Correo Electronico', value: 1 },
  ]

  return addOptionDefault(array)
})

const rules = reactive({
  typeNotification: [requiredEspecialSelectValidator],
  
  typeNotification: [value => {
    if (formEdit.typeNotification === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],

  destinationEmail: [maxLengthValidator(250),emailValidator],
  description: [requiredValidator, maxLengthValidator(250)],
  contenidoHTML:[requiredValidator],

})

const handlerSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  const {  typeNotification, destinationEmail,  description, contenidoHTML } = formEdit.value

  const requestBody = {
    "subject":description,
    "destinationMail":destinationEmail,
    "body":contenidoHTML,
    "typeNotification":typeNotification,
  }

  try {
    const { data } = await axios.post('/v1/emailtemplate/create_email', requestBody)

    Swal.fire({ text: t('supportingDocuments.management.swal.msg_success'), icon: "success" })

    router.replace({ name: 'system-notifications' })

  } catch (error) {
    let message = t('common.not_operation')
    if (error.response && error.response.status < 500) 
      message = error.response.data.message
    Swal.fire({ icon: "warning", text: message })
      
    return false
  }

}

onMounted(() => {
  cargarArchivo()
})

const clearForm = () => {
  window.history.back()
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('menu_phases.breadcrumbs.module'), $t('menu_phases.systemNotifications.title') ]" />
    <VCard class="pa-5 mb-2" title="Creación de Notificaciones">
      <VForm ref="form" validate-on="submit" @submit.prevent="handlerSubmit">
        <VRow class="mb-3">
          <VCol cols="12" md="6">
            <VSelect
              v-model="formEdit.typeNotification"
              label="Tipo de Notificación"
              :items="stateOptions"
              :rules="rules.typeNotification"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="formEdit.destinationEmail" 
              label="Correo Destino"
              class="mb-2 required"
              :rules="rules.destinationEmail"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextarea
              v-model.trim="formEdit.contenidoHTML" 
              prepend-inner-icon="tabler-message-2" 
              label="Cuerpo de la Notificación"
              :rules="rules.contenidoHTML"
              rows="40"
            />
          </VCol>
          <VCol cols="12" md="6">
            <div v-html="formEdit.contenidoHTML" />
          </VCol>
        
          <VCol cols="12" md="12">
            <VTextarea v-model="formEdit.description" :rules="rules.description" label="Descripción del Asunto" focused="true" placeholder="Por favor ingrese una descripción de máximo 250 caracteres" counter />
          </VCol> 
        </VRow>
        <VRow>
          <VCol class="d-flex flex-row-reverse mt-5">
            <VBtn type="submit" class="notAllowedEmulator" :loading="loading">
              Guardar
            </VBtn>
            <VBtn class="mr-3" @click="clearForm">
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "system-notifications-create"
meta:
authRequired: true
</route>
