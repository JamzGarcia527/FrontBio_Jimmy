<script setup>
import backgroundDialog from "@images/pages/header-modal-candidats.png"
import backgroundPhoto from "@images/pages/upload-image.png"
import { useI18n } from "vue-i18n"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { onMounted } from 'vue'
import { getParameter } from '@/utils/parameter'

const props = defineProps({
  inscriptionId: { type: Number, default: () => 0 },
  candidateDni: { type: Number, default: () => 0 },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['uploaded'])
const { t } = useI18n()

const image = ref()
const urlDialogCandidate = ref(backgroundPhoto)
const file = ref(null)
const activateButtonSave = ref(false)
const errorPhoto = ref(false)
const dialog = ref(false)
const checkRequired = ref(false)

const photoDpiParamete = ref(null)
const photoMinParamete = ref(null)
const photoMaxParamete = ref(null)

const savePhotoCandidate = async () => {
  if (!file.value) {
    Swal.fire({ icon: "warning", text: "No ha seleccionado imagen." })
    
    return
  }

  try {
    const formData = new FormData()

    formData.append("file", file.value)

    await axios.post("/v1/files/candidates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: {
        inscriptionId: props.inscriptionId,
        dni: props.candidateDni,
      },
    })

    dialog.value = false
    emit('uploaded', true)

    
  } catch (error) {
    activateButtonSave.value = false
    let message = 'No se pudo completar acción, por favor intente más tarde.'
    if (error.response && error.response.status < 500) 
      message = error.response.data.message
    Swal.fire({ icon: "warning", text: message })
  }
} 

const getFile = function () {
  let fileUpload = document.getElementById("fileUploadDialog")
  if (fileUpload != null) {
    fileUpload.click()
  }
}

const validationSize = async value => {
  let devolver = true
  const sizeKB = (value / 1024).toFixed(3)

  const photoMax = parseInt(photoMaxParamete.value) 
  const photoMin = parseInt(photoMinParamete.value) 


  if (sizeKB < photoMin || sizeKB > photoMax) {
    devolver = false
  }

  return devolver
}

const validationType = async value => {
  let devolver = false

  switch(value){
  case "image/jpeg":
    devolver = true
    break
  case "image/jpg":
    devolver = true
    break
  default: devolver
  }

  return devolver
}

const Preview_image = async function (e) {
  errorPhoto.value = false
  file.value = e.target.files[0]

  const fileInterno = e.target.files[0]
  const sizeByte = e.target.files[0].size
  const type = e.target.files[0].type
  const resultSizeValidation = await validationSize(sizeByte)
  const resultTypeValidation = await validationType(type)

  const readData = f =>
    new Promise(resolve => {
      const reader = new FileReader()

      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(f)
    })

  const data = await readData(fileInterno)


  urlDialogCandidate.value = data

  if (!resultSizeValidation || !resultTypeValidation) {
    activateButtonSave.value = true
    errorPhoto.value = true
  } else {
    activateButtonSave.value = false
    errorPhoto.value = false
  }
}

onMounted(async () => {
  getParameter('PHOTODPI').then(value => photoDpiParamete.value = value)
  getParameter('PHOTOMIN').then(value => photoMinParamete.value = value)
  getParameter('PHOTOMAX').then(value => photoMaxParamete.value = value)
})
</script>

<template>
  <VDialog v-model="dialog" persistent max-width="620">
    <template #activator="{ props: dialogProps }">
      <VBtn
        v-bind="dialogProps"
        variant="tonal"
        color="secondary"
        :rounded="0"
        :disabled="disabled"
      >
        {{ t("dialog_candidates.upload_photo") }}
        <VIcon class="me-2" end icon="mdi-image-plus-outline" size="22" />
      </VBtn>
    </template>
    <VCard>
      <div>
        <VImg :src="backgroundDialog" />
      </div>
      <VCardTitle class="text-center">
        <h6 class="font-weight-medium py-2" style="margin-block-end: -2%;">
          {{ t("dialog_candidates.upload_photograph") }}
        </h6>
        <h5>
          {{ t("dialog_candidates.candidates_description") }}
        </h5>
      </VCardTitle>
      <div class="px-9 py-4">
        <VCard variant="outlined" class="d-flex px-1 py-4 rounded">
          <div class="flex-grow-1 flex-shrink-6">
            <h4 class="ms-5">
              REQUISITOS:
            </h4>
            <ul class="px-5 ms-5" style="list-style: inherit;">
              <li class="text-caption">
                {{ t("dialog_candidates.minsize_photo") }} {{ photoMinParamete }} Kb
              </li>
              <li class="text-caption">
                {{ t("dialog_candidates.maximum_photo_size") }} {{ photoMaxParamete }} Kb
              </li>
              <li class="text-caption">
                {{ t("dialog_candidates.photo_resolution", { limit_dpi: photoDpiParamete ?? 300 }) }}
              </li>
              <li class="text-caption">
                {{ t("dialog_candidates.photo_formats") }}
              </li>
              <li class="text-caption">
                {{ t("dialog_candidates.photo_dimesions") }}
              </li>
              <li class="text-caption">
                {{ t("dialog_candidates.photo_color") }}
              </li>
            </ul>
            <div class="px-5 mt-5 text-wrap">
              <VRow>
                <VCol cols="2" class="pe-0">
                  <VCheckbox 
                    v-model="checkRequired" 
                    class="check-size-lg"
                    style="color: rgba(51, 48, 60, 87%);" 
                  />
                </VCol>
                <VCol cols="8" class="text-body-2 font-weight-semibold ps-2" style="color: rgba(51, 48, 60, 87%);">
                  Confirmo que he leído los requisitos
                </VCol>
              </VRow>
            </div>
            <div v-if="checkRequired" class="px-4 py-3">
              <div>
                <VBtn @click="getFile">
                  {{ t("dialog_candidates.select") }}
                  <VIcon class="me-1" end icon="mdi-tray-arrow-up" size="22" />
                </VBtn>
              </div>
              <div class="v-col-sm-10 py-1">
                <VFileInput
                  id="fileUploadDialog"
                  v-model="image"
                  variant="underlined"
                  accept=".jpg"
                  hide-input
                  prepend-icon=""
                  @change="Preview_image"
                />
              </div>
            </div>
          </div>
          <div v-if="checkRequired" class="v-col-6">
            <div>
              <VCard
                variant="outlined"
                class="d-flex rounded"
                style="block-size: 280px;"
              >
                <VImg :src="urlDialogCandidate" class="pa-12" />
              </VCard>
            </div>
            <div class="py-1">
              <h6 v-if="errorPhoto" class="text-error text-caption">
                <VIcon class="me-1" icon="mdi-alert" size="22" />
                {{ t("dialog_candidates.warning_validation") }}
              </h6>
            </div>
          </div>
          <div v-else class="v-col-6" />
        </VCard>
      </div>
      <VCardText class="d-flex justify-end gap-5 px-12" style="margin-top: -3%;">
        <VBtn rounded="pill" variant="outlined" flat @click="dialog = false">
          {{ t("dialog_candidates.exit") }}
        </VBtn>
        <VBtn
          v-if="checkRequired"
          class="bg-primary notAllowedEmulator"
          rounded="pill"
          :disabled="activateButtonSave"
          @click="savePhotoCandidate"
        >
          {{ t("dialog_candidates.save_photo") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
@use "src/styles/styles.scss";

.check-size-lg.v-checkbox-btn .v-selection-control__input .v-icon.iconify--custom {
  block-size: 1.725rem !important;
  font-size: 1.725rem !important;
  inline-size: 1.725rem !important;
}
</style>
