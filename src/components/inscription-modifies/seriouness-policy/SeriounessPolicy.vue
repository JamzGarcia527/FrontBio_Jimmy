<script setup>
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import { useAppAbility } from '@/plugins/casl/useAppAbility'

const props = defineProps({
  inscriptionId: { type:Number, required:true },
  inscriptionIdE6:{ type:Number, required:true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
  readonly: { type: Boolean, default: false },
})

const { t } = useI18n()
const { can } = useAppAbility()

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

const informationPolicy = async () => {
  axios
    .get(`/v1/inscriptions-policy/inscription/${props.inscriptionIdE6}`)
    .then(({ data }) => {

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

onMounted(async () => {
  await informationPolicy()
})
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div>
          <VRow>
            <VCol 
              cols="12" 
              md="12"
            >
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
      </VCardText>
    </VCard>
  </div>
</template>
