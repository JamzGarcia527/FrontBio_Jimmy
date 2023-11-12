<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useI18n } from "vue-i18n"
import { watch } from 'vue'
import { downloadBlob } from '@/utils'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

defineProps({
  title: { type: String, default: null },
})

const emit = defineEmits(['search'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
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

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .groupingPoliticalTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const groupingPoliticals = computed(() => {
  const array = generalfilter
    .groupingPoliticalsByType
    .map(e => ({ title: `${e.id} - ${e.name}`, value: e.name }))

  return addOptionDefault(array)
})

const form = ref(null)
const download = ref(false)
const loading = ref(false) 

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false

  loading.value = true

  const {
    corporationId: corp, 
    circunscriptionId: circ, 
    department: depa,
    municipality: muni,
    commune: comu,
    groupingPoliticalTypeId: tipo,
    groupingPoliticalId: nomb,
  } = generalfilter.$state.selected

  const payload = {
    exte: 1,
    corp,
    circ,
    depa,
    muni,
    comu,
    tipo,
    nomb: nomb === -1 ? "" : nomb,
  }

  axios.get(`/v1/files/candidates/approved-e6/download`, {
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = 'Listado E6 Aprobados.xlsx'

    downloadBlob(data, nameFile, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => loading.value = false)
}

const clear = () => {
  download.value = false
  generalfilter.initSelected()
}

const generate = () => {
  download.value = true
}

watch(() => generalfilter.$state.selected, () => {
  download.value = false
}, { deep: true })
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
              :disabled="loading"
              @update:model-value="generalfilter.setGroupingPoliticalType" 
            />
          </VCol>
          <VCol cols="12" md="8">
            <VAutocomplete 
              :label="t('common.grouping_political_name')"
              :model-value="generalfilter.idGroupingPolitical"
              :items="groupingPoliticals" 
              :disabled="loading"
              @update:model-value="generalfilter.setGroupingPolitical" 
            />
          </VCol>
        </VRow>
        <VRow class="mb-2">
          <VCol cols="12" md="5">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
              :disabled="loading"
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              :disabled="loading"
              @update:model-value="generalfilter.setCircunscription" 
            />
          </VCol>

          <VCol cols="12" md="4">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="loading || !generalfilter.enableDeparment"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="loading || !generalfilter.enableMunicipality"
              @update:model-value="generalfilter.setMunicipality" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.commune')"
              filter-mode="some"
              :model-value="generalfilter.idCommune"
              :items="communes" 
              :disabled="loading || !generalfilter.enableCommune"
              @update:model-value="generalfilter.setCommune" 
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="text-end">
        <VBtn type="button" color="secondary" class="mr-3" @click="clear">
          {{ t('common.btn_cancelar') }}
        </VBtn>

        <VBtn v-if="!download" type="button" @click="generate">
          {{ t('common.generate_file') }}
        </VBtn>

        <VBtn v-else type="submit" :loading="loading" :disabled="loading">
          {{ t('common.download_file') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
