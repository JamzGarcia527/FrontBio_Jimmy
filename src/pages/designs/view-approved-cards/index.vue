<script setup>
import Filter from '@/pages/designs/view-approved-cards/components/Filter.vue'
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
const endPoint = '/v1/card-designs/list' // Endpoint to get the data
const isVisible = ref(false)
const pdfUrl = ref('')
const pdfFileName = ref('')
const isDialogVisible = ref(false)
const zoom = ref('200%')
const loadingExportButton = ref(false)
const disabledExport = ref(false)

const fields = ref([
  { key: "corporationName", label: t('list_designs_approval.table.corporation').toUpperCase() },
  { key: "circunscriptionsName", label: t('list_designs_approval.table.circunscription').toUpperCase() },
  { key: "departmentName", label: t('list_designs_approval.table.department').toUpperCase() },
  { key: "municipalityName", label: t('list_designs_approval.table.municipality').toUpperCase() },
  { key: "communeName", label: t('list_designs_approval.table.commune').toUpperCase() },
  { key: "fileType", label: t('list_designs_approval.table.fileType').toUpperCase() },
  { key: "version", label: t('list_designs_approval.table.version').toUpperCase(), thClass: 'text-center' },
  { key: "fileName", label: t('list_designs_approval.table.archive').toUpperCase() },
  { key: "statusName", label: t('list_designs_approval.table.state').toUpperCase(), thClass: 'text-center' },
  { key: "observation", label: t('list_designs_approval.table.observation').toUpperCase(), thClass: 'text-center' },
  { key: "approvedDate", label: t('list_designs_approval.table.date').toUpperCase(), thClass: 'text-center' },
  { key: "actions", label: t('list_designs_approval.table.actions').toUpperCase(), thClass: 'text-center' },
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
    state: 1,
    type: value.fileType,
  }

  filters.value = queryParams
  isVisible.value = value.valid
  filtersControls.loading = false
  filtersControls.disabled = false
}

const previewApprovalCard = async (value, name) => {
  // Preview sketch
  let file
  try {
    const response = await axios.get(`/v1/card-designs/view?id=${value}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)
    pdfFileName.value = name
    isDialogVisible.value = true
    
    // const a = document.createElement('a')
    // a.href = pdfUrl.value
    // a.download = `${value}.pdf`
    // a.click()
  } catch (error) {
    await Swal.fire({
      icon: 'warning',
      text: 'El recurso solicitado no existe',
    })
  } finally {
    if (file) {
      URL.revokeObjectURL(file)
      pdfUrl.value = null
    }
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

const downloadDesign = () => {
  const a = document.createElement('a')

  a.href = pdfUrl.value
  a.download = pdfFileName.value
  a.click()

  a.remove()
}

const exportFile = async value => {
  const queryParams = { ...filters.value, format: value }

  try {
    loadingExportButton.value = true
    disabledExport.value = true

    const { data } = await axios.get(`/v1/card-designs/list-export`, { params: queryParams, responseType: 'blob' })

    const fileType = value === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8'
    const fileName = value === 'XLS' ? `Tarjetas y guías Electorales aprobadas.xlsx` : `Tarjetas y guías Electorales aprobadas.csv`
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

const handlerClearForm = value => {
  isVisible.value = value.hiddeTable
}
</script>

<template>
  <div>
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
      <DataTableServerSide  
        ref="datatable" 
        show-empty-message 
        :fields="fields" 
        :params="filters" 
        :endpoint="endPoint"
      >
        <template #cell(version)="{item}">
          <div class="d-flex justify-center">
            {{ item.version }}
          </div>
        </template>
        <template #cell(observation)="{item}">
          <div class="text-center">
            <div class="text-wrap" style="width: 400px;">
              {{ item.observation }}
            </div>
            <div>
              <VBtn v-if="item.docSupportName" variant="plain" color="success" @click="() => downloadSupportDoc(item.cardDesignsId, item.docSupportName)">
                <VIcon icon="tabler-download" class="me-2" />
                {{ item.docSupportName }}
              </VBtn>
            </div>
          </div>
        </template>
        <template #cell(actions)="{item}">
          <div class="d-flex justify-center">
            <VBtn size="38" variant="secondary" @click="previewApprovalCard(item.cardDesignsId, item.fileName)">
              <VIcon
                icon="tabler-eye"
                size="22"
              />
            </VBtn>
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
    <VDialog
      v-model="isDialogVisible"
      width="1050"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

      <!-- Dialog Content -->
      <VCard>
        <VCardText>
          <embed :src="`${pdfUrl}#toolbar=0`" type="application/pdf" width="100%" height="500" :zoom="zoom">
        </VCardText>

        <VCardText class="d-flex justify-space-between">
          <VBtn variant="outlined" prepend-icon="tabler-download" @click="downloadDesign">
            {{ t('common.btn_download') }}
          </VBtn>
          <VBtn @click="isDialogVisible = false">
            {{ t('common.btn_close') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "designs-view-approved-cards"
meta:
  authRequired: true
</route>
