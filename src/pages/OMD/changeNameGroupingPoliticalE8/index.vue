<script setup>
import ChangeVoteFilter from '@/components/OMD/changeNameGroupPoliticalE8Filter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSideReports.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import imageFilter from '@images/pages/change_vote_option.png'
import Swal from "@/plugins/sweetalert2"
import { useVuelidate } from '@vuelidate/core'
import { useGeneralFilter } from "@/stores/generalfilter"
import { helpers } from "@vuelidate/validators"

const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const departmentsFilter = computed(() => {
  const array = generalfilter
    .departments
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const municipalitiesFilter = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

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
const inputFile = ref()

const formDisabled = ref(false)
const { t } = useI18n()
const filters = ref([])
const showDate = ref(false)
const isLoading = ref(false)
const activateButtonSave = ref(true)

const form = ref({ 
  voteOption: null,
  addressGP: null,
  selectGroupingPoliticalTypes: null,
  selectGroupingPoliticalName: null,
  department: null,
  municipality: null,
  email: null,
  emailAlter: null,
  phoneCelular: null,
  phone: null,
  dniInscritorList: null,
  nameInscritorList: null,
})

// Validators
import {
  requiredVuelidate,
  emailVuelidate,
  integerVuelidate,
  maxLengthVuelidate,
} from '@/utils/validators/vuelidate'

const fields = ref([
  { key: "line", label:t('OMD.fields.line').toUpperCase()  },
  { key: "numberDni", label: t('OMD.fields.numberDni').toUpperCase() },
  { key: "firtsName", label: t('OMD.fields.firtsName').toUpperCase() },
  { key: 'secondName',label: t('OMD.fields.secondName').toUpperCase() },
  { key: 'firtsSurName',label: t('OMD.fields.firtsSurName').toUpperCase() },
  { key: "secondSurName", label: t('OMD.fields.secondSurName').toUpperCase() },
  { key: "gender", label: t('OMD.fields.gender').toUpperCase()  },
  { key: "age", label: t('OMD.fields.age').toUpperCase() },
])

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
      .get("grouping-political/info-grouping-political-for-omd", {
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

const titleCard1 = "Información de la Agrupación Política: "


const rules = computed(() => ({ 
  voteOption: { requiredVuelidate },
  addressGP: { requiredVuelidate }, 
  selectGroupingPoliticalTypes: { requiredVuelidate },
  selectGroupingPoliticalName: { requiredVuelidate },
  department: { requiredVuelidate },
  municipality: { requiredVuelidate }, 
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
      t("validations.mobile_or_phone"),
      value => value || form.value.phone,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de celular debe contener 10 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  phone: {
    required: helpers.withMessage(
      t("validations.mobile_or_phone"),
      value => value || form.value.phoneCelular,
    ),
    integerVuelidate,
    length: helpers.withMessage(
      "El número de celular debe contener 7 dígitos",
      value => !value || String(value).length === 10,
    ),
  },
  dniInscritorList: { requiredVuelidate },
  nameInscritorList: { requiredVuelidate },
}))

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const v$ = useVuelidate(rules, form)

// Clear form
const clearForm = () => {
  window.history.back()
  form.value = {}
  v$.value.$reset()
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
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('OMD.change_name_group_political.breadcrumbs'), $t('OMD.change_name_group_political.title') ]" /> 
    <ChangeVoteFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showDate">
      <VCardText>
        <span> {{ titleCard1 }} </span> 
        <VForm ref="refForm" :disabled="formDisabled" class="mt-2" @submit.prevent="setChangeVoteData">
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="form.voteOption"
                clearable
                :label="t('OMD.vote_option.voteOption')"
                :placeholder="t('OMD.vote_option.voteOption')"
                :error-messages="v$.voteOption.$errors[0]?.$message"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model.trim="form.addressGP"
                clearable
                :label="t('OMD.change_name_group_political.addressGPE8')"
                :placeholder="t('OMD.change_name_group_political.addressGPE8')"
                :error-messages="v$.addressGP.$errors[0]?.$message"
              />
            </VCol>
            <VCol cols="12" sm="6" md="6">
              {{ form.department }}
              <VSelect 
                :v-model="form.department"
                :label="t('common.department')"
                :items="departmentsFilter"
                :error-messages="v$.department.$errors[0]?.$message"
                @update:model-value="generalfilter.setDepartment" 
              />
            </VCol>
            <VCol cols="12" sm="6" md="6">
              <VSelect
                :v-model="form.municipality"
                :label="t('common.municipality')"
                :items="municipalitiesFilter"
                :error-messages="v$.municipality.$errors[0]?.$message"
                @update:model-value="generalfilter.setMunicipality"
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
              cols="12"
              class="d-flex gap-4"
            >
              <VBtn type="submit" :loading="isLoading">
                {{ t('OMD.vote_option.btnChangeVoteoption') }}
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
          <VRow>
            <VCol 
              cols="12"
              md="12"
              sm="12"
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
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/inscriptions/progress"
        table-class="table-bordered"
        :params="filters"
        :fields="fields"
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
name: "omd-change-name-grouping-political-e8"
meta:
authRequired: true
</route>
