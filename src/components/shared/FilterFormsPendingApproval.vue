<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
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
    .map(e => ({ title: e.id+" - "+e.name, value: e.id }))

  return addOptionDefault(array)
})

const inscriptionTypes = computed(() => {
  const array = generalfilter
    .inscriptionTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  emit('next', { ...generalfilter.selected })
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="4">
            <VSelect 
              :label="t('common.grouping_political_type')"
              :model-value="generalfilter.idGroupingPoliticalType"
              :items="groupingPoliticalTypes" 
              @update:model-value="generalfilter.setGroupingPoliticalType" 
            />
          </VCol>
          <VCol cols="12" md="4">
            <VAutocomplete 
              :label="t('common.grouping_political_name')"
              :model-value="generalfilter.idGroupingPolitical"
              :items="groupingPoliticals" 
              @update:model-value="generalfilter.setGroupingPolitical" 
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect 
              :label="t('common.inscription_type')"
              :model-value="generalfilter.idInscriptionType"
              :items="inscriptionTypes" 
              @update:model-value="generalfilter.setInscriptionType" 
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
