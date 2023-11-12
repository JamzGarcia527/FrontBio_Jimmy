<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator, dateValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import { reactive } from "vue"



const props = defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()
const form = ref(null)

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.all_option'), value: -1 }, ...array]
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

  return [{ title: t('common.all_option'), value: -1 }, ...array ]
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.all_option'), value: -1 }, ...array ]
})

const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.all_option'), value: -1 }, ...array ]
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

const formData = ref({  
  dateInitial:null,
  dateFinal: null,
})

const rules = reactive({
  dateInitial:  [requiredEspecialSelectValidator, dateValidator],
  dateFinal:  [requiredEspecialSelectValidator, dateValidator],
})

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  const { ...result } = formData.value


  emit('search', { ...generalfilter.selected, ...result })
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" sm="6" md="5">
            <VSelect 
              :label="t('common.grouping_political_type')"
              :model-value="generalfilter.idGroupingPoliticalType"
              :items="groupingPoliticalTypes" 
              :disabled="disabled"
              @update:model-value="generalfilter.setGroupingPoliticalType" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="7">
            <VAutocomplete 
              :label="t('common.grouping_political_name')"
              :model-value="generalfilter.idGroupingPolitical"
              :items="groupingPoliticals" 
              :disabled="disabled"
              @update:model-value="generalfilter.setGroupingPolitical" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol cols="12" sm="6">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              :disabled="disabled"
              @update:model-value="generalfilter.setCircunscription" 
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="disabled || !generalfilter.enableDeparment"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="disabled || !generalfilter.enableMunicipality"
              @update:model-value="generalfilter.setMunicipality" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.commune')"
              filter-mode="some"
              :model-value="generalfilter.idCommune"
              :items="communes" 
              :disabled="disabled || !generalfilter.enableCommune"
              @update:model-value="generalfilter.setCommune" 
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="formData.dateInitial"
              type="date"
              :label="t('securityPolicy.startDate')"
              class="mt-4"
              :rules="rules.dateInitial"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="formData.dateFinal"
              type="date"
              :label="t('securityPolicy.endingDate')"
              class="mt-4"
              :rules="rules.dateFinal"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText v-if="!disabled || loading" class="text-center">
        <VBtn :loading="loading" type="submit">
          {{ t('common.search') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
