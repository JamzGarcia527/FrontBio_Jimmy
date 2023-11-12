<script setup>
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import DataTable from '@/components/shared/DataTable.vue'
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'
import Swal from '@/plugins/sweetalert2'

const { t } = useI18n()
const showItems = ref(false)
const reportOption = ref('')
const isLoading = ref(false)
const isDownloading = ref(false)
const itemsData = ref([])
const showItemsRadio  = ref(false)

//DataTable
const datatable = ref(null)

const fieldsSummary = ref([
  { key: "name", label: t('module_reports.summary_E6_admitted.name') }, 
  { key: "total", label: t('module_reports.summary_E6_admitted.total'), thClass: 'text-center' }, 
  { key: 'notSent', label: t('module_reports.summary_E6_admitted.notSent'), thClass: 'text-center' }, 
  { key: 'sent', label: t('module_reports.summary_E6_admitted.sent'), thClass: 'text-center' }, 
  { key: 'approve', label: t('module_reports.summary_E6_admitted.approve'), thClass: 'text-center' }, 
])

const fieldsdetailed = ref([
  { key: "department", label: t('module_reports.summary_E6_admitted.department') },
  { key: "municipality", label: t('module_reports.summary_E6_admitted.municipality') },
  { key: 'commune', label: t('module_reports.summary_E6_admitted.commune') },
  { key: 'gobInscriptions', label: t('module_reports.summary_E6_admitted.gobInscriptions') },
  { key: 'alcInscriptions', label: t('module_reports.summary_E6_admitted.alcInscriptions') },
  { key: 'conInscriptions', label: t('module_reports.summary_E6_admitted.conInscriptions') },
  { key: 'asaInscriptions', label: t('module_reports.summary_E6_admitted.asaInscriptions') },
  { key: 'jalInscriptions', label: t('module_reports.summary_E6_admitted.jalInscriptions') },  
  { key: 'notSent', label: t('module_reports.summary_E6_admitted.notSent') }, 
  { key: 'sent', label: t('module_reports.summary_E6_admitted.sent') }, 
  { key: 'approve', label: t('module_reports.summary_E6_admitted.approve') }, 
  { key: 'totalInscriptions', label: t('module_reports.summary_E6_admitted.totalInscriptions') },
])



const validateE6 = () =>{ 
 
  if(reportOption.value === 1){
    showItems.value = true
    isLoading.value = true
    reportOption.value = 1
    showItemsRadio.value = true
  } else if(reportOption.value === 2){
    showItems.value = true
    isLoading.value = true
    reportOption.value = 2
    showItemsRadio.value = false
  }
  
}

const showData = async () =>{
  try {

    const { data } = await axios.get(`/v1/corporations/inscriptions/summary/`)

    itemsData.value = data

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || 'No existen datos.',
      })
    }
  }
}


const exportar = async type => {
  isDownloading.value = true

  try {
    isDownloading.value = true

    const report = reportOption.value === 1 ? '/v1/corporations/inscriptions/summary/download?type=' : '/v1/corporations/inscriptions/detail/download?type=' 
    const url = report.concat(type === 'XLS' ? 1 : 2)
 
    const { data } = await axios.get(url, { responseType: 'blob' })

    const fileType = type === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' :'text/csv;charset=utf-8'
    const fileName = type === 'XLS' ? 'Reporte E6 Ingresados.xlsx' : 'Reporte E6 Ingresados.csv'
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
    isDownloading.value = false
  }
}

onMounted(() => {
  showData()
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.summary_E6_admitted.title') ]" />
    <VCard class="mb-4">
      <div class="d-flex justify-center mt-4">
        <VCol cols="12" sm="6" md="4">
          <VRadioGroup
            v-model="reportOption"
            row
            inline
          >
            <template #label>
              <div><strong>Seleccione una Opción</strong></div>
            </template>
            <VRadio
              label="Resumido"
              :value="1"
            />
            <VRadio
              label="Detallado por Departamento"
              :value="2"
            />
          </VRadioGroup>
        </VCol>
      </div>
      <VCardText v-if="!disabled || loading" class="text-center">
        <VBtn :loading="loading" @click="validateE6">
          {{ t('common.search') }}
        </VBtn>
      </VCardText>      
    </VCard>      
    <VCard v-if="showItems">
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
      <div v-if="showItemsRadio">
        <DataTable :items="itemsData" :fields="fieldsSummary" paginate>
          <template #cell(action)="{ item }">
            <div class="text-center">
              {{ item }}
            </div>
          </template>
          <template #cell(total)="{ item }">
            <div class="text-center">
              {{ item.total }}
            </div>
          </template>
          <template #cell(notSent)="{ item }">
            <div class="text-center">
              {{ item.notSent }}
            </div>
          </template>
          <template #cell(sent)="{ item }">
            <div class="text-center">
              {{ item.sent }}
            </div>
          </template>
          <template #cell(approve)="{ item }">
            <div class="text-center">
              {{ item.approve }}
            </div>
          </template>
        </DataTable>
      </div>
      <div v-else>
        <DataTableServerSide
          ref="datatable"
          endpoint="/v1/corporations/inscriptions/detail"
          :fields="fieldsdetailed"
          :loading="isLoading"
        />
      </div>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "summaryE6admitted"
meta:
authRequired: true
</route>
