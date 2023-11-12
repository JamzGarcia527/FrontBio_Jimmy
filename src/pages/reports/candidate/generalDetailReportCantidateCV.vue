<script setup>
import GeneralDetailedCandidatesFilter from "@/components/reports/generalDetailedCandidatesReport/generalDetailedCandidatesFilter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'


const { t } = useI18n()
const filters = ref({})
const showItems = ref(false)
const isLoading = ref(false)
const error = ref(null)
const isDownloading = ref(false)
const itemsData = ref([])
const datatable = ref(null)

const handlerSearchFilter = async selected => {
  const { 
    groupingPoliticalTypeId: typePoliticalId,
    groupingPoliticalId: politicalId,
    corporationId: corporationId,
    circunscriptionId: circunscriptionId,
    department: departmentId,
    municipality: municipalityId,
    commune: communeId,
    dateInitial: dataIni,
    dateFinal: dataEnd,
  } = selected

  filters.value = {
    corporationId,
    circunscriptionId,
    typePoliticalId,
    politicalId,
    departmentId,
    municipalityId,
    communeId,
    dataIni,
    dataEnd,
  }  

  showItems.value = true
  isLoading.value = true

}

const fields = ref([
  { key: "dateInscription", label: t('module_reports.generalDetailedCandidates.createdAt') },
  { key: "codeCorporation", label: t('module_reports.generalDetailedCandidates.codeCorporation') },
  { key: 'nameCorporation', label: t('module_reports.generalDetailedCandidates.nameCorporation') },
  { key: 'codeCircunscrition', label: t('module_reports.generalDetailedCandidates.codeCircunscrition') },
  { key: 'nameCircunscrition', label: t('module_reports.generalDetailedCandidates.nameCircunscrition') },
  { key: 'codeDepartment', label: t('module_reports.generalDetailedCandidates.codeDepartment') },
  { key: 'department', label: t('module_reports.generalDetailedCandidates.department') },
  { key: 'codeMuncipality', label: t('module_reports.generalDetailedCandidates.codeMuncipality') },
  { key: 'muncipality', label: t('module_reports.generalDetailedCandidates.muncipality') },
  { key: 'codeCommune', label: t('module_reports.generalDetailedCandidates.codeCommune') },
  { key: 'commune', label: t('module_reports.generalDetailedCandidates.commune') },
  { key: 'namePreferentialVote', label: t('module_reports.generalDetailedCandidates.namePreferentialVote') },
  { key: 'shuffleNumber', label: t('module_reports.generalDetailedCandidates.shuffleNumber') },
  { key: 'codeGroupingPoliticalType', label: t('module_reports.generalDetailedCandidates.codeGroupingPoliticalType') },
  { key: 'nameGroupingPoliticalType', label: t('module_reports.generalDetailedCandidates.nameGroupingPoliticalType') },  
  { key: 'codeGroupingPolitical', label: t('module_reports.generalDetailedCandidates.codeGroupingPolitical') },
  { key: 'nameGroupingPolitical', label: t('module_reports.generalDetailedCandidates.nameGroupingPolitical') },  
  { key: 'row', label: t('module_reports.generalDetailedCandidates.row') },
  { key: 'dni', label: t('module_reports.generalDetailedCandidates.dni') },  
  { key: 'firstname', label: t('module_reports.generalDetailedCandidates.firstname') },
  { key: 'secondname', label: t('module_reports.generalDetailedCandidates.secondname') },  
  { key: 'firstsurname', label: t('module_reports.generalDetailedCandidates.firstsurname') },  
  { key: 'secondsurname', label: t('module_reports.generalDetailedCandidates.secondsurname') },
  { key: 'gender', label: t('module_reports.generalDetailedCandidates.gender2') }, 
  { key: 'email', label: t('module_reports.generalDetailedCandidates.email') }, 
  { key: 'codeFocusVictim', label: t('module_reports.generalDetailedCandidates.codeFocusVictim') },
  { key: 'focusVictim', label: t('module_reports.generalDetailedCandidates.focusVictim') },
  { key: 'codeFocusRacial', label: t('module_reports.generalDetailedCandidates.codeFocusRacial') },
  { key: 'focusRacial', label: t('module_reports.generalDetailedCandidates.focusRacial') },
  { key: 'codefocusDisability', label: t('module_reports.generalDetailedCandidates.codefocusDisability') },
  { key: 'focusDisability', label: t('module_reports.generalDetailedCandidates.focusDisability') },
  { key: 'codeLgtbiqIdentity', label: t('module_reports.generalDetailedCandidates.codeLgtbiqIdentity') },
  { key: 'lgtbiqIdentity', label: t('module_reports.generalDetailedCandidates.lgtbiqIdentity') },

  { key: 'codeFocusLgtbiqOrientation', label: t('module_reports.generalDetailedCandidates.codeFocusLgtbiqOrientation') },
  { key: 'focusLgtbiqOrientation', label: t('module_reports.generalDetailedCandidates.focusLgtbiqOrientation') },

  { key: 'codeVoteBlank', label: t('module_reports.generalDetailedCandidates.codeVoteBlank') },  
  { key: 'voteBlank', label: t('module_reports.generalDetailedCandidates.voteBlank') },
  { key: 'doubleInscription', label: t('module_reports.generalDetailedCandidates.doubleInscription') },

  { key: 'doubleMilitancia', label: t('module_reports.generalDetailedCandidates.doubleMilitancia') },


  { key: 'quota', label: t('module_reports.generalDetailedCandidates.quota') }, 

])

const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "corporationId": filter.corporationId,
    "circunscriptionId": filter.circunscriptionId,
    "typePoliticalId": filter.typePoliticalId,
    "politicalId": filter.politicalId,
    "departmentId": filter.departmentId,
    "municipalityId": filter.municipalityId,
    "dataIni": filter.dataIni,
    "dataEnd": filter.dataEnd,
    "communeId": filter.communeId,
    "format": type,
  }

  axios.get(`/v1/candidates/report-export-genaral-datail-cv`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte General y Detallado de Candidatos Observadores Electorales.xlsx' : 'Reporte General y Detallado de Candidatos Observadores Electorales.csv' 
    
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
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.generalDetailedCandidates.title2') ]" />
    <GeneralDetailedCandidatesFilter class="mb-4" @search="handlerSearchFilter" />
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
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/candidates/candidate-report-general-datail-cv"
        :params="filters"
        :fields="fields"
        :loading="isLoading"
      >
        <template #cell(codeCorporation)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeCorporation }}          
          </div>
        </template>
        <template #cell(codeCircunscrition)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeCircunscrition }}          
          </div>
        </template>
        <template #cell(codeDepartment)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeDepartment }}          
          </div>
        </template>
        <template #cell(codeMuncipality)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeMuncipality }}          
          </div>
        </template>
        <template #cell(codeCommune)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeCommune }}          
          </div>
        </template>
        <template #cell(shuffleNumber)="{ item }">
          <div class="d-flex justify-center">
            {{ item.shuffleNumber }}          
          </div>
        </template>
        <template #cell(codeGroupingPoliticalType)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeGroupingPoliticalType }}          
          </div>
        </template>
        <template #cell(codeGroupingPolitical)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeGroupingPolitical }}          
          </div>
        </template>
        <template #cell(row)="{ item }">
          <div class="d-flex justify-center">
            {{ item.row }}          
          </div>
        </template>
        <template #cell(dni)="{ item }">
          <div class="d-flex justify-center">
            {{ item.dni }}          
          </div>
        </template>
        <template #cell(email)="{ item }">
          <div class="d-flex justify-center">
            {{ item.email }}          
          </div>
        </template>
        <template #cell(codeFocusVictim)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeFocusVictim }}          
          </div>
        </template>
        <template #cell(focusVictim)="{ item }">
          <div class="d-flex justify-center">
            {{ item.focusVictim }}          
          </div>
        </template>
        <template #cell(codefocusDisability)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codefocusDisability }}          
          </div>
        </template>
        <template #cell(focusDisability)="{ item }">
          <div class="d-flex justify-center">
            {{ item.focusDisability }}          
          </div>
        </template>

        <template #cell(codeLgtbiqIdentity)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeLgtbiqIdentity }}          
          </div>
        </template>

        <template #cell(lgtbiqIdentity)="{ item }">
          <div class="d-flex justify-center">
            {{ item.lgtbiqIdentity }}          
          </div>
        </template>

        <template #cell(codeFocusLgtbiqOrientation)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeFocusLgtbiqOrientation }}          
          </div>
        </template>
        <template #cell(focusLgtbiqOrientation)="{ item }">
          <div class="d-flex justify-center">
            {{ item.focusLgtbiqOrientation }}          
          </div>
        </template>
        <template #cell(doubleMilitancia)="{ item }">
          <div class="d-flex justify-center">
            {{ item.doubleMilitancia }}          
          </div>
        </template>
        <template #cell(doubleInscription)="{ item }">
          <div class="d-flex justify-center">
            {{ item.doubleInscription }}          
          </div>
        </template>

       
        <template #cell(codeVoteBlank)="{ item }">
          <div class="d-flex justify-center">
            {{ item.codeVoteBlank == 0 ? '0' : item.codeVoteBlank }}          
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
  name: "reports-candidate-generalDetailReportCantidateCV"
  meta:
  authRequired: true
  </route>
