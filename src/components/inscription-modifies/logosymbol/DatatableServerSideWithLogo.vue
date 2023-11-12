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
      default: 'No hay registros',
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

    const getLogo = async id => {
      const { data } = await axios.get(`/v1/files/grouping-political-logo/${id}`, { responseType: "blob" })

      return window.URL.createObjectURL(data)
    }

    const getData = async payload => {
      isLoading.value = true

      const { params: paramsProp, endpoint } = props
      const customProps = Object.entries(paramsProp).reduce((a, [k, v]) => (v == null || String(v).trim() == '' || v === -1 ? a : (a[k] = v, a)), {})
      const params = { ...customProps, ...payload }

      try {
        const { data } = await axios.get(endpoint, { params })
        const { content, ...result } = data

        Promise.all(content.map(async item => {

          if (item.hasLogo) {
            try {
              const logo = await getLogo(item.groupingPoliticalId)

              return { logo, ...item }
            } catch (e) {
              return { ...item }
            }
          } else {
            return {
              ...item,
            }
          }
        })).then(res => {
          items.value = res
        })
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

    watch(props, () => {
      getData({ page: 0 })
    })

    onMounted(() => {
      getData({ page: 0 })
    })

    return {
      currentPage,
      totalPages,
      items,

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
  <VTable density="compact" class="text-no-wrap">
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
        :disabled="loading"
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
</style>
