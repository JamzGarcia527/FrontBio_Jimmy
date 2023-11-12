<script setup>
import Swal from '@/plugins/sweetalert2'
import axios from "@/plugins/axios"
import SummaryHeader from '@/components/preinscription/SummaryHeader.vue'
import PreinscriptionSummaryPending from '@/components/preinscription/summary/PreinscriptionSummaryPending.vue'
import BasicInfo from '@/components/preinscription/basicinfo/BasicInfo.vue'
import CommitteeMembers from '@/components/shared/CommitteeMembers.vue'
import SeriounessPolicy from '@/components/preinscription/seriouness-policy/SeriounessPolicy.vue'
import CandidateList from '@/components/preinscription/candidates/CandidateList.vue'
import CampaignInfo from '@/components/preinscription/CampaignInfo/CampaignInfo.vue'
import CandidatePhotoList from '@/components/preinscription/candidates/CandidatePhotoList.vue'
import LogoSymbol from '@/components/preinscription/logosymbol/LogoSymbol.vue'
import SupportDocInscription from '@/components/preinscription/support-doc-inscription/SupportDocInscription.vue'

import { useRoute } from 'vue-router'
import { useInscription } from '@/stores/inscription'
import { useUserConfigStore } from '@/stores/userconfig'

import CustomError from '@/utils/CustomError'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const inscriptionStore = useInscription()
const route = useRoute()
const userConfig = useUserConfigStore()

const inscriptionId = computed(() => Number(route.params.id))
const activeTab = computed(() => route.params.tab)
const isLoading = ref(false)
const inscription = ref(null)
const listElectoralApproved = ref([])
const isApproved = computed(() => listElectoralApproved.value.includes(userConfig.userData.id))

const isReadonlyCommittee = computed(() => inscriptionStore.isReadonlyCommittee)
const isReadOnly = computed(() => inscriptionStore.isReadonly)
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
    if (data.state != 3) {
      const message = t('validations.inscription_incorrect_status', { status: 'envió de aprobación' })
      throw new CustomError(message, 403)
    }
    
    await inscriptionStore.getCandidates(id)
    inscription.value = data
  } catch (error) {
    if (error instanceof CustomError) {
      Swal.fire({ icon: 'warning', html: error.message })
    } else if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', html: message })
    } else {
      // TODO: Mensaje parametrizables
      Swal.fire({ 
        icon: 'warning', 
        text: "Lo sentimos, no es posible acceder a este recurso, por favor contacte a la mesa de ayuda.", 
      })
    }
  }

  isLoading.value = false
}

const getListApproved = async id => {
  const { data } = await axios.get(`v1/user/list-approved/electoral-auth?id=${id}`)

  listElectoralApproved.value = data
}

onBeforeMount(() => {
  getListApproved(inscriptionId.value)
})

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
            :to="{ name: 'preinscription-pending' }"
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
              <VTab 
                v-if="!item.hidden" 
                :key="index" 
                :value="item.tab"
                :to="{ name: 'preinscription-pending-id', params: { id: Number($route.params.id), tab: item.tab } }"
              >
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
          <PreinscriptionSummaryPending
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :readonly="isReadOnly"
            :is-uninominal="isUninominal"
          />
        </VWindowItem>

        <VWindowItem value="basic-info">
          <BasicInfo  
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :readonly="isReadonlyCommittee"
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
            readonly
          />
        </VWindowItem>
        
        <VWindowItem value="candidates">
          <CandidateList 
            :inscription-id="inscriptionId"
            :readonly="isReadonlyCommittee"
            gender-quota-only-approve
          />
        </VWindowItem>

        <VWindowItem value="campaign-info">
          <CampaignInfo
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :is-uninominal="isUninominal"
          />
        </VWindowItem>
        
        <VWindowItem value="candidate-photos">
          <CandidatePhotoList 
            :inscription-id="inscriptionId"
            :is-uninominal="isUninominal"
          />
        </VWindowItem>
        
        <VWindowItem value="logosymbol">
          <LogoSymbol 
            :grouping-political="inscription.groupingPoliticalId" 
            :description="inscription.groupingPoliticalName"
          />
        </VWindowItem>

        <VWindowItem value="inscription-docsupports">
          <SupportDocInscription
            :inscription-id="inscriptionId" 
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            enable-folio
            enable-check
            :is-approved="isApproved"
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
  name: "preinscription-pending-id"
  meta:
  authRequired: true
</route>
