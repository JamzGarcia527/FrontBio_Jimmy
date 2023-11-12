<script setup>
import backgroundFiles from "@images/pages/upload-files.png"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useI18n } from "vue-i18n"
import useEventBus from "@/utils/eventBus"
import { downloadBlob } from '@/utils'
import { requiredEspecialSelectValidator, requiredValidator, maxLengthValidator,emailValidator } from "@/utils/validators"
import AniFinderField from "@/components/shared/AniFinderField.vue"

const props = defineProps({
  params: { type: Object , required: true },
})

const filtersParams =  ref(props.params) 

watch(() => props.params, newValue => {

  filtersParams.value= newValue
  rulerSearch()

  // rulerUserSearchId()

//  causalSearch()
})

const { t } = useI18n()
const { emit: emiting } = useEventBus()
const inputFile = ref()
const activateButtonSave = ref(true)
const urlimagen = ref(backgroundFiles)
const showImagen = ref(false)
const urlPdf = ref()
const error = ref(false)
const file = ref(false)
const itemsData = ref([])
const itemsCausal = ref([])
const form = ref(null)
const disabled = ref(true)  
const inscriptionId = ref('')  
const status = ref('')  
const isLoading = ref(false)  
const valueSelect = ref(-1)  
const birthdate = ref(null)  
const expeditionDate = ref(null)  
const disabledCheck = ref(false)
const disabledAni = ref(true)


const rules = reactive({
  causal: [requiredEspecialSelectValidator],
  reason: [requiredValidator, maxLengthValidator(500)],
  ruler: [requiredEspecialSelectValidator],
  citizenshipIDNumber: [requiredValidator],
  email:[requiredValidator,emailValidator],
})

const formInfo = ref({
  ruler: -1,
  citizenshipIDNumber: null,
  firstName:null,
  middleName:null,
  firstLastName:null,
  secondLastName:null,
  causal:-1,
  reason:null,
  gender:null,
  age:null,
  email:null,
})

const formCheck = ref({ 
  checkToRevoke:0,
})

const getFile = function () {
  let fileUpload = document.getElementById("fileUpload")
  if (fileUpload != null) {
    fileUpload.click()
  }
}

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


const handlerSubmit = async () =>{
  filtersParams.value

  const { valid } = await form.value.validate()
  if (!valid) return false

  await keepOmd()

}


const keepOmd = async () =>{
  filtersParams.value

  isLoading.value = true

  const formData = new FormData()
  
  formData.append("docFile", file.value)
  formData.append("groupId", filtersParams.value.groupingPoliticalId)

  formData.append("candidateDni", formInfo.value.citizenshipIDNumber)
  formData.append("secondName", formInfo.value.middleName)
  formData.append("firstName", formInfo.value.firstName)
  formData.append("firstSurName", formInfo.value.firstLastName)
  formData.append("secondSurName", formInfo.value.secondLastName)
  formData.append("birthday", birthdate.value)
  formData.append("dniExpDate", expeditionDate.value)
  formData.append("gender", formInfo.value.gender)
  formData.append("age", formInfo.value.age)

  formData.append("rowField", formInfo.value.ruler)
  formData.append("removeAll", disabledCheck.value) 
  formData.append("inscriptionsId", inscriptionId.value) 

  formData.append("typeId", 6) 
  formData.append("reasonId", formInfo.value.causal) 
  formData.append("observations", formInfo.value.reason) 
  formData.append("state", 1) 
  formData.append("motiveOmd", 3)
  formData.append("email", formInfo.value.email) 

  if (status.value == 1) {
    Swal.fire({
      html: ` Existe una Tarjeta/Guía aprobada para impresión ¿Está seguro que desea reversar esta tarjeta? `,
      icon: "warning",
      customClass: { confirmButton: "bg-primary" },
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      showLoaderOnConfirm: true,
      showDenyButton: true,
    }).then(async result => {

      if (result.isConfirmed) {

        const response = await axios.post(`/v1/omd/insert/omd/special/`,formData, {
          // params:formData,
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: "blob",
        }).then(({ data }) => {
        //  downloadBlob(data, "Crear OMD Especial (Revocar Candidato)",'application/pdf')
          Swal.fire({ icon: "success", text: "OMD Generada Éxitosamente." })

          canceldata()
        }).catch(async e => {
          let text = 'No es posible realizar operación, por favor intenta más tarde.'
          if (e.response) {
            const { data } = e.response
            const response = data instanceof Blob ? JSON.parse(await data.text()) : data

            text = response.message
          }
          Swal.fire({ icon: 'warning', text: text })

        }).finally(() => {
          isLoading.value = false
        })    
      }else{
        isLoading.value = false
      }
       
    })
  }else{

    const response = await axios.post(`/v1/omd/insert/omd/special/`,formData, {
    // params:formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: "blob",
    }).then(({ data }) => {

      //downloadBlob(data, "Crear OMD Especial (Revocar Candidato)",'application/pdf')
      Swal.fire({ icon: "success", text: "OMD Generada Éxitosamente." })

      canceldata()

    }).catch(async e => {
      let text = 'No es posible realizar operación, por favor intenta más tarde.'
      if (e.response) {
        const { data } = e.response
        const response = data instanceof Blob ? JSON.parse(await data.text()) : data

        text = response.message
      }
      Swal.fire({ icon: 'warning', text: text })

    }).finally(() => {
      isLoading.value = false
    })    

  }

}

watch(inputFile, () => {
  if(inputFile.value === "" || inputFile.value === null || inputFile.value.length === 0)
    cancelLimpiar()
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const rulerItems = computed(() => {

  const array = itemsData.value

  return addOptionDefault(array)
})

const rulerSearch = async () => {
  filtersParams.value

  const requestBody= {
    "groupType": filtersParams.value.groupingPoliticalTypeId,
    "groupId": filtersParams.value.groupingPoliticalId,
    "blankVote": filtersParams.value.isBlankVotePromote,
    "corporation": filtersParams.value.corporationId,
    "circunscriptions": filtersParams.value.circunscriptionId,
    "department": filtersParams.value.department,
    "municipality": filtersParams.value.municipality,
    "commune":filtersParams.value.commune,
  }

  try{
    const { data } = await axios.get('/v1/omd/filter/omd/create/row-field',{ params: requestBody } )

    inscriptionId.value = data.inscriptionId
    itemsData.value = data.rowField

    status.value = data.state

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data
      
      Swal.fire({ icon: 'warning', text: message }) 

      emiting('omdReverse', true)
    }
  }
}

const causalData = computed(() => {

  const array = itemsCausal.value
    .filter(e => e.id != 1)
    .filter(e => e.id != 13)
    .map(e => ({ title: e.name.toUpperCase(), value: e.id }))

  return addOptionDefault(array)
})

const causalSearch = async () => {
  try{
    const { data } = await axios.get('/v1/omd/findAll/omd/reasons')

    itemsCausal.value = data
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data
    }
  }
}

const handlerAniFound = value => {

  let validarData

  let dataAni = value
  if(dataAni === formInfo.value.citizenshipIDNumber ){
    formInfo.value.citizenshipIDNumber = ''
    validarData = false
  }else{
    validarData = true
  }

  if (validarData) {
    const { ani, age, doubleRegistry, doubleMilitancy } = value

    formInfo.value.citizenshipIDNumber = ani.dni
    formInfo.value.firstName = ani.first_name 
    formInfo.value.middleName = ani.second_name 
    formInfo.value.firstLastName = ani.first_surname 
    formInfo.value.secondLastName = ani.second_surname 
    formInfo.value.gender = ani.gender
    formInfo.value.age = age

    birthdate.value = ani.birthdate
    expeditionDate.value = ani.expedition_date

  }else{
    
    formInfo.value.firstName = null
    formInfo.value.middleName = null
    formInfo.value.firstLastName = null
    formInfo.value.secondLastName = null
    formInfo.value.gender = null
    formInfo.value.age = null
    birthdate.value = null
    expeditionDate.value = null
  }
 
}
	
const canceldata = () => {
  emiting('omdReverse', true)
  error.value = false
  showImagen.value = false
  activateButtonSave.value = true
  inputFile.value = ''
  formInfo.value = {}
  formInfo.value.ruler = -1 
  formInfo.value.causal = -1 
}

const cancelLimpiar = () => {
  error.value = false
  showImagen.value = false
  activateButtonSave.value = true
  inputFile.value = ''
  formInfo.value = {}
  formInfo.value.ruler = -1 
  formInfo.value.causal = -1 
}

const isDisabledAni = () =>{
  if(formInfo.value.ruler != -1){
    disabledAni.value = false
  }    
  else{
    disabledAni.value = true
  }
}

onMounted(() => {
  rulerSearch()
  causalSearch()
})
</script>

<template>
  <div>
    <VCard>
      <VForm ref="form" validate-on="submit" @submit.prevent="handlerSubmit">
        <VCardText>
          <VListItemTitle class="demo-space-x  ps-10 mt-3 mb-2">
            Agregar Candidato:
          </VListItemTitle>
          <hr>
          <VRow class="mt-3">
            <VCol cols="12" md="6">
              <VAutocomplete 
                v-model="formInfo.ruler"
                label="Reglón"
                filter-mode="some"
                :items="rulerItems" 
                :disabled="disabledCheck"
                :rules="rules.ruler"
                @focusout="isDisabledAni"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AniFinderField
                v-model.trim="formInfo.citizenshipIDNumber"
                :base-url="`/v1/candidates/validate/${inscriptionId}/ani`"
                :label="t('preinscription.representative.dni')"
                class="mb-2 required"
                :disabled="disabledAni"
                :rules="rules.citizenshipIDNumber"
                @found="handlerAniFound"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formInfo.firstName" 
                label="Primer Nombre"
                class="mb-2 required"
                :disabled="disabled"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formInfo.middleName" 
                label="Segundo Nombre"
                class="mb-2 disabled"
                :disabled="disabled"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formInfo.firstLastName" 
                label="Primer Apellido"
                class="mb-2 required"
                :disabled="disabled"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formInfo.secondLastName" 
                label="Segundo Apellido"
                class="mb-2 required"
                :disabled="disabled"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formInfo.gender" 
                label="Género"
                class="mb-2 required"
                :disabled="disabled"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formInfo.age" 
                label="Edad"
                class="mb-2 required"
                :disabled="disabled"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VAutocomplete 
                v-model="formInfo.causal"
                label="Causal"
                filter-mode="some"
                :items="causalData" 
                :rules="rules.causal"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model.trim="formInfo.email"
                :label=" t('auth.email')"
                :rules="rules.email"
              />
            </VCol>
            <VCol cols="12" md="12">
              <VTextarea
                v-model.trim="formInfo.reason" 
                prepend-inner-icon="tabler-message-2" 
                label="Motivo"
                :rules="rules.reason"
              />
            </VCol>
          </VRow>

          <VListItemTitle class="demo-space-x  ps-10 mt-3 mb-2">
            Cargar Soporte:
          </VListItemTitle>
          <hr>
          <VRow class="mb-2">
            <VCol cols="12" class="d-flex align-center justify-center pa-6">
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
                      <div class="ps-5 mr-5" />
                    </VCol>
                  </VRow>
                </VCard>
                <VCardText class="d-flex justify-end flex-wrap gap-3">
                  <VBtn
                    variant="tonal"
                          
                    @click="canceldata"
                  >
                    {{ t('auth.cancel') }}
                  </VBtn>
                  <VBtn 
                    type="submit" 
                    :loading="isLoading"
                    :disabled="activateButtonSave"
                  >
                    Agregar Candidato
                  </vbtn>
                </VCardText>
              </div>
            </vcol>
          </vrow>
        </VCardText>
      </VForm>
    </VCard>
  </div>
</template>
