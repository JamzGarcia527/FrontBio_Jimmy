<script>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from "vue-i18n"
import { computed } from 'vue'

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
      default: 'No hay registros',
    },
    tableClass: {
      type: String,
      default: "",
    },
  },
  emits: ['update:page'],
  setup(props) {

    // {
    //   totalPages: 0,
    //   totalElements: 20,
    //   size: 20,
    //   number: 0,
    //   numberOfElements: 20,
    // }
    const sortingCurrent = [
      { key: 'username', value: -1 },
      { key: 'fullname', value: -1 },
      { key: 'email', value: -1 },
      { key: 'roleName', value: -1 },
      { key: 'groupingPoliticalTypeName', value: -1 },
      { key: 'departament', value: -1 },
      { key: 'municipality', value: -1 },
      { key: 'commune', value: -1 },
      { key: 'active', value: -1  },
    ]

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
      isLoading.value = true

      const { params: paramsProp, endpoint, fields: sorting  } = props
      const customProps = Object.entries(paramsProp).reduce((a,[k,v]) => (v == null || String(v).trim() == '' || v === -1 ? a : (a[k]=v, a)), {})
      
      sorting.forEach(item => {
        sortingCurrent.forEach(item2 => {
          if (item.sort.key === item2.key) item2.value = item.sort.value
        })
      })

      const sort = sortingCurrent.map(item => `${item.key}:${item.value}`)
      
      const params = { ...customProps, ...payload, sort: sort.join(',') }

      try {
        const { data } = await axios.get(endpoint, { 
          params,
        })

        const { content, ...result } = data
      
        items.value = content
        pageable.value = result
        isLoading.value = false

      } catch (error) {
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

    const sorting = item => {
      if(!isLoading.value) {
        item.sort.value = 
          item.sort.value === -1 ? 1 :
            item.sort.value ===  1 ? 2 :
              -1
      }
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
      paginationData,
      
      //Methods
      sorting,

      // Pageable
      refresh,
    }
  },
}
</script>

<template>
  <VTable density="compact" class="text-no-wrap" :class="tableClass">
    <thead class="table-light text-muted">
      <tr>
        <th 
          v-for="item in fields" 
          :key="item.key"
          :class="item.thClass" 
          scope="col"
        >
          <span
            :class="{'poiner': item.sort.show && !isLoading, 'not-pointer': isLoading}" 
            @click="sorting(item)"
          >
            {{ item.label || item.key }} 
            <span
              :class="{ 'not-sort': item.sort.value === -1, 'sort': item.sort.value !== -1 }"
            >
              <VIcon
                v-if="item.sort.show"
                size="20"
                :icon="item.sort.value === -1 ? 'mdi-sort' :
                  item.sort.value === 1 ? 'mdi-sort-ascending' :
                  'mdi-sort-descending'"
                class="me-3"
              />
            </span>
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-if="isLoading">
        <tr>
          <td :colspan="fields.length">
            <div class="text-center">
              <VProgressCircular size="50" indeterminate />
            </div> 
          </td>
        </tr>
      </template>
      <template v-else>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(item, colIndex) in fields" :key="colIndex" scope="col">
            <slot :name="`cell(${item.key})`" :value="row[item.key] || null" :item="row">
              {{ row[item.key] || "" }}
            </slot>
          </td>
        </tr>
      </template>
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


<style scoped>
.btn {
  border-radius: 0.25rem !important;
}

.poiner {
  cursor: pointer;
}

.not-pointer {
  cursor: not-allowed;
}

.not-sort {
  color: #808080bf;
}

.sort {
  color: #002d55;
}
</style>
