<script setup>
import imageLogo from '@images/pages/fondoContrasena.png'
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator, requiredValidator, maxLengthValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

// Declaring and initializing props
const props = defineProps({
  data: { type: Object, default: () => ({}) },
  isOpenDialog: { type: Boolean, default: false },
})

const emit = defineEmits(['updated', 'closeDialog'])
const isDialogVisible = computed(() => props.isOpenDialog)
const { t } = useI18n()
const loading = ref(false)
const disabled = ref(false)

const formEdit = ref({
  groupingPoliticalTypeId: -1,
  isBlankVotePromote: -1,
  corporationId: -1,
  circunscriptionId: -1,
  phaseId: -1,
  note: null,
})

const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const corporations = computed(() => {
  const array = generalfilter
    .corporations
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const circunscriptions = computed(() => {
  const { corporations, circunscriptions } = generalfilter
  const currentCorporation = corporations.find(c => c.id === formEdit.value.corporationId)
  const allowedCircunscriptions = currentCorporation?.circunscriptions || []

  const array = circunscriptions
    .filter(c => allowedCircunscriptions.includes(c.id))
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const blankVotePromoterOptions = computed(() => {
  return [{ title: 'Sí', value: 1 },{ title: 'No', value: 0 }]
})

const phases = computed(() => {
  const array = [{ title: 'E6', value: 1 }, { title: 'E7', value: 2 }]
  
  return addOptionDefault(array)
})

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .groupingPoliticalTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const rules = reactive({
  corporations: [requiredEspecialSelectValidator],
  groupingPoliticalTypes: [value => {
    if (formEdit.groupingPoliticalTypeId === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  note: [requiredValidator, maxLengthValidator(1000)],
  circunscriptions: [value => {
    if (formEdit.circunscriptionId === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  blankVotePromoterOptions: [value => {
    if (formEdit.value.groupingPoliticalTypeId != 2 && formEdit.value.groupingPoliticalTypeId != 3) {
      
      return true
    }

    if (formEdit.value.isBlankVotePromote === 0) {
      return true
    }
  
    return value && value != -1 || 'Este campo es requerido'

  }],
  phases: [value => {
    if (formEdit.phaseId === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
})

const handlerChangeCorporation = payload => {
  formEdit.value.circunscriptionId = -1

  const corp = generalfilter.corporations.find(e => e.id === payload)
  if (corp && corp.circunscriptions.length == 1) {
    formEdit.value.circunscriptionId = corp.circunscriptions[0]
  }
}

const editForm = ref(null)

const handlerSubmit = async () => {
  const { valid } = await editForm.value.validate()
  if (!valid) return false

  const { groupingPoliticalTypeId, corporationId, circunscriptionId, note, isBlankVotePromote, phaseId } = formEdit.value

  const requestBody = {
    corporationId,
    circunscriptionId,
    groupingPoliticalType: groupingPoliticalTypeId,
    description: note,
    blankVote: isBlankVotePromote,
    phaseId,
  }

  try {
    loading.value = true
    disabled.value = true
    await axios.put(`/notes/update/${props.data.id}`, requestBody)

    isDialogVisible.value = false
    Swal.fire({ icon: "success", text: "Nota actualizada" })
    emit('updated', true)
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    } else {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
    }
  } finally {
    loading.value = false
    disabled.value = false
  }

}

const handlerCloseDialog = () => {
  emit('closeDialog')
}

const handlerOpen = () => {
  formEdit.value = { 
    groupingPoliticalTypeId: props.data && props.data.typeId ? props.data.typeId : -1,
    corporationId: props.data && props.data.corporationId ? props.data.corporationId : -1,
    isBlankVotePromote: props.data && props.data.blankVote === 0 || props.data.blankVote === 1 ?  props.data.blankVote : -1,
    circunscriptionId: props.data && props.data.circunscriptionId ? props.data.circunscriptionId : -1,
    phaseId: props.data && props.data.phaseId ? props.data.phaseId : -1,
    note: props.data && props.data.description ? props.data.description : null,
  }
}

watch(isDialogVisible, value => {
  if (value) handlerOpen()
})
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    persistent
    width="800"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="handlerCloseDialog" />

    <!-- Dialog Content -->
    <VCard>
      <VImg
        :src="imageLogo"
        cover
      />
      <VCardText>
        <VForm ref="editForm" validate-on="submit" @submit.prevent="handlerSubmit">
          <VCardText class="text-center">
            <h2 class="d-flex justify-center mb-4">
              Editar nota
            </h2>
            <VRow>
              <VCol cols="23" md="12">
                <VRow>
                  <VCol cols="12" md="12">
                    <VSelect 
                      v-model="formEdit.groupingPoliticalTypeId"
                      :label="t('common.grouping_political_type')"
                      :items="groupingPoliticalTypes"
                      :rules="rules.groupingPoliticalTypes"
                      readonly
                    />
                  </VCol>
                  <VCol v-if="formEdit.groupingPoliticalTypeId == 2 || formEdit.groupingPoliticalTypeId == 3">
                    <VSelect 
                      v-model="formEdit.isBlankVotePromote"
                      :label="t('common.blank_vote_promoter')"
                      :items="blankVotePromoterOptions"
                      :rules="rules.blankVotePromoterOptions"
                    />
                  </VCol>
                  <VCol cols="12" md="12">
                    <VSelect 
                      v-model="formEdit.corporationId"
                      :label="t('common.corporation')"
                      :items="corporations"
                      :disabled="disabled"
                      :rules="rules.corporations"
                      @update:model-value="handlerChangeCorporation"
                    />
                  </VCol>
                  <VCol cols="12" md="12">
                    <VSelect 
                      v-model="formEdit.circunscriptionId"
                      :label="t('common.circunscription')"
                      :items="circunscriptions"
                      :disabled="disabled"
                      :rules="rules.circunscriptions"
                    />
                  </VCol>
                  <VCol cols="12" md="12">
                    <VSelect 
                      v-model="formEdit.phaseId"
                      label="Etapa"
                      :items="phases"
                      :disabled="disabled"
                      :rules="rules.phases"
                    />
                  </VCol>
                  <VCol cols="23" md="12">
                    <VTextarea
                      v-model="formEdit.note" 
                      placeholder="Por favor ingrese una descripción de máximo 1000 caracteres" 
                      :rules="rules.note"
                      :disabled="disabled"
                      counter
                    />
                  </VCol> 
                </VRow>
              </VCol>
            </VRow>
          </VCardText>
          <VCardText class="d-flex justify-end gap-3 flex-wrap">
            <VBtn
              color="secondary"
              variant="tonal"
              :disabled="disabled"
              @click="handlerCloseDialog"
            >
              {{ t('common.btn_close') }}
            </VBtn>
            <VBtn :loading="loading" type="submit" :disabled="disabled">
              {{ t('common.btn_submit') }}
            </VBtn>
          </VCardText>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
