<script setup>
import CandidatesEnrolledAgeReport from '@/components/reports/candidatesEnrolledAgeReport/candidatesEnrolledAgeFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import { downloadBlob } from '@/utils'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useI18n } from "vue-i18n"
import useEventBus from "@/utils/eventBus"
import { useTheme } from 'vuetify'
import BarChart from '@/components/shared/chartjs/components/BarChart'
import { getLatestBarChartConfig } from '@/components/shared/chartjs/chartjsConfig'

const { t } = useI18n()


const isDownloading = ref(false)
const filters = ref([])
const requestBody = ref('')

const under25 = ref('')
const from25to30 = ref('')
const from31to35 = ref('')
const from36to401 = ref('')
const from41to45 = ref('')
const from46to50 = ref('')
const from51to55 = ref('')
const from56to60 = ref('')
const from61to65 = ref('')
const from66to70 = ref('')
const from71to75 = ref('')
const from76to80 = ref('')
const up80 = ref('')    

const dataGrafisco = ref({})
    
const fields = ref([
  { key: "corporation", label: t('acceptance_rejection.letters.corporationName').toUpperCase() },
  { key: "circunscription", label: t('list_candidates.circunscription').toUpperCase() },
  { key: 'department', label: t('acceptance_rejection.letters.department').toUpperCase() },
  { key: "municipality", label: t('acceptance_rejection.letters.municipality').toUpperCase() },
  { key: "commune", label:t('acceptance_rejection.letters.commune').toUpperCase() },
  { key: "under25", label: t('candidates_enrolled_age.letters.Under_25_years').toUpperCase() },
  { key: "from25to30", label: t('candidates_enrolled_age.letters.25_30_years').toUpperCase() },
  { key: 'from31to35',label: t('candidates_enrolled_age.letters.31_35_years').toUpperCase() },
  { key: 'from36to40',label: t('candidates_enrolled_age.letters.36_40_years').toUpperCase() },
  { key: 'from41to45',label: t('candidates_enrolled_age.letters.41_45_years').toUpperCase() },
  { key: "from46to50", label: t('candidates_enrolled_age.letters.46_50_years').toUpperCase() },
  { key: "from51to55", label: t('candidates_enrolled_age.letters.51_55_years').toUpperCase() },
  { key: "from56to60", label: t('candidates_enrolled_age.letters.56_60_years').toUpperCase() },
  { key: "from61to65", label: t('candidates_enrolled_age.letters.61_65_years').toUpperCase() },
  { key: "from66to70", label: t('candidates_enrolled_age.letters.66_70_years').toUpperCase() },
  { key: "from71to75", label: t('candidates_enrolled_age.letters.71_75_years').toUpperCase() },
  { key: "from76to80", label: t('candidates_enrolled_age.letters.76_80_years').toUpperCase() },
  { key: "up80", label: t('candidates_enrolled_age.letters.Over_80_years').toUpperCase() },
 
])

const handlerSearchFilter = value => {
  
  filters.value = value
  
  const filter = filters.value

  requestBody.value = {
    "department_id": filter.department,
    "municipality_id": filter.municipality,
    "commune_id": filter.commune,
    "corporation_id": filter.corporationId,
    "circunscription_id": filter.circunscriptionId,
    "age_range":filter.age_range,
  }

  getAgeRange()
}


const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "department_id": filter.department,
    "municipality_id": filter.municipality,
    "commune_id": filter.commune,
    "corporation_id": filter.corporationId,
    "circunscription_id": filter.circunscriptionId,
    "age_range":filter.age_range,
    type: type === 'CSV' ? 2 : 1,
  }

  axios.get(`/v1/candidates/age-report/download`, {
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'CSV' ? 'Reporte Candidatos Inscritos por edad.csv' : 'Reporte Candidatos Inscritos por edad.xlsx'

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

  try {
    const { data } = await axios.get(`/v1/candidates/age-report-total-graph`,{ params: requestBody.value })

    under25.value = data.under25 
    from25to30.value = data.from25to30
    from31to35.value = data.from31to35
    from36to401.value = data.from36to40
    from41to45.value = data.from41to45
    from46to50.value = data.from46to50
    from51to55.value = data.from51to55
    from56to60.value = data.from56to60
    from61to65.value = data.from61to65
    from66to70.value = data.from66to70
    from71to75.value = data.from71to75
    from76to80.value = data.from76to80
    up80.value       = data.up80
   
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data
    }
  } 
  
  dataGrafisco.value = {
    labels: [
      'Menor de 25 años',
      '25 - 30 años',
      '31 - 35 años',
      '36 - 40 años',
      '41 - 45 años',
      '46 - 50 años',
      '51 - 55 años',
      '56 - 60 años',
      '61 - 65 años',
      '66 - 70 años',
      '71 - 75 años',
      '76 - 80 años',
      'Mayor de 80 años',
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
        under25.value,
        from25to30.value,
        from31to35.value,
        from36to401.value,
        from41to45.value,
        from46to50.value,
        from51to55.value,
        from56to60.value,
        from61to65.value,
        from66to70.value,
        from71to75.value,
        from76to80.value,
        up80.value,
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('candidates_enrolled_age.title') ]" /> 
    <CandidatesEnrolledAgeReport class="mb-4" @search="handlerSearchFilter" />
    <VCard>
      <VCardText>
        <BarChart
          :height="400"
          :chart-data="dataGrafisco"
          :chart-options="chartOptions"
        />
      </VCardText>
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
        endpoint="/v1/candidates/age-report"
        :params="requestBody"
        :fields="fields"
      >
        <template #cell(under25)="{ item }">
          <div class="d-flex justify-center">
            {{ item.under25 }}
          </div>
        </template>
        <template #cell(from25to30)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from25to30 }}
          </div>
        </template>
        <template #cell(from31to35)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from31to35 }}
          </div>
        </template>
        <template #cell(from36to40)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from36to40 }}
          </div>
        </template>
        <template #cell(from41to45)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from41to45 }}
          </div>
        </template>
        <template #cell(from46to50)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from46to50 }}
          </div>
        </template>
        <template #cell(from51to55)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from51to55 }}
          </div>
        </template>
        <template #cell(from56to60)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from56to60 }}
          </div>
        </template>
        <template #cell(from61to65)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from61to65 }}
          </div>
        </template>
        <template #cell(from66to70)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from66to70 }}
          </div>
        </template>
        <template #cell(from71to75)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from71to75 }}
          </div>
        </template>
        <template #cell(from76to80)="{ item }">
          <div class="d-flex justify-center">
            {{ item.from76to80 }}
          </div>
        </template>
        <template #cell(up80)="{ item }">
          <div class="d-flex justify-center">
            {{ item.up80 }}
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "candidates_enrolled_age_report"
meta:
authRequired: true
</route>
