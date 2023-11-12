<script setup>
import DetailPhotosUploadedCandidatesFilter from "@/components/reports/detailPhotosUploadedCandidatesReport/detailPhotosUploadedCandidatesFilter.vue"
import DataTable from '@/components/shared/DataTable.vue'
import useEventsBus from '@/utils/eventBus'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"

const { t } = useI18n()
const filters = ref({})
const showItems = ref(false)
const isLoading = ref(false)
const error = ref(null)
const isDownloading = ref(false)
const itemsData = ref([])

const handlerSearchFilter = async selected => {
  const { 
    groupingPoliticalTypeId: typeGroupId,
    groupingPoliticalId: nameGroupId,
    corporationId: corporationId,
    circunscriptionId: circunscriptionId,
    department: departmentId,
    municipality: municipalityId,
    commune: communeId,
  } = selected

  filters.value = {
    typeGroupId,
    nameGroupId,
    corporationId,
    circunscriptionId,
    departmentId,
    municipalityId,
    communeId,
  }  

  
  showItems.value = true
  
  // isLoading.value = true
  // showData()

}

const fields = ref([
  { key: "typeGroup", label: t('module_reports.detailPhotosUploadedCandidates.typeGroup') },
  { key: "nameGroup", label: t('module_reports.detailPhotosUploadedCandidates.nameGroup') },
  { key: 'department', label: t('module_reports.detailPhotosUploadedCandidates.department') },
  { key: 'municipality', label: t('module_reports.detailPhotosUploadedCandidates.municipality') },
  { key: 'commune', label: t('module_reports.detailPhotosUploadedCandidates.commune') },
  { key: 'nameCorporation', label: t('module_reports.detailPhotosUploadedCandidates.nameCorporation') },
  { key: 'nameCircuscription', label: t('module_reports.detailPhotosUploadedCandidates.nameCircuscription') },
  { key: 'rowField', label: t('module_reports.detailPhotosUploadedCandidates.rowField') },
  { key: 'dni', label: t('module_reports.detailPhotosUploadedCandidates.dni') },
  { key: 'firstName', label: t('module_reports.detailPhotosUploadedCandidates.firstName') },
  { key: 'secondName', label: t('module_reports.detailPhotosUploadedCandidates.secondName') },
  { key: 'firstSurName', label: t('module_reports.detailPhotosUploadedCandidates.firstSurName') },
  { key: 'secondSurName', label: t('module_reports.detailPhotosUploadedCandidates.secondSurName') },
  { key: 'photo', label: t('module_reports.detailPhotosUploadedCandidates.photo') },  
])

const showData = async () =>{
  try {
    
    const { corporationId, circunscriptionId, departmentId, municipalityId, communeId, typeGroupId, nameGroupId } = filters.value
    const queryParams = { corporationId, circunscriptionId, departmentId, municipalityId, communeId, typeGroupId, nameGroupId, page: 0, size: 1000000 }
    const { data } = await axios.get('/v1/candidates/report/photo/candidate',{ params: queryParams })

    itemsData.value = data
    showItems.value = true
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || 'No existen datos.',
      })
    }
  } finally {
    isLoading.value = false
  }
}

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "corporationId": filter.corporationId,
    "circunscriptionId": filter.circunscriptionId,
    "departmentId": filter.departmentId,
    "municipalityId": filter.municipalityId,
    "communeId": filter.communeId,
    "typeGroupId": filter.typeGroupId,
    "nameGroupId": filter.nameGroupId,
    "type": type === 'XLS' ? 1 : 2,
    page: 0,
    size: 1000000,
  }

  axios.get(`/v1/candidates/report/photo/candidate/export`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte de Fotos Cargadas de Candidatos detallado.xlsx' : 'Reporte de Fotos Cargadas de Candidatos detallado.csv' 
    
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.detailPhotosUploadedCandidates.title') ]" />
    <DetailPhotosUploadedCandidatesFilter class="mb-4" :loading="isLoading" @search="handlerSearchFilter" />
    <VCard v-if="showItems">
      <div class="text-right pa-3">
        <VMenu open-on-hover>
          <template #activator="{ props }">
            <VBtn v-bind="props" prepend-icon="tabler-table-export" :loading="isDownloading">
              {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
            </VBtn>
          </template>
          <VList>
            <VListItem
              v-if="false"
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
        endpoint="/v1/candidates/report/photo/candidate"
        :params="filters"
        :fields="fields"
      />
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "detail-photos-uploaded-candidates"
meta:
authRequired: true
</route>
