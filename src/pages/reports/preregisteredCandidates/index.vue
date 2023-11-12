<script setup>
import PreregisteredCandidates from '@/components/reports/preregisteredCandidates/preregisteredCandidatesFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import { downloadBlob } from '@/utils'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useI18n } from "vue-i18n"
import { useTheme } from 'vuetify'
import BarChart from '@/components/shared/chartjs/components/BarChart'
import { getLatestBarChartConfig } from '@/components/shared/chartjs/chartjsConfig'

const { t } = useI18n()


const isDownloading = ref(false)
const filters = ref([])

const dateAsanbleaMen = ref('')
const dateAsanbleaWomen = ref('')
const dateGobernadorMen = ref('')
const dateGobernadorWomen = ref('')
const dateAlcaldeMen = ref('')
const dateAlcaldeWomen = ref('')
const dateConsejoMen = ref('')
const dateConsejoWomen = ref('')
const dateJAlMen = ref('')
const dateJAlWomen = ref('')


const dataGrafiscoAsanblea = ref({})
const dataGrafiscoGobernador= ref({})
const dataGrafiscoAlcalde = ref({})
const dataGrafiscoConsejo = ref({})
const dataGrafiscoJAL = ref({})

    
const fields = ref([
  { key: "nameCorporation", label: t('acceptance_rejection.letters.corporationName').toUpperCase() },
  { key: "candidatesMen", label:'Hombres'.toUpperCase(), thClass: 'text-center' },
  { key: 'candidatesWomen', label: 'Mujeres'.toUpperCase(), thClass: 'text-center' },
  { key: "countTotalCandidates", label: 'Total preinscritos'.toUpperCase(), thClass: 'text-center' }, 
])

const handlerSearchFilter = value => {
  
  filters.value = value
  
  getAgeRange()
}


const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "department": filter.department,
    "municipality": filter.municipality,
    "commune": filter.commune,
    "corporationId": filter.corporationId,
    format: type === 'CSV' ? 2 : 1,
  }

  axios.get(`/v1/inscriptions/report/candidates/corporation/export`, {
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'CSV' ? 'Reporte Candidatos Pre-inscritos por Corporación.csv' : 'Reporte Candidatos Pre-inscritos por Corporación.xlsx'

    downloadBlob(data, nameFile, type === 'CSV' ? 'text/csv;charset=utf-8' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isDownloading.value = false)
}


const vuetifyTheme = useTheme()
const chartOptions = computed(() => getLatestBarChartConfig(vuetifyTheme.current.value))


const getAgeRange  = async () => {

  const filter = filters.value

  dateAsanbleaMen.value = 0
  dateAsanbleaWomen.value = 0
  dateGobernadorMen.value = 0
  dateGobernadorWomen.value = 0
  dateAlcaldeMen.value = 0
  dateAlcaldeWomen.value = 0
  dateConsejoMen.value = 0
  dateConsejoWomen.value = 0
  dateJAlMen.value = 0
  dateJAlWomen.value = 0

  try {
    const { data } = await axios.get(`/v1/inscriptions/report/candidates/corporation`,{ params: filters.value })
    const corporationName = data.content[0].nameCorporation

    if(!filter.corporationId || filter.corporationId === -1){
      dateAsanbleaMen.value = data.content[0].candidatesMen
      dateAsanbleaWomen.value = data.content[0].candidatesWomen
      dateGobernadorMen.value = data.content[1].candidatesMen
      dateGobernadorWomen.value = data.content[1].candidatesWomen
      dateAlcaldeMen.value = data.content[2].candidatesMen
      dateAlcaldeWomen.value = data.content[2].candidatesWomen
      dateConsejoMen.value = data.content[3].candidatesMen
      dateConsejoWomen.value = data.content[3].candidatesWomen
      dateJAlMen.value = data.content[4].candidatesMen
      dateJAlWomen.value = data.content[4].candidatesWomen
    }else if(corporationName === 'ASAMBLEA'){
      dateAsanbleaMen.value = data.content[0].candidatesMen
      dateAsanbleaWomen.value = data.content[0].candidatesWomen
    }else if(corporationName === 'GOBERNADOR'){
      dateGobernadorMen.value = data.content[0].candidatesMen
      dateGobernadorWomen.value = data.content[0].candidatesWomen
    }else if(corporationName === 'ALCALDE'){
      dateAlcaldeMen.value = data.content[0].candidatesMen
      dateAlcaldeWomen.value = data.content[0].candidatesWomen
    }else if(corporationName === 'CONCEJO'){
      dateConsejoMen.value = data.content[0].candidatesMen
      dateConsejoWomen.value = data.content[0].candidatesWomen
    }else if(corporationName === 'JUNTAS ADMINISTRADORAS LOCALES'){
      dateJAlMen.value = data.content[0].candidatesMen
      dateJAlWomen.value = data.content[0].candidatesWomen
    }
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data
    }
  } 
  
  dataGrafiscoAsanblea.value = {
    labels: [
      'HOMBRE',
      'MUJER',
    ],
    datasets: [{
      maxBarThickness: 15,
      backgroundColor:'#003057', 
      borderColor: 'transparent',
      borderRadius: {
        topRight: 15,
        topLeft: 15,
      },
      data: [
        dateAsanbleaMen.value,
        dateAsanbleaWomen.value,
        

      ],
    }],
  }

  dataGrafiscoGobernador.value = {
    labels: [
      'HOMBRE',
      'MUJER',
    ],
    datasets: [{
      maxBarThickness: 15,
      backgroundColor:'#003057', 
      borderColor: 'transparent',
      borderRadius: {
        topRight: 15,
        topLeft: 15,
      },
      data: [
        dateGobernadorMen.value,
        dateGobernadorWomen.value,
      
      ],
    }],
  }

  dataGrafiscoAlcalde.value = {
    labels: [
      'HOMBRE',
      'MUJER',
    ],
    datasets: [{
      maxBarThickness: 15,
      backgroundColor:'#003057', 
      borderColor: 'transparent',
      borderRadius: {
        topRight: 15,
        topLeft: 15,
      },
      data: [
        dateAlcaldeMen.value ,
        dateAlcaldeWomen.value,
      
      
      ],
    }],
  }

  dataGrafiscoConsejo.value = {
    labels: [
      'HOMBRE',
      'MUJER',
    ],
    datasets: [{
      maxBarThickness: 15,
      backgroundColor:'#003057', 
      borderColor: 'transparent',
      borderRadius: {
        topRight: 15,
        topLeft: 15,
      },
      data: [
        dateConsejoMen.value ,
        dateConsejoWomen.value,
      
      
      ],
    }],
  }

  dataGrafiscoJAL.value = {
    labels: [
      'HOMBRE',
      'MUJER',
    ],
    datasets: [{
      maxBarThickness: 15,
      backgroundColor:'#003057', 
      borderColor: 'transparent',
      borderRadius: {
        topRight: 15,
        topLeft: 15,
      },
      data: [
        dateJAlMen.value ,
        dateJAlWomen.value,
      
      ],
    }],
  }
}

onMounted(async () => {
  await getAgeRange()
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('preregistered_candidates.title') ]" /> 
    <PreregisteredCandidates class="mb-4" @search="handlerSearchFilter" />
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
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/inscriptions/report/candidates/corporation"
        :params="filters"
        :fields="fields"
      >
        <template #cell(candidatesMen)="{ item }">
          <div class="d-flex justify-center">
            {{ item.candidatesMen }}
          </div>
        </template>
        <template #cell(candidatesWomen)="{ item }">
          <div class="d-flex justify-center">
            {{ item.candidatesWomen }}
          </div>
        </template>
        <template #cell(countTotalCandidates)="{ item }">
          <div class="d-flex justify-center">
            {{ item.countTotalCandidates }}
          </div>
        </template>
      </DataTableServerSide>
      <VRow>
        <VCol v-if="filters.corporationId === -1 || filters.corporationId === 2" cols="12" :md="filters.corporationId === 2 ? 12 : 6">
          <VListItemTitle class="demo-space-x me-4 ps-5 mt-3 mb-2">
            ASAMBLEA:
          </VListItemTitle>
          <BarChart
            :height="210"
            :chart-data="dataGrafiscoAsanblea"
            :chart-options="chartOptions"
          />
        </VCol>
        <VCol v-if="filters.corporationId === -1 || filters.corporationId === 1" cols="12" :md="filters.corporationId === 1 ? 12 : 6">
          <VListItemTitle class="demo-space-x me-4 ps-5 mt-3 mb-2">
            GOBERNADOR:
          </VListItemTitle>
          <BarChart
            :height="210"
            :chart-data="dataGrafiscoGobernador"
            :chart-options="chartOptions"
          />
        </VCol>
        <VCol v-if="filters.corporationId === -1 || filters.corporationId === 3" cols="12" :md="filters.corporationId === 3 ? 12 : 6">
          <VListItemTitle class="demo-space-x me-4 ps-5 mt-3 mb-2">
            ALCALDE:
          </VListItemTitle>
          <BarChart
            :height="210"
            :chart-data="dataGrafiscoAlcalde"
            :chart-options="chartOptions"
          />
        </VCol>
        <VCol v-if="filters.corporationId === -1 || filters.corporationId === 4" cols="12" :md="filters.corporationId === 4 ? 12 : 6">
          <VListItemTitle class="demo-space-x me-4 ps-5 mt-3 mb-2">
            CONCEJO:
          </VListItemTitle>
          <BarChart
            :height="210"
            :chart-data="dataGrafiscoConsejo"
            :chart-options="chartOptions"
          />
        </VCol>
        <VCol v-if="filters.corporationId === -1 || filters.corporationId === 5" cols="12" :md="filters.corporationId === 5 ? 12 : 6">
          <VListItemTitle class="demo-space-x me-4 ps-5 mt-3 mb-2">
            JUNTAS ADMINISTRADORAS LOCALES:
          </VListItemTitle>
          <BarChart
            :height="210"
            :chart-data="dataGrafiscoJAL"
            :chart-options="chartOptions"
          />
        </VCol>
      </VRow>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "preregistered_candidates"
meta:
authRequired: true
</route>
