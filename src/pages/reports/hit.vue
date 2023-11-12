<script setup>
import Filters from '@/components/reports/Filters.vue'
import axios from '@/plugins/axios'
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import { useI18n } from "vue-i18n"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import { useAppAbility } from '@/plugins/casl/useAppAbility'

const { t } = useI18n()
const { can } = useAppAbility()

const fields = ref([
  { key: 'transactionDate', label: t('common.date_trans').toUpperCase() },
  { key: 'corporationCode', label: t('common.code_corporation').toUpperCase() },
  { key: 'descriptionCorporation', label: t('common.description_corporation').toUpperCase() },
  { key: 'circunscriptionCode', label: t('common.code_circunscription').toUpperCase() },
  { key: 'descriptionCircunscription', label: t('common.description_circunscription').toUpperCase() },
  { key: 'department', label: t('common.department').toUpperCase() },
  { key: 'municipality', label: t('common.municipality').toUpperCase() },
  { key: 'commune', label: t('common.commune').toUpperCase() },
  { key: 'codePoliticalGrouping', label: t('coalitions.code_grouping_political_type').toUpperCase() },
  { key: 'namePoliticalGrouping', label: t('user.groupingPoliticals').toUpperCase() },
  { key: 'dni', label: t('preinscription.representative.dni').toUpperCase() },
  { key: 'renglon', label: t('candidates.row_field').toUpperCase() },
  { key: 'fullName', label: t('committeeMembers.full_name').toUpperCase() },
  { key: 'type', label: t('common.type').toUpperCase() },
  { key: 'state', label: t('user.status_header').toUpperCase() },
])

const datatable = ref(null)
const filters = ref({})
const dataForExport = ref()

const getInscriptions = value => {
  const modelGet = {
    "corporationId": value.corporationId,
    "circunscriptionId": value.circunscriptionId,
    "departamentId": value.department,
    "municipalityId": value.municipality,
    "communeId": value.commune,
    "profileCode": value.rol,
  }

  filters.value = { ...modelGet }
}

const exportData = async type => {
  const requestBody = {
    "corporationId": -1,
    "circunscriptionId": -1,
    "departamentId": -1,
    "municipalityId": -1,
    "communeId": -1,
    "profileCode": -1,
    "page": 0,
    "size": 9999,
  }

  const { data } = await axios.get('/v1/biometric', { params: requestBody })

  dataForExport.value = data.content

  let nameFile = "reportes_de_hits"
  let dataExport = dataForExport.value.map(row => {
    return {
      "FECHA DE LA TRANSACCIÓN": row.transactionDate === null ? "" : row.transactionDate,
      'CÓDIGO CORPORACIÓN': row.corporationCode === null ? "" : row.corporationCode,
      "DESCRIPCIÓN CORPORACIÓN": row.descriptionCorporation === null ? "" : row.descriptionCorporation,
      "CÓDIGO CIRCUNSCRIPCIÓN": row.circunscriptionCode === null ? "" : row.circunscriptionCode,
      "DESCRIPCIÓN CIRCUNSCRIPCIÓN": row.descriptionCircunscription === null ? "" : row.descriptionCircunscription,
      "DEPARTAMENTO": row.department === null ? "" : row.department,
      "MUNICIPIO": row.municipality === null ? "" : row.municipality,
      "COMUNA/LOCALIDAD/CORREGIMIENTO":  row.commune === null ? "" : row.commune,
      "CÓDIGO DE LA AGRUPACIÓN POLÍTICA": row.codePoliticalGrouping === null ? "" : row.codePoliticalGrouping,
      "NOMBRE DE LA AGRUPACIÓN POLÍTICA": row.namePoliticalGrouping === null ? "" : row.namePoliticalGrouping,
      "NÚMERO DE CÉDULA DE CIUDADANÍA": row.dni === null ? "" : row.dni,
      "RENGLÓN": row.renglon === null ? "" : row.renglon,
      "PRIMER NOMBRE": row.firstName === null ? "" : row.firstName,
      "SEGUNDO NOMBRE": row.secondName === null ? "" : row.secondName,
      "PRIMER APELLIDO": row.firstSurname === null ? "" : row.firstSurname,
      "SEGUNDO APELLIDO": row.secondSurname === null ? "" : row.secondSurname,
      "TIPO": row.type === null ? "" : row.type,
      "ESTADO": row.state === null ? "" : row.state,
    }
  })

  if(type === 'xlsx') {
    excelParser().exportDataFromJSON(dataExport, nameFile, null)
  } else {
    _buildDownloadCSV(dataExport, nameFile)
  }
}
</script>

<template>
  <div>
    <Filters
      title="Reporte de Hits"
      @next="getInscriptions"
    />
    <VCard>
      <VCardText>
        <div v-if="can('get', 'report-hits')">
          <VRow class="me-3 mb-4">
            <VMenu open-on-hover>
              <template #activator="{ props }">
                <VBtn v-bind="props">
                  {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
                </VBtn>
              </template>

              <VList>
                <VListItem
                  :title="t('formsPendingApproval.breadcrumbs.bntExcel')"
                  @click="exportData('xlsx')"
                />
                <VListItem
                  :title="t('formsPendingApproval.breadcrumbs.bntCSV')"
                  @click="exportData('csv')"
                />
              </VList>
            </VMenu>
          </VRow>
          <VRow>
            <DataTableServerSide
              ref="datatable"
              endpoint="/v1/biometric"
              :params="filters"
              :fields="fields"
            >
              <template #cell(fullName)="{ item }">
                {{ item.firstName }}
                {{ item.secondName }}
                {{ item.firstSurname }}
                {{ item.secondSurname }}
              </template>
            </DataTableServerSide>
          </VRow>
        </div>
        <div v-else>
          <VAlert color="warning">
            {{ t('validations.privileges') }}
          </VAlert>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "reports-hit"
meta:
authRequired: true
</route>
