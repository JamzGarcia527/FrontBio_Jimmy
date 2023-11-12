<script setup>
import { useI18n } from "vue-i18n"
import Filter from '@/pages/sketches/pending-approval/components/Filter.vue'
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { _buildDownloadCSV } from "@/utils/functions"
import { downloadBlob } from '@/utils'

// Defining and initializing variables
const { t } = useI18n()
const filtersControls = reactive({ loading: false, disabled: false })
const filters = ref({})
const datatable = ref(null)
const endPoint = '/v1/cardsketches/report' // Endpoint to get the data
const loadingExportButton = ref(false)
const disabledExport = ref(false)

const fields = ref([
  { key: "corporation", label: t('sketches_pending.table.corporation').toUpperCase() },
  { key: "circunscription", label: t('sketches_pending.table.circunscription').toUpperCase() },
  { key: "department", label: t('sketches_pending.table.departament').toUpperCase() },
  { key: "municipality", label: t('sketches_pending.table.municipality').toUpperCase() },
  { key: "commune", label: t('sketches_pending.table.commune').toUpperCase() },
  { key: "sovp", label: t('sketches_pending.table.drawn').toUpperCase(), thClass: 'text-center' },
  { key: "status", label: t('sketches_pending.table.state').toUpperCase(), thClass: 'text-center' },
])

// Functions and methods
const handlerSearchFilter = value => {
  
  filtersControls.loading = false
  filtersControls.disabled = false

  filters.value = value

  filtersControls.loading = false
  filtersControls.disabled = false

}

const exportFile = async value => {
  const { department, municipality, commune, corporationId } = filters.value

  const queryParams = { department, municipality, commune, corporationId, format: value }

  try {
    loadingExportButton.value = true
    disabledExport.value = true

    const { data } = await axios.get(`/v1/cardsketches/report-export`, { params: queryParams, responseType: 'blob' })

    const fileType = value === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8'
    const fileName = value === 'XLS' ? `Bocetos pendientes por aprobar.xls` : `Bocetos pendientes por aprobar.csv`
    const file = new Blob([data], { type: fileType })

    downloadBlob(file, fileName, fileType)
    
  } catch (error) {
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
    <VBreadcrumbs :items="[ t('sketches_pending.breadcrumbs.page'), t('sketches_pending.breadcrumbs.title')]" />
    <Filter 
      :loading="filtersControls.loading"
      :disabled="filtersControls.disabled"
      class="mb-4"
      @next="handlerSearchFilter"
    />
    <div class="d-flex justify-end me-3 mt-3 mb-2">
      <VMenu open-on-hover>
        <template #activator="{ props }">
          <VBtn v-bind="props" :loading="loadingExportButton" :disabled="disabledExport" prepend-icon="tabler-table-export">
            {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
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
    <DataTableServerSide ref="datatable" show-empty-message :fields="fields" :params="filters" :endpoint="endPoint">
      <template #cell(sovp)="{item}">
        <div class="d-flex justify-center">
          {{ item.sovp == 'P' ? 'PREFERENTE' : item.sovp == 'N' ? 'NO PREFERENTE' : item.sovp == 'C' ? 'COMBINADO' : item.sovp == null ? '-' : item.sovp == 'SORTEADO DIVIPOL' }}
        </div>
      </template>
      <template #cell(status)="{item}">
        <div class="d-flex justify-center">
          {{ item.status === 'Aprobado' ? 'Revisado' : 'Pendiente de Revisión' }}
        </div>
      </template>
    </DataTableServerSide>
  </div>
</template>

<route lang="yaml">
name: "sketches-pending-approval"
meta:
authRequired: true
</route>

