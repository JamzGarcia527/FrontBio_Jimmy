<script setup>
import DialogNotes from "@/components/preinscription/DialogNotes.vue"
import GeneralFilter from "@/components/inscription-modifies/GeneralFilter.vue"
import LocalPhoneField from "@/components/shared/LocalPhoneField.vue"
import AniFinderField from "@/components/shared/AniFinderField.vue"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { keyPressOnlyNumber, pasteOnlyNumber } from "@/utils/events"
import { useGeneralFilter } from "@/composables/useGeneralFilter"
import { useI18n } from "vue-i18n"

import { useVuelidate } from "@vuelidate/core"

import {
  requiredVuelidate,
} from "@/utils/validators/vuelidate"
import { computed } from "vue"
import router from "@/router"

const { t } = useI18n()

const terms = [
  "Se autoriza expresamente la utilización de los datos personales suministrados para todos los asuntos relacionados con esta solicitud de inscripción y los demás que se deriven de la misma (Ley 1581 de 2012, Ley 1712 de 2014 y demás normatividad concordante).",
  "Con la suscripción del presente formulario se autoriza expresamente a la Organización Electoral para que notifique los procedimientos y trámites administrativos correspondientes mediante correo electrónico (art. 56 de la Ley 1437 de 2011).",
  "La Registraduría Nacional del Estado Civil, no se responsabilizará por cualquier consecuencia derivada de la inscripción de candidatos, esta facultad es exclusiva de las agrupaciones políticas.",
]

const filtersControls = reactive({ loading: false, disabled: false })
const filtersData = ref({})

const resultValidate = ref(null)
const isLoading = ref(false)
const formDisabled = ref(false)
const form = ref({ preferential_vote: 1, accept_terms: false })


const rules = computed(() => ({
  name: { requiredVuelidate },
  representative_dni: { requiredVuelidate },
  representative_name: { requiredVuelidate },
  accept_terms: { requiredVuelidate },
}))

const generalfilter = useGeneralFilter()

const enablePreferentialVoteField = computed(() => {
  const { isBlankVotePromote, corporationId } = filtersData.value

  return !isBlankVotePromote
    && !generalfilter.isCorporationUninominal(corporationId)
})

const v$ = useVuelidate(rules, form)

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true
  formDisabled.value = true

  const {
    representative_dni,
  } = form.value

  const requestBody = {
    inscriptionId: resultValidate.value.id, 
    registrantDni: representative_dni,
  }

  try {
    await axios.post("/v1/inscription-change", requestBody).then(data=>{
      Swal.fire({
        title: "Operación exitosa",
        icon: "success",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#229711",
        confirmButtonText: "Continuar Inscripción",
        cancelButtonText: "Aceptar",
      }).then(result => {
        if (result.isConfirmed) {
         
          router.push(`/inscription-modifies/${data.data.id}`)
        }
      })
    })

     
    handlerReset()
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  } finally {
    formDisabled.value = false
    isLoading.value = false
  }
}

const handlerReset = () => {
  form.value = { preferential_vote: 1, accept_terms: false }
  filtersData.value = {}
  filtersControls.disabled = false
  generalfilter.initSelected()
  v$.value.$reset()
}

const handlerAniFound = ani => {
  let fullName = ''
  if (ani) {
    const { 
      first_name = '', 
      second_name = '', 
      first_surname = '', 
      second_surname = '', 
    } = ani

    fullName = `${first_name} ${second_name} ${first_surname} ${second_surname}`
  }
  form.value.representative_name = fullName
}

const validateUniqueInscription = async value => {
  const requestBody = {
    grouping_political_id: value.groupingPoliticalId,
    corporation_id: value.corporationId,
    circunscription_id: value.circunscriptionId,
    department: value.department,
    municipality: value.municipality,
    commune: value.commune,
    blank_vote: 0,
  }
  
  return await axios.post("/v1/inscription-change/validate", requestBody).then(result => {
    resultValidate.value = result.data
  })
}

const notesShowDialog = ref(false)
const notes = ref([])

const getNotes = async value => {
  const requestBody = {
    corporationId: value.corporationId,
    blankVote: value.isBlankVotePromote > 0 ? 1 : 0,
    groupingPoliticalTypeId: value.groupingPoliticalTypeId,
  }

  const { data } = await axios.post("/notes/filtering-e7", requestBody)

  notes.value = data.map(e => e.description)
}

const handleClosedNotes = value => {
  filtersControls.disabled = value
  if (value) {
    const { groupingPoliticalId } = filtersData.value

    axios
      .get(`/grouping-political/${groupingPoliticalId}`)
      .then(({ data }) => {
        const {
          name,
          address,
          email,
          phone,
          alternate_email,
          department_id,
          municipality_id,
          department,
          municipality,
          celular_phone,
          representative_dni,
          representative_name,
        } = data

        form.value = {
          name,
          address,
          department_id,
          municipality_id,
          department,
          municipality,
          email,
          alternative_email: alternate_email,
          celular_phone,
          phone,
          representative_dni,
          representative_name,
          preferential_vote: resultValidate.value.preferentialVote ? 1 : 0,
          accept_terms: false,
        }
      })
      .catch(error => {
        filtersControls.disabled = false
        if (error.response && error.response.status < 500) {
          const { message } = error.response.data

          Swal.fire({ icon: "warning", text: message })
        }
      })
  }
}

const handleNextFilter = async value => {
  filtersControls.disabled = true
  filtersControls.loading = true

  try {
    await validateUniqueInscription(value)
    await getNotes(value)
    notesShowDialog.value = true
    filtersData.value = value
    
  } catch (error) {
    filtersControls.disabled = false
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }

  filtersControls.loading = false
}
</script>

<template>
  <div>
    <DialogNotes v-model="notesShowDialog" :notes="notes" @closed="handleClosedNotes" />
    <GeneralFilter
      :loading="filtersControls.loading"
      :disabled="filtersControls.disabled"
      class="mb-4"
      @next="handleNextFilter"
    />
    <template v-if="form.name">
      <VCard title="Información de Agrupación Política">
        <VForm :disabled="formDisabled" @submit.prevent="handlerSubmit">
          <VCardText>
            <VRow v-if="enablePreferentialVoteField">
              <VCol cols="12">
                <VRadioGroup
                  v-model="form.preferential_vote"
                  disabled
                  class="radiobutton__label-inline"
                  inline
                >
                  <template #label>
                    <strong>{{ t("preinscription.grouping_political.vote_option.label") }}:
                      *</strong>
                  </template>
                  <VRadio
                    :label="t('preinscription.grouping_political.vote_option.preferent')"
                    :value="1"
                  />
                  <VRadio
                    :label="
                      t('preinscription.grouping_political.vote_option.unpreferent')
                    "
                    :value="0"
                  />
                </VRadioGroup>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12" md="6">
                <VTextField
                  v-model.trim="form.name"
                  :label="t('preinscription.grouping_political.name')"
                  readonly
                  disabled
                  :error-messages="v$.name.$errors[0]?.$message"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model.trim="form.address"
                  :label="t('preinscription.grouping_political.address')"
                  disabled
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="form.department"
                  :label="t('common.department')"
                  disabled
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="form.municipality"
                  :label="t('common.municipality')"
                  disabled
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model.trim="form.email"
                  :label="t('preinscription.grouping_political.email')"
                  disabled
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model.trim="form.alternative_email"
                  :label="t('preinscription.grouping_political.alternative_email')"
                  disabled
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model.trim="form.celular_phone"
                  :label="t('preinscription.grouping_political.celular_phone')"
                  disabled
                  @keypress="keyPressOnlyNumber"
                  @paste="pasteOnlyNumber"
                />
              </VCol>
              <VCol cols="12" md="6">
                <LocalPhoneField
                  v-model.trim="form.phone"
                  :label="t('preinscription.grouping_political.phone')"
                  disabled
                />
              </VCol>
            </VRow>
            <VDivider class="my-6" />
            <VRow>
              <VCol cols="12" class="py-0">
                <div class="text-body-1 font-weight-semibold">
                  {{ t("preinscription.representative.title_card") }}
                </div>
              </VCol>
              <VCol cols="12" md="4">
                <AniFinderField
                  v-model.trim="form.representative_dni"
                  :label="t('preinscription.representative.dni')"
                  :disabled="formDisabled"
                  :error-messages="v$.representative_dni.$errors[0]?.$message"
                  @found="handlerAniFound"
                />
              </VCol>
              <VCol cols="12" md="8">
                <VTextField
                  v-model.trim="form.representative_name"
                  :label="t('preinscription.representative.name')"
                  :disabled="formDisabled"
                  :error-messages="v$.representative_name.$errors[0]?.$message"
                  readonly
                />
              </VCol>
            </VRow>
          </VCardText>
          <VCardText class="mt-6">
            <VRow>
              <VCol cols="12">
                <ol class="order-list text-subtitle-2 text-justify px-lg-16 px-6">
                  <li v-for="(item, index) of terms" :key="index">
                    <div>{{ item }}</div>
                  </li>
                </ol>
                <div class="d-flex justify-center">
                  <VCheckbox
                    v-model="form.accept_terms"
                    :label="t('notes.accept_terms_and_conditions')"
                    :disabled="formDisabled"
                    :error="v$.accept_terms.$error"
                    :error-messages="v$.accept_terms.$errors[0]?.$message"
                  />
                </div>
              </VCol>
            </VRow>
          </VCardText>
          <VCardText class="text-center">
            <VBtn
              class="mx-2"
              variant="outlined"
              :disabled="formDisabled"
              @click="handlerReset"
            >
              Limpiar
            </VBtn>
            <VBtn type="submit" class="mx-2 notAllowedEmulator" :loading="isLoading">
              Guardar
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </template>
  </div>
</template>

<route lang="yaml">
name: "inscription-modifies-create"
meta:
  authRequired: true
</route>
