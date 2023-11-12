<script setup>
import backgroundDialog from "@images/pages/header-modal-candidats.png"
import backgroundPhoto from "@images/pages/upload-image.png"
import { useI18n } from "vue-i18n"
import { number } from "@intlify/core-base"
import axios from "@/plugins/axios"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useUserConfigStore } from '@/stores/userconfig'

const props = defineProps({
  idCandidate: { type: number, default: () => 0 },
  inscriptionIdCandidate: { type: number, default: () => 0 },
  path: { type: String, default: () => null },
  status: { type: number, default: () => 0 },
})

const emit = defineEmits(["update:model-value", 'closed', 'closed2'])

const { can } = useAppAbility()
const { t } = useI18n()
const userConfig = useUserConfigStore()

const image = ref()
const urlDialogCandidate = ref(backgroundPhoto)
const file = ref()
const activateButtonSave = ref(true)
const errorPhoto = ref(false)
const errorMessage = ref(null)
const disabledAdd = ref(true)
const disabledDelete = ref(true)

const savePhotoCandidate = async function () {
  emit("closed", file.value, props.idCandidate, props.inscriptionIdCandidate)
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

  if (sizeKB < 30 || sizeKB > 60) {
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
  } else{
    activateButtonSave.value = false
    errorPhoto.value = false
  }
}

const DeletePhotoCandidate = async function () {
  emit("closed2", true)
}

onMounted(async () => {
  if(can('post', 'file-candidate')){
    disabledAdd.value = false
  }

  if(can('delete', 'file-candidate')){
    disabledDelete.value = false
  }
})
</script>

<template>
  <VListItem>
    <template #prepend>
      <VBtn
        :disabled="props.path != null || disabledAdd"
        variant="tonal"
        color="secondary"
        :rounded="0"
      >
        <VDialog v-model="dialog" persistent activator="parent" max-width="620">
          <VCard
            style="border-radius: 1px;
              border-end-end-radius: 8px !important;
              border-end-start-radius: 8px !important;"
          >
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
                <VFlex class="flex-grow-1 flex-shrink-6">
                  <div class="px-5">
                    <h6 class="text-caption">
                      {{ t("dialog_candidates.minsize_photo") }}
                    </h6>
                    <h6 class="text-caption">
                      {{ t("dialog_candidates.maximum_photo_size") }}
                    </h6>
                    <h6 class="text-caption">
                      {{ t("dialog_candidates.photo_resolution") }}
                    </h6>
                    <h6 class="text-caption">
                      {{ t("dialog_candidates.photo_formats") }}
                    </h6>
                  </div>
                  <div class="px-4 py-6">
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
                  <div class="px-5">
                    <h6 class="text-caption">
                      {{ t("dialog_candidates.photo_dimesions") }}
                    </h6>
                    <h6 class="text-caption">
                      {{ t("dialog_candidates.photo_color") }}
                    </h6>
                  </div>
                </VFlex>
                <VFlex class="v-col-6">
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
                </VFlex>
              </VCard>
            </div>
            <VCardText class="d-flex justify-end gap-5 px-12" style="margin-top: -3%;">
              <VBtn rounded="pill" variant="outlined" flat @click="dialog = false">
                {{ t("dialog_candidates.exit") }}
              </VBtn>
              <VBtn
                class="bg-primary"
                rounded="pill"
                :disabled="activateButtonSave"
                @click="savePhotoCandidate(), (dialog = false)"
              >
                {{ t("dialog_candidates.save_photo") }}
              </VBtn>
            </VCardText>
          </VCard>
        </VDialog>
        {{ t("dialog_candidates.upload_photo") }}
        <VIcon class="me-2" end icon="mdi-image-plus-outline" size="22" />
      </VBtn>
    </template>
  </VListItem>
  <VListItem>
    <VBtn
      :disabled="props.path == null || disabledDelete"
      variant="tonal"
      color="error"
      :rounded="0"
      @click="DeletePhotoCandidate"
    >
      {{ t("dialog_candidates.delete_photo") }}
      <VIcon class="me-2" end icon="mdi-image-remove-outline" size="22" />
    </VBtn>
  </VListItem>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
    }
  },
}
</script>

<style lang="scss">
@use "src/styles/styles.scss";
</style>
