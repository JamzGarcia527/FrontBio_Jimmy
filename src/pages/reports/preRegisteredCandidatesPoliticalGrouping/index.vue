<script setup>
import PreRegisteredCandidatesPoliticalGroupingFilter from "@/components/reports/preRegisteredCandidatesPoliticalGroupingReport/preRegisteredCandidatesPoliticalGroupingFilter.vue"
import DataTableServerSideReportsTotalE8 from "@/components/shared/DataTableServerSideReportsTotalE8.vue"
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
const error = ref(null)
const datatable = ref(null)

const handlerSearchFilter = async selected => {
  const {
    corporationId: corporationId,
    department: departmentId,
    municipality: municipalityId,
    commune: communeId,
  } = selected

  filters.value = {
    corporationId,
    circunscripcionId : -1,
    departmentId,
    municipalityId,
    communeId,
  }  

  showItems.value = true
  isLoading.value = true

}

const fields = ref([
  { key: 'typeGroup', label: t('module_reports.preRegisteredCandidatesPoliticalGrouping.typeGroup') },
  { key: 'nameGroup', label: t('module_reports.preRegisteredCandidatesPoliticalGrouping.nameGroup') },
  { key: 'department', label: t('module_reports.preRegisteredCandidatesPoliticalGrouping.department') },
  { key: 'municipality', label: t('module_reports.preRegisteredCandidatesPoliticalGrouping.municipality') },
  { key: 'commune', label: t('module_reports.preRegisteredCandidatesPoliticalGrouping.commune') },  
  { key: 'candidatesMen', label: t('module_reports.preRegisteredCandidatesPoliticalGrouping.candidatesMen') },
  { key: 'candidatesWomen', label: t('module_reports.preRegisteredCandidatesPoliticalGrouping.candidatesWomen') },
  { key: 'countTotalCandidats', label: t('module_reports.preRegisteredCandidatesPoliticalGrouping.countTotalCandidats') },
])

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "corporationId": filter.corporationId,
    "circunscriptionId": -1,
    "departmentId": filter.departmentId,
    "municipalityId": filter.municipalityId,
    "communeId": filter.communeId,
    "type": type === 'XLS' ? 1 : 2,
  }

  axios.get(`/v1/inscriptions/report/pre-inscriptions/export`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte Candidatos Pre-inscritos por Agrupación política.xlsx' : 'Reporte Candidatos Pre-inscritos por Agrupación política.csv' 
    
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.preRegisteredCandidatesPoliticalGrouping.title') ]" />
    <PreRegisteredCandidatesPoliticalGroupingFilter class="mb-4" @search="handlerSearchFilter" />  
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
      <DataTableServerSideReportsTotalE8
        ref="datatable"
        endpoint="v1/inscriptions/report/pre-inscriptions"
        :params="filters"
        :fields="fields"
      >
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
        <template #cell(countTotalCandidats)="{ item }">
          <div class="d-flex justify-center">
            {{ item.countTotalCandidats }}          
          </div>
        </template>
      </DataTableServerSideReportsTotalE8>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "preregistered-candidates-political-grouping"
meta:
authRequired: true
</route>
