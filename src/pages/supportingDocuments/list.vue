<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import SupportFilter from "@/pages/supportingDocuments/SupportFilter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import { useI18n } from "vue-i18n"
import { onMounted } from 'vue'

// Definición e inicialización de variables
const { t } = useI18n()
const items = ref([])
const selectedItem = ref({})
const pdfUrl = ref('')
const isDialogVisible = ref(false)
const zoom = ref('200%')
const datatable = ref(null)
const filters = ref({})

const fields = ref([
  { key: 'inscriptionId', label: 'ID' },
  { key: 'groupingPoliticalName', label: t('supportingDocuments.table.political_party') },
  { key: 'corporationName', label: t('supportingDocuments.table.corporation') },
  { key: 'circunscriptionName', label: t('supportingDocuments.table.circunscription') },
  { key: 'department', label: t('supportingDocuments.table.department') },
  { key: 'municipality', label: t('supportingDocuments.table.municipality') },
  { key: 'inscriptionSupportingDocumentIds', label: t('supportingDocuments.table.consecutive') },
  { key: 'support', label: t('supportingDocuments.table.support') },
])

const openPDF = async id => {  
  let file
  try {
    const response = await axios.get(`/v1/inscriptions-supporting-documents/${id}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)
    isDialogVisible.value = true
  
    const a = document.createElement('a')

    a.href = pdfUrl.value
    a.download = `${id}.pdf`
    a.click()
  } catch (error) {
    await Swal.fire({
      icon: 'warning',
      text: 'El recurso solicitado no existe',
    })
  } finally {
    if (file) {
      URL.revokeObjectURL(file)
      pdfUrl.value = null
    }
  }
}

const handlerFilter = data => {
  filters.value = data
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('supportingDocuments.breadcrumbs.title'), t('supportingDocuments.breadcrumbs.document_list')]" />
    <SupportFilter @search="handlerFilter" />
    <VCard>
      <DataTableServerSide ref="datatable" endpoint="/v1/inscriptions/supporting-documents" :params="filters" :fields="fields">
        <template #cell(inscriptionSupportingDocumentIds)="{ item }">
          <VSelect v-model="selectedItem[item.inscriptionId]" item-title="text" item-value="value" :items="item.inscriptionSupportingDocumentIds.map((v,i) => ({text:i + 1,value:v}))" label="-" />
        </template>
        <template #cell(support)="{ item }">
          <VBtn
            class="text-center"
            icon="tabler-pdf"
            variant="text"
            color="secondary"
            @click="openPDF(selectedItem[item.inscriptionId], item.inscriptionId)"
          />
        </template>
      </DataTableServerSide>
    </VCard>    
    <VDialog
      v-model="isDialogVisible"
      width="1050"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

      <!-- Dialog Content -->
      <VCard>
        <VCardText>
          <embed :src="pdfUrl + '#toolbar=0'" type="application/pdf" width="100%" height="500" :zoom="zoom">
        </VCardText>

        <VCardText class="d-flex justify-end">
          <VBtn @click="isDialogVisible = false">
            {{ t('supportingDocuments.close') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "supportingDocuments-list"
meta:
  authRequired: true
</route>

