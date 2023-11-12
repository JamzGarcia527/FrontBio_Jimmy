<script setup>
import E6PendingGenerateE8Filter from '@/components/e6PendingGenerateE8/e6PendingGenerateE8Filter.vue'
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
const filtersShow = ref(null)

const nameFile = ref()
const fileType = ref()


const fields = ref([
  { key: "countList", label: t('common.numberLists').toUpperCase() },
  { key: "corporation", label: t('common.corporation').toUpperCase() },
  { key: "circunscription", label: t('common.circunscription').toUpperCase() },
  { key: "departmentName", label: t('reports_inscription.letters.department').toUpperCase() },
  { key: 'municipalityName',label: t('reports_inscription.letters.municipality').toUpperCase() },
  { key: 'communeName',label: t('reports_inscription.letters.commune').toUpperCase() },
  { key: "groupingPoliticalName", label: t('common.grouping_political_name').toUpperCase() },
  { key: "groupingPoliticalType", label: t('common.grouping_political_type').toUpperCase() },
 
])



const handlerSearchFilter = value => {
  filters.value = value 
  filtersShow.value = filters.value.corporationId
}

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "corporationId": filter.corporationId,
    "circunscriptionId": filter.circunscriptionId,
    format: type,
  }

  axios.get(`/v1/inscription-pending/report-export`, {
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    if(type ==='XLS'){
      nameFile.value = 'E6 Pendientes por generar E8.xlsx'
      fileType.value = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
    }else if(type ==='CSV'){
      nameFile.value = 'E6 Pendientes por generar E8.csv'
      fileType.value = 'text/csv;charset=utf-8'
    }else if(type ==='PDF'){
      nameFile.value = 'E6 Pendientes por generar E8.pdf'
      fileType.value = 'application/pdf'
    }

    downloadBlob(data, nameFile.value, fileType.value)
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('e6_pending_enerate_e8.module'), $t('e6_pending_enerate_e8.title') ]" /> 
    <E6PendingGenerateE8Filter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="filtersShow">
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
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/inscription-pending/report"
        table-class="table-bordered"
        :params="filters"
        :fields="fields"
      />
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "e6-Pending-Generate-E8"
meta:
authRequired: true
</route>
