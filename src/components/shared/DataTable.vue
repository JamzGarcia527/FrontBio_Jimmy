<script>
export default {
  props: {
    responsive: {
      type: Boolean,
      default: false,
    },
    paginate: {
      type: Boolean,
      default: false,
    },
    tableClass: {
      type: String,
      default: "",
    },
    tableProps: {
      type: Object,
      default: () => ({}),
    },
    rowsPerPage: {
      type: Number,
      default: 10,
    },
    fields: {
      type: Array,
      default: () => ([]),
      required: true,
    },
    items: {
      type: Array,
      default: () => ([]),
      required: true,
    },
    emptyText: {
      type: String,
      default: "No hay registros",
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const {
      paginate,
      rowsPerPage,
      items,
    } = toRefs(props)

    const currentPage = ref(1)

    // Computeds
    const startRow = computed(() => ((currentPage.value - 1) * rowsPerPage.value) + 1)
    const endRow = computed(() => Math.min(currentPage.value * rowsPerPage.value, items.value.length))
    const numberPages = computed(() => Math.ceil(items.value.length / rowsPerPage.value))
    const totalRow = computed(() => items.value.length)
    const rows = computed(() => (!paginate.value) ? items.value : items.value.slice(startRow.value - 1, endRow.value))

    const availablePages = computed(() => {

      let start = currentPage.value - 2
      let end = currentPage.value + 2

      if (start <= 0) {
        end -= (start - 1)
        start = 1
      }
      if (end > numberPages.value) {
        end = numberPages.value
        start = (end - 4 <= 0) ? 1 : end - 4
      }

      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // 👉 Computing pagination data
    const paginationData = computed(() => `Registros de ${startRow.value} hasta ${endRow.value} de ${totalRow.value}`)

    watch(items, () => {
      if (numberPages.value < currentPage.value)
        currentPage.value = numberPages.value || 1
    })


    const getRowIndex = index => {
      return paginate ? startRow.value - 1 + index : index
    }
    

    return {
      currentPage,

      // Computed
      startRow,
      endRow,
      numberPages,
      totalRow,
      rows,
      availablePages,
      paginationData,
      getRowIndex,
    }
  },
}
</script>

<template>
  <!--
    <div :class="{ 'table-responsive': responsive }">
    <table class="table align-middle table-nowrap mb-0" :class="tableClass"> 
  -->
  <template v-if="loading">
    <VCol cols="12">
      <div class="text-center py-10">
        <VProgressCircular size="50" indeterminate />
      </div>
    </VCol>
  </template>
    
  <VTable v-else v-bind="tableProps" density="compact" class="text-wrap" :class="tableClass">
    <thead class="table-light text-muted">
      <slot name="top-header" />
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
          <slot :name="`cell(${item.key})`" :value="row[item.key] || null" :item="row" :index="getRowIndex(rowIndex)">
            {{ row[item.key] || "" }}
          </slot>
        </td>
      </tr>
      <tr v-if="rows.length == 0">
        <td :colspan="fields.length">
          <p class="text-muted my-5 fs-14 text-center">
            {{ emptyText }}
          </p> 
        </td>
      </tr>
    </tbody>
  </VTable>

  <template v-if="paginate && items.length > 0">
    <VDivider />

    <!-- SECTION Pagination -->
    <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3">
      <!-- 👉 Pagination meta -->
      <span class="text-sm text-disabled">{{ paginationData }}</span>

      <!-- 👉 Pagination -->
      <VPagination
        v-model="currentPage"
        size="small"
        :total-visible="5"
        :length="numberPages"
      />
    </VCardText>
  </template>
</template>


<style scoped>
.btn {
  border-radius: 0.25rem !important;
}
</style>
