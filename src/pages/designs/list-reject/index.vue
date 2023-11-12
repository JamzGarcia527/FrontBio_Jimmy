<script setup>
import Filter from '@/pages/designs/list-reject/components/Filter.vue'
import { useI18n } from "vue-i18n"
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
const endPoint = '/v1/card-designs/list-reject' // Endpoint to get the data
const isVisible = ref(false)
const loadingExportButton = ref(false)
const disabledExport = ref(false)

const fields = ref([
  { key: "corporation", label: t('design_list_reject.table.corporation').toUpperCase() },
  { key: "circunscription", label: t('design_list_reject.table.circunscription').toUpperCase() },
  { key: "department", label: t('design_list_reject.table.department').toUpperCase() },
  { key: "municipality", label: t('design_list_reject.table.municipality').toUpperCase() },
  { key: "commune", label: t('design_list_reject.table.commune').toUpperCase() },
  { key: "archiveType", label: t('design_list_reject.table.fileType').toUpperCase() },
  { key: "version", label: t('design_list_reject.table.version').toUpperCase(), thClass: 'text-center' },
  { key: "archiveName", label: t('design_list_reject.table.archive').toUpperCase() },
  { key: "statusName", label: t('design_list_reject.table.state').toUpperCase(), thClass: 'text-center' },
  { key: "observation", label: t('design_list_reject.table.observation').toUpperCase(), thClass: 'text-center' },
  { key: "responseAt", label: t('design_list_reject.table.date').toUpperCase(), thClass: 'text-center' },
])

// Functions and methods
const handlerSearchFilter = value => {
  filtersControls.loading = true
  filtersControls.disabled = true

  const queryParams = {
    department: value.department,
    corporationId: value.corporationId,
    municipality: value.municipality,
    circunscriptionId: value.circunscriptionId,
    commune: value.commune,
    state: 2,
    type: value.fileType,
  }

  filters.value = queryParams
  isVisible.value = value.valid
  filtersControls.loading = false
  filtersControls.disabled = false
}

const handlerClearForm = value => {
  isVisible.value = value.hiddeTable
}

const exportFile = async value => {
  const queryParams = { ...filters.value, format: value }

  try {
    loadingExportButton.value = true
    disabledExport.value = true

    const { data } = await axios.get(`/v1/card-designs/report-export-reject`, { params: queryParams, responseType: 'blob' })

    const fileType = value === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8'
    const fileName = value === 'XLS' ? `Listado de diseños devuletos.xlsx` : `Listado de diseños devuletos.csv`
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

const downloadDesignReject = async (value, nameFile) => {
  try {
    const { data } = await axios.get(`/v1/card-designs/view?id=${value}`, { responseType: 'blob' })

    downloadBlob(data, nameFile, 'application/pdf')
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
    throw new Error(e)
  }
}

const downloadSupportDoc = async (value, nameFile) => {
  try {
    const { data } = await axios.get(`/v1/card-designs/view-reject?id=${value}`, { responseType: 'blob' })

    downloadBlob(data, nameFile, 'application/pdf')
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
    throw new Error(e)
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('design_list_reject.breadcrumbs.title'), t('design_list_reject.breadcrumbs.page')]" />
    <Filter 
      :loading="filtersControls.loading"
      :disabled="filtersControls.disabled"
      class="mb-4"
      @search="handlerSearchFilter"
      @clear-form="handlerClearForm"
    />
    <VCard v-if="isVisible">
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
        <template #cell(version)="{item}">
          <div class="d-flex justify-center">
            {{ item.version }}
          </div>
        </template>
        <template #cell(responseAt)="{item}">
          <div class="d-flex justify-center">
            {{ item.responseAt }}
          </div>
        </template>
        <template #cell(statusName)="{item}">
          <div class="d-flex justify-center">
            {{ item.statusName }}
          </div>
        </template>
        <template #cell(archiveName)="{ item }">
          <VBtn variant="plain" @click="() => downloadDesignReject(item.id, item.archiveName)">
            <VIcon icon="tabler-download" class="me-2" />
            {{ item.archiveName }}
          </VBtn>
        </template>
        <template #cell(observation)="{item}">
          <div class="text-center">
            <div class="text-wrap" style="width: 400px;">
              {{ item.observation }}
            </div>
            <div>
              <VBtn v-if="item.hashSupport" variant="plain" color="error" @click="() => downloadSupportDoc(item.id, item.supportName)">
                <VIcon icon="tabler-download" class="me-2" />
                {{ item.supportName }}
              </VBtn>
            </div>
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "designs-list-reject"
meta:
  authRequired: true
</route>

