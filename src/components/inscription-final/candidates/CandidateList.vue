<script setup>
import DataView from '@/components/shared/DataView.vue'
import { useGeneralFilter } from '@/stores/generalfilter'
import { useInscriptionFinal } from '@/stores/inscriptionFinal'
import { useI18n } from 'vue-i18n'
import CandidateCard from './components/CandidateCard.vue'

const props = defineProps({
  readonly: { type: Boolean, default: false },
})


const inscriptionFinal = useInscriptionFinal()
const generalfilterStore = useGeneralFilter()

const genders = computed(() => generalfilterStore.genders)
const candidates = computed(() => inscriptionFinal.candidates.list.sort((a, b) => a.rowField > b.rowField))
const limitCandidate = computed(() => inscriptionFinal.candidates.list.length)

const genderNoQuota = computed(() => {
  const total = candidates.value.length
  if (total < inscriptionFinal.minCandidateQuotaGender) return []
  
  return genders.value.filter(e => {
    if (!e.enableQuota) return false
    const number = inscriptionFinal.candidateGenderCounter[e.description] || 0
    const percentage = (number * 100) / total
    
    return percentage < inscriptionFinal.minPercentageQuotaGender
  })
})

const staticAlert = 'La Registraduría Nacional del Estado Civil, no se responsabilizará por cualquier consecuencia derivada de la postulación de integrantes de los comités inscriptores y/o candidatos, esta facultad es exclusiva de las agrupaciones políticas'

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
      <template v-if="genderNoQuota.length > 0">
        <VAlert 
          type="warning" 
          variant="tonal"
          class="text-body-2 mb-2"
          rounded="0"
        >
          No cumple con la cuota mínima del {{ inscriptionFinal.minPercentageQuotaGender }}% del género
        </VAlert>
      </template>
      <VCardText>
        <DataView 
          :items="candidates" 
          :empty-text="t('candidates.empty_preregistred_list')"
          paginate
          :size="9"
        >
          <template #default="item">
            <VCol cols="12" sm="6" xl="4">
              <CandidateCard 
                v-bind="item" 
                :inscription-id="inscriptionFinal.information.id"
                :approve-status="item.stateId"
                readonly
              />
            </VCol>
          </template>
        </DataView>
      </VCardText>
    </VCard>
  </div>
</template>
