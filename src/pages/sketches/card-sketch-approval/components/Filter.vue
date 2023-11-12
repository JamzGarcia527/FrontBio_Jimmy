<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['next'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, { title: t('common.all_option'), value: -2 }, ...array]
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


  return [ { title: "Seleccione o escriba", value: -1 }, { title: t('common.all_option'), value: -2 }, ...array ]

  // return addOptionDefault(array)
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return [ { title: "Seleccione o escriba", value: -1 }, { title: t('common.all_option'), value: -2 }, ...array ]
})

const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  
  return [ { title: "Seleccione o escriba", value: -1 }, { title: t('common.all_option'), value: -2 }, ...array ]
})

const rules = reactive({
  corporations: [requiredEspecialSelectValidator],
  departments: [value => {
    if (generalfilter.idCorporation === -2) return true

    return (value != null && value != -2) || 'Este campo es requerido'
  }],
  municipalities: [value => {
    if (generalfilter.idDepartment === -2 || !generalfilter.enableMunicipality) return true

    return (value != null && value != -2) || 'Este campo es requerido'
  }],
  communes: [value => {
    if (generalfilter.idMunicipality === -2 || !generalfilter.enableCommune) return true

    return (value != null && value != -2) || 'Este campo es requerido'
  }],
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  emit('next', { ...generalfilter.selected, valid })
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="3">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              :rules="rules.corporations"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" md="3">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="generalfilter.idCorporation === -1 || disabled || !generalfilter.enableDeparment && generalfilter.idCorporation !== -2"
              :rules="rules.departments"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
          <VCol cols="12" md="3">
            <VAutocomplete 
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="disabled || !generalfilter.enableMunicipality && generalfilter.idCorporation !== -2"
              :rules="rules.municipalities"
              @update:model-value="generalfilter.setMunicipality" 
            />
          </VCol>
          <VCol cols="12" md="3">
            <VAutocomplete 
              :label="t('common.commune')"
              filter-mode="some"
              :model-value="generalfilter.idCommune"
              :items="communes" 
              :disabled="disabled || !generalfilter.enableCommune && generalfilter.idCorporation !== -2"
              :rules="rules.communes"
              @update:model-value="generalfilter.setCommune" 
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText v-if="!disabled || loading" class="d-flex justify-center gap-2">
        <VBtn :loading="loading" type="submit">
          {{ t('common.search') }}
        </VBtn>
        <VBtn :hidden="loading" color="secondary" type="reset">
          {{ t('common.btn_reset') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>

<style lang="scss">
.v-menu__content {
  inset-block-start: 100px;
}
</style>
