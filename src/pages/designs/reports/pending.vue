<script setup>
import DesignsFilter from '@/components/designs/DesignsFilter.vue'
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const breadcrumbs = [
  t('common.home'),
  t('design.module_name'),
  t('design.pendings.page_title'),
]

const firstLoad = ref(false)
const filters = ref({ size: 15 })
const loadingExport = ref(false)

const fieldsTable = ref([
  { key: 'corporation', label: 'CORPORACIÓN/CARGO' },
  { key: 'circunscription', label: 'CIRCUNSCRIPCIÓN' },
  { key: 'department', label: 'DEPARTAMENTO' },
  { key: 'municipality', label: 'MUNICIPIO' },
  { key: 'commune', label: 'COMUNA/LOCALIDAD/CORREGIMIENTO' },
  { key: 'archiveType', label: 'TIPO DE ARCHIVO' },
  { key: 'version', label: 'VERSION', thClass: 'text-center' },
  { key: 'downloadFile', label: 'ARCHIVO', thClass: 'text-center' },
  { key: 'createdAt', label: 'FECHA DE CARGUE', thClass: 'text-center' },
])

const handlerSearch = value => {
  filters.value = value
  firstLoad.value = true
}

const exportFile = async value => {
  const params = { ...filters.value, format: value }
  try {
    loadingExport.value = true

    const { data } = await axios.get('/v1/card-designs/report-export-pending', { params, responseType: 'blob' })
    const fileExt = value === 'XLS' ? 'xlsx' : `csv`

    downloadBlob(data, `${t('design.pendings.page_title')}.${fileExt}`)
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
    throw new Error(e)
  } finally {
    loadingExport.value = false
  }
}

const downloadDesign = async value => {
  try {
    const { data } = await axios.get(`/v1/card-designs/view?id=${value.id}`, { responseType: 'blob' })

    downloadBlob(data, value.archiveName)
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
    throw new Error(e)
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="breadcrumbs" />
    <DesignsFilter class="mb-5" enable-required @search="handlerSearch" />

    <VCard v-if="firstLoad">
      <VRow>
        <VCol cols="12">
          <div class="d-flex justify-end me-3 mt-3 mb-2">
            <VMenu open-on-hover>
              <template #activator="{ props }">
                <VBtn v-bind="props" :loading="loadingExport" prepend-icon="tabler-table-export">
                  {{ t('common.btn_export') }}
                </VBtn>
              </template>

              <VList>
                <VListItem
                  :title="t('common.btn_export_excel')"
                  @click="exportFile('XLS')"
                />
                <VListItem
                  :title="t('common.btn_export_csv')"
                  @click="exportFile('CSV')"
                />
              </VList>
            </VMenu>
          </div>
          <VDivider />
          <DataTableServerSide 
            endpoint="/v1/card-designs/list-pending"
            :params="filters" 
            :fields="fieldsTable"
            show-empty-message
          >
            <template #cell(version)="{ value }">
              <div class="text-center">
                {{ value }}
              </div>
            </template>
            <template #cell(downloadFile)="{ item }">
              <VBtn variant="plain" @click="() => downloadDesign(item)">
                <VIcon icon="tabler-download" class="me-2" />
                {{ item.archiveName }}
              </VBtn>
            </template>
            <template #cell(observation)="{ value }">
              <div class="text-wrap text-justify" style="width: 400px;">
                {{ value }}
              </div>
            </template>
          </DataTableServerSide>
        </VCol>
      </VRow>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "designs-reports-pending"
meta:
  authRequired: true
</route>
