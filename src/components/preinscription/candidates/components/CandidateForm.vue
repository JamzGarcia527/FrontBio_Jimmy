<script setup>
import { useI18n } from 'vue-i18n'
import { useVuelidate } from "@vuelidate/core"
import useEventBus from "@/utils/eventBus"

import {
  requiredVuelidate,
  integerVuelidate,
  emailVuelidate,
  dateFormatVuelidate,
  requiredIfVuelidate,
} from "@/utils/validators/vuelidate"
import { useInscription } from '@/stores/inscription'
import { helpers, minValue } from '@vuelidate/validators'
import AniFinderField from '@/components/shared/AniFinderField.vue'
import LocalPhoneField from '@/components/shared/LocalPhoneField.vue'
import { keyPressOnlyNumber, pasteOnlyNumber } from '@/utils/events'
import Swal from '@/plugins/sweetalert2'
import { useGeneralFilter } from '@/stores/generalfilter'
import axios from "@/plugins/axios"
import { useCustomMessage } from "@/composables/useCustomMessage"
import banner from '@images/pages/dialog-banner-sm.webp'
import { onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  data: { type: Object, default: () => {} },
})

const emit = defineEmits(['update:model-value'])

const { modelValue } = toRefs(props)
const messageComposable = useCustomMessage()
const { t } = useI18n()
const { emit: emiting } = useEventBus()
const inscriptionStore = useInscription()
const generalfilterStore = useGeneralFilter()
const groupingPoliticalsByCoalition = ref([])

const inscriptionId = computed(() => inscriptionStore.inscriptionId)
const isUninominal = computed(() => inscriptionStore.isUninominal)
const isPreferentialVote = computed(() => inscriptionStore.isPreferentialVote)
const minAgeCandidate = computed(() => inscriptionStore.minAgeCandidate)
const candidatesDni = computed(() => inscriptionStore.candidates.list.map(e => e.dni))
const genders = computed(() => generalfilterStore.genders.map(e => ({ title: e.description, value: e.id })))
const isCoalition = computed(() => inscriptionStore.isCoalition)

const groupingPoliticals = computed(() => {
  return groupingPoliticalsByCoalition.value
    .map(e => ({ title: `${e.id} - ${e.name}`, value: e.id }))
})

const availableRows = computed(() => {
  const { rowField } = form.value 
  const { limitCandidate } = inscriptionStore.information
  const { list: candidates } = inscriptionStore.candidates
  const disableRows = candidates.map(e => e.rowField)
  const availableRows = []
  
  for (let i = 1; i <= limitCandidate; i++) {
    if (rowField == i || !disableRows.includes(i))
      availableRows.push({ title: `Renglón ${i}`, value: i })
  }
  
  return availableRows
})

const isDoubleMilitancy = ref(false)
const messageDoubleMilitancy = messageComposable.get("MS0025")

const isDoubleRegistry = ref(false)
const messageDoubleRegistry = messageComposable.get("MS0026")

const isModeEdit = computed(() => Boolean(props.data.id))
const isLoading = ref(false)
const form = ref({})

const rules = computed(() => ({
  dni: { 
    requiredVuelidate, 
    integerVuelidate, 
    minLength: helpers.withMessage("La cedula de ciudadania no debe contener más de 12 dígitos",
      value => !value || String(value).length <= 12,
    ), 
    exists: helpers.withMessage("Número de cédula ingresado ya esta en la lista de candidatos.", 
      value => isModeEdit.value || !candidatesDni.value.includes(value),
    ),
  },
  dniexpdate: { requiredVuelidate, dateFormatVuelidate },
  rowField: { requiredVuelidate, integerVuelidate },
  firstname: { requiredVuelidate },
  firstsurname: { requiredVuelidate },
  birthdate: { requiredVuelidate, dateFormatVuelidate },
  gender: { requiredVuelidate },
  age: { 
    requiredVuelidate,  
    minValue: helpers.withMessage(`Edad mínima requerida ${minAgeCandidate.value} años.`, minValue(minAgeCandidate.value)),
  },
  email: { requiredVuelidate, emailVuelidate },
  emailConfirm: {
    requiredVuelidate,
    emailVuelidate,
    emailConfirm: helpers.withMessage(t("validations.email_confirm_is_not_valid"), value => value && value == form.value.email),
  },
  phone: {
    integerVuelidate,
    required: helpers.withMessage(t("validations.mobile_or_phone"), value => value || form.value.localphone),
    length: helpers.withMessage("El número de celular debe contener 10 dígitos", value => !value || String(value).length === 10),
  },
  localphone: {
    integerVuelidate,
    required: helpers.withMessage(t("validations.mobile_or_phone"), value => value || form.value.phone),
    length: helpers.withMessage("El número de teléfono debe contener 7 dígitos", value => !value || String(value).length === 10),
  },
  groupingPoliticalId: {
    required: requiredIfVuelidate(isCoalition, 'Campo requerido'),
  },
}))

const v$ = useVuelidate(rules, form)

const defaultDiffFocus = {
  focusVictim: 3,
  focusRacial: 11,
  focusDisability: 19,
  focusLgtbiqIdentity: 26,
  focusLgtbiqOrientation: 33,
}

const disableDiffFocus = ref(true)

const optionsFocusVictim =  computed(() => {
  const item = generalfilterStore.differentialFocus.find(e => e.id == 1)
  
  return item.children
    .filter(e => e.active)
    .map(({ code, name }) => ({ title: name, value: code }))
})

const optionsFocusRacial =  computed(() => {
  const item = generalfilterStore.differentialFocus.find(e => e.id == 2)

  return item.children
    .filter(e => e.active)
    .map(({ code, name }) => ({ title: name, value: code }))
})

const optionsFocusDisability =  computed(() => {
  const item = generalfilterStore.differentialFocus.find(e => e.id == 3)

  return item.children
    .filter(e => e.active)
    .map(({ code, name }) => ({ title: name, value: code }))
})

const optionsFocusIdentity =  computed(() => {
  const item = generalfilterStore.differentialFocus.find(e => e.id == 4)

  return item.children
    .filter(e => e.active)
    .map(({ code, name }) => ({ title: name, value: code }))
})

const optionsFocusOrientation =  computed(() => {
  const item = generalfilterStore.differentialFocus.find(e => e.id == 6)

  return item.children
    .filter(e => e.active)
    .map(({ code, name }) => ({ title: name, value: code }))
})

const toggleDiffFocus = value => {
  if (value) {
    form.value = { 
      ...form.value,
      ...defaultDiffFocus,
    }
  }
}

const title = computed(() => {
  return props.data?.id 
    ? t('candidates.edit_candidate') 
    : t('candidates.add_candidate')
})

const handlerAniFound = value => {
  if (value) {
    const { ani, age, doubleRegistry, doubleMilitancy } = value

    isDoubleRegistry.value = doubleRegistry
    isDoubleMilitancy.value = doubleMilitancy

    form.value = { 
      ...form.value, 
      firstname: ani.first_name, 
      secondname: ani.second_name, 
      firstsurname: ani.first_surname,
      secondsurname: ani.second_surname,
      dniexpdate: ani.expedition_date,
      birthdate: ani.birthdate,
      gender: ani.gender,
      birthdate: ani.birthdate,
      age: age,
    }
  }
}

const handlerOpen = () => {
  v$.value.$reset()
  isDoubleRegistry.value = false
  isDoubleMilitancy.value = false
  
  const defaultRow = !isUninominal.value && availableRows.value.length > 0 
    ? availableRows.value[0].value : 1

  form.value = { 
    rowField: defaultRow, 
    ...defaultDiffFocus,
    ...props.data, 
    emailConfirm: props.data.email, 
  }

  if (form.value.id) {
    disableDiffFocus.value = form.value.focusVictim == defaultDiffFocus.focusVictim
      && form.value.focusRacial == defaultDiffFocus.focusRacial
      && form.value.focusDisability == defaultDiffFocus.focusDisability
      && form.value.focusLgtbiqIdentity == defaultDiffFocus.focusLgtbiqIdentity
      && form.value.focusLgtbiqOrientation == defaultDiffFocus.focusLgtbiqOrientation
  } else {
    disableDiffFocus.value = true
  }
}

const getGroupingPoliticalsByCoalitions = async () => {

  const requestParams = {
    inscriptionId: inscriptionId.value,
  }

  const { data } = await axios.get('/v1/coalitions/list-filter/byInscriptions', { params: requestParams })

  groupingPoliticalsByCoalition.value = data
}

const handlerClose = () => {
  emit('update:model-value', false)
}


const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true

  inscriptionStore
    .saveCandidate(form.value)
    .then(() => {
      v$.value.$reset()  
      form.value = {}
      isDoubleRegistry.value = false
      isDoubleMilitancy.value = false
      emiting('updateCandidate', true)
      handlerClose()
    }).catch(error => {
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: "warning", text: message })
      }
    }).finally(() => isLoading.value = false)
}

const handlerReset = () => {
  handlerOpen()
}

onMounted(async () => {
  await getGroupingPoliticalsByCoalitions()
})

watch(modelValue, value => {
  if (value) handlerOpen()
})
</script>

<template>
  <VDialog
    :model-value="modelValue"
    persistent
    class="v-dialog-lg"
    transition="dialog-bottom-transition"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="handlerClose" />

    <!-- Dialog Content -->
    <VCard>
      <VImg :src="banner" height="90" cover />
      <VCardItem>
        <VCardTitle class="text-center">
          {{ title }}
        </VCardTitle>
      </VCardItem>
      <div>
        <VAlert 
          v-if="isDoubleRegistry || isDoubleMilitancy"
          type="warning" 
          variant="tonal" 
          class="text-body-2 mt-2"
          rounded="0" 
        >
          <div v-if="isDoubleRegistry">
            {{ messageDoubleRegistry }}
          </div>
          <div v-if="isDoubleMilitancy">
            {{ messageDoubleMilitancy }}
          </div>
        </VAlert>
      </div>
      <VForm @submit.prevent="handlerSubmit">
        <VCardText>
          <VRow>
            <VCol cols="12" md="6">
              <AniFinderField
                v-model.trim="form.dni"
                :base-url="`/v1/candidates/validate/${inscriptionId}/ani`"
                :label="`${t('candidates.form.dni')} *`"
                :error-messages="v$.dni.$errors[0]?.$message"
                :readonly="isModeEdit"
                @update:model-value="v$.dni.$touch"
                @found="handlerAniFound"
              />
            </VCol>
            <VCol cols="12" :md="isUninominal ? 6 : 3">
              <VTextField
                v-model.trim="form.dniexpdate"
                type="date"
                :label="`${t('candidates.form.dniexpdate')} *`"
                :error-messages="v$.dniexpdate.$errors[0]?.$message"
                class="readonly-control"
                readonly
              />
            </VCol>
            <VCol v-if="!isUninominal" cols="12" md="3">
              <VSelect
                v-model="form.rowField"
                :label="`${t('candidates.form.rowField')} *`"
                :items="availableRows"
                :error-messages="v$.rowField.$errors[0]?.$message"
                :class="{ 'readonly-control': !isPreferentialVote }"
                :readonly="!isPreferentialVote"
              />
            </VCol>

            <VCol cols="12" md="3">
              <VTextField
                v-model.trim="form.firstname"
                :label="`${t('candidates.form.firstname')} *`"
                :error-messages="v$.firstname.$errors[0]?.$message"
                class="readonly-control"
                readonly
              />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model.trim="form.secondname"
                :label="$t('candidates.form.secondname')"
                class="readonly-control"
                readonly
              />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model.trim="form.firstsurname"
                :label="`${t('candidates.form.firstsurname')} *`"
                :error-messages="v$.firstsurname.$errors[0]?.$message"
                class="readonly-control"
                readonly
              />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model.trim="form.secondsurname"
                :label="t('candidates.form.secondsurname')"
                class="readonly-control"
                readonly
              />
            </VCol>
            
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.birthdate"
                type="date"
                :label="`${t('candidates.form.birthdate')} *`"
                :error-messages="v$.birthdate.$errors[0]?.$message"
                class="readonly-control"
                readonly
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.age"
                :label="`${t('candidates.form.age')} *`"
                :error-messages="v$.age.$errors[0]?.$message"
                class="readonly-control"
                readonly
              />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect
                v-model.trim="form.gender"
                :label="`${t('candidates.form.gender')} *`"
                :items="genders"
                :error-messages="v$.gender.$errors[0]?.$message"
                class="readonly-control"
                readonly
              />
            </VCol>
            
            <VCol v-if="isCoalition" cols="12" md="12">
              <VSelect
                v-model.trim="form.groupingPoliticalId"
                :label="`${t('candidates.form.grouping_political')} *`"
                :items="groupingPoliticals"
                :error-messages="v$.groupingPoliticalId.$errors[0]?.$message"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model.trim="form.email"
                :label="`${t('candidates.form.email')} *` "
                :error-messages="v$.email.$errors[0]?.$message"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model.trim="form.emailConfirm"
                :label="`${t('candidates.form.emailConfirm')} *`"
                :error-messages="v$.emailConfirm.$errors[0]?.$message"
              />
            </VCol>
            
            <VCol cols="12" md="6">
              <VTextField
                v-model.trim="form.phone"
                :label="t('candidates.form.phone')"
                :error-messages="v$.phone.$errors[0]?.$message"
                @keypress="keyPressOnlyNumber"
                @paste="pasteOnlyNumber"
              />
            </VCol>
            <VCol cols="12" md="6">
              <LocalPhoneField
                v-model.trim="form.localphone"
                :label="t('candidates.form.localphone')"
                :error-messages="v$.localphone.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText>
          <VCard variant="outlined" class="pa-4 rounded-xl">
            <p class="font-weight-semibold text-body-1 text-center">
              ENFOQUE DIFERENCIAL
            </p>
            <VRow>
              <VCol cols="12">
                <VCheckbox
                  v-model="disableDiffFocus"
                  :label="t('candidates.form.label_check_differential_focus')"
                  @update:model-value="toggleDiffFocus"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="form.focusVictim"
                  :label="t('candidates.form.focus_victim')"
                  :items="optionsFocusVictim"
                  :disabled="disableDiffFocus"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="form.focusRacial"
                  :label="t('candidates.form.focus_racial')"
                  :items="optionsFocusRacial"
                  :disabled="disableDiffFocus"
                />
              </VCol>
              <VCol cols="12">
                <VSelect
                  v-model="form.focusDisability"
                  :label="t('candidates.form.focus_disability')"
                  :items="optionsFocusDisability"
                  :disabled="disableDiffFocus"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="form.focusLgtbiqIdentity"
                  :label="t('candidates.form.focus_identity')"
                  :items="optionsFocusIdentity"
                  :disabled="disableDiffFocus"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="form.focusLgtbiqOrientation"
                  :label="t('candidates.form.focus_orientation')"
                  :items="optionsFocusOrientation"
                  :disabled="disableDiffFocus"
                />
              </VCol>
            </VRow>
          </VCard>
        </VCardText>
        <VCardText class="text-center">
          <VBtn
            class="mx-2"
            variant="outlined"
            @click="handlerReset"
          >
            Limpiar
          </VBtn>
          <VBtn type="submit" class="mx-2 notAllowedEmulator" :loading="isLoading">
            Guardar
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
