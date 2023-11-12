<script setup>
import { useI18n } from "vue-i18n"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useGeneralFilter } from "@/stores/generalfilter"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"

import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
})

//Graphic

// Translate i18n
const { t } = useI18n()
const generalfilter = useGeneralFilter()

const vuetifyTheme = useTheme()
const currentTab = ref(0)
const refVueApexChart = ref()

const chartConfigs = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables
  const labelPrimaryColor = `rgba(${ hexToRgb(currentTheme.primary) },${ variableTheme['dragged-opacity'] })`
  const legendColor = `rgba(${ hexToRgb(currentTheme['on-background']) },${ variableTheme['high-emphasis-opacity'] })`
  const borderColor = `rgba(${ hexToRgb(String(variableTheme['border-color'])) },${ variableTheme['border-opacity'] })`
  const labelColor = `rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity)) !important;`
  
  return [
    {     
      chartOptions: {
        chart: {
          parentHeightOffset: 0,
          type: 'bar',
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            columnWidth: '32%',
            startingShape: 'rounded',
            borderRadius: 4,
            distributed: true,
            dataLabels: { position: 'top' },
          },
        },
        grid: {
          show: false,
          padding: {
            top: 0,
            bottom: 0,
            left: -10,
            right: -10,
          },
        },
        colors: [
          labelPrimaryColor,
          labelPrimaryColor,
          currentTheme.primary,
          labelPrimaryColor,
          labelPrimaryColor,
          labelPrimaryColor,
          labelPrimaryColor,
          labelPrimaryColor,
          labelPrimaryColor,
        ],
        dataLabels: {
          enabled: true,
          formatter(val) {
            return `${ val }k`
          },
          offsetY: -25,
          style: {
            fontSize: '15px',
            colors: [legendColor],
            fontWeight: '600',
          },
        },
        legend: { show: false },
        tooltip: { enabled: false },
        xaxis: {
          categories: [
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
          axisBorder: {
            show: false,
            color: borderColor,
          },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: labelColor,
              fontSize: '14px',
            },
          },
        },
        yaxis: {
          labels: {
            offsetX: -15,
            formatter(val) {
              return `${ parseInt(val / 1) }k`
            },
            style: {
              fontSize: '12px',
              colors: labelColor,
            },
            min: 0,
            max: 60000,
            tickAmount: 6,
          },
        },
        responsive: [
          {
            breakpoint: 1441,
            options: { plotOptions: { bar: { columnWidth: '41%' } } },
          },
          {
            breakpoint: 590,
            options: {
              plotOptions: { bar: { columnWidth: '61%' } },
              yaxis: { labels: { show: false } },
              grid: {
                padding: {
                  right: 0,
                  left: -20,
                },
              },
              dataLabels: {
                style: {
                  fontSize: '12px',
                  fontWeight: '400',
                },
              },
            },
          },
        ],
      },
      series: [{
        data: [
          28,
          10,
          1000,
          38,
          1000,
          30,
          35,
          10,
          8,
        ],
      }],
    },
  ]
})

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

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "corporation", label: t('list_candidates.corporation') },
  { key: "circunscription", label: t('list_candidates.circunscription') },
  { key: 'department', label: t('list_candidates.departament') },
  { key: "municipality", label: t('list_candidates.municipality') },
  { key: 'commune', label: t('list_candidates.commune') },
])
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ t('candidate_by_age.breadcrumbs.title'), t('candidate_by_age.breadcrumbs.item_one') ]" />
      <VCard :title="t('candidate_by_age.breadcrumbs.item_one')">
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
              <VSelect
                prepend-inner-icon="tabler-filter" 
                :label="t('candidate_by_age.range_by_age')"
              />
            </VCol>
          </VRow>
        </VRow>
        <VCard :title="t('list_candidates.incidents_found')">
          <VCardTitle>
            <hr>
          </VCardTitle>  
          <VRow>
            <VCol cols="12" md="12" class="px-12">
              <VCard :title="t('candidate_by_age.title_chart')">
                <VueApexCharts
                  ref="refVueApexChart"
                  :key="currentTab"
                  :options="chartConfigs[Number(currentTab)].chartOptions"
                  :series="chartConfigs[Number(currentTab)].series"
                  height="390"
                  class="mt-3"
                />
              </VCard>
            </VCol>
            <VRow justify="end" class="me-11 mt-5 mb-1">
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
            <VCol cols="12" md="12">
              <DataTableServerSide
                ref="datatable"
                endpoint="/v1/candidates/pending-and-rejected"      
                :params="filters"
                :fields="fields"
              />
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
