<script setup>
import ChangeVoteFilter from '@/components/OMD/changeDataCandidatesFilter.vue'
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import imageFilter from '@images/pages/ModificarInfoCandidato.png'
import Swal from "@/plugins/sweetalert2"
import { useVuelidate } from '@vuelidate/core'
import backgroundFiles from "@images/pages/upload-files.png"
import { keyPressOnlyNumber, pasteOnlyNumber  } from '@/utils/events'
import AniFinderField from "@/components/shared/AniFinderField.vue"

import {
  requiredSelectVuelidate,
  requiredVuelidate,
} from "@/utils/validators/vuelidate"


const formDisabled = ref(false)
const { t } = useI18n()
const filters = ref({})
const showDate = ref(false)
const isLoading = ref(false)
const inputFile = ref()


const file = ref()
const urlimagen = ref(backgroundFiles)
const error = ref(false)
const disabledBttn = ref(true)
const disabledFileInput = ref(false)
const showImagen = ref(false)
const urlPdf = ref()
const activateButtonSave = ref(true)

const titleComponentSection1 = 'Corrección de datos del candidato'
const titleComponentSection2 = 'Información Actual'
const titleComponentSection3 = 'Información Nueva'
const titleComponentSection4 = 'Datos de la OMD'

const form = ref({ 
  motiveType: -1,
  dniNew: null,
  firtsNameNew: null,
  secondNameNew: null,
  firtsSurNameNew: null, 
  secondSurNameNew: null,
  motive: null,
})

const formGetData = ref({ 
  rowField: -1,
})

const items = ref([])
const dniNow = ref("")
const firtsNameNow = ref('')
const secondNameNow = ref('')
const firtsSurNameNow = ref('')
const secondFirstSurNameNow = ref ('')
const renglonCandidate = ref(null)
const inscriptionId = ref(0)
const dataEndpoint = ref([])

//  Cambio en Cédula, Cambio en Nombres, Cambio en Apellidos, Otros.
const motiveTypeArray = [
  { title: 'Seleccione una opción', value: -1 },
  { title: 'Cambio en Cédula', value: 'Cambio en Cédula' },
  { title: 'Cambio en Nombres', value: 'Cambio en Nombres' },
  { title: 'Cambio en Apellidos', value: 'Cambio en Apellidos' },
  { title: 'Otros', value: 'Otros' },
]

// Data for table when generate function in button Add

const dniNowTable = ref("")
const firtsNameNowTable = ref('')
const secondNameNowTable = ref('')
const firtsSurNameNowTable = ref('')
const secondFirstSurNameNowTable = ref ('')
const dniNewTable = ref('')
const firtsNameNewTable = ref('')
const secondNameNewTable = ref('')
const firtsSurNameNewTable = ref('')
const secondSurNameNewTable = ref('')
const renglonCandidateTable = ref(null)
const motiveTable = ref('')

// functions

const clearTable = () => {
  dniNowTable.value = null
  firtsNameNowTable.value = null
  secondNameNowTable.value = null
  firtsSurNameNowTable.value = null
  secondFirstSurNameNowTable.value = null
  dniNewTable.value = null
  firtsNameNewTable.value = null
  secondNameNewTable.value = null
  firtsSurNameNewTable.value = null
  secondSurNameNewTable.value = null
  renglonCandidateTable.value = null
  motiveTable.value = null
}

// Clear form
const clearForm = () => {
  form.value = {
    motiveType: -1,
    dniNew: null,
    firtsNameNew: null,
    secondNameNew: null,
    firtsSurNameNew: null, 
    secondSurNameNew: null,
    motive: null,
  }
  v$.value.$reset()
}

const clearInputs = () => {
  dniNow.value = null 
  firtsNameNow.value = null 
  secondNameNow.value = null 
  firtsSurNameNow.value = null 
  secondFirstSurNameNow.value = null 
  renglonCandidate.value = null 
}

// Clear form 2
const clearForm2 = () => {
  formGetData.value = {
    rowField: -1,
  }
  v2$.value.$reset()
}

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
    error.value = true
  }


}

watch(inputFile, () => {
  if(inputFile.value === "" || inputFile.value === null || inputFile.value.length === 0)
    cancelFile()
})

const saveFile = async function (e) {
  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true
  formDisabled.value = true

  const { ...result } = form.value

  const requestBody = { 
    ...result,
  }

  const formData = new FormData()

  formData.append('supportFile', file.value)
  formData.append('typeGroupinPoliticalId', filters.value.groupingPoliticalTypeId)
  formData.append('groupingPoliticalId', filters.value.groupingPoliticalId)
  formData.append('optionVote', filters.value.isBlankVotePromote)
  formData.append('corporationId', filters.value.corporationId)
  formData.append('circunscriptionId', filters.value.circunscriptionId)
  formData.append('departmentId', filters.value.department)
  formData.append('municipalityId', filters.value.municipality)
  formData.append('communeId', filters.value.commune)
  formData.append('row', renglonCandidate.value)  
  if(requestBody.motiveType == 'Otros'){
    formData.append('reason', requestBody.motive)
  }else{
    formData.append('reason', requestBody.motiveType)
  }
  formData.append('dni', requestBody.dniNew)
  formData.append('name', requestBody.firtsNameNew.toUpperCase())
  formData.append('secondName', requestBody.secondNameNew.toUpperCase())
  formData.append('lastname', requestBody.firtsSurNameNew.toUpperCase())
  formData.append('secondLastName', requestBody.secondSurNameNew.toUpperCase())
  formData.append('gender', 'NB')

  if(dniNowTable.value == '' || dniNewTable.value == ''){

    let html = 'Debe ingresar los datos en la tabla con el botón agregar, intentelo y valide nuevamente.'

    let message = html
    Swal.fire({ icon: 'warning', text: message }).then(() => {
      isLoading.value = false
    })


  }else{
    const response = await axios.post(`/v1/omd/modify-candidate-final-omd`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: "blob",
    }).then(({ data }) => {

      Swal.fire({
        text: 'OMD Generada Éxitosamente.',
        icon: 'success',
        confirmButtonText:'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        // eslint-disable-next-line promise/no-nesting
      }).then(() => {
      // ejectuar evento reload
        clearForm()
        clearForm2()
        cancelFile()
        clearTable()
      })

    
    
    }).catch(async e => {
      let text = 'No es posible realizar operación, por favor intenta más tarde.'

      if (e.response) {
        const { data } = e.response
        const response = data instanceof Blob ? JSON.parse(await data.text()) : data

        text = response.message

      }
      Swal.fire({ icon: 'warning', text: text })
    }).finally(() => {
      isLoading.value = false,
      formDisabled.value = false
    })    
  }

 
}

const SetDataForTable = async function (e) {
  if(formGetData.value.rowField === -1 && form.value.motiveType === -1){
    clearForm()
    clearForm2()

    // inputs
    // traer data old
    renglonCandidate.value = null 
    dniNow.value = null
    firtsNameNow.value = null
    secondNameNow.value = null
    firtsSurNameNow.value = null
    secondFirstSurNameNow.value = null
    
    // traer data New
    form.value.dniNew = null
    form.value.firtsNameNew = null
    form.value.secondNameNew = null
    form.value.firtsSurNameNew = null
    form.value.secondSurNameNew = null
    renglonCandidate.value = null
    form.value.motive = null

    // traer data for datatable old
    renglonCandidateTable.value = null 
    dniNowTable.value = null
    firtsNameNowTable.value = null
    secondNameNowTable.value = null
    firtsSurNameNowTable.value = null
    secondFirstSurNameNowTable.value = null
    motiveTable.value = null

    // traer data for datatable New
    dniNewTable.value = null
    firtsNameNewTable.value = null
    secondNameNewTable.value = null
    firtsSurNameNewTable.value = null
    secondSurNameNewTable.value = null
    renglonCandidateTable.value = null
    
  }

  if(form.value.dniNew <= 5 || form.value.length >= 12){
    let html = 'N°. cédula ciudadanía nueva debe contener entre 5 y 12 caracteres númericos'
    
    let message = html
    Swal.fire({ icon: 'warning', text: message })
  }else{
    // traer data old
    renglonCandidateTable.value = renglonCandidate.value 
    dniNowTable.value = dniNow.value
    firtsNameNowTable.value = firtsNameNow.value
    secondNameNowTable.value = secondNameNow.value
    firtsSurNameNowTable.value = firtsSurNameNow.value
    secondFirstSurNameNowTable.value = secondFirstSurNameNow.value

    // traer data New in the clic user 
    dniNewTable.value = form.value.dniNew
    firtsNameNewTable.value = form.value.firtsNameNew.toUpperCase() 
    secondNameNewTable.value = form.value.secondNameNew.toUpperCase() 
    firtsSurNameNewTable.value = form.value.firtsSurNameNew.toUpperCase() 
    secondSurNameNewTable.value = form.value.secondSurNameNew.toUpperCase() 
    renglonCandidateTable.value = renglonCandidate.value 

    if(form.value.motiveType == 'Otros'){
      motiveTable.value = form.value.motiveType+ " - "+form.value.motive
    }
    else{
      motiveTable.value = form.value.motiveType
    }
  }  
}

const handleFocusout = async function(e){
  v2$.value.$touch()
  if (v2$.value.$invalid) return

  const array = [formGetData.value]
  const segundoDato = array.map(e => e.rowField)[0]
  
  const {
    department,
    municipality,
    commune,
    corporationId,
    circunscriptionId,
    isBlankVotePromote,
    groupingPoliticalTypeId,
    groupingPoliticalId,
  } = filters.value

  const requestBody = {
    typeGroupinPoliticalId: groupingPoliticalTypeId,
    groupingPoliticalId: groupingPoliticalId,
    optionVote:isBlankVotePromote,
    corporationId:corporationId,
    circunscriptionId:circunscriptionId,
    departmentId:department,
    municipalityId:municipality,
    communeId:commune,
    row:segundoDato,
  }  

  try {
    await axios
      .get("/v1/candidate-final/candidate-informormation", {
        params: requestBody,
      })
      .then(response => {
        dataEndpoint.value = response.data

        if(dataEndpoint.value == null || dataEndpoint.value == ''){
          Swal.fire("No hay información del reglón para esta Inscripción.")
        }else{
          renglonCandidate.value = dataEndpoint.value.rowField,
          dniNow.value = dataEndpoint.value.dni,
          firtsNameNow.value = dataEndpoint.value.firstname,
          secondNameNow.value = dataEndpoint.value.secondname,
          firtsSurNameNow.value = dataEndpoint.value.firstsurname,
          secondFirstSurNameNow.value = dataEndpoint.value.secondsurname,
          inscriptionId.value = dataEndpoint.value.inscriptionId
        }        
      })

  } catch (error) {
    let text = 'No hay información en los filtros seleccionados.'
    if (error.response) {
      const { data } = error.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
 
  }
}


const cancelFile = () => {
  error.value = false  
  inputFile.value = ''
  disabledBttn.value = true
  disabledFileInput.value = false
  showImagen.value = false
  activateButtonSave.value = true

  // limpia el select 
  clearForm2()

  // limpiar tabla data old
  renglonCandidateTable.value = null 
  dniNowTable.value = null
  firtsNameNowTable.value = null
  secondNameNowTable.value = null
  firtsSurNameNowTable.value = null
  secondFirstSurNameNowTable.value = null

  // limpiar tabla data new
  dniNewTable.value = null
  firtsNameNewTable.value = null
  secondNameNewTable.value = null
  firtsSurNameNewTable.value = null
  secondSurNameNewTable.value = null
  motiveTable.value = null

  // limpiar formulario principal
  clearForm()

  // limpiar datos cargados en inputs
  clearInputs()
}



const handlerSearchFilter  = async value => {

  filters.value = value

  const requestBody = {
    typeGroupinPoliticalId: filters.value.groupingPoliticalTypeId,
    groupingPoliticalId: filters.value.groupingPoliticalId,
    optionVote: filters.value.isBlankVotePromote,
    corporationId: filters.value.corporationId,
    circunscriptionId: filters.value.circunscriptionId,
    departmentId: filters.value.department,
    municipalityId: filters.value.municipality,
    communeId: filters.value.commune,
  }

  try {
    await axios
      .get("/v1/candidate-final/candidat-row", {
        params: requestBody,
      })
      .then(response => {
        items.value = response.data
        if(items.value == null || items.value == ""){
          let messageText = 'No hay información disponible con los filtros de busqueda, si el problema persiste comuniquese con la mesa de ayuda.'

          Swal.fire({ icon: "warning", text: messageText })
          showDate.value = false
        }
        else{
          showDate.value = true
        }
      })
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    } else {
      await Swal.fire({
        icon: 'warning',
        text: t('coalitions.msg_error'),
      })
    }
    
    return false
  }
}

const addOptionDefault = array => {
  return [ { title: t('common.all_option'), value: -1 }, ...array]
}

const categoryApproachDifference = computed(() => {

  const array = items.value.map(e => ({ title: `Renglón - ${e.rowField} `, value: e.rowField }))

  return addOptionDefault(array)
})

const rules = computed(() => ({
  dniNew: { requiredVuelidate },
  motiveType: { requiredSelectVuelidate },
}))

const v$ = useVuelidate(rules, form)

const rules2 = computed(() => ({
  rowField: { requiredSelectVuelidate },
}))

const v2$ = useVuelidate(rules2, formGetData)

const handlerAniFound = value => {

  let validarData

  let dataAni = value
  if(dataAni === form.value.dniNew ){
    form.value.dniNew = ''
    validarData = false
  }else{
    validarData = true
  }

  if (validarData) {
    const { ani  } = value

    form.value.dniNew = ani.dni
    form.value.firtsNameNew = ani.first_name 
    form.value.secondNameNew = ani.second_name 
    form.value.firtsSurNameNew = ani.first_surname 
    form.value.secondSurNameNew = ani.second_surname 

  }else{  
    form.value.firtsNameNew = null
    form.value.secondNameNew = null
    form.value.firtsSurNameNew = null
    form.value.secondSurNameNew = null
  }
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('OMD.change_data_candidates.title') ]" /> 
    <ChangeVoteFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showDate">
      <VCardText>
        <VAlert> {{ titleComponentSection1 }}  </VAlert>
        <br>
        <VRow class="mt-4">
          <VCol cols="12" sm="4" md="4">
            <VSelect 
              v-model="formGetData.rowField"
              :label="t('OMD.change_data_candidates.rowFiled')"
              filter-mode="some"
              :items="categoryApproachDifference"
              :error-messages="v2$.rowField.$errors[0]?.$message"
              @focusout="handleFocusout"
            />
          </VCol>
          <VCol 
            cols="12" 
            sm="4" 
            md="4"
          >
            <VSelect 
              v-model="form.motiveType"
              :label="t('OMD.change_data_candidates.motiveType')"
              :items="motiveTypeArray"
              :error-messages="v$.motiveType.$errors[0]?.$message"
            />
          </VCol>            
          <VCol
            cols="4"
            class="d-flex gap-4"
          >
            <VBtn
              class="bg-primary"
              rounded="pill"
              @click="SetDataForTable" 
            >
              {{ t('OMD.change_data_candidates.btnAdd') }}
            </VBtn>
          </VCol>
          <VCol 
            cols="12" 
            sm="6" 
            md="6"
          >
            <VTextField
              v-if="form.motiveType == 'Otros'"
              v-model.trim="form.motive"
              clearable
              label="Motivo"
              placeholder="Motivo"
            />
          </VCol>
        </VRow>
        <VForm ref="refForm" class="mt-2" @submit.prevent="saveFile">
          <VAlert class="mt-4 me-3">
            {{ titleComponentSection2 }}  
          </VAlert>
          <VRow class="mt-4">
            <br>
            <VCol
              cols="12"
              md="4"
            > 
              <VTextField
                v-model.trim="dniNow"
                clearable
                :label="t('OMD.change_data_candidates.dniNow')"
                :placeholder="t('OMD.change_data_candidates.dniNow')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="firtsNameNow"
                clearable
                :label="t('OMD.change_data_candidates.firtsNameNow')"
                :placeholder="t('OMD.change_data_candidates.firtsNameNow')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="secondNameNow"
                clearable
                :label="t('OMD.change_data_candidates.secondNameNow')"
                :placeholder="t('OMD.change_data_candidates.secondNameNow')"
                disabled
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="firtsSurNameNow"
                clearable
                :label="t('OMD.change_data_candidates.firtsSurNameNow')"
                :placeholder="t('OMD.change_data_candidates.firtsSurNameNow')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="secondFirstSurNameNow"
                clearable
                :label="t('OMD.change_data_candidates.secondFirstSurNameNew')"
                :placeholder="t('OMD.change_data_candidates.secondFirstSurNameNew')"
                disabled
              />
            </VCol>
          </VRow>
          <VAlert class="mt-4 me-3">
            {{ titleComponentSection3 }}  
          </VAlert>
          <VRow class="mt-4">
            <br>
            <VCol
              cols="12"
              md="4"
            >
              <AniFinderField
                v-model.trim="form.dniNew"
                :base-url="`/v1/candidates/validate/${inscriptionId}/ani`"
                :placeholder="t('OMD.change_data_candidates.dniNew')"
                class="mb-2 required"
                :error-messages="v$.dniNew.$errors[0]?.$message"
                @found="handlerAniFound"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            > 
              <VTextField
                v-model.trim="form.firtsNameNew"
                clearable
                :label="t('OMD.change_data_candidates.firtsNameNew')"
                :placeholder="t('OMD.change_data_candidates.firtsNameNew')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            > 
              <VTextField
                v-model.trim="form.secondNameNew"
                clearable
                :label="t('OMD.change_data_candidates.secondNameNew')"
                :placeholder="t('OMD.change_data_candidates.secondNameNew')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            > 
              <VTextField
                v-model.trim="form.firtsSurNameNew"
                clearable
                :label="t('OMD.change_data_candidates.firtsSurNameNew')"
                :placeholder="t('OMD.change_data_candidates.firtsSurNameNew')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="form.secondSurNameNew"
                clearable
                :label="t('OMD.change_data_candidates.secondFirstSurNameNew')"
                :placeholder="t('OMD.change_data_candidates.secondFirstSurNameNew')"
                disabled
              />
            </VCol>
          </VRow>
          <VRow>
            <VAlert class="mt-4 me-3">
              {{ titleComponentSection4 }}  
            </VAlert>
            <VCol
              cols="12"
              md="12"
              sm="12"
            >
              <VCardText>
                <VTable density="compact" class="text-no-wrap mt-5">
                  <thead class="table-light text-muted">
                    <tr>
                      <th class="text-center border bg-info-light" rowspan="3">
                        <span style="color: black;"> Renglón  </span>
                        <span style="color: black;">{{ renglonCandidateTable }} </span> 
                      </th>
                      <th class="text-center border" colspan="2" />
                      <th class="text-center border">
                        Identificación
                      </th>
                      <th class="text-center border">
                        Primer Nombre 
                      </th>
                      <th class="text-center border">
                        Segundo Nombre
                      </th>
                      <th class="text-center border">
                        Primer Apellido
                      </th>
                      <th class="text-center border">
                        Segundo Apellido
                      </th>
                      <th class="text-center border" colspan="2">
                        Motivo
                      </th>
                    </tr>
                    <tr class="mb-3 text-center border bg-info-light">
                      <td class="text-center border" colspan="2">
                        <span style="color: black;">  Anterior </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;"> {{ dniNowTable }}  </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ firtsNameNowTable }}  </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ secondNameNowTable }}  </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ firtsSurNameNowTable }}  </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ secondFirstSurNameNowTable }}  </span>
                      </td>
                      <td class="text-center border" colspan="2" rowspan="2">
                        <span style="color: black;">  {{ motiveTable }}  </span>
                      </td>
                    </tr>
                    <tr class="mb-3 text-center border bg-info-light">
                      <td class="text-center border" colspan="2">
                        <span style="color: black;">  Actual </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ dniNewTable }}  </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ firtsNameNewTable }}  </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ secondNameNewTable }}  </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ firtsSurNameNewTable }}  </span>
                      </td>
                      <td class="text-center border">
                        <span style="color: black;">  {{ secondSurNameNewTable }}  </span>
                      </td>
                    </tr>
                  </thead>
                </VTable>
              </VCardText>
            </VCol>
          </VRow>
          <VRow>
            <VCol 
              cols="12"
              md="12"
              sm="12"
              lg="12"
              xl="12"
            >
              <div class="d-flex justify-center">
                <div class="layout-default">
                  <VCard :title="t('OMD.change_name_group_political.chargeFileSupport')">
                    <VCardTitle>
                      <hr>
                    </VCardTitle>
                    <VRow no-gutters>
                      <VCol cols="12" class="d-flex align-center justify-center py-9">
                        <VCard variant="outlined" class="card-rounded" color="primary" width="100%">
                          <VRow>
                            <VCol cols="12" md="6" class="px-12 py-12" style="margin-top: 5%;">
                              <VBtn :disabled="disabledPreviewLogo" @click="getFile">
                                {{ t("corporate_loading.select_button") }}
                                <VIcon class="me-1" end icon="mdi-tray-arrow-up" size="22" />
                              </VBtn>                               
                              <VCol cols="12" md="10" class="px-1 py-1">
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
                                  {{ t("OMD.upload_options.messageMaxSize1MB") }}
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
                    </VRow>
                  </VCard>
                </div>
              </div>
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              class="d-flex gap-4"
            >
              <VBtn
                :disabled="activateButtonSave" 
                :loading="isLoading"
                class="bg-primary"
                rounded="pill"
                type="submit" 
              >
                {{ t('OMD.change_name_group_political.btnGenerateOMD') }}
              </VBtn>
              <VBtn
                type="reset"
                color="secondary"
                variant="tonal"
                @click="clearForm"
              >
                {{ t('user.cancel') }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
    <VCard v-else>
      <div class="mb-10 ps-10 mt-10 pr-10">
        <VImg
          :src="imageFilter"
          cover
        />
      </div>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "omd-modify-data-candidates"
meta:
authRequired: true
</route>
