<script setup>
import ViewerDocumentFilter from "@/components/letters/ViewerDocumentFilter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import useEventsBus from '@/utils/eventBus'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'

const { t } = useI18n()
const filters = ref({})
const showItems = ref(false)
const isLoading = ref(false)
const { emit } = useEventsBus()
const showModal = ref(false)
const error = ref(null)
const fileUrl = ref('')

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "typeDocument", label: t('module_documents.viewerdocument.typeDocument') },
  { key: "name", label: t('module_documents.viewerdocument.name') },
  { key: 'downloadPath', label: t('module_documents.viewerdocument.downloadPath') },
])

const handlerSearchFilter = async selected => {
  const { 
    groupingPoliticalTypeId: groupingPoliticalTypeId,
    groupingPoliticalId: groupingPoliticalId,
    corporationId: corporationId,
    circunscriptionId: circunscriptionId,
    department: department,
    municipality: municipality,
    commune: commune,
    size = 10,
    page = 0,
  } = selected

  filters.value = {
    groupingPoliticalTypeId,
    groupingPoliticalId,
    corporationId,
    circunscriptionId,
    department,
    municipality,
    commune,
    size,
    page,
  }  

  showItems.value = true
  isLoading.value = true

  emit('search', true)
}

const getDocument = async path => {
  isLoading.value = true
  error.value = null
  showModal.value = true
  try {
    const { data } = await axios.get(path, { responseType: 'blob' })
    const file = new Blob([data], { type: 'application/pdf' })
 
    fileUrl.value = URL.createObjectURL(file)
  } catch (e) {
    fileUrl.value = null
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response && e.response.status < 500) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    error.value = text
  }
  isLoading.value = false
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_documents.title'), $t('module_documents.viewerdocument.title') ]" />
    <ViewerDocumentFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="showItems">
      <DataTableServerSide 
        ref="datatable"
        endpoint="/v1/document-viewfinder"
        :params="filters"
        :fields="fields"
        :loading="isLoading"
      >
        <template #cell(downloadPath)="{ item }">
          <div class="d-flex justify-center">
            <VBtn
              class="text-center"
              icon="tabler-eye"
              variant="text"
              color="secondary"
              @click="getDocument(item.downloadPath)"
            />            
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
    <VDialog v-model="showModal" width="1050">
      <!-- Dialog close btn -->      
      <DialogCloseBtn @click="showModal = !showModal" />      
      <!-- Dialog Content -->      
      <VCard>
        <VCardText>          
          <embed
            :src="`${fileUrl}#toolbar=0`" 
            type="application/pdf" 
            width="100%"
            style="height: 70vh;"
          >        
        </VCardText>        
        <VCardText class="d-flex justify-end">
          <VBtn @click="showModal = false">
            Cerrar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
  name: "letters-documentviewer"
  meta:
  authRequired: true
</route>