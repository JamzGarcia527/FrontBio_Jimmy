<script setup>
import ListCardGuideElectoralFilters from '@/components/reports/listCardGuideElectoralReport/listCardGuideElectoralFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import { _buildDownloadCSV } from "@/utils/functions"
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'
import Swal from "@/plugins/sweetalert2"
import { useAppAbility } from '@/plugins/casl/useAppAbility'

const { t } = useI18n()
const filters = ref([])
const isLoadingVisible = ref(false)
const showModal = ref(false)
const zoom = ref('150%')
const { can } = useAppAbility()
const pdfUrl = ref()


const fields = ref([
  { key: "corporation", label: t('guide_electoral.Data.corporationName').toUpperCase() },
  { key: "circunscription", label: t('guide_electoral.Data.circunscriptionName').toUpperCase() },
  { key: 'department', label: t('guide_electoral.Data.department').toUpperCase() },
  { key: "municipality", label: t('guide_electoral.Data.municipality').toUpperCase() },
  { key: "commune", label: t('guide_electoral.Data.commune').toUpperCase() },
  { key: "filename", label: t('guide_electoral.Data.detailDesing').toUpperCase() },
  { key: "designType", label: t('guide_electoral.Data.typeDesing').toUpperCase() },
])

const handlerSearchFilter = value => {
  filters.value = value
}

// Reports CSV, EXCEL y PDF 

const exportFile = async value => {
  isLoadingVisible.value = true

  const { department, municipality, commune, corporationId } = filters.value

  const queryParams = { department, municipality, commune, corporationId, format: value }

  try {
    isLoadingVisible.value = true

    const { data } = await axios.get(`/v1/card-designs/report-export?`, { params: queryParams, responseType: 'blob' })

    if(value === "PDF"){
      
      const fileType = value === 'PDF' ? 'application/pdf' : ''
      const fileName = value === 'PDF' ? `Listado de Anotaciones de Tarjetas y Guías Electorales.pdf` : ``
      const file = new Blob([data], { type: fileType })

      downloadBlob(file, fileName, fileType)
    }
    else if(value === "XLS" || value === "CSV"){

      const fileType = value === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8'
      const fileName = value === 'XLS' ? `Listado de Anotaciones de Tarjetas y Guías Electorales.xls` : `Listado de Anotaciones de Tarjetas y Guías Electorales.csv`
      const file = new Blob([data], { type: fileType })

      downloadBlob(file, fileName, fileType)
    
    }

    
    
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: t('sketches_pending.not_operation') || message,
      })
    }
  } finally {
    isLoadingVisible.value = false
  }
}

const showFile = async id => {
  try {
    // get route PDF
    const response = await axios.get (`/v1/card-designs/view?id=${id}`, { responseType: 'blob' })

    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)

    showModal.value = true

  } catch (error) {
    if(error){
      await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
    }
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('guide_electoral.title') ]" /> 
    <ListCardGuideElectoralFilters class="mb-4" @search="handlerSearchFilter" />
    <VCard>
      <div style="margin-left: 90%;" class="me-3 mt-3 mb-2">
        <VMenu open-on-hover>
          <template #activator="{ props }">
            <VBtn v-bind="props">
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
            <VListItem
              :title="t('formsPendingApproval.breadcrumbs.bntPDF')"
              @click="exportFile('PDF')"
            />
          </VList>
        </VMenu>
      </div>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/card-designs/report"
        :params="filters"
        :fields="fields"
      >
        <template #cell(designType)="{ item }">
          <div class="d-flex justify-center">
            <VBtn
              class="text-center"
              icon="tabler-eye"
              variant="text"
              color="secondary"
              @click="showFile(item.id)"
            />            
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
    <VDialog v-model="showModal" width="1050">
      <!-- Dialog close btn -->      
      <DialogCloseBtn @click="showModal = !showModal" />      
      <!-- Dialog Content -->      
      <VCard>
        <VCardText>          
          <embed :src="pdfUrl" type="application/pdf" width="100%" height="500" :zoom="zoom">        
        </VCardText>        
        <VCardText class="d-flex justify-end">
          <VBtn @click="showModal = false">
            Cerrar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "list-card-guide-electoral"
meta:
authRequired: true
</route>