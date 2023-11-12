<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import CandidateImg from '@/components/shared/candidate/CandidateImg.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => ([]),
  },
  inscriptionId: {
    type: Number,
    required: true,
  },
  showRowField: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

// const itemsCandidates = ref([])

const fields = computed(() => {
  return [
    { key: "photo", label: 'Foto' },
    { key: "fullname", label: t('tabSummary.fullname') },
    { key: "rowField", label: t("candidates.row_field"), hidden: !props.showRowField },
    { key: "phone", label: t('common.celular_phone') },
    { key: "age", label: t('candidates.age') },
    { key: "gender", label: t('candidates.gender') },
    { key: "approveStatus", label: t('tabSummary.approveStatus') },
  ].filter(e => !e.hidden)
})

const getPhotos = async (dni, inscriptionId) => {
  const { data } = await axios.get(`/v1/files/candidates?candidateDni=${dni}&inscriptionId=${inscriptionId}`, { responseType: "blob" })

  return window.URL.createObjectURL(data)
}

const urlPhoto = e => {
  return !e.hasPhoto ? null
    : `/v1/files/candidates?candidateDni=${e.dni}&inscriptionId=${props.inscriptionId}&time=${e.timePhoto}`
}

const itemsCandidates = computed(() => {
  return props.items.map(e => {
    return { urlPhoto: urlPhoto(e), ...e }
  }).sort((a, b) => a.rowField - b.rowField)
})
</script>

<template>
  <div>
    <div class="rounded border border-primary">
      <DataTable :fields="fields" :items="itemsCandidates" paginate rows-per-page="5">
        <template #cell(photo)="{ item }">
          <div>
            <CandidateImg :url="item.urlPhoto" />
          </div>
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
          <VChip v-if="item.stateId == 0" color="warning">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ $t('candidates.pending') }}</span>
          </VChip>
          <VChip v-else-if="item.stateId == 1" color="success">
            <VIcon start size="16" icon="tabler-circle-check" />
            <span>{{ $t('candidates.approved') }}</span>
          </VChip>
          <VChip v-else-if="item.stateId == 5" color="error">
            <VIcon start size="16" icon="tabler-circle-x" />
            <span>{{ $t('candidates.resignation') }}</span>
          </VChip>
          <VChip v-else-if="item.stateId == 2" color="error">
            <VIcon start size="16" icon="tabler-circle-x" />
            <span>{{ $t('candidates.rejected') }}</span>
          </VChip>
        </template>
      </DataTable>
    </div>
  </div>
</template>
