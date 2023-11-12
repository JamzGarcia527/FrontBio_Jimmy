<script setup>
import { useI18n } from "vue-i18n"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import backgroundFilesOK from "@images/pages/upload-file-ok.png"
import backgroundFiles from "@images/pages/upload-files.png"

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})


// Translate i18n
const { t } = useI18n()
const { can } = useAppAbility()
const showView = ref(false)
const inputFile = ref()

const file = ref()
const urlimagen = ref(backgroundFiles)
const errorFile = ref(false)
const error = ref(false)
const successFile = ref(false)
const disabledBttn = ref(true)
const disabledFileInput = ref(false)
const showImagen = ref(false)
const urlPdf = ref()
const activateButtonSave = ref(true)


const inputActive = async ()=>{
  disabledFileInput.value = true
}

const getFile = async function () {
  await inputActive()
  let fileUploadPdf = document.getElementById("fileUploadPdf")
  if (fileUploadPdf != null) {
    fileUploadPdf.click()
  }
}

const validationSize = async value => {
  let bring = false

  if(  value <= 1 * 1024 * 1024 ) {
    bring = true
  }
  
  return bring
}

const validationFile = async value => {
  
  let bring = false
  if(value == 'application/pdf'){
    bring = true
  }
  
  return bring
}

const validatedPDF = async function (events) {

  file.value = events.target.files[0]

  const fileInterno = events.target.files[0]
  const sizeByte = events.target.files[0].size
  const type = events.target.files[0].type

  urlPdf.value =URL.createObjectURL(fileInterno)

  const resultSizeValidation = await validationSize(sizeByte)
  const resultTypeValidation = await validationFile(type)

  if(resultTypeValidation && resultSizeValidation){
    showImagen.value = resultTypeValidation
    activateButtonSave.value = false
    error.value = false
  
  }else{
    showImagen.value= false
    activateButtonSave.value = true
    urlimagen.value = backgroundFiles
    console.log("urlimagen.value", urlimagen.value)
    error.value = true
  }


}

watch(inputFile, () => {
  if(inputFile.value === "" || inputFile.value === null || inputFile.value.length === 0)
    cancelFile()
})

const saveFile = async function (e) {
  
  const formData = new FormData()
  
  formData.append('docFile', file.value)

  let id = props.id
  
  try {
    const response = await axios.post(`/v1/omd/updated/pdf/vote/preferential?id=48`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(() => {
      Swal.fire({ icon: "success", text: "Archivo cargado éxitosamente." })
      cancelFile()

      return { success: true, data: response.data }
    })    
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
      
      return { success: false }
    }
  }
}


const cancelFile = () => {

  error.value = false  
  inputFile.value = ''
  disabledBttn.value = true
  disabledFileInput.value = false
  showImagen.value = false
  activateButtonSave.value = true
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
    <VCard :title="t('OMD.vote_option.chargeFileSupport')">
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
                  id {{ props.id }}
                  <VFileInput
                    id="fileUploadPdf"
                    v-model="inputFile"
                    variant="underlined"
                    accept=".pdf"
                    hide-input
                    prepend-icon=""
                    @change="validatedPDF"
                  />
                </VCol> 
                <VCol cols="12" md="12">
                  <h6 class="text-caption msn">
                    {{ t("OMD.upload_options.messageMaxSize") }}
                  </h6>
                  <h6 class="text-caption msn">
                    {{ t("OMD.upload_options.type_file") }}
                  </h6>
                </VCol>
                <div>
                  <h4 v-if="error" class="text-error text-caption">
                    <VIcon class="me-1" icon="mdi-alert" size="22" />
                    {{ t("dialog_candidates.warning_documento") }}
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
                    <VImg v-if="!showImagen" :src="urlimagen" class="pa-12" />
                    <embed v-else :src="urlPdf" class="pa-12" type="application/pdf" style="width: 100%; height: 100%;">
                  </VCard>
                </div>
              </VCol>
            </VRow>
          </VCard>
        </VCol>
        <VCol cols="12" md="10" style="margin-top: -2%;">
          <VRow justify="end" class="pa-6 gap-3">
            <VBtn
              :disabled="activateButtonSave"
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