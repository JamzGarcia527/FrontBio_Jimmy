<script setup>
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useGeneralFilter } from "@/stores/generalfilter"
import LocalPhoneField from "@/components/shared/LocalPhoneField.vue"
import { useVuelidate } from "@vuelidate/core"
import { helpers } from "@vuelidate/validators"
import { keyPressOnlyNumber, pasteOnlyNumber } from "@/utils/events"

import {
  requiredVuelidate,
  requiredSelectVuelidate,
  integerVuelidate,
  emailVuelidate,
} from "@/utils/validators/vuelidate"

const props = defineProps({
  groupingPoliticalId: { type: String, default: "" },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['next'])
const { t } = useI18n()
const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})
  
const groupingPoliticalId = toRefs(props).groupingPoliticalId
const disabled = groupingPoliticalId != null
const form = ref({})
  

const rules = reactive({
  name: { requiredVuelidate },
  blankVotePromoter: { requiredSelectVuelidate },
  logoUp: { requiredSelectVuelidate },
  state: { requiredSelectVuelidate },
  representativeDni: { requiredVuelidate },
  contactName: { requiredVuelidate },
  address: { requiredVuelidate },
  deptoId: { requiredSelectVuelidate },
  muniId: { requiredSelectVuelidate },
  email: { requiredVuelidate, emailVuelidate },
  alternateEmail: {
    requiredVuelidate,
    emailVuelidate,
    diffEmail: helpers.withMessage(
      t("validations.alternative_mail_must_be_different"),
      value => value && value != form.value.email,
    ),
  },
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
      "El número de celular debe contener 7 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}





const blankVotePromoterOptions = computed(() => {
  const array = [
    { title: 'SÍ', value: 'true' },
    { title: 'NO', value: 'false' },
  ]

  return addOptionDefault(array)
})

const logoUpOptions = computed(() => {
  const array = [
    { title: 'SÍ', value: 'true' },
    { title: 'NO', value: 'false' },
  ]

  return addOptionDefault(array)
})

const stateOptions = computed(() => {
  const array = [
    { title: 'Activo', value: 'A' },
    { title: 'Inactivo', value: 'I' },
  ]

  return addOptionDefault(array)
})

const departmentsOptions = computed(() => {
  const array = generalfilter
    .departments
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.select_write_option'), value: -1 }, ...array ]
})

const municipalitiesOptions = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.select_write_option'), value: -1 }, ...array ]
})

const dataFilters = async () => {
  try {
    const { data } = await axios.get('/filters/user-data')

    dataGroupingPolitical()
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || 'No existen agrupaciones políticas.',
      })
    }
  }
}

const dataGroupingPolitical = async () => {
  try {
    const { data } = await axios.get(`/grouping-political/`+groupingPoliticalId.value)

    const code = data.id
    const name = data.name
    const groupingPoliticalType = data.grouping_political_type
    const personage = data.personage
    const blankVotePromoter = data.blank_vote_promoter.toString()
    const logoUp = data.logo_up.toString()
    const representativeDni = data.representative_dni
    const contactName = data.representative_name
    const address = data.address
    const deptoId = data.department_id
    const muniId = data.municipality_id
    const phone = data.phone
    const celularPhone = data.celular_phone
    const email = data.email
    const alternateEmail = data.alternate_email
    const state = data.state
    const is_committee = data.is_committee

    form.value = {
      code,
      name,
      groupingPoliticalType,
      personage,
      blankVotePromoter,
      logoUp,
      state,
      representativeDni,
      contactName,
      address,
      deptoId,
      muniId,
      celularPhone,
      phone,
      email,
      alternateEmail,
      is_committee,
    }
    generalfilter.setDepartment(deptoId)
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || 'No existen agrupaciones políticas.',
      })
    }
  }
}

dataFilters()

const v$ = useVuelidate(rules, form)

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return
  emit('next', { form: form })
}

function ConvertUppercase(events){
  form.value.name = events.target.value.toUpperCase()
}
</script>

<template>
  <VCard class="pa-5">
    <VForm @submit.prevent="handlerSubmit">
      <VRow class="mb-3">
        <VCol cols="12" md="6">
          <VCard class="pa-5">
            <p>Datos de la Agrupación Política</p>

            <VTextField
              v-show="false"
              v-model="form.code"
              :label="t('common.code_grouping_political')"
              :disabled="disabled"
              class="mb-2 required"
            />
            
            <VTextField
              v-model="form.name"
              :label="t('common.grouping_political_name')"
              :error-messages="v$.name.$errors[0]?.$message"
              class="mb-2 required"
              @input="ConvertUppercase"
            />
            
            
            <VSelect
              v-model="form.blankVotePromoter"
              :label="t('common.blank_vote_promoter')"
              :items="blankVotePromoterOptions"
              :error-messages="v$.blankVotePromoter.$errors[0]?.$message"
              class="mb-2 required"
            />
            
            <VSelect
              v-model="form.logoUp"
              :label="t('common.load_logo_or_symbol')" :items="logoUpOptions"
              :error-messages="v$.logoUp.$errors[0]?.$message"
              class="mb-2 required"
            />

            <VSelect
              v-model="form.state"
              :label="t('preinscription.grouping_political.state')" :items="stateOptions"
              :error-messages="v$.state.$errors[0]?.$message"
              class="mb-2 required"
            />
          </VCard>
        </VCol>
        <VCol cols="12" md="6">
          <VCard class="pa-5">
            <p>Datos de Contacto / Representante de la Agrupación Política</p>
            
            <VTextField
              v-show="false"
              v-model="form.representativeDni"
              :label="t('preinscription.representative.dni')"
              :disabled="disabled"
              :error-messages="v$.representativeDni.$errors[0]?.$message"
              class="mb-2 required"
            />
            
            <VTextField
              v-model="form.contactName"
              :label="t('common.name')"
              :error-messages="v$.contactName.$errors[0]?.$message"
              class="mb-2 required"
            />
            
            <VTextField
              v-model="form.address"
              :label="t('common.address')"
              :error-messages="v$.address.$errors[0]?.$message"
              class="mb-2 required"
            />
            
            <VAutocomplete
              v-model="form.deptoId"
              :label="t('common.department')"
              filter-mode="some"
              :items="departmentsOptions"
              :error-messages="v$.deptoId.$errors[0]?.$message"
              class="mb-2 required" @update:model-value="(value) => {
                generalfilter.setDepartment(value)
                form.muniId = -1
              }"
            />
            
            <VAutocomplete
              v-model="form.muniId"
              :label="t('common.municipality')"
              filter-mode="some"
              :items="municipalitiesOptions"
              :error-messages="v$.muniId.$errors[0]?.$message"
              class="mb-2 required"
              @update:model-value="generalfilter.setMunicipality"
            />
            
            <VTextField
              v-model="form.celularPhone"
              :label="t('common.celular_phone')"
              class="mb-2 required"
              :error-messages="v$.celularPhone.$errors[0]?.$message"
              @keypress="keyPressOnlyNumber"
              @paste="pasteOnlyNumber"
            />
            
            <LocalPhoneField
              v-model.trim="form.phone"
              :label="t('common.phone')"
              :error-messages="v$.phone.$errors[0]?.$message"
              class="mb-2"
            />
            
            <VTextField
              v-model.trim="form.email"
              :label="t('preinscription.grouping_political.email')" class="mb-2 required"
              :error-messages="v$.email.$errors[0]?.$message"
            />
            
            <VTextField
              v-model.trim="form.alternateEmail"
              :label="t('preinscription.grouping_political.alternative_email')"
              class="mb-2 required"
              :error-messages="v$.alternateEmail.$errors[0]?.$message"
            />
          </VCard>
        </VCol>
      </VRow>
      <VRow>
        <VCol class="d-flex align-center">
          <VBtn type="submit" class="notAllowedEmulator" :loading="loading">
            Guardar
          </VBtn>
          <VBtn :to="{name: 'list-political-groups'}" class="mr-3 ml-3">
            Cancelar
          </VBtn>
        </VCol>
      </VRow>
    </VForm>
  </VCard>
</template>
