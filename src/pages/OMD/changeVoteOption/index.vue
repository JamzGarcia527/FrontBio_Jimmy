<script setup>
import ChangeVoteFilter from '@/components/OMD/changeVoteOptionFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import imageFilter from '@images/pages/change_vote_option.png'
import Swal from "@/plugins/sweetalert2"
import { downloadBlob } from '@/utils'
import { useVuelidate } from '@vuelidate/core'
import backgroundFiles from "@images/pages/upload-files.png"
import {  helpers } from "@vuelidate/validators"

const formDisabled = ref(false)
const { t } = useI18n()
const filters = ref([])
const showDate = ref(false)
const isLoading = ref(false)
const inputFile = ref()


const file = ref()
const urlimagen = ref(backgroundFiles)
const error = ref(false)
const successFile = ref(false)
const disabledBttn = ref(true)
const disabledFileInput = ref(false)
const showImagen = ref(false)
const urlPdf = ref()
const activateButtonSave = ref(true)
const titleComponentSection1 = 'Información de la Agrupación Política'
const titleComponentSection2 = 'Listado de Candidatos'

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
  
  formData.append('docFile', file.value)
  formData.append('inscriptionsId', idInscription.value)
  formData.append('oldPreferentialVote', voteOptionOldId.value)
  formData.append('newPreferentialVote', requestBody.newVoteOption)
  formData.append('reasonId', requestBody.causal)
  formData.append('groupingPoliticalId', groupingPoliticalId.value)
  formData.append('typeId', filters.value.groupingPoliticalTypeId)
  formData.append('observations', requestBody.changeMotive)
  formData.append('state', 1)

  
  const response = await axios.post(`/v1/omd/insert/omd/vote/preferential`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: "blob",
  }).then(({ data }) => {
    downloadBlob(data, "GenerarOMD",'application/pdf')
    Swal.fire({ icon: "success", text: "OMD Generada Éxitosamente." })

    clearForm()
    cancelFile()
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


const cancelFile = () => {

  error.value = false  
  inputFile.value = ''
  disabledBttn.value = true
  disabledFileInput.value = false
  showImagen.value = false
  activateButtonSave.value = true
  form.causal = -1,
  form.newVoteOption = -1
}

const msnFile = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}

const form = ref({ 
  newVoteOption: -1,
  causal: -1,
  changeMotive: null,
})

// Validators
import {
  requiredVuelidate,
} from '@/utils/validators/vuelidate'

const fields = ref([
  { key: "rowField", label:t('OMD.fields.line').toUpperCase()  },
  { key: "dni", label: t('OMD.fields.numberDni').toUpperCase() },
  { key: "firstname", label: t('OMD.fields.firtsName').toUpperCase() },
  { key: 'secondName',label: t('OMD.fields.secondName').toUpperCase() },
  { key: 'firstSurName',label: t('OMD.fields.firtsSurName').toUpperCase() },
  { key: "secondSurName", label: t('OMD.fields.secondSurName').toUpperCase() },
  { key: "gender", label: t('OMD.fields.gender').toUpperCase()  },
  { key: "age", label: t('OMD.fields.age').toUpperCase() },
])

const items = ref([])
const addressGP = ref("")
const phoneGP = ref('')
const localPhone = ref('')
const department = ref('')
const municipality = ref ('')
const emailGP = ref('')
const NameRecipientList = ref('')
const voteOption = ref('')
const idInscription = ref(0)
const groupingPoliticalId = ref(0)
const groupingPoliticalTypeId = ref(0)
const requestBodyFilters = ref([])
const voteOptionOldId = ref(0)

const handlerSearchFilter  = async value => {

  filters.value = value

  requestBodyFilters.value = {
    groupType: filters.value.groupingPoliticalTypeId,
    groupId: filters.value.groupingPoliticalId,
    blankVote: filters.value.isBlankVotePromote,
    corporation: filters.value.corporationId,
    circunscriptions: filters.value.circunscriptionId,
    department: filters.value.department,
    municipality: filters.value.municipality,
    commune: filters.value.commune,
    page: 0,
    size: 9999,
  }
    
  const requestBody = {
    groupType: filters.value.groupingPoliticalTypeId,
    groupId: filters.value.groupingPoliticalId,
    blankVote: filters.value.isBlankVotePromote,
    corporation: filters.value.corporationId,
    circunscriptions: filters.value.circunscriptionId,
    department: filters.value.department,
    municipality: filters.value.municipality,
    commune: filters.value.commune,
  }

  try {
    await axios
      .get("grouping-political/omd/grouping/political", {
        params: requestBody,
      })
      .then(response => {
        items.value = response.data

      
        if(items.value == null || items.value == ""){
          Swal.fire("No hay información disponible con los filtros seleccionados")
          showDate.value = false
        }else{
          addressGP.value = items.value.address
          phoneGP.value = items.value.celularPhone
          localPhone.value = items.value.phone
          department.value = items.value.department
          municipality.value = items.value.municipality
          emailGP.value = items.value.email
          NameRecipientList.value = items.value.contactName
          groupingPoliticalId.value = items.value.groupingPoliticalId
          voteOption.value = items.value.preferential
          voteOptionOldId.value = items.value.preferentialId
          idInscription.value = items.value.inscriptionId

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



const rules = computed(() => ({
  causal: { requiredVuelidate }, 
  newVoteOption: { requiredVuelidate },
  changeMotive: { requiredVuelidate,

    length: helpers.withMessage(

      "El Campo observación tiene un máximo de 500 caracteres",

      value => !value || String(value).length < 499,

    ) },
}))


const newVoteOptionArray = [
  { title: 'Seleccione una opción', value: -1 },   
  { title: 'Preferente', value: 1 },
  { title: 'No Preferente', value: 0 },
]

// data select Causal
const causalArray = [
  { title: 'Seleccione una opción', value: -1 },
  { title: 'Por error', value: 1 },
  { title: 'Orden Judicial', value: 2 },
  { title: 'Acción de tutela', value: 3 },
]


const v$ = useVuelidate(rules, form)

// Clear form
const clearForm = () => {
  form.value = {}
  v$.value.$reset()
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('OMD.vote_option.title') ]" /> 
    <ChangeVoteFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showDate">
      <VCardText>
        <VForm ref="refForm" :disabled="formDisabled" class="mt-2" @submit.prevent="saveFile">
          <Alert>{{ titleComponentSection1 }}</Alert>
          <VRow class="mt-4">
            <VCol
              cols="12"
              md="4"
            > 
              <VTextField
                v-model.trim="addressGP"
                clearable
                :label="t('OMD.vote_option.addressGP')"
                :placeholder="t('OMD.vote_option.addressGP')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="phoneGP"
                clearable
                :label="t('OMD.vote_option.phoneGP')"
                :placeholder="t('OMD.vote_option.phoneGP')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="localPhone"
                clearable
                :label="t('OMD.change_name_group_political.local_phone_E8')"
                :placeholder="t('OMD.change_name_group_political.local_phone_E8')"
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
                v-model.trim="department"
                clearable
                :label="t('candidates.department')"
                :placeholder="t('candidates.department')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="municipality"
                clearable
                :label="t('candidates.municipality')"
                :placeholder="t('candidates.municipality')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="emailGP"
                clearable
                :label="t('OMD.vote_option.emailGP')"
                :placeholder="t('OMD.vote_option.emailGP')"
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
                v-model.trim="NameRecipientList"
                clearable
                :label="t('OMD.vote_option.NameRecipientList')"
                :placeholder="t('OMD.vote_option.NameRecipientList')"
                disabled
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="voteOption"
                clearable
                :label="t('OMD.vote_option.voteOption')"
                :placeholder="t('OMD.vote_option.voteOption')"
                disabled
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol 
              cols="12" 
              sm="6" 
              md="6"
            >
              <VSelect 
                v-model="form.causal"
                :label="t('OMD.vote_option.causal')"
                :items="causalArray"
                :error-messages="v$.causal.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="form.newVoteOption"
                :items="newVoteOptionArray"
                :label="t('OMD.vote_option.newVoteOption')"
                :error-messages="v$.newVoteOption.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              md="12"
            >
              <VContainer fluid>
                <VTextarea
                  v-model.trim="form.changeMotive"
                  clearable
                  :label="t('OMD.vote_option.changeMotive')"
                  :placeholder="t('OMD.vote_option.changeMotive')"
                  :error-messages="v$.changeMotive.$errors[0]?.$message"
                />
              </VContainer>
            </VCol>
          </VRow>
          <VRow>
            <VCol 
              cols="12"
              md="12"
              sm="12"
              class="d-flex gap-4"
            >
              <div class="d-flex justify-center">
                <div v-if="showDate" class="layout-default">
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
                class="bg-primary"
                rounded="pill"
                type="submit" 
                :loading="isLoading"
              >
                {{ t('OMD.vote_option.btnGenerateOMD') }}
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
      <Alert style="margin-left: 10px;">
        {{ titleComponentSection2 }}
      </Alert>
      <DataTableServerSide
        ref="datatable"
        endpoint="/grouping-political/omd/candidate"
        table-class="table-bordered"
        :params="requestBodyFilters"
        :fields="fields"
        class="mt-3"
      >
        <VRow justify="center">
          <VCol cols="12" md="10" class="px-12">
            <VCard variant="tonal">
              <h4 class="text-center bold">
                {{ t('candidates.title_table') }}
              </h4>
            </VCard>
          </VCol>
        </VRow>
      </DataTableServerSide>
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
name: "omd-change-vote-option"
meta:
  authRequired: true
</route>
