<script setup>
import Filter from '@/components/download-massive-E6/Filter.vue'
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import Swal from '@/plugins/sweetalert2'

const filtersControl = reactive({ loading: false, loading: false })
const clearForm = ref(false)
const { t } = useI18n()

const handlerDownloadE6 = async value => {
  const { department, municipality, commune, corporationId, circunscriptionId, groupingPoliticalId } = value
  const queryParams = { department, municipality, commune, corporationId, circunscriptionId, groupingPoliticalId }
  try {
    filtersControl.loading = true
    filtersControl.disabled = true

    const response = await axios.get('/v1/inscription-approval/download/massive/zip', {
      params: queryParams,
      responseType: 'blob', // Indicar que la respuesta es de tipo Blob
    })

    if (response.data) {
      clearForm.value = true
    }

    // Crear una URL del objeto Blob de la respuesta para descargar el archivo ZIP
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')

    link.href = downloadUrl
    link.setAttribute('download', 'formularios_E6.zip')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response
      if (error.response.status == 400) {
        await Swal.fire({
          icon: 'warning',
          text: 'No se encontraron elementos en la búsqueda',
        })

        return false
      }
      await Swal.fire({
        icon: 'warning',
        text: message || t('sketches_pending.not_operation'),
      })

      return false
    }
  } finally {
    filtersControl.loading = false
    filtersControl.disabled = false
  }
}

const handlerCleanedForm = () => {
  clearForm.value = false
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('candidates.eis.breadcrumbs.title'), 'Descarga masiva de Formularios E6' ]" />
    <Filter 
      :loading="filtersControl.loading"
      :disabled="filtersControl.disabled"
      :clear-form="clearForm"
      @cleaned-form="handlerCleanedForm"
      @next="handlerDownloadE6"
    />
  </div>
</template>

<route lang="yaml">
name: "download-massive"
meta:
  authRequired: true
</route>
