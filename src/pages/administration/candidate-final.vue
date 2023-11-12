<script setup>
import axios from '@/plugins/axios'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { can } = useAppAbility() 

const isDownloading = ref(false)
const isBuilding = ref(false)

const fileName = ref('')

const build = async () =>  {
  
  isBuilding.value = true
  try {
    await axios.post(`/v1/candidate-final/generate`)
    setTimeout(() => {
      isBuilding.value = false
      Swal.fire('', 'Operación Exitosa', 'success')
    }, 5000)
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
  }
}


const download = async () =>  {
  isDownloading.value = true

  axios.get(`/v1/candidate-final/download`,  { responseType: "blob" })
    .then(({ headers, data }) => {
      const filename = headers['x-custom-filename'] ?? ""

      downloadBlob(data, filename) 
    }).catch(async e => {
      let text = 'No es posible realizar operación, por favor intenta más tarde.'
      if (e.response) {
        const { data } = e.response
        const response = data instanceof Blob ? JSON.parse(await data.text()) : data

        text = response.message
      }
      Swal.fire({ icon: 'warning', text: text })
    }).finally(() => isDownloading.value = false)
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('opening_preinscription.breadcrumbs.title'), 'Generar Archivo de Candidatos Definitivo' ]" />
    <VCard>
      <VCardText>
        <VRow justify="center">
          <VCol v-if="can('generate-file-final', 'candidate-final')" cols="12" sm="6">
            <VBtn 
              height="80px" 
              block rounded="lg" 
              variant="outlined" 
              :loading="isDownloading" 
              :disabled="isBuilding"
              @click="download"
            >
              <template #loader>
                <VProgressCircular size="48" indeterminate />
              </template>

              <VIcon icon="tabler-download" size="48" class="me-2" />
              <div class="text-body-1 font-weight-bold text-primary">
                Descargar Archivo  
              </div>
            </VBtn>
          </VCol>
          <VCol v-if="can('download-file-final', 'candidate-final')" cols="12" sm="6">
            <VBtn 
              height="80px" 
              block rounded="lg" 
              variant="outlined" 
              :loading="isBuilding" 
              :disabled="isDownloading"
              @click="build"
            >
              <template #loader>
                <VProgressCircular size="48" indeterminate />
              </template>

              <VIcon icon="tabler-file-dots" size="48" class="me-2" />
              <div class="text-body-1 font-weight-bold text-primary">
                Generar Archivo  
              </div>
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "administration-candidate-final"
meta:
  authRequired: true
</route>
