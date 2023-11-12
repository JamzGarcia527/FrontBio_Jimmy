<script setup>
import ChangeListFilter from '@/components/OMD/changeListFilter.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import imageFilter from '@images/pages/ListOMD.png'
import { useAppAbility } from '@/plugins/casl/useAppAbility'

// Validators
import {
  requiredVuelidate,
} from '@/utils/validators/vuelidate'

// Translate i18n
import { useI18n } from 'vue-i18n'
import { downloadBlob } from '@/utils'

// Defining variables
const { t } = useI18n()
const formDisabled = ref(false)
const showData = ref(false)
const requestBody = ref()
const filters = ref([])
const datatable = ref(null)
const items = ref([])
const pdfUrl = ref('')
const showModal = ref(false)
const { can } = useAppAbility()
const dataPost = ref()

const fields = ref([
  { key: "omdNumber", label: t('OMD.fieldslistOMD.omdNumber').toUpperCase(), thClass: 'text-center' },
  { key: "omdType", label: t('OMD.fieldslistOMD.omdType').toUpperCase(), thClass: 'text-center' },
  { key: "omdReason", label: t('OMD.fieldslistOMD.omdReason').toUpperCase(), thClass: 'text-center' },
  { key: "groupingPoliticalName", label: t('OMD.fieldslistOMD.namePoliticalGrouping').toUpperCase(), thClass: 'text-center' },
  { key: "corporation", label: t('OMD.fieldslistOMD.corporation').toUpperCase(), thClass: 'text-center' },
  { key: "circunscription", label: t('OMD.fieldslistOMD.circunscription').toUpperCase(), thClass: 'text-center' },
  { key: "department", label: t('OMD.fieldslistOMD.departament').toUpperCase() },
  { key: "municipality", label: t('OMD.fieldslistOMD.municipality').toUpperCase() },
  { key: "commune", label: t('OMD.fieldslistOMD.commune').toUpperCase(), thClass: 'text-center' },
  { key: "observations", label: t('OMD.fieldslistOMD.motiveOMD').toUpperCase(), thClass: 'text-center' },
  { key: "createdBy", label: t('OMD.fieldslistOMD.userCreate').toUpperCase(), thClass: 'text-center' },
  { key: "createdAt", label: t('OMD.fieldslistOMD.dateCreate').toUpperCase(), thClass: 'text-center' },
  { key: "supportDocName", label: t('OMD.fieldslistOMD.support').toUpperCase(), thClass: 'text-center' },
  { key: "omdHash", label: t('OMD.fieldslistOMD.optionShowOMD').toUpperCase(), thClass: 'text-center' },
  { key: "idDocument", label: t('OMD.fieldslistOMD.optionShowOffice').toUpperCase() },
])


const generateOfficeDelivery = async () => {
  try {
    await axios.post('/v1/omd/office-doc', dataPost.value)
    
    Swal.fire("Se Generó Oficio de Entrega Correctamente")
    datatable.value.refresh()
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    } else {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
    }
  }
}

const isDownloading = ref(false)

const exportar = type => {
  isDownloading.value = true

  const payload = { ...filters.value, "format": type }

  axios.get('/v1/omd/list-omd/export',{
    params: payload,
    responseType: "blob", // importante
  }).then(({ headers, data }) => {
    const ext = type == 'XLS' ? '.xlsx' : '.csv'
    const filename = headers['x-custom-filename'] ?? `reporte_lista_omd${ext}`

    downloadBlob(data, filename, headers['content-type']) 
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isDownloading.value = false)
}

// Clear form
const clearForm = () => {
  window.history.back()
  form.value = {}
  v$.value.$reset()
}

const handlerSearchFilter  = async value => {

  filters.value = value
  
  const requestBody = {
    department: filters.value.department,
    municipality: filters.value.municipality,
    commune: filters.value.commune,
    corporationId: filters.value.corporationId,
    groupingPoliticalTypeId: filters.value.groupingPoliticalTypeId,
    groupingPoliticalId: -1,    
    numberOmd: filters.value.numberOmd,
    dateInit: filters.value.dateInit,
    dataEnd: filters.value.dataEnd,
    description: filters.value.description,
    size: 100000,
  }

  const paramsWithoutSize = reactive(
    Object.entries(requestBody).reduce((acc, [key, value]) => {
      if (key !== 'size') {
        acc[key] = value
      }
      
      return acc
    }, {}),
  )

  dataPost.value = paramsWithoutSize

  showData.value = true
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
</script> 
  
<template>
  <div>
    <VBreadcrumbs :items="[ t('OMD.group_political.breadcrumbs'), t('OMD.listOMD.title') ]" />
    <VCard flat :title="t('OMD.listOMD.title')">
      <ChangeListFilter class="mb-4" @search="handlerSearchFilter" />
      <template v-if="showData">
        <VCardText>
          <VRow>
            <VCol cols="12" md="4">
              <div>Resultado de la busqueda</div>
            </VCol>
            <VCol cols="12" md="8" class="text-right">
              <div>
                <VBtn type="button" class="me-2" @click="generateOfficeDelivery">
                  Generar Oficio de Entrega
                </VBtn>
                <VMenu open-on-hover>
                  <template #activator="{ props }">
                    <VBtn v-bind="props" prepend-icon="tabler-table-export" :loading="isDownloading">
                      {{ t('common.btn_export') }}
                    </VBtn>
                  </template>
                  <VList>
                    <VListItem :title="t('common.btn_export_csv')" @click="exportar('CSV')" />
                    <VListItem :title="t('common.btn_export_excel')" @click="exportar('XLS')" />
                  </VList>
                </VMenu>
              </div>
            </VCol>
          </VRow>
        </VCardText>
        <DataTableServerSide 
          ref="datatable"
          endpoint="/v1/omd/list-omd"
          table-class="table-bordered"
          :params="filters"
          :fields="fields"
          show-empty-message
        >
          <template #cell(groupingPoliticalName)="{ item }">
            <p class="ma-0 line-height">
              {{ item.groupingPoliticalName }} <br>
              <small class="text-grey-500">{{ item.groupingPoliticalType }}</small>
            </p>
          </template>
          <template #cell(observations)="{ value }">
            <div class="text-wrap" style="width: 350px;">
              {{ value }}
            </div>
          </template>
          <template #cell(createdBy)="{ value }">
            <div class="text-wrap" style="width: 150px;">
              {{ value }}
            </div>
          </template>
          <template #cell(supportDocName)="{ item }">
            <div v-if="item.supportDocHash !== null && item.supportDocHash !== ''">
              <VBtn
                v-if="can('show', 'file-inscriptions-doc')"
                class="text-center"
                icon="tabler-eye"
                variant="text"
                color="secondary"
                @click="showFileSupport(item.id)"
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
                @click="showFileOMD(item.id)"
              />
            </div>
          </template> 
          <template #cell(idDocument)="{ item }">
            <div v-if="item.idDocument !== null && item.idDocument !== ''">
              <VBtn
                class="text-end"
                icon="tabler-eye"
                variant="text"
                color="secondary"
                @click="showFile(item.idDocument)"
              />
            </div>
          </template> 
        </DataTableServerSide>
      </template>
      <VCardText v-else>
        <div class="mb-10 ps-10 mt-10 pr-10">
          <VImg
            :src="imageFilter"
            cover
          />
        </div>
      </VCardText>
    </VCard>

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
  </div>
</template>

<route lang="yaml">
name: "omd-list-omd"
meta:
  authRequired: true
</route>
