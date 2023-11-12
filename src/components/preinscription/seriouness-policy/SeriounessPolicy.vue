<script setup>
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { email, helpers } from "@vuelidate/validators"
import { useAppAbility } from '@/plugins/casl/useAppAbility'

import {
  requiredVuelidate,
  requiredSelectVuelidate,
  integerVuelidate,
} from "@/utils/validators/vuelidate"

const props = defineProps({
  inscriptionId: { type:Number, required:true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
  readonly: { type: Boolean, default: false },
})

const { t } = useI18n()
const { can } = useAppAbility()
const isHidden = ref(true) 
const isHiddenBtnEdit = ref(true)  
const formDisabled = ref()
const isLoading = ref(false)
const dateStartObj = ref('')
const dateEndObj = ref('') 
const isHiddenBtn = ref()
const isHiddenBtnId = ref()
const seriousnessPolicy = ref(1)
const isHiddenInfo = ref(false) 
const fechaElecionParameters = ref(null) 

if(!can('post', 'policy')){
  formDisabled.value = true
}

const form = ref({
  id:'',
  numberPages:'',
  numberSignatures:'',
  policyNumber:'',
  financialInstitution:'',
  protectedValue:'',
  policySeriousness:1,
  dateInitial:'',
  dateFinal:null,
})

const minDateInitial =  computed (() =>  {
  const minDateInitial1 = new Date(fechaElecionParameters.value)
 
  minDateInitial1.setMonth(minDateInitial1.getMonth() - 4)

  return  minDateInitial1.toISOString().split('T')[0]

} )

const maxDateInitial = computed (() =>  {
  const maxDateInitial1 = new Date(fechaElecionParameters.value)

  maxDateInitial1.setMonth(maxDateInitial1.getMonth() + 6)
  
  return  maxDateInitial1.toISOString().split('T')[0]

})

const rules = computed(() =>({
  numberPages: {
   
    integerVuelidate,
    length: helpers.withMessage(
      "Este campo solo permite hasta 15 caracteres",
      value => !value || String(value).length <= 15,
    ),
  },
  numberSignatures: {
   
    integerVuelidate,
    length: helpers.withMessage(
      "Este campo solo permite hasta 15 caracteres",
      value => !value || String(value).length <= 15,
    ),
  },
  policyNumber: {
  
    length: helpers.withMessage(
      "Este campo solo permite hasta 15 caracteres",
      value => !value || String(value).length <= 15,
    ),
  },
  protectedValue: {

    integerVuelidate,
    length: helpers.withMessage(
      "Este campo solo permite hasta 15 caracteres",
      value => !value || String(value).length <= 15,
    ),
  },
 
}))

const v$ = useVuelidate(rules, form)

const informationPolicy = async () => {
  axios
    .get(`/v1/inscriptions-policy/inscription/${props.inscriptionId}`)
    .then(({ data }) => {
      isHiddenBtnEdit.value=false
      isHiddenBtn.value =true

      let {
        id,
        numberPages,
        numberSignatures,
        policyNumber,
        financialInstitution,
        protectedValue,
        policySeriousness,
        dateInitial,
        dateFinal,
      } = data

      if(dateInitial){
        dateInitial = dateInitial.substr(0,10)
      }
      
      if(dateFinal){
        dateFinal = dateFinal.substr(0,10)
      }   

      form.value = {
        id,
        numberPages,
        numberSignatures,
        policyNumber,
        financialInstitution,
        protectedValue,
        policySeriousness,
        dateInitial,
        dateFinal,
      }
    })
    .catch(error => {
      
      if (error.response && error.response.status < 500) {

        isHiddenBtnId.value = error.response.status
        if(isHiddenBtnId.value == 404){
          isHiddenBtn.value =false
        }
        const { message } = error.response.data

      //  Swal.fire({ icon: "warning", text: message })
      }
    })
}

const handlerSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = false

  const {
    id,

    dateFinal,
    dateInitial,

  } = form.value

  const start = dateInitial ? new Date(dateInitial) : null
  const end = dateFinal ? new Date(dateFinal) : null

  if( !start &&  start && end  && start > end ){
    Swal.fire({ icon: 'warning', text: 'La fecha de fin no puede ser inferior a la fecha inicio' })
    
  }else{
 
    if(id){
      
      serionesPulicyUpdate()

    }else{

      serionesPulicyInsert()
      
    }
    
  }
 
}

const serionesPulicyInsert = async () => {

  const {
    id,
    numberPages, 
    numberSignatures,
    policyNumber,
    financialInstitution,
    protectedValue,
    policySeriousness,
    dateFinal,
    dateInitial,

  } = form.value

  if(dateInitial){
    const currentDate = new Date()
    const options = { hour:'2-digit',minute:'2-digit',second:'2-digit' }
    const currentTime = currentDate.toLocaleTimeString([],options)
    const currentTimeOdj = currentTime.substr(0,8)

    dateStartObj.value = dateInitial  +' '+ currentTimeOdj
      
  }else{
    dateStartObj.value = ''
  }

  if(dateFinal){
       
    const currentDate = new Date()
    const options = { hour:'2-digit',minute:'2-digit',second:'2-digit' }
    const currentTime = currentDate.toLocaleTimeString([],options)
    const currentTimeOdjt = currentTime.substr(0,8)

    dateEndObj.value = dateFinal +' '+ currentTimeOdjt
      
  }else{
    dateEndObj.value  = ''
  }

  const requestBody = {
    inscriptionId:props.inscriptionId,
    numberPagesIn: numberPages,
    numberSignaturesIn:numberSignatures,
    policyNumber:policyNumber,
    financialInstitution:financialInstitution,
    protectedValueIn:protectedValue,
    dateInitialIn:dateStartObj.value,
    dateFinalIn:dateEndObj.value,
    policySeriousnessIn:policySeriousness,
  }

  try {
   
    const { data } = await axios.post("/v1/inscriptions-policy", requestBody)
      
    //await Swal.fire({ text: data, icon: "success" })
    await Swal.fire({ text: "Se guardó la información correctamente", icon: "success" })
    handlerReset()
    informationPolicy()

  } catch (error) {
   
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
   
  }

}

const serionesPulicyUpdate = async () => {
  const {
    id,
    numberPages, 
    numberSignatures,
    policyNumber,
    financialInstitution,
    protectedValue,
    policySeriousness,
    dateFinal,
    dateInitial,

  } = form.value

  if(dateInitial){
    const currentDate = new Date()
    const options = { hour:'2-digit',minute:'2-digit',second:'2-digit' }
    const currentTime = currentDate.toLocaleTimeString([],options)
    const currentTimeOdj = currentTime.substr(0,8)

    dateStartObj.value = dateInitial  +' '+ currentTimeOdj
      
  }else{
    dateStartObj.value = ''
  }

  if(dateFinal){
       
    const currentDate = new Date()
    const options = { hour:'2-digit',minute:'2-digit',second:'2-digit' }
    const currentTime = currentDate.toLocaleTimeString([],options)
    const currentTimeOdjt = currentTime.substr(0,8)

    dateEndObj.value = dateFinal +' '+ currentTimeOdjt
      
  }else{
    dateEndObj.value  = ''
  }

  const requestBody = {
    inscriptionId:props.inscriptionId,
    numberPagesIn: numberPages,
    numberSignaturesIn:numberSignatures,
    policyNumber:policyNumber,
    financialInstitution:financialInstitution,
    protectedValueIn:protectedValue,
    dateInitialIn:dateStartObj.value,
    dateFinalIn:dateEndObj.value,
    policySeriousnessIn:policySeriousness,
  }
      
  try {
   
    const { data } = await axios.put(`/v1/inscriptions-policy/${id}`, requestBody)
      
    //await Swal.fire({ text: data, icon: "success" })
    await Swal.fire({ text: "Se actualizó correctamente la información", icon: "success" })
    handlerReset()
    informationPolicy()

  } catch (error) {
   
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
   
  }

}

const openfiels = () => {
  isHidden.value=false
  isHiddenInfo.value=true
}

const handlerReset = () => {
  v$.value.$reset()
  form.value = {}
  seriousnessPolicy.value = 1
  isHidden.value=true
  isHiddenInfo.value=false
  informationPolicy()
}

onMounted(async () => {

  axios
    .get(`/v1/parameter`)
    .then(({ data }) => {

      const fechaElecionParamete = data

      fechaElecionParameters.value = fechaElecionParamete[11].value

    })

  await informationPolicy()
})
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div :hidden="isHiddenInfo">
          <VRow>
            <VCol 
              cols="12" 
              md="12"
            >
              <div class="ps-10" :hidden="isHiddenBtnEdit">
                <VBtn
                  v-if="can('post', 'policy')"
                  @click="openfiels"
                >
                  Editar Póliza de Seriedad
                  <VIcon 
                    class="ps-2"
                    size="27"
                    icon="mdi-pencil-outline"
                  />
                </VBtn>
              </div>
              <div class="ps-10" :hidden="isHiddenBtn">
                <VBtn
                  v-if="can('post', 'policy')"
                  @click="openfiels"
                >
                  <VIcon 
                    size="20"
                    icon="mdi-pencil-outline"
                  />
                  Agregar Póliza de Seriedad
                </VBtn>
              </div>
              <br>
              <VTable class="ps-10 text-table">
                <tr class="mb-3">
                  <td class="mb-5">
                    {{ t('securityPolicy.numberSheets') }}    
                  </td>
                  <td class="ps-3 me-3">
                    {{ t('securityPolicy.numberSignatures') }} 
                  </td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">
                    <p>
                      {{ form.numberPages }}
                    </p>
                  </td>
                  <td class="font-weight-semibold ps-3 ">
                    <p>
                      {{ form.numberSignatures }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    {{ t('securityPolicy.policyNumber') }} 
                  </td> 
                  <td class="ps-3">
                    {{ t('securityPolicy.insuranceCompanyBank') }}
                  </td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">
                    <p>
                      {{ form.policyNumber }}
                    </p>
                  </td> 
                  <td class="font-weight-semibold ps-3">
                    <p>
                      {{ form.financialInstitution }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    {{ t('securityPolicy.valueCovered') }}
                  </td> 
                  <td class="ps-3">
                    {{ t('securityPolicy.seriousnessPolicy') }}
                  </td>
                </tr>
                <tr>
                  <td class="font-weight-semibold">
                    <p>
                      {{ form.protectedValue }}
                    </p>
                  </td> 
                  <td class="font-weight-semibold ps-3">
                    <div v-if="form.id">
                      <p v-if="form.policySeriousness == 1">
                        {{ t('securityPolicy.bankGuarantee') }}
                      </p>
                      <p v-else>
                        {{ t('securityPolicy.insurancePolicy') }}
                      </p>
                    </div>
                  </td>
                </tr>
              </VTable>
              <VCol cols="12" md="5">
                <VTable class="ps-6 text-table">
                  <tr>
                    <td>
                      {{ t('securityPolicy.validityPolicy') }} 
                    </td> 
                  </tr>
                  <tr>
                    <td>
                      <div class="font-weight-semibold">
                        {{ t('securityPolicy.startDate') }}:  {{ form.dateInitial }}
                      </div>
                    </td> 
                  </tr>
                  <tr>
                    <div class="font-weight-semibold">
                      {{ t('securityPolicy.endingDate') }} :  {{ form.dateFinal }}
                    </div>
                  </tr>
                </VTable>
              </VCol>
            </VCol>
          </VRow>
        </div>
        <div :hidden="isHidden">
          <VForm class="mt-5" @submit.prevent="handlerSubmit">
            <VRow>
              <VCol cols="12" md="9">
                <VRow>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="form.numberPages"
                      :label="t('securityPolicy.numberSheets')"
                      :error-messages="v$.numberPages.$errors[0]?.$message"
                      :disabled="formDisabled"
                      @keypress="keyPressOnlyNumber"
                      @paste="pasteOnlyNumber"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="form.numberSignatures"
                      :label="t('securityPolicy.numberSignatures')"
                      :error-messages="v$.numberSignatures.$errors[0]?.$message"
                      :disabled="formDisabled"
                      @keypress="keyPressOnlyNumber"
                      @paste="pasteOnlyNumber"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="form.policyNumber"
                      :label="t('securityPolicy.policyNumber')"
                      :error-messages="v$.policyNumber.$errors[0]?.$message"
                      :disabled="formDisabled"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="form.financialInstitution"
                      :label="t('securityPolicy.insuranceCompanyBank')"
                      :disabled="formDisabled"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="form.protectedValue"
                      :label="t('securityPolicy.valueCovered')"
                      :disabled="formDisabled"
                      :error-messages="v$.protectedValue.$errors[0]?.$message"
                      @keypress="keyPressOnlyNumber"
                      @paste="pasteOnlyNumber"
                    />
                  </VCol>
                  <VCol cols="12" md="6" />
                  <VCol cols="12" md="6">
                    <div>
                      {{ t('securityPolicy.validityPolicy') }}
                    </div>
                    <VTextField
                      v-model="form.dateInitial"
                      type="date"
                      :label="t('securityPolicy.startDate')"
                      :disabled="formDisabled"
                      class="mt-4"
                      :min="minDateInitial"
                    />
                    <VTextField
                      v-model="form.dateFinal"
                      type="date"
                      :label="t('securityPolicy.endingDate')"
                      :disabled="formDisabled"
                      class="mt-5"
                      :max="maxDateInitial"
                      :min="minDateInitial"
                    />
                  </VCol>
                </VRow>
              </VCol>
              <VCol cols="12" md="3">
                <VRadioGroup
                  v-model="form.policySeriousness"
                >
                  <template #label>
                    <div>{{ t('securityPolicy.seriousnessPolicy') }}</div>
                  </template>
                  <VRadio
                    :label="t('securityPolicy.bankGuarantee')" 
                    :value="1"
                    :disabled="formDisabled"
                  />
                  <VRadio
                    :label="
                      t('securityPolicy.insurancePolicy')
                    "
                    :value="2"
                    :disabled="formDisabled"
                  />
                </VRadioGroup>
              </VCol>
            </VRow>
            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                v-if="can('post', 'policy')"
                variant="tonal"
                color="secondary"
                @click="handlerReset"
              >
                {{ t('auth.cancel') }}
              </VBtn>
              <VBtn v-if="can('post', 'policy')" class="notAllowedEmulator" type="submit">
                {{ t('auth.keep') }}
              </VBtn>
            </VCardText>
          </VForm>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
