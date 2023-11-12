<script setup>
import Swal from '@/plugins/sweetalert2'

import SummaryHeader from '@/components/preinscription/SummaryHeader.vue'
import PreinscriptionSummary from '@/components/preinscription/summary/PreinscriptionSummary.vue'
import BasicInfo from '@/components/preinscription/basicinfo/BasicInfo.vue'
import CommitteeMembers from '@/components/shared/CommitteeMembers.vue'
import SeriounessPolicy from '@/components/preinscription/seriouness-policy/SeriounessPolicy.vue'
import CandidateList from '@/components/preinscription/candidates/CandidateList.vue'
import CampaignInfo from '@/components/preinscription/CampaignInfo/CampaignInfo.vue'
import CandidatePhotoList from '@/components/preinscription/candidates/CandidatePhotoList.vue'
import LogoSymbol from '@/components/preinscription/logosymbol/LogoSymbol.vue'
import SupportDocInscription from '@/components/preinscription/support-doc-inscription/SupportDocInscription.vue'
import { useI18n } from 'vue-i18n'
import { useCustomMessage } from "@/composables/useCustomMessage"
import { useRoute } from 'vue-router'
import { useInscription } from '@/stores/inscription'

import CustomError from '@/utils/CustomError'

const inscriptionStore = useInscription()
const route = useRoute()
const inscriptionId = computed(() => Number(route.params.id))
const activeTab = ref(route.query.tab ?? null)
const isLoading = ref(false)
const inscription = ref(null)
const messageComposable = useCustomMessage()
const { t } = useI18n()

const isReadOnly = computed(() => inscriptionStore.isReadonly)
const isReadonlyCommittee = computed(() => inscriptionStore.isReadonlyCommittee)
const isCoalition = computed(() => inscriptionStore.isCoalition)
const isBlankVote = computed(() => inscriptionStore.isBlankVotePromoter)
const isUninominal = computed(() => inscriptionStore.isUninominal)

const availableTabs = computed(() => ([
  { title: 'Resumen', tab: 'summary'  },
  { title: 'Información Básica', tab: 'basic-info' },
  { title: t('availableTabs.MembersRegistrationCommittee'), tab: 'committee-members', hidden: !isReadonlyCommittee.value  },
  { title: 'Póliza de Seriedad', tab: 'seriouness-policy', hidden: !isReadonlyCommittee.value  },
  { title: 'Candidatos Inscritos', tab: 'candidates', hidden: isBlankVote.value  },
  { title: 'Información de la campaña', tab: 'campaign-info', hidden: isBlankVote.value  },
  { title: 'Fotos de Candidatos', tab: 'candidate-photos', hidden: isBlankVote.value },
  { title: 'Logo o Símbolo', tab: 'logosymbol' },
  { title: 'Soportes de Inscripción', tab: 'inscription-docsupports'  },
]))

const getDetailGroupingPolitical = async id => {
  isLoading.value = true
  try {
    const data = await inscriptionStore.getInscription(id)
    if (data.state != 1) {
      const message = t('validations.inscription_incorrect_status', { status: 'no envió de aprobación' })
      throw new CustomError(message, 403)
    }

    inscription.value = data
    await inscriptionStore.getCandidates(id)
  } catch (error) {
    if (error instanceof CustomError) {
      Swal.fire({ icon: 'warning', html: error.message })
    } else if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    } else {
      // TODO: Mensaje parametrizables
      Swal.fire({ 
        icon: 'warning', 
        text: messageComposable.get("MS0014"), 
      })
    }
  }

  isLoading.value = false
}

onMounted(() => {
  getDetailGroupingPolitical(inscriptionId.value)
})
</script>

<template>
  <div>
    <template v-if="isLoading">
      <div 
        class="d-flex justify-center align-center" 
        style="height: 70vh;"
      >
        <VProgressCircular size="60" indeterminate />
      </div>
    </template>
    <template v-else-if="inscription">
      <VCard>
        <div class="v-toolbar__content">
          <SummaryHeader v-bind="inscription" class="my-5" />

          <VSpacer />

          <VBtn 
            variant="text"
            size="small"
            prepend-icon="mdi-arrow-left" 
            class="align-self-start my-2" 
            :to="{ name: 'preinscription-list' }"
          >
            Volver
          </VBtn>
        </div>

        <div class="v-toolbar__extension">
          <VTabs
            v-model="activeTab"
            class="v-tabs-pill"
          >
            <template v-for="(item, index) in availableTabs">
              <VTab v-if="!item.hidden" :key="index" :value="item.tab">
                <VIcon
                  v-if="item.icon"
                  size="20"
                  start
                  :icon="item.icon"
                />
                {{ item.title }}
              </VTab>
            </template>
          </VTabs>
        </div>
      </VCard>

      <VWindow
        v-model="activeTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem value="summary">
          <PreinscriptionSummary 
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :readonly="isReadOnly || isReadonlyCommittee" 
            :radicate-id="inscription.radicateId"
            :is-uninominal="isUninominal"
          />
        </VWindowItem>
        
        <VWindowItem value="basic-info">
          <BasicInfo  
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :readonly="isReadOnly || isReadonlyCommittee"
          />
        </VWindowItem>
        
        <VWindowItem value="committee-members">
          <CommitteeMembers 
            :grouping-political-id="inscription.groupingPoliticalId"
          />
        </VWindowItem>
        
        <VWindowItem value="seriouness-policy">
          <SeriounessPolicy  
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :readonly="isReadOnly"
          />
        </VWindowItem>
        
        <VWindowItem value="candidates">
          <CandidateList 
            :inscription-id="inscriptionId"
            :readonly="isReadOnly || isReadonlyCommittee"
          />
        </VWindowItem>
        
        <VWindowItem value="campaign-info">
          <CampaignInfo
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :is-uninominal="isUninominal"
            :readonly="isReadOnly" 
          />
        </VWindowItem>
        
        <VWindowItem value="candidate-photos">
          <CandidatePhotoList 
            :inscription-id="inscriptionId" 
            :readonly="isReadOnly"
            :is-uninominal="isUninominal"
          />
        </VWindowItem>
        
        <VWindowItem value="logosymbol">
          <LogoSymbol 
            :grouping-political="inscription.groupingPoliticalId" 
            :description="inscription.groupingPoliticalName"
            :readonly="isReadOnly || (isReadonlyCommittee && !isCoalition)"
          />
        </VWindowItem>
        
        <VWindowItem value="inscription-docsupports">
          <SupportDocInscription
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :readonly="isReadOnly"
          />
        </VWindowItem>
      </VWindow>
    </template>
  </div>
</template>

<style lang="scss">
.inscription-header > .v-toolbar__content {
  block-size: inherit !important;
}
</style>

<route lang="yaml">
name: "preinscription-id"
meta:
  authRequired: true
</route>
