<script setup>
import axios from '@/plugins/axios'
import { useI18n } from 'vue-i18n'
import Swal from '@/plugins/sweetalert2'
import { useRouter } from 'vue-router'
import { onMounted, watch } from 'vue'
import useEventBus from '@/utils/eventBus'

import { useVuelidate } from '@vuelidate/core'
import { requiredVuelidate, maxLengthVuelidate } from '@/utils/validators/vuelidate'
import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'
import ApplicationAcceptanceCheck from './ApplicationAcceptanceCheck.vue'
import SummaryApproved from './SummaryApproved.vue'

import banner from '@images/pages/dialog-banner-sm.webp'
import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import { useInscriptionModify } from '@/stores/inscriptionModify'
import { useGeneralFilter } from '@/stores/generalfilter'
import { calculateGenderQuota } from '@/utils/CandidateUtils'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  inscriptionModifyId: { type: Number, required: true },
  radicate: { type: String, required: true },
  isExtemporaneous: { type: Boolean, default: false },
})

const routeNamePendingInscriptions = computed(() => props.isExtemporaneous 
  ? 'inscription-modifies-extemporaneous-pending' : 'inscription-modifies-pending')

const allowExt = ['pdf']
const maxSizeFile = 1024 * 1024 * 1 // 1 MB
const { emit: emiting } = useEventBus()
const file = ref(null)
const fileImage = computed(() => file.value ? iconpdf : unselectfile)
const clearFile = () => file.value = null

const onSelectedFile = e => {
  const uploadfile = e.target.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null
}
  
const onDropFile = e => {
  const uploadfile = e.dataTransfer.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null
}

const validFile = value => {
  if (value.size > maxSizeFile) {
    Swal.fire({ text: 'El archivo excede el peso permitido.', icon: 'warning' })
    
    return false
  }

  const ext = value.name.split('.').pop().toLowerCase()
  if (!allowExt.includes(ext)) {
    Swal.fire({ text: 'El archivo no cumple con una extensión permitida.', icon: 'warning' })
    
    return false
  }

  return true
}

const router = useRouter()
const { t } = useI18n()

const inscription = useInscriptionModify()
const generalfilterStore = useGeneralFilter()

const genders = computed(() => generalfilterStore.genders)
const limitCandidate = computed(() => inscription.limitCandidate)
const candidates = computed(() => inscription.candidates.list.sort((a, b) => a.rowField > b.rowField))

const meetsGenderQuota = computed(() => {
  if (inscription.isUninominal) return true
  if (!candidates.value) return true
  
  return calculateGenderQuota({
    items: candidates.value, 
    genders: genders.value,
    minCandidateQuotaGender: inscription.minCandidateQuotaGender,
    minPercentageQuotaGender: inscription.minPercentageQuotaGender,
    limitCandidate: limitCandidate.value,
    onlyApprove: true,
  })
})

const isLoading = ref(false)
const fileUrl = ref(null)
const allRightCheck = ref(false)
const dialog = ref(false)
const dialogReject = ref(false)
const error = ref(null)
const reasons = ref([])
const infoDoc = ref({ hasPhysicalDoc: false })
const radicateConfirm = ref(null)


const isLoadingReject = ref(false)

const formRejected = ref({
  observation: null,
  reasons: [],
})

const rulesRejected = computed(() => ({
  observation: { 
    requiredVuelidate, 
    maxLengthVuelidate: maxLengthVuelidate(1000),
  },
}))

const vRejected$ = useVuelidate(rulesRejected, formRejected)

const getReasons = () => {
  axios
    .get(`/v1/inscription-reasons-rejected/E7/${props.inscriptionModifyId}`)
    .then(({ data }) => reasons.value = data)
}

const getInfoDoc = () => {
  axios
    .get(`/v1/inscription-change-approval/infodoc/${props.inscriptionModifyId}/${props.radicate}`)
    .then(({ data }) => infoDoc.value = data)
}

const handlerResetReject = () => {
  vRejected$.value.$reset()
  file.value = null
  formRejected.value = {
    observation: null,
    reasons: [],
  }

  dialogReject.value = false
}

const handlerSubmitReject = async() => {
  vRejected$.value.$touch()
  if (vRejected$.value.$invalid) return

  if (file.value == null) {
    Swal.fire({ icon: "warning", text: "Debe cargar soporte de devolución." })

    return 
  }

  if (radicateConfirm.value == null || String(radicateConfirm.value).trim().length == 0) {
    Swal.fire({ icon: "warning", text: "El número de radicado no puede estar vacío" })

    return 
  } 

  if (radicateConfirm.value != props.radicate) {
    Swal.fire({ icon: "warning", text: "El número de radicado es diferente al radicado del formulario actual." })

    return 
  } 

  isLoadingReject.value = true

  const uri = `/v1/inscription-change-approval/reject/${props.inscriptionModifyId}`
  const formData = new FormData()

  formData.append('file', file.value)
  formData.append('radicate', radicateConfirm.value)
  formData.append('observation', formRejected.value.observation)
  formData.append('reasons', formRejected.value.reasons)

  await send(uri, formData, { 'Content-Type': 'multipart/form-data' })
  dialogReject.value = false
  isLoadingReject.value = false
}

const clear = () => {
  if (fileUrl) URL.revokeObjectURL(fileUrl)
}

const mounted = async () =>  {
  isLoading.value = true
  error.value = null
  clear()
  try {
    const { data } = await axios.get(`/v1/inscription-change/preview/${props.inscriptionModifyId}`, { responseType: 'blob' })
    const file = new Blob([data], { type: 'application/pdf' })
 
    fileUrl.value = URL.createObjectURL(file)
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    error.value = text
  }
  isLoading.value = false
}

watch(dialog, value => {
  if (value) mounted()
  else clear()
})

onMounted(() => {
  getReasons()
  getInfoDoc()
  emiting('updateRadicate', radicateConfirm.value)
  emiting('allRightCheck', allRightCheck.value)
})
onUnmounted(() => clear())

const send = async (uri, requestBody, headers = {}) => {
  try {
    const { data } = await axios
      .put(uri, requestBody, { headers })

    const expr = data.message
    switch (expr) {
    case '1':
      Swal.fire({
        icon: "success",
        title: t('validations.inscription_change_success'),
      }).then(() => {
        router.replace({ name: routeNamePendingInscriptions.value })
      })
      break
    case '2':
      Swal.fire({
        icon: "success",
        title: "La modificación fue devuelta",
      }).then(() => {
        router.replace({ name: routeNamePendingInscriptions.value })
      })
      break
    case '3':
      Swal.fire({
        icon: "warning",
        title: t('validations.inscription_change_success'),
        text: "Para completar aprobación, la modificación debe ser aprobada por la segunda autoridad electoral competente.",
      }).then(() => {
        router.replace({ name: 'inscription-modifies-pending' })
      })
      break
    }
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      if (message == 'UNCHECK_SUPPORT') {
        
        Swal.fire({
          icon: 'warning',
          text: 'Debe completar chequeo documental para poder aprobar solicitud.',
        }).then(() => {
          router.push({ 
            name: 'inscription-modifies-pending-id', 
            params: { 
              id: props.inscriptionModifyId, 
              tab: 'inscription-docsupports', 
            },
          })
        })
      } else {
        Swal.fire({
          icon: 'warning',
          text: message || 'No es posible realizar la aprobación de la inscripción.',
        })
      }
    }
  }
  handlerResetReject()
  radicateConfirm.value = null
}

watch(radicateConfirm, val => {
  emiting('updateRadicate', val)
})

watch(allRightCheck, val => {
  emiting('allRightCheck', val)
})

// INICIO APROBACIÓN
const openModal = ref(false)
const candidatePending = ref(false)
const hasManualSignature = ref(false)

const getApplicationAcceptanceCheck = async () => {
  const { data } = await axios.get(`/v1/inscription-change/list/${props.inscriptionModifyId}`)
  
  let current = false
  let checkManualSignature = false

  if (data.content) {
    for (const content of data.content) {
      if (content.approveStatus === 0) {
        current = true
      }

      if (content.approveStatus === 1 && content.icon == 4) {
        checkManualSignature = true
      }
    }
  }

  hasManualSignature.value = checkManualSignature
  candidatePending.value = current
}

onBeforeMount(() => {
  getApplicationAcceptanceCheck()
})

const closeModal = () => {
  if (candidatePending.value) {
    getApplicationAcceptanceCheck()
  }
  
  openModal.value = false
}

const dialogApprove = ref(false)

const handlerApprove = () => {
  if (candidatePending.value) {
    openModal.value = true
    
    return
  }

  dialogApprove.value = true
}

// FIN APROBACIÓN
</script>

<template>
  <VCard class="rounded-lg" variant="outlined">
    <VCardTitle class="text-center mb-6">
      {{ t('tabSummary_e7.approve_request.title_card') }}
    </VCardTitle>
    <template v-if="!meetsGenderQuota">
      <VAlert 
        type="warning" 
        variant="tonal"
        class="text-body-2"
        rounded="0"
      >
        No cumple con la cuota mínima del {{ inscription.minPercentageQuotaGender }}% del género
      </VAlert>
    </template>
    <VCardText class="mt-2">
      <VRow>
        <VCol cols="12">
          <VTextField
            v-model.trim="radicateConfirm"
            :label="t('tabSummary.approve_request.radicate_label')"
          />
        </VCol>
        <VCol cols="12" class="">
          <VDialog
            v-model="dialog"
            class="v-dialog-lg"
            transition="dialog-bottom-transition"
            persistent
          >
            <p>Holaaaaa</p>

            <!-- Dialog close btn -->
            <DialogCloseBtn @click="() => dialog = false" />

            <VCard :title="t('tabSummary_e7.preview_e7.title_card')">
              <VDivider class="mt-2" />
              <VCardText 
                v-if="isLoading" 
                class="d-flex justify-center align-center" 
                style="height: 70vh;"
              >
                <VProgressCircular size="60" indeterminate />
              </VCardText>
              <VCardText v-else-if="error && error.length > 0">
                <div class="d-flex align-center text-h5 mb-2">
                  <VIcon icon="tabler-alert-triangle" color="warning" class="me-2" /> 
                  <div>¡Lo sentimos!</div>
                </div>
                <p>{{ error }}</p>
              </VCardText>  
              <template v-else>
                <embed
                  :src="`${fileUrl}#toolbar=0`" 
                  type="application/pdf" 
                  width="100%"
                  style="height: 70vh;"
                >
                <VDivider />
                <VCardActions class="justify-center">
                  <VCheckbox
                    v-model="allRightCheck"
                    :label="t('tabSummary.preview_e6.all_right')"
                  />
                </VCardActions>
              </template>
            </VCard>
          </VDialog>
        </VCol>
        <VCol>
          <VBtn 
            color="success"
            prepend-icon="tabler-file-like" 
            block
            @click="handlerApprove"
          >
            Aprobar
          </VBtn>
          <VDialog
            v-model="dialogApprove"
            class="v-dialog-lg"
            transition="dialog-bottom-transition"
            persistent
          >
            <!-- Dialog close btn -->
            <DialogCloseBtn @click="() => dialogApprove = false" />

            <VCard>
              <VImg :src="banner" height="120" cover />
              <SummaryApproved 
                :inscription-modify-id="inscriptionModifyId" 
                :radicate="radicate" 
                :typed-radicate="radicateConfirm"
                :all-right-check="allRightCheck"
                :has-manual-signature="hasManualSignature"
                :has-physical-doc="infoDoc.hasPhysicalDoc"
                :is-extemporaneous="isExtemporaneous"
                @canceled="() => dialogApprove = false" 
              />
            </VCard>
          </VDialog>  
        </VCol>
        <VCol>
          <VDialog
            v-model="dialogReject"
            class="v-dialog-lg"
            transition="dialog-bottom-transition"
            persistent
          >
            <template #activator="{ props: dialogProps }">
              <VBtn 
                v-bind="dialogProps" 
                color="error"
                prepend-icon="tabler-file-dislike" 
                block
              >
                Devolver
              </VBtn>
            </template>

            <!-- Dialog close btn -->
            <DialogCloseBtn @click="() => dialogReject = false" />

            <VCard>
              <VImg :src="banner" height="120" cover />
              <VForm @submit.prevent="handlerSubmitReject">
                <VCardItem>
                  <VCardTitle class="text-center">
                    Devolver Formulario E7
                  </VCardTitle>
                </VCardItem>
                <VCardText>
                  <VRow>
                    <VCol cols="12">
                      <VSelect
                        v-model="formRejected.reasons"
                        label="Motivo de la Devolución"
                        :items="reasons"
                        :menu-props="{ maxHeight: '280' }"
                        item-title="name"
                        item-value="id"
                        density="compact"
                        multiple
                        chips
                        clearable
                      />
                    </VCol>
                    <VCol cols="12" md="6">
                      <VTextarea 
                        v-model="formRejected.observation"
                        label="Observaciones"
                        rows="8"
                        row-height="30"
                        no-resize
                        :error-messages="vRejected$.observation.$errors[0]?.$message"
                      />
                    </VCol>
                    <VCol cols="12" md="6">
                      <VCard v-if="file" variant="outlined" class="w-100">
                        <div class="close">
                          <VIcon 
                            class="cursor-pointer"
                            icon="tabler-square-rounded-x-filled" 
                            color="error" 
                            @click="clearFile"
                          />
                        </div>
                        <div class="text-center px-10 py-10">
                          <VImg :src="iconpdf" height="48" aspect-ratio="1" />
                          <div class="pt-1 text-center line-height text-caption ">
                            {{ file.name }}
                          </div>
                          <div class="pt-1 line-height text-caption font-weight-semibold">
                            {{ Math.round((file.size / 1024) * 100) / 100 }} KB
                          </div>
                        </div>
                      </VCard>
                      <DragAndDropZone 
                        v-else
                        component-id="devolver-formulario-e7" 
                        label="Cargar" 
                        accepts="application/pdf" 
                        @drop.prevent="onDropFile" 
                        @change="onSelectedFile" 
                      >
                        <div class="text-center px-10 py-10">
                          <VImg :src="fileImage" height="48" aspect-ratio="1" />
                          <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                            Cargar soporte de devolución
                          </div>
                        </div>
                      </DragAndDropZone>

                      <div class="text-caption text-primary mt-4">
                        <div>
                          {{ t('common.upload.file_max_size', { limit: '1 MB' }) }}
                        </div>
                        <div>
                          {{ t('common.upload.file_types', { type: 'PDF' }) }}
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" class="text-center">
                      <VBtn 
                        type="submit"
                        color="error"
                        prepend-icon="tabler-file-dislike"
                        class="mx-2 notAllowedEmulator" 
                        :loading="isLoadingReject"
                      >
                        Devolver
                      </VBtn>
                      <VBtn 
                        type="button"
                        color="error"
                        prepend-icon="tabler-ban"
                        class="mx-2" 
                        variant="outlined" 
                        :disabled="isLoadingReject" 
                        @click="handlerResetReject"
                      >
                        Cancelar
                      </VBtn>
                    </VCol>                    
                  </VRow>
                </VCardText>
              </VForm>
            </VCard>
          </VDialog>  
        </VCol>
        <VCol cols="12">
          <VBtn 
            color="error"
            prepend-icon="tabler-ban" 
            variant="outlined"
            block 
            :to="{ name: 'index' }"
          >
            {{ t('tabSummary.approve_request.cancel') }}
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>

    <ApplicationAcceptanceCheck 
      :is-dialog-visible="openModal" 
      :inscription-modify-id="inscriptionModifyId" 
      @close-modal="closeModal" 
    />
  </VCard>
</template>
