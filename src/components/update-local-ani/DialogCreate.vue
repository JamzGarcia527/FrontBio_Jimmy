<script setup>
import imageLogo from '@images/pages/fondoContrasena.png'
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useGeneralFilter } from '@/stores/generalfilter'
import { requiredEspecialSelectValidator, maxLengthValidator, dateValidator } from "@/utils/validators"

// Declaring and initializing props
const props = defineProps({
  isOpenDialog: { type: Boolean, default: false },
  dni: { type: String, required: true },
})

const emit = defineEmits(['created', 'closeDialog'])

const generalfilterStore = useGeneralFilter()

generalfilterStore.loadFilters().then(() => {
  generalfilterStore.initSelected()
})

const genders = computed(() => generalfilterStore.genders.map(e => ({ title: e.description, value: e.id })))

const subForm = ref({
  dni: props.dni,
  firstName: null,
  secondName: null,
  firstSurname: null,
  secondSurname: null,
  dateOfIssueOfTheDocument: null,
  validity: null,
  dateBirth: null,
  gender: null,
})

const isDialogVisible = computed(() => props.isOpenDialog)
const { t } = useI18n()
const loading = ref(false)
const disabled = ref(false)

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

  const { firstName, secondName, firstSurname, secondSurname, dateOfIssueOfTheDocument, dateBirth, ...result } = subForm.value

  const requestBody = {
    dni: props.dni,
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

    emit('created')
    
    return true
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message || t('assign_random_position.swal.not_operation') })
      
      return { success: false }
    }
  }
}

const handlerCloseDialog = () => {
  emit('closeDialog')
  subForm.value = {}
}

const setData = () => {
  subForm.value = { 
    dni: props && props.dni ? props.dni : null,
  }
}

watch(() => props.dni, () => {
  setData()
})
</script>

<template>
  <div>
    <VDialog
      v-model="isDialogVisible"
      persistent
      width="800"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="handlerCloseDialog" />

      <!-- Dialog Content -->
      <VCard>
        <VImg
          :src="imageLogo"
          cover
        />
        <VCardText>
          <VForm ref="form" validate-on="submit" @submit.prevent="handlerSubmit">
            <VCardText class="text-center">
              <h2 class="d-flex justify-center">
                CREAR NUEVO REGISTRO
                <br>
              </h2>
              <span> Número de documento: {{ dni }} </span>
              <VRow class="mt-4">
                <VCol cols="12" md="6">
                  <VTextField 
                    v-model.trim="subForm.firstName" 
                    :label="t('update_local_ani.form.firstName')" 
                    :rules="rules.firstName"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model.trim="subForm.secondName" :label="t('update_local_ani.form.secondName')" :rules="rules.secondName" />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField v-model.trim="subForm.firstSurname" :rules="rules.firstSurname" :label="t('update_local_ani.form.firstSurname')" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model.trim="subForm.secondSurname" :rules="rules.secondSurname" :label="t('update_local_ani.form.secondSurname')" />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model.trim="subForm.dateOfIssueOfTheDocument"
                    type="date" 
                    :rules="rules.dateOfIssueOfTheDocument"
                    prepend-inner-icon="tabler-calendar" 
                    :label="t('update_local_ani.form.dateOfIssueOfTheDocument')"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model.trim="subForm.validity" :label="t('update_local_ani.form.validity')" />
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model.trim="subForm.dateBirth"
                    type="date"  
                    :rules="rules.dateBirth"
                    prepend-inner-icon="tabler-calendar" 
                    :label="t('update_local_ani.form.dateBirth')"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VSelect
                    v-model.trim="subForm.gender"
                    :rules="rules.gender"
                    :label="`${t('candidates.form.gender')}`"
                    :items="genders"
                  />
                </VCol>
              </VRow> 
            </VCardText>
            <VCardText class="d-flex justify-end gap-3 flex-wrap">
              <VBtn
                color="secondary"
                variant="tonal"
                :disabled="disabled"
                @click="handlerCloseDialog"
              >
                {{ t('common.btn_close') }}
              </VBtn>
              <VBtn :loading="loading" type="submit" :disabled="disabled">
                {{ t('common.btn_submit') }}
              </VBtn>
            </VCardText>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>  
  </div>  
</template>
