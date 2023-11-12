<script setup>
import ListFilter from '@/components/administrative-acts/ListFilter.vue'
import DataTableServerSide from '@/components/shared/DataTableServerSideReports.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from "vue-i18n"

const filters = ref({})
const dataTableIsVisible = ref(false)
const endpoint = 'v1/administrative-acts/list'
const pdfUrl = ref('')
const pdfFileName = ref('')
const isDialogVisible = ref(false)
const zoom = ref('200%')
const { t } = useI18n()

const fields = ref([
  { key: 'inscriptionId', label: 'Inscripción' },
  { key: 'corporationName', label: 'Corporación/cargo' },
  { key: 'circunscriptionName', label: 'Circunscripción' },
  { key: 'registrationPlace', label: 'Lugar' },
  { key: 'rowField', label: 'Renglón', thClass: 'text-center' },
  { key: 'inscriptionType', label: 'Tipo' },
  { key: 'groupingPoliticalName', label: 'Nombre de la Agrupación Política' },
  { key: 'username', label: 'Usuario' },
  { key: 'createdAt', label: 'Fecha de Creación' },
  { key: 'support', label: 'Soporte', thClass: 'text-center' },
])

const previewAdministrativeActs = async (value, name) => {
  let file
  try {
    const response = await axios.get(`/v1/administrative-acts/preview?administrativeId=${value}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)
    pdfFileName.value = name
    isDialogVisible.value = true
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
}

const handlerFilter = value => {
  const { valid, params } = value
  if (valid) 
    dataTableIsVisible.value = true
  filters.value = params
}
</script>

<template>
  <div>
    <ListFilter class="mb-4" @next="handlerFilter" />
    <DataTableServerSide v-if="dataTableIsVisible" :endpoint="endpoint" :params="filters" :fields="fields">
      <template #cell(rowField)="{ item }">
        <div class="d-flex justify-center">
          {{ item.rowField }}
        </div>
      </template>
      <template #cell(support)="{ item }">
        <div class="d-flex justify-center">
          <VBtn size="38" variant="secondary" @click="previewAdministrativeActs(item.administrativeId, item.corporationName)">
            <VIcon
              icon="tabler-eye"
              size="22"
            />
            <VTooltip
              activator="parent"
              location="start"
            >
              Previsualizar documento
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

        <VCardText class="d-flex justify-end">
          <VBtn @click="isDialogVisible = false">
            {{ t('common.btn_close') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "administrative-acts"
meta:
  authRequired: true
</route>

