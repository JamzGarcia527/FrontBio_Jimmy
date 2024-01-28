<script>
export default {
  props: {
    paginate: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 10,
    },
    items: {
      type: Array,
      default: () => ([]),
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    emptyText: {
      type: String,
      default: "No hay registros",
    },
    totalVisible: {
      type: Number,
      default: 5,
    },
    density: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const {
      paginate,
      size,
      items,
    } = toRefs(props)

    const currentPage = ref(1)

    // Computeds
    const startRow = computed(() => ((currentPage.value - 1) * size.value) + 1)
    const endRow = computed(() => Math.min(currentPage.value * size.value, items.value.length))
    const totalPages = computed(() => Math.ceil(items.value.length / size.value))
    const totalRow = computed(() => items.value.length)
    const rows = computed(() => (!paginate.value) ? items.value : items.value.slice(startRow.value - 1, endRow.value))

    watch(items, () => {
      if (totalPages.value < currentPage.value)
        currentPage.value = totalPages.value || 1
    })
    

    return {
      currentPage,

      // Computed
      startRow,
      endRow,
      totalPages,
      totalRow,
      rows,
    }
  },
}
</script>

<template>
  <VRow class="match-height">    
    <slot v-for="(row, rowIndex) in rows" :key="rowIndex" v-bind="row" />
    
    <template v-if="loading">
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

    <VCol v-if="paginate && rows.length > 0" cols="12">
      <VPagination
        v-model="currentPage"
        :total-visible="totalVisible"
        :length="totalPages"
        :disabled="loading"
        :density="density === 1 ? 'comfortable' : 'compact'"
      />
    </VCol>
  </VRow>
</template>


<style scoped>
.btn {
  border-radius: 0.25rem !important;
}
</style>
