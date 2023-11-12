<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import DataTable from '@/components/shared/DataTableServerSide.vue'
import imageFilter from '@images/pages/ChequearOMDFirmadas.png'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { downloadBlob } from '@/utils'

// Validators
import {
  requiredVuelidate,
} from '@/utils/validators/vuelidate'

// Translate i18n
import { useI18n } from 'vue-i18n'

// Defining variables
const { t } = useI18n()
const isLoading = ref(false)
const formDisabled = ref(false)
const showData = ref(false)
const loadingExportButton = ref(false)
const disabledExport = ref(false)
const items = ref({})
const datatable = ref(null)
const requestBody = ref()
const pdfUrl = ref('')
const showModal = ref(false)
const { can } = useAppAbility()
const IDOMD = ref({})


const fields = ref([
  { key: "idOmd", label: t('OMD.fieldslistOMD.numberOMD').toUpperCase(), thClass: 'text-center' },
  { key: "department", label: t('OMD.fieldslistOMD.departament').toUpperCase() },
  { key: "municipality", label: t('OMD.fieldslistOMD.municipality').toUpperCase() },
  { key: "commune", label: t('OMD.fieldslistOMD.commune').toUpperCase(), thClass: 'text-center' },
  { key: "nameCorporation", label: t('OMD.fieldslistOMD.corporation').toUpperCase(), thClass: 'text-center' },
  { key: "circunscription", label: t('OMD.fieldslistOMD.circunscription').toUpperCase(), thClass: 'text-center' },
  { key: "typeName", label: t('OMD.fieldslistOMD.typePoliticalGrouping').toUpperCase(), thClass: 'text-center' },
  { key: "nameGroup", label: t('OMD.fieldslistOMD.namePoliticalGrouping').toUpperCase(), thClass: 'text-center' },
  { key: "reasons", label: t('OMD.fieldslistOMD.motiveOMD').toUpperCase(), thClass: 'text-center' },
  { key: "createdBy", label: t('OMD.fieldslistOMD.userCreate').toUpperCase(), thClass: 'text-center' },
  { key: "createdAt", label: t('OMD.fieldslistOMD.dateCreate').toUpperCase(), thClass: 'text-center' },
  { key: "supportDoc", label: t('OMD.fieldslistOMD.support').toUpperCase(), thClass: 'text-center' },
  { key: "omdHash", label: t('OMD.fieldslistOMD.optionShowOMD').toUpperCase(), thClass: 'text-center' },
  { key: "hashOffice", label: t('OMD.fieldslistOMD.optionShowOffice').toUpperCase(), thClass: 'text-center' },
  { key: "firms", label: t('OMD.fieldslistOMD.checked').toUpperCase(), thClass: 'text-center' },
])


const form = ref({ 
  state: -1,
  endDate: null,
  startDate: null,
})

const itemsSelect = ref([
  { title: 'Todos', value: -1 },
  { title: 'Pendientes Firmas', value: 1 },
  { title: 'Firmadas', value: 2 },
])

// Forms rules
const rules = computed(() => ({ 
  state: { requiredVuelidate },
  endDate: { requiredVuelidate },
  startDate: { requiredVuelidate },
}))

const v$ = useVuelidate(rules, form)

const searchData = async () => {

  v$.value.$touch()
  if (v$.value.$invalid) return
  
  if(v$.value.$invalid === false){
    showData.value = true
    isLoading.value = true
  }

  const { ...result } = form.value

  requestBody.value = { 
    ...result,
    page:0,
    size:9999,
  }
  try {       
    await axios
      .get("/v1/omd/get/firms/filter", {
        params: requestBody.value,
      })
      .then(response => {
        items.value = response.data
        
        datatable.value.refresh()
        isLoading.value = false
      })
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await  Swal.fire({ icon: 'warning', text: message })
    }

    return false
  }
}

const exportExcel = async value => {

  if(v$.value.$invalid === true){
    Swal.fire("Debe selecionar las opciones del filtro para exportar información.")
  }

  else{
    
    const payload = {
      "state": form.value.state,
      "startDate": form.value.startDate,
      "endDate": form.value.endDate,
      "format": value === 'XLS' ? 1 : 2,
    }

    
    axios.get(`/v1/omd/get/firms/filter/export`,{
      params: payload,
      responseType: "blob", // importante
    }).then(({ data }) => {
      const nameFile = 'OMD_Chequeadas.xlsx'   
    
      downloadBlob(data, nameFile, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8') 
    }).catch(error => {
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: "warning", text: message })
      }
    }).finally(() => loadingExportButton.value = false)

    
  }
}

// Clear form
const clearForm = () => {
  window.history.back()
  form.value = {}
  v$.value.$reset()
}

const statuschange = async (idCheck, idOmd) =>{
  Swal.fire({
    html: `¿ Esta Seguro que desea actualizar la información ?`,
    icon: "warning",
    customClass: { confirmButton: "bg-primary" },
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    showDenyButton: true,
  }).then(async result => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      const requestBody = { "firm": idCheck }


      try{
        const { data } = await axios.put(`/v1/omd/update/state/firms?id=${idOmd}`,requestBody)        

        await Swal.fire({ text: `Datos Actualizados Exitosamente`, icon: "success" })

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

// show view file OfficeDelivery
const showFile = async id => {

  try {
  // get route PDF
    const response = await axios.get (`/v1/omd/get/omd-officeDoc/pdf?id=${id}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)

    showModal.value = true

  } catch (error) {
    if(error){
      await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
    }
  }

}

// show view file OfficeDelivery
const showFileSupport = async idSupport => {  
  try {
  // get route PDF
    const response = await axios.get (`/v1/omd/get/file/support?id=${idSupport}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)

    showModal.value = true

  } catch (error) {
    if(error){
      await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
    }
  }

}

// show view file OfficeDelivery
const showFileOMD = async Id => {  
  try {
  // get route PDF
    const response = await axios.get (`/v1/omd/get/file/omd?id=${Id}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)

    showModal.value = true

  } catch (error) {
    if(error){
      await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
    }
  }

}

const handlerApplicationAcceptance = async (idCheck, value) => {

  const requestBody = { "firm": value }

  Swal.fire({
    title: value == 1 ? t('candidates.applicationAcceptanceCheck.titleAcceptCandidacy') : t('candidates.applicationAcceptanceCheck.titleRejectCandidacy'),
    icon: "question",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        const response = await axios.put(`/v1/omd/update/state/firms?id=${idCheck}`, requestBody)

        if (response.status == 204) {
          Swal.fire({ text: t('candidates.applicationAcceptanceCheck.msg_confirmation'), icon: "success" }) 
        
          return true
        }
      
      } catch (error) {
        let message = t('candidates.applicationAcceptanceCheck.not_operation')
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
      
        return false
      } finally {
        datatable.value.refresh()
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}
</script> 
  
<template>
  <div>
    <VBreadcrumbs :items="[ t('OMD.group_political.breadcrumbs'), t('OMD.checkSignedOMD.title') ]" />
    <VCard flat :title="t('OMD.checkSignedOMD.title')">
      <VCardText>
        <VForm ref="refForm" :disabled="formDisabled" class="mt-2" @submit.prevent="searchData">
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VSelect
                v-model="form.state"
                :items="itemsSelect"
                item-title="title"
                item-value="value"
                label="Filtro"
                :error-messages="v$.state.$errors[0]?.$message"
                :model-value="form.state"
                class="mt-4"
              />
            </VCol>            
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="form.startDate"
                type="date"
                :label="t('securityPolicy.startDate')"
                :disabled="formDisabled"
                class="mt-4"
                :error-messages="v$.startDate.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="form.endDate"
                type="date"
                :label="t('securityPolicy.endingDate')"
                :disabled="formDisabled"
                class="mt-5"
                :error-messages="v$.endDate.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              sm="6"
              md="6"
              class="d-flex gap-4"
              style="margin-left: 45%;"
            >
              <VBtn type="submit">
                {{ t('OMD.listOMD.btnSearch') }}
              </VBtn>
            </VCol>
            <VCol 
              cols="12"
              sm="6"
              md="6"
            >
              <VBtn :loading="loadingExportButton" prepend-icon="tabler-table-export" @click="exportExcel('XLS')">
                {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardText v-if="showData">
        <DataTable  
          ref="datatable"
          endpoint="/v1/omd/get/firms/filter"
          table-class="table-bordered"
          :params="requestBody"
          :fields="fields"
        >
          <template #cell(firms)="{ value, item }">
            <div style="width: 150px;">
              <VRadioGroup  
                v-model="item.firms"
                inline
                @update:model-value="$event => statuschange(item.firms, item.id, $event)"  
              >
                <VRadio label="Si" :value="item.firms == 2 ? value : 2" />
                <VRadio label="No" :value="item.firms == 1 ? value : 1" />
              </VRadioGroup>
            </div>
          </template>
          <template #cell(supportDoc)="{ item }">
            <div v-if="item.supportDoc !== null && item.supportDoc !== ''">
              <VBtn
                class="text-center"
                icon="tabler-eye"
                variant="text"
                color="secondary"
                @click="showFileSupport(item.idOmd)"
              />
            </div>
          </template> 
          <template #cell(omdHash)="{ item }">
            <div v-if="item.omdHash !== null && item.omdHash !== ''">
              <VBtn
                class="text-center"
                icon="tabler-eye"
                variant="text"
                color="secondary"
                @click="showFileOMD(item.idOmd)"
              />
            </div>
          </template> 
          <template #cell(hashOffice)="{ item }">
            <div v-if="item.hashOffice !== null && item.hashOffice !== ''">
              <VBtn
                class="text-end"
                icon="tabler-eye"
                variant="text"
                color="secondary"
                @click="showFile(item.officedocId)"
              />
            </div>
          </template> 
        </DataTable>
        <!-- Modal Show PDF -->
        <VDialog v-model="showModal" width="1050">
          <!-- Dialog close btn -->
          <DialogCloseBtn @click="showModal = !showModal" />
          <!-- Dialog Content -->
          <VCard>
            <VCardText>
              <embed :src="pdfUrl" type="application/pdf" width="100%" height="500" :zoom="zoom">
            </VCardText>
            <VCardText class="d-flex justify-end">
              <VBtn @click="showModal = false">
                Cerrar
              </VBtn>
            </VCardText>
          </VCard>
        </VDialog>
      </VCardText>
      <VCardText v-else>
        <div class="mb-10 ps-10 mt-10 pr-10">
          <VImg
            :src="imageFilter"
            cover
          />
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "omd-check-signed-omd"
meta:
  authRequired: true
</route>