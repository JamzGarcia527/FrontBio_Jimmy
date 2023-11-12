<script setup>
import Filter from '@/components/list-receipt-signatures/Filter.vue'
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import { useI18n } from "vue-i18n"

// Declaring and initializing variables
const { t } = useI18n()
const filters = ref({})
const tableIsVisible = ref(false)
const endpoint = 'v1/committee-certificate/list'

const fields = ref([
  { key: 'corporationName', label: t('upload_certification_signature.table.corporation').toUpperCase()  },
  { key: 'departmentName', label: t('upload_certification_signature.table.department').toUpperCase()  },
  { key: 'municipalityName', label: t('upload_certification_signature.table.municipality').toUpperCase()  },
  { key: 'communeName', label: t('upload_certification_signature.table.commune').toUpperCase()  },
  { key: 'groupingPoliticalName', label: 'Nombre de agrupación política'.toUpperCase() },
  { key: 'signaturesReceived', label: 'Firmas recibidas'.toUpperCase(), thClass: 'text-center' },
])

// Methods and functions
const handlerFilter = value => {

  const { department, municipality, commune, corporationId, circunscriptionId, isBlankVotePromote, groupingPoliticalTypeId, groupingPoliticalId, valid,
  } = value

  let queryParams = {
    groupingPoliticalType: groupingPoliticalTypeId,
    groupingPoliticalId,
    blankVotePromoter: isBlankVotePromote,
    corporationId,
    circunscriptionId,
    department,
    municipality,
    commune,
  }
  filters.value = queryParams
  tableIsVisible.value = valid
}
</script>

<template>
  <div>
    <Filter 
      class="mb-2"
      @next="handlerFilter"
    />
    <DataTableServerSide v-if="tableIsVisible" ref="datatable" :fields="fields" :params="filters" :endpoint="endpoint">
      <template #cell(signaturesReceived)="{ value, item }">
        <div class="d-flex justify-center">
          <div>
            <VRadioGroup 
              disabled
              :model-value="value" inline 
            >
              <VRadio label="Si" :value="item.fulfilledSignature == 1 ? value : 1" />
              <VRadio label="No" :value="item.fulfilledSignature == null || item.fulfilledSignature != 1 ? value : 1" />
            </VRadioGroup>
          </div>
        </div>
      </template>
    </DataTableServerSide>
  </div>
</template>

<route lang="yaml">
name: "list-receipt-signatures"
meta:
authRequired: true
</route>

