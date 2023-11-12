<script setup>
import DataView from '@/components/shared/DataView.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import Swal from '@/plugins/sweetalert2'
import { useGeneralFilter } from '@/stores/generalfilter'
import { useInscriptionModify } from '@/stores/inscriptionModify'
import { useI18n } from 'vue-i18n'
import CandidateCard from './components/CandidateCard.vue'
import CandidateChangeRow from './components/CandidateChangeRow.vue'
import CandidateForm from './components/CandidateForm.vue'
import useEventBus from "@/utils/eventBus"
import { useCustomMessage } from "@/composables/useCustomMessage"
import { calculateGenderQuota } from '@/utils/CandidateUtils'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  inscriptionModifyId: { type: Number, required: true },
  readonly: { type: Boolean, default: false },
  genderQuotaOnlyApprove: { type: Boolean, default: false },
})

const { emit: emiting } = useEventBus()
const inscriptionModify = useInscriptionModify()
const generalfilterStore = useGeneralFilter()
const messageComposable = useCustomMessage()
const isLoading = ref(false)
const showChangeRow = ref(false)
const showForm = ref(false)
const form = ref({})

const showMessageNoPreferential = ref(true)
const isPreferentialVote = computed(() => inscriptionModify.isPreferentialVote)

const genders = computed(() => generalfilterStore.genders)
const candidates = computed(() => inscriptionModify.candidates.list.sort((a, b) => a.rowField > b.rowField))
const isReadOnly = computed(() => props.readonly)
const isUninominal = computed(() => inscriptionModify.isUninominal)
const limitCandidate = computed(() => inscriptionModify.candidates.list.length)

const meetsGenderQuota = computed(() => {
  if (inscriptionModify.isUninominal) return true
  if (!candidates.value) return true
  
  return calculateGenderQuota({
    items: candidates.value, 
    genders: genders.value,
    minCandidateQuotaGender: inscriptionModify.minCandidateQuotaGender,
    minPercentageQuotaGender: inscriptionModify.minPercentageQuotaGender,
    limitCandidate: limitCandidate.value,
    onlyApprove: props.genderQuotaOnlyApprove,
  })
})

// const genderNoQuota = computed(() => {
//   const total = candidates.value.length
//   if (total < inscriptionModify.minCandidateQuotaGender) return []
  
//   return genders.value.filter(e => {
//     if (!e.enableQuota) return false
//     const number = inscriptionModify.candidateGenderCounter[e.description] || 0
//     const percentage = (number * 100) / total
    
//     return percentage < inscriptionModify.minPercentageQuotaGender
//   })
// })

const getCandidates = async () => {
  try {
    isLoading.value = true
    await inscriptionModify.getCandidates(props.inscriptionModifyId)
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
            <small class="text-body-2">Número de candidatos: {{ limitCandidate }}</small>
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
          No cumple con la cuota mínima del {{ inscriptionModify.minPercentageQuotaGender }}% del género
        </VAlert>
      </template>
      <div v-if="!isReadOnly" class="text-center mt-4">
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
                :id="item.candidateId"
                :readonly="isReadOnly"
                :is-uninominal="isUninominal"
                @edit="handleFormCandidate"
              />
            </VCol>
          </template>
        </DataView>
      </VCardText>
    </VCard>
  </div>
</template>
