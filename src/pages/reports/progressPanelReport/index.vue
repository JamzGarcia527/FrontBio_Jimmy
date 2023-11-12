<script setup>
import ProgressPanelFilter from '@/components/reports/progressPanelReport/progressPanelFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSideReports.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import imageLogo from '@images/pages/fondoContrasena.png'
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import imageFilter from '@images/pages/progress-panel-report.png'
import Swal from "@/plugins/sweetalert2"
import { useInscription } from '@/stores/inscription'
import { downloadBlob } from '@/utils'


const inscriptionStore = useInscription()


const isDownloading = ref(false)

const { t } = useI18n()

const filters = ref([])
const dataForExport = ref()
const isDialogVisible = ref(false)
const state = ref(0)

const corporationInf = ref('')
const departmentInf = ref('')
const municipalityInf = ref('')
const communeInf = ref('')

const dataInfo = ref('')
const requestBody = ref('')
const requestBodyDownload = ref('')
const  showDate= ref(false)

const fields = ref([
  { key: "corporation", label:t('acceptance_rejection.letters.corporationName').toUpperCase()  },
  { key: "circunscription", label: t('reports_inscription.letters.circunscriptionName').toUpperCase() },
  { key: "department", label: t('reports_inscription.letters.department').toUpperCase() },
  { key: 'municipality',label: t('reports_inscription.letters.municipality').toUpperCase() },
  { key: 'commune',label: t('reports_inscription.letters.commune').toUpperCase() },
  { key: "numberCandidates", label: t('candidate_uploaded_photos_report.number_registered_candidates').toUpperCase() },
  { key: "numberGroupingPoliticals", label: t('progress_panel.letters.numberPoliticalGroups').toUpperCase()  },
  { key: "numberE6Preliminaries", label: t('progress_panel.letters.preliminaries').toUpperCase() },
  { key: 'numberE6Definitives', label: t('progress_panel.letters.ultimates').toUpperCase()  },
  { key: 'numberE6Approved', label: t('progress_panel.letters.approved').toUpperCase() },
  { key: "numberE7Preliminaries", label: t('progress_panel.letters.preliminaries').toUpperCase() },
  { key: 'numberE7Definitives', label: t('progress_panel.letters.ultimates').toUpperCase() },
  { key: 'numberE7Approved', label: t('progress_panel.letters.approved').toUpperCase()  },
  { key: 'numberE8', label: t('progress_panel.letters.e8quantity').toUpperCase() },
 
])



const handlerSearchFilter = value => {
  filters.value = value 
  showDate.value = true
}



const openModal = async (corporationId,circunscriptionId,departmentId,municipalityId,communeId,corporation,departmen,municipality,commune,columnSelected) => {
  const filter = filters.value

  state.value =  0
  isDialogVisible.value = true
  corporationInf.value = corporation
  departmentInf.value =departmen
  municipalityInf.value =municipality
  communeInf.value =commune

  if(!filter.groupingPoliticalTypeId  ){
    requestBody.value = {
      "corporationId": corporationId,
      "circunscriptionId": circunscriptionId,
      "department": departmentId,
      "municipality": municipalityId,
      "commune": communeId,
      "columnSelected":columnSelected,
    }
  }  else if(filter.groupingPoliticalTypeId && filter.groupingPoliticalId== -1){
    requestBody.value = {
      "corporationId": corporationId,
      "circunscriptionId": circunscriptionId,
      "department": departmentId,
      "municipality": municipalityId,
      "commune": communeId,
      "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
      "columnSelected":columnSelected,
    }
  }else if( filter.groupingPoliticalTypeId && filter.groupingPoliticalId ){
    requestBody.value = {
      "corporationId": corporationId,
      "circunscriptionId": circunscriptionId,
      "department": departmentId,
      "municipality": municipalityId,
      "commune": communeId,
      "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
      "groupingPoliticalId": filter.groupingPoliticalId,
      "columnSelected":columnSelected,
    }
  }

  


  try {
   
    const { data } = await axios.get("/v1/inscriptions/progress/detail", { params: requestBody.value })


    dataInfo.value = data.content
    state.value =  dataInfo.value[0].state
   

  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }

  }
}

const download = async (inscriptionId,inscriptionChangeId,radicate) => {

  if(inscriptionChangeId){

    try {

      const { data } = await axios.get(`/v1/inscription-change-approval/download?id=${inscriptionChangeId}`, { responseType: 'blob' })

      const file = new Blob([data], { type: 'application/pdf' })

      
      downloadBlob(file, radicate,'application/pdf')
    } catch (e) {
      let text = 'No es posible realizar operación, por favor intenta más tarde.'
      if (e.response) {
        const { data } = e.response
        const response = data instanceof Blob ? JSON.parse(await data.text()) : data

        text = response.message
      }
      Swal.fire({ icon: 'warning', text: text })
    }


  }else{
    
    try {

      const { data } = await axios.get(`/v1/inscription-approval/download?id=${inscriptionId}`, { responseType: 'blob' })

      const file = new Blob([data], { type: 'application/pdf' })

      downloadBlob(file, radicate,'application/pdf')
    } catch (e) {
      let text = 'No es posible realizar operación, por favor intenta más tarde.'
      if (e.response) {
        const { data } = e.response
        const response = data instanceof Blob ? JSON.parse(await data.text()) : data

        text = response.message
      }
      Swal.fire({ icon: 'warning', text: text })
    }


  }

}

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  if(!filter.groupingPoliticalTypeId  ){
    requestBodyDownload.value = {
      "department": filter.department,
      "municipality": filter.municipality,
      "commune": filter.commune,
      "corporationId": filter.corporationId,
      "circunscriptionId": filter.circunscriptionId,
      exte: type === 'CSV' ? 2 : 1,
    }
  }  else if(filter.groupingPoliticalTypeId && filter.groupingPoliticalId== -1){
    requestBodyDownload.value = {
      "department": filter.department,
      "municipality": filter.municipality,
      "commune": filter.commune,
      "corporationId": filter.corporationId,
      "circunscriptionId": filter.circunscriptionId,
      "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
      exte: type === 'CSV' ? 2 : 1,
    }
  }else if( filter.groupingPoliticalTypeId && filter.groupingPoliticalId ){
    requestBodyDownload.value = {
      "department": filter.department,
      "municipality": filter.municipality,
      "commune": filter.commune,
      "corporationId": filter.corporationId,
      "circunscriptionId": filter.circunscriptionId,
      "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
      "groupingPoliticalId": filter.groupingPoliticalId,
      exte: type === 'CSV' ? 2 : 1,
    }
  }


  axios.get(`/v1/inscriptions/progress/download`, {
    params: requestBodyDownload.value,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'CSV' ? 'Reporte Panel Avance Inscripcion.csv' : 'Reporte Panel Avance Inscripcions.xlsx'

    downloadBlob(data, nameFile, type === 'CSV' ? 'text/csv;charset=utf-8' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isDownloading.value = false)
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.letters.progress_panel') ]" /> 
    <ProgressPanelFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showDate">
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
        endpoint="/v1/inscriptions/progress"
        table-class="table-bordered"
        :params="filters"
        :fields="fields"
      >
        <template #v-theadTitle>
          <tr>
            <th class="text-center" colspan="7" />
            <th class="text-center border " colspan="10">
              SECCIÓN 
            </th>
          </tr>
        </template>
        <template #v-thead>
          <tr>
            <th class="text-center" colspan="7" />
            <th class="text-center border bg-info-light" colspan="3">
              E6:
            </th>
            <th class="text-center border bg-orange-light" colspan="3">
              E7:
            </th>
            <th class="text-center border bg-success-light" colspan="4">
              E8:
            </th>
          </tr>
        </template>

        <VRow justify="center">
          <VCol cols="12" md="10" class="px-12">
            <VCard variant="tonal">
              <h4 class="text-center bold">
                {{ t('candidates.title_table') }}
              </h4>
            </VCard>
          </VCol>
        </VRow>
        <template #cell(numberCandidates)="{ item }">
          <div class="d-flex justify-center">
            {{ item.numberCandidates }}
          </div>
        </template>
        <template #cell(numberGroupingPoliticals)="{ item }">
          <div class="d-flex justify-center">
            {{ item.numberGroupingPoliticals }}
          </div>
        </template>
        <template #cell(numberE6Preliminaries)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.corporationId,item.circunscriptionId,item.departmentId,item.municipalityId,item.communeId,item.corporation,item.department,item.municipality,item.commune,columnSelected=0)">
              {{ item.numberE6Preliminaries }}
            </VBtn>
          </div>
        </template>
        <template #cell(numberE6Definitives)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.corporationId,item.circunscriptionId,item.departmentId,item.municipalityId,item.communeId,item.corporation,item.department,item.municipality,item.commune,columnSelected=1)">
              {{ item.numberE6Definitives }}
            </VBtn>
          </div>
        </template>
        <template #cell(numberE6Approved)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.corporationId,item.circunscriptionId,item.departmentId,item.municipalityId,item.communeId,item.corporation,item.department,item.municipality,item.commune,columnSelected=2)">
              {{ item.numberE6Approved }}
            </VBtn>
          </div>
        </template>
        <template #cell(numberE7Preliminaries)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.corporationId,item.circunscriptionId,item.departmentId,item.municipalityId,item.communeId,item.corporation,item.department,item.municipality,item.commune,columnSelected=3)">
              {{ item.numberE7Preliminaries }}
            </VBtn>
          </div>
        </template>
        <template #cell(numberE7Definitives)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.corporationId,item.circunscriptionId,item.departmentId,item.municipalityId,item.communeId,item.corporation,item.department,item.municipality,item.commune,columnSelected=4)">
              {{ item.numberE7Definitives }}
            </VBtn>
          </div>
        </template>
        <template #cell(numberE7Approved)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.corporationId,item.circunscriptionId,item.departmentId,item.municipalityId,item.communeId,item.corporation,item.department,item.municipality,item.commune,columnSelected=5)">
              {{ item.numberE7Approved }}
            </VBtn>
          </div>
        </template>
        <template #cell(numberE8)="{ item }">
          <div class="d-flex justify-center">
            {{ item.numberE8 }}
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
    <VCard v-else>
      <div class="mb-10 ps-10 mt-10 pr-10">
        <VImg
          :src="imageFilter"
          cover
        />
      </div>
    </VCard>
  </div>
  <VDialog
    v-model="isDialogVisible" width="1000"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

    <!-- Dialog Content -->
    <VCard class="text-wrap">
      <VImg
        :src="imageLogo"
        cover
      />
      <VCardText v-if="state!=0">
        <VCol v-if="state==1" cols="12">
          <VListItemTitle class="text-h6  d-flex justify-center ">
            {{ t('progress_panel.letters.reportDetailPreliminaries') }}
          </VListItemTitle>
        </VCol>
        <VCol v-else-if="state==3" cols="12">
          <VListItemTitle class="text-h6 d-flex justify-center">
            {{ t('progress_panel.letters.reportDetailDefinitive') }}
          </VListItemTitle>
        </VCol>
        <VCol v-else-if="state==4" cols="12">
          <VListItemTitle class="text-h6 d-flex justify-center">
            {{ t('progress_panel.letters.reportDetailApproved') }}
          </VListItemTitle>
        </VCol>
        <VCol v-else-if="state==0" cols="12" />
        <VDivider class="mb-3" />
        <VTable class="table table-bordered">
          <thead>
            <tr>
              <th class="text-center" scope="col">
                {{ t('acceptance_rejection.letters.corporationName') }}
              </th>
              <th class="text-center" scope="col">
                {{ t('common.department') }}
              </th>
              <th class="text-center" scope="col">
                {{ t('common.municipality') }}
              </th>
              <th class="text-center" scope="col">
                {{ t('common.commune') }}
              </th>
              <th class="text-center" scope="col">
                {{ t('progress_panel.letters.groupingPoliticalNameCode') }}
              </th>
              <th scope="col">
                {{ t('progress_panel.letters.documentVersion') }}
              </th>
              <th v-if="state==4" scope="col">
                {{ t('user.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataInfo" :key="item.dataInfo">
              <th class="text-center" scope="row">
                {{ corporationInf }}
              </th>
              <th class="text-center" scope="row">
                {{ departmentInf }}
              </th>
              <th class="text-center" scope="row">
                {{ municipalityInf }}
              </th>
              <th class="text-center" scope="row">
                {{ communeInf }}
              </th>
              <th class="text-center" scope="row">
                {{ item.groupingPoliticalId }} - {{ item.groupingPolitical }}
              </th>
              <td v-if="item.state==3">
                {{ item.versionId }}
              </td>
              <td v-if="item.state==4">
                {{ item.versionId }}
              </td>
              <td v-if="item.state==4">
                <VBtn
                  class="d-flex justify-center"
                  variant="text"
                  icon="tabler-download"
                  color="secondary"
                  @click="download(item.inscriptionId,item.inscriptionChangeId,item.radicate)"
                />
              </td>
            </tr>
          </tbody>
        </VTable>
        <VCardText class="d-flex justify-end">
          <VBtn @click="isDialogVisible = false">
            {{ t('coalitions.btn_close_modal') }}
          </VBtn>
        </VCardText>
      </VCardText>
      <VCardText v-else>
        <VAlert color="secondary">
          No hay registros para mostrar
        </VAlert>
        <VCardText class="d-flex justify-end">
          <VBtn @click="isDialogVisible = false">
            {{ t('coalitions.btn_close_modal') }}
          </VBtn>
        </VCardText>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
name: "reports-progress-panel"
meta:
authRequired: true
</route>
