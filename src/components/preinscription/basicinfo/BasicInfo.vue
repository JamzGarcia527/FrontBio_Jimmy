
<script setup>
import LocalPhoneField from "@/components/shared/LocalPhoneField.vue"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import imageLogo from '@images/pages/fondoContrasena.png'
import { useI18n } from "vue-i18n"
import { useGeneralFilter } from "@/composables/useGeneralFilter"
import { useVuelidate } from "@vuelidate/core"
import { email, helpers } from "@vuelidate/validators"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import useEventBus from "@/utils/eventBus"
import { strPad } from "@/utils"
import {
  requiredVuelidate,
  requiredSelectVuelidate,
  integerVuelidate,
  emailVuelidate,
  maxLengthVuelidate,
} from "@/utils/validators/vuelidate"
import { useCustomMessage } from "@/composables/useCustomMessage"
import AniFinderField from "@/components/shared/AniFinderField.vue"

const props = defineProps({
  inscriptionId: { type:Number, required:true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
  readonly: { type: Boolean, default: false },
})

const { can } = useAppAbility()

const { t } = useI18n()
const { emit: emiting } = useEventBus()
const messageComposable = useCustomMessage()
const formDisabled = ref(true)
const isDialogVisible = ref(false)
const isLoading = ref(false)
const indicative = ref('')
const indicativetel = ref('')
const indicativephone = ref('')  
const teLindicative = ref('')

const form = ref({
  groupName:'',
  addressMail:null,
  contactdni:null,
  contactname:'',
  department:'',
  email:'',
  emailAlter:'',
  phoneCelular:null,
  phone:null,
  preferentialVote:0,
  addressMunicipality:'',
  blankVote:-1,
  addressDepartment:-1,
})

const rules = computed(() =>({
  addressMail: { requiredVuelidate },
  addressDepartment: { requiredSelectVuelidate },
  addressMunicipality: { requiredSelectVuelidate },
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
  contactdni: { requiredVuelidate, maxLength: maxLengthVuelidate(12) },
  contactname: { requiredVuelidate },
}))

const generalfilter = useGeneralFilter()

const departments = ref([])

const municipalities = ref([])

const handlerChangeDepartment = (value, flag = true,addressMunicipality)  => {
  if (flag) addressMunicipality = null
  if (value == null || value < 0 || addressMunicipality == null || addressMunicipality < 0) {
    generalfilter.getMunicipalitiesFromApi(strPad(value, 2,'0')).then(data => {
      const array = data.map(e => ({ title: e.name, value: Number(e.id) }))

      municipalities.value = [{ title: t("common.select_write_option"), value: -1 }, ...array]
    })
    
  } else {
    generalfilter.getMunicipalitiesFromApi(strPad(value, 2,'0')).then(data => {
      municipalities.value = data.map(e => ({ title: e.name, value: Number(e.id) }))
    })
  }
} 

const informationCandidate =  () => {
  axios
    .get(`/v1/inscriptions/${props.inscriptionId}/basic`)
    .then(({ data }) => {
      const {
        id,
        groupName,
        addressMail,
        contactdni,
        contactname,
        departmentName,
        municipalityName,
        email,
        emailAlter,
        phoneCelular,
        phone,
        preferentialVote,
        municipality,
        blankVote,
        addressDepartment,
        addressMunicipality,
        corporationType,
        department,
      } = data

      handlerChangeDepartment(addressDepartment,false,addressMunicipality)

      if(phone){
        indicativetel.value = phone
        indicativephone.value = indicativetel.value.slice(3)

        teLindicative.value = phone
        indicative.value = teLindicative.value.substring(0,3)
      }

      form.value = {
        id,
        groupName,
        addressMail,
        contactdni,
        contactname,
        departmentName,
        municipalityName,
        email,
        emailAlter,
        phoneCelular,
        phone,
        preferentialVote,
        municipality,
        blankVote,
        addressDepartment,
        addressMunicipality,
        corporationType,
        department,
      }
    }).catch(error => {
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: "warning", text: message })
      }
    })
}

const openDialog =  () => {
  isDialogVisible.value = true 
}

onMounted(async () => {
  await informationCandidate()
})

const v$ = useVuelidate(rules, form)

const handlerAniFound = ani => {
  let fullName = ""
  if (ani) {
    const {
      first_name = "",
      second_name = "",
      first_surname = "",
      second_surname = "",
    } = ani

    fullName = `${first_name} ${second_name} ${first_surname} ${second_surname}`
  }
  form.value.contactname = fullName
}

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return  

  const {
    id,
    addressMail,
    contactdni,
    contactname,
    email,
    emailAlter,
    phoneCelular,
    phone,
    addressDepartment,
    addressMunicipality,
    corporationType,
  } = form.value

  let{
    preferentialVote,
  }=form.value

  if(corporationType == 'MA'){
    preferentialVote =  1

  }  

  const requestBody = {
    id: id,
    preferentialVote:preferentialVote,
    addressMail:addressMail,
    department:addressDepartment,
    municipality:addressMunicipality,
    email:email,
    emailAlter:emailAlter,
    phone:phone,
    phoneCelular:phoneCelular,
    contactDni:contactdni,
    contactName:contactname,
  }  

  try {
   
    const { data } = await axios.put("v1/inscriptions/update", requestBody)
   
    isDialogVisible.value = false  

    //await Swal.fire({ text: data, icon: "success" })
    await Swal.fire({ text: messageComposable.get("MS0027"), icon: "success" })

    isLoading.value = false
    informationCandidate()
    emiting('updateBasicInfo', true)

    //location.reload()
  } catch (error) {
    isDialogVisible.value = false
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
    isDialogVisible.value = true 
    informationCandidate()
  }

}

const canceldata =  () => {
  v$.value.$reset()
  isLoading.value = false
  isDialogVisible.value = false
  informationCandidate()
}

onMounted(() => {
  generalfilter.getDepartmentsFromApi().then(data => {
    departments.value = data.map(e => ({ title: e.name, value: Number(e.id) }))
  })
})
</script>


<template>
  <div>
    <div>
      <VCard>
        <VCardText>
          <VForm class="mt-5">
            <VRow>
              <VCol 
                cols="12" 
                md="12"
              >
                <div class="ps-10">
                  <VBtn
                    v-if="!readonly && can('update', 'inscription')"
                    @click="openDialog"
                  >
                    {{ t('basicInfo.editBasic') }} 
                    <VIcon 
                      class="ps-2"
                      size="25"
                      icon="mdi-pencil-outline"
                    />
                  </VBtn>
                </div>
                <br>
                <VTable class="ps-10 text-table">
                  <tr class="mb-3">
                    <td class="mb-5">
                      {{ t('basicInfo.enrollList') }}    
                    </td>
                    <td class="ps-3 me-3">
                      {{ t('tabSummary.movement_policy') }} 
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">
                      <p>
                        {{ form.contactname }}
                      </p>
                    </td>
                    <td class="font-weight-semibold ps-3 ">
                      <p>
                        {{ form.groupName }}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {{ t('preinscription.grouping_political.address') }} 
                    </td> 
                    <td class="ps-3">
                      {{ t('common.department') }}
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">
                      <p>
                        {{ form.addressMail }}
                      </p>
                    </td> 
                    <td class="font-weight-semibold ps-3">
                      <p>
                        {{ form.departmentName }}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {{ t('common.municipality') }}
                    </td> 
                    <td class="ps-3">
                      {{ t('auth.email') }}
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">
                      <p>
                        {{ form.municipalityName }}
                      </p>
                    </td> 
                    <td class="font-weight-semibold ps-3">
                      <p>
                        {{ form.email }}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {{ t('preinscription.grouping_political.alternative_email') }} 
                    </td> 
                    <td class="ps-3">
                      {{ t('basicInfo.celularPhone') }} 
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold">
                      <p>
                        {{ form.emailAlter }}
                      </p>
                    </td> 
                    <td class="font-weight-semibold ps-3">
                      <p>
                        {{ form.phoneCelular }}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td class="">
                      {{ t('common.phone') }} 
                    </td>
                    <td class=" ps-3">
                      <div v-if="form.corporationType == 'CR' && form.blankVote == 0">
                        {{ t("preinscription.grouping_political.vote_option.label") }} 
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="font-weight-semibold ">
                      <p>
                        {{ form.phone }}
                      </p>
                    </td>
                    <td class="">
                      <p v-if="form.corporationType == 'CR' && form.blankVote == 0" class="font-weight-semibold ps-3"> 
                        {{ form.preferentialVote ? 'Preferente' : 'No Preferente' }}
                      </p>
                    </td>
                  </tr>
                  <tr />
                </VTable>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
      <VDialog
        v-model="isDialogVisible"
        max-width="600"
        persistent
      >
        <!-- Dialog close btn -->
        <DialogCloseBtn @click="canceldata" />

        <!-- Dialog Content -->
        <VCard>
          <VForm @submit.prevent="handlerSubmit">
            <VImg
              :src="imageLogo"
              cover
            />
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VListItemTitle class="d-flex justify-center">
                    {{ t('basicInfo.editBasic') }} 
                  </VListItemTitle>
                </VCol>
                <VRow v-if="form.corporationType == 'CR' && form.blankVote == 0">
                  <VCol cols="12">
                    <VRadioGroup
                      v-model="form.preferentialVote"
                      class="radiobutton__label-inline"
                      inline
                    >
                      <VRadio
                        :label="t('preinscription.grouping_political.vote_option.preferent')"
                        :value="1"
                      />
                      <VRadio
                        :label="t('preinscription.grouping_political.vote_option.unpreferent')"
                        :value="0"
                      />
                    </VRadioGroup>
                  </VCol>
                </VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="form.groupName"
                    :label=" t('candidates.grouping_political_name') "
                    :disabled="formDisabled"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model.trim="form.addressMail"
                    :label=" t('preinscription.grouping_political.address') "
                    :error-messages="v$.addressMail.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12">
                  <VAutocomplete
                    v-model="form.addressDepartment"
                    :label="t('common.department')"
                    filter-mode="some"
                    :items="departments"
                    :error-messages="v$.addressDepartment.$errors[0]?.$message"
                    @update:model-value="handlerChangeDepartment"
                  />
                </VCol>
                <VCol cols="12">
                  <VAutocomplete 
                    v-model="form.addressMunicipality"
                    :label="t('common.municipality')" 
                    filter-mode="some"
                    :items="municipalities"
                    :error-messages="v$.addressMunicipality.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model.trim="form.email"
                    :label=" t('auth.email')"
                    :error-messages="v$.email.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model.trim="form.emailAlter"
                    :label=" t('preinscription.grouping_political.alternative_email') "
                    :error-messages="v$.emailAlter.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="form.phoneCelular"
                    :label="t('basicInfo.celularPhone')"
                    :error-messages="v$.phoneCelular.$errors[0]?.$message"
                    @keypress="keyPressOnlyNumber"
                    @paste="pasteOnlyNumber"
                  />
                </VCol>
                <VCol cols="12">
                  <LocalPhoneField
                    v-model.trim="form.phone"
                    :label="t('common.phone')"
                    :error-messages="v$.phone.$errors[0]?.$message"
                  />
                </VCol>
                <VCol cols="12">
                  <AniFinderField
                    v-model.trim="form.contactdni"
                    :label="t('basicInfo.enrollList_dni')"
                    :error-messages="v$.contactdni.$errors[0]?.$message"
                    @found="handlerAniFound"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model.trim="form.contactname"
                    :label=" t('basicInfo.enrollList')" 
                    :error-messages="v$.contactname.$errors[0]?.$message"
                    readonly                  
                  />
                </VCol>
              </VRow>
            </VCardText>

            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                v-if="can('update', 'inscription')"
                variant="tonal"
                color="secondary"
                @click="canceldata"
              >
                {{ t('auth.cancel') }}
              </VBtn>
              <VBtn v-if="can('update', 'inscription')" type="submit" class="notAllowedEmulator" :loading="isLoading">
                {{ t('auth.keep') }}
              </VBtn>
            </VCardText>
          </VForm>
        </VCard>
      </VDialog>
    </div>
  </div>
</template>

