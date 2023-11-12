<script setup>
import SummaryFilter from '@/pages/reports/registrationSummaryReport/summaryFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"

import { useI18n } from "vue-i18n"

const { t } = useI18n()

const filters = ref([])


const fields = ref([
  { key: "index", label: " " },
  { key: "virtualRegistrationQuantity", label: t('reports_inscription.letters.virtualRegistrationQuantity').toUpperCase() },
  { key: "manualRegistrationQuantity", label: t('reports_inscription.letters.manualRegistrationQuantity').toUpperCase()  },
  { key: 'totalInscriptions', label: t('reports_inscription.letters.totalInscriptions').toUpperCase() },
  { key: "groupingPoliticalName", label: t('reports_inscription.letters.groupingPoliticalName').toUpperCase() },
  { key: "corporationName", label:t('reports_inscription.letters.corporationName').toUpperCase() },
  { key: "circunscriptionName", label: t('reports_inscription.letters.circunscriptionName').toUpperCase() },
  { key: "department", label: t('reports_inscription.letters.department').toUpperCase() },
  { key: 'municipality',label: t('reports_inscription.letters.municipality').toUpperCase() },
  { key: 'commune',label: t('reports_inscription.letters.commune').toUpperCase() },
  { key: "preferentialVote", label: t('reports_inscription.letters.preferentialVote').toUpperCase() },
  { key: "versions", label: t('reports_inscription.letters.versions').toUpperCase() },
  { key: "promotorVotoBlanco", label: t('reports_inscription.letters.promotorVotoBlanco').toUpperCase() },
  { key: "state", label: t('reports_inscription.letters.state').toUpperCase() },
  { key: "e6", label: t('reports_inscription.letters.e6').toUpperCase() },
  { key: "e7", label: t('reports_inscription.letters.e7').toUpperCase() },
  { key: "actions", label: t('reports_inscription.letters.manualRegistrationQuantity').toUpperCase() },
  { key: "registeredCandidates", label: t('reports_inscription.letters.registeredCandidates').toUpperCase() },
  { key: "men", label: t('reports_inscription.letters.men').toUpperCase() },
  { key: "women", label: t('reports_inscription.letters.women').toUpperCase() },
  { key: "actions", label: t('reports_inscription.letters.actions').toUpperCase() },
  { key: "createDate", label: t('reports_inscription.letters.createDate').toUpperCase() },
  { key: "userName", label: t('reports_inscription.letters.userName').toUpperCase() },
  { key: "aproveDate", label: t('reports_inscription.letters.aproveDate').toUpperCase() },
  { key: "inscriptionsReturns", label: t('reports_inscription.letters.inscriptionsReturns').toUpperCase() },
  { key: "actions", label: t('reports_inscription.letters.manualRegistrationQuantity').toUpperCase() },
])

const handlerSearchFilter = value => {
  filters.value = value
  
}
</script>

<template>
  <div>
    <SummaryFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard>
      <div style="margin-left: 90%;" class="me-3 mt-3 mb-2">
        <VMenu open-on-hover>
          <template #activator="{ props }">
            <VBtn v-bind="props">
              {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
            </VBtn>
          </template>
          <VList>
            <VListItem value="exportCsv">
              <template #prepend>
                <VIcon
                  size="22"
                  class="me-3"
                  icon="la-file-csv"
                />
              </template>

              <VListItemTitle color="white">
                {{ t('formsPendingApproval.breadcrumbs.bntCSV') }}
              </VListItemTitle>
            </VListItem>
            <VListItem value="exportXls">
              <template #prepend>
                <VIcon
                  size="22"
                  class="me-3"
                  icon="la-file-excel"
                />
              </template>

              <VListItemTitle color="white">
                {{ t('formsPendingApproval.breadcrumbs.bntExcel') }}
              </VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </div>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/inscriptions/summary"
        :params="filters"
        :fields="fields"
      >
        <!--
          <template #cell(fullname)="{ item }">
          {{ item.firstName }}
          {{ item.secondName }}
          {{ item.firstSurname }}
          {{ item.secondSurname }}
          </template> 
        --> 
      </DataTableServerSide>
    </VCard>
  </div>
</template>
