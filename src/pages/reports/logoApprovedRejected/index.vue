<script setup>
import LogoApprovedRejectedFilter from "@/components/reports/logoApprovedRejected/logoApprovedRejectedFilter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import ViewLogo from "@/components/logo-symbol/historical-rejections/ViewLogo.vue"
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'

const { t } = useI18n()
const filters = ref({})
const showItems = ref(false)
const isLoading = ref(false)
const isDownloading = ref(false)


const fields = ref([
  { key: "shippingDate", label: t('logos_pending_approval.letters.date_shipment_spite').toUpperCase() },
  { key: "nameGroupType", label: t('common.grouping_political_type').toUpperCase() },
  { key: "nameGroupPolitical", label: t('common.grouping_political_name').toUpperCase() },
  { key: 'departmentName', label: t('module_reports.detailPhotosUploadedCandidates.department').toUpperCase() },
  { key: 'municipalityName', label: t('module_reports.detailPhotosUploadedCandidates.municipality').toUpperCase() },
  { key: 'resolutionNumber', label: t('logo_approved_rejected.letters.no_of_Resolution').toUpperCase() },
  { key: 'resolutionDate', label: t('logo_approved_rejected.letters.date_Resolution').toUpperCase() },
  { key: 'magistrateOffice', label: t('logo_approved_rejected.letters.office_magistrate').toUpperCase() },
  { key: 'presentResource', label: t('logo_approved_rejected.letters.resenta_recurso').toUpperCase() },
  { key: 'state', label: t('logo_approved_rejected.letters.aprueba_rechaza').toUpperCase() },
  { key: 'nameLogo', label: t('logo_approved_rejected.letters.imagen_logo_símbolo').toUpperCase() },
])


const handlerSearchFilter = async value => {

  filters.value = value

  showItems.value = true
  isLoading.value = true
}

const exportar = type => {
  isDownloading.value = true

  const { groupingPoliticalTypeId,groupingPoliticalId } = filters.value
  const payload = { groupingPoliticalTypeId,groupingPoliticalId  ,"type": type === 'XLS' ? 1 : 2 }

  axios.get(`/v1/grouping-political-logo/report-logo-approval-rejected-export`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte de Logos Aprobados y rechazados.xlsx' : 'Reporte de Logos Aprobados y rechazados.csv' 
    
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('logo_approved_rejected.title') ]" />
    <LogoApprovedRejectedFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showItems">
      <div class="d-flex justify-end me-3 mt-3 mb-2">
        <VMenu open-on-hover>
          <template #activator="{ props }">
            <VBtn v-bind="props" :loading="loadingExportButton" :disabled="disabledExport" prepend-icon="tabler-table-export">
              {{ t('common.btn_export') }}
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
        endpoint="/v1/grouping-political-logo/report-logo-approval-rejected"
        :params="filters"
        :fields="fields"
        show-empty-message
      >
        <template #cell(nameLogo)="{ item }">
          <div class="d-flex justify-center">
            <ViewLogo :logo-id="item.groupingPoliticalId" />
          </div>
        </template>
        <template #cell(state)="{ item }">
          <VChip v-if="item.state == 'Pendiente Aprobación'" color="warning">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.state }}</span>
          </VChip>
          <VChip v-else-if="item.state == 'Rechazado'" color="error">
            <VIcon start size="16" icon="tabler-circle-x" />
            <span>{{ item.state }}</span>
          </VChip>
          <VChip v-else-if="item.state == 'Aprobado'" color="success">
            <VIcon start size="16" icon="tabler-circle-check" />
            <span>{{ item.state }}</span>
          </VChip>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "logo-approved-rejected"
meta:
authRequired: true
</route>
