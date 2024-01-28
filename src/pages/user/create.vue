<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import { helpers } from "@vuelidate/validators"
import LocalPhoneField from '@/components/shared/LocalPhoneField.vue'
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import { useCustomMessage } from "@/composables/useCustomMessage"

// Validators
import {
  requiredVuelidate,
  emailVuelidate,
  integerVuelidate,
  maxLengthVuelidate,
} from '@/utils/validators/vuelidate'

// Translate i18n
import { useI18n } from 'vue-i18n'

// Defining variables
const generalfilter = useGeneralFilterComposable()
const { t } = useI18n()
const isLoading = ref(false)
const formDisabled = ref(false)
const messageComposable = useCustomMessage()
const roles = ref([])
const rolCodeExc = ['ROOT', 'SA', 'REDIS', 'REAX', 'REES', 'REMU', 'AP', 'AXGP']

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

const roleSelected = computed(() => roles.value.find(e => e.id == form.value.roleId))

const getRoles = () => {
  axios.get('/v1/role').then(({ data }) => {
    roles.value = data
  })
}

const isDisabledByRoleSelected = computed(() => roleSelected.value?.code == 'AP')

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
        && form.value.department == 16)
})

const form = ref({ 
  createUserType: 'SINGLE',
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
  emailConfirmed: null,
  department: null,
  municipality: null,
  commune: null,
  active: true,
})

// Forms rules
const rules = computed(() => ({ 
  firstName: { requiredVuelidate },
  firstSurname: { requiredVuelidate },
  username: { requiredVuelidate, maxLength: maxLengthVuelidate(12) },
  roleId: { requiredVuelidate },
  cellPhone: {
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
      value => value || form.value.cellPhone,
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
    confirmedEmail: helpers.withMessage('Correo electrónico no coincide', value => value && value == form.value.email),
  },
  department: {
    required: helpers.withMessage('Debe seleccionar un departamento', value => !enableDivipol.value || value !== -1),
  },
  municipality: {
    required: helpers.withMessage('Debe seleccionar un municipio', value => !enableMunicipality.value || value !== -1),
  },
}))

// Load divipoli
const departments = computed(() => {
  const array = generalfilter
    .getDepartments()
    .filter(e => enableMunicipality.value || (!enableMunicipality.value && e.id != 16))
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: "Seleccione un departamento", value: -1 }, ...array]
})

const municipalities = computed(() => {
  const { department } = form.value

  const array = generalfilter
    .getMunicipalitiesByDepartment(department)
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: "Seleccione un municipio", value: -1 }, ...array]
})

const communes = computed(() => {
  const { department, municipality } = form.value

  const array = generalfilter
    .getCommunes(department, municipality)
    .map(e => ({ title: `${e.id} - ${e.name}`, value: e.id }))
    .sort((a,b) => a.value - b.value)

  return [{ title: "Seleccione una opción", value: -1 }, ...array]
})

const groupingPoliticalTypes = computed(() => {
  return generalfilter.getGroupingPoliticalsTypes()
    .map(e => ({ title: e.name, value: e.id }))
})

const groupingPoliticalByType = computed(() => {
  const { groupingPoliticalTypeId } = form.value

  return (groupingPoliticalTypeId > 0) 
    ? generalfilter.getGroupingPoliticalsByType(groupingPoliticalTypeId)
      .map(e => ({ title: `${e.id} - ${e.name}`, code: e.code, value: e.id }))
    : [{ title: t('user.groupingPoliticalTypes'), value: -1 }]
})

const v$ = useVuelidate(rules, form)

// Create user
const createUser = async () => {

  if (form.value.cellPhone == "") return form.value.cellPhone = null

  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true
  formDisabled.value = true


  const { roleId, ...result } = form.value

  const requestBody = { 
    ...result,
    roleId,
  }

  try {
    await axios.post('/v1/user', requestBody)

    // TODO: Pasar los mensajes por el i18n
    await Swal.fire({
      icon: 'success',
      text: messageComposable.get("MS0034"),
    })

    clearForm()

    return true
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      // Verificar si el mensaje contiene "Duplicate entry"
      if (message.includes("Duplicate entry")) {
      // Mostrar un swal.fire con un mensaje específico
        await Swal.fire({
          icon: 'warning',
          text: messageComposable.get("MS0035"),
          
        })
      } else {
      // Mostrar el mensaje de error original
        await Swal.fire({
          icon: 'warning',
          text: message,
        })
      }
    }
    
    return false
  } finally {
    isLoading.value = false
    formDisabled.value = false
  }
}

// Clear form
const clearForm = () => {
  window.history.back()
  form.value = {}
  v$.value.$reset()
}

onMounted(() => {
  getRoles()
})
</script> 
  
<template>
  <div>
    <VBreadcrumbs :items="[ t('user.breadcrumbs.title'), t('user.breadcrumbs.create_user') ]" />
    <VCard flat title="Crear usuario">
      <VCardText>
        <VForm ref="refForm" :disabled="formDisabled" class="mt-2" @submit.prevent="createUser">
          <VRow>
            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model.trim="form.firstName"
                clearable
                :label="t('user.firstname')"
                :placeholder="t('user.firstname')"
                :error-messages="v$.firstName.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model.trim="form.secondName"
                clearable
                :label="t('user.secondname')"
                :placeholder="t('user.secondname')"
              />
            </VCol>

            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model.trim="form.firstSurname"
                :label="t('user.firstsurname')"
                clearable
                :placeholder="t('user.firstsurname')"
                :error-messages="v$.firstSurname.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model.trim="form.secondSurname"
                :label="t('user.secondsurname')"
                clearable
                :placeholder="t('user.secondsurname')"
              />
            </VCol>
          
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.username"
                prepend-inner-icon="tabler-user-circle"
                clearable
                :label="t('user.username')"
                :placeholder="t('user.username')"
                :error-messages="v$.username.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VAutocomplete
                v-model="form.roleId"
                :items="roleList"
                prepend-inner-icon="tabler-user-search"
                :label="t('user.user_rol')"
                :error-messages="v$.roleId.$errors[0]?.$message"
                class="required"
                @update:model-value="() => form.department = -1"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.cellPhone"
                clearable
                prepend-inner-icon="tabler-device-mobile"
                :label="t('user.phone')"
                :placeholder="t('user.phone')"
                :error-messages="v$.cellPhone.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <LocalPhoneField 
                v-model.trim="form.localPhone"
                clearable
                :label="t('user.localphone')"
                :error-messages="v$.localPhone.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.email"
                clearable
                prepend-inner-icon="tabler-mail"
                :label="t('user.email')"
                :placeholder="t('user.email')"
                :error-messages="v$.email.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.emailConfirmed"
                clearable
                prepend-inner-icon="tabler-mail"
                :label="t('user.confirm_email')"
                :placeholder="t('user.confirm_email')"
                :error-messages="v$.emailConfirmed.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
              :hidden="!isDisabledByRoleSelected"
            >
              <VSelect 
                v-model="form.groupingPoliticalTypeId"
                :disabled="!isDisabledByRoleSelected"
                :label="t('user.groupingPoliticalTypes')"
                :items="groupingPoliticalTypes"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
              :hidden="!isDisabledByRoleSelected"
            >
              <VSelect 
                v-model="form.groupingPoliticalId"
                :disabled="!isDisabledByRoleSelected"
                :label="t('user.groupingPoliticals')"
                :items="groupingPoliticalByType"
              />
            </VCol>
            <template v-if="enableDivipol">
              <VCol
                cols="12"
              >
                <p class="font-weight-normal">
                  {{ t('user.divipolePermissions') }}
                </p>
                <VDivider class="mt-5" />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VAutocomplete 
                  v-model="form.department"
                  :label="t('user.department')"
                  filter-mode="some"
                  :items="departments"
                  :error-messages="v$.department.$errors[0]?.$message"
                />
              </VCol>

              <template v-if="enableMunicipality">
                <VCol
                  cols="12"
                  md="4"
                >
                  <VAutocomplete
                    v-model="form.municipality"
                    :label="t('user.municipalities')"
                    filter-mode="some"
                    :items="municipalities" 
                    :disabled="generalfilter.enableMunicipality"
                    :error-messages="v$.municipality.$errors[0]?.$message"
                  />
                </VCol>

                <VCol v-if="enableCommune" cols="12" md="4">
                  <VAutocomplete 
                    v-model="form.commune"
                    filter-mode="some"
                    :items="communes"
                    :label="t('common.commune')" 
                  />
                </VCol>
              </template>
            </template>
            <VCol cols="12">
              <VCheckbox
                v-model="form.active"
                :label="form.active == true ? t('user.status') : t('user.inactive')"
              />
            </VCol>

            <VCol
              cols="12"
              class="d-flex gap-4"
            >
              <VBtn type="submit" :loading="isLoading">
                {{ t('user.create_user') }}
              </VBtn>

              <VBtn
                type="reset"
                color="secondary"
                variant="tonal"
                @click="clearForm"
              >
                {{ t('user.cancel') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "user-create"
meta:
  authRequired: true
</route>
