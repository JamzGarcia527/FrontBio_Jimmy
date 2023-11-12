<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import { useUserConfigStore } from '@/stores/userconfig'

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])
const userConfig = useUserConfigStore()
const { t } = useI18n()
const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const corporationMin = computed(() => {
  const array = generalfilter
    .corporations
    .map(e => e.id)

  return Math.min( ...array)
})

const corporationLevel = ref('')
const allowedCircunscriptions = ref([])
const corporationItems = ref([])

const corporations = computed(() => {
  return addOptionDefault(corporationItems.value.map(e => ({ value: e.id, title: e.name })))
})

const circunscriptions = computed(() => {
  const array = generalfilter.circunscriptions
    .filter(e => allowedCircunscriptions.value.includes(e.id))
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
  if(userConfig.userData.role === 'Dirección de Censo Electoral'){
    const array = generalfilter
      .groupingPoliticalTypes
      .filter(e => e.id != 4)
      .filter(e => e.id != 1)
      .map(e => ({ title: e.name, value: e.id }))

    
    return addOptionDefault(array)
  }else{
    const array = generalfilter
      .groupingPoliticalTypes
      .map(e => ({ title: e.name, value: e.id }))

    
    return addOptionDefault(array)
  }
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

  emit('search', { ...generalfilter.selected })
}

const getCorporationAll  = async () => {
  try {
    const { data } = await axios.get(`/filters/user-data/all-corporations`)

    if (Array.isArray(data) && data.length > 0) {
      corporationItems.value = data
        .filter(e => e.id >= corporationMin.value)    }
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data
    }
  }
}


const handlerChangeCorporation  = payload  => {
  const corp = corporationItems.value.find(e => e.id === payload)

  const array = corp && corp.circunscriptions 
    ? JSON.parse(corp.circunscriptions) : [-1]
      
  const value = array[0]

  corporationLevel.value = corp?.level
  allowedCircunscriptions.value = array  
  generalfilter.setCorporation(payload)
  generalfilter.setCircunscription(value)
  generalfilter.setDepartment(-1)
}


const enableDeparment = computed(() => {
  const enableLevels = ['DE', 'MU', 'CO']
  
  return enableLevels.includes(corporationLevel.value)
})

const enableMunicipality = computed(() => {
  const enableLevels = ['MU', 'CO']
  
  return enableLevels.includes(corporationLevel.value)
})

const enableCommune = computed(() => {
  const enableLevels = ['CO']
  
  return enableLevels.includes(corporationLevel.value)
})

onMounted(() => {

  getCorporationAll()
})
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.grouping_political_type')"
              :model-value="generalfilter.idGroupingPoliticalType"
              :items="groupingPoliticalTypes" 
              @update:model-value="generalfilter.setGroupingPoliticalType" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.grouping_political_name')"
              :model-value="generalfilter.idGroupingPolitical"
              :items="groupingPoliticals" 
              @update:model-value="generalfilter.setGroupingPolitical" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.blank_vote_promoter')"
              :model-value="generalfilter.isBlankVotePromote"
              :items="blankVotePromoterOptions" 
              :disabled="disabled"
              @update:model-value="generalfilter.setBlankVotePromoter" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              @update:model-value="handlerChangeCorporation" 
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
              :disabled="disabled || !enableDeparment"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect
              :label="t('common.municipality')"
              :model-value="generalfilter.idMunicipality" 
              :items="municipalities"
              :disabled="disabled || !enableMunicipality" 
              @update:model-value="generalfilter.setMunicipality"
            />
          </VCol>
          <VCol cols="12" sm="6" md="6">
            <VSelect 
              :label="t('common.commune')"
              :model-value="generalfilter.idCommune"
              :items="communes" 
              :disabled="disabled || !enableCommune"
              @update:model-value="generalfilter.setCommune" 
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText v-if="!disabled || loading" class="text-center">
        <VBtn :loading="loading" type="submit">
          {{ t('OMD.group_political.btnView') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
