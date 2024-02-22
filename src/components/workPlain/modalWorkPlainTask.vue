<script setup>
import banner from '@images/pages/dialog-banner-sm.webp'
import { toRefs, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n' 
import { useVuelidate } from "@vuelidate/core" 
import { helpers, required } from '@vuelidate/validators'
import axios from '@/plugins/axios'
import Swal from "@/plugins/sweetalert2"

const props = defineProps({
  itemId: {
    type:Number,
    required: true,
  },
  showModal: {
    type: Boolean,
    default: true,
  },
  labelSubmit: {
    type: String,
    default: "Crear Listado ",
  },
  labelCancel: {
    type: String,
    default: "Cancelar",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['closeModal', 'mostraDataList', 'openModal'])

const stringFromNumber = computed(() => String(props.itemId))

const formData = ref({})

const maxCantidad = 1000

const { showModal, labelSubmit, labelCancel, isLoading,itemId } = toRefs(props)

const { t } = useI18n()

const addOptionDefault = array => {
  return [ { title: 'Seleccione una opción', value: -1 }, ...array]
}

const activityList = computed(() => {

  const array = stringFromNumber.value

  console.log('computed',array)

  return addOptionDefault(array)
})

const form = ref({
  idWorkPlan: itemId,
  activityName: null,
})

const formClear = reactive({
  idWorkPlan: null,
  activityName: null,
})

const rules = computed(() => ({
  idWorkPlan: {
    required: helpers.withMessage(t('validations.support_required'), required),
  },
  activityName: {
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

const handlerSubmit = () => {
  $v.value.$touch()

  formData.value = {
    "idWorkPlan":form.value.idWorkPlan,
    "order":null,
    "activityName":form.value.activityName,
  }

  console.log("formData.value", formData.value)

  axios.post('/workPlanTask/create', formData.value).then(() => {
    
    showModal.value = false

    isLoading.value = true
    
    Swal.fire({ 
      icon: "success", 
      text: t('workPlan.success_send'), 
    // eslint-disable-next-line promise/no-nesting
    }).then(() => {
      handlerReset()
      formData.value = {
        "idWorkPlan":null,
        "order":null,
        "activityName":null,
      }
    })  

  }).catch(error => {
    if (error.response && error.response.status <= 500) {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
    }
  }).finally(() => isLoading.value = false)

}
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
              <VCol
                cols="6"
                md="6"
              >
                <VSelect
                  v-model="itemId"
                  :items="activityList"
                  prepend-inner-icon="tabler-user-search"
                  :label="t('user.user_rol')"
                  class="required"
                  disabled
                />
              </VCol>
              <VCol 
                cols="6" 
                md="6"
              >
                <VTextField
                  v-model="form.activityName"
                  :disabled="isLoading"
                  :label="$t('workPlan.activityName')"
                  :error-messages="$v.activityName.$errors[0]?.$message"
                  :counter="maxCantidad"
                  rows="2"
                  @input="$v.activityName.$touch()"
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
