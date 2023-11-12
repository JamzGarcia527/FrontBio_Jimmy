<script setup>
import { useI18n } from "vue-i18n"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useGeneralFilter } from "@/stores/generalfilter"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import Swal from '@/plugins/sweetalert2'
import axios from "@/plugins/axios"
import { downloadBlob } from "@/utils"

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
})

// Translate i18n
const { t } = useI18n()
const generalfilter = useGeneralFilter()
const filters = ref({})
const { can } = useAppAbility()
const disabledGeneral = ref(false)

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "corporation", label: t('list_candidates.corporation') },
  { key: "circunscription", label: t('list_candidates.circunscription') },
  { key: "groupingPoliticalType", label: t('list_candidates.grouping_political_type') },
  { key: "groupingPolitical", label: t('list_candidates.grouping_political_name') },
  { key: 'department', label: t('list_candidates.departament') },
  { key: "municipality", label: t('list_candidates.municipality') },
  { key: 'commune', label: t('list_candidates.commune') },
  { key: "rowField", label: t('list_candidates.rowField') },
  { key: "candidateDni", label: t('list_candidates.candidateDni') },
  { key: "names", label: t('list_candidates.name') },
  { key: "surnames", label: t('list_candidates.surname') },
])

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const corporations = computed(() => {
  const array = generalfilter
    .corporations
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const circunscriptions = computed(() => {
  const array = generalfilter
    .circunscriptionsByCorporation
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const departments = computed(() => {
  const array = generalfilter
    .departments
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.select_write_option'), value: -1 }, ...array ]
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.select_write_option'), value: -1 }, ...array ]
})

const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.select_write_option'), value: -1 }, ...array ]
})

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .groupingPoliticalTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const groupingPoliticals = computed(() => {
  const array = generalfilter
    .groupingPoliticalsByType
    .map(e => ({ title: `${e.id} - ${e.name}`, value: e.id }))

  return addOptionDefault(array)
})

const rules = reactive({
  corporations: [requiredEspecialSelectValidator],
  circunscriptions: [value => {
    if (generalfilter.idCorporation === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  departments: [value => {
    if (generalfilter.idCorporation === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  municipalities: [value => {
    if (generalfilter.idDepartment === -1 || !generalfilter.enableMunicipality) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  communes: [value => {
    if (generalfilter.idMunicipality === -1 || !generalfilter.enableCommune) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  groupingPoliticalTypes: [requiredEspecialSelectValidator],
  groupingPoliticals: [requiredEspecialSelectValidator],
})
  
const filterUser = () => {

  const valuesFilters = { ...generalfilter.selected }
  
  const modelGet = { 
    circunscription_id: valuesFilters.circunscriptionId,
    corporation_id:  valuesFilters.corporationId,
    department_id: valuesFilters.department,
    municipality_id: valuesFilters.municipality,
    commune_id: valuesFilters.commune,
    grouping_political_type_id: valuesFilters.groupingPoliticalTypeId,
    grouping_political_id: valuesFilters.groupingPoliticalId,
  }

  filters.value = { ...modelGet }
}

const clearForm = () => { 
  generalfilter.selected.groupingPoliticalId = -1
  generalfilter.selected.groupingPoliticalTypeId = -1
  generalfilter.selected.commune = -1
  generalfilter.selected.department = -1
  generalfilter.selected.municipality = -1
  generalfilter.selected.corporationId = -1
  generalfilter.selected.circunscriptionId = -1
}

const msnList = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}

const isExporting = ref(false)

const exportFile = exportType => {

  isExporting.value = true

  const filename = 'istado-de-candidatos-sin-chequeo-de-aceptación-de-candidatura'

  const mimeType = exportType == 2 ? 'text/csv;charset=utf-8' 
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'

  const requestParams = { ...filters.value, exportType }

  axios.get('/v1/candidates/pending-and-rejected/download', {
    params: requestParams,
    responseType: "blob",
  }).then(({ data }) => {
    downloadBlob(data, filename, mimeType)
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
    throw new Error(error)
  }).finally(() => isExporting.value = false)
}

onMounted(async () => {
  if(can('get-pending-and-rejected', 'candidate')){
    disabledGeneral.value = true
  }else{
    disabledGeneral.value = false
    msnList(t('permissions_profiles.warning_permissions'), "warning")
  }
})
</script>

<template>
  <div>
    <div v-if="disabledGeneral" class="layout-default">
      <VBreadcrumbs :items="[ t('list_candidates.breadcrumbs.title'), t('list_candidates.breadcrumbs.item_one') ]" />
      <VCard :title="t('list_candidates.breadcrumbs.item_one')">
        <VCardTitle>
          <hr>
        </VCardTitle>
        <VRow>
          <VRow class="pa-12 py-11">
            <VCol cols="12" md="6">
              <VSelect
                prepend-inner-icon="tabler-filter" 
                :label="t('common.grouping_political_type')"
                :model-value="generalfilter.idGroupingPoliticalType"
                :items="groupingPoliticalTypes" 
                @update:model-value="generalfilter.setGroupingPoliticalType"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VAutocomplete
                prepend-inner-icon="tabler-filter" 
                :label="t('common.grouping_political_name')"
                :model-value="generalfilter.idGroupingPolitical"
                :items="groupingPoliticals"
                @update:model-value="generalfilter.setGroupingPolitical"
              />
            </VCol>
            <VCol cols="12" sm="6" md="6">
              <VSelect
                clearable
                prepend-inner-icon="tabler-filter" 
                :label="t('common.corporation')"
                :model-value="generalfilter.idCorporation"
                :items="corporations"
                @update:model-value="generalfilter.setCorporation" 
              />
            </VCol>
            <VCol cols="12" sm="6" md="6">
              <VSelect
                prepend-inner-icon="tabler-filter" 
                :label="t('common.circunscription')"
                :model-value="generalfilter.idCircunscription"
                :items="circunscriptions" 
                @update:model-value="generalfilter.setCircunscription"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VAutocomplete
                prepend-inner-icon="tabler-filter"
                :label="t('common.department')"
                filter-mode="some"
                :model-value="generalfilter.idDepartment"
                :items="departments"
                :disabled="disabled || !generalfilter.enableDeparment"
                :rules="rules.departments"
                @update:model-value="generalfilter.setDepartment"
              />
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <VAutocomplete
                prepend-inner-icon="tabler-filter" 
                :label="t('common.municipality')"
                filter-mode="some"
                :model-value="generalfilter.idMunicipality"
                :items="municipalities" 
                :disabled="disabled || !generalfilter.enableMunicipality"
                :rules="rules.municipalities"              
                @update:model-value="generalfilter.setMunicipality"
              />
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <VAutocomplete
                prepend-inner-icon="tabler-filter" 
                :label="t('common.commune')"
                filter-mode="some"
                :model-value="generalfilter.idCommune"
                :items="communes" 
                :disabled="disabled || !generalfilter.enableCommune"
                :rules="rules.communes"
                @update:model-value="generalfilter.setCommune"
              />
            </VCol>
            <VCol cols="12" md="12" class="py-5">
              <VRow justify="center" class="gap-6 py-1">
                <VBtn rounded="pill" type="submit" @click="filterUser">
                  {{ t("list_candidates.search_list") }}
                </VBtn>
                <VBtn color="info" @click="clearForm">
                  {{ t("list_candidates.reset_list") }}
                </VBtn>
              </VRow>
            </VCol>
          </VRow>
        </VRow>
        <VCard :title="t('list_candidates.incidents_found')">
          <VCardTitle>
            <hr>
          </VCardTitle>  
          <VRow>
            <VRow justify="end" class="me-11 mt-5 mb-1">
              <VMenu open-on-hover>
                <template #activator="{ props }">
                  <VBtn v-bind="props" prepend-icon="tabler-table-export" :loading="isExporting">
                    {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
                  </VBtn>
                </template> <VList>
                  <VListItem value="exportXls" @click="exportFile(1)">
                    <VListItemTitle color="white">
                      {{ t('formsPendingApproval.breadcrumbs.bntExcel') }}
                    </VListItemTitle>
                  </VListItem>
                  <VListItem value="exportCsv" @click="exportFile(2)">
                    <VListItemTitle color="white">
                      {{ t('formsPendingApproval.breadcrumbs.bntCSV') }}
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </VRow>
            <VCol cols="12" md="12">
              <DataTableServerSide
                ref="datatable"
                endpoint="/v1/candidates/pending-and-rejected"      
                :params="filters"
                :fields="fields"
              >
                <template #cell(rowField)="{ item, value}">
                  <div v-if="item.corporationId != 1 && item.corporationId != 3" class="text-center">
                    {{ value }}
                  </div>
                  <div v-else />
                </template>
              </DataTableServerSide>
            </VCol>
          </VRow>
        </VCard>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>

<route lang="yaml">
name: "candidates-without-checking"
meta:
  authRequired: true
</route>
