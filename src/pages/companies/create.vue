<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import { useCustomMessage } from "@/composables/useCustomMessage"
import ListTable from './list.vue'

// Translate i18n
import { useI18n } from 'vue-i18n'

// Validators
import {
  requiredVuelidate,
  emailVuelidate,
  integerVuelidate,
  maxLengthVuelidate,
} from '@/utils/validators/vuelidate'


// Defining variables
const { t } = useI18n()
const isLoading = ref(false)
const formDisabled = ref(false)
const messageComposable = useCustomMessage()
const titleComponent = 'Crear Empresa'


const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const typeidCompanyType = computed(() => {
  const array = [
    { title: 'Sociedad Limitada LTDA ', value: 1 },
    { title: 'Sociedad Anóonima S.A. ', value: 2 },
    { title: 'Empresa Unipersonal ', value: 3 },
    { title: 'Sociedad Colectiva ', value: 4 },
    { title: 'Empresa Asociativa de Trabajo ', value: 5 },
    { title: 'Sociedad por Acciones Simplificada S.A.S. ', value: 6 },
  ]

  return addOptionDefault(array)
})

const riskLevelCompanies = computed(() => {
  const array = [
    { title: '1', value: 1 },
    { title: '2', value: 2 },
    { title: '3', value: 3 },
    { title: '4 ', value: 4 },
    { title: '5', value: 5 },
  ]

  return addOptionDefault(array)
})


const form = ref({ 
  idNumber: null,
  companyName: null,
  idCompanyType: null,
  riskLevel: null,
})

// Forms rules
const rules = computed(() => ({ 
  idNumber: { requiredVuelidate },
  riskLevel: { requiredVuelidate },
  idCompanyType: { requiredVuelidate },
  companyName: { requiredVuelidate },
}))

const v$ = useVuelidate(rules, form)

// Create Companies
const createCompany = async () => {


  v$.value.$touch()
  if (v$.value.$invalid) return


  isLoading.value = true
  formDisabled.value = true


  const { ...result } = form.value

  const requestBody = { 
    ...result,
  }

  console.log("request body", requestBody)

  try {
    await axios.post('/company/create', requestBody)

    // TODO: Pasar los mensajes por el i18n
    await Swal.fire({
      icon: 'success',
      text: 'Empresa Creada Éxitosamente.',
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
  form.value = {}
  v$.value.$reset()
}
</script> 
  
<template>
  <div>
    <VBreadcrumbs :items="[ t('companies.breadcrumbs.title'), t('companies.breadcrumbs.createCompanies') ]" />
    <VCard flat :title="titleComponent">
      <VCardText>
        <h1>probando</h1>
        <VForm ref="refForm" :disabled="formDisabled" class="mt-2" @submit.prevent="createCompany">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.idNumber"
                clearable
                :label="t('companies.idCompany')"
                :placeholder="t('companies.idCompany')"
                :error-messages="v$.idNumber.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="form.idCompanyType"
                :items="typeidCompanyType"
                prepend-inner-icon="tabler-user-search"
                :label="t('companies.companyType')"
                :error-messages="v$.idCompanyType.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="form.riskLevel"
                :items="riskLevelCompanies"
                prepend-inner-icon="tabler-user-search"
                :label="t('companies.levelRiskCompany')"
                :error-messages="v$.riskLevel.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.companyName"
                clearable
                :label="t('companies.fullname')"
                :placeholder="t('companies.fullname')"
                :error-messages="v$.companyName.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol
              cols="12"
              class="d-flex gap-4"
            >
              <VBtn type="submit" :loading="isLoading">
                {{ t('companies.breadcrumbs.createCompanies') }}
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
        <VRow>
          <VCol>
            <VCard>
              asdasdadsasdassdasda hp
              <ListTable />          
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "companies-create"
meta:
authRequired: true
</route>
