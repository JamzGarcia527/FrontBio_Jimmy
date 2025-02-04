<script setup>
import banner from '@images/pages/dialog-banner-sm.webp'
import { toRefs, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n' 
import { useVuelidate } from "@vuelidate/core" 
import { helpers, maxLength, required } from '@vuelidate/validators'
import Swal from '@/plugins/sweetalert2'
import axios from '@/plugins/axios'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: true,
  },
  labelSubmit: {
    type: String,
    default: "Guardar Plan",
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

const emit = defineEmits(['closeModal', 'cancelE7', 'openModal'])

const itemsListCompany = ref([])

const maxCantidad = 1000

const { showModal, labelSubmit, labelCancel, isLoading } = toRefs(props)

const { t } = useI18n()

const form = reactive({
  item: null,
  workPlanName: null,
  companyId: null,
})

const formClear = reactive({
  item: null,
  workPlanName: null,
  companyId: null,
})

const rules = computed(() => ({
  item: {
    maxLength: helpers.withMessage(t('validations.field_max', { count: maxCantidad }), maxLength(maxCantidad)),
  },
  workPlanName: {
    required: helpers.withMessage(t('validations.support_required'), required),
  },
  companyId: {
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

  console.log("form", form)

  $v.value.$touch()

  if (!$v.value.$invalid) {
    emit('cancelE7', form)
  }
}

// get data work plan 
const getDataListCompany = async () => {
  try {
    await axios
      .get("company/list")
      .then(response => {
        itemsListCompany.value = response.data
        console.log("getDataListCompany", itemsListCompany.value)
      })
  } catch (error) {
    console.log(error)
  }  
}

const addOptionDefault = array => {
  return [ { title: 'Seleccione una opción', value: -1 }, ...array]
}

const companyList = computed(() => {

  const array = itemsListCompany.value.map(e => ({ title: e.companyName, value: e.id }))

  return addOptionDefault(array)
})

onMounted(() => {
  getDataListCompany()
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
                  @input="$v.item.$touch()"
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
                  @input="$v.workPlanName.$touch()"
                />
              </VCol>
              <VCol
                cols="6"
                md="6"
              >
                <VSelect
                  v-model="form.companyId"
                  :items="companyList"
                  prepend-inner-icon="tabler-user-search"
                  :label="t('work_plan.selectCompany')"
                  :error-messages="$v.companyId.$errors[0]?.$message"
                  class="required"
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
