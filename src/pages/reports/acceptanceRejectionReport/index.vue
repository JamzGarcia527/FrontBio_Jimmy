<script setup>
import AcceptanceRejectionFilter from '@/components/reports/acceptanceRejectionReport/acceptanceRejectionFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSideReportsTotal.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'

const { t } = useI18n()

const filters = ref([])
const isDownloading = ref(false)
const requestBody = ref('')


const fields = ref([
  { key: "type", label: t('acceptance_rejection.letters.typePoliticalGrouping').toUpperCase() },
  { key: "name", label: t('acceptance_rejection.letters.namePoliticalGroup').toUpperCase()  },
  { key: 'department', label: t('acceptance_rejection.letters.department').toUpperCase() },
  { key: "municipality", label: t('acceptance_rejection.letters.municipality').toUpperCase() },
  { key: "commune", label:t('acceptance_rejection.letters.commune').toUpperCase() },
  { key: "corporation", label: t('acceptance_rejection.letters.corporationName').toUpperCase() },
  { key: "registeredCandidates", label: t('acceptance_rejection.letters.numberRegisteredCandidates').toUpperCase() },
  { key: 'candidatesAccepted',label: t('acceptance_rejection.letters.numberCandidatesAcceptedCandidacy').toUpperCase() },
  { key: 'acceptanceLetters',label: t('acceptance_rejection.letters.uploadedLettersAcceptance').toUpperCase() },
  { key: "candidatesRejected", label: t('acceptance_rejection.letters.numberCandidatesDidNotAcceptCandidacy').toUpperCase() },
  { key: "rejectionLetters", label: t('acceptance_rejection.letters.uploadedResignationLetters').toUpperCase() },
  { key: "acceptanceEIS", label: t('acceptance_rejection.letters.numberEISAcceptanceCandidates').toUpperCase() },
  { key: "acceptanceFacial", label: t('acceptance_rejection.letters.numberCandidatesFacialAcceptance').toUpperCase() },
])

const handlerSearchFilter = value => {
  filters.value = value
  
}

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value


  if(!filter.groupingPoliticalTypeId  ){
    requestBody.value = {
      "department": filter.department,
      "municipality": filter.municipality,
      "commune": filter.commune,
      "corporationId": filter.corporationId,
      "circunscriptionId": filter.circunscriptionId,
      exte: type === 'CSV' ? 2 : 1,
    }
  }  else if(filter.groupingPoliticalTypeId && filter.groupingPoliticalId== -1){
    requestBody.value = {
      "department": filter.department,
      "municipality": filter.municipality,
      "commune": filter.commune,
      "corporationId": filter.corporationId,
      "circunscriptionId": filter.circunscriptionId,
      "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
      exte: type === 'CSV' ? 2 : 1,
    }
  }else if( filter.groupingPoliticalTypeId && filter.groupingPoliticalId ){
    requestBody.value = {
      "department": filter.department,
      "municipality": filter.municipality,
      "commune": filter.commune,
      "corporationId": filter.corporationId,
      "circunscriptionId": filter.circunscriptionId,
      "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
      "groupingPoliticalId": filter.groupingPoliticalId,
      exte: type === 'CSV' ? 2 : 1,
    }
  }


  axios.get(`/v1/inscriptions/summary/download`, {
    params: requestBody.value,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'CSV' ? 'Reporte de Aceptación o Rechazo de Candidaturas.csv' : 'Reporte de Aceptación o Rechazo de Candidaturas.xlsx'

    downloadBlob(data, nameFile, type === 'CSV' ? 'text/csv;charset=utf-8' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('acceptance_rejection.title') ]" /> 
    <AcceptanceRejectionFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard>
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
        endpoint="/v1/inscriptions/summary/candidates"
        :params="filters"
        :fields="fields"
      >
        <template #cell(registeredCandidates)="{ item }">
          <div class="d-flex justify-center">
            {{ item.registeredCandidates }}
          </div>
        </template>
        <template #cell(candidatesAccepted)="{ item }">
          <div class="d-flex justify-center">
            {{ item.candidatesAccepted }}
          </div>
        </template>
        <template #cell(acceptanceLetters)="{ item }">
          <div class="d-flex justify-center">
            {{ item.acceptanceLetters }}
          </div>
        </template>
        <template #cell(candidatesRejected)="{ item }">
          <div class="d-flex justify-center">
            {{ item.candidatesRejected }}
          </div>
        </template>
        <template #cell(rejectionLetters)="{ item }">
          <div class="d-flex justify-center">
            {{ item.rejectionLetters }}
          </div>
        </template>
        <template #cell(acceptanceEIS)="{ item }">
          <div class="d-flex justify-center">
            {{ item.acceptanceEIS }}
          </div>
        </template>
        <template #cell(acceptanceFacial)="{ item }">
          <div class="d-flex justify-center">
            {{ item.acceptanceFacial }}
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "acceptance-rejection-report"
meta:
authRequired: true
</route>
