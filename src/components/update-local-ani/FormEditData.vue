<script setup>
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import axios from "@/plugins/axios"
import { useGeneralFilter } from '@/stores/generalfilter'
import { requiredEspecialSelectValidator, maxLengthValidator, dateValidator } from "@/utils/validators"

const props = defineProps({
  data: { type: Object, default: () => {} },
})

const emit = defineEmits(['updated', 'cleanedForm', 'isDifferent'])

const { t } = useI18n()
const generalfilterStore = useGeneralFilter()

const genders = computed(() => generalfilterStore.genders.map(e => ({ title: e.description, value: e.id })))

const editForm = ref({
  dni: props.data && props.data.dni ? props.data.dni : null,
  firstName: props.data && props.data.firstName ? props.data.firstName : null,
  secondName: props.data && props.data.secondName ? props.data.secondName : null,
  firstSurname: props.data && props.data.firstSurname ? props.data.firstSurname : null,
  secondSurname: props.data && props.data.secondSurname ? props.data.secondSurname : null,
  dateOfIssueOfTheDocument: props.data && props.data.dateOfIssueOfTheDocument ? props.data.dateOfIssueOfTheDocument : null,
  validity: props.data && props.data.validity ? props.data.validity : null,
  dateBirth: props.data && props.data.dateBirth ? props.data.dateBirth : null,
  gender: props.data && props.data.gender ? props.data.gender : null,
})

const rules = reactive({
  firstName: [requiredEspecialSelectValidator, maxLengthValidator(60)],
  secondName: [maxLengthValidator(60)],
  firstSurname: [requiredEspecialSelectValidator, maxLengthValidator(60)],
  secondSurname: [requiredEspecialSelectValidator, maxLengthValidator(60)],
  dateOfIssueOfTheDocument: [requiredEspecialSelectValidator, dateValidator],
  dateBirth: [requiredEspecialSelectValidator, dateValidator],
  gender: [requiredEspecialSelectValidator],
})

const form = ref(null)

const handlerSubmit = async () => {

  const { valid } = await form.value.validate()
  if (!valid) return false

  const isDifferent =
    editForm.value.firstName != props.data.first_name
    || editForm.value.secondName != props.data.second_name
    || editForm.value.firstSurname != props.data.first_surname
    || editForm.value.secondSurname != props.data.second_surname
    || editForm.value.dateOfIssueOfTheDocument != props.data.expedition_date
    || editForm.value.validity != props.data.validity
    || editForm.value.dateBirth != props.data.birthdate
    || editForm.value.gender != props.data.gender

  if (isDifferent) {

    emit('isDifferent', true)

    const { firstName, secondName, firstSurname, secondSurname, dateOfIssueOfTheDocument, dateBirth, ...result } = editForm.value

    const requestBody = {
      first_name: firstName,
      second_name: secondName,
      first_surname: firstSurname,
      second_surname: secondSurname,
      expedition_date: dateOfIssueOfTheDocument,
      birthdate: dateBirth,
      ...result,
    }

    try {
      await axios.post('/ani/create', requestBody)
      Swal.fire({ icon: "success", text: 'Operación realizada correctamente' })

      emit('updated', { dni: props.data?.dni })
    
      return true
    } catch (error) {
      if (error.response && error.response.status <= 500) {
        const { message } = error.response.data

        Swal.fire({ icon: "warning", text: message || t('assign_random_position.swal.not_operation') })
      
        return { success: false }
      }
    }
  } else {
    emit('isDifferent', false)
  }
}

const setData = () => {
  editForm.value = { 
    dni: props.data && props.data.dni ? props.data.dni : null,
    firstName: props.data && props.data.first_name ? props.data.first_name : null,
    secondName: props.data && props.data.second_name ? props.data.second_name : null,
    firstSurname: props.data && props.data.first_surname ? props.data.first_surname : null,
    secondSurname: props.data && props.data.second_surname ? props.data.second_surname : null,
    dateOfIssueOfTheDocument: props.data && props.data.expedition_date ? props.data.expedition_date : null,
    validity: props.data && props.data.validity === 0 ? 0 : props.data.validity,
    dateBirth: props.data && props.data.birthdate ? props.data.birthdate : null,
    gender: props.data && props.data.gender ? props.data.gender : null,
  }
}

const handlerReset = () => {
  editForm.value = {}
  emit('cleanedForm')
}

watch(() => props.data, () => {
  setData()
})
</script>

<template>
  <div>
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerSubmit">
      <VRow class="mb-2">
        <VCol cols="12" md="6">
          <VTextField v-model.trim="editForm.firstName" :rules="rules.firstName" :label="t('update_local_ani.form.firstName')" />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model.trim="editForm.secondName" :rules="rules.secondName" :label="t('update_local_ani.form.secondName')" />
        </VCol>
      </VRow>
      <VRow class="mb-2">
        <VCol cols="12" md="6">
          <VTextField v-model.trim="editForm.firstSurname" :rules="rules.firstSurname" :label="t('update_local_ani.form.firstSurname')" />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model.trim="editForm.secondSurname" :rules="rules.firstSurname" :label="t('update_local_ani.form.secondSurname')" />
        </VCol>
      </VRow>
      <VRow class="mb-2">
        <VCol cols="12" md="6">
          <VTextField
            v-model="editForm.dateOfIssueOfTheDocument" 
            type="date"  
            :rules="rules.dateOfIssueOfTheDocument"
            prepend-inner-icon="tabler-calendar" 
            :label="t('update_local_ani.form.dateOfIssueOfTheDocument')"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model.trim="editForm.validity" :label="t('update_local_ani.form.validity')" />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            v-model="editForm.dateBirth"  
            type="date"  
            :rules="rules.dateBirth"
            prepend-inner-icon="tabler-calendar" 
            :label="t('update_local_ani.form.dateBirth')"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VSelect
            v-model.trim="editForm.gender"
            :rules="rules.gender"
            :label="`${t('candidates.form.gender')}`"
            :items="genders"
          />
        </VCol>
      </VRow> 
      <VCardText class="d-flex justify-center gap-4">
        <VBtn type="submit">
          Guardar
        </VBtn>
        <VBtn @click="handlerReset">
          Limpiar
        </VBtn>
      </VCardText>
    </VForm>
  </div>
</template>
