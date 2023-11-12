<script setup>
import { useI18n } from "vue-i18n"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"

const props = defineProps({
  filters: { type: Array, default: () => {} },
})

// Translate i18n
const { t } = useI18n()

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "id", label: t('monitoring_political_groups.code') },
  { key: "name", label: t('monitoring_political_groups.name_political_grouping') },
])

onMounted(() => {
})
</script>

<template>
  <div class="layout-default">
    <VCard :title="t('monitoring_political_groups.search_result')">
      <VCardTitle>
        <hr>
      </VCardTitle>    
      <VRow class="pa-6 py-3">
        <VCol cols="12" md="7" class="py-6">
          <VTextField
            v-model="valueLabelSearch"
            :label="t('monitoring_political_groups.search')"
            append-inner-icon="mdi-magnify"
            @keyup="SearchListCandidates"
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" md="6">
          <DataTableServerSide
            ref="datatable"
            endpoint="/grouping-political/monitoring"
            :params="props.filters"
            :fields="fields"
          />
        </VCol>
      </VRow>
    </VCard>
  </div>
</template>
