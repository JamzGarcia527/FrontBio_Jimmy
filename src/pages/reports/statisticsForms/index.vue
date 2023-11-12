<script setup>
import Filter from '@/components/reports/statisticsForms/Filter.vue'
import DataTableStatisticsForms from "@/components/reports/statisticsForms/DataTableStatisticsForms.vue"
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'

const filtersControl = reactive({ loading: false, disabled: false })
const filters = ref({})
const endpoint = '/grouping-political/report/generate/grouping-political'
const { t } = useI18n()
const loadingExportButton = ref(false)
const disabledExport = ref(false)
const firstLoad = ref(false)

const fields = ref([
  { key: 'typeGroupingPolitical', label: 'Tipo de agrupación política'.toUpperCase(), thClass: 'text-wrap' },
  { key: 'nameGroupingPolitical', label: 'Nombre de agrupación política'.toUpperCase(), thClass: 'text-wrap' },
  { key: 'amountE6', label: 'Cantidad de formularios E6'.toUpperCase(), thClass: 'text-wrap text-center' },
  { key: 'amountPreferentialVote', label: 'Cantidad preferente'.toUpperCase(), thClass: 'text-wrap text-center' },
  { key: 'amountNoPreferentialVote', label: 'Cantidad no preferente'.toUpperCase(), thClass: 'text-wrap text-center' },
  { key: 'amountPreliminary', label: 'Cantidad preliminar'.toUpperCase(), thClass: 'text-wrap text-center' },
  { key: 'amountDefinitive', label: 'Cantidad definitivos'.toUpperCase(), thClass: 'text-wrap text-center' },
  { key: 'amountApprove', label: 'Cantidad aprobados'.toUpperCase(), thClass: 'text-wrap text-center' },
  { key: 'amountE8', label: 'Cantidad generados E8'.toUpperCase(), thClass: 'text-wrap text-center' },
])

const handlerFilter = value => {
  filters.value = value
  firstLoad.value = true
}

const exportFile = async value => {
  const queryParams = { ...filters.value, format: value }

  try {
    loadingExportButton.value = true
    disabledExport.value = true

    const { data } = await axios.get(`/grouping-political/report/generate/grouping-political/export`, { params: queryParams, responseType: 'blob' })

    const fileType = value === 1 ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8'
    const fileName = value === 1 ? `Reporte de Estadísticas de Formularios generados por Agrupación Política.xlsx` : `Reporte de Estadísticas de Formularios generados por Agrupación Política.csv`
    const file = new Blob([data], { type: fileType })

    downloadBlob(file, fileName, fileType)
    
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: t('common.not_operation') || message,
      })
    }
  } finally {
    loadingExportButton.value = false
    disabledExport.value = false
  }
}
</script>

<template>
  <div class="layout-default">
    <Filter
      class="mb-2"
      :loading="filtersControl.loading"
      :disabled="filtersControl.disabled"
      @next="handlerFilter"
    />
    <template v-if="firstLoad">
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
              @click="exportFile(1)"
            />
            <VListItem
              :title="t('formsPendingApproval.breadcrumbs.bntCSV')"
              @click="exportFile(2)"
            />
          </VList>
        </VMenu>
      </div>
      <DataTableStatisticsForms 
        ref="datatable" 
        table-class="table-bordered" 
        :fields="fields" 
        :endpoint="endpoint" 
        :params="filters"
        show-footer
        :footers="footers"
      >
        <template #v-thead>
          <tr>
            <th class="text-center" colspan="3" />
            <th class="text-center border" colspan="2">
              SECCIÓN LISTA
            </th>
            <th class="text-center" colspan="4">
              SECCIÓN ESTADO
            </th>
          </tr>
        </template>
        <template #cell(amountE6)="{ item }">
          <div class="d-flex justify-center">
            {{ item.amountE6 }}
          </div>
        </template>
        <template #footer(amountE6)="{ item }">
          <div class="d-flex justify-center">
            {{ item.amountE6 }}
          </div>
        </template>
        <template #cell(amountPreferentialVote)="{ item }">
          <div class="d-flex justify-center">
            {{ item.amountPreferentialVote }}
          </div>
        </template>
        <template #cell(amountNoPreferentialVote)="{ item }">
          <div class="d-flex justify-center">
            {{ item.amountNoPreferentialVote }}
          </div>
        </template>
        <template #cell(amountPreliminary)="{ item }">
          <div class="d-flex justify-center">
            {{ item.amountPreliminary }}
          </div>
        </template>
        <template #cell(amountDefinitive)="{ item }">
          <div class="d-flex justify-center">
            {{ item.amountDefinitive }}
          </div>
        </template>
        <template #cell(amountApprove)="{ item }">
          <div class="d-flex justify-center">
            {{ item.amountApprove }}
          </div>
        </template>
        <template #cell(amountE8)="{ item }">
          <div class="d-flex justify-center">
            {{ item.amountE8 }}
          </div>
        </template>
      </DataTableStatisticsForms>
    </template>
  </div>
</template>

<route lang="yaml">
name: "reports-statistics-forms"
meta:
  authRequired: true
</route>
