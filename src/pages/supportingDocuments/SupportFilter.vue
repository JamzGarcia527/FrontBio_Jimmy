<script setup>
import axios from '@/plugins/axios'
import { useI18n } from "vue-i18n"
import { useGeneralFilter } from "@/stores/generalfilter"
import { onMounted } from 'vue'

// Definición e inicialización de variables
const emit = defineEmits(['search'])
const { t } = useI18n()
const generalfilter = useGeneralFilter()

const formFilter = ref({})

// Funciones o métodos
generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => { 
  return [ { title: t('common.all_option'), value: -1 }, ...array]
}

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

  return addOptionDefault(array)
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

// Get supporting types

const supportingTypes = ref([{ title: t('common.select_one_option'), value: -1 }])

const getSupportingType = () => {
  axios.get('/v1/supporting-type').then(({ data }) => {
    const items = data.map(e => {
      return { title: e.name, value: e.id }
    })

    supportingTypes.value = [
      { title: t('common.select_one_option'), value: -1 },
      ...items,
    ]
  })
}

const handlerSupportFilter = () => {
  emit('search', {
    "groupingPoliticalTypeId": generalfilter.idGroupingPoliticalType,
    "groupingPoliticalId": generalfilter.idGroupingPolitical,
    "corporationId": generalfilter.idCorporation,
    "circunscriptionId": generalfilter.idCircunscription,
    "departmentId": generalfilter.idDepartment,
    "municipalityId": generalfilter.idMunicipality,
    "supportTypeId": generalfilter.idCommune,
    ...formFilter.value,
  })
}

const clearForm = () => {
  generalfilter.selected = {},
  formFilter.value = {}
}

onMounted(() => {
  getSupportingType()
})
</script>

<template>
  <div>
    <VCard flat class="mb-2">
      <VCardText>
        <VForm ref="refForm" class="mt-2">
          <VRow>
            <VCol
              md="4"
              cols="12"
            >
              <VSelect 
                :label="t('common.grouping_political_type')"
                :model-value="generalfilter.idGroupingPoliticalType"
                :items="groupingPoliticalTypes" 
                :disabled="disabled"
                clearable
                @update:model-value="generalfilter.setGroupingPoliticalType" 
              />
            </VCol>

            <VCol
              md="4"
              cols="12"
            >
              <VSelect 
                :label="t('common.grouping_political_name')"
                :model-value="generalfilter.idGroupingPolitical"
                :items="groupingPoliticals" 
                :disabled="disabled"
                clearable
                @update:model-value="generalfilter.setGroupingPolitical" 
              />
            </VCol>

            <VCol
              md="4"
              cols="12"
            >
              <VSelect 
                :label="t('common.corporation')"
                :model-value="generalfilter.idCorporation"
                :items="corporations" 
                :disabled="disabled"
                clearable
                @update:model-value="generalfilter.setCorporation" 
              />
            </VCol>
            <VCol
              md="3"
              cols="12"
            >
              <VSelect 
                :label="t('common.circunscription')"
                :model-value="generalfilter.idCircunscription"
                :items="circunscriptions" 
                :disabled="disabled"
                clearable
                @update:model-value="generalfilter.setCircunscription" 
              />
            </VCol>

            <VCol
              md="3"
              cols="12"
            >
              <VAutocomplete 
                :label="t('common.department')"
                filter-mode="some"
                :model-value="generalfilter.idDepartment"
                :items="departments"
                clearable
                :disabled="disabled || !generalfilter.enableDeparment"
                @update:model-value="generalfilter.setDepartment" 
              />
            </VCol>

            <VCol
              md="3"
              cols="12"
            >
              <VAutocomplete 
                :label="t('common.municipality')"
                filter-mode="some"
                :model-value="generalfilter.idMunicipality"
                :items="municipalities" 
                clearable
                :disabled="disabled || !generalfilter.enableMunicipality"
                @update:model-value="generalfilter.setMunicipality" 
              />
            </VCol>

            <VCol
              md="3"
              cols="12"
            >
              <VSelect
                v-model="formFilter.supportTypeId"
                :items="supportingTypes"
                prepend-inner-icon="tabler-filter" y
                clearable
                :label="t('supportingDocuments.supportFilter.support_type')"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardText class="d-flex gap-4">
        <VBtn @click="handlerSupportFilter">
          {{ t('supportingDocuments.supportFilter.search') }}
        </VBtn>
        <VBtn color="secondary" variant="tonal" @click="clearForm">
          {{ t('supportingDocuments.supportFilter.clear') }}
        </VBtn>
      </VCardText>
    </VCard>
  </div>
</template>
