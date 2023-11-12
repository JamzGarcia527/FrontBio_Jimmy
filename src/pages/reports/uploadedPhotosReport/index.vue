<script setup>
import UploadedPhotosFilter from '@/components/reports/uploadedPhotosReport/uploadedPhotosFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSideReports.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import imageLogo from '@images/pages/fondoContrasena.png'
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import { downloadBlob } from '@/utils'


const isDownloading = ref(false)
const { t } = useI18n()

const filters = ref([])
const dataForExport = ref()


const fields = ref([
  { key: "groupingType", label:t('common.grouping_political_type').toUpperCase()  },
  { key: "groupingName", label: t('common.grouping_political_name').toUpperCase() },
  { key: "department", label: t('reports_inscription.letters.department').toUpperCase() },
  { key: 'municipality',label: t('reports_inscription.letters.municipality').toUpperCase() },
  { key: 'commune',label: t('reports_inscription.letters.commune').toUpperCase() },
  { key: "corporation", label: t('common.corporation').toUpperCase() },
  { key: "circunscription", label: t('common.circunscription').toUpperCase()  },
  { key: "totalCandidates", label: t('candidate_uploaded_photos_report.number_registered_candidates').toUpperCase() },
  { key: 'numberPhotos', label: t('candidate_uploaded_photos_report.uploaded_photos').toUpperCase()  },
])


const showData = ref(false)
 
const handlerSearchFilter = value => {
  filters.value = value 
  showData.value = true
}

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "department": filter.department,
    "municipality": filter.municipality,
    "commune": filter.commune,
    "corporationId": filter.corporationId,
    "circunscriptionId": filter.circunscriptionId,
    "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
    "groupingPoliticalId": filter.groupingPoliticalId,
    type: type === 'CSV' ? 2 : 1,
  }

  axios.get(`/v1/files/candidates/photo-candidate-report`, {
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'CSV' ? 'Reporte de Fotos Cargadas de Candidatos Inscritos.csv' : 'Reporte de Fotos Cargadas de Candidatos Inscritos.xlsx'

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
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.letters.uploaded_photos_filter') ]" /> 
    <UploadedPhotosFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showData">
      <div class="text-right me-3 mt-3 mb-2">
        <VMenu open-on-hover>
          <template #activator="{ props }">
            <VBtn v-bind="props" prepend-icon="tabler-table-export" :loading="isDownloading"> 
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
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/files/candidates/photo-candidate-info"
        table-class="table-bordered"
        :params="filters"
        :fields="fields"
      >
        <template #cell(numberCandidatesE6)="{ item }">
          <div class="d-flex justify-center">
            {{ item.numberCandidatesE6 }}
          </div>
        </template>
        <template #cell(numberCandidatesE7)="{ item }">
          <div class="d-flex justify-center">
            {{ item.numberCandidatesE7 }}
          </div>
        </template>
        <template #cell(totalCandidates)="{ item }">
          <div class="d-flex justify-center">
            {{ item.totalCandidates }}
          </div>
        </template>
        <template #cell(numberPhotos)="{ item }">
          <div class="d-flex justify-center">
            {{ item.numberPhotos }}
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "uploaded-photos-report"
meta:
authRequired: true
</route>
