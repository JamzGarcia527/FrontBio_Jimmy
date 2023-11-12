<script setup>
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import axios from "@/plugins/axios"
import {
  requiredValidator,
} from '@/utils/validators'

// Translate i18n
import { useI18n } from "vue-i18n"

const emit = defineEmits(['search'])
const { t } = useI18n()
const generalfilter = useGeneralFilterComposable()

const filterUserAux = [
  { key: "Todos" , value: -1 },
  { key: "Código" , value: 1 },
  { key: "Nombre del Usuario" , value: 2 },
  { key: "Departamento" , value: 3 },
  { key: "Municipio" , value: 4 },
  { key: "Activo" , value: 5 },
]

const refVForm = ref()

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

// Functions or methods
const departments = computed(() => {
  const array = generalfilter
    .getDepartments()
    .map(e => ({ title: e.name, value: e.id }))
  
  return addOptionDefault(array)
})

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .getGroupingPoliticalsTypes()
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const userStatus = [
  {
    title: t('common.select_one_option'),
    value: -1,
  },
  {
    title: t('user.status'),
    title: t('user.status'),
    value: true,
  },
  {
    title: t('user.inactive'),
    value: false,
  },
]

const roleList = ref([{ title: t('common.select_one_option'), value: -1 }])

const getRoles = () => {
  axios.get('/v1/role').then(({ data }) => {
    const items = data.map(e => {
      return { title: e.name, value: e.id }
    })

    roleList.value = [
      { title: t('common.select_one_option'), value: -1, disabled: true },
      ...items,
    ]
  })
}

const formFilter = ref({
  filter: -1,
  name: null,
})

const handlerUserFilter = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid ){
      emit('search', { ...formFilter.value })
    }
  })
  
}

const clearForm = () => {
  formFilter.value = {}
}

onMounted(() => {
  getRoles()
})
</script>

<template>
  <div>
    <VCard flat class="mb-6">
      <VCardText>
        <VForm ref="refVForm" class="mt-2">
          <VRow>
            <VCol cols="12" md="6">
              <VSelect 
                v-model="formFilter.filter" 
                :label="t('user.listUserAux.filter')" 
                :items="filterUserAux" 
                item-title="key" 
                item-value="value" 
                density="compact"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField 
                v-model.trim="formFilter.name" 
                clearable prepend-inner-icon="tabler-filter" 
                :label="t('user.listUserAux.nameFilter')" 
                :rules="[requiredValidator]"
              />
              <VListItemTitle v-if="formFilter.filter === 1" class="demo-space-x me-4 ps-5 mb-2">
                <div>
                  INDIQUE CRITERIO DE BUSQUEDA 
                  <br>
                  <b> {{ t('alertUserAux.validate.code').toUpperCase() }} </b>
                </div>
              </VListItemTitle>
              <VListItemTitle v-if="formFilter.filter === 2" class="demo-space-x me-4 ps-5 mb-2">
                <div>
                  INDIQUE CRITERIO DE BUSQUEDA 
                  <br>
                  <b> {{ t('alertUserAux.validate.nameUser').toUpperCase() }} </b>
                </div>
              </VListItemTitle>
              <VListItemTitle v-if="formFilter.filter === 3" class="demo-space-x me-4 ps-5 mb-2">
                <div>
                  INDIQUE CRITERIO DE BUSQUEDA 
                  <br>
                  <b> {{ t('alertUserAux.validate.department').toUpperCase() }} </b>
                </div>
              </VListItemTitle>
              <VListItemTitle v-if="formFilter.filter === 4" class="demo-space-x me-4 ps-5 mb-2">
                <div>
                  INDIQUE CRITERIO DE BUSQUEDA 
                  <br>
                  <b> {{ t('alertUserAux.validate.municipality').toUpperCase() }} </b>
                </div>
              </VListItemTitle>
              <VListItemTitle v-if="formFilter.filter === 5" class="demo-space-x me-4 ps-5 mb-2">
                <div>
                  INDIQUE CRITERIO DE BUSQUEDA 
                  <br>
                  <b> {{ t('alertUserAux.validate.active').toUpperCase() }} - {{ t('alertUserAux.validate.inactive').toUpperCase() }} </b>
                </div>
              </VListItemTitle>
            </VCol>
           

            <VCol cols="12" class="d-flex gap-4">
              <VBtn @click="handlerUserFilter">
                {{ t('user.btn_search') }}
              </VBtn>

              <VBtn color="secondary" variant="tonal" @click="clearForm">
                {{ t('user.btn_clear') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
meta:
  authRequired: true
</route>