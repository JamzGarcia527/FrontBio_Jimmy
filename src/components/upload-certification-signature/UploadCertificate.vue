<script setup>
import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import axios from "@/plugins/axios"
import imageLogo from '@images/pages/fondoContrasena.png'

// Declaring and initializing props
const props = defineProps({
  dialogIsOpen: { type: Boolean, default: false },
  groupingPoliticalId: { type: Boolean, default: false },
  metMinimumNumberOfSignatures: { type: Boolean, default: false },
  corporationId: { type: Number, required: true },
  inscriptionId: { type: Number, required: true },
  groupingPoliticalTypeId: { type: Number, required: true },
  blankVotePromoter: { type: Number, required: true },
})

const emit = defineEmits(['closeDialogUploadCertificate', 'savedUpload'])

// Declaring and initializing variables
const { t } = useI18n()
const file = ref(null)
const allowExt = ['pdf']
const maxSizeFile = 1024 * 1024 // 1 MB
const fileImage = computed(() => file.value ? iconpdf : unselectfile)
const viewDialogUploadCertificate = computed(() => props.dialogIsOpen)
const inlineRadio = ref('')
const loading = ref(false)
const disabled = ref(false)

const clearFile = () => file.value = null

const validFile = value => {
  if (value.size > maxSizeFile) {
    Swal.fire({ text: t('candidates.upload.text_file_max_size'), icon: 'warning' })
    
    return false
  }

  const ext = value.name.split('.').pop().toLowerCase()
  if (!allowExt.includes(ext)) {
    Swal.fire({ text: t('candidates.upload.text_error_extension'), icon: 'warning' })
    
    return false
  }

  return true
}

const onSelectedFile = e => {
  const uploadfile = e.target.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null
}
  
const onDropFile = e => {
  const uploadfile = e.dataTransfer.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null
}

const handlerCloseDialog = () => {
  emit('closeDialogUploadCertificate')
}

const handlerSubmit = async () => {
  const formData = new FormData()

  formData.append('groupingPoliticalId', props.groupingPoliticalId)
  formData.append('fulfilledSignature', inlineRadio.value)
  formData.append('certificateFile', file.value)
  formData.append('corporationId', props.corporationId)
  formData.append('blankVotePromoter', props.blankVotePromoter)
  formData.append('inscriptionId', props.inscriptionId)
  formData.append('groupingPoliticalType', props.groupingPoliticalTypeId)

  try {
    loading.value = true
    disabled.value = true

    const response = await axios.post('/v1/committee-certificate/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    Swal.fire({ icon: "success", text: 'Operación realizada correctamente' })
    emit('savedUpload', true)
      
    return { success: true, data: response.data }
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message || t('assign_random_position.swal.not_operation') })
      
      return { success: false }
    }
  } finally {
    inlineRadio.value = null
    clearFile()
    loading.value = false
    disabled.value = false
  }
}
</script>

<template>
  <div>
    <VDialog
      v-model="viewDialogUploadCertificate"
      width="700"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="handlerCloseDialog" />

      <!-- Dialog Content -->
      <VCard>
        <VForm ref="refForm" @submit.prevent="handlerSubmit">
          <VImg
            :src="imageLogo"
            cover
          />
          <VCardText class="text-center">
            <h2 class="d-flex justify-center mb-2">
              Cargue de certificado
            </h2>
            <VRow class="justify-center">
              <VCol md="12">
                <VCard variant="outlined" class="pa-4 mb-4">
                  <VRow>
                    <VCol cols="12" md="6" class="d-flex align-center">
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
                        component-id="importar-eis" 
                        label="Cargar" 
                        accepts="pdf" 
                        @drop.prevent="onDropFile" 
                        @change="onSelectedFile" 
                      >
                        <div class="text-center px-10 py-10">
                          <VImg :src="fileImage" height="48" aspect-ratio="1" />
                          <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                            {{ t('candidates.upload.unselectfile') }}
                          </div>
                        </div>
                      </DragAndDropZone>
                    </VCol>
                    <VCol cols="12" md="6" class="d-flex align-center order-md-first">
                      <div>
                        <template v-if="!file">
                          <label 
                            for="browser"
                            class="v-btn v-btn--elevated v-theme--light bg-primary 
                        v-btn--density-default rounded-pill v-btn--size-default 
                        v-btn--variant-elevated cursor-pointer"
                          >
                            {{ t('candidates.upload.selectfile') }}
                            <VIcon class="ms-2" icon="tabler-upload" />
                          </label>
                          <input id="browser" type="file" class="d-none" accept="pdf" @change="onSelectedFile"> 
                        </template>

                        <div class="text-caption text-primary mt-4">
                          <div>
                            {{ t('candidates.upload.file_max_size', { limit: '1 MB' }) }}
                          </div>
                          <div>
                            {{ t('candidates.upload.file_types', { type: '.pdf' }) }}
                          </div>
                        </div>
                      </div>
                    </VCol>
                  </VRow>
                </VCard>
              </VCol>
              <VDivider />
              <VCol md="12">
                <div class="d-flex justify-center">
                  <VRadioGroup
                    v-model="inlineRadio"
                    inline
                    label="¿Cumplió con el mínimo de firmas?"
                  >
                    <VRadio
                      label="SI"
                      value="1"
                    />
                    <VRadio
                      label="NO"
                      value="0"
                    />
                  </VRadioGroup>
                </div>
              </VCol>
            </VRow>
          </VCardText>
          <VCardText class="d-flex justify-end gap-2">
            <VBtn :disabled="disabled" color="secondary" @click="handlerCloseDialog">
              {{ t('common.btn_close') }}
            </VBtn>
            <VBtn :loading="loading" :disabled="disabled" type="submit">
              Cargar
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VDialog>
  </div>
</template>
