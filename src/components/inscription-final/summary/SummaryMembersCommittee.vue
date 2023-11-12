<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import { useI18n } from "vue-i18n"

const props = defineProps({
  items: {
    type: Array,
    default: () => ([]),
  },
  showStatus: {
    type: Boolean,
    default: true,
  },
})

const { t } = useI18n()

const fields = ref([
  { key: "fullname", label: t('tabSummary.fullname'), hidden: true },
  { key: "approveStatus", label: t('tabSummary.approveStatus'), hidden: props.showStatus },
].filter(t => t.hidden === true))
</script>

<template>
  <div>
    <div class="rounded border border-primary">
      <DataTable :fields="fields" :items="items">
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
    </div>
  </div>
</template>