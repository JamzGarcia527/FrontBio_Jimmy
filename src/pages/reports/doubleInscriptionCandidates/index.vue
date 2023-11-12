<script setup>
import DoubleInscriptionCandidatesFilter from "@/components/reports/doubleInscriptionCandidatesReport/doubleInscriptionCandidatesFilter.vue"
import DataTable from '@/components/shared/DataTable.vue'
import axios from "@/plugins/axios"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from "vue-i18n"
import { downloadBlob } from '@/utils'
import Swal from '@/plugins/sweetalert2'

const { t } = useI18n()

const showItems = ref(false) 
const filters = ref({})
const isLoading = ref(false)
const isDownloading = ref(false)
const itemsData = ref([])
const error = ref(null)
const showMessage = ref(false)

const handlerSearchFilter = async selected => {
  const {
    dni: dni,
    inscriptionType: typeInscription,
  } = selected

  filters.value = {
    dni,
    typeInscription,
  }

  showItems.value = true
  isLoading.value = true
  showData()

}

const fields = ref([
  { key: 'dni', label: t('module_reports.doubleInscriptionCandidates.dni') },
  { key: 'names', label: t('module_reports.doubleInscriptionCandidates.names') },
  { key: 'surnames', label: t('module_reports.doubleInscriptionCandidates.surnames') },
  { key: 'status', label: t('module_reports.doubleInscriptionCandidates.status') },
  { key: 'createdAt', label: t('module_reports.doubleInscriptionCandidates.createdAt') },
  { key: 'createdBy', label: t('module_reports.doubleInscriptionCandidates.createdBy') },
  { key: 'updatedAt', label: t('module_reports.doubleInscriptionCandidates.updatedAt') },
  { key: 'updatedBy', label: t('module_reports.doubleInscriptionCandidates.updatedBy') },
  { key: 'groupPoliticalName', label: t('module_reports.doubleInscriptionCandidates.groupPoliticalName') },
  { key: 'corporationsName', label: t('module_reports.doubleInscriptionCandidates.corporationsName') },
  { key: 'circunscriptionsName', label: t('module_reports.doubleInscriptionCandidates.circunscriptionsName') },
  { key: 'place', label: t('module_reports.doubleInscriptionCandidates.place') },
  { key: 'rowField', label: t('module_reports.doubleInscriptionCandidates.rowField') },  
])
 
const showData = async () =>{
  try {
    
    const { dni, typeInscription } = filters.value

    const queryParams = { dni, typeInscription }
    const { data } = await axios.get('/v1/inscriptions/double',{ params: queryParams })

    itemsData.value = data
    showMessage.value = itemsData.value.length > 0 ? true : false

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

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "dni": filter.dni,
    "typeInscription": filter.typeInscription,
    "type": type === 'XLS' ? 1 : 2,
  }

  axios.get(`/v1/inscriptions/double-export`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte Candidatos con Doble inscripción y Presunción Doble militancia.xlsx' : 'Reporte Candidatos con Doble inscripción y Presunción Doble militancia.csv' 
    
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.doubleInscriptionCandidates.title') ]" />
    <DoubleInscriptionCandidatesFilter class="mb-4" @search="handlerSearchFilter" />  
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
      <VRow v-if="showMessage" class="d-flex justify-center">
        <div>
          <VAlert
            color="info"
            icon="tabler-arrow-left-right"
          >
            {{ itemsData[0].message }}
          </VAlert> 
        </div> 
      </VRow>
      <br>
      <DataTable :items="itemsData" :fields="fields" paginate>
        <template #v-thead>
          <tr>
            <th class="text-center border bg-info-light" colspan="8">
              Datos Candidato
            </th>
            <th class="text-center border bg-orange-light" colspan="5">
              Registrado en
            </th>
          </tr>
        </template> 
      </DataTable>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "double-inscription-candidates"
meta:
authRequired: true
</route>
