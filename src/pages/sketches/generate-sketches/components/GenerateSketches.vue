<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useI18n } from "vue-i18n"
import { requiredEspecialSelectValidator } from "@/utils/validators"

const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['generateSketches'])

const { t } = useI18n()

const generalfilter = useGeneralFilter()

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
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  emit('generateSketches', { ...generalfilter.selected  })
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
              :rules="rules.corporations"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" md="6">
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
          <VCol cols="12" md="4">
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
          <VCol cols="12" md="4">
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
          <VCol cols="12" md="4">
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
        </VRow>
        <VRow class="mb-2" />
      </VCardText>
      <VCardText class="d-flex justify-center gap-4">
        <VBtn :loading="loading" :disabled="disabled" class="notAllowedEmulator" type="submit">
          {{ t('generate_sketches.form.btn_generate') }}
        </VBtn>
        <VBtn :hidden="loading" color="secondary" type="reset">
          {{ t('common.btn_reset') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
