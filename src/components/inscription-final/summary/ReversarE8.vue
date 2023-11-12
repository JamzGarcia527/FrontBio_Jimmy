<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import backgroundFiles from "@images/pages/upload-files.png"
import imageLogo from '@images/pages/fondoContrasena.png'
import { useInscription } from '@/stores/inscription'
import { downloadBlob } from '@/utils'
import { useI18n } from 'vue-i18n'
import { useVuelidate } from "@vuelidate/core"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import {  helpers } from "@vuelidate/validators"
import useEventBus from "@/utils/eventBus"
import { useRouter } from "vue-router"
import {
  requiredVuelidate,
  integerVuelidate,
} from "@/utils/validators/vuelidate"

const props = defineProps({
  inscriptionId: { type: Number, required: true },
})

const router = useRouter()
const { can } = useAppAbility()

const formDataDes = ref({
  description:'',
})

const activateButtonSave = ref(true)
const { t } = useI18n()
const inscriptionStore = useInscription()
const radicate = computed(() => inscriptionStore.radicate)
const isDialogVisible = ref(false)
const isLoading = ref(false)
const urlimagen = ref(backgroundFiles)
const showImagen = ref(false)
const urlPdf = ref()
const error = ref(false)
const file = ref(false)
const inputFile = ref()

const getFile = function () {
  let fileUpload = document.getElementById("fileUpload")
  if (fileUpload != null) {
    fileUpload.click()
  }
}

const rules = computed(() =>({
  description: {
    requiredVuelidate,
    length: helpers.withMessage(
      "El Campo observación tiene un máximo de 1000 caracteres",
      value => !value || String(value).length < 999,
    ),
  },

}))

const validationType = async value => {
  let bring = false

  if(value == "application/pdf"){
    bring = true
  }

  
  return bring
}

const validationSize = async value => {
  let bring = false

  if(  value <= 1 * 1024 * 1024 ) {
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
  const resultTypeValidation = await validationType(type)



  if(resultTypeValidation && resultSizeValidation){
    showImagen.value = resultTypeValidation
    activateButtonSave.value = false
  
  }else{
    activateButtonSave.value = true
    urlimagen.value = backgroundFiles
    error.value = true
  }

}

const v$ = useVuelidate(rules, formDataDes)

const openModal =  () =>  {
  isDialogVisible.value = true
}


const handlerSubmit = async () =>{


  v$.value.$touch()
  if (v$.value.$invalid) return

  const formData = new FormData()

  const{
    description,
  }=formDataDes.value

  formData.append("file", file.value)
  formData.append("observation", description)

  try {
 
    const { data } = await axios.post(`/v1/inscription-final/reverse-inscription/${props.inscriptionId}`, formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
 
    
    await Swal.fire({ text: "Se ha reversado correctamente el formulario E8", icon: "success" })
    router.push({ name: "inscription-final-list" })
    canceldata()
    inscriptioId.value = false

    //  emiting('updateReverse', true)

  } catch (error) {

    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
  
  }

}

watch(inputFile, () => {
  if(inputFile.value === "" || inputFile.value === null || inputFile.value.length === 0)
    canceldata()
})

const canceldata = () => {
  error.value = false
  v$.value.$reset()
  showImagen.value = false
  activateButtonSave.value = true
  inputFile.value = ''
  formDataDes.value = {}
}

const cancelModal = () => {
  isDialogVisible.value = false
  canceldata()
}
</script>

<template>
  <VCard v-if="can('reverse', 'inscription-final')" class="rounded-lg" variant="outlined" @click="openModal">
    <div class="d-flex justify-center align-center text-primary pa-2">
      <template v-if="isLoading">
        <VProgressCircular size="48" indeterminate />
      </template>
      <template v-else>
        <VIcon icon="tabler-refresh" size="48" class="me-3" />
        <div class="w-50 line-height font-weight-bold">
          {{ t('tabSummary.reverse_e8.title') }}
        </div>
      </template>
    </div>
  </VCard>
  <VDialog
    v-model="isDialogVisible" persistent width="1000"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="cancelModal" />

    <!-- Dialog Content -->
    <VCard class="text-wrap">
      <VImg
        :src="imageLogo"
        cover
      />
      <VCardText>
        <VRow>
          <VCol cols="12" class="d-flex align-center justify-center pa-6">
            <VForm @submit.prevent="handlerSubmit">
              <div class="px-12 py-4">
                <VCard variant="outlined" class="card-rounded" color="primary">
                  <VRow>
                    <VCol class="v-col-sm-8 v-col-md-12 v-col-lg-7 order-lg-1 v-col-12 order-2 py-12">
                      <div class="px-7 py-2">
                        <VBtn :disabled="disabledPreviewLogo" @click="getFile">
                          {{ t("upload_logo.select_button") }}
                          <VIcon class="me-1" end icon="mdi-tray-arrow-up" size="22" />
                        </VBtn>
                      </div>  
                      <div class="v-col-sm-5 px-7 py-1">
                        <VFileInput
                          id="fileUpload"
                          v-model="inputFile"
                          variant="underlined"
                          density="default"
                          accept=".pdf"
                          prepend-icon=""
                          @change="validatedPDF"
                        />
                      </div>
                      <div class="pa-3 py-4">
                        <h6 class="text-caption msn">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.maximum_logo") }}
                        </h6>
                        <h6 class="text-caption msn">
                          <VIcon icon="mdi-circle-medium" size="small" />
                          {{ t("upload_logo.type_file") }}
                        </h6>
                      </div>
                    </VCol>
                    <VCol class="v-col-sm-4 v-col-md-12 v-col-lg-5  v-col-12 order-1">
                      <div class="pa-6">
                        <VCard
                          variant="outlined"
                          class="d-flex rounded"
                          style="block-size: 200px;"
                          color="primary"
                        >
                          <VImg v-if="!showImagen" :src="urlimagen" class="pa-12" />
                          <embed v-else :src="urlPdf" class="pa-12" type="application/pdf" style="width: 100%; height: 100%;">
                        </VCard>
                      </div>
                      <h4 v-if="error" class="text-error text-caption">
                        <VIcon class="me-1" icon="mdi-alert" size="22" />
                        {{ t("dialog_candidates.warning_documento") }}
                      </h4>
                    </VCol>
                    <VCol cols="12  order-1">
                      <div class="ps-5 mr-5">
                        <VTextarea
                          v-if="!activateButtonSave"
                          v-model.trim="formDataDes.description" 
                          :error-messages="v$.description.$errors[0]?.$message"
                          prepend-inner-icon="tabler-message-2" 
                          :label="t('upload_logo.observacion')"
                        />
                      </div>
                    </VCol>
                  </VRow>
                  <VCardText class="d-flex justify-end flex-wrap gap-3">
                    <VBtn
                      variant="tonal"
                          
                      @click="cancelModal"
                    >
                      {{ t('auth.cancel') }}
                    </VBtn>
                    <VBtn 
                      type="submit" 
                      :loading="isLoading"
                      :disabled="activateButtonSave"
                    >
                      Reversar Formulario E8 
                    </vbtn>
                  </VCardText>
                </VCard>
              </div>
            </VForm>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>
