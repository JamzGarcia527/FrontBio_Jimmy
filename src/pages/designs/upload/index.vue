<script setup>
import { useI18n } from 'vue-i18n'
import icondat from '@images/icon/dat.png'
import unselectfile from '@images/icon/unselectfile.png'
import banner from '@images/pages/dialog-banner-sm.webp'

import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'
import DataTable from '@/components/shared/DataTable.vue'

import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

const { t } = useI18n()
const isLoading = ref(false)
const file = ref(null)
const importResponse = ref(null)
const isDialogVisible = ref(false)

const importFieldsTable = [
  { key: 'type', label: ' ' },
  { key: 'key', label: 'Identificador', thClass: 'text-center' },
  { key: 'description', label: 'Descripción' },
]

const importStatsFieldsTable = [
  { key: 'name', label: 'Corporación', thClass: 'text-left bg-primary' },
  { key: 'cards', label: 'Tarjetas', thClass: 'text-center bg-primary' },
  { key: 'guides', label: 'Guias', thClass: 'text-center bg-primary' },
]

const breadcrumbs = [
  t('common.home'),
  t('design.module_name'),
  t('design.upload.page_title'),
]

const fileImage = computed(() => file.value ? icondat : unselectfile)

const allowExt = ['dat']
const accepts = '.dat'
const textMaxSize = 100
const maxSizeFile = 1024 * textMaxSize // 20 MB

const clearFile = () => file.value = null

const validFile = value => {
  if (value.size > maxSizeFile) {
    Swal.fire({ text: 'El archivo excede el peso permitido.', icon: 'warning' })
    
    return false
  }

  const ext = value.name.split('.').pop().toLowerCase()
  if (!allowExt.includes(ext)) {
    Swal.fire({ text: 'El archivo no cumple con una extensión permitida.', icon: 'warning' })
    
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

const handlerReset = () => {
  file.value = null
  importResponse.value = null
}


const showSkipped = () => {
  isDialogVisible.value = true
}

const handlerSubmit = async () => {
  if (isLoading.value) return false
  isLoading.value = true

  const formData = new FormData()

  formData.append('file', file.value)

  axios.post('/v1/card-designs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(({ data }) => {
    file.value = null
    importResponse.value = data
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    } else {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
    }
  }).finally(() => isLoading.value = false)
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="breadcrumbs" /> 
    <VRow class="vh-60 justify-center align-center">
      <VCol cols="12" md="10" xl="8">
        <VCard>
          <VImg :src="banner" height="120" cover />
          <div class="mt-4 text-center text-h6 font-weight-semibold">
            {{ t('design.upload.page_title') }}
          </div>
          <!--
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
            append-icon="tabler-download" 
            >
            {{ t('common.btn_download') }}
            </VBtn>
            <div class="ms-6 me-2">
            <VImg :src="iconzip" width="48" height="48" aspect-ratio="1" />
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
            append-icon="tabler-download"
            >
            {{ t('common.btn_download') }}
            </VBtn>
            <div class="ms-6 me-2">
            <VImg :src="iconzip" width="48" height="48" aspect-ratio="1" />
            </div>
            <div class="text-caption font-weight-bold line-height">
            Estructura del <br>
            archivo.csv
            </div>
            </VCol>
            </VRow>
            </VCardText>
          -->
          <VCardText 
            v-if="isLoading"
            class="d-flex justify-center align-center" 
            style="height: 40vh;"
          >
            <VProgressCircular size="60" indeterminate />
          </VCardText>
          <VCardText v-else-if="!importResponse">
            <!--
              <div class="text-primary font-weight-semibold">
              {{ t('candidates.upload.title_upload_file') }}
              </div>
              <VDivider class="mb-4" :thickness="2" />
            -->
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
                          <VImg :src="icondat" height="48" aspect-ratio="1" />
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
                        class="w-100"
                        component-id="importar-candidato" 
                        label="Cargar" 
                        :accepts="accepts" 
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
                          <input id="browser" type="file" class="d-none" :accept="accepts" @change="onSelectedFile"> 
                        </template>

                        <div class="text-caption text-primary mt-4">
                          <div>
                            {{ t('design.upload.file_max_size', { limit: `${textMaxSize} KB` }) }}
                          </div>
                          <div>
                            {{ t('design.upload.file_types', { type: accepts }) }}
                          </div>
                        </div>
                      </div>
                    </VCol>
                  </VRow>
                </VCard>
                <div v-if="file" class="my-4 text-right">
                  <VBtn class="mx-2 notAllowedEmulator" :loading="isLoading" @click="handlerSubmit">
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
              <VCol cols="8" sm="6" md="4">
                <VRow>
                  <VCol cols="4">
                    <div class="d-flex flex-column align-center">
                      <div class="text-h4">
                        {{ importResponse.totalRecords }}
                      </div>
                      <div class="text-body-2">
                        {{ t('candidates.upload.total_records') }}
                      </div>
                    </div>
                  </VCol>
                  <VCol cols="8">
                    <div>
                      <div class="d-flex justify-space-between">
                        <div class="d-flex align-center"> 
                          <VIcon 
                            icon="tabler-check" 
                            color="success" 
                            size="20" 
                            class="me-2"
                          />
                          <span>{{ t('candidates.upload.total_success') }}</span>
                          <div class="d-flex align-center ps-8">
                            {{ importResponse.totalRecords - importResponse.errors - (importResponse.repeated ?? 0) }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!--
                      <div>
                      <div class="d-flex justify-space-between">
                      <div class="d-flex align-center"> 
                      <VIcon 
                      icon="tabler-alert-triangle" 
                      color="warning" size="20"
                      class="me-2"
                      />
                      <span>{{ t('candidates.omitted') }}</span>
                      <div class="d-flex align-center ps-9">
                      {{ importResponse.repeated }}
                      <div class="ps-5">
                      <VIcon
                      v-if="importResponse.repeated"
                      icon="tabler-eye"
                      variant="text"
                      color="secondary"
                      size="20"
                      @click="showSkipped"
                      />
                      </div>
                      </div>
                      </div>
                      </div>
                      </div>
                    -->
                    <div>
                      <div class="d-flex justify-space-between">
                        <div class="d-flex align-center">
                          <VIcon 
                            icon="tabler-x" 
                            color="error" 
                            size="20"
                            class="me-2"
                          />
                          <span>{{ t('candidates.upload.total_error') }}</span>
                          <div class="d-flex align-center ps-14">
                            {{ importResponse.errors }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
            <!--
              <p
              v-if="importResponse.completed" cols="12" 
              class="text-body-1 text-center text-success"
              >
              El archivo fue procesado con éxito.
              </p>
              <p v-else cols="12" class="text-body-1 text-center text-error">
              El archivo no fue procesado debido a los siguientes incidentes presentados.
              </p>
            -->

            <VRow class="justify-center mb-5">
              <VCol cols="12" md="8">
                <VDivider />
                <DataTable 
                  :fields="importStatsFieldsTable" 
                  :items="importResponse.stats"
                >
                  <template #cell(cards)="{ value }">
                    <div class="text-center">
                      {{ value ?? 0 }}
                    </div>
                  </template>
                  <template #cell(guides)="{ value }">
                    <div class="text-center">
                      {{ value ?? 0 }}
                    </div>
                  </template>
                </DataTable>
              </VCol>
            </VRow>

            <VRow v-if="importResponse.errorsList.length > 0">
              <VCol cols="12">
                <VDivider />
                <DataTable 
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
              </VCol>
            </VRow>

            <div class="text-center mt-5">
              <VBtn variant="outlined" @click="handlerReset">
                {{ t('candidates.upload.upload_new_file') }}
              </VBtn>
            </div>
          </VCardText> 
        </VCard>
      </VCol>
    </VRow>

    <VDialog
      v-model="isDialogVisible" width="800"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

      <!-- Dialog Content -->
      <VCard class="text-wrap">
        <VImg
          :src="banner"
          cover
        />
        <div class="mt-2">
          <DataTable 
            :fields="importFieldsTable" 
            :items="importResponse.errorsRepeated" 
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
        </div>

        <VCardText class="d-flex justify-end">
          <VBtn @click="isDialogVisible = false">
            {{ t('coalitions.btn_close_modal') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss">
.vh-60 {
  min-block-size: 60vh !important;
}

.close {
  position: absolute;
  z-index: 1;
  inset-block-start: 0;
  inset-inline-end: 0;
}
</style>

<route lang="yaml">
name: "designs-upload"
meta:
  authRequired: true
</route>
