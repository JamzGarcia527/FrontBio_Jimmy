<script setup>
import Filter from '@/pages/sketches/cards-printing/components/Filter.vue'
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
const isLoadingVisible = ref(false)

const fields = ref([
  { key: "item", label: t('cards_printing.table.item').toUpperCase(), thClass: 'text-center' },
  { key: "corporationName", label: t('cards_printing.table.corporation').toUpperCase() },
  { key: "circunscriptionsName", label: t('cards_printing.table.circunscription').toUpperCase() },
  { key: "location", label: t('cards_printing.table.location').toUpperCase() },
  { key: "statusName", label: t('cards_printing.table.state').toUpperCase(), thClass: 'text-center' },
  { key: "approvedDate", label: t('cards_printing.table.approvedDate').toUpperCase(), thClass: 'text-center' },
  { key: "version", label: t('cards_printing.table.version').toUpperCase(), thClass: 'text-center' },
])

// Functions and methods
const handlerSearchFilter = value => {
  try {

    filtersControls.loading = true
    filtersControls.disabled = true

    const queryParams = {
      corporationId: value.corporationId,
      circunscriptionId: value.circunscriptionId,
      department: value.department,
      municipality: value.municipality,
      commune: value.commune,
      state: value.statusFilter,
      type: value.fileType,
    }

    filters.value = queryParams
  } finally {
    filtersControls.loading = false
    filtersControls.disabled = false
  }
}

const exportFile = async (value, typeAction) => {

  const { department, municipality, circunscriptionId, corporationId, state, type } = filters.value

  const queryParams = { department, municipality, circunscriptionId, corporationId, state, type, format: value }
  let fileData
  try {
    isLoadingVisible.value = true

    if (typeAction) {
      const { data } = await axios.get(`/v1/card-designs/report/card-designs-modif`, { params: { format: queryParams.format }, responseType: 'blob' })

      fileData = data 
    } else {
      const { data } = await axios.get(`/v1/card-designs/report/card-designs`, { params: queryParams, responseType: 'blob' })
  
      fileData = data 
    }

    const fileType = value === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8'

    const fileName = value === 'XLS' && typeAction == null ? `Consulta aprobación tarjetas para impresión.xls`
      : typeAction ? 'Tarjetas afectadas por modificación.xls'
        : 'Consulta aprobación tarjetas para impresión.csv'
 
    const file = new Blob([fileData], { type: fileType })

    downloadBlob(file, fileName, fileType)
    
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || t('common.not_operation'),
      })
    }
  } finally {
    isLoadingVisible.value = false
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('cards_printing.breadcrumbs.title'), t('cards_printing.breadcrumbs.page')]" />
    <Filter 
      :loading="filtersControls.loading"
      :disabled="filtersControls.disabled"
      class="mb-4"
      @search="handlerSearchFilter"
    />
    <div class="d-flex justify-end gap-2 me-3 mt-3 mb-2">
      <VMenu open-on-hover>
        <template #activator="{ props }">
          <VBtn v-bind="props">
            {{ t('cards_printing.btnExportTitle') }}
          </VBtn>
        </template>

        <VList>
          <VListItem
            :title="t('cards_printing.bntExcel')"
            @click="exportFile('XLS')"
          />
        </VList>
      </VMenu>

      <VBtn variant="flat" @click="exportFile('XLS', 'exportModify')">
        {{ t('cards_printing.btn_exportModify') }}
      </VBtn>
    </div>
    <DataTableServerSide ref="datatable" show-empty-message :fields="fields" :params="filters" :endpoint="endPoint">
      <template #cell(item)="{item}">
        <div class="d-flex justify-center">
          {{ item.item }}
        </div>
      </template>
      <template #cell(location)="{item}">
        <p class="font-weight-regular mb-0">
          {{ item.departmentName }} <VIcon v-if="item.municipalityName" start icon="tabler-arrow-right" />{{ item.municipalityName }} <br>
          <small v-if="item.communeName" class="text-muted line-height">
            {{ item.communeName }}
          </small>
        </p>
      </template>
      <template #cell(statusName)="{item}">
        <div class="d-flex justify-center">
          {{ item.statusName }}
        </div>
      </template>
      <template #cell(version)="{item}">
        <div class="d-flex justify-center">
          {{ item.version }}
        </div>
      </template>
    </DataTableServerSide>
    <VDialog v-model="isLoadingVisible" width="300" persistent>
      <VCard color="primary" width="300">
        <VCardText class="pt-3">
          Por favor, espere
          <VProgressLinear indeterminate class="mb-0" />
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.text-muted {
  color: #878a99 !important;
}
</style>

<route lang="yaml">
name: "sketches-cards-printing"
meta:
authRequired: true
</route>

