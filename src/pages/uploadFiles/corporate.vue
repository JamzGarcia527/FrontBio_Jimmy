<script setup>
import { useI18n } from "vue-i18n"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import backgroundFiles from "@images/pages/upload-files.png"
import backgroundFilesOK from "@images/pages/upload-file-ok.png"

// Translate i18n
const { t } = useI18n()
const { can } = useAppAbility()
const showView = ref(false)
const inputFile = ref()

const file = ref()
const urlFile = ref(backgroundFiles)
const errorFile = ref(false)
const successFile = ref(false)
const disabledBttn = ref(true)
const disabledFileInput = ref(false)


const inputActive = async ()=>{
  disabledFileInput.value = true
}

const getFile = async function () {
  await inputActive()
  let fileUploadTxt = document.getElementById("fileUploadTxt")
  if (fileUploadTxt != null) {
    fileUploadTxt.click()
  }
}

const validationFile = async value => {
  let bring = true
  if(value == 'text/plain'){
    bring = false
  }
  
  return bring
}

const previewFile = async function (e) {
  
  file.value = e.target.files[0]

  const type = e.target.files[0].type

  const responseTypeFile = await validationFile(type)

  if(responseTypeFile){
    successFile.value = false
    errorFile.value = true
    disabledBttn.value = true
    urlFile.value = backgroundFiles
  }else{
    successFile.value = true
    errorFile.value = false
    disabledBttn.value = false
    urlFile.value = backgroundFilesOK
  }
  
}

const saveFile = async function (e) {
  const formData = new FormData()

  formData.append("file", file.value)
  
  axios.post("/v1/files/corporation",  
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  ).then(response => {
    if (response.status == 200) {
      msnFile(response.data.message, "success")
    }else if(response.status == 400){
      msnFile(response.data.message, "error")
    }
    cancelFile()
  },
  ).catch(function (error) {
    msnFile(error.response.data.message, "warning")
    cancelFile()
  })
}

const cancelFile = () => {

  urlFile.value = backgroundFiles
  errorFile.value = false
  successFile.value = false
  inputFile.value = ''
  disabledBttn.value = true
  disabledFileInput.value = false
}

const msnFile = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}

onMounted(() => {
  if(can('post', 'file-corporation')){
    showView.value = true
  }else{
    showView.value = false
    msnFile(t('corporate_loading.warning_opening'), "warning")
  }
})
</script>

<template>
  <div v-if="showView" class="layout-default">
    <VBreadcrumbs :items="[ t('corporate_loading.breadcrumbs.title'), t('corporate_loading.breadcrumbs.item_one') ]" />
    <VCard :title="t('corporate_loading.breadcrumbs.item_one')">
      <VCardTitle>
        <hr>
      </VCardTitle>
      <VRow no-gutters>
        <VCol cols="12" class="d-flex align-center justify-center py-9">
          <VCard variant="outlined" class="card-rounded" color="primary" width="680">
            <VRow>
              <VCol cols="12" md="6" class="px-12 py-12" style="margin-top: 5%;">
                <VBtn :disabled="disabledPreviewLogo" @click="getFile">
                  {{ t("corporate_loading.select_button") }}
                  <VIcon class="me-1" end icon="mdi-tray-arrow-up" size="22" />
                </VBtn>                               
                <VCol cols="12" md="10" class="px-1 py-1">
                  <VFileInput
                    v-if="disabledFileInput"
                    id="fileUploadTxt"
                    v-model="inputFile"
                    variant="underlined"
                    accept=".txt"
                    hide-input
                    prepend-icon=""
                    @change="previewFile"
                  />
                </VCol> 
                <VCol cols="12" md="12">
                  <h6 class="text-caption msn">
                    {{ t("corporate_loading.type_file") }}
                  </h6>
                </VCol>
                <div>
                  <h4 v-if="successFile" class="text-success text-caption">
                    <VIcon class="me-1" icon="mdi-alert" size="22" />
                    {{ t("corporate_loading.file_ok") }}
                  </h4>
                  <h4 v-if="errorFile" class="text-error text-caption">
                    <VIcon class="me-1" icon="mdi-alert" size="22" />
                    {{ t("corporate_loading.file_error") }}
                  </h4>
                </div>
              </VCol>
              <VCol class="v-col-sm-4 v-col-md-12 v-col-lg-6 order-lg-2 v-col-12 order-1">
                <div class="pa-6">
                  <VCard
                    variant="outlined"
                    class="rounded"
                    style="block-size: 200px;"
                    color="primary"
                  >
                    <VImg :src="urlFile" class="pa-12" />
                  </VCard>
                </div>
              </VCol>
            </VRow>
          </VCard>
        </VCol>
        <VCol cols="12" md="10" style="margin-top: -2%;">
          <VRow justify="end" class="pa-6 gap-3">
            <VBtn
              :disabled="disabledBttn"
              class="bg-primary"
              rounded="pill"
              type="submit"               
              @click="saveFile"
            >
              {{ t("corporate_loading.save_file") }}
            </VBtn>
            <VBtn rounded="pill" variant="outlined" flat @click="cancelFile">
              {{ t("corporate_loading.exit_file") }}
            </VBtn>
          </VRow>
        </VCol>
      </VRow>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>


<route lang="yaml">
name: "load-corporations"
meta:
  authRequired: true
</route>
