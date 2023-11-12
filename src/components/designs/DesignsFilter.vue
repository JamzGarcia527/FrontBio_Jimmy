<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { computed } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  enableRequired: { type: Boolean, default: false },
  textButton: { type: String, default: "Buscar" },
})

const emit = defineEmits(['search'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()

const defaultOptions = computed(() => t('common.all_option'))

const fileTypesList = computed(() => ([
  { title:  t('common.select_one_option'), value: -1 },
  { title: 'Tarjeta Electoral', value: 1 },
  { title: 'Guía Electoral', value: 2 },
]))

const type = ref(-1)

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: defaultOptions.value, value: -1 }, ...array]
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

  return addOptionDefault(array)
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const rules = reactive({
  types: [requiredEspecialSelectValidator],
})

const form = ref(null)

const handlerNext = async () => {
  if (props.enableRequired) {
    const { valid } = await form.value.validate()

    if (!valid) return false
  }

  const { corporationId, circunscriptionId, department, municipality, commune  } = generalfilter.selected

  emit('search', { corporationId, circunscriptionId, department, municipality, commune, type: type.value ?? -1 })
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              :disabled="disabled"
              @update:model-value="generalfilter.setCircunscription" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <VSelect 
              v-model="type"
              :label="t('design_list_reject.filter.fileType')"
              :items="fileTypesList"
              :rules="rules.types"
              :disabled="disabled"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" md="4">
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
      </VCardText>
      <VCardText v-if="!disabled || loading" class="text-center">
        <VBtn :loading="loading" type="submit">
          {{ textButton }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
