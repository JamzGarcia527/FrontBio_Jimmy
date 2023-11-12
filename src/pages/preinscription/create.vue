<script setup>
import DialogNotes from "@/components/preinscription/DialogNotes.vue"
import GeneralFilter from "@/components/preinscription/GeneralFilter.vue"
import LocalPhoneField from "@/components/shared/LocalPhoneField.vue"
import AniFinderField from "@/components/shared/AniFinderField.vue"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { keyPressOnlyNumber, pasteOnlyNumber } from "@/utils/events"
import { useGeneralFilter } from "@/composables/useGeneralFilter"
import { useI18n } from "vue-i18n"

import { useVuelidate } from "@vuelidate/core"
import { helpers } from "@vuelidate/validators"
import { useUserConfigStore } from "@/stores/userconfig"
import { useCustomMessage } from "@/composables/useCustomMessage"

import {
  requiredVuelidate,
  requiredSelectVuelidate,
  integerVuelidate,
  emailVuelidate,
} from "@/utils/validators/vuelidate"
import { computed } from "vue"
import { strPad } from "@/utils"

import router from "@/router"

const userConfig = useUserConfigStore()

const isCommittee = computed(() => userConfig.isCommittee)

const { t } = useI18n()
const messageComposable = useCustomMessage()

const terms = [
  "Se autoriza expresamente la utilización de los datos personales suministrados para todos los asuntos relacionados con esta solicitud de inscripción y los demás que se deriven de la misma (Ley 1581 de 2012, Ley 1712 de 2014 y demás normatividad concordante).",
  "Con la suscripción del presente formulario se autoriza expresamente a la Organización Electoral para que notifique los procedimientos y trámites administrativos correspondientes mediante correo electrónico (art. 56 de la Ley 1437 de 2011).",
  "La Registraduría Nacional del Estado Civil, no se responsabilizará por cualquier consecuencia derivada de la inscripción de candidatos, esta facultad es exclusiva de las agrupaciones políticas.",
]

const filtersControls = reactive({ loading: false, disabled: false })
const filtersData = ref({})

const isLoading = ref(false)
const formDisabled = ref(false)
const form = ref({ preferential_vote: 1, accept_terms: false })
const inscriptionId = ref(null)

const rules = computed(() => ({
  name: { requiredVuelidate },
  address: { requiredVuelidate },
  department_id: { requiredSelectVuelidate },
  municipality_id: { requiredSelectVuelidate },
  email: { requiredVuelidate, emailVuelidate },
  alternative_email: {
    requiredVuelidate,
    emailVuelidate,
    diffEmail: helpers.withMessage(
      t("validations.alternative_mail_must_be_different"),
      value => value && value != form.value.email,
    ),
  },
  celular_phone: {
    required: helpers.withMessage(
      t("validations.mobile_or_phone"),
      value => value || form.value.phone,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de celular debe contener 10 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  phone: {
    required: helpers.withMessage(
      t("validations.mobile_or_phone"),
      value => value || form.value.celular_phone,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de teléfono debe contener 7 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  representative_dni: { requiredVuelidate },
  representative_name: { requiredVuelidate },
  accept_terms: { requiredVuelidate },
}))

const generalfilter = useGeneralFilter()

const departments = ref([])
const municipalities = ref([])

const handlerChangeDepartment = (value, flag = true) => {
  if (flag) form.value.municipality_id = null
  if (value == null || value < 0) {
    municipalities.value = [
      { title: t("common.select_write_option"), value: -1 },
    ]
  } else {
    generalfilter
      .getMunicipalitiesFromApi(strPad(value, 2, "0"))
      .then(data => {
        municipalities.value = data.map(e => ({
          title: e.name,
          value: Number(e.id),
        }))
      })
  }
}

const enablePreferentialVoteField = computed(() => {
  const { isBlankVotePromote, corporationId } = filtersData.value

  return (
    !isBlankVotePromote && !generalfilter.isCorporationUninominal(corporationId)
  )
})

const v$ = useVuelidate(rules, form)

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true
  formDisabled.value = true

  const {
    groupingPoliticalId,
    groupingPoliticalTypeId,
    corporationId,
    circunscriptionId,
    department,
    municipality,
    commune,
    isBlankVotePromote,
  } = filtersData.value

  const {
    preferential_vote,
    address,
    email,
    department_id,
    municipality_id,
    alternative_email,
    celular_phone,
    phone,
    representative_dni,
  } = form.value

  const requestBody = {
    grouping_political_id: groupingPoliticalId,
    type_id: groupingPoliticalTypeId,
    corporation_id: corporationId,
    circunscription_id: circunscriptionId,
    department: department,
    municipality: municipality,
    commune: commune,
    blank_vote: isBlankVotePromote,
    preferential_vote: preferential_vote,
    address: address,
    address_department: department_id,
    address_municipality: municipality_id,
    email: email,
    alter_email: alternative_email,
    celular_phone: celular_phone,
    phone: phone,
    registrant_dni: representative_dni,
  }

  try {
    await axios.post("/v1/inscriptions", requestBody).then(data => {
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
          router.push(`/preinscription/${data.data}`)
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
  let fullName = ""
  if (ani) {
    const {
      first_name = "",
      second_name = "",
      first_surname = "",
      second_surname = "",
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
  }

  return await axios.post("/v1/inscriptions/validate", requestBody)
}

const notesShowDialog = ref(false)
const notes = ref([])

const getNotes = async value => {
  const requestBody = {
    corporationId: value.corporationId,
    blankVote: value.isBlankVotePromote > 0 ? 1 : 0,
    groupingPoliticalTypeId: value.groupingPoliticalTypeId,
  }

  const { data } = await axios.post("/notes/filtering", requestBody)

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
          celular_phone,
          representative_dni,
          representative_name,
        } = data

        handlerChangeDepartment(department_id, false)

        form.value = {
          name,
          address,
          department_id,
          municipality_id,
          email,
          alternative_email: alternate_email,
          celular_phone,
          phone,
          representative_dni,
          representative_name,
          preferential_vote: 1,
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

onMounted(() => {
  generalfilter.getDepartmentsFromApi().then(data => {
    departments.value = data.map(e => ({
      title: e.name,
      value: Number(e.id),
    }))
  })
})

const staticAlert = messageComposable.get("MS0004")
</script>

<template>
  <div>
    <template v-if="isCommittee">
      <VAlert
        type="warning"
        variant="tonal"
        :text="staticAlert"
        class="text-body-2 mb-0"
        rounded="0"
      >
        <a href="list">
          <VLabel style="color: rgb(var(--v-theme-warning)) !important;">
            a̲q̲u̲í̲
          </VLabel>
        </a>
      </VAlert>
    </template>
    <template v-else>
      <DialogNotes
        v-model="notesShowDialog"
        :notes="notes"
        @closed="handleClosedNotes"
      />
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
                    class="radiobutton__label-inline"
                    inline
                  >
                    <template #label>
                      <strong>{{
                        t(
                          "preinscription.grouping_political.vote_option.label"
                        )
                      }}: *</strong>
                    </template>
                    <VRadio
                      :label="
                        t(
                          'preinscription.grouping_political.vote_option.preferent'
                        )
                      "
                      :value="1"
                    />
                    <VRadio
                      :label="
                        t(
                          'preinscription.grouping_political.vote_option.unpreferent'
                        )
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
                    :error-messages="v$.name.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model.trim="form.address"
                    :label="t('preinscription.grouping_political.address')"
                    :disabled="formDisabled"
                    :error-messages="v$.address.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VAutocomplete
                    v-model="form.department_id"
                    :label="t('common.department')"
                    filter-mode="some"
                    :items="departments"
                    :disabled="formDisabled"
                    :error-messages="v$.department_id.$errors[0]?.$message"
                    @update:model-value="handlerChangeDepartment"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VAutocomplete
                    v-model="form.municipality_id"
                    :label="t('common.municipality')"
                    filter-mode="some"
                    :items="municipalities"
                    :disabled="formDisabled"
                    :error-messages="v$.municipality_id.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model.trim="form.email"
                    :label="t('preinscription.grouping_political.email')"
                    :disabled="formDisabled"
                    :error-messages="v$.email.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model.trim="form.alternative_email"
                    :label="
                      t('preinscription.grouping_political.alternative_email')
                    "
                    :disabled="formDisabled"
                    :error-messages="v$.alternative_email.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField
                    v-model.trim="form.celular_phone"
                    :label="
                      t('preinscription.grouping_political.celular_phone')
                    "
                    :disabled="formDisabled"
                    :error-messages="v$.celular_phone.$errors[0]?.$message"
                    @keypress="keyPressOnlyNumber"
                    @paste="pasteOnlyNumber"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <LocalPhoneField
                    v-model.trim="form.phone"
                    :label="t('preinscription.grouping_political.phone')"
                    :disabled="formDisabled"
                    :error-messages="v$.phone.$errors[0]?.$message"
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
                    :error-messages="
                      v$.representative_name.$errors[0]?.$message
                    "
                    readonly
                  />
                </VCol>
              </VRow>
            </VCardText>
            <VCardText class="mt-6">
              <VRow>
                <VCol cols="12">
                  <ol
                    class="order-list text-subtitle-2 text-justify px-lg-16 px-6"
                  >
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
    </template>
  </div>
</template>

<route lang="yaml">
name: "preinscription-create"
meta:
  authRequired: true
</route>
