<script setup>
import { useI18n } from "vue-i18n"
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator, requiredValidator, integerValidator } from "@/utils/validators"

const emit = defineEmits(['next'])

const { t } = useI18n()
const generalfilterComposable = useGeneralFilterComposable()
const generalfilter = useGeneralFilter()
const corporationItems = ref([])

generalfilter.initSelected()
generalfilter.loadFilters()

const formFilter = ref({
  filter: -1,
  description: null,
})

const filters = [
  { title: 'Todos', value: -1 },
  { title: 'Inscripción', value: 1 },
  { title: 'Corporación/Cargo', value: 2 },
  { title: 'Circunscripción', value: 3 },
  { title: 'Lugar', value: 5 },
  { title: 'Nombre de la Agrupación Política', value: 4 },
]

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

// Funciones o métodos
const getCorporationAll = () => {
  generalfilterComposable.getCorporationsFromApi().then(data => {
    corporationItems.value = data.map(e => ({ value: Number(e.id), title: e.name }))
  })
}

const corporations = computed(() => {
  return addOptionDefault(corporationItems.value.map(e => ({ value: Number(e.value), title: e.title })))
})

const handlerChangeCorporation = payload => {
  const corp = corporationItems.value.find(e => e.id === payload)

  generalfilter.setCorporationWhitoutCircunscription(payload)
}

const handlerResetCorpAndCirc = () => {
  generalfilter.initSelected()
}

const circunscriptions = computed(() => {
  const array = generalfilter.circunscriptions
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const form = ref(null)

const rules = reactive({
  corporations: [requiredEspecialSelectValidator], 
  circunscriptions: [requiredEspecialSelectValidator],
  description: [
    value => {
      if (formFilter.value.filter === 1 || formFilter.value.filter === 4 || formFilter.value.filter === 5) {
        return requiredValidator(value)
      } else {
        return true
      }
    },
    value => {
      if (formFilter.value.filter === 1) {
        return integerValidator(value)
      } else {
        return true
      }
    },
  ],
})

const handlerNext = async () => {

  const { valid } = await form.value.validate()
  if (!valid) return false

  const { filter, description } = formFilter.value

  const params = {
    inscriptionId: filter === 1 ? Number(description) : -1,
    corporationId: generalfilter.idCorporation,
    circuncriptionId: generalfilter.idCircunscription,
    groupingPoliticalName: filter === 4 ? description : null,
    registrationPlace: filter === 5 ? description : null,
  }

  emit('next', { valid, params })
}

onMounted(() => {
  getCorporationAll()
})
</script>

<template> 
  <div>
    <VCard>
      <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
        <VCardText>
          <VRow class="mb-2">
            <VCol cols="12" md="6">
              <VSelect
                v-model="formFilter.filter" 
                label="Filtro"
                :items="filters"
                @update:model-value="handlerResetCorpAndCirc"
              />
            </VCol>
            <VCol v-if="formFilter.filter === 1 || formFilter.filter === 4 || formFilter.filter === -1 || formFilter.filter === 5" cols="12" md="6">
              <VTextField 
                v-model="formFilter.description"
                :label="formFilter.filter === 1 ? 'Número de inscripción' 
                  : formFilter.filter === 4 ? 'Nombre de agrupación política'
                    : 'descripción'"
                :rules="rules.description"
                :disabled="formFilter.filter === -1"
              />
            </VCol>
            <VCol v-if="formFilter.filter === 2" cols="12" md="6">
              <VSelect 
                :label="t('common.corporation')"
                :model-value="generalfilter.idCorporation"
                :items="corporations" 
                :disabled="disabled"
                :rules="rules.corporations"
                @update:model-value="handlerChangeCorporation"
              />
            </VCol>
            <VCol v-if="formFilter.filter === 3" cols="12" md="6">
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
        </VCardText>
        <VCardText class="d-flex justify-center gap-4">
          <VBtn type="submit">
            {{ t('common.consult') }}
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </div>
</template>
