<script setup>
import SystemNotificationsFilter from "@/components/systemNotifications/Filter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import imageLogo from '@images/pages/fondoContrasena.png'
import axios from "@/plugins/axios"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'
import Swal from '@/plugins/sweetalert2'
import { requiredEspecialSelectValidator, requiredValidator, maxLengthValidator,emailValidator } from "@/utils/validators"

const { t } = useI18n()

const showItems = ref(false) 
const filters = ref({})
const isLoading = ref(false)
const isDialogVisible = ref(false)
const form = ref(null)
const updateMessage = ref({})

//DataTable
const datatable = ref(null)

const formEdit = ref({
  id:null,
  typeNotification: null,
  destinationEmail: '',
  description: '',
  contenidoHTML:'',
  state: null,
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const handlerSearchFilter = async selected => {
  const {
    notificationName: id,
  } = selected

  filters.value = {
    id,
  }

  showItems.value = true
  isLoading.value = true
  isDialogVisible.value = false
}

const fields = ref([
  { key: 'subject', label: t('menu_phases.systemNotifications.subject') },
  { key: 'accion', label: t('menu_phases.systemNotifications.accion') },
])

const openModal = async value => {

  const { id, subject, body, destinationMail, state } = value

  formEdit.value = {
    id: id,
    destinationEmail: destinationMail,
    contenidoHTML:  body,
    description: subject,
    state: state,
  }

  isDialogVisible.value = true
  updateMessage.value = value 
  showItems.value = false
}

const statuschange = async value =>{

  const statuswindows = value.state === 1 ? 'Inactivar' : 'Activar'

  Swal.fire({
    html: `¿ Está Seguro que desea ${statuswindows} la notificación seleccionada ?`,
    icon: "warning",
    customClass: { confirmButton: "bg-primary" },
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    showDenyButton: true,
  }).then(async result => {
  /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {

      const { id, subject, body, destinationMail, state } = value

      const requestBody = { "id": id, "subject": subject, "destinationMail": destinationMail, "body": body, "state": state }

      const status = value.state === 1 ? 'Activado' : 'Inactivado'
      try{

        const { data } = await axios.put('/v1/emailtemplate/edit-email',requestBody)

        await Swal.fire({ text: `Notificación ${status} Exitosamente`, icon: "success" })        
        
        datatable.value.refresh()        


      }catch (error) {
        isDialogVisible.value = false
        if (error.response && error.response.status < 500) {
          const { message } = error.response.data

        }
      }
    } else if (result.isDenied) {
      datatable.value.refresh()
    }
  })

}

const handlerSubmit = async () => {
  isLoading.value = true
  isDialogVisible.value = true  

  const { valid } = await form.value.validate()
  if (!valid) return false

  Swal.fire({
    html: "¿ Está Seguro que desea modificar notificación seleccionada ?",
    icon: "warning",
    customClass: { confirmButton: "bg-primary" },
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    showDenyButton: true,
  }).then(async result => {
  /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {      

      const { id, destinationEmail, contenidoHTML, description, state } = formEdit.value

      const requestBody = { "id": id, "subject": description, "destinationMail": destinationEmail, "body": contenidoHTML, "state": state }

      try{
        const { data } = await axios.put('/v1/emailtemplate/edit-email',requestBody)

        await Swal.fire({ text: `Sea modificado Exitosamente la notificación`, icon: "success" })
        
        isDialogVisible.value = false
        showItems.value = true
        formEdit.value = {}
        datatable.value.refresh()        



      }catch (error) {
        if (error.response && error.response.status < 500) {
          const { message } = error.response.data
        }
      }
    } else if (result.isDenied) {
      datatable.value.refresh()
    }
  })
}

const rules = reactive({
  typeNotification: [requiredEspecialSelectValidator],
  
  typeNotification: [value => {
    if (formEdit.typeNotification === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],

  destinationEmail: [ maxLengthValidator(250),emailValidator],

  description: [requiredValidator, maxLengthValidator(250)],
  contenidoHTML:[requiredValidator],

})

const clearForm =  () => {
  showItems.value = true
  isDialogVisible.value = false
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('menu_phases.breadcrumbs.module'), $t('menu_phases.systemNotifications.title') ]" />
    <SystemNotificationsFilter class="mb-4" @search="handlerSearchFilter" /> 
    <VBtn :to="{ name: 'system-notifications-create'}" class="mb-4">
      Crear Notificación
    </VBtn> 
    <VCard v-if="showItems" :title="t('menu_phases.systemNotifications.title_table')">
      <DataTableServerSide 
        ref="datatable"
        endpoint="/v1/emailtemplate/list"
        :params="filters"
        :fields="fields"
        :loading="isLoading"
      >
        <template #cell(accion)="{item}">
          <div class="horizontal-container">
            <VBtn size="30">
              <VIcon
                icon="tabler-writing"
                size="22"
                @click="openModal(item)"
              />
            </VBtn>
            <VSwitch
              v-model="item.state"
              color="info"
              :true-value="1"
              :false-value="0"
              @click="statuschange(item)"
            />      
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
    <VCard v-if="isDialogVisible" class="pa-5 mb-2" title="Modificar Notificaciones">
      <VForm ref="form" validate-on="submit" @submit.prevent="handlerSubmit">
        <VRow class="mb-3">
          <VCol cols="12" md="12">
            <VTextField
              v-model="formEdit.destinationEmail" 
              label="Correo Destino"
              class="mb-2"
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
            <VBtn class="mr-3 ml-3" @click="clearForm">
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "system-notifications"
meta:
authRequired: true
</route>

<style>
.horizontal-container {
  display: flex;
  align-items: center;
}

.horizontal-container > * + * {
  margin-inline-start: 10px;
}
</style>
