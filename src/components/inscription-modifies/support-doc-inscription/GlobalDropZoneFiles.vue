<script setup>
import { ref, toRefs, watch } from 'vue'
import DropZone from '@/components/shared/DropZone.vue'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import useEventsBus from '@/utils/eventBus'

//props que reciben data del padre
const props = defineProps({
  supportingDocuments: { type: Object, required: true },
  inscriptionId: { type: Number, required: true },
})

const { emit } = useEventsBus()

const allowExt = ['pdf', 'PDF']
const maxSizeFile = 1024 * 1024 // 1MB
const file = ref(null)
const isLoading = ref(false)


const clearFile = () => {
  file.value = null
}
  
const onSelectedFile = e => {
  const uploadfile = e.target.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null

  if (file.value != null) {
    
    submitFile()
  }
}
  
const onDropFile = e => {
  const uploadfile = e.dataTransfer.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null

}
  
const validFile = uploadfile => {
  
  if (uploadfile.size > maxSizeFile) {
    

    Swal.fire({
      title: 'Lo sentimos',
      text: 'El archivo excede el peso permitido.',
      icon: 'warning',
      confirmButtonText:'Aceptar',
    }) 
    
    return false
  }
  
  const ext = uploadfile.name.split('.').pop()
  if (!allowExt.includes(ext)) {
    
    Swal.fire({
      title: 'Lo sentimos',
      text: 'El archivo no cumple con una extensión permitida.',
      icon: 'warning',
      confirmButtonText:'Aceptar',
    }) 
    
    return false
  }
  
  return true
}
  
const submitFile = () => {
  isLoading.value = true
  
  const formData = new FormData()

  formData.append('file', file.value)
  formData.append('inscriptionId', props.inscriptionId)
  formData.append('inscriptionChangeSupportingId', props.supportingDocuments.id)
  formData.append('supportingDocumentsId', props.supportingDocuments.supportingDocumentsId)
  
  axios
    .post('v1/files/inscription-change-supporting-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(() => {
      emit('updateSupportDocs', true)
      emit('reload', true)

      Swal.fire({
        title: "¡Cargue Exitoso!",
        icon: "success",
      })

      isLoading.value = false
  
      clearFile()     
    })
    .catch(error => {

      isLoading.value = false

      const { message: text = '¡Error no se puede subir el archivo!' } = error?.response?.data || {}

      Swal.fire({ title: 'Lo sentimos', text, icon: 'error', confirmButtonText:'Aceptar' })
    })
}
</script>

<template>
  <div class="card-body my-3">
    <div class="home mx-auto" style="width: 190px;">
      <div v-if="file" class="border rounded">
        <div class="d-flex align-items-center p-2">
          <div class="flex-grow-1">
            <div class="pt-1">
              <h5 class="fs-14 mb-1" data-dz-name="">
                {{ file.name }}
              </h5>
              <p class="fs-13 text-muted mb-0" data-dz-size="">
                <strong>{{ Math.round((file.size / 1024) * 100) / 100 }}</strong> KB
              </p>
              <strong class="error text-danger" data-dz-errormessage="" />
            </div>
          </div>
          <div class="flex-shrink-0 ms-3 p-relative">
            <div class="close">
              <VIcon 
                class="cursor-pointer"
                icon="tabler-square-rounded-x-filled" 
                color="error" 
                @click="clearFile"
              />
            </div>
          </div>
        </div>
      </div>
      <DropZone v-else-if="!isLoading" :num-id="supportingDocuments.id" accepts=".pdf" @drop.prevent="onDropFile" @change="onSelectedFile" />
      <VProgressCircular v-if="isLoading" class="text-center ms-12 px-12" size="30" indeterminate />
    </div>

    <!-- end dropzon-preview -->
    <div class="text-center mt-2">
      <VBtn
        v-if="file" 
        id="btnSend"
        variant="outlined"
        color="primary"
        size="small"
        @click="submitFile"
      >
        Enviar
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss">
.p-relative {
  position: relative;
}

.close {
  position: absolute;
  z-index: 1;
  inset-block-start: 0;
  inset-inline-end: 0;
}
</style>

