<script setup>
import SummaryInfo from '@/components/inscription-final/summary/SummaryInfo.vue'
import Card from "@/components/shared/Card.vue"
import SummaryCandidates from "@/components/inscription-final/summary/SummaryCandidates.vue"
import SummaryMembers from "@/components/inscription-final/summary/SummaryMembersCommittee.vue"
import DownloadE8 from './DownloadE8.vue'
import ReversarE8 from './ReversarE8.vue'
import { useInscriptionFinal } from '@/stores/inscriptionFinal'
import { storeToRefs } from 'pinia'
import RegenerateE8 from './RegenerateE8.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import DownloadE8Physical from "./DownloadE8Physical.vue"

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  groupingPoliticalTypeId:{ type: Number, required: true  },
  isUninominal: { type: Boolean, default: false },
})

const inscriptionFinalStore = useInscriptionFinal()

const { committeeMembers, information } = storeToRefs(inscriptionFinalStore)

const { can } = useAppAbility()

const candidates = computed(() => inscriptionFinalStore.candidates.list)

const inscriptionIdProps = ref(props.inscriptionId)
const groupingPoliticalTypeIdProps = ref(props.groupingPoliticalTypeId)
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <VForm class="mt-5">
          <VRow>
            <VCol 
              cols="12" 
              md="8"
            >
              <SummaryInfo
                :inscription-id="inscriptionIdProps" 
                :grouping-political-type-id="groupingPoliticalTypeIdProps"
              />

              <Card subtitle="Candidatos Inscritos" class="mt-3">
                <VCardText class="pa-3">
                  <VRow>
                    <VCol cols="12">
                      <SummaryCandidates 
                        :items="candidates" 
                        :inscription-id="information.id" 
                        :show-row-field="!isUninominal"
                      />
                    </VCol>
                  </VRow>
                </VCardText>
              </Card>

              <Card v-if="committeeMembers.list.length" subtitle="Integrantes del Comité Inscriptor" class="mt-3">
                <VCardText class="pa-3">
                  <VRow>
                    <VCol cols="12">
                      <SummaryMembers :items="committeeMembers.list" :show-status="false" />
                    </VCol>
                  </VRow>
                </VCardText>
              </Card>
            </VCol>
            <VCol 
              cols="12" 
              md="4"
            >
              <VRow class="match-height">
                <VCol cols="12">
                  <div class="mb-2">
                    <DownloadE8 :inscription-id="inscriptionId" />
                  </div>
                  <div class="mb-2">
                    <RegenerateE8
                      v-if="can('regenerate', 'inscription-final')"
                      :inscription-id="inscriptionId" 
                    />
                  </div>
                  <div class="mb-2">
                    <ReversarE8 :inscription-id="inscriptionId" />
                  </div>
                  <div class="mb-2"> 
                    <DownloadE8Physical :inscription-id="inscriptionIdProps" />
                  </div>
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </vcard>
  </div>
</template>

<style lang="scss">
.text-table {
  font-size: 1rem;
}

.card-primary {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

.notify-mail {
  color: black !important;
}
</style>
