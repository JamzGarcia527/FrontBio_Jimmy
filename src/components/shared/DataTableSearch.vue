<script setup>
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'

const props = defineProps({
  params: { type: Object,default: () => ({}) },
  endpoint: { type: String, required: true },
  fields: { type: Array,default: () => ([]),required: true },
  nameColumnSearch: { type: String,default: () => (null),required: true },
})

const emit = defineEmits(["update:page"])

const pageable = ref({})
const { t } = useI18n()
const resultRowsEndPoint = ref([])
const desserts = ref([])
const valueLabelSearch = ref(null)
const currentPage = computed(() => pageable.value.number + 1)
const totalPages = computed(() => pageable.value.totalPages)

const refresh = (value = null) => {
  const page = value || currentPage.value

  getData({ page: page - 1 })
} 

const startRow = computed(() => {
  const { size, number } = pageable.value
      
  return size * number + 1
})

const endRow = computed(() => {
  const { size, number, numberOfElements } = pageable.value
      
  return size * number + numberOfElements
})

const paginationData = computed(() => `Registros de ${startRow.value} hasta ${endRow.value} de ${pageable.value.totalElements}`)

const SearchGroupingPolitical = function () {
  if (valueLabelSearch.value.length > 0) {
    resultRowsEndPoint.value = desserts.value.filter(word =>
      word[props.nameColumnSearch].toUpperCase().includes(valueLabelSearch.value.toUpperCase()),
    )
  } else {
    resultRowsEndPoint.value = desserts.value
  }
}

const getData = async payload => {
  const customProps = Object.entries(props.params).reduce((a,[k,v]) => (v == null || v === -1 ? a : (a[k]=v, a)), {})
  const params = { ...customProps, ...payload }

  axios.get(props.endpoint, { params }).then(response => {
    desserts.value = response.data.content
    resultRowsEndPoint.value = response.data.content
    pageable.value = response.data
  })
}

watch(props, () => {
  getData({ page: 0 })
})
    
onMounted(() => {
  getData({ page: 0 })
})
</script>

<template>
  <div class="layout-default">
    <VRow class="pa-6 py-3">
      <VCol cols="12" md="7" class="py-6 px-5">
        <VTextField
          v-model="valueLabelSearch"
          :label="t('monitoring_political_groups.search')"
          append-inner-icon="mdi-magnify"
          @keyup="SearchGroupingPolitical"
        />
      </VCol>
      <VCol cols="12" md="5" class="py-6 px-5">
        <slot name="exportFile" />
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="12" md="12">
        <VTable density="compact" class="text-no-wrap px-3">
          <thead class="table-light text-muted">
            <tr>
              <th 
                v-for="item2 in props.fields" :key="item2.key" 
                scope="col"
              >
                {{ item2.label || item2.key }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in resultRowsEndPoint" :key="rowIndex">
              <td v-for="(item, colIndex) in props.fields" :key="colIndex" scope="col">
                <slot :name="`cell(${item.key})`" :value="row[item.key] || null" :item="row">
                  {{ row[item.key] || "" }}
                </slot>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCol>
    </VRow>
  </div>

  <template v-if="resultRowsEndPoint.length > 0">
    <VDivider />

    <!-- SECTION Pagination -->
    <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3">
      <!-- 👉 Pagination meta -->
      <span class="text-sm text-disabled">{{ paginationData }}</span>

      <!-- 👉 Pagination -->
      <VPagination
        :model-value="currentPage"
        size="small"
        :total-visible="5"
        :length="totalPages"
        :disabled="loading"
        @update:model-value="refresh"
      />
    </VCardText>
  </template>
</template>
