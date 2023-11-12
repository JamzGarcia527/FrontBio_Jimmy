<script setup>
import { useI18n } from "vue-i18n"
import { useGeneralFilter } from "@/composables/useGeneralFilter"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { keyPressOnlyNumber, pasteOnlyNumber } from '@/utils/events'
import { requiredEspecialSelectValidator, requiredValidator, maxLengthValidator,integerValidator } from "@/utils/validators"

// Definición e inicialización de variables
const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { t } = useI18n()
const dialogIsOpen = computed(() => props.modelValue)

const formCreate = ref({
  phaseId: -1,
  description: null,
  corporationId: -1,
  groupingPoliticalTypeId: -1,
  isBlankVotePromote: -1,
  checkbox:0,
  consecutivo:null,
})

const phasesList = [
  { title: t('common.select_one_option'), value: -1 },
  { title: 'ETAPA E6', value: 1 },
  { title: 'ETAPA E7', value: 2 },
]

const generalfilterCreate = useGeneralFilter()

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const corporations = computed(() => {
  const array = generalfilterCreate
    .getCorporations()
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const groupingPoliticalTypes = computed(() => {
  const array = generalfilterCreate.getGroupingPoliticalsTypes()
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const blankVotePromoterOptions = computed(() => {
  const array = [{ title: 'Sí', value: 1 },{ title: 'No', value: 0 }]
  
  return addOptionDefault(array)
})


const rules = reactive({
  corporations: [requiredEspecialSelectValidator],
  groupingPoliticalTypeId: [value => {
    if (formCreate.groupingPoliticalTypeId === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],

  isBlankVotePromote: [value => {
    if (blankVotePromoterOptions === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],

  description: [requiredValidator, maxLengthValidator(500)],
  consecutivo: [requiredValidator,integerValidator],
  phaseId: [value => {
    if (formCreate.phaseId == -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
})

const form = ref(null)

const handlerClose = () => {
  emit('update:modelValue', false)
}

const handlerSubmit = async () => {

  const { valid } = await form.value.validate()
  if (!valid) return false

  const { phaseId, description, corporationId, groupingPoliticalTypeId, isBlankVotePromote ,checkbox,consecutivo } = formCreate.value


  const requestBody = {
    phaseId,
    corporationId,
    groupingPoliticalType: groupingPoliticalTypeId,
    description: description,
    blankVotePromoter: isBlankVotePromote,
    required:checkbox,
    consecutive:consecutivo,
  }

  try {
    const { data } = await axios.post('v1/supporting-document/create', requestBody)

    Swal.fire({ text: t('supportingDocuments.management.swal.msg_success'), icon: "success" })
    emit('saved', { response: data, isVisible: true })
    clearForm()
    
    return true
  } catch (error) {
    let message = t('common.not_operation')
    if (error.response && error.response.status < 500) 
      message = error.response.data.message
    Swal.fire({ icon: "warning", text: message })
        
    return false
  }
}

const clearForm = () => {
  formCreate.value = {}
}
</script>

<template>
  <div>
    <VDialog
      v-model="dialogIsOpen"
      width="1200"
      persistent
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="handlerClose" />

      <!-- Dialog Content -->
      <VCard>
        <VForm ref="form" validate-on="submit" @submit.prevent="handlerSubmit">
          <VCardText class="text-center">
            <h2 class="d-flex justify-center mb-2">
              Agregar soporte documento
            </h2>
            <VDivider class="mb-5" />
            <VRow class="justify-center">
              <VCol cols="12" md="12">
                <VRow class="mb-2">
                  <VCol cols="12" md="6">
                    <VSelect
                      v-model="formCreate.phaseId" 
                      label="Etapa del proceso"
                      :items="phasesList"
                      :rules="rules.phaseId"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VSelect 
                      v-model="formCreate.corporationId"
                      :label="t('common.corporation')"
                      :items="corporations" 
                      :rules="rules.corporations"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol cols="12" md="6">
                    <VSelect 
                      v-model="formCreate.groupingPoliticalTypeId"
                      :label="t('user.groupingPoliticalTypes')"
                      :items="groupingPoliticalTypes"
                      :rules="rules.groupingPoliticalTypeId"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VSelect 
                      v-model="formCreate.isBlankVotePromote"
                      :label="t('common.blank_vote_promoter')"
                      :items="blankVotePromoterOptions"
                      :rules="rules.isBlankVotePromote"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol cols="12" md="12">
                    <VTextarea v-model="formCreate.description" :rules="rules.description" focused="true" placeholder="Por favor ingrese una descripción de máximo 500 caracteres" counter />
                  </VCol>  
                  <VCol cols="12" md="6">
                    <VCheckbox
                      v-model="formCreate.checkbox"
                      :true-value="1"
                      :false-value="0"
                      label="Por favor seleccioné si el soporte documento es obligatorio"
                    />
                  </VCol> 
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="formCreate.consecutivo" 
                      label="Consecutivo"
                      class="mb-2 required"
                      :rules="rules.consecutivo"
                      :disabled="formDisabled"
                      @keypress="keyPressOnlyNumber"
                      @paste="pasteOnlyNumber"
                    />
                  </VCol>
                </VRow>
              </vcol>
            </vrow>
          </VCardText>

          <VCardText class="d-flex justify-end gap-2">
            <VBtn color="secondary" @click="handlerClose">
              {{ t('common.btn_close') }}
            </VBtn>
            <VBtn type="submit">
              {{ t('common.btn_submit') }}
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VDialog>
  </div>
</template>
