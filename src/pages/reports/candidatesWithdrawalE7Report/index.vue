<script setup>
import CandidatesWithdrawalE7Filter from '@/components/reports/candidatesWithdrawalE7Report/candidatesWithdrawalE7Filter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSideReports.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import imageLogo from '@images/pages/fondoContrasena.png'
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import { downloadBlob } from '@/utils'


const isDownloading = ref(false)
const { t } = useI18n()
const isDialogVisible = ref(false)
const filters = ref([])
const filtersDetail = ref([])
const state = ref(0)


const fields = ref([
  { key: "groupingPoliticalName", label: t('common.grouping_political_name').toUpperCase() },
  { key: 'groupingPoliticalType', label: t('list_candidates.grouping_political_type').toUpperCase()  },
  { key: "corporation", label: t('common.corporation').toUpperCase() },
  { key: "circunscripcion", label: t('common.circunscription').toUpperCase()  },
  { key: "department", label: t('reports_inscription.letters.department').toUpperCase() },
  { key: 'municipality',label: t('reports_inscription.letters.municipality').toUpperCase() },
  { key: 'commune',label: t('reports_inscription.letters.commune').toUpperCase() },
  { key: "giveUp", label: t('candidates_withdrawal_e7.letters.resignation').toUpperCase() },
  { key: "notAccepted", label: t('candidates_withdrawal_e7.letters.no_Acceptance').toUpperCase() },
  { key: "death", label: t('candidates_withdrawal_e7.letters.death').toUpperCase() },
 
])

const fieldsDetail = ref([
  { key: "groupingPoliticalName", label: t('common.grouping_political_name').toUpperCase() },
  { key: "corporation", label: t('common.corporation').toUpperCase() },
  { key: "circunscripcion", label: t('common.circunscription').toUpperCase()  },
  { key: "department", label: t('reports_inscription.letters.department').toUpperCase() },
  { key: 'municipality',label: t('reports_inscription.letters.municipality').toUpperCase() },
  { key: 'commune',label: t('reports_inscription.letters.commune').toUpperCase() },
  { key: "versionE7", label: t('candidates_withdrawal_e7.letters.version_e7').toUpperCase() },

])



const handlerSearchFilter = value => {
  filters.value = value 
}


const exportar = type => {
  isDownloading.value = true

  const filter = filters.value


  const  payload = {
    "corporationId": filter.corporationId,
    "department": filter.department,
    "municipality": filter.municipality,
    "commune":filter.commune,
    "format": type === 'XLS' ? 'XLS' : 'CSV',
  }

  axios.get(`/v1/candidates-changes/candidate/reason/retired/export`,{
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'XLS' ? 'Reporte Candidatos Motivo Retiro E7.xlsx' : 'Reporte Candidatos Motivo Retiro E7.csv' 
    
    downloadBlob(data, nameFile, type === 'XLS' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' : 'text/csv;charset=utf-8') 
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isDownloading.value = false)
}



const openModal = async (groupingPoliticalName,icorporationId,departmentId,municipalityId,commune,groupingpoliticalId,groupingpoliticalTypeId,columnSelected) => {

  state.value = columnSelected 
  if(groupingPoliticalName === 'Total'){
    isDialogVisible.value = false
  }else{
    isDialogVisible.value = true
  }
 
  filtersDetail.value = {
    "corporationId": icorporationId,
    "department": departmentId,
    "municipality": municipalityId,
    "commune":commune,
    "reason": columnSelected,
    "groundPolicalId": groupingpoliticalId,
    "groundPolicalIdType": groupingpoliticalTypeId,
    
  }
  
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('candidates_withdrawal_e7.title') ]" /> 
    <CandidatesWithdrawalE7Filter class="mb-4" @search="handlerSearchFilter" />
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
        endpoint="/v1/candidates-changes/candidate/reason/retired"
        table-class="table-bordered"
        :params="filters"
        :fields="fields"
      >
        <template #v-thead>
          <tr>
            <th class="text-center" colspan="7" />
            <th class="text-center border bg-info-light" colspan="3">
              {{ t('candidates_withdrawal_e7.letters.section_E7_reason').toUpperCase() }}
            </th>
          </tr>
        </template>
        <template #cell(giveUp)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.groupingPoliticalName,item.corporationId,item.departmentId,item.municipalityId,item.communeId, item.groupingpoliticalId,item.groupingpoliticalTypeId,columnSelected=1)">
              {{ item.giveUp }}
            </VBtn>
          </div>
        </template>
        <template #cell(notAccepted)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.groupingPoliticalName,item.corporationId,item.departmentId,item.municipalityId,item.communeId, item.groupingpoliticalId,item.groupingpoliticalTypeId,columnSelected=2)">
              {{ item.notAccepted }}
            </VBtn>
          </div>
        </template>
        <template #cell(death)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.groupingPoliticalName,item.corporationId,item.departmentId,item.municipalityId,item.communeId, item.groupingpoliticalId,item.groupingpoliticalTypeId,columnSelected=3)">
              {{ item.death }}
            </VBtn>
          </div>
        </template>
      </DataTableServerSide>
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
            {{ t('candidates_withdrawal_e7.letters.reportDetailRenuncia') }}
          </VListItemTitle>
        </VCol>
        <VCol v-else-if="state==2" cols="12">
          <VListItemTitle class="text-h6 d-flex justify-center">
            {{ t('candidates_withdrawal_e7.letters.reportDetailNoAcetacio') }}
          </VListItemTitle>
        </VCol>
        <VCol v-else-if="state==3" cols="12">
          <VListItemTitle class="text-h6 d-flex justify-center">
            {{ t('candidates_withdrawal_e7.letters.reportDetailMuerte') }}
          </VListItemTitle>
        </VCol>
        <VCol v-else-if="state==0" cols="12" />
        <VDivider class="mb-3" />
      </VCardText>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/candidates-changes/candidate/reason/retired/detail"
        table-class="table-bordered"
        :params="filtersDetail"
        :fields="fieldsDetail"
      />
      <VCardText class="d-flex justify-end">
        <VBtn @click="isDialogVisible = false">
          {{ t('coalitions.btn_close_modal') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
name: "candidates-withdrawal-e7-report"
meta:
authRequired: true
</route>
