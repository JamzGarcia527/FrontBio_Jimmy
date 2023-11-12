<script setup>
import ReverseFormE6ApprovedFilter from '@/components/reverseFormE6Approved/reverseFormE6ApprovedFilter.vue'
import DataTable from '@/components/shared/DataTable.vue'
import backgroundFiles from "@images/pages/upload-files.png"
import axios from "@/plugins/axios"
import imageLogo from '@images/pages/filters.png'
import Swal from "@/plugins/sweetalert2"
import { useVuelidate } from "@vuelidate/core"
import { useI18n } from "vue-i18n"
import {  helpers } from "@vuelidate/validators"
import useEventBus from "@/utils/eventBus"
import {
  requiredVuelidate,
  integerVuelidate,
} from "@/utils/validators/vuelidate"


const { t } = useI18n()
const { emit: emiting } = useEventBus()

const inputFile = ref()
const activateButtonSave = ref(true)
const filters = ref([])
const urlimagen = ref(backgroundFiles)
const items = ref([])
const showImagen = ref(false)
const urlPdf = ref()
const error = ref(false)
const file = ref(false)
const inscriptioId = ref(false)

const formDataDes = ref({
  description:'',
})

const form = ref({
  inscriptionState:'',
  groupingName:'',
  groupingAddress:'',
  groupingCelularPhone:'',
  groupingPhone:'',
  inscriptionDepartment:'',
  inscriptionMunicipality:'',
  dateInitial:'',
  groupingEmail:'',
  inscriptionCreatedBy:'',
  inscriptionPreferentialVote:'',
})

const fields = ref([
  { key: "candidateRowField", label: t('candidates.rowField').toUpperCase() },
  { key: "candidateDni", label: t('candidate_uploaded_photos_report.dni').toUpperCase()  },
  { key: 'candidateNames', label: t('candidates.names').toUpperCase() },
  { key: "candidateSurnames", label: t('candidates.lastNames').toUpperCase() },
  { key: "candidateGender", label:t('candidates.gender').toUpperCase() },
  { key: "candidateAge", label: t('candidates.age').toUpperCase() },
 
])

const rules = computed(() =>({
  description: {
    requiredVuelidate,
    length: helpers.withMessage(
      "El Campo observación tiene un máximo de 1000 caracteres",
      value => !value || String(value).length < 999,
    ),
  },

}))


const handlerSearchFilter = value => {
  filters.value = value
  informatioE6()
}

const getFile = function () {
  let fileUpload = document.getElementById("fileUpload")
  if (fileUpload != null) {
    fileUpload.click()
  }
}


const informatioE6 = async () => {

  const filter = filters.value

  if(  filter.groupingPoliticalTypeId !==-1  || filter.corporationId !== -1  && filter.department !== -1){
    const requestBody = {
      "department": filter.department,
      "municipality": filter.municipality,
      "commune": filter.commune,
      "corporationId": filter.corporationId,
      "circunscriptionId": filter.circunscriptionId,
      "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
      "groupingPoliticalId": filter.groupingPoliticalId,
    }

    axios
      .get(`/v1/inscriptions/to-reverse`, { params: requestBody })
      .then(({ data }) => {


        items.value = data[0].candidates
    
        let {
          inscriptionState,
          groupingName,
          groupingAddress,
          groupingCelularPhone,
          groupingPhone,
          inscriptionDepartment,
          inscriptionMunicipality,
          inscriptionCommune,
          groupingEmail,
          inscriptionCreatedBy,
          inscriptionPreferentialVote,
          inscriptionId,
        } = data[0]
    
        inscriptioId.value = inscriptionId

        form.value = {
          inscriptionState,
          groupingName,
          groupingAddress,
          groupingCelularPhone,
          groupingPhone,
          inscriptionDepartment,
          inscriptionMunicipality,
          inscriptionCommune,
          groupingEmail,
          inscriptionCreatedBy,
          inscriptionPreferentialVote,
        }
      })
      .catch(error => {


        if(error.message === "Cannot read properties of undefined (reading 'candidates')"){        
          Swal.fire({ icon: 'warning', text: 'No se ha encontrado ningún Formulario E6 o No está aprobado el Formulario E6' })
      
          inscriptioId.value = false
        }
        if (error.response && error.response.status < 500) {
        

          const { message } = error.response.data

          Swal.fire({ icon: 'warning', text: message })
        }

      })
  }else{
    Swal.fire({ icon: 'warning', text: 'Por favor seleccione uno de los filtros para buscar un Formulario E6' })
    canceldata()
    inscriptioId.value = false
  }
}


const v$ = useVuelidate(rules, formDataDes)

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

  v$.value.$touch()
  if (v$.value.$invalid) return

  const formData = new FormData()

  const{
    description,
  }=formDataDes.value

  formData.append("file", file.value)
  formData.append("observation", description)

  try {
   
    const { data } = await axios.post(`/v1/inscriptions/reverse-inscription/${inscriptioId.value}`, formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
   
      
    await Swal.fire({ text: "Se ha reversado correctamente el formulario E6", icon: "success" })
    canceldata()
    inscriptioId.value = false
    emiting('updateReverse', true)

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

// onMounted(async () => {
//   await informatioE6()
// })
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('supportingDocuments.breadcrumbs.title'), $t('supportingDocuments.breadcrumbs.reverse_form_E6_approved') ]" /> 
    <ReverseFormE6ApprovedFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="inscriptioId" class="rounded-lg" variant="outlined">
      <VRow>
        <VCol 
          cols="12" 
          md="12"
        >
          <VCard class="rounded-lg" variant="outlined">
            <VTable density="compact" class="text-no-wrap mt-5">
              <thead class="table-light text-muted">
                <tr>
                  <th class="text-center border bg-info-light" colspan="3">
                    Estado del Formulario: 
                    <VChip color="success">
                      <VIcon start size="16" icon="tabler-circle-check" />
                      <span>{{ form.inscriptionState }} </span>
                    </VChip>
                  </th>
                </tr>
                <tr>
                  <th class="text-center border " colspan="3">
                    Sección Información de la Agrupación Política: 
                    <br>
                    {{ form.groupingName }} 
                  </th>
                </tr>
                <tr class="mb-3">
                  <td class="text-center border ">
                    Dirección: 
                  </td>
                  <td class="text-center border ">
                    {{ form.groupingAddress }} 
                  </td>
                </tr>
                <tr class="mb-3">
                  <td class="text-center border ">
                    {{ t('basicInfo.celularPhone') }}:
                  </td>
                  <td class="text-center border ">
                    {{ form.groupingCelularPhone }} 
                  </td>
                </tr>
                <tr class="mb-3">
                  <td class="text-center border ">
                    {{ t('common.phone') }}:
                  </td>
                  <td class="text-center border ">
                    {{ form.groupingPhone }} 
                  </td>
                </tr>
                <tr class="mb-3">
                  <td class="text-center border ">
                    {{ t('common.department') }}:
                  </td>
                  <td class="text-center border ">
                    {{ form.inscriptionDepartment }} 
                  </td>
                </tr>
                <tr class="mb-3">
                  <td class="text-center border">
                    {{ t('common.municipality') }}:
                  </td>
                  <td class="text-center border ">
                    {{ form.inscriptionMunicipality }} 
                  </td>
                </tr>  
                <tr class="mb-3">
                  <td class="text-center border ">
                    {{ t('common.commune') }}:
                  </td>
                  <td class="text-center border ">
                    {{ form.inscriptionCommune }} 
                  </td>
                </tr>
                <tr class="mb-3">
                  <td class="text-center border ">
                    {{ t('auth.email') }}:
                  </td>
                  <td class="text-center border ">
                    {{ form.groupingEmail }} 
                  </td>
                </tr>
                <tr class="mb-3">
                  <td class="text-center border ">
                    {{ t('basicInfo.enrollList') }}:
                  </td>
                  <td class="text-center border ">
                    {{ form.inscriptionCreatedBy }} 
                  </td>
                </tr>
                <tr class="mb-3">
                  <td class="text-center border ">
                    {{ t("preinscription.grouping_political.vote_option.label") }}:
                  </td>
                  <td class="text-center border ">
                    {{ form.inscriptionPreferentialVote ? 'Preferente' : 'No Preferente' }} 
                  </td>
                </tr>
                <tr>
                  <th class="text-center border bg-info-light" colspan="3">
                    Sección Listado de candidatos:
                  </th>
                </tr>
              </thead>
            </VTable>
            <DataTable :fields="fields" :items="items" />
            <VTable density="compact" class="text-no-wrap mt-5">
              <thead class="table-light text-muted">
                <tr>
                  <th class="text-center border bg-info-light" colspan="3">
                    Opción para cargar soporte de reversión:
                  </th>
                </tr>
              </thead>
            </VTable>
            <VCard>
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
                          
                            @click="canceldata"
                          >
                            {{ t('auth.cancel') }}
                          </VBtn>
                          <VBtn 
                            type="submit" 
                            :loading="isLoading"
                            :disabled="activateButtonSave"
                          >
                            Reversar Formulario E6 
                          </vbtn>
                        </VCardText>
                      </VCard>
                    </div>
                  </VForm>
                </VCol>
              </VRow>
            </VCard>
          </VCard>
        </VCol>
      </VRow>
    </VCard>
    <VCard v-else>
      <div class="mb-10 ps-10 mt-10 pr-10">
        <VImg
          :src="imageLogo"
          cover
        />
      </div>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "reverse-form-e6-approved"
meta:
authRequired: true
</route>
