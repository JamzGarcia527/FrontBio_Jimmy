<script setup>
import Swal from '@/plugins/sweetalert2'
import axios from "@/plugins/axios"
import SummaryHeader from '@/components/inscription-modifies/SummaryHeader.vue'
import SupportDocInscription from '@/components/inscription-modifies/support-doc-inscription/SupportDocInscription.vue'

import { useRoute } from 'vue-router'
import { useInscriptionModify  } from '@/stores/inscriptionModify'
import { useUserConfigStore } from '@/stores/userconfig'

import CustomError from '@/utils/CustomError'
import { useI18n } from 'vue-i18n'
import BasicInfo from '@/components/inscription-modifies/basicinfo/BasicInfo.vue'
import PreinscriptionSummaryPending from '@/components/inscription-modifies/summary/PreinscriptionSummaryPending.vue'
import CommitteeMembers from '@/components/shared/CommitteeMembers.vue'
import SeriounessPolicy from '@/components/inscription-modifies/seriouness-policy/SeriounessPolicy.vue'
import CandidateList from '@/components/inscription-modifies/candidates/CandidateList.vue'
import CandidatePhotoList from '@/components/inscription-modifies/candidates/CandidatePhotoList.vue'
import CampaignInfo from '@/components/inscription-modifies/CampaignInfo/CampaignInfo.vue'
import LogoSymbol from '@/components/inscription-modifies/logosymbol/LogoSymbol.vue'

const { t } = useI18n()
const inscriptionModifyStore = useInscriptionModify()
const route = useRoute()
const userConfig = useUserConfigStore()

const inscriptionModifyId = computed(() => Number(route.params.id))
const activeTab = computed(() => route.params.tab)
const isLoading = ref(false)
const inscription = ref(null)
const listElectoralApproved = ref([])
const isApproved = computed(() => listElectoralApproved.value.includes(userConfig.userData.id))

const isReadOnly = computed(() => inscriptionModifyStore.isReadonly)
const isReadonlyCommittee = computed(() => inscriptionModifyStore.isReadonlyCommittee)
const isExtemporaneous = computed(() => inscriptionModifyStore.isExtemporaneous)
const isBlankVote = computed(() => inscriptionModifyStore.isBlankVotePromoter)
const isUninominal = computed(() => inscriptionModifyStore.isUninominal)

const routeNamePendingInscriptions = computed(() => isExtemporaneous.value  
  ? 'inscription-modifies-extemporaneous-pending' : 'inscription-modifies-pending')

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
    const data = await inscriptionModifyStore.getInscription(id)

    if (data.inscriptionChangeStateCode != 3) {
      const message = t('validations.inscription_incorrect_status', { status: 'envió de aprobación' })
      throw new CustomError(message, 403)
    }

    inscription.value = data
    await inscriptionModifyStore.getCandidates(id)
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
  const { data } = await axios.get(`v1/user/list-approved/electoral-auth?id=${id}&phase=E7`)

  listElectoralApproved.value = data
}

onBeforeMount(() => {
  getListApproved(inscriptionModifyId.value)
})

onMounted(() => {
  getDetailGroupingPolitical(inscriptionModifyId.value)
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
              <VTab 
                v-if="!item.hidden" 
                :key="index" 
                :value="item.tab"
                :to="{ name: 'inscription-modifies-pending-id', params: { id: Number($route.params.id), tab: item.tab } }"
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
            :inscription-id="inscriptionModifyId" 
            :inscription-id-e6="inscription.inscriptionId"
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :readonly="isReadOnly || isReadonlyCommittee"
            :is-uninominal="isUninominal" 
            :is-extemporaneous="isExtemporaneous"
          />
        </VWindowItem>

        <VWindowItem value="basic-info">
          <BasicInfo  
            :inscription-id="inscriptionModifyId" 
            :inscription-id-e6="inscription.inscriptionId" 
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
          />
        </VWindowItem>

        <VWindowItem value="campaign-info">
          <CampaignInfo
            :inscription-id="inscriptionModifyId"
            :inscription-id-e6="inscription.inscriptionId"  
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
          />
        </VWindowItem>
        
        <VWindowItem value="candidate-photos">
          <CandidatePhotoList
            :inscription-id="inscription.inscriptionId"
            :inscription-modify-id="inscriptionModifyId"
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
            :inscription-id="inscription.inscriptionChangeId" 
            :inscription-id-e6="inscription.inscriptionId"
            :grouping-political-type-id="inscription.groupingPoliticalTypeId"
            :is-delete="false"
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
  name: "inscription-modifies-pending-id"
  meta:
  authRequired: true
</route>
