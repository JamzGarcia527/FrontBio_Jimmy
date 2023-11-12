<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useInscriptionModify  } from '@/stores/inscriptionModify'
import { onMounted } from 'vue'
import { useI18n } from "vue-i18n"
import CandidateProfilePhoto from './CandidateProfilePhoto.vue'


const props = defineProps({
  inscriptionId: { type: Number, required: true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
})

const inscriptionModifyStore = useInscriptionModify()
const { t } = useI18n()

const isCommittee = computed(() => inscriptionModifyStore.isReadonlyCommittee)
const isBlankVotePromoter = computed(() => inscriptionModifyStore.isBlankVotePromoter)
const groupingPoliticalId = computed(() => inscriptionModifyStore.groupingPoliticalId)

const fieldsNominatedCandidates = ref([
  { key: "profilePhoto", label:  'Foto', thClass: 'text-center'   },
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

const inscriptionId = computed(() => inscriptionModifyStore.inscriptionId)
const itemsNominatedCandidates = computed(() => inscriptionModifyStore.candidates.list)
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

onMounted(async () => {
  if (isCommittee) getMembersCommittee()
  
  inscriptionModifyStore.getInscription(props.inscriptionId)

  await inscriptionModifyStore.getCandidates(props.inscriptionId)
})
</script>

<template>
  <div v-if="!isBlankVotePromoter" class="rounded border border-primary mt-5">
    <VCard flat class="mb-6 text-primary" title="Candidatos Inscritos">
      <VCardText>
        <DataTable :fields="fieldsNominatedCandidates" :items="itemsNominatedCandidates" paginate :rows-per-page="5">
          <template #cell(profilePhoto)="{ item }">
            <CandidateProfilePhoto 
              :inscription-id="inscriptionId" 
              :dni="item.dni" 
              :time-photo="item.timePhoto"
              :has-photo="item.hasPhoto"
            />
          </template>
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
            <VChip v-else-if="item.approveStatus == 5" color="error">
              <VIcon start size="16" icon="tabler-circle-x" />
              <span>{{ t('candidates.resignation') }}</span>
            </VChip>
            <VChip v-else-if="item.approveStatus == 2" color="error">
              <VIcon start size="16" icon="tabler-circle-x" />
              <span>{{ t('candidates.rejected') }}</span>
            </VChip>
          </template>
        </DataTable>
      </VCardText>
    </VCard>
  </div>

  <div v-if="isCommittee" class="rounded border border-primary mt-5">
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
</template>
