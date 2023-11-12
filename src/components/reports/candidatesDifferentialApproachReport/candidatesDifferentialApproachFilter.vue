<script setup>
import { useI18n } from "vue-i18n"
import { useGeneralFilter } from "@/stores/generalfilter"
import axios from "@/plugins/axios"


const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])

const itemsData = ref([])

const { t } = useI18n()
const generalfilter = useGeneralFilter()
const form = ref(null)

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const filter = ref({
  focus: -1,
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

const departments = computed(() => {
  const array = generalfilter
    .departments
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})


const categoryApproachDifferenceSearch = async () => {
  try{
    const { data } = await axios.get('/v1/differential-focus/category')

    itemsData.value = data
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data
      
      //console.log(message)      
    }
  }
}


const categoryApproachDifference = computed(() => {

  const array = itemsData.value.map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})


const handlerSearchFilter = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false
  
  emit('search', { ...generalfilter.selected,...filter.value, valid  })
  
}

onMounted(() => {
  categoryApproachDifferenceSearch()
})
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerSearchFilter">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" sm="6" md="4">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="disabled || !generalfilter.enableDeparment"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              v-model="filter.focus"
              :label="t('module_reports.candidatesDifferentialApproach.categoryApproachDifference')"
              filter-mode="some"
              :items="categoryApproachDifference" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2" />
      </VCardText>
      <VCardText class="d-flex justify-center gap-4">
        <VBtn :loading="loading" :disabled="disabled" type="submit">
          {{ t('common.search') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
