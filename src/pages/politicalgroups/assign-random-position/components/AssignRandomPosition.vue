<script setup>
import { useI18n } from "vue-i18n"
import {
  requiredVuelidate,
  requiredIfVuelidate,
  integerVuelidate,
  nonNegativeValidator,
} from "@/utils/validators/vuelidate"
import { useVuelidate } from "@vuelidate/core"
import axios from "@/plugins/axios"
import { computed } from "vue"
import { useAppAbility } from '@/plugins/casl/useAppAbility'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  divipole: {
    type: Object,
    required: true,
  },
  setNull: { type: Boolean, default: true },
  listData: { type: Array, default: () => ([]) },
  sopvnParam: { type: String, default: '' },
})

const emit = defineEmits(["assignRandomPosition", "votingOptionPriority", "reverseMasive"])
const { can } = useAppAbility()
import Swal from "@/plugins/sweetalert2"

// Defining and initializing variabless
const { t } = useI18n()

const form = ref({
  groupingPoliticalId: null,
  groupingPoliticalName: null,
  groupingPoliticalPosition: null,
  drawVotingOption: null,
})

const SOPVN = ref(props.sopvnParam)
const requiredExtra = computed(() => SOPVN.value == "S")
const isDialogVisible = ref(false)
const inscriptionId = ref(null) // Se asigna el valor del inscriptionId por la agruapción política que viene de getGroupingPolitical(id de la agrupación política)

const codeSopvn = computed(() => {
  return SOPVN.value === "P" ? 1 
    : SOPVN.value === "N" ? 0 
      : -1
})

const rules = computed(() => ({
  groupingPoliticalId: { requiredVuelidate, integerVuelidate, nonNegativeValidator },
  groupingPoliticalPosition: { requiredVuelidate, integerVuelidate, nonNegativeValidator },
  drawVotingOption: { required: requiredIfVuelidate(requiredExtra) },
}))

const v$ = useVuelidate(rules, form)
 
// Functions and methods
const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  const {
    groupingPoliticalId,
    groupingPoliticalPosition,
    drawVotingOption,
  } = form.value

  emit("assignRandomPosition", {
    inscriptionId: inscriptionId.value,
    groupingPoliticalId,
    groupingPoliticalPosition,
    isPreferential: drawVotingOption === 'P' ? 1 : 0,
    SOPVN: codeSopvn.value,
  })

}

const getGroupingPolitical = async () => {

  if ( form.value.groupingPoliticalId == null || form.value.groupingPoliticalId.trim() === "") {
    form.value.groupingPoliticalName = null
    
    return
  }
  const inscription = props.listData.find(i => i.groupingPoliticalId === parseInt(form.value.groupingPoliticalId))
  
  if (inscription !== null && typeof inscription !== 'undefined') {
    form.value.groupingPoliticalName = inscription.groupingPoliticalName // Obtiene el nombre de la agrupación política
    inscriptionId.value = inscription.inscriptionId
  } else {

    form.value.groupingPoliticalId = null
    form.value.groupingPoliticalName = null
    form.value.groupingPoliticalPosition = null

    await Swal.fire({
      icon: "warning",
      text: `No se encuentra la agrupación política con los filtros seleccionados.`,
    })
  }
}

const handlerSelectVotingOption = value => {
  Swal.fire({
    title: t('assign_random_position.swal.title'),
    text: value == 'P' ? t('assign_random_position.swal.text_confirm_preferred') : t('assign_random_position.swal.text_confirm_nonPreferential'),
    icon: "question",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {

      const { corporationId, circunscriptionId, department, municipality, commune } = props.divipole

      let requestBody = { corporationId, circunscriptionId, department, municipality, commune, votingOptionPriority: value }

      try {
        const { status } = await axios.post('/v1/inscription-final/set-voting-option', requestBody)

        if (status === 204) {
          await Swal.fire({
            icon: "success",
            text: t('assign_random_position.swal.msg_confirmation'),
          })

          emit("votingOptionPriority", { isPreferential: form.value.drawVotingOption === "N" ? 0 : 1 })
          
          return true
        }
        
        return false
      } catch (error) {
        if (error.response && error.response.status != 500) {
          const { message } = error.response.data

          await Swal.fire({
            icon: "warning",
            text: message || t('assign_random_position.swal.not_operation'),
          })
        }

        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

const reversePositionMasive = async value => {
  if (value) {
    emit("reverseMasive", true)
  }
}

watch(() => props.setNull, () => {
  if (props.setNull) {
    form.value.groupingPoliticalId = null
    form.value.groupingPoliticalName = null
    form.value.groupingPoliticalPosition = null
    v$.value.$reset()
  }
})
</script>

<template>
  <div>
    <VCard>
      <VRow v-if="SOPVN == 'S'">
        <VCardText>
          <VCol cols="12">
            <p class="font-weight-normal">
              {{ t("assign_random_position.form.draw_voting_option") }}
            </p>
            <VDivider />
          </VCol>
          <VRadioGroup v-model="form.drawVotingOption" inline @update:model-value="$event => handlerSelectVotingOption($event)">
            <VCol cols="12" md="6">
              <VRadio :label="t('assign_random_position.form.preferredVotingOptionPosition')" value="P" :error="v$.drawVotingOption.$errors[0]?.$message" />
            </VCol>
            <VCol cols="12" md="6">
              <VRadio :label="t('assign_random_position.form.NonPreferentialVotingOptionPosition')" value="N" :error="v$.drawVotingOption.$errors[0]?.$message" />
            </VCol>
            <VCol cols="12" md="12">
              <VDivider />
            </VCol>
          </VRadioGroup>
        </VCardText>
      </VRow>
      <VForm ref="refForm" :disabled="disabled || loading" validate-on="submit" @submit.prevent="handlerSubmit">
        <VCardText>
          <VRow class="mb-2">
            <VCol cols="12">
              <p class="font-weight-normal">
                {{ t("assign_random_position.form.assign_random_position") }}
              </p>
              <VDivider />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model.trim="form.groupingPoliticalId"
                :label="t('assign_random_position.form.groupingPoliticalId')"
                :error-messages="v$.groupingPoliticalId.$errors[0]?.$message"
                @blur="getGroupingPolitical(form.groupingPoliticalId)"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.groupingPoliticalName"
                readonly="true"
                :label="t('assign_random_position.form.groupingPoliticalName')"
              />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model.trim="form.groupingPoliticalPosition"
                :label="t('assign_random_position.form.groupingPoliticalPosition')"
                :error-messages="v$.groupingPoliticalPosition.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText v-if="!disabled || loading" class="d-flex gap-4 justify-space-between">
          <div class="d-flex gap-4">
            <VBtn :loading="loading" class="notAllowedEmulator" :disabled="disabled || loading" type="submit">
              {{ t("assign_random_position.form.btn_assign") }}
            </VBtn>
            <VBtn color="secondary" class="d-flex" :disabled="disabled || loading" type="reset">
              {{ t("assign_random_position.form.btn_reset") }}
            </VBtn>
          </div>

          <VBtn v-if="can('reverse-position', 'inscription-final')" prepend-icon="tabler-rotate" @click="reversePositionMasive(true)">
            {{ t('assign_random_position.form.btn_reserve_position_masive') }}
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
    <VDialog v-model="isDialogVisible" width="300" persistent>
      <VCard color="primary" width="300">
        <VCardText class="pt-3">
          Por favor, espere
          <VProgressLinear indeterminate class="mb-0" />
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
