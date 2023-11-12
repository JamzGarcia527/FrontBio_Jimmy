<script setup>
import Swal from '@/plugins/sweetalert2'

import SummaryHeader from '@/components/inscription-modifies/SummaryHeader.vue'
import PreinscriptionSummaryApprove from '@/components/inscription-modifies/summary/PreinscriptionSummaryApprove.vue'
import CommitteeMembers from '@/components/shared/CommitteeMembers.vue'
import BasicInfo from '@/components/inscription-modifies/basicinfo/BasicInfo.vue'
import SeriounessPolicy from '@/components/inscription-modifies/seriouness-policy/SeriounessPolicy.vue'
import CandidateList from '@/components/inscription-modifies/candidates/CandidateList.vue'
import CandidatePhotoList from '@/components/inscription-modifies/candidates/CandidatePhotoList.vue'
import LogoSymbol from '@/components/inscription-modifies/logosymbol/LogoSymbol.vue'
import SupportDocInscription from '@/components/inscription-modifies/support-doc-inscription/SupportDocInscription.vue'
import CampaignInfo from '@/components/inscription-modifies/CampaignInfo/CampaignInfo.vue'
import DocumentsApproved from '@/components/inscription-modifies/documents-approved/DocumentsApproved.vue'
import { useI18n } from 'vue-i18n'
import { useCustomMessage } from "@/composables/useCustomMessage"
import { useRoute } from 'vue-router'
import { useInscriptionModify  } from '@/stores/inscriptionModify'
import { useAppAbility } from '@/plugins/casl/useAppAbility'


const { can } = useAppAbility()

const inscriptionModifyStore = useInscriptionModify()
const route = useRoute()
const inscriptionModifyId = computed(() => Number(route.params.id))
const activeTab = ref(route.query.tab ?? null)
const isLoading = ref(false)
const inscription = ref(null)
const { t } = useI18n()
const messageComposable = useCustomMessage()
const isReadOnly = computed(() => inscriptionModifyStore.isReadOnly)
const isReadonlyCommittee = computed(() => inscriptionModifyStore.isReadonlyCommittee)
const isExtemporaneous = computed(() => inscriptionModifyStore.isExtemporaneous)
const isBlankVote = computed(() => inscriptionModifyStore.isBlankVotePromoter)
const isUninominal = computed(() => inscriptionModifyStore.isUninominal)
const canUploadPhoto = computed(() => can('post-force', 'file-candidate') || inscriptionModifyStore.canUploadPhoto)

const routeNamePendingInscriptions = computed(() => isExtemporaneous.value  
  ? 'inscription-modifies-extemporaneous-approved-list' : 'inscription-modifies-approved-list')

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
  { title: 'Documentos Generados', tab: 'documents-approved'  },
]))

const readonlySupportDocs = computed(() =>  !can('post', 'file-inscriptions-doc'))

const getDetailGroupingPolitical = id => {
  isLoading.value = true
  inscriptionModifyStore
    .getInscription(id)
    .then(data => inscription.value = data)
    .catch(error => {
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: 'warning', text: message })
      } else {
        // TODO: Mensaje parametrizables
        Swal.fire({ 
          icon: 'warning', 
          text: messageComposable.get("MS0014"), 
        })
      }
    }).finally(() => isLoading.value = false)
}

onMounted(() => {
  getDetailGroupingPolitical(inscriptionModifyId.value)
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
            :to="{ name: routeNamePendingInscriptions }"
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
            :inscription-id="inscriptionModifyId"
            :inscription-id-e6="inscription.inscriptionId" 
            :radicate="inscription.inscriptionChangeRadicateId"
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            readonly 
            :is-uninominal="isUninominal"
          />
        </VWindowItem>
        
        <VWindowItem value="basic-info">
          <BasicInfo  
            :inscription-id="inscriptionModifyId" 
            :inscription-id-e6="inscription.inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            readonly
          />
        </VWindowItem>
        
        <VWindowItem value="committee-members">
          <CommitteeMembers 
            :grouping-political-id="inscription.groupingPoliticalId"
          />
        </VWindowItem>
        
        <VWindowItem value="seriouness-policy">
          <SeriounessPolicy  
            :inscription-id="inscriptionModifyId"
            :inscription-id-e6="inscription.inscriptionId"  
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            readonly
          />
        </VWindowItem>
        
        <VWindowItem value="candidates">
          <CandidateList 
            :inscription-id="inscription.inscriptionId"
            :inscription-modify-id="inscriptionModifyId"
            gender-quota-only-approve
            readonly
          />
        </VWindowItem>
        
        <VWindowItem value="campaign-info">
          <CampaignInfo
            :inscription-id="inscriptionModifyId"
            :inscription-id-e6="inscription.inscriptionId"  
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :is-uninominal="isUninominal"
            :readonly="isReadOnly"
          />
        </VWindowItem>
        
        <VWindowItem value="candidate-photos">
          <CandidatePhotoList
            :inscription-id="inscription.inscriptionId"
            :inscription-modify-id="inscriptionModifyId"
            :is-uninominal="isUninominal"
            :readonly="!canUploadPhoto"
          />
        </VWindowItem>
        
        <VWindowItem value="logosymbol">
          <LogoSymbol 
            :grouping-political="inscription.groupingPoliticalId" 
            :description="inscription.groupingPoliticalName"
            readonly
          />
        </VWindowItem>
        
        <VWindowItem value="inscription-docsupports">
          <SupportDocInscription
            :inscription-id="inscriptionModifyId" 
            :inscription-id-e6="inscription.inscriptionId"
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            enable-folio
            is-approved
            :readonly="readonlySupportDocs"
          />
        </vwindowitem>
        <VWindowItem value="documents-approved">
          <DocumentsApproved
            :inscription-id="inscriptionModifyId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            readonly
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
name: "inscription-modifies-approved-id"
meta:
  authRequired: true
</route>
