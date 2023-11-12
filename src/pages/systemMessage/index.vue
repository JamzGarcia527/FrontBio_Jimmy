<script setup>
import SystemMessageFilter from "@/components/systemMessage/Filter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import imageLogo from '@images/pages/fondoContrasena.png'
import axios from "@/plugins/axios"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import { requiredVuelidate } from '@/utils/validators/vuelidate'
import {  helpers } from "@vuelidate/validators"

const { t } = useI18n()

const showItems = ref(false) 
const filters = ref({})
const isLoading = ref(false)
const isDialogVisible = ref(false)
const messageType = ref([])
const messageCode = ref([])
const form = ref(null)
const updateMessage = ref({})


//DataTable
const datatable = ref(null)

const filterUpdate = ref({
  messageType: -1,
  messageCode: null,
  messageDescription: null,
  messageDetail: null,
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const handlerSearchFilter = async selected => {
  const {
    messageCode: codeMsg,
    messageType: typeMessage,
    messageDescription: description,
  } = selected

  filters.value = {
    codeMsg,
    typeMessage,
    description,
  }

  showItems.value = true
  isLoading.value = true

}

const fields = ref([
  { key: 'typeName', label: t('menu_phases.systemMessage.typeName') },
  { key: 'code', label: t('menu_phases.systemMessage.code') },
  { key: 'description', label: t('menu_phases.systemMessage.description') },
  { key: 'value', label: t('menu_phases.systemMessage.value') },
  { key: 'accion', label: t('menu_phases.systemMessage.accion') },
])

const messageTypeData = async () => {
  try{
    const { data } = await axios.get('/v1/message/list/type')

    messageType.value = data
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data
      
      //console.log(message)      
    }
  }
}

const messageTypeSelect = computed(() => {
  
  const array = messageType.value.map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const rules = reactive({
  messageType: [value => {
    if (messageType.value === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  messageCode: [value => {
    if (messageCode.value === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  messageDescription: { requiredVuelidate,

    length: helpers.withMessage(

      "El campo debe cumplir con un máximo de 250 caracteres",

      value => !value || String(value).length <= 250,

    ) },
  messageDetail: { requiredVuelidate,

    length: helpers.withMessage(

      "El campo debe cumplir con un máximo de 1000 caracteres",

      value => !value || String(value).length <= 1000,

    ) },
})


const v$ = useVuelidate(rules, filterUpdate)

onMounted(() => {
  messageTypeData()
})

const openModal = async value => {

  isDialogVisible.value = true
  updateMessage.value = value

  filterUpdate.value.messageType = updateMessage.value.typeId
  filterUpdate.value.messageCode = updateMessage.value.code
  filterUpdate.value.messageDescription = updateMessage.value.description
  filterUpdate.value.messageDetail = updateMessage.value.value
}

const statuschange = async value =>{

  const statuswindows = value.state === 1 ? 'Inactivar' : 'Activar'

  Swal.fire({
    html: `¿ Está Seguro que desea ${statuswindows} el mensaje seleccionado ?`,
    icon: "warning",
    customClass: { confirmButton: "bg-primary" },
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    showDenyButton: true,
  }).then(async result => {
  /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      const requestBody = { "id": value.id, "code": value.code, "type_id": value.typeId, "value": value.value, "description": value.description, "state": value.state === 1 ? 1 : 0 }
      const status = value.state === 1 ? 'Activado' : 'Inactivado'
      try{
        const { data } = await axios.put('/v1/message/updated',requestBody)        

        await Swal.fire({ text: `Mensaje ${status} Exitosamente`, icon: "success" })

        //console.log(data)

      }catch (error) {
        isDialogVisible.value = false
        if (error.response && error.response.status < 500) {
          const { message } = error.response.data

          //console.log(message) 
        }
      }
    } else if (result.isDenied) {
      datatable.value.refresh()
    }
  })

}

const handlerSubmit = async () => {

  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true
  isDialogVisible.value = true  

  const { id, code, state } = updateMessage.value

  const { messageCode, messageType, messageDescription, messageDetail } = filterUpdate.value

  const requestBody = { "id": id, "code": messageCode === code ? code : messageCode, "type_id": messageType, "value": messageDetail, "description": messageDescription, "state": state }

  try{
    const { data } = await axios.put('/v1/message/updated',requestBody)

    //await Swal.fire({ text: data, icon: "success" })
    //console.log(data)
    isDialogVisible.value = false
    filterUpdate.value = {}
    datatable.value.refresh()

  }catch (error) {
    isDialogVisible.value = false
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      //console.log(message) 
      Swal.fire({ icon: 'warning', text: message })
    }
    isDialogVisible.value = true 
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('menu_phases.breadcrumbs.module'), $t('menu_phases.systemMessage.title') ]" />
    <SystemMessageFilter class="mb-4" @search="handlerSearchFilter" />  
    <VCard v-if="showItems" :title="t('menu_phases.systemMessage.title_table')">
      <DataTableServerSide 
        ref="datatable"
        endpoint="/v1/message/list"
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
    <VDialog
      v-model="isDialogVisible" width="600"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />
      <!-- Dialog Content -->
      <VCard class="text-wrap">
        <VImg
          :src="imageLogo"
          cover
        />        
        <VForm ref="form" @submit.prevent="handlerSubmit">
          <br>
          <VRow class="ps-5 d-flex justify-center">
            <h4>Editar Mensaje</h4>
          </VRow>        
          <VCardText>
            <VRow>
              <VCol>
                <VSelect 
                  v-model="filterUpdate.messageType"
                  label="Tipo de Mensaje"
                  :items="messageTypeSelect"
                  :rules="rules.messageType"
                />
              </VCol>
              <VCol>
                <VTextField 
                  v-model="filterUpdate.messageCode"
                  label="Código de Mensaje"
                />
              </VCol>
            </VRow>          
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="filterUpdate.messageDescription"
                  label="Descripción del Mensaje"
                  :error-messages="v$.messageDescription.$errors[0]?.$message"
                  rows="4"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="filterUpdate.messageDetail"
                  label="Detalle del Mensaje"
                  :error-messages="v$.messageDetail.$errors[0]?.$message"
                  rows="10"
                />
              </VCol>
            </VRow>
          </VCardText>
          <VCardText class="d-flex justify-end">
            <VBtn @click="isDialogVisible = false">
              {{ t('common.btn_close') }}
            </VBtn>
            <VBtn type="submit" class="mx-2">
              {{ t('common.btn_submit') }}
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "system-message"
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
