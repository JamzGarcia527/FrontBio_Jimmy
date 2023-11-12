<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useI18n } from "vue-i18n"
import { requiredEspecialSelectValidator, requiredValidator } from "@/utils/validators"

const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])
const description = ref(null)
const phase = ref(-1)
const { t } = useI18n()

const phasesList = [
  { title: t('common.select_one_option'), value: -1 },
  { title: 'ETAPA E6', value: 1 },
  { title: 'ETAPA E7', value: 2 },
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

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter.groupingPoliticalTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const blankVotePromoterOptions = computed(() => {
  const array = [{ title: 'Sí', value: 1 },{ title: 'No', value: 0 }]
  
  return addOptionDefault(array)
})

const rules = reactive({
  corporations: [requiredEspecialSelectValidator],
  groupingPoliticalTypeId: [value => {
    if (groupingPoliticalTypes === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],

  isBlankVotePromote: [value => {
    if (blankVotePromoterOptions === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  phase: [value => {
    if (phase == null) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false


  const { idGroupingPoliticalType, idCorporation, isBlankVotePromote } = generalfilter

  emit('search', { idGroupingPoliticalType, idCorporation, isBlankVotePromote, description: description.value, phase: phase.value, valid  })
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VSelect 
              v-model="phase"
              label="Etapa del proceso"
              :items="phasesList" 
              :disabled="disabled"
              :rules="rules.phase"
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
        </VRow>
        <VRow>
          <VCol cols="12" md="6">
            <VSelect 
              :model-value="generalfilter.idGroupingPoliticalType"
              :label="t('user.groupingPoliticalTypes')"
              :rules="rules.groupingPoliticalTypeId"
              :disabled="disabled"
              :items="groupingPoliticalTypes"
              @update:model-value="generalfilter.setGroupingPoliticalType" 
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect 
              v-col
              :label="t('common.blank_vote_promoter')"
              :model-value="generalfilter.isBlankVotePromote" 
              :items="blankVotePromoterOptions"
              :disabled="disabled"
              :rules="rules.isBlankVotePromote"
              @update:model-value="generalfilter.setBlankVotePromoter"
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol cols="12" md="12">
            <VTextField 
              v-model="description"
              :disabled="disabled"
              label="Descripción"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="d-flex justify-center gap-4">
        <VBtn :loading="loading" :disabled="disabled" type="submit">
          {{ t('common.consult') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
