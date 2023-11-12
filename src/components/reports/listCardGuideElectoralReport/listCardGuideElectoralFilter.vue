<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()

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

  return addOptionDefault(array)
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  emit('search', { ...generalfilter.selected })
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              :disabled="disabled"
              @update:model-value="generalfilter.setCircunscription" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.department')"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="disabled || !generalfilter.enableDeparment"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.municipality')"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="disabled || !generalfilter.enableMunicipality"
              @update:model-value="generalfilter.setMunicipality" 
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
