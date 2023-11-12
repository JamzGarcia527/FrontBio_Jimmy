<script setup>
import axios from '@/plugins/axios'
import { onMounted } from 'vue'
import { useI18n } from "vue-i18n"
import useEventBus from '@/utils/eventBus'
import Swal from '@/plugins/sweetalert2'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
})


//// varibles de pestaña resumen
const movementPolicyName = ref("")
const addressCorrespondence = ref("")
const id = ref("")
const phone = ref("")
const email = ref("")
const landline = ref("")
const alternateEmail = ref("")
const whiteVote = ref("")
const vote = ref("")
const isLoadingData = ref(true)

const { t } = useI18n()
const { bus } = useEventBus()

const informationCandidate = async () => {

  try {
  
    const { data }  = await axios.get(`/grouping-political/inscription-final?inscriptionId=${props.inscriptionId}&groupId=${props.groupingPoliticalTypeId}`)


    movementPolicyName.value = data.name
    addressCorrespondence.value = data.addressMail
    id.value = data.id
    phone.value =  data.phoneCelular
    email.value = data.email
    landline.value = data.phone
    alternateEmail.value = data.emailAlter
    vote.value = data.preferentialVote
    whiteVote.value = data.blankVote
    isLoadingData.value = false
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
   
  }
}

onMounted(async () => {
  await informationCandidate()
})

watch(() => bus.value.get('updateBasicInfo'), () => {
  informationCandidate()
})
</script>

<template>
  <div class="rounded-lg border border-primary">
    <VTable class="pa-5 text-table">
      <tr colspan="2" class="mb-3 text-body-2">
        <td class="mb-5">
          {{ t('tabSummary.movement_policy_name') }}
        </td>
      </tr>
      <tr>
        <td colspan="2" class="font-weight-semibold my-10 ">
          <p>
            {{ movementPolicyName }}
          </p>
        </td> 
      </tr>
      <tr class="text-body-2">
        <td>
          {{ t('preinscription.grouping_political.address') }} 
        </td> 
        <td class="ps-3">
          {{ t("preinscription.grouping_political.vote_option.label") }} 
        </td>
      </tr>
      <tr>
        <td class="font-weight-semibold">
          <p>
            {{ addressCorrespondence }}
          </p>
        </td> 
        <td class="font-weight-semibold ps-3">
          <p v-if="!isUninominal && !isLoadingData">
            {{ vote ? 'Preferente' : 'No Preferente' }}
          </p>
        </td>
      </tr>
      <tr class="text-body-2">
        <td>
          {{ t('auth.email') }}  
        </td> 
        <td class="ps-3">
          {{ t('common.celular_phone') }} 
        </td>
      </tr>
      <tr>
        <td class="font-weight-semibold">
          <p>
            {{ email }}
          </p>
        </td> 
        <td class="font-weight-semibold ps-3">
          <p>
            {{ phone }}
          </p>
        </td>
      </tr>
      <tr class="text-body-2">
        <td>
          {{ t('preinscription.grouping_political.alternative_email') }} 
        </td> 
        <td class="ps-3">
          {{ t("common.phone") }} 
        </td>
      </tr>
      <tr>
        <td class="font-weight-semibold">
          <p>
            {{ alternateEmail }}
          </p>
        </td> 
        <td class="font-weight-semibold ps-3">
          <p>
            {{ landline }}
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <div>
            {{ t("common.blank_vote_promoter") }} 
          </div>
        </td>
      </tr>
      <tr>
        <td class="font-weight-semibold ">
          <p v-if="!isLoadingData">
            {{ whiteVote ? 'SI' : 'NO' }}
          </p>
        </td>
      </tr>
    </VTable>
  </div>
</template>
