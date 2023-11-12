<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import axios from "@/plugins/axios"

// Translate i18n
import { useI18n } from "vue-i18n"

const emit = defineEmits(['search'])
const { t } = useI18n()
const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

// Functions or methods
const departments = computed(() => {
  const array = generalfilter
    .departments
    .map(e => ({ title: e.name, value: e.id }))
  
  return [{ title: t('common.select_write_option'), value: -1 }, ...array ]
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.select_write_option'), value: -1 }, ...array ]
})

const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.select_write_option'), value: -1 }, ...array ]
})

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .groupingPoliticalTypes
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
  department: departments.value[0].value,
  municipality: municipalities.value[0].value,
  commune: communes.value[0].value,
  roleId: roleList.value[0].value,
  groupingPoliticalTypeId: groupingPoliticalTypes.value[0].value,
  active: userStatus[0].value,
})

const handlerUserFilter = () => {
  emit('search', { ...formFilter.value })
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
        <VForm ref="refForm" class="mt-2">
          <VRow>
            <VCol cols="12" md="4">
              <VTextField v-model.trim="formFilter.username" clearable prepend-inner-icon="tabler-filter" :label="t('user.username')" />
            </VCol>

            <VCol cols="12" md="4">
              <VSelect v-model="formFilter.roleId" clearable :items="roleList" prepend-inner-icon="tabler-filter" :label="t('user.user_rol')" />
            </VCol>
           
            <VCol cols="12" md="4">
              <VSelect v-model="formFilter.groupingPoliticalTypeId" clearable :items="groupingPoliticalTypes" prepend-inner-icon="tabler-filter" :label="t('user.groupingPoliticalTypes')" />
            </VCol>

            <VCol cols="12" md="4">
              <VAutocomplete
                v-model="formFilter.department" 
                filter-mode="some" 
                clearable 
                :items="departments" 
                prepend-inner-icon="tabler-filter" 
                :label="t('user.department_filter')"
                @update:model-value="(value) => {
                  generalfilter.setDepartment(value)
                  formFilter.municipality = -1
                }"
              />
            </VCol>
            
            <VCol cols="12" md="4">
              <VAutocomplete
                v-model="formFilter.municipality" 
                filter-mode="some" 
                clearable 
                :items="municipalities" 
                prepend-inner-icon="tabler-filter" 
                :label="t('user.municipality_filter')"
                @update:model-value="(value) => {
                  generalfilter.setMunicipality(value)
                  formFilter.commune = -1
                }"
              />
            </VCol>

            <VCol cols="12" sm="6" md="4">
              <VAutocomplete 
                v-model="formFilter.commune"
                filter-mode="some"
                clearable
                :items="communes" 
                prepend-inner-icon="tabler-filter"
                :label="t('common.commune')" 
              />
            </VCol>
            
            <VCol cols="12" md="4">
              <VSelect v-model="formFilter.active" clearable :items="userStatus" prepend-inner-icon="tabler-filter" :label="t('user.status_header')" />
            </VCol>

            <VCol cols="12" class="d-flex gap-4">
              <VBtn @click="handlerUserFilter">
                {{ t('user.btn_search') }}
              </VBtn>

              <VBtn variant="outlined" @click="clearForm">
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
