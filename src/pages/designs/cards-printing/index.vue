<script setup>
import Filter from '@/pages/designs/cards-printing/components/Filter.vue'
import { useI18n } from "vue-i18n"
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { _buildDownloadCSV } from "@/utils/functions"
import { downloadBlob } from '@/utils'
import { useAppAbility } from '@/plugins/casl/useAppAbility'

// Defining and initializing variables
const { t } = useI18n()
const { can } = useAppAbility()
const filtersControls = reactive({ loading: false, disabled: false })
const filters = ref({})
const datatable = ref(null)
const endPoint = '/v1/card-designs/list' // Endpoint to get the data
const loadingExportButton = ref(false)
const disabledExport = ref(false)
const loadingExportButtonM = ref(false)
const disabledExportM = ref(false)

const fields = ref([
  { key: "item", label: t('cards_printing.table.item').toUpperCase(), thClass: 'text-center' },
  { key: "fileType", label: t('cards_printing.table.type').toUpperCase(), thClass: 'text-center' },
  { key: "corporationName", label: t('cards_printing.table.corporation').toUpperCase() },
  { key: "circunscriptionsName", label: t('cards_printing.table.circunscription').toUpperCase() },
  { key: "departmentName", label: t('cards_printing.table.department').toUpperCase() },
  { key: "municipalityName", label: t('cards_printing.table.municipality').toUpperCase() },
  { key: "communeName", label: t('cards_printing.table.commune').toUpperCase() },
  { key: "statusName", label: t('cards_printing.table.state').toUpperCase(), thClass: 'text-center' },
  { key: "approvedDate", label: t('cards_printing.table.approvedDate').toUpperCase(), thClass: 'text-center' },
  { key: "version", label: t('cards_printing.table.version').toUpperCase(), thClass: 'text-center' },
  { key: "action", label: ' ', thClass: 'text-center' },
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

const sendPrint = item => {
  Swal.fire({
    html: `Enviar a impresión diseño: 
      <br><Strong>${item.fileName}</Strong>
      <br><Strong>Versión ${item.version}</Strong>`,
    icon: "question",
    input: "textarea",
    inputPlaceholder: "Observación",
    showCancelButton: true,
    customClass: { 
      confirmButton: "bg-primary notAllowedEmulator",
      cancelButton: "bg-danger",
    },
    showLoaderOnConfirm: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Enviar",
    preConfirm: async observation => {
      if (String(observation).trim().length == 0) {
        Swal.showValidationMessage("La observación es obligatoria")
        
        return false
      }

      try {
        await axios.put("/v1/card-designs/sent", { 
          sentObservations: observation, 
          cardDesignId: item.cardDesignsId,
        })

        datatable.value.refresh()
        Swal.fire({ text: 'Diseño enviado a impresión.', icon: 'success' })
        
        return true
      } catch (error) {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
      
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

const reverse = item => {
  Swal.fire({
    html: `Reversar aprobaciones para el diseño: 
      <br><Strong>${item.fileName}</Strong>
      <br><Strong>Versión ${item.version}</Strong>`,
    icon: "question",
    input: "textarea",
    inputPlaceholder: "Observación",
    showCancelButton: true,
    customClass: { 
      confirmButton: "bg-error notAllowedEmulator",
      cancelButton: "bg-danger",
    },
    showLoaderOnConfirm: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Reversar",
    preConfirm: async observation => {
      if (String(observation).trim().length == 0) {
        Swal.showValidationMessage("La observación es obligatoria")
        
        return false
      }

      try {
        await axios.put("/v1/card-designs/reverse", { 
          observations: observation, 
          cardDesignId: item.cardDesignsId,
        })

        datatable.value.refresh()
        Swal.fire({ text: 'Diseño reversado con éxito.', icon: 'success' })
        
        return true
      } catch (error) {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
      
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

const exportFile = async (value, typeAction) => {

  const { department, municipality, circunscriptionId, corporationId, state, type } = filters.value

  const queryParams = { department, municipality, circunscriptionId, corporationId, state, type, format: value }
  let fileData
  try {
    
    if (typeAction) {
      loadingExportButtonM.value = true
      disabledExportM.value = true

      const { data } = await axios.get(`/v1/card-designs/report/card-designs-modif`, { params: { format: queryParams.format }, responseType: 'blob' })
      

      fileData = data 
    } else {
      loadingExportButton.value = true
      disabledExport.value = true

      const { data } = await axios.get(`/v1/card-designs/report/card-designs`, { params: queryParams, responseType: 'blob' })
  
      fileData = data 
    }

    const fileType = value === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8'

    const fileName = value === 'XLS' && typeAction == null ? `Consulta aprobación tarjetas para impresión.xlsx`
      : typeAction ? 'Tarjetas afectadas por modificación.xlsx'
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
    loadingExportButton.value = false
    disabledExport.value = false
    loadingExportButtonM.value = false
    disabledExportM.value = false

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
    <VCard>
      <div class="d-flex justify-end gap-2 me-3 mt-3 mb-2">
        <VMenu open-on-hover>
          <template #activator="{ props }">
            <VBtn v-bind="props" :loading="loadingExportButton" :disabled="disabledExport" prepend-icon="tabler-table-export">
              {{ t('cards_printing.btnExportTitle') }}
            </VBtn>
          </template>

          <VList>
            <VListItem
              :title="t('cards_printing.bntExcel')"
              @click="exportFile('XLS')"
            />
            <VListItem
              :title="t('cards_printing.bntCSV')"
              @click="exportFile('CSV')"
            />
          </VList>
        </VMenu>

        <VBtn variant="flat" prepend-icon="tabler-table-export" :loading="loadingExportButtonM" :disabled="disabledExportM" @click="exportFile('CSV', 'exportModify')">
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
        <template #cell(approvedDate)="{item}">
          <div class="d-flex justify-center">
            {{ item.approvedDate }}
          </div>
        </template>
        <template #cell(action)="{item}">
          <VRow>
            <VCol cols="6" class="py-0">
              <template v-if="can('sent', 'card-designs') && item.statusId == 1">
                <VTooltip text="Enviar a Impresión">
                  <template #activator="{ props: tooltipProps}">
                    <VBtn
                      v-bind="tooltipProps"
                      icon="tabler-file-like" 
                      variant="plain" 
                      @click.prevent="sendPrint(item)"
                    />      
                  </template>
                </VTooltip>
              </template>
            </VCol>
            <VCol cols="6" class="py-0">
              <template v-if="can('reverse', 'card-designs') && item.statusId != 0">
                <VTooltip text="Reversar Aprobaciones">
                  <template #activator="{ props: tooltipProps}">
                    <VBtn
                      v-bind="tooltipProps"
                      icon="tabler-file-dislike" 
                      color="error"
                      variant="plain"
                      @click.prevent="reverse(item)"
                    />     
                  </template>
                </VTooltip>
              </template>
            </VCol>
          </VRow>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<style scoped>
.text-muted {
  color: #878a99 !important;
}
</style>

<route lang="yaml">
name: "designs-cards-printing"
meta:
authRequired: true
</route>

