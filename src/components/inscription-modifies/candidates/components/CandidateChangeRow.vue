<script setup>
import { useI18n } from 'vue-i18n'
import { useVuelidate } from "@vuelidate/core"
import { useInscriptionModify } from '@/stores/inscriptionModify'
import useEventBus from "@/utils/eventBus"
import { requiredVuelidate } from "@/utils/validators/vuelidate"
import Swal from '@/plugins/sweetalert2'

import banner from '@images/pages/dialog-banner-sm.webp'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:model-value'])

const { modelValue } = toRefs(props)
const { emit: emiting } = useEventBus()
const { t } = useI18n()
const inscriptionModifyStore = useInscriptionModify()

const isLoading = ref(false)
const form = ref({})

const rules = computed(() => ({
  source: { requiredVuelidate },
  target: { requiredVuelidate },
}))

const v$ = useVuelidate(rules, form)

const rows = computed(() => {
  return inscriptionModifyStore.candidates.list
    .filter(a => !a.hasChangeSameE7 && !a.hasChangeOtherE7)
    .sort((a, b) => a.rowField > b.rowField)
    .map(e => ({ value: e.rowField, title: `${e.rowField} - ${e.firstname} ${e.firstsurname}` }))
})

const sources = computed(() => rows.value.filter(e => e.value !== form.value.target))
const targets = computed(() => rows.value.filter(e => e.value !== form.value.source))

const handlerOpen = () => {
  v$.value.$reset()
  form.value = {}
}

const handlerClose = () => {
  emit('update:model-value', false)
}


const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true

  inscriptionModifyStore
    .exchangeCandidate(form.value)
    .then(() => {
      v$.value.$reset()  
      form.value = {}
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
        {{ t('candidates.change_row.title_card') }}
      </div>
      <VForm @submit.prevent="handlerSubmit">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="form.source"
                :label="t('candidates.change_row.source')"
                :items="sources"
                :error-messages="v$.source.$errors[0]?.$message"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="form.target"
                :label="t('candidates.change_row.target')"
                :items="targets"
                :error-messages="v$.target.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="text-center">
          <VBtn
            class="mx-2"
            variant="outlined"
            :disabled="isLoading"
            @click="handlerReset"
          >
            {{ t('common.btn_reset') }}
          </VBtn>
          <VBtn type="submit" class="mx-2 notAllowedEmulator" :loading="isLoading">
            {{ t('common.btn_submit') }}
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
