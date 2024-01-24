<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import { helpers } from "@vuelidate/validators"
import LocalPhoneField from '@/components/shared/LocalPhoneField.vue'
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import { useUserConfigStore } from '@/stores/userconfig'
import { storeToRefs } from 'pinia'
import { keyPressOnlyNumber, pasteOnlyNumber } from "@/utils/events"
import { useCustomMessage } from "@/composables/useCustomMessage"
import { useRouter } from 'vue-router'

// Validators
import {
  requiredVuelidate,
  emailVuelidate,
  integerVuelidate,
} from '@/utils/validators/vuelidate'

// Translate i18n
import { useI18n } from 'vue-i18n'

// Defining variables
const generalfilter = useGeneralFilterComposable()
const { t } = useI18n()
const isLoading = ref(false)
const formDisabled = ref(false)
const { userData } = storeToRefs(useUserConfigStore())
const codeUser = ref("")
const messageComposable = useCustomMessage()
const router = useRouter()

const form = ref({
  createUserType: 'AUXILIARY',
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
  active: true,
})

// Forms rules
const rules = computed(() => ({
  firstName: { requiredVuelidate },
  firstSurname: { requiredVuelidate },
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
  department: { requiredVuelidate },
  municipality: { requiredVuelidate },
  groupingPoliticalTypeId: { requiredVuelidate },
  groupingPoliticalId: { requiredVuelidate },
}))

// Load divipoli
const departments = computed(() => {
  return generalfilter.getDepartments()
    .map(e => ({ title: e.name, value: e.id }))
})

const municipalities = computed(() => {
  const { department } = form.value

  if (department <= 0) 
    return [{ title: t('common.department'), value: -1 }]

  const array = generalfilter.getMunicipalitiesByDepartment(department)
    .map(e => ({ title: e.name, value: e.id }))

  return [{ title: t('common.all_option'), value: -1 }, ...array]
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
    : [{ title: t('user.groupingPoliticalTypes'), value: null }]
})

const roles = ref([])

// Get roles
const roleList = computed(() => {
  const items = roles.value.map(e => {
    return { title: e.name, code: e.code, value: e.id }
  })


  return [
    { title: t('common.select_one_option'), value: -1, disabled: true },
    ...items,
  ]
})

const roleSelected = computed(() => roles.value.find(e => e.id == form.value.roleId))

const getRoles = () => {
  axios.get('/v1/role').then(({ data }) => {
    roles.value = data.filter(role => role.code === 'AXGP')
  })
}

const getUserCode = () => {
  axios.get(`/v1/user/auxiliary-code?groupingPoliticalId=${userData.value.groupingPolitical.id}`)
    .then(({ data }) => {
      codeUser.value = data   
    })
}

const v$ = useVuelidate(rules, form)

const isDisabledByRoleSelected = computed(() => roleSelected.value?.code === 'AP')

// Create user
const createUser = async () => {

  if (form.value.cellPhone == "") return form.value.cellPhone = null

  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true
  formDisabled.value = true

  const { username, ...result } = form.value

  const requestBody = {
    username: codeUser.value,
    ...result,  
  }

  try {
    await axios.post('/v1/user/auxiliary-create', requestBody)

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

    router.push({
      name: 'userAux-list',
    })
  }
}

// Clear form
const clearForm = () => {
  form.value = {}
  v$.value.$reset()
}

onMounted(() => {
  getRoles()
  getUserCode()
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('user.breadcrumbs.title'), t('user.breadcrumbs.create_user_aux') ]" />
    <VCard flat title="Crear usuario Auxiliar Agrupación Política">
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
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="codeUser"
                disabled
                prepend-inner-icon="tabler-user-circle"
                :label="t('user.username')"
                :placeholder="t('user.username')"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="form.roleId"
                :items="roleList"
                prepend-inner-icon="tabler-user-search"
                :label="t('user.user_rol')"
                :error-messages="v$.roleId.$errors[0]?.$message"
                class="required"
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
              :hidden="isDisabledByRoleSelected"
            >
              <VSelect
                v-model="form.groupingPoliticalTypeId"
                :disabled="isDisabledByRoleSelected"
                :label="t('user.groupingPoliticalTypes')"
                :items="groupingPoliticalTypes"
                :error-messages="v$.groupingPoliticalTypeId.$errors[0]?.$message"
                class="required"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
              :hidden="isDisabledByRoleSelected"
            >
              <VSelect
                v-model="form.groupingPoliticalId"
                :disabled="isDisabledByRoleSelected"
                :label="t('user.groupingPoliticals')"
                :items="groupingPoliticalByType"
                :error-messages="v$.groupingPoliticalId.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VAutocomplete
                v-model="form.department"
                :label="t('user.department')"
                filter-mode="some"
                :items="departments"
                :error-messages="v$.department.$errors[0]?.$message"
                class="required"
                @update:model-value="() => form.municipality = null"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VAutocomplete
                v-model="form.municipality"
                :label="t('user.municipalities')"
                filter-mode="some"
                :items="municipalities"
                :disabled="generalfilter.enableMunicipality"
                :error-messages="v$.municipality.$errors[0]?.$message"
                class="required"
              />
            </VCol>


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
              <VBtn type="submit" class="notAllowedEmulator" :loading="isLoading">
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
name: "workPlan-create"
meta:
  authRequired: true
</route>
