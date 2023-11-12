<script setup>
import { isNullOrUndefined, isEmptyArray , strPad } from '@/utils/index'
import LocalPhoneField from '@/components/shared/LocalPhoneField.vue'
import axios from '@/plugins/axios'
import DataTable from '@/components/shared/DataTable.vue'
import Swal from '@/plugins/sweetalert2'
import { useRouter } from 'vue-router'
import { helpers } from "@vuelidate/validators"
import { useVuelidate } from '@vuelidate/core'
import { useGeneralFilter } from "@/stores/generalfilter"
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import { keyPressOnlyNumber, pasteOnlyNumber } from "@/utils/events"
import { useCustomMessage } from "@/composables/useCustomMessage"

// Validators
import {
  requiredVuelidate,
  requiredSelectVuelidate,
  emailVuelidate,
  integerVuelidate,
} from '@/utils/validators/vuelidate'

// Translate i18n
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const generalfilter = useGeneralFilter()
const generalFilterComposable = useGeneralFilterComposable()
const router = useRouter()
const messageComposable = useCustomMessage()
const listDepartments = ref([{ title: t("common.select_write_option"), value: -1 }])

const requiredVuelidateOther = helpers.withMessage('Este campo es requerido', value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false || value === -2 ) 
    return false
  
  return String(value).trim().length > 0
})

const isLoading = ref(false)
const formDisabled = ref(false)
const disabledButton = ref(false)

const fields = computed(() => {
  const baseFields = [
    { key: 'groupingPoliticalCode', label: t('coalitions.table.grouping_political_code') },
    { key: 'groupingPoliticalDescription', label: t('coalitions.table.grouping_political_description') },
    { key: 'responsible', label: t('coalitions.table.responsible'), thClass: 'text-center' },
    { key: 'responsibleAccount', label: t('coalitions.table.responsible_account'), thClass: 'text-center' },
    { key: 'vote', label: t('coalitions.table.vote'), thClass: 'text-center' },
    { key: 'actions', label: t('coalitions.table.actions'), thClass: 'text-center' },
  ]

  // Verificar si form.value.coalitionType es igual a 0 para ocultar la columna 'vote'
  if (form.value.coalitionType === 0) {
    return baseFields.filter(field => field.key !== 'vote')
  }

  // Si form.value.coalitionType no es igual a 0, se muestran todos los campos
  return baseFields
})

const items = ref([])

const coalitionTypes = [
  { title: t('common.select_one_option'), value: -2 },
  { title: t('common.all_option'), value: -1 },
  { title: 'Cargo', value: 0 },
  { title: 'Corporación', value: 1 },
]


const lockResponsibleCheck = ref(false)

const subForm = ref({
  groupingPolitialType: -1,
  groupingPoliticalSelected: -1,
  votes: 0,
})

const subRules = computed(() => ({
  groupingPolitialType: { requiredSelectVuelidate },
  groupingPoliticalSelected: { requiredSelectVuelidate },
  votes: { integerVuelidate },
}))

const vSub$ = useVuelidate(subRules, subForm)

const form = ref({
  coalitionCode: null,
  listGroupingPoliticals: [],
  department: -1,
  coalitionType: -2,
  corporation: -2,
  municipality: -1,
  departmentCoalition: -1,
  municipalityCoalition: -1,
  communes: -1,
})

const rules = computed(() => ({
  coalitionName: { requiredVuelidate },
  coalitionType: { requiredVuelidateOther },
  corporation: { requiredVuelidateOther },
  email: { requiredVuelidate, emailVuelidate },
  alternateEmail: {
    requiredVuelidate, emailVuelidate,
    confirmedEmail: helpers.withMessage('Correo electrónico debe ser diferente', value => value && value != form.value.email),
  },
  responsibleName: { requiredVuelidate },
  responsibleDni: { requiredVuelidate, integerVuelidate },
  address: { requiredVuelidate },
  phone: {
    required: helpers.withMessage(
      t("validations.mobile_or_phone"),
      value => value || form.value.localPhone,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de celular debe contener 10 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  localPhone: {
    required: helpers.withMessage(
      t("validations.mobile_or_phone"),
      value => value || form.value.phone,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de teléfono debe contener 7 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  listGroupingPoliticals: {
    required: helpers.withMessage(
      t("validations.grouping_political_major_one"),
      value => !value || value.length > 1,
    ),
  },
  vote: { integerVuelidate },
}))

const v$ = useVuelidate(rules, form)


const committeeTypes = [2, 3]

const hasCommittee = computed(() => form.value.listGroupingPoliticals
  .some(e => committeeTypes.includes(e.groupingPoliticalType)))

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})


const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const addOptionAllDefault = array => {
  return [ { title: t('common.all_option'), value: -1 }, ...array]
}

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter.groupingPoliticalTypes
    .filter(e => e.id != 4)
    .filter(e => !hasCommittee.value || e.id == 1)
    .filter(e => form.value.coalitionType == 0 && committeeTypes.includes(e.id) || e.id == 1)
    .map(e => ({ title: `${e.id} - ${e.name}`, value: e.id }))

  return addOptionDefault(array)
})

const groupingPoliticals = computed(() => {
  const array = generalfilter.groupingPoliticals
    .filter(e => e.groupingPoliticalType == subForm.value.groupingPolitialType)
    .filter(e => !items.value.map(a => a.groupingPoliticalCode).includes(e.id))
    .map(e => ({ title: `${e.id} - ${e.name}`, value: e.id }))

  return addOptionDefault(array)
})

const corporations = computed(() => {

  const { coalitionType } = form.value
   
  if (coalitionType == -1) {
    form.value.corporation = -1
    
    return [{ title: t('common.all_option'), value: -1 }]
  }

  form.value.corporation = -2

  const array = generalfilter
    .corporations
    .filter(e => {
      if (form.value.coalitionType == 0) {
        return e.id === 1 || e.id === 3
      } else if (form.value.coalitionType == 1) {
        return e.id === 2 || e.id === 4 || e.id === 5
      } else {
        return false
      }
    })
    .map(e => ({ title: e.name, value: e.id }))

  return [ { title: t('common.select_one_option'), value: -2 }, ...addOptionAllDefault(array)]
})


const disabled = computed (()=>{
  return !(form.value.corporation === 5)
})

const departments = computed(() => {
  const array = generalfilter
    .departments
    .map(e => ({ title: e.name, value: e.id }))

  
  return addOptionAllDefault(array)
})

const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionAllDefault(array)
})

const listMunicipalities = ref([{ title: t('common.select_write_option'), value: -1 }])

const handlerChangeDeparmentCoalition = value => {
  generalFilterComposable
    .getMunicipalitiesFromApi(strPad(value, 2,'0'))
    .then(data => {
      const array = data.map(e => ({ title: e.name, value: Number(e.id) }))

      listMunicipalities.value = [{ title: t('common.select_write_option'), value: -1 }, ...array ]
    })
}

const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionAllDefault(array)
})

const circunscriptions = computed(() => {

  const { corporation } = form.value

  if (corporation === -1) {
    generalfilter.setCircunscription(-1)
    
    return [{ title: t('common.all_option'), value: -1 }]
  }

  const array = generalfilter
    .circunscriptionsByCorporation
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const addGroupingPoliticalSelected = () => {
  
  vSub$.value.$touch()
  if (vSub$.value.$invalid) return

  const groupingPolitical = generalfilter
    .groupingPoliticals
    .find(e => e.id == subForm.value.groupingPoliticalSelected)

  if (groupingPolitical) {
    items.value.push({
      "groupingPoliticalType": subForm.value.groupingPolitialType,
      "groupingPoliticalCode": groupingPolitical.id,
      "groupingPoliticalDescription": groupingPolitical.name,
      "groupingPoliticalVotes": Number(subForm.value.votes) || 0,
    })
    form.value.listGroupingPoliticals = items.value
    if (committeeTypes.includes(subForm.value.groupingPolitialType)) {
      changeResponsible(groupingPolitical.id, true)
      lockResponsibleCheck.value = true
    }
  }

  
  // groupingPoliticalSelected.value = null
  // votes.value = 0
  vSub$.value.$reset()
  subForm.value = {
    groupingPolitialType: -1,
    groupingPoliticalSelected: -1,
    votes: 0,
  }
}



const removeGroupingPoliticalSelected = value => {
  const itemFilters = items.value.filter(e => e.groupingPoliticalCode != value)

  items.value = itemFilters
  form.value.listGroupingPoliticals = items.value
  lockResponsibleCheck.value = hasCommittee.value
}

const changeResponsible = (id, value) => {
  for (const item of items.value) {
    item.responsible = value && id == item.groupingPoliticalCode
  }
  form.value.listGroupingPoliticals = items.value
}

const changeresponsibleAccount = (id, value) => {
  for (const item of items.value) {
    item.responsibleAccount = value && id == item.groupingPoliticalCode
  }
  form.value.listGroupingPoliticals = items.value
}

// Save coalition to database
const handlerSubmit = async () => {
  
  v$.value.$touch()
  if (v$.value.$invalid) return

  const {
    listGroupingPoliticals,
    coalitionName,
    department,
    municipality,
    communes,
    address,
    localPhone,
    phone,
    responsibleName,
    responsibleDni,
    ...result
  } = form.value
  
  const responsible = listGroupingPoliticals.find(e => e.responsible == 1)
  const responsibleAccount = listGroupingPoliticals.find(e => e.responsibleAccount == 1)

  if (!responsible || responsible == null) {

    // TODO: Pasar los mensajes por DB
    Swal.fire({
      icon: 'warning',
      text: t('coalitions.alert_no_responsible'),
    })

    return 
  }

  if (!responsibleAccount || responsibleAccount == null) {

    // TODO: Pasar los mensajes por DB
    Swal.fire({
      icon: 'warning',
      text: t('coalitions.alert_no_responsible_clear_account'),
    })

    return 
  }
 
  if (form.value.corporation == 5  && communes == null) {

    // TODO: Pasar los mensajes por DB
    Swal.fire({
      icon: 'warning',
      text: t('coalitions.commune_field'),
    })

    return 
  }

  const groupingPoliticals = listGroupingPoliticals.map(e => {
    return {
      groupingPoliticalId: e.groupingPoliticalCode,
      votes: e.groupingPoliticalVotes,
      responsible: responsible.groupingPoliticalCode == e.groupingPoliticalCode ? 1 : 0,
      responsibleAccount: responsibleAccount.groupingPoliticalCode == e.groupingPoliticalCode ? 1 : 0,
    }
  })

  isLoading.value = true
  formDisabled.value = true
  disabledButton.value = true

  const requestBody = {
    ...result,
    name: coalitionName,
    departmentId: department,
    municipalityId: municipality,
    commune: communes,
    circunscription: generalfilter.idCircunscription,
    address: address,
    phone: localPhone, 
    celularPhone: phone,
    personage: false,
    blankVotePromoter: false,
    logoUp: false,
    representativeName: responsibleName,
    representativeDni: responsibleDni,
    groupingPoliticals: groupingPoliticals,
  }

  try {
    const response = await axios.post('/v1/coalitions/grouping-political', requestBody)
    if (response.status == 201) {
      form.value.coalitionCode = response.data.groupingpoliticalId
      await Swal.fire({
        icon: 'success',
        title: `Coalición #${form.value.coalitionCode}`,
        text: messageComposable.get("MS0015"),
      })
    }
  } catch (error) {
    formDisabled.value = false
    disabledButton.value = false
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    } else {
      await Swal.fire({
        icon: 'warning',
        text: tmessageComposable.get("MS0016"),
      })
    }
    
    return false
  } finally {
    isLoading.value = false 
    clearForm()
  }
}

const clearForm = () => {
  form.value = {
    coalitionCode: null,
    listGroupingPoliticals: [],
    department: null,
    coalitionType: null,
    corporation: null,
    municipality: null,
    communes:null,
  }
  formDisabled.value = false
  items.value = []
  disabledButton.value = false
  v$.value.$reset()
  generalfilter.initSelected()
}



const backListPage = () => {
  router.push({ name: "coalition-list" })
} 

const informationCandidate = ()  => {

  const value = 4

  axios
    .get(`/grouping-political/next-id?groupingPoliticalId=${value}`)
    .then(({ data }) => {
      form.value.coalitionCode = data
    }).catch(error => {
    
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: "warning", text: message })
      }
    })
}

onMounted(() => {
  informationCandidate()

  generalFilterComposable
    .getDepartmentsFromApi()
    .then(data => {
      const array = data.map(e => ({ title: e.name, value: Number(e.id) }))

      listDepartments.value = [{ title: t('common.select_write_option'), value: -1 }, ...array ]
    })
})
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ t('coalitions.breadcrumbs.title'), t('coalitions.breadcrumbs.page') ]" />
    <VCard>
      <VCardText>
        <VForm ref="refForm" :disabled="formDisabled" class="mb-4" @submit.prevent="handlerSubmit">
          <VCol
            cols="12"
          >
            <p class="font-weight-normal text-bold">
              DATOS DE LA INSCRIPCIÓN
            </p>
            <VDivider />
          </VCol>
          <VRow class="mt-2">
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.coalitionCode"
                :label="t('coalitions.form.coalition_code')"
                :placeholder="t('coalitions.form.coalition_code')"
                readonly
                disabled="true"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.coalitionName"
                clearable
                :label="t('coalitions.form.coalition_name')"
                :placeholder="t('coalitions.form.coalition_name')"
                :error-messages="v$.coalitionName.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VSelect
                v-model="form.coalitionType"
                clearable 
                :items="coalitionTypes" 
                :label="t('coalitions.form.coalition_type')" 
                :error-messages="v$.coalitionType.$errors[0]?.$message"
                @update:model-value="() => form.corporation = null"
              />
            </VCol>
            <VCol
              md="4"
              cols="12"
            >
              <VSelect 
                v-model="form.corporation"
                :label="t('coalitions.form.corporation')"
                :items="corporations" 
                clearable
                :error-messages="v$.corporation.$errors[0]?.$message" 
                @update:model-value="generalfilter.setCorporation"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect 
                :label="t('common.circunscription')"
                :model-value="generalfilter.idCircunscription"
                :items="circunscriptions"
                readonly
                @update:model-value="generalfilter.setCircunscription" 
              />
            </VCol>
            <VCol cols="12" md="4">
              <VAutocomplete 
                v-model="form.department"
                :disabled="form.corporation === -2"
                clearable
                :label="t('common.department')"
                :model-value="generalfilter.idDepartment"
                filter-mode="some"
                :items="departments"
                @update:model-value="generalfilter.setDepartment"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VAutocomplete 
                v-model="form.municipality"
                :disabled="form.corporation === -2 || form.corporation === -1 || form.corporation === 2 || form.corporation === 1"
                clearable
                :label="t('common.municipality')"
                :model-value="generalfilter.idMunicipality"
                filter-mode="some"
                :items="municipalities" 
                @update:model-value="generalfilter.setMunicipality" 
              />
            </VCol>
            <VCol cols="12" md="4">
              <VAutocomplete 
                v-model="form.communes"
                :label="t('common.commune')"
                :model-value="generalfilter.idCommune"
                :items="communes" 
                filter-mode="some"
                :disabled="disabled"
                @update:model-value="generalfilter.setCommune" 
              />
            </VCol>
            <VCol
              cols="12"
            >
              <p class="font-weight-normal">
                DATOS DE LA COALICIÓN
              </p>
              <VDivider class="mt-5" />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model.trim="form.responsibleDni"
                clearable
                :label="t('coalitions.form.dni')"
                :placeholder="t('coalitions.form.dni')"
                :error-messages="v$.responsibleDni.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model.trim="form.responsibleName"
                clearable
                :label="t('coalitions.form.responsible_name')"
                :placeholder="t('coalitions.form.responsible_name')"
                :error-messages="v$.responsibleName.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model.trim="form.phone"
                clearable
                :label="t('coalitions.form.phone')"
                :placeholder="t('coalitions.form.phone')"
                :error-messages="v$.phone.$errors[0]?.$message"
                @keypress="keyPressOnlyNumber"
                @paste="pasteOnlyNumber"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <LocalPhoneField 
                v-model.trim="form.localPhone"
                clearable
                :label="t('coalitions.form.local_phone')"
                :error-messages="v$.localPhone.$errors[0]?.$message"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VAutocomplete 
                v-model="form.departmentCoalition"
                label="Departamento"
                filter-mode="some"
                :items="listDepartments"
                @update:model-value="handlerChangeDeparmentCoalition"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="form.municipalityCoalition"
                :disabled="form.departmentCoalition === -1"
                label="Municipio"
                filter-mode="some"
                :items="listMunicipalities" 
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="form.address"
                clearable
                :label="t('coalitions.form.address')"
                :placeholder="t('coalitions.form.address')"
                :error-messages="v$.address.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="form.email"
                clearable
                :label="t('coalitions.form.email')"
                :placeholder="t('coalitions.form.email')"
                :error-messages="v$.email.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="form.alternateEmail"
                clearable
                :label="t('coalitions.form.emailAlter')"
                :placeholder="t('coalitions.form.emailAlter')"
                :error-messages="v$.alternateEmail.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
          <VRow class="mt-2 mb-5">
            <VCol
              cols="12"
            >
              <p class="font-weight-normal">
                {{ t('coalitions.form.participating_groups') }}
              </p>
              <VDivider />
            </VCol>
            <VCol cols="12" md="4">
              <VSelect 
                v-model="subForm.groupingPolitialType"
                :label="t('coalitions.form.grouping_political_type')"
                :items="groupingPoliticalTypes" 
                :error-messages="vSub$.groupingPolitialType.$errors[0]?.$message" 
                @update:model-value="() => subForm.groupingPoliticalSelected = null"
              />
            </VCol>
            <VCol cols="12" md="8">
              <VAutocomplete 
                v-model="subForm.groupingPoliticalSelected"
                :label="t('coalitions.form.grouping_political_name')"
                :items="groupingPoliticals" 
                :error-messages="vSub$.groupingPoliticalSelected.$errors[0]?.$message"
              />
            </VCol>
            <VCol v-if="form.coalitionType != 0" cols="12" md="6">
              <VTextField 
                v-model="subForm.votes" 
                :label="t('coalitions.form.vote')" 
                :error-messages="vSub$.votes.$errors[0]?.$message" 
                @keypress="keyPressOnlyNumber"
                @paste="pasteOnlyNumber"
              />
            </VCol>
            <VCol cols="12" :md="form.coalitionType === 0 ? 12 : 6">
              <VBtn block :disabled="disabledButton" @click="addGroupingPoliticalSelected">
                <VIcon start icon="tabler-circle-plus" />
                {{ t('coalitions.btn_add') }}
              </VBtn>
            </VCol>
          </VRow>
          <DataTable :fields="fields" :items="items">
            <template #cell(responsible)="{ item }">
              <div class="d-flex justify-center">
                <VCheckbox 
                  :disabled="lockResponsibleCheck"
                  :model-value="item.responsible" 
                  @update:model-value="$event=>changeResponsible(item.groupingPoliticalCode, $event)" 
                />
              </div>
            </template>
            <template #cell(responsibleAccount)="{ item }">
              <div class="d-flex justify-center">
                <VCheckbox 
                  :model-value="item.responsibleAccount" 
                  @update:model-value="$event=>changeresponsibleAccount(item.groupingPoliticalCode, $event)" 
                />
              </div>
            </template>
            <template #cell(vote)="{ item }">
              <div class="d-flex justify-center">
                {{ item.groupingPoliticalVotes }}
              </div>
            </template>
            <template #cell(actions)="{ item }">
              <div class="d-flex justify-center">
                <VBtn
                  variant="text"
                  color="secondary"
                  @click="removeGroupingPoliticalSelected(item.groupingPoliticalCode)"
                >
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    Desasignar
                  </VTooltip>
                  <VIcon
                    icon="tabler-clipboard-x"
                    size="25"
                  />
                </VBtn>
              </div>
            </template>
          </DataTable>
          <p
            v-if="v$.listGroupingPoliticals.$error"
            class="text-error text-caption"
          >
            {{ v$.listGroupingPoliticals.$errors[0]?.$message }}
          </p>
          <VDivider />
          <VRow class="mt-4">
            <VCol
              cols="12"
              class="d-flex gap-4 justify-space-between"
            >
              <div class="d-flex gap-4">
                <VBtn :loading="isLoading" class="notAllowedEmulator" :disabled="disabledButton" type="submit">
                  {{ t('coalitions.btn_save') }}
                </VBtn>

                <VBtn
                  type="reset"
                  variant="outlined"
                  @click="clearForm"
                >
                  {{ t('coalitions.btn_clear') }}
                </VBtn>
              </div>

              <VBtn color="secondary" @click="backListPage">
                <VIcon
                  start
                  icon="tabler-arrow-left"
                />
                {{ t('coalitions.btn_back') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "coalition-create"
meta:
  authRequired: true
</route>
