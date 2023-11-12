<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useInscription } from '@/stores/inscription'
import { onMounted } from 'vue'
import { useI18n } from "vue-i18n"
import useEventBus from '@/utils/eventBus'


const props = defineProps({
  inscriptionId: { type: Number, required: true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
})

const inscriptionStore = useInscription()
const { t } = useI18n()
const isLoading = ref(false)
const { bus } = useEventBus()

const isReadonlyCommittee = computed(() => inscriptionStore.isReadonlyCommittee)
const isBlankVotePromoter = computed(() => inscriptionStore.isBlankVotePromoter)
const groupingPoliticalId = computed(() => inscriptionStore.groupingPoliticalId)


const fieldsNominatedCandidates = ref([
  { key: "fullname", label:  t('tabSummary.fullname')   },
  { key: "rowField", label:  t('candidates.rowField') },
  { key: "phone", label:  t('common.celular_phone')  },
  { key: "age", label: t('candidates.age')   },
  { key: "gender", label: t('candidates.gender') },
  { key: "approveStatus", label: t('tabSummary.approveStatus') },
])

const fieldsMembersCommittee = ref([
  { key: "fullname", label: t('tabSummary.fullname')  },
])

const itemsNominatedCandidates = computed(() => inscriptionStore.candidates.list)
const itemsMembersCommittee = ref([])

const getMembersCommittee = async () => {
  try {
    const { data } = await axios.get(`/v1/inscriptions/${groupingPoliticalId.value}/committee-members`)

    itemsMembersCommittee.value = data
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
    
    return false
  }
}

// Se utiliza la siguiente función para solucionar el BUG #35856 ya que lo Candidatos Inscritos no cargan al renderizar el componente


watch(() => bus.value.get('updateCandidate'), () => {
  if (isReadonlyCommittee) getMembersCommittee()
  inscriptionStore.getCandidates(props.inscriptionId)
})

onMounted(async () => {
  if (isReadonlyCommittee) await getMembersCommittee()
  await inscriptionStore.getCandidates(props.inscriptionId)
})
</script>

<template>
  <div v-if="!isBlankVotePromoter" class="rounded border border-primary mt-5">
    <div v-if="!isLoading">
      <VCard flat class="mb-6 text-primary" title="Candidatos Inscritos">
        <VCardText>
          <DataTable :fields="fieldsNominatedCandidates" :items="itemsNominatedCandidates" paginate rows-per-page="5">
            <template #cell(fullname)="{ item }">
              <div class="line-height py-1">
                <div class="font-weight-semibold">
                  {{ item.firstname }} 
                  {{ item.secondname }}
                  {{ item.firstsurname }} 
                  {{ item.secondsurname }}
                </div>
                <small>{{ item.email }}</small>
              </div>
            </template>
            <template #cell(approveStatus)="{ item }">
              <VChip v-if="item.approveStatus == 0" color="warning">
                <VIcon start size="16" icon="tabler-alert-circle" />
                <span>{{ t('candidates.pending') }}</span>
              </VChip>
              <VChip v-else-if="item.approveStatus == 1" color="success">
                <VIcon start size="16" icon="tabler-circle-check" />
                <span>{{ t('candidates.approved') }}</span>
              </VChip>
              <VChip v-else-if="item.approveStatus == 2" color="error">
                <VIcon start size="16" icon="tabler-circle-x" />
                <span>{{ t('candidates.rejected') }}</span>
              </VChip>
              <VChip v-else-if="item.approveStatus == 5" color="error">
                <VIcon start size="16" icon="tabler-circle-x" />
                <span>{{ t('candidates.resignation') }}</span>
              </VChip>
            </template>
          </DataTable>
        </VCardText>
      </VCard>
    </div>
    
    <div v-else>
      <VCol cols="12">
        <div class="text-center py-10">
          <VProgressCircular size="50" indeterminate />
        </div>
      </VCol>
    </div>
  </div>

  <div v-if="isReadonlyCommittee" class="rounded border border-primary mt-5">
    <div v-if="!isLoading">
      <VCard flat class="mb-6 text-primary" title="INTEGRANTES DEL COMITÉ INSCRIPTOR ">
        <VCardText>
          <DataTable :fields="fieldsMembersCommittee" :items="itemsMembersCommittee">
            <template #cell(fullname)="{ item }">
              <div class="line-height py-1">
                <div class="font-weight-semibold">
                  {{ item.firstName }}
                  {{ item.secondName }}
                  {{ item.firstSurName }} 
                  {{ item.secondSurName }} 
                </div>
                <small>{{ item.email }}</small>
              </div>
            </template>

            <template #cell(approveStatus)="{ item }">
              <VChip v-if="item.approveStatus == 0" color="warning">
                <VIcon start size="16" icon="tabler-alert-circle" />
                <span>{{ t('candidates.pending') }}</span>
              </VChip>
              <VChip v-else-if="item.approveStatus == 1" color="success">
                <VIcon start size="16" icon="tabler-circle-check" />
                <span>{{ t('candidates.approved') }}</span>
              </VChip>
              <VChip v-else-if="item.approveStatus == 5" color="error">
                <VIcon start size="16" icon="tabler-circle-x" />
                <span>{{ t('candidates.resignation') }}</span>
              </VChip>
              <VChip v-else-if="item.approveStatus == -1" color="error">
                <VIcon start size="16" icon="tabler-circle-x" />
                <span>{{ t('candidates.rejected') }}</span>
              </VChip>
            </template>
          </DataTable>
        </VCardText>
      </VCard>
    </div>
    <div v-else>
      <VCol cols="12">
        <div class="text-center py-10">
          <VProgressCircular size="50" indeterminate />
        </div>
      </VCol>
    </div>
  </div>
</template>
