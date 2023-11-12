<script setup>
import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import axios from "@/plugins/axios"
import ViewDocuments from '@/components/logo-symbol/approve/ViewDocuments.vue'
import ViewCandidates from '@/components/logo-symbol/approve/ViewCandidates.vue'
import { useVuelidate } from '@vuelidate/core'

// Validators
import {
  requiredVuelidate,
  maxLengthVuelidate,
} from '@/utils/validators/vuelidate'

const props = defineProps({
  img: { type: Blob, required: true },
  groupingPoliticalId: { type: Number, required: true },
  inscriptionId: { type: Number, required: true },
})

const { t } = useI18n()
const fileResolutionName = ref(null)
const fileResolutionLogo = ref(null)
const allowExt = ['pdf']
const maxSizeFile = 1024 * 1024 * 5 // 5 MB
const fileImageResolutionName = computed(() => fileResolutionName.value ? iconpdf : unselectfile)
const fileImageResolutionLogo = computed(() => fileResolutionLogo.value ? iconpdf : unselectfile)
const loading = ref(false)
const disabled = ref(false)
const formRejectIsVisible = ref(false)
const isDialogDocumentVisible = ref(false)
const isDialogCandidatesVisible = ref(false)

const formUpload = ref({
  numberResolution1: null,
  numberResolution2: null,
  dateResolution1: null,
  dateResolution2: null,
  filesAppeal: null,
  magistrateOffice: null,
})

const formReject = ref({
  observation: null,
})


// Métodos o funciones
const clearFile = () => fileResolutionName.value = null
const clearFileLogo = () => fileResolutionLogo.value = null

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

  fileResolutionName.value = validFile(uploadfile) ? uploadfile : null
}
  
const onDropFile = e => {
  const uploadfile = e.dataTransfer.files[0]

  fileResolutionName.value = validFile(uploadfile) ? uploadfile : null
}

const onSelectedFileLogo = e => {
  const uploadfile = e.target.files[0]

  fileResolutionLogo.value = validFile(uploadfile) ? uploadfile : null
}
  
const onDropFileLogo = e => {
  const uploadfile = e.dataTransfer.files[0]

  fileResolutionLogo.value = validFile(uploadfile) ? uploadfile : null
}

const rules = computed(() => ({
  numberResolution1: { requiredVuelidate },
  dateResolution1: { requiredVuelidate },
  numberResolution2: { requiredVuelidate },
  dateResolution2: { requiredVuelidate },
  filesAppeal: { requiredVuelidate },
  magistrateOffice: {
    requiredVuelidate,
    maxLengthVuelidate: maxLengthVuelidate(250),
  },
}))

const v$ = useVuelidate(rules, formUpload)

const handlerApproveLogoSymbol = async () => {

  v$.value.$touch()
  if (v$.value.$invalid) return

  try {
    loading.value = true
    disabled.value = true

    const { success } = await handlerUploadResolutions()
    if (success) {
      const { status } = await axios.get(`/v1/grouping-political-logo/approve/${props.groupingPoliticalId}`)
      if (status === 200) {
        Swal.fire({
          icon: "success",
          text: t('logo_symbol.generate_approval.swal.success_approve'),
        })
      }
    }
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: "warning",
        text: message || t('assign_random_position.swal.not_operation'),
      })
    }

    return false
  } finally {
    loading.value = false
    disabled.value = false
    v$.value.$reset()
  } 
}

const handlerOpenRejectLogoSymbol = () => {
  
  v$.value.$touch()
  if (v$.value.$invalid) return

  if (!fileResolutionName.value) {
    Swal.fire({ icon: "warning", text: 'El archivo acto administrativo del nombre es requerido' })
    
    return false
  }

  if (!fileResolutionLogo.value) {
    Swal.fire({ icon: "warning", text: 'El archivo acto administrativo del logo o símbolo requerido' })
    
    return false
  }

  formRejectIsVisible.value = true

  v$.value.$reset()
}


const handlerRejectLogoSymbol = async () => {

  const requestBody = { logoId: props.groupingPoliticalId, observation: formReject.value.observation }
  try {
    loading.value = true
    disabled.value = true

    const { success } = await handlerUploadResolutions()
    if (success) {
      const { status } = await axios.post('/v1/grouping-political-logo/reject', requestBody)
      if (status === 200) {
        Swal.fire({
          icon: "success",
          text: t('logo_symbol.generate_approval.swal.reject_approve'),
        })
      } 
    }
    
    return true
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: "warning",
        text: message || t('assign_random_position.swal.not_operation'),
      })
    }

    return false
  } finally {
    loading.value = false
    disabled.value = false
    formRejectIsVisible.value = false
    formReject.value = {}
    v$.value.$reset()
  }
}

const handlerUploadResolutions = async () => {
  const formData = new FormData()

  const { numberResolution1, numberResolution2, dateResolution1, dateResolution2, magistrateOffice, filesAppeal  } = formUpload.value

  formData.append('groupingPoliticalId', props.groupingPoliticalId)
  formData.append('numberResolution1', numberResolution1)
  formData.append('numberResolution2', numberResolution2)
  formData.append('dateResolution1', dateResolution1)
  formData.append('dateResolution2', dateResolution2)
  formData.append('magistrateOffice', magistrateOffice)
  formData.append('filesAppeal', filesAppeal)
  formData.append('fileResolution1', fileResolutionName.value)
  formData.append('fileResolution2', fileResolutionLogo.value)

  if (!fileResolutionName.value) {
    Swal.fire({ icon: "warning", text: 'El archivo acto administrativo del nombre es requerido' })
    
    return false
  }

  if (!fileResolutionLogo.value) {
    Swal.fire({ icon: "warning", text: 'El archivo acto administrativo del logo o símbolo requerido' })
    
    return false
  }

  try {
    const response = await axios.post('/v1/grouping-political-logo/upload-resolution', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      
    return { success: true, data: response.data }
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message || t('assign_random_position.swal.not_operation') })
      
      return { success: false }
    }
  } finally {
    formUpload.value = {}
    clearFile()
    clearFileLogo()
  }
  
}

const handlerCloseModalDocuments = () => {
  isDialogDocumentVisible.value = false
}

const handlerCloseModalCandidates = () => {
  isDialogCandidatesVisible.value = false
}

const handlerDownloadLogo = () => {
  const link = document.createElement('a')

  link.href = props.img
  link.setAttribute("download", `${props.groupingPoliticalId}.jpg`)
  document.body.appendChild(link)
  link.click()

  // remove element and urlobject
  link.remove()
}
</script>

<template>
  <div>
    <VCard>
      <VForm ref="refForm" @submit.prevent="handlerApproveLogoSymbol">
        <VRow>
          <VCol align-self="start">
            <h5 class="d-flex justify-center ma-5">
              ACTO ADMINISTRATIVO DEL NOMBRE
            </h5>
            <div class="ma-5">
              <VTextField v-model="formUpload.numberResolution1" :label="t('logo_symbol.generate_approval.formApprove.resolutionNumber')" :error-messages="v$.numberResolution1.$errors[0]?.$message" />
            </div>
            <div class="ma-5">
              <VTextField v-model="formUpload.dateResolution1" :label="t('logo_symbol.generate_approval.formApprove.resolutionDate')" type="date" :error-messages="v$.dateResolution1.$errors[0]?.$message" />
            </div>
            <div class="ma-5">
              <VCard variant="outlined" class="pa-4 mb-4">
                <VRow>
                  <VCol cols="12" md="6" class="d-flex align-center">
                    <VCard v-if="fileResolutionName" variant="outlined" class="w-100">
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
                          {{ fileResolutionName.name }}
                        </div>
                        <div class="pt-1 line-height text-caption font-weight-semibold">
                          {{ Math.round((fileResolutionName.size / 1024) * 100) / 100 }} KB
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
                        <VImg :src="fileImageResolutionName" height="48" aspect-ratio="1" />
                        <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                          {{ t('candidates.upload.unselectfile') }}
                        </div>
                      </div>
                    </DragAndDropZone>
                  </VCol>
                  <VCol cols="12" md="6" class="d-flex align-center order-md-first">
                    <div>
                      <template v-if="!fileResolutionName">
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
                          {{ t('candidates.upload.file_max_size', { limit: '5 MB' }) }}
                        </div>
                        <div>
                          {{ t('candidates.upload.file_types', { type: '.pdf' }) }}
                        </div>
                      </div>
                    </div>
                  </VCol>
                </VRow>
              </VCard>
            </div>
          </VCol>
          <VDivider vertical />
          <VCol align-self="start">
            <h5 class="d-flex justify-center ma-5">
              ACTO ADMINISTRATIVO DEL LOGO O SÍMBOLO APROBACIÓN
            </h5>
            <div class="ma-5">
              <VTextField 
                v-model="formUpload.numberResolution2" 
                :error-messages="v$.numberResolution2.$errors[0]?.$message" 
                :label="t('logo_symbol.generate_approval.formApprove.resolutionNumber')"
              />
            </div>
            <div class="ma-5">
              <VTextField 
                v-model="formUpload.dateResolution2" 
                :error-messages="v$.dateResolution2.$errors[0]?.$message" 
                :label="t('logo_symbol.generate_approval.formApprove.resolutionDate')" type="date"
              />
            </div>    
            <div class="ma-5">
              <VCard variant="outlined" class="pa-4 mb-4">
                <VRow>
                  <VCol cols="12" md="6" class="d-flex align-center">
                    <VCard v-if="fileResolutionLogo" variant="outlined" class="w-100">
                      <div class="close">
                        <VIcon 
                          class="cursor-pointer"
                          icon="tabler-square-rounded-x-filled" 
                          color="error" 
                          @click="clearFileLogo"
                        />
                      </div>
                      <div class="text-center px-10 py-10">
                        <VImg :src="iconpdf" height="48" aspect-ratio="1" />
                        <div class="pt-1 text-center line-height text-caption ">
                          {{ fileResolutionLogo.name }}
                        </div>
                        <div class="pt-1 line-height text-caption font-weight-semibold">
                          {{ Math.round((fileResolutionLogo.size / 1024) * 100) / 100 }} KB
                        </div>
                      </div>
                    </VCard>
                    <DragAndDropZone 
                      v-else
                      component-id="importar-eis" 
                      label="Cargar" 
                      accepts="pdf" 
                      @drop.prevent="onDropFileLogo" 
                      @change="onSelectedFileLogo" 
                    >
                      <div class="text-center px-10 py-10">
                        <VImg :src="fileImageResolutionLogo" height="48" aspect-ratio="1" />
                        <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                          {{ t('candidates.upload.unselectfile') }}
                        </div>
                      </div>
                    </DragAndDropZone>
                  </VCol>
                  <VCol cols="12" md="6" class="d-flex align-center order-md-first">
                    <div>
                      <template v-if="!fileResolutionLogo">
                        <label 
                          for="browserLogo"
                          class="v-btn v-btn--elevated v-theme--light bg-primary 
                        v-btn--density-default rounded-pill v-btn--size-default 
                        v-btn--variant-elevated cursor-pointer"
                        >
                          {{ t('candidates.upload.selectfile') }}
                          <VIcon class="ms-2" icon="tabler-upload" />
                        </label>
                        <input id="browserLogo" type="file" class="d-none" accept="pdf" @change="onSelectedFileLogo"> 
                      </template>

                      <div class="text-caption text-primary mt-4">
                        <div>
                          {{ t('candidates.upload.file_max_size', { limit: '5 MB' }) }}
                        </div>
                        <div>
                          {{ t('candidates.upload.file_types', { type: '.pdf' }) }}
                        </div>
                      </div>
                    </div>
                  </VCol>
                </VRow>
              </VCard>
            </div>
          </VCol>
          <VDivider vertical />
          <VCol align-self="center">
            <VCard class="pa-5 ma-5">
              <VImg :src="img" />
            </VCard>
            <div>
              <div class="ma-5">
                <VBtn block @click="handlerDownloadLogo">
                  {{ t('logo_symbol.generate_approval.formApprove.downloadLogo') }}
                  <VIcon
                    end
                    icon="tabler-download"
                  />
                </VBtn>
              </div>
            </div>
            <VCol cols="12" md="12" class="d-flex align-center">
              <VRadioGroup
                v-model="formUpload.filesAppeal"
                :error-messages="v$.filesAppeal.$errors[0]?.$message" 
                inline
              >
                <VRadio
                  label="SI presenta recurso"
                  :value="1"
                />
                <VRadio
                  label="NO presenta recurso"
                  :value="0"
                />
              </VRadioGroup>
            </VCol>
            <VCol cols="12" md="12" class="d-flex align-center">
              <VTextarea 
                v-model="formUpload.magistrateOffice"
                :error-messages="v$.magistrateOffice.$errors[0]?.$message" 
                :label="t('logo_symbol.generate_approval.formApprove.magistrateOffice')"
                counter
              />
            </VCol>
          </VCol>
        </VRow>
        <VRow class="d-flex justify-center ma-5 gap-4">
          <VBtn type="submit" class="notAllowedEmulator" :loading="loading" :disabled="disabled" color="primary">
            {{ t('logo_symbol.generate_approval.formApprove.btn_approve') }}
          </VBtn> 
          <VBtn v-if="!loading" color="secondary" @click="handlerOpenRejectLogoSymbol">
            {{ t('logo_symbol.generate_approval.formApprove.btn_reject') }}
          </VBtn>
        </VRow>
      </VForm>
    </VCard>
    <VDialog
      v-model="formRejectIsVisible"
      width="700"
      persistent
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="formRejectIsVisible = !formRejectIsVisible" />

      <!-- Dialog Content -->
      <VCard>
        <VCardText class="text-center">
          <h3 class="d-flex justify-center">
            Observaciones para rechazar logo o símbolo y nombre de la agrupación política
          </h3>
          <p class="d-flex justify-center">
            A continuación ingrese una breve observación de la acción a realizar
          </p>
          <VForm ref="refForm" @submit.prevent="handlerRejectLogoSymbol">
            <VRow>
              <VCol cols="23" md="12">
                <VTextarea v-model.trim="formReject.observation" focused="true" placeholder="Por favor ingrese sus observaciones" counter />
              </VCol>  
            </VRow>
            <VCardText class="d-flex justify-end gap-2">
              <VBtn color="secondary" @click="formRejectIsVisible = false">
                {{ t('common.btn_close') }}
              </VBtn>
              <VBtn :loading="loading" class="notAllowedEmulator" :disabled="disabled" type="submit">
                {{ t('common.btn_submit') }}
              </VBtn>
            </VCardText>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
    <ViewDocuments 
      :dialog-is-visible="isDialogDocumentVisible" 
      :grouping-political-type-id="groupingPoliticalId" 
      :inscription-id="inscriptionId" 
      @close-modal="handlerCloseModalDocuments"
    />
    <ViewCandidates 
      :dialog-is-visible="isDialogCandidatesVisible" 
      :inscription-id="inscriptionId"
      @close-modal="handlerCloseModalCandidates"
    />
  </div>
</template>
