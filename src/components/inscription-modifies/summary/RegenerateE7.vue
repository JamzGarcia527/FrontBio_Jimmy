<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  radicate: { type: String, required: true },
})

const { t } = useI18n()

const isLoading = ref(false)
const isLoadingRegenerate = ref(false)
const fileUrl = ref(null)
const dialog = ref(false)
const error = ref(null)

const clear = () => {
  if (fileUrl) URL.revokeObjectURL(fileUrl)
}

const mounted = async () =>  {
  isLoading.value = true
  error.value = null
  clear()
  try {
    const { data } = await axios.get(`v1/inscription-change-approval/preview/${props.inscriptionId}`, { responseType: 'blob' })
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


const regenerate = async () =>  {
  dialog.value = false

  Swal.fire({
    title: "Ingresar contraseña de confirmación",
    input: "password",
    inputPlaceholder: "Contraseña de confirmación",
    showCancelButton: true,
    customClass: { 
      confirmButton: "bg-primary notAllowedEmulator",
      cancelButton: "bg-danger",
    },
    showLoaderOnConfirm: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Regenerar",
    preConfirm: async password => {
      if (String(password).trim().length == 0) {
        Swal.showValidationMessage("La observación es obligatoria")
        
        return false
      }
      
      try {
        await axios.post(`v1/inscription-change-approval/regenerate`, {
          inscriptionId: props.inscriptionId,
          radicate: props.radicate,
          password: password,
        })
        dialog.value = false
        
        Swal.fire({ text: "Documento Regenerado", icon: "success" })

        return true
      } catch (e) {
        let text = 'No es posible realizar operación, por favor intenta más tarde.'
        if (e.response && e.response.status < 500) {
          const { data } = e.response

          text = data.message
        }
        Swal.fire({ text, icon: "warning" })
        
        return false
      }
    },
    allowOutsideClick: false,
  })  
}

watch(dialog, value => {
  if (value) mounted()
  else clear()
})

onUnmounted(() => clear())
</script>

<template>
  <VDialog
    v-model="dialog"
    class="v-dialog-lg"
    transition="dialog-bottom-transition"
    persistent
  >
    <template #activator="{ props: dialogProps }">
      <VCard v-bind="dialogProps" class="rounded-lg" variant="outlined">
        <div class="d-flex justify-center align-center text-primary pa-2">
          <VIcon icon="tabler-file-digit" size="48" />
          <div class="w-50 line-height font-weight-bold ms-2">
            Regenerar Documento
          </div>
        </div>
      </VCard>   
    </template>

    <!-- Dialog close btn -->
    <DialogCloseBtn @click="() => dialog = false" />

    <VCard title="Previsualizar Formulario E7 de Modificación">
      <VDivider class="mt-2" />
      <VCardText 
        v-if="isLoading" 
        class="d-flex justify-center align-center" 
        style="height: 70vh;"
      >
        <VProgressCircular size="60" indeterminate />
      </VCardText>
      <VCardText v-else-if="error && error.length > 0">
        <div class="d-flex align-center text-h5 mb-2">
          <VIcon icon="tabler-alert-triangle" color="warning" class="me-2" /> 
          <div>¡Lo sentimos!</div>
        </div>
        <p>{{ error }}</p>
      </VCardText>  
      <template v-else>
        <embed
          :src="`${fileUrl}#toolbar=0`" 
          type="application/pdf" 
          width="100%"
          style="height: 70vh;"
        >
        <VDivider />
        <VCardText class="text-center">
          <VBtn 
            prepend-icon="tabler-file-digit" 
            class="w-25" @click="regenerate"
          >
            Regenerar
          </VBtn>
        </VCardText>
      </template>
    </VCard>
  </VDialog>
</template>
