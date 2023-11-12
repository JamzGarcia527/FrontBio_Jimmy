<script setup>
import Filter from "@/pages/reports/registeredCandidatesByCorporation/Filter.vue"
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'

// Defining and initializing variables
const { t } = useI18n()
const filtersControls = reactive({ loading: false, disabled: false })
const tableIsVisible = ref(false)
const endpoint = '/v1/inscription-final/list-report'
const loadingExportButton = ref(false)
const disabledExport = ref(false)
const datatable = ref(null)
const filters = ref({})

const fields = ref([
  { key: 'corporation', label: t('module_reports.registeredCandidatesByCorporation.table.corporation').toUpperCase() },
  { key: 'departmentName', label: t('module_reports.registeredCandidatesByCorporation.table.department').toUpperCase() },
  { key: 'municipalityName', label: t('module_reports.registeredCandidatesByCorporation.table.municipality').toUpperCase() },
  { key: 'communeName', label: t('module_reports.registeredCandidatesByCorporation.table.commune').toUpperCase() },
  { key: 'dni', label: t('module_reports.registeredCandidatesByCorporation.table.dni').toUpperCase(), thClass: 'text-center' },
  { key: 'fullName', label: t('module_reports.registeredCandidatesByCorporation.table.fullName').toUpperCase() },
  { key: 'groupingPoliticalName', label: t('module_reports.registeredCandidatesByCorporation.table.groupingPoliticalName').toUpperCase() },
])

// Methods and functions
const handlerSearchFilter = value => {  
  filtersControls.loading = true
  filtersControls.disabled = true

  const queryParams = {
    department: value.department,
    corporationId: value.corporationId,
    municipality: value.municipality,
    circunscriptionId: value.circunscriptionId,
    commune: value.commune,
  }

  filters.value = queryParams
  tableIsVisible.value = value.valid

  filtersControls.loading = false
  filtersControls.disabled = false
}

const exportFile = async value => {

  const { department, corporationId, municipality, circunscriptionId, commune } = filters.value

  const queryParams = { department, corporationId, municipality, circunscriptionId, commune, format: value }

  try {
    loadingExportButton.value = true
    disabledExport.value = true

    const { data } = await axios.get('/v1/inscription-final/report-export', { params: queryParams, responseType: 'blob' })

    const fileType = value === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8'
    const fileName = value === 'XLS' ? `reporte-candidatos-por-corporación.xls` : `reporte-candidatos-por-corporación.csv`
    const file = new Blob([data], { type: fileType })

    downloadBlob(file, fileName, fileType)
    
  } catch (error) {
    console.table(error)
    if (error.response && error.response.status <= 500) {

      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: t('sketches_pending.not_operation') || message,
      })
    }
  } finally {
    loadingExportButton.value = false
    disabledExport.value = false
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('module_reports.registeredCandidatesByCorporation.breadcrumbs.title'), t('module_reports.registeredCandidatesByCorporation.breadcrumbs.page')]" />
    <Filter 
      :disabled="filtersControls.disabled" 
      :loading="filtersControls.loading"
      class="mb-2"
      @search="handlerSearchFilter"
    />
    <div class="d-flex justify-end me-3 mt-3 mb-2">
      <VMenu open-on-hover>
        <template #activator="{ props }">
          <VBtn v-if="tableIsVisible" v-bind="props" :loading="loadingExportButton" :disabled="disabledExport" prepend-icon="tabler-table-export">
            {{ t('module_reports.registeredCandidatesByCorporation.btn_export') }}
          </VBtn>
        </template>

        <VList>
          <VListItem
            :title="t('formsPendingApproval.breadcrumbs.bntExcel')"
            @click="exportFile('XLS')"
          />
          <VListItem
            :title="t('formsPendingApproval.breadcrumbs.bntCSV')"
            @click="exportFile('CSV')"
          />
        </VList>
      </VMenu>
    </div>
    <DataTableServerSide v-if="tableIsVisible" ref="datatable" :params="filters" :endpoint="endpoint" :fields="fields" show-empty-message>
      <template #cell(dni)="{ item }">
        <div class="text-center">
          {{ item.dni }}
        </div>
      </template>
    </DataTableServerSide>
  </div>
</template>

<route lang="yaml">
  name: "reports-registered-candidates-by-corporation"
  meta:
  authRequired: true
</route>

