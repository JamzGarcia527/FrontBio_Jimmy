<script setup>
import QuantityCandidatesRegisteredGenderFilter from "@/components/reports/quantityCandidatesRegisteredGenderReport/quantityCandidatesRegisteredGenderFilter.vue"
import DataTable from '@/components/shared/DataTable.vue'
import axios from "@/plugins/axios"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'
import Swal from '@/plugins/sweetalert2'

const { t } = useI18n()

const showItems = ref(false) 
const filters = ref({})
const isLoading = ref(false)
const isDownloading = ref(false)
const itemsData = ref([])
const error = ref(null)

const handlerSearchFilter = async selected => {
  const {
    corporationId: corporation_id,
    circunscriptionId: circunscription_id,
    department: department_id,
    municipality: municipality_id,
    commune: commune_id,
  } = selected

  filters.value = {
    corporation_id,
    circunscription_id,
    department_id,
    municipality_id,
    commune_id,
  }  

  showItems.value = true
  isLoading.value = true
  showData()

}

const fields = ref([
  { key: 'corporationName', label: t('module_reports.quantityCandidatesRegisteredGender.corporationName'), thClass: 'text-center' },
  { key: 'genderCandidates', label: t('module_reports.quantityCandidatesRegisteredGender.genderCandidates'), thClass: 'text-center' },
  { key: 'quantityApprovedCandidates', label: t('module_reports.quantityCandidatesRegisteredGender.quantityApprovedCandidates'), thClass: 'text-center' },
])
 
const showData = async () =>{
  try {
    
    const { corporation_id, circunscription_id, department_id, municipality_id, commune_id } = filters.value
    const queryParams = { corporation_id, circunscription_id, department_id, municipality_id, commune_id }
    const { data } = await axios.get('/v1/candidates/gender-report-E8',{ params: queryParams })

    itemsData.value = data

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
    "format": type === 'XLS' ? 1 : 2,
  }

  axios.get(`/v1/candidates/gender-report-E8-export`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte Cantidad de candidatos inscritos por Género.xlsx' : 'Reporte Cantidad de candidatos inscritos por Género.csv' 
    
    downloadBlob(data, nameFile, type === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8') 
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isDownloading.value = false)
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.quantityCandidatesRegisteredGender.title') ]" />
    <QuantityCandidatesRegisteredGenderFilter class="mb-4" @search="handlerSearchFilter" />  
    <VCard v-if="showItems">
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
      <DataTable :items="itemsData" :fields="fields" paginate>
        <template #cell(corporationName)="{ item }">
          <div class="d-flex justify-center">
            {{ item.corporationName }}          
          </div>
        </template>
        <template #cell(genderCandidates)="{ item }">
          <div class="d-flex justify-center">
            {{ item.genderCandidates }}          
          </div>
        </template>
        <template #cell(quantityApprovedCandidates)="{ item }">
          <div class="d-flex justify-center">
            {{ item.quantityApprovedCandidates }}          
          </div>
        </template>
      </DataTable>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "quantity-candidates-registered-gender"
meta:
authRequired: true
</route>
