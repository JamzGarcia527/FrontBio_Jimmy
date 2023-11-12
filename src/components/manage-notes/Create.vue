<script setup>
import imageLogo from '@images/pages/fondoContrasena.png'
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator, requiredValidator, maxLengthValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'


const emit = defineEmits(['saved'])

const isDialogVisible = ref(false)
const { t } = useI18n()
const loading = ref(false)
const disabled = ref(false)

const formCreate = ref({
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
  const currentCorporation = corporations.find(c => c.id === formCreate.value.corporationId)
  const allowedCircunscriptions = currentCorporation?.circunscriptions || []

  const array = circunscriptions
    .filter(c => allowedCircunscriptions.includes(c.id))
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const blankVotePromoterOptions = computed(() => {
  const array = [{ title: 'Sí', value: 1 }, { title: 'No', value: 0 }]
  
  return addOptionDefault(array)
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
    if (formCreate.groupingPoliticalTypeId === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  note: [requiredValidator, maxLengthValidator(1000)],
  circunscriptions: [value => {
    if (formCreate.circunscriptionId === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  blankVotePromoterOptions: [value => {
    if (formCreate.value.groupingPoliticalTypeId != 2 && formCreate.value.groupingPoliticalTypeId != 3) {
      
      return true
    }

    if (formCreate.value.isBlankVotePromote === 0) {
      return true
    }
  
    return value && value != -1 || 'Este campo es requerido'

  }],
  phases: [value => {
    if (formCreate.phaseId === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
})

const handlerChangeCorporation = payload => {
  formCreate.value.circunscriptionId = -1

  const corp = generalfilter.corporations.find(e => e.id === payload)
  if (corp && corp.circunscriptions.length == 1) {
    formCreate.value.circunscriptionId = corp.circunscriptions[0]
  }
}

const createForm = ref(null)

const handlerSubmit = async () => {
  const { valid } = await createForm.value.validate()
  if (!valid) return false

  const { groupingPoliticalTypeId, corporationId, circunscriptionId, note, isBlankVotePromote, phaseId } = formCreate.value

  const requestBody = {
    corporationId,
    circunscriptionId,
    groupingPoliticalType: groupingPoliticalTypeId,
    description: note,
    blankVote: isBlankVotePromote == -1 ? 0 : isBlankVotePromote,
    phaseId,
  }

  try {
    loading.value = true
    disabled.value = true
    await axios.post('/notes/create', requestBody)

    isDialogVisible.value = false
    Swal.fire({ icon: "success", text: "Nota guardada" })
    emit('saved', true)
    formCreate.value = {}
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

watch(isDialogVisible, value => {
  if (!value) formCreate.value = {
    groupingPoliticalTypeId: -1,
    isBlankVotePromote: -1,
    corporationId: -1,
    circunscriptionId: -1,
    phaseId: -1,
    note: null,
  }
})
</script>

<template>
  <VDialog
    v-model="isDialogVisible"
    persistent
    width="800"
  >
    <!-- Dialog Activator -->
    <template #activator="{ props }">
      <div class="d-flex justify-end me-3 mt-3 mb-2">
        <VBtn v-bind="props">
          <VIcon start icon="tabler-file-plus" />
          Crear nota
        </VBtn>
      </div>
    </template>

    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

    <!-- Dialog Content -->
    <VCard>
      <VImg
        :src="imageLogo"
        height="100"
        cover
      />
      <VCardText>
        <VForm ref="createForm" validate-on="submit" @submit.prevent="handlerSubmit">
          <VCardText class="text-center">
            <h2 class="d-flex justify-center mb-2">
              Crear nota
            </h2>
            <VRow>
              <VCol cols="23" md="12">
                <VRow>
                  <VCol cols="12" md="12">
                    <VSelect 
                      v-model="formCreate.groupingPoliticalTypeId"
                      :label="t('common.grouping_political_type')"
                      :items="groupingPoliticalTypes"
                      :disabled="disabled"
                      :rules="rules.groupingPoliticalTypes"
                    />
                  </VCol>
                  <VCol v-if="formCreate.groupingPoliticalTypeId == 2 || formCreate.groupingPoliticalTypeId == 3">
                    <VSelect 
                      v-model="formCreate.isBlankVotePromote"
                      :label="t('common.blank_vote_promoter')"
                      :items="blankVotePromoterOptions"
                      :disabled="disabled"
                      :rules="rules.blankVotePromoterOptions"
                    />
                  </VCol>
                  <VCol cols="12" md="12">
                    <VSelect 
                      v-model="formCreate.corporationId"
                      :label="t('common.corporation')"
                      :items="corporations"
                      :disabled="disabled"
                      :rules="rules.corporations"
                      @update:model-value="handlerChangeCorporation"
                    />
                  </VCol>
                  <VCol cols="12" md="12">
                    <VSelect 
                      v-model="formCreate.circunscriptionId"
                      :label="t('common.circunscription')"
                      :items="circunscriptions"
                      :disabled="disabled"
                      :rules="rules.circunscriptions"
                    />
                  </VCol>
                  <VCol cols="12" md="12">
                    <VSelect 
                      v-model="formCreate.phaseId"
                      label="Etapa"
                      :items="phases"
                      :disabled="disabled"
                      :rules="rules.phases"
                    />
                  </VCol>
                  <VCol cols="23" md="12">
                    <VTextarea
                      v-model="formCreate.note"
                      label="Nota" 
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
              @click="isDialogVisible = false"
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
