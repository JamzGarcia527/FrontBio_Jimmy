<script setup>
import Swal from '@/plugins/sweetalert2'
import axios from '@/plugins/axios'
import { helpers } from "@vuelidate/validators"
import { useVuelidate } from '@vuelidate/core'
import { useI18n } from "vue-i18n"

// Validators
import {
  requiredVuelidate,
  integerVuelidate,
} from '@/utils/validators/vuelidate'

// Definición de variables
const { t } = useI18n()

const disabled = ref(false)
const loading = ref(false)
const loadingUpdate = ref(false)
const isHidden = ref(true)

const form = ref({
  "groupingPoliticalId": null,
  "auxiliaryUserLimit": null,
})

const user = ref({})


// Forms rules
const rules = computed(() => ({
  groupingPoliticalId: { requiredVuelidate },
  auxiliaryUserLimit: {
    integerVuelidate,
    require: helpers.withMessage(t('modifyUserLimit.limit_user_msg'), value => !description.value || value),
  },
}))

const v$ = useVuelidate(rules, form)

const description = ref()

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  disabled.value = true
  loading.value = true

  const requestBody = {
    "groupingPoliticalId": form.value.groupingPoliticalId,
  }

  try {
    const { data } = await axios.get('/grouping-political/auxiliary-user/', { params: requestBody })

    user.value = data

    if (user.value.groupingPoliticalName == '' || user.value.groupingPoliticalName == null) {
      await Swal.fire({
        icon: 'warning',
        text: t('modifyUserLimit.msg_error_search'),

        ///ajuste de mensaje
      })
    }

    description.value = user.value.groupingPoliticalName
    form.value.auxiliaryUserLimit = user.value.auxiliaryUserLimit
    isHidden.value = false

  } catch (error) {
    if (error.message && error.response.status <= 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || t('modifyUserLimit.msg_error_search'),
      })

      clearForm()
    }
    
  } finally {
    disabled.value = false
    loading.value = false
  }
}

const updateLimitUser = async () => {

  v$.value.$touch()
  if (v$.value.$invalid) return

  loadingUpdate.value = true
  disabled.value = true

  const requestBody = {
    "auxiliaryUserLimit": form.value.auxiliaryUserLimit,
  }

  const { groupingPoliticalId } = user.value

  try {
    await axios.put(`/grouping-political/${groupingPoliticalId}/auxiliary-user`, requestBody)

    await Swal.fire({
      icon: 'success',
      text: t('modifyUserLimit.msg_success'),
    })
  } catch (error) {
    if (error.message && error.response <= 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || 'Internal server error',
      })
    }
  } finally {
    disabled.value = false
    loadingUpdate.value = false
    clearForm()
  }
}

const clearForm = () => {
  form.value = {}
  description.value = null
  v$.value.$reset()
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), t('modifyUserLimit.title'), t('modifyUserLimit.breadcrumbs.page')]" />
    <VCard flat class="mb-2">
      <VCardText>
        <VForm :disabled="disabled" class="mt-2">
          <VRow>
            <VCol
              md="4"
              cols="12"
            >
              <VTextField
                v-model.trim="form.groupingPoliticalId"
                :label="t('modifyUserLimit.grouping_politial_code')"
                :error-messages="v$.groupingPoliticalId.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol
              md="4"
              cols="12"
            >
              <VTextField
                v-model="description"
                readonly
                :label="t('modifyUserLimit.grouping_political')"
              />
            </VCol>
            <VCol
              md="4"
              cols="12"
            >
              <VTextField
                v-model.trim="form.auxiliaryUserLimit"
                :label="t('modifyUserLimit.auxiliaryUserLimit')"
                :error-messages="v$.auxiliaryUserLimit.$errors[0]?.$message"
                class="required"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardText class="d-flex gap-4">
        <VBtn :loading="loading" :disabled="disabled" @click="handlerSubmit">
          {{ t('modifyUserLimit.btn_search') }}
        </VBtn>
        <VBtn
          color="secondary"
          type="reset"
          :loading="loadingUpdate"
          :hidden="isHidden || !form.auxiliaryUserLimit"
          :disabled="!form.auxiliaryUserLimit || disabled"
          @click="updateLimitUser"
        >
          {{ t('modifyUserLimit.btn_save') }}
        </VBtn>
        <VBtn
          color="primary"
          variant="outlined"
          type="reset"
          :disabled="disabled"
          @click="clearForm"
        >
          {{ t('modifyUserLimit.btn_clear') }}
        </VBtn>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "modify-user-limit"
meta:
  authRequired: true
</route>

