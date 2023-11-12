<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useVuelidate } from '@vuelidate/core'
import { useI18n } from "vue-i18n"
import { onMounted } from 'vue'


// Validators
import {
  requiredVuelidate,
} from '@/utils/validators/vuelidate'

// Definición de variables
const { t } = useI18n()

const isLoading = ref(false)
const formDisabled = ref(false)

const form = ref({
  key: null,
  valueParameter: null,
})

const items = ref([])

// Columnas de la tabla
const fields = ref([
  { key: 'key', label: t('systemParameters.code') },
  { key: 'description', label: t('systemParameters.description') },
  { key: 'value', label: t('systemParameters.value') },
])

// Forms rules
const rules = computed(() => ({
  key: { requiredVuelidate },
  valueParameter: { requiredVuelidate },
}))

const v$ = useVuelidate(rules, form)

// Obtener los parametros
const getParameters = async () => {

  try {
    const { data } = await axios.get('/v1/parameter')

    items.value = data
    
    return true

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }

    return false
  }
  
}

const updateParameter = async () => {

  v$.value.$touch()
  if (v$.value.$invalid) return

  // Deshabilitar boton y formulario mientras se ejecuta la petición
  isLoading.value = true
  formDisabled.value = true

  const { key, valueParameter } = form.value

  const requestBody = {
    "value": valueParameter,
  }

  try {
    await axios.put(`/v1/parameter/${key}`, requestBody)
    await Swal.fire({
      icon: 'success',
      text: t('systemParameters.msg_update'),
    })

    clearForm()
    getParameters()

    return true
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || t('systemParameters.msg_error'),
      })
    }

    return false
  } finally {
    // Habilatmos boton y formulario mientras se ejecuta la petición
    isLoading.value = false
    formDisabled.value = false
  }
}

const getParameterValueByCode = async code => {
  if(code !== null){
    const codeUpperCase = code.toUpperCase()
    
    const parameterValue = items.value.find(e => e.key == codeUpperCase)

    if (!parameterValue) {
      await Swal.fire({
        icon: 'warning',
        text: 'Parámetro no existe',
      })
    }

    form.value.valueParameter = parameterValue?.value
  }
 
}

// Limpiar formulario
const clearForm = () => {
  form.value = {}
  v$.value.$reset()
}

onMounted(() => {
  getParameters()
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('systemParameters.breadcrumbs.title'), t('systemParameters.breadcrumbs.parameters') ]" />
    <VCard flat class="mb-2">
      <VCardText>
        <VForm :disabled="formDisabled" class="mt-2">
          <VRow>
            <VCol
              md="6"
              cols="12"
            >
              <VTextField
                v-model="form.key"
                label="Código"
                :error-messages="v$.key.$errors[0]?.$message"
                @blur="getParameterValueByCode(form.key)"
              />
            </VCol>

            <VCol
              md="6"
              cols="12"
            >
              <VTextField
                v-model="form.valueParameter"
                label="Valor"
                :error-messages="v$.valueParameter.$errors[0]?.$message"
              />
            </VCol>
          </vrow>
        </VForm>
      </VCardText>
      <VCardText class="d-flex gap-4">
        <VBtn :disabled="formDisabled" :loading="isLoading" @click="updateParameter">
          Guardar
        </VBtn>
        <VBtn
          :disabled="formDisabled"
          color="secondary"
          type="reset"
          @click="clearForm"
        >
          Cancelar
        </VBtn>
      </VCardText>
    </VCard>

    <VCard>
      <DataTable :items="items" :fields="fields" paginate />
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "parameter-list"
meta:
  authRequired: true
</route>

