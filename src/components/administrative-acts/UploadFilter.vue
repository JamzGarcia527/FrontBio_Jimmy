<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useI18n } from "vue-i18n"
import { requiredEspecialSelectValidator, requiredValidator } from "@/utils/validators"

defineProps({
  title: { type: String, default: null },
  loading: { type: Boolean, default: false },
  textButton: { type: String, default: "Buscar" },
})

const emit = defineEmits(['search', 'resetFilter'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()
const inlineRadio = ref(null)
const buttonSearchIsVisible = ref(true)
const inlineRadioDisabled1 = ref(false)
const inlineRadioDisabled2 = ref(false)
const inlineRadioDisabled3 = ref(false)
const isRadioSelected = ref(false)
const disabled = ref(false)

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

const form = ref(null)

const rules = reactive({
  groupingPoliticalTypes: [requiredEspecialSelectValidator],
  groupingPoliticals: [requiredEspecialSelectValidator],
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
  inlineRadio: [value => {
    isRadioSelected.value = value !== null

    return value !== null || 'Este campo es requerido'
  }],
})


const handlerNext = async () => {

  const { valid } = await form.value.validate()
  if (!valid) return false
  
  buttonSearchIsVisible.value = false
  disabled.value = true

  const value = inlineRadio.value

  inlineRadioDisabled1.value = value !== 1
  inlineRadioDisabled2.value = value !== 2
  inlineRadioDisabled3.value = value !== 3

  emit('search', { ...generalfilter.selected, action: inlineRadio.value })
}

const handlerReset = () => {
  generalfilter.initSelected()
  inlineRadio.value = null
  buttonSearchIsVisible.value = true;
  [inlineRadioDisabled1.value, inlineRadioDisabled2.value, inlineRadioDisabled3.value] = [false, false, false]
  disabled.value = false
  emit('resetFilter', false)
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VSelect 
              :label="t('common.grouping_political_type')"
              :model-value="generalfilter.idGroupingPoliticalType"
              :items="groupingPoliticalTypes" 
              :disabled="disabled"
              :rules="rules.groupingPoliticalTypes"
              @update:model-value="generalfilter.setGroupingPoliticalType" 
            />
          </VCol>
          <VCol cols="12" md="6">
            <VAutocomplete 
              :label="t('common.grouping_political_name')"
              :model-value="generalfilter.idGroupingPolitical"
              :items="groupingPoliticals" 
              :disabled="disabled"
              :rules="rules.groupingPoliticals"
              @update:model-value="generalfilter.setGroupingPolitical" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              :rules="rules.corporations"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" md="6 ">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              :disabled="disabled"
              :rules="rules.circunscriptions"
              @update:model-value="generalfilter.setCircunscription" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VAutocomplete 
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
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="disabled || !generalfilter.enableMunicipality"
              :rules="rules.municipalities"
              @update:model-value="generalfilter.setMunicipality" 
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" md="6">
            <VAutocomplete 
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
            <VRadioGroup
              v-model="inlineRadio"
              inline
              :rules="rules.inlineRadio"
            >
              <VRadio
                label="Revocar"
                :value="1"
                :disabled="inlineRadioDisabled1"
              />
              <VRadio
                label="Retirar"
                :value="2"
                :disabled="inlineRadioDisabled2"
              />
              <VRadio
                label="Agregar"
                :value="3"
                :disabled="inlineRadioDisabled3"
              />
            </VRadioGroup>
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="text-center">
        <VBtn v-if="buttonSearchIsVisible" :loading="loading" type="submit">
          {{ textButton }}
        </VBtn>
        <VBtn v-if="!buttonSearchIsVisible" color="secondary" @click="handlerReset">
          Limpiar
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
