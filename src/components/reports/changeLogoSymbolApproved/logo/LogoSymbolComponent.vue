<script setup>
import backgroundPhoto from "@images/pages/upload-image.png"
import axios from "@/plugins/axios"
import { useI18n } from 'vue-i18n'
import Swal from "@/plugins/sweetalert2"
import { isEmptyArray, isNullOrUndefined } from '@core/utils/index'
import { useUserConfigStore } from '@/stores/userconfig'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useDownloadFiles } from '@/composables/useDownloadFiles'
import useEventsBus from '@/utils/eventBus'
import { useInscription } from "@/stores/inscription"
import { watch } from 'vue'



const props = defineProps({
  groupingPoliticalType: { type: Number, required: true },
  groupingPoliticalId: { type: Number, required: true },
})

const inscriptionStore = useInscription()

const isUninominal = computed(() => inscriptionStore.isUninominal)


// 👉 Required Validator
const requiredValidator = value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return t('opening_preinscription.field_required')
  
  return !!String(value).trim().length || t('opening_preinscription.field_required')
}

const { can } = useAppAbility()
const { t } = useI18n()
const { emit } = useEventsBus()
const inscription = useInscription()

const userConfig = useUserConfigStore()
const refForm = ref()
const inputFile = ref()
const existLogo = ref(false)
const file = ref()
const activateButtonSave = ref(true)
const errorPhoto = ref(false)
const urlLogo = ref(backgroundPhoto)
const urlLogoPdf = ref('')
const showImagen = ref(true)
const sizeFile = ref()
const fileWidth = ref()
const fileHeight = ref()


const getFile = function () {
  let fileUpload = document.getElementById("fileUpload")
  if (fileUpload != null) {
    fileUpload.click()
  }
}

const validationSize = async value => {
  let bring = true

  const sizeMB = (value / 1024 ** 2).toFixed(3)

  sizeFile.value = sizeMB
  if (sizeMB > 1) {
    bring = false
  }
  
  return bring
}

const validationType = async value => {
  let bring = false

  switch (value){
  case 'application/pdf':bring = true
    break
  case 'image/jpeg':bring = true
    break
  case 'image/jpg':bring = true
    break
  default: bring = false
  }
  
  return bring
}

const validationDpi = async value => {
  let bring = true
  let img = new Image()

  img.src = value

  img.onload = () => {
    
    fileHeight.value = Math.round(img.height / 300 / 0.393701)

    fileWidth.value = Math.round(img.width / 300 / 0.393701)

    if(isUninominal.value === true){
      let heigthMaxSize = 1.4
      let widthMaxSize = 4.5
      if(fileHeight.value > heigthMaxSize || fileWidth.value > widthMaxSize){
        Swal.fire("La imagen del logo o símbolo no cumple con las dimensiones recomendadas.").then(()=>{
          cancelLogo()
        })
      }
    }
    else if(isUninominal.value === false){
      let heigthMaxSize = 2.0
      let widthMaxSize = 2.6
      if(fileHeight.value > heigthMaxSize || fileWidth.value > widthMaxSize){
        Swal.fire("La imagen del logo o símbolo no cumple con las dimensiones recomendadas.").then(()=>{
          cancelLogo()
        })
      }
    }

    if (img.width  != 300 || img.height != 300) {
      bring = false
    }

  }

  return bring
}

const previewLogo = async function (e) {
  let resultDpiValidation = true
  file.value = e.target.files[0]

  urlLogoPdf.value =URL.createObjectURL(file.value)

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

  if(type != "application/pdf"){
    showImagen.value = true
    resultDpiValidation = await validationDpi(data)
  }else{
    showImagen.value = false
  }
  urlLogo.value = data

  if (!resultSizeValidation || !resultTypeValidation || !resultDpiValidation) {
    activateButtonSave.value = true
    errorPhoto.value = true
  } else{
    activateButtonSave.value = false
    errorPhoto.value = false
  }
}

const consultLogoup = async function(){  
  const { valid } = await refForm.value.validate()
  if (valid){
    axios.get("/v1/grouping-political-logo/" + props.groupingPoliticalId).then(response => {
      if (response.data.logoup == 1) {
        saveLogo()
      }else{
        msnLogo("No tiene permitido cargar logo o símbolo", "warning")
      }
    },
    )
  }
}

const srcLogo = computed(() => `/v1/files/grouping-political-logo/${props.groupingPoliticalId}`)
const { data: logo, refetch } = useDownloadFiles(srcLogo)

const saveLogo = async function () {
  
  const formData = new FormData()

  formData.append("file", file.value)
  formData.append("id", props.groupingPoliticalId)

  axios.put(
    "/v1/files/grouping-political-logo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  ).then(response => {
    if (response.status == 200) {
      emit('uploadLogo', true)
      refetch()
      cancelLogo()
      inscription.getInscription(inscription.inscriptionId)
      
  
      msnLogo("Se cargo con éxito", "success")
    }
  },
  ).catch(error => {
      
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  })
}

const msnLogo = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage).then(()=>{
    location.reload()
  })
}

const cancelLogo = () => {
  showImagen.value = true
  urlLogo.value = backgroundPhoto
  activateButtonSave.value = true
  document.getElementById("fileUpload").value = ""
  file.value = null
  inputFile.value = ''
  sizeFile.value = ''
  fileHeight.value = ''
  fileWidth.value = ''
}

onMounted(async () => {
  await axios.get("/v1/files/grouping-political-logo/" + props.groupingPoliticalId).then(response => {
    if (response.status == 200) {
      existLogo.value = true
    }
  })
})

watch(inputFile, () => {
  if(inputFile.value === "" || inputFile.value === null || inputFile.value.length === 0)
    cancelLogo()
})
</script>

<template>
  <VForm
    ref="refForm"
    @submit.prevent="() => {}"
  >
    <div class="logo">
      <VCard>
        <VRow no-gutters>
          <VCol cols="12" class="d-flex align-center justify-center pa-6">
            <div class="position-relative">
              <TextSubtitle1 v-if="inscription.logoStatus === 1">
                {{ t("upload_logo.message_exist_logo") }}
              </TextSubtitle1>

              <VRow v-if="logo" justify="center">
                <VCol cols="12" :sm="inscription.logoStatus === 1 ? 6 : 3" class="text-center">
                  <span><b>Logo o Símbolo Actual</b></span>
                  <VCard
                    variant="outlined"
                    class="d-flex rounded"
                    style="block-size: 200px;"
                    color="primary"
                  >
                    <VImg fluid :src="logo" />
                  </VCard>
                </VCol>
              </VRow>
               
              <div v-if="inscription.logoStatus !== 1" class="px-12 py-4">
                <VCard variant="outlined" class="card-rounded" color="primary">
                  <VRow>
                    <VCol class="v-col-sm-8 v-col-md-12 v-col-lg-7 order-lg-1 v-col-12 order-2 py-12">
                      <div class="px-7 py-2">
                        <VBtn @click="getFile">
                          {{ t("upload_logo.select_button") }}
                          <VIcon class="me-1" end icon="mdi-tray-arrow-up" size="22" />
                        </VBtn>
                      </div>  
                      <div class="v-col-sm-5 px-7 py-1">
                        <VFileInput
                          id="fileUpload"
                          v-model="inputFile"
                          variant="underlined"
                          accept=".jpg, .pdf"
                          hide-input
                          prepend-icon=""
                          @change="previewLogo"
                        />
                      </div>
                      <div class="pa-3 py-4">
                        <h6 class="text-caption msn">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.maximum_logo") }}
                        </h6>
                        <h6 class="text-caption msn">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.type_file_logo") }}
                        </h6>
                        <h6 class="text-caption msn">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.logo_resolution") }}
                        </h6>
                        <div v-if="isUninominal">
                          <h6 class="text-caption msn">
                            <VIcon icon="mdi-circle-medium" size="small" />
                            {{ t("upload_logo.dimension_logo_position") }}
                            <br>
                            <div class="ml-5">
                              {{ t("upload_logo.dimension_logo_position_final") }}
                            </div>
                          </h6>
                        </div>                        
                        <div v-else>
                          <h6 class="text-caption msn">
                            <VIcon icon="mdi-circle-medium" size="small" />
                            {{ t("upload_logo.dimension_logo_corporations") }} 
                            <br>
                            <div class="ml-5">
                              {{ t("upload_logo.dimension_logo_corporations_final") }}
                            </div>
                          </h6>
                        </div>
                      </div>
                    </VCol>
                    <VCol class="v-col-sm-4 v-col-md-12 v-col-lg-5 order-lg-2 v-col-12 order-1">
                      <div class="pa-6">
                        <VCard
                          variant="outlined"
                          class="d-flex rounded"
                          style="block-size: 200px;"
                          color="primary"
                        >
                          <VImg v-if="showImagen" :src="urlLogo" class="pa-12" />      
                          <embed v-else :src="urlLogo" class="pa-12" type="application/pdf" style="width: 100%; height: 100%;">
                        </VCard>
                      </div>
                      <h4 v-if="errorPhoto" class="text-error text-caption">
                        <VIcon class="me-1" icon="mdi-alert" size="22" />
                        {{ t("upload_logo.warning_validation") }}
                      </h4>
                      <VCol v-if="showImagen" cols="12" class="pa-2">
                        <div>Tamaño de Archivo {{ sizeFile }} MB</div>
                        <div> Alto: {{ fileHeight ? fileHeight : 0 }} CM </div>
                        <div> Ancho: {{ fileWidth ? fileWidth : 0 }} CM </div>
                      </VCol>
                      <VCol v-else cols="12" class="pa-2">
                        <div>Tamaño de Archivo {{ sizeFile }} MB</div>
                      </VCol>
                    </VCol>
                  </VRow>  
                </VCard>
                <div>
                  <VRow>
                    <VCol class="v-col-sm-8 v-col-md-12 v-col-lg-7 order-lg-2 v-col-12 order-1 py-11">
                      <div class="pa-1">
                        <h6 class="text-caption">
                          {{ t("upload_logo.recommendations") }}
                        </h6>
                        <h6 class="text-caption">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.first_recommendation") }}
                        </h6>
                        <h6 class="text-caption">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.second_recommendation") }}
                        </h6>
                        <h6 class="text-caption">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.third_recommendation") }}
                        </h6>
                        <h6 class="text-caption">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.fourth_recommendation") }}
                        </h6>
                        <h6 class="text-caption">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.fifth_recommendation") }}
                        </h6>
                        <h6 class="text-caption">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.sixth_recommendation") }}
                        </h6>
                        <h6 class="text-caption">
                          <VIcon icon="mdi-space" size="small" />
                          {{ t("upload_logo.sixth_two_recommendation") }}
                        </h6>
                        <h6 class="text-caption">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.seventh_recommendation") }}
                        </h6>
                      </div>
                    </VCol>
                    <VCol class="v-col-sm-4 v-col-md-12 v-col-lg-5 order-lg-2 v-col-12 order-1">
                      <VRow justify-content="center" class="pa-12 gap-3 btns">
                        <VBtn
                          class="bg-primary notAllowedEmulator"
                          :disabled="activateButtonSave"
                          rounded="pill"
                          type="submit"               
                          @click="consultLogoup"
                        >
                          {{ t("upload_logo.save_logo") }}
                        </VBtn>
                        <VBtn type="button" rounded="pill" variant="outlined" flat @click="inputFile = null">
                          {{ t("upload_logo.exit_logo") }}
                        </VBtn>
                      </VRow>
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="12" style="margin-top: -5%;">
                      <h6 class="text-caption msnr">
                        {{ t("upload_logo.eighth_recommendation") }}
                      </h6>
                      <h6 class="text-caption msnr">
                        {{ t("upload_logo.ninth_recommendation") }}
                      </h6>
                    </VCol>
                  </VRow>
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VCard>
    </div>
  </VForm>
</template>

<style lang="scss" scoped>
.logo {
  .card-rounded {
    border-width: 0.125rem;
    border-style: solid;
  }

  .msn {
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: 600;
  }

  .msnr {
    font-weight: 500;
  }

  .btns {
    margin-block-start: 33%;
  }
}
</style>

