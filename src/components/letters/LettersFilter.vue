<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import { reactive } from "vue"
import axios from "@/plugins/axios"
import { strPad } from "@/utils"

const props = defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()
const generalfilterComposable = useGeneralFilterComposable()

generalfilter.initSelected()
generalfilter.loadFilters()

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const corporationLevel = ref('')
const allowedCircunscriptions = ref([])
const corporationItems = ref([]) 
const departments = ref([{ title: t("common.select_write_option"), value: -1 }])
const municipalities = ref([{ title: t("common.select_write_option"), value: -1 }])
const communes = ref([{ title: t("common.select_write_option"), value: -1 }])

const corporations = computed(() => {
  return addOptionDefault(corporationItems.value.map(e => ({ value: Number(e.id), title: e.name })))
})

const circunscriptions = computed(() => {
  const array = generalfilter.circunscriptions
    .filter(e => allowedCircunscriptions.value.includes(e.id))
    .map(e => ({ title: e.name, value: e.id }))

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

const rules = reactive({
  corporations: [requiredEspecialSelectValidator],
  circunscriptions: [value => {
    if (generalfilter.idCorporation === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  departments: [value => {
    if (generalfilter.idCorporation === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  municipalities: [value => {
    if (generalfilter.idDepartment === -1 || !enableMunicipality.value) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  communes: [value => {
    if (generalfilter.idMunicipality === -1 || !enableCommune.value) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  groupingPoliticalTypes: [requiredEspecialSelectValidator],
  groupingPoliticals: [requiredEspecialSelectValidator],
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  emit('search', { ...generalfilter.selected })
}

const handlerChangeCorporation = payload => {
  const corp = corporationItems.value.find(e => e.id === payload)

  const array = corp && corp.circunscriptions 
    ? JSON.parse(corp.circunscriptions) : [-1]
      
  const value = array[0]

  corporationLevel.value = corp?.level
  allowedCircunscriptions.value = array  
  generalfilter.setCorporation(payload)
  generalfilter.setCircunscription(value)
  generalfilter.setDepartment(-1)

  municipalities.value = [{ title: t("common.select_write_option"), value: -1 }]
  communes.value = [{ title: t("common.select_write_option"), value: -1 }]
}

const handlerChangeDepartment = (value, flag = true) => {
  generalfilter.setDepartment(value)
  if (flag)  {
    generalfilter.setMunicipality(-1)
    generalfilter.setCommune(-1)
  }
  if (value == null || value < 0) {
    municipalities.value = [{ title: t("common.select_write_option"), value: -1 }]
    communes.value = [{ title: t("common.select_write_option"), value: -1 }]
  } else {
    generalfilterComposable
      .getMunicipalitiesFromApi(strPad(value, 2, "0"))
      .then(data => {
        const array = data.map(e => ({ title: e.name, value: Number(e.id) }))

        municipalities.value = [{ title: t('common.select_write_option'), value: -1 }, ...array ]
      })
  }
}

const handlerChangeMunicipality = (department, municipality, flag = true) => {
  generalfilter.setMunicipality(municipality)
  if (flag) {
    generalfilter.setCommune(-1)
  }
  if (municipality == null || municipality < 0) {
    communes.value = [{ title: t("common.select_write_option"), value: -1 }]
  } else {
    generalfilterComposable
      .getCommunesFromApi(`${strPad(department, 2, "0")}${strPad(municipality, 3, "0")}`)
      .then(data => {
        const array = data.map(e => ({ title: e.name, value: Number(e.id) }))

        communes.value = [{ title: t('common.select_write_option'), value: -1 }, ...array ]
      })
  }
}

onMounted(() => {
  axios.get('/filters/user-data/all-corporations?all=1')
    .then(({ data }) => corporationItems.value = data)

  generalfilterComposable
    .getDepartmentsFromApi()
    .then(data => {
      const array = data.map(e => ({ title: e.name, value: Number(e.id) }))

      departments.value = [{ title: t('common.select_write_option'), value: -1 }, ...array ]
    })
})
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" sm="6" md="5">
            <VSelect 
              :label="t('common.grouping_political_type')"
              :model-value="generalfilter.idGroupingPoliticalType"
              :items="groupingPoliticalTypes" 
              :disabled="disabled"
              :rules="rules.groupingPoliticalTypes"
              @update:model-value="generalfilter.setGroupingPoliticalType" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="7">
            <VAutocomplete 
              :label="t('common.grouping_political_name')"
              :model-value="generalfilter.idGroupingPolitical"
              :items="groupingPoliticals" 
              :disabled="disabled"
              :rules="rules.groupingPoliticals"
              @update:model-value="generalfilter.setGroupingPolitical" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol cols="12" sm="6">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="disabled"
              :rules="rules.corporations"
              @update:model-value="handlerChangeCorporation" 
            />
          </VCol>
          <VCol cols="12" sm="6">
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
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="disabled || !enableDeparment"
              :rules="rules.departments"
              @update:model-value="handlerChangeDepartment" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="disabled || !enableMunicipality"
              :rules="rules.municipalities"
              @update:model-value="$event => handlerChangeMunicipality(generalfilter.idDepartment, $event)" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
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
