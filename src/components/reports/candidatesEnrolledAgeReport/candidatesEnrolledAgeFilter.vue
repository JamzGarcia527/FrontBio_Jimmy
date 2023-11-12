<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import useEventBus from "@/utils/eventBus"

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])
const { emit: emiting } = useEventBus()
const { t } = useI18n()
const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.all_option'), value: -1 }, ...array]
}


const corporationLevel = ref('')
const allowedCircunscriptions = ref([])
const corporationItems = ref([])
const selectedAge = ref('') 
const selectedObjectAge = ref('')

const selectedOption = ref({
  title: 'Todos',
  value: -1,
})

const AgeRange = [
  {
    title: 'Todos',
    value: -1,
  },
  {
    title: 'Menor de 25 años',
    value: 1,
  },
  {
    title: '25 - 30 años',
    value: 2,
  },
  {
    title: '31 - 35 años',
    value: 3,
  },
  {
    title: '36 - 40 años',
    value: 4,
  },
  {
    title: '41 - 45 años',
    value: 5,
  },
  {
    title: '46 - 50 años',
    value: 6,
  },
  {
    title: '51 - 55 años',
    value: 7,
  },
  {
    title: '56 - 60 años',
    value: 8,
  },
  {
    title: '61 - 65 años',
    value: 9,
  },
  {
    title: '66 - 70 años',
    value: 10,
  },
  {
    title: '71 - 75 años',
    value: 11,
  },
  {
    title: '76 - 80 años',
    value: 12,
  },
  {
    title: 'Mayor de 80 años',
    value: 13,
  },
]

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

const blankVotePromoterOptions = computed(() => {
  const array = [{ title: 'Sí', value: 1 },{ title: 'No', value: 0 }]
  
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

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  
  if(typeof selectedOption.value === 'object' && selectedOption.value !== null){
   
    selectedObjectAge.value ={ age_range:-1 }

  }else{

    selectedObjectAge.value ={ age_range:selectedOption.value }
    
  }
  emit('search', { ...selectedObjectAge.value,  ...generalfilter.selected  })
 
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" sm="6" md="6">
            <VAutocomplete 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>

          <VCol cols="12" sm="6" md="6">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="disabled || !generalfilter.enableDeparment"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
        </VRow>
        <VRow>
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
          <VCol cols="12" sm="6" md="6">
            <VAutocomplete 
              :label="t('common.commune')"
              filter-mode="some"
              :model-value="generalfilter.idCommune"
              :items="communes" 
              :disabled="disabled || !generalfilter.enableCommune"
              @update:model-value="generalfilter.setCommune" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VAutocomplete 
              v-model="selectedOption"
              :label="t('candidates_enrolled_age.letters.age_range')" 
              :model-value="selectedOption"
              :items="AgeRange" 
              item-title="title"
              item-value="value"
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
