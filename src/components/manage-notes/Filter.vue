<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useI18n } from "vue-i18n"
import { requiredEspecialSelectValidator } from "@/utils/validators"

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  textButton: { type: String, default: "Consultar" },
})

const emit = defineEmits(['search'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()

const formFilter = ref({
  phaseId: -1,
})

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

const blankVotePromoterOptions = computed(() => {
  const array = [{ title: 'Sí', value: 1 },{ title: 'No', value: 0 }]
  
  return addOptionDefault(array)
})

const phases = computed(() => {
  const array = [{ title: 'E6', value: 1 }, { title: 'E7', value: 2 }]
  
  return addOptionDefault(array)
})

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .groupingPoliticalTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const rules = reactive({
  corporations: [requiredEspecialSelectValidator],
  circunscriptions: [requiredEspecialSelectValidator],
  isBlankVotePromote: [requiredEspecialSelectValidator],
  groupingPoliticalTypes: [requiredEspecialSelectValidator],
  phases: [requiredEspecialSelectValidator],
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  const { phaseId } = formFilter.value

  emit('search', { ...generalfilter.selected, phaseId, valid })
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
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              :rules="rules.corporations"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              :disabled="disabled"
              :rules="rules.circunscriptions"
              @update:model-value="generalfilter.setCircunscription" 
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect 
              :label="t('common.blank_vote_promoter')"
              :model-value="generalfilter.isBlankVotePromote"
              :items="blankVotePromoterOptions" 
              :disabled="disabled"
              :rules="rules.isBlankVotePromote"
              @update:model-value="generalfilter.setBlankVotePromoter" 
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect 
              v-model="formFilter.phaseId"
              label="Etapa"
              :items="phases"
              :disabled="disabled"
              :rules="rules.phases"
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
