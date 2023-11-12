<script setup>
import SummaryInscriptionFilter from "@/components/reports/summaryInscriptionReport/summaryInscriptionFilter.vue"
import DataTable from '@/components/shared/DataTable.vue'
import axios from "@/plugins/axios"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'
import Swal from '@/plugins/sweetalert2'

const { t } = useI18n()

const showItems = ref(false) 
const filters = ref({})
const reportOption = ref('')
const isLoading = ref(false)
const isDownloading = ref(false)
const itemsData = ref([])
const showModal = ref(false)
const error = ref(null)
const pdfUrl = ref()
const showDataTable = ref('')

const handlerSearchFilter = async selected => {
  const {
    corporationId: corporation_id,
    circunscriptionId: circunscription_id,
    department: department_id,
    municipality: municipality_id,
    commune: commune_id,
    inscriptionTypeId: registration_type,
  } = selected

  filters.value = {
    corporation_id,
    circunscription_id,
    department_id,
    municipality_id,
    commune_id,
    registration_type,
  }  

  showItems.value = true
  isLoading.value = true
  showData()

}

const fields = ref([
  { key: 'nameGroup', label: t('module_reports.summaryInscription.nameGroup') }, 
  { key: 'corporationName', label: t('module_reports.summaryInscription.corporationName') }, 
  { key: 'circunscriptionsName', label: t('module_reports.summaryInscription.circunscriptionsName') }, 
  { key: 'department', label: t('module_reports.summaryInscription.department') }, 
  { key: 'municipality', label: t('module_reports.summaryInscription.municipality') }, 
  { key: 'commune', label: t('module_reports.summaryInscription.commune') }, 
  { key: 'votePreferential', label: t('module_reports.summaryInscription.votePreferential') },
  { key: 'versionI', label: t('module_reports.summaryInscription.versionI') },
  { key: 'voteBlank', label: t('module_reports.summaryInscription.voteBlank') },
  { key: 'stateList', label: t('module_reports.summaryInscription.stateList') },
  { key: 'downloadE6', label: t('module_reports.summaryInscription.downloadE6') },
  { key: 'downloadE8', label: t('module_reports.summaryInscription.downloadE8') },
  { key: 'countTotalCandidats', label: t('module_reports.summaryInscription.countTotalCandidats') },
  { key: 'candidatesMen', label: t('module_reports.summaryInscription.candidatesMen') },
  { key: 'candidatesWomen', label: t('module_reports.summaryInscription.candidatesWomen') },
  { key: 'createDate', label: t('module_reports.summaryInscription.createDate') },
  { key: 'createBy', label: t('module_reports.summaryInscription.createBy') },
  { key: 'users_dni', label: t('module_reports.summaryInscription.users_dni') },
  { key: 'inscription_type', label: t('module_reports.summaryInscription.inscription_type') },
  { key: 'devoluciones', label: t('module_reports.summaryInscription.devoluciones') },
])

const showData = async () =>{
  try {
    
    const { corporation_id, circunscription_id, department_id, municipality_id, commune_id, registration_type } = filters.value
    const queryParams = { corporation_id, circunscription_id, department_id, municipality_id, commune_id, registration_type }
    const { data } = await axios.get(`/v1/inscriptions/summary/inscription`,{ params: queryParams })

    itemsData.value = data
     
    showDataTable.value = data[0].total

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || 'No existen datos.',
      })
    }
  }
}

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "corporation_id": filter.corporation_id,
    "circunscription_id": filter.circunscription_id,
    "department_id": filter.department_id,
    "municipality_id": filter.municipality_id,
    "commune_id": filter.commune_id,
    "registration_type": filter.registration_type,
    "page": 0,
    "format": type === 'XLS' ? 1 : 2,
  }

  axios.get(`/v1/inscriptions/summary/export/report`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte de Resumen de Inscripción.xlsx' : 'Reporte de Resumen de Inscripción.csv' 
    
    downloadBlob(data, nameFile, type === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8') 
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isDownloading.value = false)
}

const showFile = async id => {
    
  try {
    // get route PDF
    const response = await axios.get (`/v1/inscriptions/preview/${id}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })
  
    pdfUrl.value = URL.createObjectURL(file)      
    showModal.value = true
  
  } catch (error) {
    if(error){
      await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
    }
  }
}

const printE8 = async id =>  {
  
  try {
    const response = await axios.get(`/v1/inscription-final/download/${id}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })
 
    pdfUrl.value = URL.createObjectURL(file)
    showModal.value = true

  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
  }
  setTimeout(() => isLoading.value = false, 1000)
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.summaryInscription.title') ]" />
    <SummaryInscriptionFilter class="mb-4" @search="handlerSearchFilter" />  
    <VCard v-if="showItems">
      <div v-if="showDataTable">
        <div style="margin-left: 90%;" class="me-3 mt-3 mb-2">
          <VMenu open-on-hover>
            <template #activator="{ props }">
              <VBtn v-bind="props">
                {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
              </VBtn>
            </template>

            <VList>
              <VListItem
                icon="la-file-excel"
                :title="t('formsPendingApproval.breadcrumbs.bntExcel')"
                @click="exportar('XLS')"
              />
              <VListItem
                :title="t('formsPendingApproval.breadcrumbs.bntCSV')"
                @click="exportar('CSV')"
              />
            </VList>
          </VMenu>
        </div>
        <VRow class="ps-10">
          <VCol>
            <h5>{{ t('module_reports.summaryInscription.totalTypeVirtual') }}: {{ itemsData[0].totalTypeVirtual }}</h5>
          </VCol>
          <VCol>
            <h5>{{ t('module_reports.summaryInscription.totalTypeManual') }}: {{ itemsData[0].totalTypeManual }}</h5>
          </VCol>
          <VCol>
            <h5>{{ t('module_reports.summaryInscription.total') }}: {{ itemsData[0].total }}</h5>
          </VCol>
        </VRow>
        <br>      
        <DataTable :items="itemsData" :fields="fields" paginate>
          <template #v-thead>
            <tr>
              <th class="text-center" colspan="12" />
              <th class="text-center border bg-info-light" colspan="3">
                Sección Candidatos Aprobados
              </th>
              <th class="text-center border bg-orange-light" colspan="5">
                Sección General
              </th>
            </tr>
          </template>        
          <template #cell(votePreferential)="{ item }">
            <div v-if="item.total" class="d-flex justify-center">
              <div class="d-flex justify-center">
                {{ item.votePreferential == 1 ? 'Preferente' : 'No Preferente' }}
              </div>
            </div>
          </template>
          <template #cell(voteBlank)="{ item }">
            <div v-if="item.total" class="d-flex justify-center">
              <div class="d-flex justify-center">
                {{ item.voteBlank == 1 ? 'SI' : 'NO' }}          
              </div>
            </div>
          </template>
          <template #cell(countTotalCandidats)="{ item }">
            <div class="d-flex justify-center">
              {{ item.countTotalCandidats == 0 ? '0' : item.countTotalCandidats }}          
            </div>
          </template>
          <template #cell(candidatesMen)="{ item }">
            <div class="d-flex justify-center">
              {{ item.candidatesMen == 0 ? '0' : item.candidatesMen }}          
            </div>
          </template>
          <template #cell(candidatesWomen)="{ item }">
            <div class="d-flex justify-center">
              {{ item.candidatesWomen == 0 ? '0' : item.candidatesWomen }}          
            </div>
          </template>
          <template #cell(downloadE6)="{ item }">
            <div class="d-flex justify-center" />
            <VBtn
              class="text-center"
              icon="tabler-eye"
              variant="text"
              color="secondary"
              @click="showFile(item.idInscription)"
            />            
          </template>

          <template #cell(downloadE8)="{ item }">
            <div v-if="item.downloadE8 == 1" class="d-flex justify-center">
              <VBtn
                class="text-center"
                icon="tabler-eye"
                variant="text"
                color="secondary"
                @click="printE8(item.idInscription)"
              />            
            </div>
          </template>

          <template #cell(devoluciones)="{ item }">
            <div class="d-flex justify-center">
              {{ item.devoluciones == 0 ? '0' : item.devoluciones }}          
            </div>
          </template>
        </DataTable>
      </div>
      <div v-else>
        <VCard>
          <VAlert color="secondary" class="text-center">
            No hay registros para mostrar
          </VAlert>
        </VCard>
      </div>
    </VCard>
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
  name: "reports-summaryInscription"
  meta:
  authRequired: true
</route>
