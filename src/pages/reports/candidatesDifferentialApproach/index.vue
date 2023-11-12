<script setup>
import CandidatesDifferentialApproachFilter from "@/components/reports/candidatesDifferentialApproachReport/candidatesDifferentialApproachFilter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import axios from "@/plugins/axios"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'
import Swal from '@/plugins/sweetalert2'

const { t } = useI18n()
const datatable = ref(null)
const showItems = ref(false) 
const filters = ref({})
const isLoading = ref(false)
const isDownloading = ref(false)
const payload = ref('')


const handlerSearchFilter = async selected => {

  filters.value = selected

  const filter = filters.value

  payload.value = {
    "corpId": filter.corporationId,
    "depa": filter.department,
    "focus": filter.focus,
  }
  
  showItems.value = true
  isLoading.value = true

}

const fields = ref([
  { key: 'enfoque', label: t('module_reports.candidatesDifferentialApproach.category') },
  { key: 'respuesta', label: t('module_reports.candidatesDifferentialApproach.differential') },
  { key: 'cant', label: t('module_reports.candidatesDifferentialApproach.quantity') },
])

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "corpId": filter.corporationId,
    "depa": filter.department,
    "focus": filter.focus,
    "format": type === 'XLS' ? 1 : 2,
  }

  axios.get(`/v1/candidates/candidats/focus/export`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte de Candidatos por Enfoque Diferencial.xlsx' : 'Reporte de Candidatos por Enfoque Diferenciala.csv' 
    
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.candidatesDifferentialApproach.title') ]" />
    <CandidatesDifferentialApproachFilter class="mb-4" @search="handlerSearchFilter" />  
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
      <DataTableServerSide 
        ref="datatable"
        endpoint="/v1/candidates/candidats/focus"
        :params="payload"
        :fields="fields"
        :loading="isLoading"
      />
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "focus-candidates"
meta:
authRequired: true
</route>
