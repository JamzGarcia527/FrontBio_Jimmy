<script setup>
import Filter from '@/pages/sketches/print-sketch-election/components/Filter.vue'
import { useI18n } from "vue-i18n"
import DataTableServerSide from '@/pages/sketches/print-sketch-election/components/DataTableServerSide.vue'
import Swal from '@/plugins/sweetalert2'
import axios from '@/plugins/axios'

// Defining and initializing variables
const filtersControls = reactive({ loading: false, disabled: false })
const { t } = useI18n()
const filters = ref({})
const endpoint = '/v1/card-sketch/list' // Get data from db
const pdfUrl = ref('')
const pdfFileName = ref('')
const isDialogVisible = ref(false)
const zoom = ref('200%')
const isVisible = ref(false)

const fields = ref([
  { key: 'corporationName', label: t('print_sketch.table.corporation').toUpperCase() },
  { key: 'department', label: t('print_sketch.table.department').toUpperCase() },
  { key: 'municipality', label: t('print_sketch.table.municipality').toUpperCase() },
  { key: 'commune', label: t('print_sketch.table.commune').toUpperCase() },
  { key: 'actions', label: t('print_sketch.table.actions').toUpperCase(), thClass: 'text-center' },
])

// Methods and functions
const handlerViewSketch = value => {
  filtersControls.loading = true
  filtersControls.disabled = true

  const queryParams = {
    department: value.department || -1,
    municipality: value.municipality || -1,
    commune: value.commune || -1,
    corporationId: value.corporationId || -1,
    circunscriptionId: -1,
    statusSketch: 1,
  }

  filters.value = queryParams
  isVisible.value = value.valid
  filtersControls.loading = false
  filtersControls.disabled = false
}

const downloadSketch = () => {
  const a = document.createElement('a')

  a.href = pdfUrl.value
  a.download = pdfFileName.value
  a.click()

  a.remove()
}

const previewSketch = async (action, value, name) => {
  if (action == 1) {
    // Preview sketch
    let file
    try {
      const response = await axios.get(`/v1/card-sketch/preview?cardSketchId=${value}`, { responseType: 'blob' })
      const file = new Blob([response.data], { type: 'application/pdf' })

      pdfUrl.value = URL.createObjectURL(file)
      pdfFileName.value = name
      isDialogVisible.value = true
  
      // const a = document.createElement('a')
      // a.href = pdfUrl.value
      // a.download = `${name}.pdf`
      // a.click()
    } catch (e) {
      let text = 'No es posible realizar operación, por favor intenta más tarde.'
      if (e.response) {
        const { data } = e.response
        const response = data instanceof Blob ? JSON.parse(await data.text()) : data

        text = response.message
      }
      Swal.fire({ icon: 'warning', text: text })
    } finally {
      if (file) {
        URL.revokeObjectURL(file)
        pdfUrl.value = null
      }
    }
  } else {
    // Download sketch

  }

}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('print_sketch.breadcrumbs.title'), t('print_sketch.breadcrumbs.page')]" />
    <Filter 
      :disabled="filtersControls.disabled"
      :loading="filtersControls.loading"
      class="mb-2" 
      @next="handlerViewSketch"
    />
    <DataTableServerSide v-if="isVisible" ref="datatable" show-empty-message :params="filters" :fields="fields" :endpoint="endpoint">
      <template #cell(actions)="{item}">
        <div class="d-flex justify-center gap-2">
          <VBtn size="38" variant="secondary" @click="previewSketch(1, item.id, item.fileName)">
            <VIcon
              icon="tabler-eye"
              size="22"
            />
            <VTooltip
              activator="parent"
              location="start"
            >
              Visualizar boceto
            </VTooltip>
          </VBtn>
        </div>
      </template>
    </DataTableServerSide>
    <VDialog
      v-model="isDialogVisible"
      width="1050"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

      <!-- Dialog Content -->
      <VCard>
        <VCardText>
          <embed :src="`${pdfUrl}#toolbar=0`" type="application/pdf" width="100%" height="500" :zoom="zoom">
        </VCardText>

        <VCardText class="d-flex justify-space-between">
          <VBtn variant="outlined" prepend-icon="tabler-download" @click="downloadSketch">
            {{ t('common.btn_download') }}
          </VBtn>
          <VBtn @click="isDialogVisible = false">
            {{ t('common.btn_close') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "sketches-print-sketch-election"
meta:
authRequired: true
</route>
