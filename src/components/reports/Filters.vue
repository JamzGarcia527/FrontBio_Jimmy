<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useI18n } from "vue-i18n"

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['next'])
const { t } = useI18n()

const form = ref(null)
const rol = ref(-1)

const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.all_option'), value: -1 }, ...array]
}

const roleOptions = [
  { title: 'Candidato', value: 'CA' },
  { title: 'Delegado Departamental', value: 'DEDE' },
  { title: 'Registrador del Estado Civil', value: 'REGI' },
  { title: 'Representante de Agrupación Política', value: 'AP' },
]

const corporations = computed(() => {
  const array = generalfilter
    .corporations
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const circunscription = computed(() => {
  const array = generalfilter
    .circunscriptionsByCorporation
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const departaments = computed(() => {
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

const roles = computed(() => {
  return addOptionDefault(roleOptions)
})

const handlerNext = async () => {

  emit('next', { ...generalfilter.selected, rol: rol.value })
}
</script>

<template>
  <div>
    <VCard :title="title" class="mb-6">
      <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
        <VCardText>
          <VRow>
            <VCol>
              <VSelect
                :label="t('common.corporation')"
                :model-value="generalfilter.idCorporation"
                :items="corporations"
                @update:model-value="generalfilter.setCorporation"
              />
            </VCol>
            <VCol>
              <VSelect
                :label="t('common.circunscription')"
                :model-value="generalfilter.idCircunscription"
                :items="circunscription"
                @update:model-value="generalfilter.setCircunscription"
              />
            </VCol>
            <VCol>
              <VAutocomplete
                :label="t('common.department')"
                filter-mode="some"
                :model-value="generalfilter.idDepartment"
                :items="departaments"
                :disabled="disabled || !generalfilter.enableDeparment"
                @update:model-value="generalfilter.setDepartment"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VAutocomplete
                :label="t('common.municipality')"
                filter-mode="some"
                :model-value="generalfilter.idMunicipality"
                :items="municipalities"
                :disabled="disabled || !generalfilter.enableMunicipality"
                @update:model-value="generalfilter.setMunicipality"
              />
            </VCol>
            <VCol>
              <VAutocomplete
                :label="t('common.commune')"
                filter-mode="some"
                :model-value="generalfilter.idCommune"
                :items="communes"
                :disabled="disabled || !generalfilter.enableCommune"
                @update:model-value="generalfilter.setCommune"
              />
            </VCol>
            <VCol>
              <VSelect
                v-model="rol"
                :items="roles"
                :label="t('user.user_rol')"
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
  </div>
</template>
