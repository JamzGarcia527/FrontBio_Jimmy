<script setup>
import DataView from '@/components/shared/DataView.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import Swal from '@/plugins/sweetalert2'
import { useGeneralFilter } from '@/stores/generalfilter'
import { useInscription } from '@/stores/inscription'
import { useI18n } from 'vue-i18n'
import CandidateCard from './components/CandidateCard.vue'
import CandidateChangeRow from './components/CandidateChangeRow.vue'
import CandidateForm from './components/CandidateForm.vue'
import CandidateUpload from './components/CandidateUpload.vue'
import useEventBus from "@/utils/eventBus"
import { useCustomMessage } from "@/composables/useCustomMessage"

import { calculateGenderQuota } from "@/utils/CandidateUtils"

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  readonly: { type: Boolean, default: false },
  genderQuotaOnlyApprove: { type: Boolean, default: false },
})

const { emit: emiting } = useEventBus()
const inscription = useInscription()
const generalfilterStore = useGeneralFilter()
const messageComposable = useCustomMessage()
const isLoading = ref(false)
const showChangeRow = ref(false)
const showUploadCandidate = ref(false)
const showForm = ref(false)
const form = ref({})

const showMessageNoPreferential = ref(true)
const isPreferentialVote = computed(() => inscription.isPreferentialVote)

const genders = computed(() => generalfilterStore.genders)
const candidates = computed(() => inscription.candidates.list.sort((a, b) => a.rowField > b.rowField))
const isReadOnly = computed(() => props.readonly) // || inscription.isReadonly
const isUninominal = computed(() => inscription.isUninominal)
const limitCandidate = computed(() => inscription.limitCandidate)
const allowedAddCandidate = computed(() => inscription.allowedAddCandidate)

const meetsGenderQuota = computed(() => {
  if (inscription.isUninominal) return true
  if (!candidates.value) return true
  
  return calculateGenderQuota({
    items: candidates.value, 
    genders: genders.value,
    minCandidateQuotaGender: inscription.minCandidateQuotaGender,
    minPercentageQuotaGender: inscription.minPercentageQuotaGender,
    limitCandidate: limitCandidate.value,
    onlyApprove: props.genderQuotaOnlyApprove,
  })
})

// const genderNoQuota = computed(() => {
//   const total = candidates.value.length
//   if (total < inscription.minCandidateQuotaGender) return []
  
//   return genders.value.filter(e => {
//     if (!e.enableQuota) return false
//     const number = inscription.candidateGenderCounter[e.description] || 0
//     const percentage = (number * 100) / total
    
//     return percentage < inscription.minPercentageQuotaGender
//   })
// })

const getCandidates = async () => {
  try {
    isLoading.value = true
    await inscription.getCandidates(props.inscriptionId)
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  } finally {
    isLoading.value = false
  }
}

const handleFormCandidate = async payload => {

  if (!isPreferentialVote.value && showMessageNoPreferential.value) {
    showMessageNoPreferential.value = false
    await Swal.fire({
      text: messageComposable.get("MS0013"),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      confirmButtonText: "Continuar",
      icon: "info",
    })
  }

  form.value = payload
  showForm.value = true
}

const handlerDeleteCandidate = payload => {
  Swal.fire({
    text: `¿Está seguro que desea eliminar al candidato ${payload.firstname} ${payload.firstsurname}?`,
    icon: "question",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await inscription.removeCandidate(payload.id)
        Swal.fire({ title:messageComposable.get("MS0006"), icon:"success" })
        emiting('updateCandidate', true)
        
        return true
      } catch (error) {
        let message = messageComposable.get("MS0009")
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

onMounted(() => {
  getCandidates()
})

const staticAlert = messageComposable.get("MS0005")
const { can } = useAppAbility()
const { t } = useI18n()
</script>

<template>
  <div>
    <VCard>
      <VCardItem class="pb-2">
        <VCardTitle class="d-flex">
          <div class="line-height">
            {{ t('candidates.page_title') }} <br>
            <small class="text-body-2">Máximo candidatos: {{ limitCandidate }}</small>
          </div>
        </VCardTitle>
      </VCardItem>
      <VAlert 
        type="warning" 
        variant="tonal" 
        :text="staticAlert" 
        class="text-body-2 mb-0"
        rounded="0" 
      />
      <template v-if="!meetsGenderQuota">
        <VAlert 
          type="warning" 
          variant="tonal"
          class="text-body-2 mb-2"
          rounded="0"
        >
          No cumple con la cuota mínima del {{ inscription.minPercentageQuotaGender }}% del género
        </VAlert>
      </template>
      <div v-if="!isReadOnly" class="text-center mt-4">
        <VBtn 
          v-if="allowedAddCandidate && can('create', 'candidate')"
          prepend-icon="tabler-circle-plus" 
          class="mx-1" color="primary" 
          @click="() => handleFormCandidate({})"
        >
          {{ t('candidates.add_candidate') }}
        </VBtn>
        <VBtn 
          v-if="allowedAddCandidate && !isUninominal && can('create', 'candidate')"
          prepend-icon="tabler-upload" 
          class="mx-1" color="primary"
          @click="() => showUploadCandidate = true"
        >
          {{ t('candidates.upload_candidate') }}
        </VBtn>
        <VBtn 
          v-if="!isUninominal && limitCandidate > 1 && can('update', 'candidate')"
          prepend-icon="tabler-arrows-sort" 
          class="mx-1" color="primary"
          @click="() => showChangeRow = true"
        >
          {{ t('candidates.exchange_candidate') }}
        </VBtn>
      </div>
      <VCardText>
        <CandidateChangeRow v-model="showChangeRow" />
        <CandidateUpload v-model="showUploadCandidate" />
        <CandidateForm v-model="showForm" :data="form" />
        <DataView 
          :items="candidates" 
          :loading="isLoading" 
          :empty-text="t('candidates.empty_preregistred_list')"
          paginate
          :size="9"
        >
          <template #default="item">
            <VCol cols="12" sm="6" xl="4">
              <CandidateCard 
                v-bind="item" 
                :readonly="isReadOnly"
                :uninominal="isUninominal"
                @edit="handleFormCandidate" 
                @delete="handlerDeleteCandidate"
              />
            </VCol>
          </template>
        </DataView>
      </VCardText>
    </VCard>
  </div>
</template>
