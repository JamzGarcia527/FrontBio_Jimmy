<script setup>
import { useI18n } from 'vue-i18n'
import { useInscription } from '@/stores/inscription'
import useEventBus from "@/utils/eventBus"
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'
import { useCustomMessage } from "@/composables/useCustomMessage"
import banner from '@images/pages/dialog-banner-sm.webp'
import iconcsv from '@images/icon/csv.png'
import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import axios from '@/plugins/axios'
import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'
import DataTable from '@/components/shared/DataTable.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:model-value'])
const messageComposable = useCustomMessage()
const { modelValue } = toRefs(props)
const { emit: emiting } = useEventBus()
const { t } = useI18n()
const inscriptionStore = useInscription()

const inscriptionId = computed(() => inscriptionStore.inscriptionId)

const isLoading = ref(false)
const file = ref(null)
const importResponse = ref(null)

const importFieldsTable = [
  { key: 'type', label: ' ' },
  { key: 'key', label: 'Identificador', thClass: 'text-center' },
  { key: 'description', label: 'Descripción' },
]

const fileImage = computed(() => file.value ? iconcsv : unselectfile)

const downloadDocumentationLoading = ref(false)

const downloadDocumentation = () => {
  downloadDocumentationLoading.value = true

  axios.get('/v1/documents/parameter/INCARMAS', {
    responseType: "blob", // importante
  }).then(({ data }) => {
    downloadBlob(data, "Instructivo de cargue.pdf")
  }).catch(async e => {
    let text = messageComposable.get("MS0010")
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
  }).finally(() => downloadDocumentationLoading.value = false)
}


const downloadTemplateLoading = ref(false)

const downloadTempleate = () => {
  downloadTemplateLoading.value = true

  axios.get('/v1/documents/parameter/ESCARMAS', {
    responseType: "blob", // importante
  }).then(({ data }) => {
    downloadBlob(data, "Estructura del archivo.csv")
  }).catch(async e => {
    let text = messageComposable.get("MS0010")
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
  }).finally(() => downloadTemplateLoading.value = false)
}

watch(modelValue, value => {
  if (value) handlerOpen()
})

const allowExt = ['csv']
const maxSizeFile = 1024 * 1024 * 5 // 5 MB

const clearFile = () => file.value = null

const validFile = value => {
  if (value.size > maxSizeFile) {
    Swal.fire({ text: messageComposable.get("MS0018"), icon: 'warning' })
    
    return false
  }

  const ext = value.name.split('.').pop().toLowerCase()
  if (!allowExt.includes(ext)) {
    Swal.fire({ text: messageComposable.get("MS0019"), icon: 'warning' })
    
    return false
  }

  return true
}

const onSelectedFile = e => {
  const uploadfile = e.target.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null
}
  
const onDropFile = e => {
  const uploadfile = e.dataTransfer.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null
}

const handlerOpen = () => {
  file.value = null
  importResponse.value = null
}

const handlerClose = () => {
  emit('update:model-value', false)
}

const handlerReset = () => {
  handlerOpen()
}

const handlerSubmit = async () => {
  isLoading.value = true

  const formData = new FormData()

  formData.append('file', file.value)

  axios.post(`/v1/inscriptions/${inscriptionId.value}/import-candidates`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(({ data }) => {
    file.value = null
    importResponse.value = data
    emiting('updateCandidate', true)
    inscriptionStore.getCandidates(inscriptionId.value)
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    } else {
      Swal.fire({ icon: "warning", text: messageComposable.get("MS0020") })
    }
  }).finally(() => isLoading.value = false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    persistent
    class="v-dialog-lg"
    transition="dialog-bottom-transition"
  > 
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="handlerClose" />

    <!-- Dialog Content -->
    <VCard>
      <VImg :src="banner" height="120" cover />
      <div class="mt-4 text-center text-h6 font-weight-semibold">
        {{ t('candidates.upload.title_card') }}
      </div>
      <VCardText>
        <div class="text-primary font-weight-semibold">
          {{ t('candidates.upload.title_documentation') }}
        </div>
        <VDivider class="mb-4" :thickness="2" />

        <VRow>
          <VCol cols="12" md="5" class="d-flex align-center">
            <div class="w-100">
              <h4 class="text-body-2 text-center text-md-right font-weight-bold line-height">
                Ayuda para <br> cargue masivo:
              </h4>
            </div>
          </VCol>
          <VCol cols="12" md="7" class="d-flex align-center justify-center justify-md-start">
            <VBtn 
              :loading="downloadDocumentationLoading" 
              append-icon="tabler-download" 
              @click="downloadDocumentation"
            >
              {{ t('common.btn_download') }}
            </VBtn>
            <div class="ms-6 me-2">
              <VImg :src="iconpdf" width="48" height="48" aspect-ratio="1" />
            </div>
            <div class="text-caption font-weight-bold line-height">
              Instructivo de <br>
              cargue.pdf
            </div>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="12" md="5" class="d-flex align-center">
            <div class="w-100">
              <h4 class="text-body-2 text-center text-md-right font-weight-bold line-height">
                Descargue la <br> plantilla de ejemplo: 
              </h4>
            </div>
          </VCol>
          <VCol cols="12" md="7" class="d-flex align-center justify-center justify-md-start">
            <VBtn 
              :loading="downloadTemplateLoading"
              append-icon="tabler-download"
              @click="downloadTempleate"
            >
              {{ t('common.btn_download') }}
            </VBtn>
            <div class="ms-6 me-2">
              <VImg :src="iconcsv" width="48" height="48" aspect-ratio="1" />
            </div>
            <div class="text-caption font-weight-bold line-height">
              Estructura del <br>
              archivo.csv
            </div>
          </VCol>
        </VRow>
      </VCardText>
      <VCardText 
        v-if="isLoading"
        class="d-flex justify-center align-center" 
        style="height: 40vh;"
      >
        <VProgressCircular size="60" indeterminate />
      </VCardText>
      <VCardText v-else-if="!importResponse">
        <div class="text-primary font-weight-semibold">
          {{ t('candidates.upload.title_upload_file') }}
        </div>
        <VDivider class="mb-4" :thickness="2" />

        <VRow class="justify-center">
          <VCol cols="8">
            <VCard variant="outlined" class="pa-4 mb-4">
              <VRow>
                <VCol cols="12" md="6" class="d-flex align-center">
                  <VCard v-if="file" variant="outlined" class="w-100">
                    <div class="close">
                      <VIcon 
                        class="cursor-pointer"
                        icon="tabler-square-rounded-x-filled" 
                        color="error" 
                        @click="clearFile"
                      />
                    </div>
                    <div class="text-center px-10 py-10">
                      <VImg :src="iconcsv" height="48" aspect-ratio="1" />
                      <div class="pt-1 text-center line-height text-caption ">
                        {{ file.name }}
                      </div>
                      <div class="pt-1 line-height text-caption font-weight-semibold">
                        {{ Math.round((file.size / 1024) * 100) / 100 }} KB
                      </div>
                    </div>
                  </VCard>
                  <DragAndDropZone 
                    v-else
                    component-id="importar-candidato" 
                    label="Cargar" 
                    accepts="text/csv" 
                    @drop.prevent="onDropFile" 
                    @change="onSelectedFile" 
                  >
                    <div class="text-center px-10 py-10">
                      <VImg :src="fileImage" height="48" aspect-ratio="1" />
                      <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                        {{ t('candidates.upload.unselectfile') }}
                      </div>
                    </div>
                  </DragAndDropZone>
                </VCol>
                <VCol cols="12" md="6" class="d-flex align-center order-md-first">
                  <div>
                    <template v-if="!file">
                      <label 
                        for="browser"
                        class="v-btn v-btn--elevated v-theme--light bg-primary 
                        v-btn--density-default rounded-pill v-btn--size-default 
                        v-btn--variant-elevated cursor-pointer"
                      >
                        {{ t('candidates.upload.selectfile') }}
                        <VIcon class="ms-2" icon="tabler-upload" />
                      </label>
                      <input id="browser" type="file" class="d-none" accept="text/csv" @change="onSelectedFile"> 
                    </template>

                    <div class="text-caption text-primary mt-4">
                      <div>
                        {{ t('candidates.upload.file_max_size', { limit: '5 MB' }) }}
                      </div>
                      <div>
                        {{ t('candidates.upload.file_types', { type: '.csv' }) }}
                      </div>
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCard>
            <div v-if="file" class="my-4 text-right">
              <VBtn class="mx-2 notAllowedEmulator" @click="handlerSubmit">
                {{ t('common.btn_upload') }}
              </VBtn>
              <VBtn variant="outlined" @click="handlerReset">
                {{ t('common.btn_cancelar') }}
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VCardText>
      <VCardText v-else>
        <div class="text-primary font-weight-semibold">
          {{ t('candidates.upload.title_import_response') }}
        </div>
        <VDivider class="mb-4" :thickness="2" />
        <VRow class="justify-center mb-3">
          <VCol cols="12" sm="6" md="4">
            <VTable border class="text-body-2">
              <tr>
                <td rowspan="3">
                  <div class="d-flex flex-column align-center">
                    <div class="text-h4">
                      {{ importResponse.totalRecords }}
                    </div>
                    <div class="text-body-2">
                      {{ t('candidates.upload.total_records') }}
                    </div>
                  </div>
                </td>
                <td width="150">
                  <div class="d-flex justify-space-between">
                    <div class="d-flex align-center"> 
                      <VIcon 
                        icon="tabler-check" 
                        color="success" size="20" 
                        class="me-2"
                      />
                      <span>{{ t('candidates.upload.total_success') }}</span>
                    </div>
                    <div>{{ importResponse.totalRecords - importResponse.errors }}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="150">
                  <div class="d-flex justify-space-between">
                    <div class="d-flex align-center">
                      <VIcon 
                        icon="tabler-x" 
                        color="error" 
                        size="20"
                        class="me-2"
                      />
                      <span>{{ t('candidates.upload.total_error') }}</span>
                    </div>
                    <div>{{ importResponse.errors }}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="150">
                  <div class="d-flex justify-space-between">
                    <div class="d-flex align-center"> 
                      <VIcon 
                        icon="tabler-alert-triangle" 
                        color="warning" size="20" 
                        class="me-2"
                      />
                      <span>{{ t('candidates.upload.total_warning') }}</span>
                    </div>
                    <div>{{ importResponse.warnings }}</div>
                  </div>
                </td>
              </tr>
            </VTable>
          </VCol>
        </VRow>
        <p
          v-if="importResponse.completed" cols="12" 
          class="text-body-1 text-center text-success"
        >
          El archivo fue procesado con éxito.
        </p>
        <p v-else cols="12" class="text-body-1 text-center text-error">
          El archivo no fue procesado debido a los siguientes incidentes presentados.
        </p>
        <VDivider v-if="importResponse.errorsList.length > 0" />
        <DataTable 
          v-if="importResponse.errorsList.length > 0"
          :fields="importFieldsTable" 
          :items="importResponse.errorsList" 
          paginate
        >
          <template #cell(type)="{ value }">
            <VIcon v-if="value == 'WARNING'" icon="tabler-alert-triangle" color="warning" />
            <VIcon v-else icon="tabler-x" color="error" />
          </template>  
          <template #cell(key)="{ value }">
            <div class="text-center">
              {{ value != 'import-file' ? value : '' }}
            </div>
          </template>
          <template #cell(description)="{ value }">
            <div class="text-wrap">
              {{ value }}
            </div>
          </template>  
        </DataTable>
        <div class="text-center">
          <VBtn variant="outlined" @click="handlerReset">
            {{ t('candidates.upload.upload_new_file') }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.close {
  position: absolute;
  z-index: 1;
  inset-block-start: 0;
  inset-inline-end: 0;
}
</style>
