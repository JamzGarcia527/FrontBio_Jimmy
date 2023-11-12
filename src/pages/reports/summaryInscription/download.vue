<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'

const isDownloading = ref(false)

const download = () => {
  isDownloading.value = true

  axios.get(`/v1/inscriptions/summary/export/download`, { responseType: "blob" })
    .then(response => {
      // Extraer el nombre del archivo del encabezado "Content-Disposition"
      const contentDisposition = response.headers['content-disposition']
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(contentDisposition)
      const fileName = matches !== null && matches[1] ? matches[1] : 'resumen-inscripciones.zip'
    
      downloadBlob(response.data, fileName) 
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
  <div class="d-flex justify-center pa-5 my-10">
    <VCard v-if="!isDownloading" class="rounded-lg" width="250" @click="download">
      <div class="d-flex flex-column align-center text-primary pa-2">
        <VIcon icon="tabler-download" size="96" />
        <div class="text-center">
          Descargar Resumen de Inscripciones
        </div>
      </div>
    </VCard>
    <VCard v-if="isDownloading" class="rounded-lg" width="250" @click="download">
      <div class="d-flex flex-column align-center text-primary pa-2">
        <VProgressCircular size="72" class="ma-5" indeterminate color="primary" />
        <div class="text-center">
          Descargando...
        </div>
      </div>
    </VCard>
  </div>
</template>

<route lang="yaml">
  name: "reports-summaryInscription-download"
  meta:
  authRequired: true
</route>
