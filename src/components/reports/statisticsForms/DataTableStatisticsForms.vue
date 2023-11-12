<script>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from "vue-i18n"

export default {
  props: {
    fields: {
      type: Array,
      default: () => ([]),
      required: true,
    },
    footers: {
      type: Array,
      default: () => ([]),
      required: true,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    endpoint: {
      type: String,
      required: true,
    },
    emptyText: {
      type: String,
      default: 'No hay registros',
    },
    tableClass: {
      type: String,
      default: "",
    },
    showFooter: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:page', 'returnData'],
  setup(props, { emit }) {

    // {
    //   totalPages: 0,
    //   totalElements: 20,
    //   size: 20,
    //   number: 0,
    //   numberOfElements: 20,
    // }
    const pageable = ref({})
    const isLoading = ref(false)
    const items = ref([])
    const itemsFooter = ref({})
    const { t } = useI18n()

    // 👉 Computing pagination data
    const currentPage = computed(() => pageable.value.number + 1)
    const totalPages = computed(() => pageable.value.totalPages)
    const rows = computed(() => items.value)
    const footerData = computed(() => itemsFooter.value)

    const startRow = computed(() => {
      const { size, number } = pageable.value
      
      return size * number + 1
    })

    const endRow = computed(() => {
      const { size, number, numberOfElements } = pageable.value
      
      return size * number + numberOfElements
    })

    const paginationData = computed(() => `Registros de ${startRow.value} hasta ${endRow.value} de ${pageable.value.totalElements}`)

    const getData = async payload => {
      isLoading.value = true

      const { params: paramsProp, endpoint } = props
      const customProps = Object.entries(paramsProp).reduce((a,[k,v]) => (v == null || String(v).trim() == '' || v === -1 ? a : (a[k]=v, a)), {})
      const params = { ...customProps, ...payload }

      try {
        const { data } = await axios.get(endpoint, { params })
        const { content, footer, ...result } = data
      
        items.value = content
        itemsFooter.value = footer
        
        emit('returnData', { items: items.value, footer })
        pageable.value = result
        isLoading.value = false

      } catch (error) {
        emit('returnData', [])
        isLoading.value = false
        if (error.response && error.response.status < 500) {
          const { message } = error.response.data

          Swal.fire({ icon: 'warning', text: message })
        }
      }
    }

    const refresh = (value = null) => {

      const page = value || currentPage.value

      getData({ page: page - 1 })
    } 

    watch(props, () => {
      getData({ page: 0 })
    })

    onMounted(() => {
      getData({ page: 0 })
    })

    return {
      currentPage,
      totalPages,
      isLoading,

      // Computed
      startRow,
      endRow,
      rows,
      footerData,
      paginationData,
      
      // Pageable
      refresh,
    }
  },
}
</script>

<template>
  <template v-if="isLoading">
    <VCol cols="12">
      <div class="text-center py-10">
        <VProgressCircular size="50" indeterminate />
      </div>
    </VCol>
  </template>
  <template v-else>
    <VTable density="compact" class="text-no-wrap" :class="tableClass">
      <thead class="table-light text-muted">
        <slot name="v-theadTitle" /> 
        <slot name="v-thead" />    
        <tr>
          <th 
            v-for="item in fields" 
            :key="item.key"
            :class="item.thClass" 
            scope="col"
          >
            {{ item.label || item.key }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(item, colIndex) in fields" :key="colIndex" scope="col">
            <slot :name="`cell(${item.key})`" :value="row[item.key] || null" :item="row">
              {{ row[item.key] || "" }}
            </slot>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="rows.length > 0">
        <tr>
          <th>
            TOTALES: 
          </th> 
          <th class="" colspan="1" /> 
          <th>
            <div class="d-flex justify-center">
              {{ footerData.amountE6 }}
            </div>
          </th>
          <th>
            <div class="d-flex justify-center">
              {{ footerData.amountPreferentialVote }}
            </div>
          </th>
          <th>
            <div class="d-flex justify-center">
              {{ footerData.amountNoPreferentialVote }}
            </div>
          </th>
          <th>
            <div class="d-flex justify-center">
              {{ footerData.amountPreliminary }}
            </div>
          </th>
          <th>
            <div class="d-flex justify-center">
              {{ footerData.amountDefinitive }}
            </div>
          </th>
          <th>
            <div class="d-flex justify-center">
              {{ footerData.amountApprove }}
            </div>
          </th>
          <th>
            <div class="d-flex justify-center">
              {{ footerData.amountE8 }}
            </div>
          </th>
        </tr>
      </tfoot>
    </VTable>

    <template v-if="rows.length > 0">
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
          @update:model-value="refresh"
        />
      </VCardText>
    </template>
    <template v-else>
      <VCardText class="d-flex align-center justify-center gap-4">
        <p class="text-body-1">
          {{ emptyText }}
        </p> 
      </VCardText>
    </template>
  </template>
</template>


<style scoped>
.btn {
  border-radius: 0.25rem !important;
}
</style>
