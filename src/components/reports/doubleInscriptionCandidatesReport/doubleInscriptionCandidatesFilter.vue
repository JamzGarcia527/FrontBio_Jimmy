<script setup>
import { useI18n } from "vue-i18n"

const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])

const { t } = useI18n()

const filter = ref({
  inscriptionType: -1,
  dni: null,
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const listInscriptionType = ref([
  { title: 'Doble Inscripción', value: 1 },
  { title: 'Presunción Doble Militancia', value: 2 },
])

const listInscriptionTypeSelect = computed(() => {
  
  const array = listInscriptionType.value

  return addOptionDefault(array)
})

const form = ref(null)

const rules = reactive({
  listInscriptionType: [value => {
    if (listInscriptionType.value === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  dni: [value => {
    if (filter.value.dni == null) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
})

const handlerOpen = () => {
  filter.value.inscriptionType = -1
  filter.value.dni = null
}

const handlerSearchFilter = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false
  
  emit('search', { ...filter.value, valid  })
  
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerSearchFilter">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VTextField 
              v-model="filter.dni"
              label="Número de cédula de ciudadanía"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect 
              v-model="filter.inscriptionType"
              label="Tipo inscripción"
              :items="listInscriptionTypeSelect" 
              :rules="rules.listInscriptionType"
            />
          </VCol>
        </VRow>
        <VRow class="mb-2" />
      </VCardText>
      <VCardText class="d-flex justify-center gap-4">
        <VBtn :loading="loading" :disabled="disabled" type="submit">
          {{ t('common.search') }}
        </VBtn>
        <VBtn color="secondary" @click="handlerOpen">
          {{ t('common.btn_reset') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
