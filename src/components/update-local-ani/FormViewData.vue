<script setup>
import { useI18n } from "vue-i18n"

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  cleanForm: { type: Boolean, default: false },
})

const emit = defineEmits(['cleanedForm'])

const { t } = useI18n()
const hiddeShouldCleanForm = ref(true)

const form = ref({
  firstName: null,
})

const shouldCleanForm = computed(() => {
  if (props.cleanForm) {
    form.value = {}
    
    return true
  }
  
  return false
})

const setData = () => {
  form.value = { 
    firstName: props.data && props.data.first_name ? props.data.first_name : null,
    secondName: props.data && props.data.second_name ? props.data.second_name : null,
    firstSurname: props.data && props.data.first_surname ? props.data.first_surname : null,
    secondSurname: props.data && props.data.second_surname ? props.data.second_surname : null,
    dateOfIssueOfTheDocument: props.data && props.data.expedition_date ? props.data.expedition_date : null,
    validity: props.data && props.data.validity != null ? props.data.validity : null,
    dateBirth: props.data && props.data.birthdate ? props.data.birthdate : null,
    gender: props.data && props.data.gender ? props.data.gender : null,
  }
}

watch(() => props.data, () => {
  setData()
})
</script>

<template>
  <div>
    <VForm disabled>
      <span :hidden="hiddeShouldCleanForm"> {{ shouldCleanForm }} </span>
      <VRow class="mb-2">
        <VCol cols="12" md="6">
          <VTextField v-model="form.firstName" :label="t('update_local_ani.form.firstName')" readonly />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="form.secondName" :label="t('update_local_ani.form.secondName')" readonly />
        </VCol>
      </VRow>
      <VRow class="mb-2">
        <VCol cols="12" md="6">
          <VTextField v-model="form.firstSurname" :label="t('update_local_ani.form.firstSurname')" readonly />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="form.secondSurname" :label="t('update_local_ani.form.secondSurname')" readonly />
        </VCol>
      </VRow>
      <VRow class="mb-2">
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.dateOfIssueOfTheDocument" 
            prepend-inner-icon="tabler-calendar" 
            :label="t('update_local_ani.form.dateOfIssueOfTheDocument')" 
            readonly
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="form.validity" :label="t('update_local_ani.form.validity')" readonly />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.dateBirth"  
            prepend-inner-icon="tabler-calendar" 
            :label="t('update_local_ani.form.dateBirth')" 
            readonly
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="form.gender" :label="t('update_local_ani.form.gender')" readonly />
        </VCol>
      </VRow> 
    </VForm>
  </div>
</template>
