<script setup>
import axios from '@/plugins/axios'
import { useI18n } from 'vue-i18n'
import Swal from '@/plugins/sweetalert2'
import { useRouter } from 'vue-router'

// import useEventBus from '@/utils/eventBus'
import { helpers } from "@vuelidate/validators"

import { useVuelidate } from '@vuelidate/core'
import { requiredVuelidate } from '@/utils/validators/vuelidate'
import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'

import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import { reactive } from 'vue'
import { downloadBlob } from '@/utils'
import { useCustomMessage } from '@/composables/useCustomMessage'

const props = defineProps({
  inscriptionModifyId: { type: Number, required: true },
  radicate: { type: String, required: true },
  typedRadicate: { type: String, default: null },
  allRightCheck: { type: Boolean, default: false },
  hasManualSignature: { type: Boolean, default: false },
  hasPhysicalDoc: { type: Boolean, default: false },
  isExtemporaneous: { type: Boolean, default: false },
})

const emit = defineEmits(['canceled'])

// System Properties
// const { bus } = useEventBus()
const messageComposable = useCustomMessage()
const router = useRouter()
const { t } = useI18n()

const routeNamePendingInscriptions = computed(() => props.isExtemporaneous 
  ? 'inscription-modifies-extemporaneous-pending' : 'inscription-modifies-pending')

// Properties
const allowExtDocument = ['pdf']
const maxSizeFile = 1024 * 1024 * 1 // 1 MB

const { allRightCheck } = toRefs(props)

const form = reactive({
  type_approve: null,
  fileE7Physical: null,
  fileEis: null,
  codeEis: null,
})

const approveMethods = [
  {
    icon: { icon: 'tabler-face-id' },
    title: 'Biometría Facial',
    value: 3,
  },
  {
    icon: { icon: 'tabler-password' },
    title: 'Código EIS',
    value: 1,
  },
  {
    icon: { icon: 'tabler-writing-sign' },
    title: 'Manual',
    value: 2,
  },
]

// Rules
const rulesForm = computed(() => ({
  type_approve: { 
    requiredVuelidate,
  },
  fileE7Physical: {
    required: helpers.withMessage(
      t("validations.support_required"), 
      value => ((form.type_approve == 2 || props.hasManualSignature) && value)
        || (form.type_approve != 2 && (!props.hasManualSignature || props.hasPhysicalDoc)),
    ),
  },
  fileEis: {
    required: helpers.withMessage(
      t("validations.support_required"),
      value => form.type_approve !=  1 || (form.type_approve == 1 && value),
    ), 
  },
  codeEis: {
    required: helpers.withMessage(
      t("validations.fields_required"),
      value => form.type_approve != 1 || (form.type_approve == 1 && value),
    ), 
  },
}))

const v$ = useVuelidate(rulesForm, form)

// Getters
const fileImageE7Physical = computed(() => form.fileE7Physical ? iconpdf : unselectfile)
const fileImageEis = computed(() => form.fileEis ? iconpdf : unselectfile)

// Methods
// --> File E7 Physical
const clearFileE7Physical = () => form.fileE7Physical = null

const onSelectedFileE7Physical = e => {
  const uploadfile = e.target.files[0]

  form.fileE7Physical = validFileDocument(uploadfile) ? uploadfile : null
}
  
const onDropFileE7Physical = e => {
  const uploadfile = e.dataTransfer.files[0]

  form.fileE7Physical = validFileDocument(uploadfile) ? uploadfile : null
}

// --> File Eis
const clearFileEis = () => form.fileEis = null

const onSelectedFileEis = e => {
  const uploadfile = e.target.files[0]

  form.fileEis = validFileDocument(uploadfile) ? uploadfile : null
}
  
const onDropFileEis = e => {
  const uploadfile = e.dataTransfer.files[0]

  form.fileEis = validFileDocument(uploadfile) ? uploadfile : null
}

const validFileDocument = value => {
  if (value.size > maxSizeFile) {
    Swal.fire({ text: 'El archivo excede el peso permitido.', icon: 'warning' })
    
    return false
  }

  const ext = value.name.split('.').pop().toLowerCase()
  if (!allowExtDocument.includes(ext)) {
    Swal.fire({ text: 'El archivo no cumple con una extensión permitida.', icon: 'warning' })
    
    return false
  }

  return true
}

const send = async (uri, requestBody, headers = {}) => {
  try {
    const { data } = await axios
      .put(uri, requestBody, { headers })

    const expr = data.message

    console.log(expr)
    switch (expr) {
    case '1':
      Swal.fire({
        icon: "success",
        title: t('validations.inscription_change_success'),
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
        router.replace({ name: routeNamePendingInscriptions.value })
      })
      break
    case '4':
      Swal.fire({
        icon: "warning",
        title: messageComposable.get("MS0037"),
        text: messageComposable.get("MS0038"),
      }).then(() => {
        router.replace({ name: routeNamePendingInscriptions.value })
      })
      break
    }
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      if (message == 'UNCHECK_SUPPORT') {
        emit('canceled', true)

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
}


const handlerApprovedE7 = async () => {
  if (props.typedRadicate === null || props.typedRadicate === '') {
    Swal.fire({ icon: "warning", text: "El número de radicado no puede estar vacío" })

    return 
  }

  if (props.typedRadicate != props.radicate) {
    Swal.fire({ icon: "warning", text: "El número de radicado es diferente al radicado del formulario actual." })

    return 
  }
  
  if (!allRightCheck.value) {
    Swal.fire({ icon: "warning", text: "Debe previsualizar y marcar como validado el formulario E7" })

    return 
  }

  v$.value.$touch()

  if ( v$.value.$invalid ) return

  Swal.fire({
    html: "¿Esta seguro de <strong>aprobar</strong> la modificación actual?",
    icon: "question",
    customClass: { confirmButton: "bg-primary" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        const uri = form.type_approve == 3 
          ? `v1/inscription-change-approval/biometric-facial/${props.inscriptionModifyId}`
          : `v1/inscription-change-approval/approve/${props.inscriptionModifyId}`
        
        const formData = new FormData()

        formData.append('id', props.inscriptionModifyId)
        formData.append('radicate', props.radicate)
        formData.append('approveType', form.type_approve)
        formData.append('physicalDocFile', form.fileE7Physical)
        formData.append('eisSupportDocFile', form.type_approve == 1 ? form.fileEis : null)
        formData.append('eisCode', form.type_approve == 1 ? form.codeEis : null)

        await send(uri, formData, { 'Content-Type': 'multipart/form-data' })
      } catch (error) {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

const handlerCancel = () => {
  v$.value.$reset()

  form.type_approve = null
  form.fileE7Physical = null
  form.fileEis = null
  form.codeEis = null

  emit('canceled', true)

}

// Setters Watchs
// watch(() => bus.value.get('updateRadicate'), value => {
//   form.numRadicate = value[0] || null
// })

// watch(() => bus.value.get('allRightCheck'), value => {
//   allRightCheck.value = value[0] || false
// })


const isDownLoadingForm = ref(false)

const downdloadPreview = async () =>  {
  isDownLoadingForm.value = true
  try {
    const { data } = await axios.get(`/v1/inscription-change/preview/${props.inscriptionModifyId}`, { responseType: 'blob' })

    downloadBlob(data, `${props.radicate}.pdf`, { type: 'application/pdf' })
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    error.value = text
  }
  isDownLoadingForm.value = false
}

const isDownLoadingPhysicalDoc = ref(false)

const downdloadPhysicalDoc = async () =>  {
  isDownLoadingPhysicalDoc.value = true
  try {
    const { data } = await axios.get(`v1/inscription-change-approval/download/${props.inscriptionModifyId}/${props.radicate}/physical`, { responseType: 'blob' })

    downloadBlob(data, `${props.radicate}.pdf`, { type: 'application/pdf' })
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    error.value = text
  }
  isDownLoadingPhysicalDoc.value = false
}
</script>

<template>
  <div>
    <VCard flat class="mb-6 text-primary">
      <VCardItem>
        <VCardTitle class="text-center">
          Aprobar Formulario E7
        </VCardTitle>
      </VCardItem>
      <VCardText>
        <VForm @submit.prevent="handlerApprovedE7">
          <VRow class="mb-4">
            <!-- Radio Button tipos de aprobación -->
            <VCol cols="12">
              <h6 class="text-base font-weight-regular mb-4">
                Elige un método de aprobación
              </h6>
              <CustomRadiosWithIcon
                v-model:selected-radio="form.type_approve"
                :radio-content="approveMethods"
                :grid-column="{ cols: '12', sm: '4', md: '3' }"
              >
                <template #default="{ item }">
                  <div class="d-flex flex-column align-center gap-2 w-100 pt-4">
                    <VIcon v-bind="item.icon" />

                    <h6 class="text-base font-weight-medium">
                      {{ item.title }}
                    </h6>
                  </div>
                </template>
              </CustomRadiosWithIcon>
            </VCol>
          </VRow>

          <VRow>
            <!-- DragAndDropZone Cargue de E7 Físico -->
            <VCol cols="12" md="6">
              <VExpandTransition>
                <div v-if="form.type_approve == 2 || (hasManualSignature && !hasPhysicalDoc)">
                  <VCard v-if="form.fileE7Physical" variant="outlined" class="w-100">
                    <div class="close">
                      <VIcon 
                        class="cursor-pointer"
                        icon="tabler-square-rounded-x-filled" 
                        color="error" 
                        @click="clearFileE7Physical"
                      />
                    </div>
                    <span class="ml-2">Documento E7 Firmado</span>
                    <div class="text-center px-10 py-10">
                      <VImg :src="iconpdf" height="48" aspect-ratio="1" />
                      <div class="pt-1 text-center line-height text-caption ">
                        {{ form.fileE7Physical.name }}
                      </div>
                      <div class="pt-1 line-height text-caption font-weight-semibold">
                        {{ Math.round((form.fileE7Physical.size / 1024) * 100) / 100 }} KB
                      </div>
                    </div>
                  </VCard>
                  <DragAndDropZone 
                    v-else
                    component-id="e7-Physical" 
                    label="Cargar" 
                    accepts="application/pdf" 
                    @drop.prevent="onDropFileE7Physical" 
                    @change="onSelectedFileE7Physical" 
                  >
                    <div class="text-center px-10 py-10">
                      <VImg :src="fileImageE7Physical" height="48" aspect-ratio="1" />
                      <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                        Cargar Documento E7 Firmado <br>
                        <span v-if="v$.fileE7Physical.$errors" class="text-error">{{ v$.fileE7Physical.$errors[0]?.$message }}</span>
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
                  
                  <VBtn
                    :loading="isDownLoadingForm" 
                    prepend-icon="tabler-download" 
                    class="mt-6" block 
                    @click="downdloadPreview"
                  >
                    {{ t('common.download_form') }}
                  </VBtn>
                  <VBtn
                    v-if="hasPhysicalDoc"
                    variant="outlined"
                    :loading="isDownLoadingPhysicalDoc" 
                    prepend-icon="tabler-download" 
                    class="mt-6" block 
                    @click="downdloadPhysicalDoc"
                  >
                    Descargar E7 firmado
                  </VBtn>
                </div>
              </VExpandTransition>
            </VCol>
          
            <!-- DragAndDropZone Cargue Documento EIS -->
            <VCol cols="12" md="6">
              <VExpandTransition>
                <VRow v-if="form.type_approve == 1">
                  <VCol cols="12">
                    <VCard v-if="form.fileEis" variant="outlined" class="w-100">
                      <div class="close">
                        <VIcon 
                          class="cursor-pointer"
                          icon="tabler-square-rounded-x-filled" 
                          color="error" 
                          @click="clearFileEis"
                        />
                      </div>
                      <span class="ml-2">Anexo EIS</span>
                      <div class="text-center px-10 py-10">
                        <VImg :src="iconpdf" height="48" aspect-ratio="1" />
                        <div class="pt-1 text-center line-height text-caption ">
                          {{ form.fileEis.name }}
                        </div>
                        <div class="pt-1 line-height text-caption font-weight-semibold">
                          {{ Math.round((form.fileEis.size / 1024) * 100) / 100 }} KB
                        </div>
                      </div>
                    </VCard>
                    <DragAndDropZone 
                      v-else
                      component-id="eis-file" 
                      label="Cargar" 
                      accepts="application/pdf" 
                      @drop.prevent="onDropFileEis" 
                      @change="onSelectedFileEis" 
                    >
                      <div class="text-center px-10 py-10">
                        <VImg :src="fileImageEis" height="48" aspect-ratio="1" />
                        <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                          Cargar Anexo EIS <br>
                          <span v-if="v$.fileEis.$errors" class="text-error">{{ v$.fileEis.$errors[0]?.$message }}</span>
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

                  <VCol cols="12">
                    <VTextField
                      v-model.trim="form.codeEis"
                      :label="t('candidates.eis.table.eisCode')"
                      :error-messages="v$.codeEis.$errors[0]?.$message"
                    />
                  </VCol>
                </VRow>
              </VExpandTransition>
            </VCol>
          </VRow>

          <VRow class="mt-5">
            <!-- Botón de Aprobar -->
            <VCol cols="12" class="text-center">
              <VBtn 
                type="submit"
                color="success"
                prepend-icon="tabler-file-like"
                class="px-5 mx-2 notAllowedEmulator"
              >
                {{ t('tabSummary.approve_request.approve') }}
              </VBtn>
              <VBtn 
                type="button"
                color="success"
                variant="outlined"
                prepend-icon="tabler-ban"
                class="px-5 mx-2"
                @click="handlerCancel"
              >
                {{ t('common.btn_cancelar') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>          
    </VCard>
  </div>
</template>

<style lang="scss">
.radio_center > .v-input__control {
  margin-inline: auto;
}

.px-large {
  padding-inline: 80px !important;
}
</style>
