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
  { title: 'PENDIENTE', value: 0 },
  { title: 'APROBADO', value: 1 },
  { title: 'DEVUELTO', value: 2 },
  { title: 'ENVIADO A IMPRESIÓN', value: 3 },
]

const fileTypesList = [
  { title: t('common.all_option'), value: -1 },
  { title: 'TARJETA ELECTORAL', value: 1 },
  { title: 'GUÍA ELECTORAL', value: 2 },
]

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

  return [{ title: t('common.all_option'), value: -1 }, ...array ]
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.all_option'), value: -1 }, ...array ]
})

const form = ref(null)

const handlerReset = () => {
  generalfilter.initSelected()
  filter.value = {
    fileType: -1,
    statusFilter: -1,
  }
}

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
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VAutocomplete 
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
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
              :items="statusList"
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              v-model="filter.fileType"
              :label="t('cards_printing.filter.fileType')"
              clearable
              :items="fileTypesList"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText v-if="!disabled || loading" class="d-flex justify-center gap-4">
        <VBtn :loading="loading" type="submit">
          {{ t('common.search') }}
        </VBtn>
        <VBtn color="secondary" @click.prevent="handlerReset">
          {{ t('common.btn_cancelar') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
