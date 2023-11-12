<script>
import axios from '@/plugins/axios'
import { useQuery } from '@tanstack/vue-query'

export default {
  props: {
    size: {
      type: Number,
      default: 10,
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
      default: "No existen registros",
    },
  },
  emits: ['update:page'],
  setup(props) {

    const { endpoint, params, size } = toRefs(props)

    const page = ref(1)

    const payload = computed(() => ({
      page: page.value - 1,
      size: size.value,
      ...params.value,
    }))

    const getData = async (uri, payload) => {
      try {
        const { data } = await axios.get(uri.value, { params: payload.value })
        
        return data
      } catch (error) {
        if (error.response && error.response.status < 500) {
          const { message } = error.response.data

          Swal.fire({ icon: 'warning', text: message })
        }
        
        throw new Error(error)
      }
    }

    const { isLoading, data } = useQuery(
      ['inscriptions-pending', payload], 
      () => getData(endpoint, payload), {
        cacheTime: 1000 * 60 * 5,
        refetchOnReconnect: 'always',
        keepPreviousData: true,
      })

    const rows = computed(() => data.value?.content || [])

    const pageable = computed(() => {
      const { content, pageable, ...result } = data.value || {}
      
      return result
    })

    const startRow = computed(() => {
      const { size, number } = pageable.value
      
      return size * number + 1
    })

    const endRow = computed(() => {
      const { size, number, numberOfElements } = pageable.value
      
      return size * number + numberOfElements
    })

    const totalPages = computed(() => pageable.value.totalPages)

    return {
      page,
      isLoading,

      // Computed
      rows,
      startRow,
      endRow,
      totalPages,
    }
  },
}
</script>

<template>
  <VRow class="match-height">    
    <slot v-for="(row, rowIndex) in rows" :key="rowIndex" v-bind="row" />
    
    <template v-if="isLoading">
      <VCol cols="12">
        <div class="text-center py-10">
          <VProgressCircular size="50" indeterminate />
        </div>
      </VCol>
    </template>

    <template v-else-if="rows.length == 0 && !!emptyText">
      <VCol cols="12">
        <div class="text-center py-10">
          {{ emptyText }}
        </div>
      </VCol>
    </template>

    <VCol v-if="rows.length > 0" cols="12">
      <VPagination
        v-model="page"
        size="small"
        :total-visible="5"
        :length="totalPages"
        :disabled="isLoading"
      />
    </VCol>
  </VRow>
</template>


<style scoped>
.btn {
  border-radius: 0.25rem !important;
}
</style>
