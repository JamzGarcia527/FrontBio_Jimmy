<script setup>
import axios from "@/plugins/axios"
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import { helpers } from "@vuelidate/validators"
import LocalPhoneField from "@/components/shared/LocalPhoneField.vue"
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import { useCustomMessage } from "@/composables/useCustomMessage"

// Validators
import {
  requiredVuelidate,
  emailVuelidate,
  integerVuelidate,
} from '@/utils/validators/vuelidate'

// Translate i18n
import { useI18n } from "vue-i18n"

const generalfilter = useGeneralFilterComposable()
const { t } = useI18n()
const isLoading = ref(false)
const formDisabled = ref(false)
const messageComposable = useCustomMessage()
const route = useRoute()
const userId = route.params.id

const formEdit = ref({
  firstName: null,
  secondName: null,
  firstSurname: null,
  secondSurname: null,
  username: null,
  roleId: null,
  groupingPoliticalTypeId: null,
  groupingPoliticalId: null,
  cellPhone: null,
  localPhone: null,
  email: null,
  department: null,
  municipality: null,
  active: null,
})

const roles = ref([])
const rolCodeExc = ['ROOT', 'SA', 'REDIS', 'REAX', 'REES', 'REMU']

// Get roles
const roleList = computed(() => {
  const items = roles.value
    .filter(e => !rolCodeExc.includes(e.code))
    .map(e => ({ title: e.name, value: e.id  }))
  
  return [
    { title: t('common.select_one_option'), value: -1, disabled: true },
    ...items,
  ]
})

const roleSelected = computed(() => roles.value.find(e => e.id == formEdit.value.roleId))

const getRoles = () => {
  axios.get('/v1/role').then(({ data }) => {
    roles.value = data
  })
}

const isDisabledByRoleSelected = computed(() => roleSelected.value?.code == 'AP' || roleSelected.value?.code == 'AXGP')

const enableDivipol = computed(() => {
  return (roleSelected.value && roleSelected.value.limitDivipol)
})

const enableMunicipality = computed(() => {
  const enableRoles = ['REGI']
  
  return (roleSelected.value 
        && roleSelected.value.limitDivipol 
        && enableRoles.includes(roleSelected.value.code))
})

const enableCommune = computed(() => {
  const enableRoles = ['REGI']
  
  return (roleSelected.value 
        && roleSelected.value.limitDivipol 
        && enableRoles.includes(roleSelected.value.code) 
        && formEdit.value.department == 16)
})

// Forms rules
const rules = computed(() => ({ 
  firstName: { requiredVuelidate },
  firstSurname: { requiredVuelidate },
  username: { requiredVuelidate },
  roleId: { requiredVuelidate },
  cellPhone: {
    required: helpers.withMessage(
      t("validations.mobile_or_phone"),
      value => value || formEdit.value.localPhone,
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
      value => value || formEdit.value.cellPhone,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de celular debe contener 7 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  email: { requiredVuelidate, emailVuelidate },
  emailConfirmed: {
    requiredVuelidate, emailVuelidate,
    confirmedEmail: helpers.withMessage('Correo electrónico no coincide', value => value && value == formEdit.value.email),
  },
  department: {
    required: helpers.withMessage('Debe seleccionar un departamento', value => !enableDivipol.value || value !== -1),
  },
  municipality: {
    required: helpers.withMessage('Debe seleccionar un municipio', value => !enableMunicipality.value || value !== -1),
  },
}))

const v$ = useVuelidate(rules, formEdit)

// Load divipoli
const departments = computed(() => {
  const array = generalfilter
    .getDepartments()
    .filter(e => enableMunicipality.value || (!enableMunicipality.value && e.id != 16))
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: "Seleccione un departamento", value: -1 }, ...array]
})

const municipalities = computed(() => {
  const { department } = formEdit.value

  const array = generalfilter
    .getMunicipalitiesByDepartment(department)
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: "Seleccione un municipio", value: -1 }, ...array]
})

const communes = computed(() => {
  const { department, municipality } = formEdit.value

  const array = generalfilter
    .getCommunes(department, municipality)
    .map(e => ({ title: e.name, value: e.id }))
    .sort((a,b) => a.value - b.value)

  return [{ title: "Seleccione una opción", value: -1 }, ...array]
})

const groupingPoliticalTypes = computed(() => {
  return generalfilter
    .getGroupingPoliticalsTypes()
    .map(e => ({ title: e.name, value: e.id }))
})

const groupingPoliticalByType = computed(() => {
  const { groupingPoliticalTypeId } = formEdit.value

  return groupingPoliticalTypeId > 0
    ? generalfilter
      .getGroupingPoliticalsByType(groupingPoliticalTypeId)
      .map(e => ({ title: `${e.id} - ${e.name}`, value: e.id }))
    : [{ title: t("user.groupingPoliticalTypes"), value: -1 }]
})

const loadUser = async () => {
  const response = await axios.get(`/v1/user/${userId}`)

  formEdit.value.firstName = response.data.firstName
  formEdit.value.secondName = response.data.secondName
  formEdit.value.firstSurname = response.data.firstSurname
  formEdit.value.secondSurname = response.data.secondSurname
  formEdit.value.username = response.data.username
  formEdit.value.roleId = response.data.roleDetail.id
  formEdit.value.cellPhone = response.data.cellPhone
  formEdit.value.localPhone = response.data.localPhone
  formEdit.value.email = response.data.email
  formEdit.value.emailConfirmed = response.data.email
  formEdit.value.groupingPoliticalTypeId = response.data?.groupingPolitical?.grouping_political_type
  formEdit.value.groupingPoliticalId = response.data?.groupingPolitical?.id
  formEdit.value.department = response.data?.divipols[0]?.department
  formEdit.value.municipality = response.data?.divipols[0]?.municipality
  formEdit.value.commune = response.data?.divipols[0]?.commune
  formEdit.value.active = response.data.active
}

const updateUser = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true
  formDisabled.value = true

  const { cellPhone, localPhone, roleId, ...result } = formEdit.value

  const requestBody = { 
    ...result, 
    roleId,
    cellPhone: cellPhone == "" ?  null : cellPhone,
    localPhone: localPhone == "" ? null : localPhone,
  }

  try {
    const response = await axios.put(`/v1/user/${userId}`, requestBody)
    if (response.status == 200) {
      v$.value.$reset()
      formEdit.value = {}
      window.history.back()

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'success',
        text: messageComposable.get("MS0036"),
      })
    }
    
    return true
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
    
    return false
    
  } finally {
    isLoading.value = false
    formDisabled.value = false
  }
}

const userList = () => {
  window.history.back()
}

onMounted( async () => {
  getRoles()
  await loadUser()
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('user.breadcrumbs.title'), t('user.breadcrumbs.edit') ]" />

    <VCard :title="t('user.title_edit_form')">
      <VCardText>
        <VForm :disabled="formDisabled" @submit.prevent="updateUser">
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField 
                v-model.trim="formEdit.firstName" 
                clearable
                :label="t('user.firstname')"
                :placeholder="t('user.firstname')"
                :error-messages="v$.firstName.$errors[0]?.$message" 
                class="required"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VTextField 
                v-model.trim="formEdit.secondName" 
                clearable
                :label="t('user.secondname')" 
                :placeholder="t('user.secondname')"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                v-model.trim="formEdit.firstSurname"
                clearable
                :label="t('user.firstsurname')"
                :placeholder="t('user.firstsurname')"
                :error-messages="v$.firstName.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                v-model.trim="formEdit.secondSurname"
                clearable
                :label="t('user.secondsurname')"
                :placeholder="t('user.secondsurname')"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model.trim="formEdit.username"
                prepend-inner-icon="tabler-user-circle"
                :label="t('user.username')"
                :placeholder="t('user.username')"
                readonly
                class="readonly-control"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="formEdit.roleId"
                :items="roleList"
                prepend-inner-icon="tabler-user-search"
                :label="t('user.user_rol')"
                :error-messages="v$.roleId.$errors[0]?.$message"
                class="required"
                @update:model-value="() => formEdit.department = -1"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model.trim="formEdit.cellPhone"
                clearable
                prepend-inner-icon="tabler-device-mobile"
                :label="t('user.phone')"
                :placeholder="t('user.phone')"
                :error-messages="v$.cellPhone.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol cols="12" md="6">
              <LocalPhoneField 
                v-model.trim="formEdit.localPhone" 
                clearable 
                :label="t('user.localphone')" 
                :placeholder="t('user.localphone')"
                :error-messages="v$.localPhone.$errors[0]?.$message" 
                class="required"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField 
                v-model.trim="formEdit.email" 
                clearable 
                prepend-inner-icon="tabler-mail"
                :label="t('user.email')" 
                :placeholder="t('user.email')" 
                :error-messages="v$.email.$errors[0]?.$message" 
                class="required"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model.trim="formEdit.emailConfirmed"
                clearable
                prepend-inner-icon="tabler-mail"
                :label="t('user.confirm_email')"
                :placeholder="t('user.confirm_email')"
                :error-messages="v$.emailConfirmed.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol :hidden="!isDisabledByRoleSelected" cols="12" md="6">
              <VSelect
                v-model="formEdit.groupingPoliticalTypeId"
                :disabled="!isDisabledByRoleSelected"
                :label="t('user.groupingPoliticalTypes')"
                :items="groupingPoliticalTypes"
              />
            </VCol>

            <VCol :hidden="!isDisabledByRoleSelected" cols="12" md="6">
              <VSelect
                v-model="formEdit.groupingPoliticalId"
                :disabled="!isDisabledByRoleSelected"
                :label="t('user.groupingPoliticals')"
                :items="groupingPoliticalByType"
              />
            </VCol>

            <template v-if="enableDivipol">
              <VCol cols="12">
                <p class="font-weight-normal">
                  {{ t('user.divipolePermissions') }}
                </p>
                <VDivider class="mt-5" />
              </VCol>
              <VCol cols="12" md="4">
                <VAutocomplete 
                  v-model="formEdit.department"
                  :label="t('user.department')"
                  filter-mode="some"
                  :items="departments"
                  :error-messages="v$.department.$errors[0]?.$message"
                  @update:model-value="() => formEdit.municipality = -1"
                />
              </VCol>

              <template v-if="enableMunicipality">
                <VCol cols="12" md="4">
                  <VAutocomplete
                    v-model="formEdit.municipality"
                    :label="t('user.municipalities')"
                    filter-mode="some"
                    :items="municipalities" 
                    :disabled="generalfilter.enableMunicipality"
                    :error-messages="v$.municipality.$errors[0]?.$message"
                    @update:model-value="() => formEdit.commune = -1"
                  />
                </VCol>

                <VCol v-if="enableCommune" cols="12" md="4">
                  <VAutocomplete 
                    v-model="formEdit.commune"
                    filter-mode="some"
                    :items="communes"
                    :label="t('common.commune')" 
                  />
                </VCol>
              </template>
            </template>

            <VCol cols="12">
              <VCheckbox v-model="formEdit.active" :label="formEdit.active == true ? 'Activo' : 'Inactivo'" />
            </VCol>
          </VRow>
          <VCardText class="d-flex justify-end flex-wrap gap-3">
            <VBtn variant="tonal" color="secondary" @click="userList">
              {{ t('user.back') }}
            </VBtn>
            <VBtn type="submit" :loading="isLoading">
              Guardar Cambios
            </VBtn>
          </VCardText>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "work-plan-edit-id"
meta:
authRequired: true
</route>
