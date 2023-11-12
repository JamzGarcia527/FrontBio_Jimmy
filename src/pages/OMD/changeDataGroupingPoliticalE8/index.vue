<script setup>
import ChangeVoteFilter from '@/components/OMD/changeVoteFilter.vue'
import DataTableServerSide from "@/components/shared/DataTable.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import imageFilter from '@images/pages/modificar_datos_ap.png'
import Swal from "@/plugins/sweetalert2"
import { useVuelidate } from '@vuelidate/core'
import { useGeneralFilter } from "@/composables/useGeneralFilter"
import LocalPhoneField from '@/components/shared/LocalPhoneField.vue'
import { helpers } from "@vuelidate/validators"
import { strPad } from "@/utils"
import backgroundFiles from "@images/pages/upload-files.png"

// Validators
import {
  requiredVuelidate,
  emailVuelidate,
  integerVuelidate, 
  requiredSelectVuelidate, 
} from '@/utils/validators/vuelidate'

const generalfilter = useGeneralFilter()

const formDisabled = ref(false)
const { t } = useI18n()
const filters = ref([])
const showDate = ref(false)
const isLoading = ref(false)
const departments = ref([])
const municipalities = ref([])
const items = ref([])
const itemsFilters = ref([])

// variables para guardar archivo
const file = ref()
const urlimagen = ref(backgroundFiles)
const error = ref(false)
const disabledBttn = ref(true)
const disabledFileInput = ref(false)
const showImagen = ref(false)
const urlPdf = ref()
const activateButtonSave = ref(true)
const inputFile = ref()
const groupingPoliticalType = ref()
const departmentOld = ref(null)
const municipalityOld = ref(-1)

const form = ref({ 
  address: '',
  department: -1,
  municipality: -1,
  email: '',
  emailAlter: '',
  phoneCelular: '',
  phone: null,
  dniInscritorList: '',
  nameInscritorList: '',
})

const fields = ref([
  { key: "dni", label:t('OMD.change_data_group_political.dni').toUpperCase()  },
  { key: "nameFull", label: t('OMD.change_data_group_political.fullName').toUpperCase() },
  { key: "email", label: t('OMD.change_data_group_political.email').toUpperCase() },
  { key: 'celular',label: t('OMD.change_data_group_political.phoneCelular').toUpperCase() },
  { key: 'phone',label: t('OMD.change_data_group_political.localPhone').toUpperCase() },
])

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
      .get("/grouping-political/info-grouping-political-for-omd", {
        params: requestBody,
      })
      .then(response => {
        itemsFilters.value = response.data
       
        
        form.value.department = itemsFilters.value.departmentId
        form.value.municipality = itemsFilters.value.muncipalityId

        departmentOld.value = itemsFilters.value.departmentId
       
        municipalityOld.value = itemsFilters.value.muncipalityId
        

        form.value.address = itemsFilters.value.address
        form.value.email = itemsFilters.value.email
        form.value.emailAlter = itemsFilters.value.alternateEmail
        form.value.phoneCelular = itemsFilters.value.celularphone
        form.value.phone = itemsFilters.value.phone
        form.value.dniInscritorList = itemsFilters.value.dni
        form.value.nameInscritorList = itemsFilters.value.nameRepresentative
        groupingPoliticalType.value = itemsFilters.value.idGroupinPoliticalType        
        getDataMembersCommitte(itemsFilters.value.idGrounpingPolitical)   
        handlerChangeDepartment(itemsFilters.value.departmentId,false,itemsFilters.value.muncipalityId)     
        
        showDate.value = true

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

const getDataMembersCommitte = async id => {
  await axios
    .get(`v1/committe-member/${id}`)
    .then(response => {
      items.value = response.data
    })
}

const titleCard1 = "Información de cabecera del Formulario E8 "
const titleCard2 = "Información de los integrantes del comité de Inscriptores"


const saveFile = async function (e) {
  v$.value.$touch()
  if (v$.value.$invalid) return

  // isLoading.value = true
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
  formData.append('address', requestBody.address)
  formData.append('email', requestBody.email)
  formData.append('emailAlternate', requestBody.emailAlter)
  formData.append('phone', requestBody.phone)
  formData.append('celularPhone', requestBody.phoneCelular)
  formData.append('newDepartmentId', requestBody.department)
  formData.append('newMunicipalityId', requestBody.municipality)
  formData.append('dni', requestBody.dniInscritorList)
  formData.append('name', requestBody.nameInscritorList)

  const response = await axios.post(`/v1/omd/inscription-modifty-e8-omd`, formData, {
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
      reload()
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

const rules = computed(() => ({ 
  address: { requiredVuelidate },
  email: { requiredVuelidate, emailVuelidate },
  emailAlter: {
    requiredVuelidate,
    emailVuelidate,
    diffEmail: helpers.withMessage(
      t("validations.alternative_mail_must_be_different"),
      value => value && value != form.value.email,
    ),
  },
  phoneCelular: {
    required: helpers.withMessage(
      "El número de celular es obligatorio",
      value => value || form.value.phoneCelular,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de celular debe contener 10 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  phone: {
    integerVuelidate,
    length: helpers.withMessage(
      "El número de teléfono fijo debe contener 10 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  dniInscritorList:{ requiredVuelidate },
  nameInscritorList:{ requiredVuelidate },    
  department: { requiredSelectVuelidate },
}))

const v$ = useVuelidate(rules, form)


const handlerChangeDepartment = (value, flag = true,addressMunicipality)  => {
  if (flag) addressMunicipality = null
  if (value == null || value < 0 || addressMunicipality == null || addressMunicipality < 0) {
    generalfilter.getMunicipalitiesFromApi(strPad(value, 2,'0')).then(data => {
      form.value.municipality = -1

      const array = data.map(e => ({ title: e.name, value: Number(e.id) }))
      
      municipalities.value = [{ title: t("common.select_write_option"), value: -1 }, ...array]

    })
  } else {
    generalfilter.getMunicipalitiesFromApi(strPad(value, 2,'0')).then(data => {
      municipalities.value = data.map(e => ({ title: e.name, value: Number(e.id) }))

    })
  }

}

// Clear form
const clearForm = () => {
  reload()
  form.value = {}
  v$.value.$reset()
}

// funciones para guardar archivo

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

const reload = () => {
  window.location.reload()
}


onMounted(() => {
  generalfilter.getDepartmentsFromApi().then(data => {
    departments.value = data.map(e => ({ title: e.name, value: Number(e.id) }))
  })
})
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('OMD.change_data_group_political.breadcrumbs'), $t('OMD.change_data_group_political.title') ]" /> 
    <ChangeVoteFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showDate">
      <VCardText>
        <span> {{ titleCard1 }} </span> 
        <VForm ref="refForm" :disabled="formDisabled" class="mt-2" @submit.prevent="saveFile">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.address"
                clearable
                :label="t('OMD.change_data_group_political.addressGPE8')"
                :placeholder="t('OMD.change_data_group_political.addressGPE8')"
                :error-messages="v$.address.$errors[0]?.$message"
              />
            </VCol>
            <VCol cols="6">
              <VAutocomplete
                v-model="form.department"
                :label="t('common.department')"
                filter-mode="some"
                :items="departments"
                :error-messages="v$.department.$errors[0]?.$message"
                @update:model-value="handlerChangeDepartment"
              />
            </VCol>
            <VCol cols="6">
              <VAutocomplete 
                v-model="form.municipality"
                :label="t('common.municipality')" 
                filter-mode="some"
                :items="municipalities"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.email"
                clearable
                :label="t('OMD.change_data_group_political.emailGP_E8')"
                :placeholder="t('OMD.change_data_group_political.emailGP_E8')"
                :error-messages="v$.email.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.emailAlter"
                clearable
                :label="t('OMD.change_data_group_political.alterEmailGP_E8')"
                :placeholder="t('OMD.change_data_group_political.alterEmailGP_E8')"
                :error-messages="v$.emailAlter.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.phoneCelular"
                clearable
                :label="t('OMD.change_data_group_political.phoneNumber_E8')"
                :placeholder="t('OMD.change_data_group_political.phoneNumber_E8')"
                :error-messages="v$.phoneCelular.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="6" 
              class="v-col-sm-6"
            >
              <LocalPhoneField
                v-model.trim="form.phone"
                :label="t('common.phone')"
                :error-messages="v$.phone.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.dniInscritorList"
                clearable
                :label="t('OMD.change_data_group_political.dniInscritorList')"
                :placeholder="t('OMD.change_data_group_political.dniInscritorList')"
                :error-messages="v$.dniInscritorList.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.trim="form.nameInscritorList"
                clearable
                :label="t('OMD.change_data_group_political.nameInscritorList')"
                :placeholder="t('OMD.change_data_group_political.nameInscritorList')"
                :error-messages="v$.nameInscritorList.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
          
          <VRow>
            <VCol
              class="mt-5"
              cols="12"
              md="12"
            >
              <VCardtext v-if="groupingPoliticalType === 2 || groupingPoliticalType === 3">
                <span> {{ titleCard2 }} </span> 
                <DataTableServerSide
                  :items="items" 
                  :fields="fields" 
                  paginate
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
              </VCardtext>
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
                class="bg-primary"
                rounded="pill"
                type="submit" 
                :loading="isLoading"
              >
                {{ t('OMD.vote_option.btnSaveOMD') }}
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
name: "omd-change-data-grouping-political-e8"
meta:
authRequired: true
</route>
