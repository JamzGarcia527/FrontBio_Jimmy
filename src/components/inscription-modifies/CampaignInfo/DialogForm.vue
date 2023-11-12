<script setup>
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import { useVuelidate } from "@vuelidate/core"
import LocalPhoneField from '@/components/shared/LocalPhoneField.vue'
import { helpers } from "@vuelidate/validators"
import Swal from '@/plugins/sweetalert2'
import imageLogo from '@images/pages/fondoContrasena.png'
import { useCustomMessage } from "@/composables/useCustomMessage"
import {
  requiredVuelidate,
  requiredSelectVuelidate,
  integerVuelidate,
  emailVuelidate,
} from "@/utils/validators/vuelidate"

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  inscriptionId: { type: String, required: true },
  inscriptionModifyId: { type: String, required: true },
  groupingPoliticalTypeId:{ type: Number, required: true  },
  data: { type: Object, default: null },
  edit: { type: Boolean, default: false },
})

const emit = defineEmits(['update:model-value', 'closed', 'submit'])

const { t } = useI18n()
const { inscriptionId, data: infoCandidate, edit, inscriptionModifyId } = toRefs(props)
const messageComposable = useCustomMessage()

const toggleDialog = value => {
  emit('update:model-value', value)
}

const dataFinancialEntity = ref({})
const dataAccountType = ref({})
const dataCandidates = ref({})

const form = ref({
  idCandidat: null,
  inscriptionId: '',
  candidateDni: '',
  dniManager: '',
  firstNameManager: '',
  secondNameManager: '',
  firstSurnameManager: '',
  secondSurnameManager: '',
  celularPhone: '',
  phone: '',  
  email: '',
  accountNumber: '',
  financialEntity: null,
  accountType: null,
  dniCounter: '',
  firstNameCounter: '',
  secondNameCounter: '',
  firstSurnameCounter: '',
  secondSurnameCounter: '',
  professionalCard: '',
  numberBooksAccount: '',
  isCheck:false,
  inscriptionChangeId:'',
  
})

const rules = reactive({
  idCandidat: { requiredSelectVuelidate },
  dniManager: { requiredVuelidate },
  celularPhone: {
    required: helpers.withMessage(
      t("validations.mobile_or_phone"),
      value => value || form.value.phone,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de celular debe contener 10 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  phone: {
    integerVuelidate,
    length: helpers.withMessage(
      "El número de teléfono fijo debe contener 7 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  email: { emailVuelidate },
})

const getDataFinancialEntity = async () => {
  try {
    const { data } = await axios.get(`v1/campaign/get-all-financial-entity`)

    dataFinancialEntity.value = data
  } catch (error) {
    if (error.response && error.response.status !== 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0028"),
        target: document.getElementById('formCampaign'),
      })
    }
  }
}

const getDataAccountType = async () => {
  try {
    const { data } = await axios.get(`v1/campaign/get-all-account-type`)

    dataAccountType.value = data
  } catch (error) {
    if (error.response && error.response.status !== 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0029"),
        target: document.getElementById('formCampaign'),
      })
    }
  }
}

const getDataCandidates = async () => {
  try {
    const { data } = await axios.get(`/v1/candidates-changes/inscription-change/${props.inscriptionModifyId}`)

    dataCandidates.value = data.map(e => (
      {
        nameCandidates: (e.firstname + " " + e.secondname + " " + e.firstsurname + " " + e.secondsurname).trim(),
        ...e,
      }
    )).sort((a, b) => a > b)
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0030"),
        target: document.getElementById('formCampaign'),
      })
    }
  }
}

getDataFinancialEntity()
getDataAccountType()
getDataCandidates()

const clearForm = () => {
  form.value = {
    idCandidat: null,
    inscriptionId: '',
    candidateDni: '',
    dniManager: '',
    firstNameManager: '',
    secondNameManager: '',
    firstSurnameManager: '',
    secondSurnameManager: '',
    celularPhone: '',
    phone: '',  
    email: '',
    accountNumber: '',
    financialEntity: null,
    accountType: null,
    dniCounter: '',
    firstNameCounter: '',
    secondNameCounter: '',
    firstSurnameCounter: '',
    secondSurnameCounter: '',
    professionalCard: '',
    numberBooksAccount: '',
    isCheck:false,
    inscriptionChangeId:'',
  }
  v$.value.$reset()
}

const handleClose = () => {
  clearForm()
  toggleDialog(false)
  emit('closed')
}

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: null }, ...array]
}

const financialEntityOptions = computed(() => {
  const array = dataFinancialEntity.value
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const accountTypeOptions = computed(() => {
  const array = dataAccountType.value
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const candidatesOptions = computed(() => {
  const array = dataCandidates.value
    .map(e => ({ title: e.nameCandidates, value: e.dni }))

  return addOptionDefault(array)
})

const v$ = useVuelidate(rules, form)

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  if(form.value.firstNameManager === '') {
    await Swal.fire({
      icon: 'warning',
      text: messageComposable.get("MS0031"),
      target: document.getElementById('formCampaign'),
    })

    return
  }

  if((form.value.dniCounter != null && form.value.dniCounter.length > 0) && (form.value.firstNameCounter === null || form.value.firstNameCounter.length === 0)) {
    await Swal.fire({
      icon: 'warning',
      text: messageComposable.get("MS0032"),
      target: document.getElementById('formCampaign'),
    })

    return
  }

  if (form.value.candidateDni === null || form.value.candidateDni === "") {
    const idCandidate = dataCandidates.value.find(e => e.dni === form.value.idCandidat)

    form.value.candidateDni = idCandidate?.dni
  }

  emit("submit", { form: form, edit: edit })
  clearForm()
}

const searchDniManager = async () => {
  if(form.value.dniManager !== null && form.value.dniManager !== '') {
    const data = await searchAni(form.value.dniManager)

    if (data.first_name != null) {
      form.value.firstNameManager = data.first_name
      form.value.secondNameManager = data.second_name
      form.value.firstSurnameManager = data.first_surname
      form.value.secondSurnameManager = data.second_surname
    }
  }
}

const resetSessionManager = () => {
  form.value.firstNameManager = ''
  form.value.secondNameManager = ''
  form.value.firstSurnameManager = ''
  form.value.secondSurnameManager = ''
}

const searchDniCounter = async () => {
  if(form.value.dniCounter !== null && form.value.dniCounter !== '') {
    const data = await searchAni(form.value.dniCounter)

    form.value.firstNameCounter = data.first_name
    form.value.secondNameCounter = data.second_name
    form.value.firstSurnameCounter = data.first_surname
    form.value.secondSurnameCounter = data.second_surname
  }
}

const resetSessionCounter = () => {
  form.value.firstNameCounter = ''
  form.value.secondNameCounter = ''
  form.value.firstSurnameCounter = ''
  form.value.secondSurnameCounter = ''
}

const searchAni = async dni => {
  try {
    const { data } = await axios.get(`/ani/${dni}`)
    
    return data
  } catch(error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0033"),
        target: document.getElementById('formCampaign'),
      })
    }
    
    return null
  }
}

const clearManagerDni = () => {
  resetSessionManager()
}

const clearCounterDni = () => {
  resetSessionCounter()
}

onBeforeUpdate(() => {
  clearForm()
  let phone = ''
  if(infoCandidate.value !== null) {
    if(infoCandidate.value.callsign != null) {
      phone = infoCandidate.value.callsign + infoCandidate.value.phone
    }

    const idFinancial = financialEntityOptions.value.find(e => e.title === infoCandidate.value.financialEntity)

    const idTypeAccount = accountTypeOptions.value.find(e => e.title === infoCandidate.value.accountType)

    const idCandidate = dataCandidates.value.find(e => e.dni === infoCandidate.value.candidateDni)

    infoCandidate.value.idCandidat = idCandidate?.dni
    
    form.value = {
      id: infoCandidate.value.id,
      idCandidat: infoCandidate.value.idCandidat,
      inscriptionId: infoCandidate.value.inscriptionId,
      candidateDni: infoCandidate.value.candidateDni,
      dniManager: infoCandidate.value.dniManager,
      firstNameManager: infoCandidate.value.firstNameManager,
      secondNameManager: infoCandidate.value.secondNameManager,
      firstSurnameManager: infoCandidate.value.firstSurnameManager,
      secondSurnameManager: infoCandidate.value.secondSurnameManager,
      celularPhone: infoCandidate.value.celularPhone,
      phone: phone,
      email: infoCandidate.value.email,
      accountNumber: infoCandidate.value.accountNumber,
      financialEntity: idFinancial?.value,
      accountType: idTypeAccount?.value,
      dniCounter: infoCandidate.value.dniCounter,
      firstNameCounter: infoCandidate.value.firstNameCounter,
      secondNameCounter: infoCandidate.value.secondNameCounter,
      firstSurnameCounter: infoCandidate.value.firstSurnameCounter,
      secondSurnameCounter: infoCandidate.value.secondSurnameCounter,
      professionalCard: infoCandidate.value.professionalCard,
      numberBooksAccount: infoCandidate.value.numberBooksAccount,
      isCheck:infoCandidate.value.isCheck,
      inscriptionChangeId:props.inscriptionModifyId,
    }
  }
})
</script>

<template>
  <VDialog
    :model-value="modelValue"
    persistent
    class="v-dialog-xl"
    transition="dialog-top-transition"
    @update:model-value="toggleDialog"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="handleClose" />

    <!-- Dialog Content -->  
    <VImg :src="imageLogo" cover style="height: 200px;" />  
    <VCard class="px-5 py-5">
      <VForm id="formCampaign" @submit.prevent="handlerSubmit">
        <VCardText>
          <VRow>
            <VCol class="v-col-sm-3">
              Seleccione Candidatos
            </VCol>
            <VCol class="v-col-sm-5">
              <VSelect
                v-model="form.idCandidat"
                :items="candidatesOptions"
                :error-messages="v$.idCandidat.$errors[0]?.$message"
                :label="t('common.select_candidates')"
                :readonly="edit"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardTitle>
          {{ t('preinscription.grouping_political.dialog_info_g') }}
          <hr>
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol class="v-col-sm-4">
              <VTextField
                v-model="form.dniManager"
                clearable
                :label="t('preinscription.grouping_political.dni_manager')"
                color="primary"
                clear-icon="tabler-circle-x"
                append-icon="tabler-search"
                @click:append="searchDniManager"
                @click:clear="clearManagerDni"
                @keyup="resetSessionManager"
              />
            </VCol>
            <VCol>
              <VCheckbox v-model="form.isCheck" label="Aplicar para todos los candidatos" />
            </VCol>
          </VRow>
          <VRow>
            <VCol class="v-col-sm-3">
              <VTextField
                v-model="form.firstNameManager"
                :label="t('preinscription.representative.first_name')"
                readonly
              />
            </VCol>
            <VCol class="v-col-sm-3">
              <VTextField
                v-model="form.secondNameManager"
                :label="t('preinscription.representative.second_name')"
                readonly
              />
            </VCol>
            <VCol class="v-col-sm-3">
              <VTextField
                v-model="form.firstSurnameManager"
                :label="t('preinscription.representative.first_surname')"
                readonly
              />
            </VCol>
            <VCol class="v-col-sm-3">
              <VTextField
                v-model="form.secondSurnameManager"
                :label="t('preinscription.representative.second_surname')"
                readonly
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol class="v-col-sm-4">
              <VTextField
                v-model.trim="form.celularPhone"
                :label="t('preinscription.grouping_political.celular_phone')"
                prepend-inner-icon="tabler-device-mobile"
                :error-messages="v$.celularPhone.$errors[0]?.$message"
              />
            </VCol>
            <VCol class="v-col-sm-4">
              <LocalPhoneField
                v-model.trim="form.phone"
                :label="t('common.phone')"
                :error-messages="v$.phone.$errors[0]?.$message"
              />
            </VCol>
            <VCol class="v-col-sm-4">
              <VTextField
                v-model="form.email"
                :label="t('preinscription.grouping_political.email')"
                prepend-inner-icon="tabler-mail"
                :error-messages="v$.email.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardTitle>
          {{ t('preinscription.grouping_political.dialog_info') }}
          <hr>
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol class="v-col-sm-4">
              <VTextField
                v-model="form.accountNumber"
                :label="t('preinscription.grouping_political.number_account')"
              />
            </VCol>
            <VCol class="v-col-sm-4">
              <VSelect
                v-model="form.financialEntity"
                :items="financialEntityOptions"
                prepend-inner-icon="mdi-bank"
                :label="t('preinscription.grouping_political.financial_entity')"
              />
            </VCol>
            <VCol class="v-col-sm-4">
              <VSelect
                v-model="form.accountType"
                :items="accountTypeOptions"
                :label="t('preinscription.grouping_political.accountType')"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardTitle>
          Información Contador
          <hr>
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol class="v-col-sm-4">
              <VTextField
                v-model="form.dniCounter"
                clearable
                :label="t('preinscription.grouping_political.dni')"
                color="primary"
                clear-icon="tabler-circle-x"
                append-icon="tabler-search"
                @click:append="searchDniCounter"
                @click:clear="clearCounterDni"
                @keyup="resetSessionCounter"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol class="v-col-sm-3">
              <VTextField
                v-model="form.firstNameCounter"
                :label="t('preinscription.representative.first_name')"
                readonly
              />
            </VCol>
            <VCol class="v-col-sm-3">
              <VTextField
                v-model="form.secondNameCounter"
                :label="t('preinscription.representative.second_name')"
                readonly
              />
            </VCol>
            <VCol class="v-col-sm-3">
              <VTextField
                v-model="form.firstSurnameCounter"
                :label="t('preinscription.representative.first_surname')"
                readonly
              />
            </VCol>
            <VCol class="v-col-sm-3">
              <VTextField
                v-model="form.secondSurnameCounter"
                :label="t('preinscription.representative.second_surname')"
                readonly
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol class="v-col-sm-4">
              <VTextField
                v-model="form.professionalCard"
                :label="t('preinscription.grouping_political.professional_card')"
                prepend-inner-icon="mdi-card-account-details-outline"
              />
            </VCol>
          </VRow>
        </VCardText>
        <div class="text-end">
          <VCardText class="d-flex justify-end flex-wrap gap-3">
            <VBtn color="secondary" variant="tonal" @click="handleClose">
              Cancelar
            </VBtn>
            <VBtn type="submit" class="notAllowedEmulator">
              Guardar
            </VBtn>
          </VCardText>
        </div>
      </VForm>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.justify-content-between {
  justify-content: space-between !important;
}

.d-flex {
  display: flex !important;
}

.text-end {
  text-align: end !important;
}

.text-center {
  text-align: center !important;
}
</style>
