<script setup>
import { useI18n } from "vue-i18n"
import { useGeneralFilter } from "@/stores/generalfilter"
import DataTableSearch from "@/components/shared/DataTableSearch.vue"
import { requiredEspecialSelectValidator } from "@/utils/validators"

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
})

// Translate i18n
const { t } = useI18n()
const generalfilter = useGeneralFilter()
const filters = ref({})
const nameColumn = ref('groupingPolitical')

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "corporation", label: t('list_candidates.grouping_political_type') },
  { key: "circunscription", label: t('list_candidates.grouping_political_name') },
  { key: "groupingPoliticalType", label: t('list_candidates.departament') },
  { key: "groupingPolitical", label: t('list_candidates.municipality') },
  { key: 'commune', label: t('list_candidates.commune') },
  { key: "candidateDni", label: t('list_candidates.corporation') },
  { key: "names", label: t('list_candidates.circunscription') },
  { key: "surnames", label: t('candidate_uploaded_photos_report.number_registered_candidates') },
  { key: "surnames", label: t('candidate_uploaded_photos_report.uploaded_photos') },
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
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ t('candidate_uploaded_photos_report.breadcrumbs.title'), t('candidate_uploaded_photos_report.breadcrumbs.item_one') ]" />
      <VCard :title="t('candidate_uploaded_photos_report.breadcrumbs.item_one')">
        <VCardTitle>
          <hr>
        </VCardTitle>
        <VRow>
          <VRow class="pa-12 py-11">
            <VCol cols="12" md="6">
              <VSelect
                clearable
                prepend-inner-icon="tabler-filter" 
                :label="t('common.corporation')"
                :model-value="generalfilter.idCorporation"
                :items="corporations"
                @update:model-value="generalfilter.setCorporation" 
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                prepend-inner-icon="tabler-filter" 
                :label="t('common.circunscription')"
                :model-value="generalfilter.idCircunscription"
                :items="circunscriptions" 
                @update:model-value="generalfilter.setCircunscription"
              />
            </VCol>
            <VCol cols="12" md="6">
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
            <VCol cols="12" md="6">
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
            <VCol cols="12" md="6">
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
              <VSelect
                prepend-inner-icon="tabler-filter" 
                :label="t('common.grouping_political_name')"
                :model-value="generalfilter.idGroupingPolitical"
                :items="groupingPoliticals"
                @update:model-value="generalfilter.setGroupingPolitical"
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
          <VRow justify="end" class="me-8 mt-3 mb-1">
            <VMenu open-on-hover>
              <template #activator="{ props }">
                <VBtn v-bind="props">
                  {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
                </VBtn>
              </template> <VList>
                <VListItem value="exportCsv">
                  <template #prepend>
                    <VIcon size="22" class="me-3" icon="la-file-csv" />
                  </template> <VListItemTitle color="white">
                    {{ t('formsPendingApproval.breadcrumbs.bntCSV') }}
                  </VListItemTitle>
                </VListItem> <VListItem value="exportXls">
                  <template #prepend>
                    <VIcon size="22" class="me-3" icon="la-file-excel" />
                  </template> <VListItemTitle color="white">
                    {{ t('formsPendingApproval.breadcrumbs.bntExcel') }}
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VRow>      
          <DataTableSearch                 
            endpoint="/v1/candidates/pending-and-rejected" 
            :params="filters" 
            :fields="fields"
            :name-column-search="nameColumn"
          />
        </VCard>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>
