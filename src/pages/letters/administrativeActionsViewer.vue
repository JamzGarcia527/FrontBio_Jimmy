<script setup>
import AdministrativeActionsViewerFilter from "@/components/letters/AdministrativeActionsViewerFilter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

const { t } = useI18n()
const filters = ref({})
const showItems = ref(false)
const isLoading = ref(false)
const { emit } = useEventsBus()
const error = ref(null)
const pdfUrl = ref('')
const pdfFileName = ref('')

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "id", label: t('module_documents.administrativeActionsViewer.id') },
  { key: "fileName", label: t('module_documents.administrativeActionsViewer.fileName') },
  { key: "numberResolution", label: t('module_documents.administrativeActionsViewer.numberResolution'), thClass: 'text-center' },
  { key: "downloadPath", label: t('module_documents.administrativeActionsViewer.downloadPath'), thClass: 'text-center' },
])

const handlerSearchFilter = async selected => {
  const { 
    groupingPoliticalTypeId: typeGroupId,
    groupingPoliticalId: nameGroupId,
    corporationId: corporationId,
    circunscriptionId: circunscriptionId,
    department: departmentId,
    municipality: municipalityId,
    commune: communeId,
    isBlankVotePromote: voteBlank,
    size = 10,
    page = 0,
  } = selected

  filters.value = {
    typeGroupId,
    nameGroupId,
    corporationId,
    circunscriptionId,
    departmentId,
    municipalityId,
    communeId,
    voteBlank,
    size,
    page,
  }  

  showItems.value = true
  isLoading.value = true

  emit('search', true)
}

const getDocument = async (value, name) => {
  let file

  try {
    const response = await axios.get(`/v1/administrative-acts/preview?administrativeId=${value}`, { responseType: 'blob' })

    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)

    pdfFileName.value = name

    const a = document.createElement('a')

    a.href = pdfUrl.value

    a.download = `${name}.pdf`

    a.click()

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
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_documents.title'), $t('module_documents.administrativeActionsViewer.title') ]" />
    <AdministrativeActionsViewerFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showItems">
      <DataTableServerSide 
        ref="datatable"
        endpoint="/v1/administrative-acts/administrative_actions_viewer"
        :params="filters"
        :fields="fields"
        :loading="isLoading"
      >
        <template #cell(numberResolution)="{ item }">
          <div class="d-flex justify-center">
            {{ item.numberResolution }}          
          </div>
        </template>
        <template #cell(downloadPath)="{ item }">
          <div class="d-flex justify-center">
            <VBtn
              class="text-center"
              icon="tabler-download"
              variant="text"
              color="secondary"
              @click="getDocument(item.id, item.fileName)"
            />            
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "letters-administrativeActionsViewer"
meta:
authRequired: true
</route>