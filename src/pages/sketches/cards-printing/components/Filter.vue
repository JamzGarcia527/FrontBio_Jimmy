<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useI18n } from "vue-i18n"

const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  buttonSearch: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])

const { t } = useI18n()

const filter = ref({
  fileType: -1,
  statusFilter: -1,
})

const statusList = [
  { title: t('common.all_option'), value: -1 },
  { title: 'Sin aprobar', value: 0 },
  { title: 'Aprobados', value: 1 },
]

const fileTypesList = [
  { title: t('common.select_one_option'), value: -1 },
  { title: 'Tarjeta Electoral', value: 0 },
  { title: 'Guía Electoral', value: 1 },
]

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

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  const { statusFilter,  fileType } = filter.value

  emit('search', { ...generalfilter.selected, statusFilter, fileType  })
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
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              :disabled="disabled"
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
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VAutocomplete 
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="disabled || !generalfilter.enableMunicipality"
              @update:model-value="generalfilter.setMunicipality" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VSelect 
              v-model="filter.statusFilter"
              :label="t('cards_printing.filter.status')"
              clearable
              :disabled="generalfilter.idCorporation == -1 || generalfilter.idCorporation == null"
              :items="statusList"
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              v-model="filter.fileType"
              :label="t('cards_printing.filter.fileType')"
              clearable 
              :disabled="generalfilter.idCorporation == -1 || generalfilter.idCorporation == null"
              :items="fileTypesList"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText v-if="!disabled || loading" class="d-flex justify-center gap-4">
        <VBtn :loading="loading" type="submit">
          {{ t('common.search') }}
        </VBtn>
        <VBtn color="secondary" type="reset">
          {{ t('common.btn_cancelar') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
