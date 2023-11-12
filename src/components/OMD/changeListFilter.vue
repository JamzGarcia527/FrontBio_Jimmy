<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])

const formData = ref({  
  description: '',
  dataEnd: null,
  dateInit: null,
  numberOmd:'',
})

const { t } = useI18n()
const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})



const addOptionDefault = array => {
  return [ { title: t('common.all'), value: -1 }, ...array]
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

  return [{ title: "Todos", value: -1 }, ...array ]
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: "Todos", value: -1 }, ...array ]
})

const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: "Todos", value: -1 }, ...array ]
})

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .groupingPoliticalTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const rules = reactive({
  dataEnd: [requiredValidator],
  dateInit: [requiredValidator],
})

const form = ref(null)

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  const { ...result } = formData.value

  emit('search', { ...generalfilter.selected, ...result })
}
</script>

<template>
  <VCard variant="flat">
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
          <VCol cols="12" sm="6" md="6">
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
        <VRow class="mb-2">
          <VCol cols="12" md="4">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="disabled || !generalfilter.enableDeparment"
              :rules="rules.departments"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="disabled || !generalfilter.enableMunicipality"
              :rules="rules.municipalities"
              @update:model-value="generalfilter.setMunicipality" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.commune')"
              filter-mode="some"
              :model-value="generalfilter.idCommune"
              :items="communes" 
              :disabled="disabled || !generalfilter.enableCommune"
              :rules="rules.communes"
              @update:model-value="generalfilter.setCommune" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model.trim="formData.numberOmd"
              clearable
              label="Numero de OMD"
              :placeholder="t('OMD.listOMD.description')"
              :rules="rules.numberOmd"
            />
          </vcol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model.trim="formData.description"
              clearable
              :label="t('OMD.listOMD.description')"
              :placeholder="t('OMD.listOMD.description')"
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="formData.dateInit"
              type="date"
              :label="t('securityPolicy.startDate')"
              :disabled="formDisabled"
              :rules="rules.dataEnd"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="formData.dataEnd"
              type="date"
              :label="t('securityPolicy.endingDate')"
              :disabled="formDisabled"
              :rules="rules.dateInit"
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

<style lang="scss">
.v-menu__content {
  inset-block-start: 100px;
}
</style>
