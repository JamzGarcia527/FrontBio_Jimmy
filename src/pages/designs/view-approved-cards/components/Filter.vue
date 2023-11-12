<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import { useI18n } from "vue-i18n"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { onMounted } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  buttonSearch: { type: Boolean, default: false },
})

const emit = defineEmits(['search', 'clearForm'])

const { t } = useI18n()

const filter = ref({
  fileType: -1,
  statusFilter: -2,
})

const fileTypesList = [
  { title: t('common.select_one_option'), value: -1 },
  { title: 'Tarjeta Electoral', value: 1 },
  { title: 'Guía Electoral', value: 2 },
]

const hiddeTable = ref(false)
const corporationLevel = ref('')
const allowedCircunscriptions = ref([])
const corporationItems = ref([])
const generalfilter = useGeneralFilter()
const generalfilterComposable = useGeneralFilterComposable()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.all_option'), value: -1 }, ...array]
}

const corporations = computed(() => {
  return addOptionDefault(corporationItems.value.map(e => ({ value: e.id, title: e.name })))
})

const corporationMin = computed(() => {
  const array = generalfilter
    .corporations
    .map(e => e.id)
  
  
  return Math.min( ...array)
})

corporationMin.value

const circunscriptions = computed(() => {
  const { circunscriptions } = generalfilter
  const currentCorporation = corporationItems.value.find(c => c.id === generalfilter.idCorporation)
  const allowedCircunscriptions = currentCorporation?.circunscriptions || []

  const array = circunscriptions
    .filter(c => allowedCircunscriptions.includes(c.id))
    .map(e => ({ value: e.id, title: e.name }))

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

  return [{ title: t('common.all_option'), value: -2 }, { title: t('common.all_option'), value: -1 }, ...array ]
})

const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.all_option'), value: -2 }, { title: t('common.all_option'), value: -1 }, ...array ]
})

const rules = reactive({
  corporations: [],
  circunscriptions: [],
  departments: [],
  municipalities: [],
  communes: [],
  fileTypesList: [requiredEspecialSelectValidator],
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  const { statusFilter,  fileType } = filter.value

  emit('search', { ...generalfilter.selected, statusFilter, fileType, valid })
}

const getCorporationAll  = () => {
  generalfilterComposable.getCorporationsFromApi().then(data => {
    corporationItems.value = data.map(e => ({ title: e.name, value: Number(e.id) }))
    if (Array.isArray(data) && data.length > 0) {
      corporationItems.value = data
        .filter(e => e.id >= corporationMin.value)
    }
  })
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

const clearFormFilter = () => {
  generalfilter.initSelected()
  filter.value = {
    fileType: -1,
    statusFilter: -2,
  }
  emit('clearForm', { hiddeTable:  hiddeTable.value })

}

onMounted(() => {
  getCorporationAll()
})
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
              :rules="rules.corporations"
              @update:model-value="handlerChangeCorporation"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              :disabled="disabled"
              :rules="rules.circunscriptions"
              @update:model-value="generalfilter.setCircunscription" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol cols="12" md="3">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="disabled || !enableDeparment"
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
              :disabled="disabled || !enableMunicipality" 
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
              :disabled="disabled || !enableCommune"
              :rules="rules.communes"
              @update:model-value="generalfilter.setCommune" 
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect 
              v-model="filter.fileType"
              :label="t('design_list_reject.filter.fileType')"
              clearable 
              :items="fileTypesList"
              :item-title="title"
              :item-value="value"
              :rules="rules.fileTypesList"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText v-if="!disabled || loading" class="d-flex justify-center gap-4">
        <VBtn :loading="loading" type="submit">
          {{ t('common.search') }}
        </VBtn>
        <VBtn color="secondary" @click="clearFormFilter">
          {{ t('common.btn_cancelar') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
