<script setup>
import SummaryHeader from '@/components/preinscription/SummaryHeader.vue'
import PreinscriptionSummaryApprove from '@/components/inscription-final/summary/PreinscriptionSummaryApprove.vue'
import CommitteeMembers from '@/components/shared/CommitteeMembers.vue'
import CandidateList from '@/components/inscription-final/candidates/CandidateList.vue'
import CampaignInfo from '@/components/inscription-final/CampaignInfo/CampaignInfo.vue'
import CandidatePhotoList from '@/components/inscription-final/candidates/CandidatePhotoList.vue'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'

import { useRoute, useRouter } from 'vue-router'
import { useInscriptionFinal } from '@/stores/inscriptionFinal'

const { getInscription, setCandidates, setCommitteeMembers, setRadicate } = useInscriptionFinal()

const inscriptionStore = useInscriptionFinal()
const route = useRoute()
const router = useRouter()

const inscriptionId = computed(() => Number(route.params.id))
const activeTab = ref(route.query.tab ?? null)
const inscription = ref(null)
const { t } = useI18n()

const getData = async inscriptionId => {
  
  await getInscription(inscriptionId)

  const { data } = await axios.get(`/v1/inscription-final/generated`, { params: { inscriptionId: inscriptionId } })

  setCandidates(data.candidates)
  setCommitteeMembers(data.committeeMembers)
  setRadicate(data.headerPreview.radicate)
}


const isReadonly = computed(() => inscriptionStore.isReadonly)
const isReadonlyCommittee = computed(() => inscriptionStore.isReadonlyCommittee)
const isBlankVote = computed(() => inscriptionStore.isBlankVotePromoter)
const isUninominal = computed(() => inscriptionStore.isUninominal)
const canUploadPhoto = computed(() => can('post-force', 'file-candidate') || inscriptionStore.canUploadPhoto)

const availableTabs = computed(() => ([
  { title: 'Resumen', tab: 'summary'  },
  { title: t('availableTabs.MembersRegistrationCommittee'), tab: 'committee-members', hidden: !isReadonlyCommittee.value  },
  { title: 'Candidatos Inscritos', tab: 'candidates', hidden: isBlankVote.value  },
  { title: 'Información de la campaña', tab: 'campaign-info', hidden: isBlankVote.value  },
  { title: 'Fotos de Candidatos', tab: 'candidate-photos', hidden: isBlankVote.value },
]))

onBeforeMount(async () => {
  await getData(route.params.id)
  inscription.value = inscriptionStore.information
})
</script>

<template>
  <div>
    <template v-if="inscription">
      <VCard>
        <div class="v-toolbar__content">
          <SummaryHeader v-bind="inscription" class="my-5" />

          <VSpacer />

          <VBtn 
            variant="text"
            size="small"
            prepend-icon="mdi-arrow-left" 
            class="align-self-start my-2" 
            :to="{ name: 'inscription-final-list' }"
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
          <PreinscriptionSummaryApprove 
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :is-uninominal="isUninominal"
            readonly
          />
        </VWindowItem>
        
        <VWindowItem value="committee-members">
          <CommitteeMembers 
            :grouping-political-id="inscription.groupingPoliticalId"
          />
        </VWindowItem>
        
        <VWindowItem value="candidates">
          <CandidateList readonly />
        </VWindowItem>
        
        <VWindowItem value="campaign-info">
          <CampaignInfo
            :inscription-id="inscriptionId"
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :is-uninominal="isUninominal"
            :readonly="isReadonly"
          /> 
        </VWindowItem>
        
        <VWindowItem value="candidate-photos">
          <CandidatePhotoList :readonly="!canUploadPhoto" />
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
name: "inscription-final-approved-e8"
meta:
  authRequired: true
</route>
