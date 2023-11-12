<script setup>
import { useI18n } from 'vue-i18n'
import { useVuelidate } from "@vuelidate/core"
import { useGeneralFilter } from '@/stores/generalfilter'
import { useCustomMessage } from "@/composables/useCustomMessage"

import {
  requiredVuelidate,
  integerVuelidate,
} from "@/utils/validators/vuelidate"
import Swal from '@/plugins/sweetalert2'

import banner from '@images/pages/dialog-banner-sm.webp'
import { keyPressOnlyNumber, pasteOnlyNumber } from '@/utils/events'
import axios from '@/plugins/axios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  data: { type: Object, default: () => {} },
})

const emit = defineEmits(['update:model-value'])

const { modelValue } = toRefs(props)

const { t } = useI18n()
const generalfilterStore = useGeneralFilter()
const messageComposable = useCustomMessage()

const parents = computed(() => {
  return generalfilterStore
    .differentialFocus
    .map(e => ({ title: e.name, value: e.id }))
})

const isModeEdit = computed(() => Boolean(props.data.id))
const isLoading = ref(false)
const form = ref({})

const rules = computed(() => ({
  parentId: { requiredVuelidate },
  code: { requiredVuelidate,  integerVuelidate },
  name: { requiredVuelidate },
}))

const v$ = useVuelidate(rules, form)

const title = computed(() => {
  return props.data?.id 
    ? t('differential_focus.edit_differential_focus') 
    : t('differential_focus.add_differential_focus')
})

const handlerOpen = () => {
  v$.value.$reset()
  form.value = { ...props.data }
}

const handlerClose = () => {
  emit('update:model-value', false)
}

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return
  isLoading.value = true

  generalfilterStore
    .saveDifferentialFocus(form.value)
    .then(() => {
      v$.value.$reset()  
      form.value = {}
      
      handlerClose()
      Swal.fire({ icon: "success", text: messageComposable.get("MS0008") })
    }).catch(error => {
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: "warning", text: messageComposable.get("MS0007") })
      }
    }).finally(() => isLoading.value = false)
}

const handlerReset = () => {
  handlerOpen()
}

watch(modelValue, value => {
  if (value) handlerOpen()
})
</script>

<template>
  <VDialog
    :model-value="modelValue"
    persistent
    class="v-dialog-sm"
    transition="dialog-bottom-transition"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="handlerClose" />

    <!-- Dialog Content -->
    <VCard>
      <VImg :src="banner" height="120" cover />
      <div class="mt-4 text-center text-h6 font-weight-semibold">
        {{ title }}
      </div>
      <VForm @submit.prevent="handlerSubmit">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="form.parentId"
                :label="t('differential_focus.form.parent_id')"
                :items="parents"
                :error-messages="v$.parentId.$errors[0]?.$message"
                class="required"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.code"
                :label="t('differential_focus.form.code')"
                :error-messages="v$.code.$errors[0]?.$message"
                :class="{ 'readonly-control': isModeEdit }"
                :readonly="isModeEdit"
                class="required"
                @keypress="keyPressOnlyNumber"
                @paste="pasteOnlyNumber"
              />
            </VCol>
            <VCol cols="12" md="8">
              <VTextField
                v-model.trim="form.name"
                :label="t('differential_focus.form.name')"
                :error-messages="v$.code.$errors[0]?.$message"
                class="required"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="text-center">
          <VBtn
            class="mx-2"
            variant="outlined"
            @click="handlerReset"
          >
            Limpiar
          </VBtn>
          <VBtn type="submit" class="mx-2" :loading="isLoading">
            Guardar
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
