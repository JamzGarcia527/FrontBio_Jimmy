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
      default: 'No hay información ',
    },
    tableClass: {
      type: String,
      default: "",
    },
    showEmptyMessage: { // Se crea esta props para mostrar un mensaje cuando la consulta no arroje data. Es opcional
      type: Boolean,
      default: false,
    },
    keys: {
      type: Array,
      default: () => ([]),
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
    const { t } = useI18n()

    // 👉 Computing pagination data
    const currentPage = computed(() => pageable.value.number + 1)
    const totalPages = computed(() => pageable.value.totalPages)
    const rows = computed(() => items.value)

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
      console.log("entro a get data")
      isLoading.value = true

      const { params: paramsProp, endpoint, keys } = props
      
      console.log("props in dataTable", props)

      const customProps = Object.entries(paramsProp).reduce((a,[k,v]) => (v == null || String(v).trim() == '' || v === -1 ? a : (a[k]=v, a)), {})
      const params = { ...customProps, ...payload }

      try {
        console.log("entro al try cathc")

        const { data } = await axios.get(endpoint, { params })

        console.log("data del endpoint", data)

        const { content, ...result } = data

        if (props.showEmptyMessage && Array.isArray(content) && content.length === 0) {
          Swal.fire({ icon: 'warning', text: 'Lo sentimos, no se encontró información con los criterios de búsqueda proporcionados.' })
        }
        
        items.value = keys.length ? content.map(i => ([...i, ...keys])) : content
        emit('returnData', items.value)
        pageable.value = result
        isLoading.value = false

      } catch (error) {
        emit('returnData', [])
        isLoading.value = false
        if (error.response && error.response.status <= 500) {
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
      getData({ page: 1 })
    })

    onMounted(() => {
      getData({ page: 1 })
    })

    return {
      currentPage,
      totalPages,
      isLoading,

      // Computed
      startRow,
      endRow,
      rows,
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
