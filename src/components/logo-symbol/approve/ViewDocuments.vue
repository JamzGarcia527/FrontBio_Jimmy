<script setup>
import DataTable from "@/components/shared/DataTable.vue"
import { onMounted } from 'vue'
import Swal from "@/plugins/sweetalert2"
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  dialogIsVisible: { type: Boolean, required: true },
  groupingPoliticalTypeId: { type: Number, required: true },
})

const emit = defineEmits(['closeModal'])
const { t } = useI18n()
const items = ref([])
const downloadingFile = ref(false)

const fields = ref([
  { key: 'nameSupportingDocuments', label:  t('logo_symbol.generate_approval.tableDocuments.documentsName') },
  { key: 'createdAt', label: t('logo_symbol.generate_approval.tableDocuments.uploadDate'), thClass: 'text-center' },
  { key: 'actions', label: t('logo_symbol.generate_approval.tableDocuments.action'), thClass: 'text-center' },
])

const viewDialogDocuments = computed(() => props.dialogIsVisible)

const getSupportingDocuments = async () => {
  try {
    const data = await
    axios.get(`/v1/inscriptions-supporting-documents/from-supporting-documents?inscription=${props.inscriptionId}&groupingpoliticalType=${props.groupingPoliticalTypeId}`)

    items.value = data.data
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message || t('assign_random_position.swal.not_operation') })
      
      return false
    }
  }
}

const downloadFile = (value, name) => {
  downloadingFile.value = true

  const requestParams = {
    id: value,
  }

  axios.get('v1/files/inscriptions-supporting-documents', {
    params: requestParams,
    responseType: "blob", // importante
  }).then(response => {
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")

    link.href = url
    link.setAttribute("download", `${name}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link) // Revocar el objeto URL después de la descarga
    downloadingFile.value = false
  })
}


const closeDialog = () => {
  emit('closeModal')
}

onMounted(async () => {
  await getSupportingDocuments()
})
</script>

<template>
  <div>
    <VDialog
      v-model="viewDialogDocuments"
      width="1500"
      persistent
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="closeDialog" />

      <!-- Dialog Content -->
      <VCard>
        <VCardText class="text-center">
          <DataTable :items="items" :fields="fields">
            <template #cell(nameSupportingDocuments)="{ item }">
              <div class="d-flex justify-start">
                {{ item.nameSupportingDocuments }}
              </div>
            </template>
            <template #cell(createdAt)="{ item }">
              <div class="d-flex justify-center">
                {{ item.createdAt }}
              </div>
            </template>
            <template #cell(actions)="{ item }">
              <div class="d-flex justify-center">
                <VBtn
                  v-if="item.hash" 
                  :disabled="downloadingFile" 
                  variant="plain" color="primary" 
                  @click="() => downloadFile(item.id, item.nameSupportingDocuments)"
                >
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    Descargar documento
                  </VTooltip>
                  <VIcon size="30" icon="tabler-download" class="me-2" /> 
                </VBtn>
              </div>
            </template>
          </DataTable>
        </VCardText>
      </VCard>
    </VDialog>
  </div>  
</template>
