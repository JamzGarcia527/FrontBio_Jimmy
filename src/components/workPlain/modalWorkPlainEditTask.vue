<script setup>
import banner from '@images/pages/dialog-banner-sm.webp'
import axios from '@/plugins/axios'
import { toRefs, computed } from 'vue'
import { useI18n } from 'vue-i18n' 
import { useVuelidate } from "@vuelidate/core" 
import useEventBus from "@/utils/eventBus"
import { helpers, maxLength, required } from '@vuelidate/validators'
import Swal from '@/plugins/sweetalert2'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false,
  },
  labelSubmit: {
    type: String,
    default: "Editar Plan",
  },
  labelCancel: {
    type: String,
    default: "Cancelar",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Array,
    default : Object,
  },
})

const emit = defineEmits(['closeModal', 'onEditData', 'openModal'])
const { emit: emiting } = useEventBus()
const { bus } = useEventBus()

const maxCantidad = 200

const { showModal, labelSubmit, labelCancel, isLoading, editData } = toRefs(props)

const { t } = useI18n()

const form = ref({
  item: null,
  workPlanName: '',
})

const formClear = ref({
  item: null,
  workPlanName: null,
})

const rules = computed(() => ({
  item: {
    maxLength: helpers.withMessage(t('validations.field_max', { count: maxCantidad }), maxLength(maxCantidad)),
    required: helpers.withMessage(t('validations.support_required'), required),
  },
  workPlanName: {
    required: helpers.withMessage(t('validations.support_required'), required),
  },
}))

const $v = useVuelidate(rules, form)

// Methods

const handlerReset = () => {
  Object.assign(form, formClear)
  $v.value.$reset()
  emit('closeModal', false)
}

const handlerSubmit = async () => {
  
  $v.value.$touch()
  if ($v.value.$invalid) return


  const requestBody = {
    id:editData.value.id,
    item:form.value.item,
    workPlanName:form.value.workPlanName,
  }

  try {
   
    const { data } = await axios.put("/workPlan/update", requestBody)
  
    emiting('getData1', true)

    await Swal.fire({ text: 'Información Actualizada Correctamente.', icon: "success" })
    handlerReset()

    isLoading.value = false

  } catch (error) {
    handlerReset()
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }

    showModal.value = true
  }
}


const mostraData = () => {

  if(editData.value){
    form.value.workPlanName = editData.value.workPlanName
    form.value.item = editData.value.item
  }

}


watch(() => bus.value.get('mostraData'), () => {
  mostraData()
})
</script>

<template>
  <div>
    <VDialog
      v-model="showModal"
      max-width="800"
    >
      <DialogCloseBtn @click="emit('closeModal', false)" />

      <VImg :src="banner" cover />
      
      <VCard>
        <VCardText>
          <VForm @submit.prevent="handlerSubmit">
            <VRow justify="center">
              <VCol cols="6">
                <VTextField
                  v-model="form.item"
                  :disabled="isLoading"
                  :label="$t('tabSummary_e7.cancel.item')"
                  :error-messages="$v.item.$errors[0]?.$message"
                  :counter="maxCantidad"
                  rows="2"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="form.workPlanName"
                  :disabled="isLoading"
                  :label="$t('tabSummary_e7.cancel.workPlanName')"
                  :error-messages="$v.workPlanName.$errors[0]?.$message"
                  :counter="maxCantidad"
                  rows="2"
                />
              </VCol>
            </VRow>
            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                :disabled="isLoading"
                @click="handlerReset"
              >
                {{ labelCancel }}
              </VBtn>
              <VBtn :loading="isLoading" class="notAllowedEmulator" :disabled="isLoading" type="submit">
                {{ labelSubmit }}
              </VBtn>
            </VCardText>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
