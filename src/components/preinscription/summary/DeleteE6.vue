<script setup>
import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { requiredVuelidate, maxLengthVuelidate } from '@/utils/validators/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
})

const { t } = useI18n()
const router = useRouter()

const isLoading = ref(false)
const dialog = ref(false)

const fileImage = computed(() => form.file ? iconpdf : unselectfile)
const clearFile = () => form.value.file = null

// Properties
const allowExtDocument = ['pdf']
const maxSizeFile = 1024 * 1024 * 1 // 1 MB

const onSelectedFile = e => {
  const uploadfile = e.target.files[0]

  form.value.file = validFileDocument(uploadfile) ? uploadfile : null
}
  
const onDropFile = e => {
  const uploadfile = e.dataTransfer.files[0]

  form.value.file = validFileDocument(uploadfile) ? uploadfile : null
}

const validFileDocument = value => {
  if (value.size > maxSizeFile) {
    Swal.fire({ text: 'El archivo excede el peso permitido.', icon: 'warning' })
    
    return false
  }

  const ext = value.name.split('.').pop().toLowerCase()
  if (!allowExtDocument.includes(ext)) {
    Swal.fire({ text: 'El archivo no cumple con una extensión permitida.', icon: 'warning' })
    
    return false
  }

  return true
}

const form = ref({})

const rules = computed(() => ({
  observation: { requiredVuelidate, maxLength: maxLengthVuelidate(500) },
  file: { requiredVuelidate },
}))

const v$ = useVuelidate(rules, form)

const clear = () => {
  v$.value.$reset()
  form.value = {}
}

const handlerSubmit = () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  Swal.fire({
    html: "¿ Desea eliminar esta inscripción ?",
    icon: "question",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        const formData = new FormData()

        formData.append('observation', form.value.observation)
        formData.append('file', form.value.file)

        await axios.post(`v1/inscriptions/delete/${props.inscriptionId}`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        await Swal.fire({ icon: "success", text: "Inscripción eliminada" })
        router.replace({ name: 'preinscription-list' })
        
        return true
      } catch (error) {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
      
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })

  
}


watch(dialog, () => clear())
onUnmounted(() => clear())
</script>

<template>
  <VDialog
    v-model="dialog"
    class="v-dialog-sm"
    transition="dialog-bottom-transition"
    persistent
  >
    <template #activator="{ props: dialogProps }">
      <VCard v-bind="dialogProps" class="rounded-lg border border-error" variant="flat">
        <div class="d-flex justify-center align-center text-error pa-2">
          <VIcon icon="tabler-trash" size="48" />
          <div class="w-50 line-height font-weight-bold">
            Eliminar Inscripción
          </div>
        </div>
      </VCard>   
    </template>

    <!-- Dialog close btn -->
    <DialogCloseBtn @click="() => dialog = false" />

    <VCard title="Eliminar Inscripción">
      <VDivider class="mt-2" />
      <VForm @submit.prevent="handlerSubmit">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VCard v-if="form.file" variant="outlined" class="w-100">
                <div class="close">
                  <VIcon 
                    class="cursor-pointer"
                    icon="tabler-square-rounded-x-filled" 
                    color="error" 
                    @click="clearFile"
                  />
                </div>
                <span class="ml-2">Documento De Soporte</span>
                <div class="text-center px-10 py-10">
                  <VImg :src="iconpdf" height="48" aspect-ratio="1" />
                  <div class="pt-1 text-center line-height text-caption ">
                    {{ form.file.name }}
                  </div>
                  <div class="pt-1 line-height text-caption font-weight-semibold">
                    {{ Math.round((form.file.size / 1024) * 100) / 100 }} KB
                  </div>
                </div>
              </VCard>
              <DragAndDropZone 
                v-else
                component-id="support-delete" 
                label="Cargar" 
                accepts="application/pdf" 
                @drop.prevent="onDropFile" 
                @change="onSelectedFile" 
              >
                <div class="text-center px-10 py-10">
                  <VImg :src="fileImage" height="48" aspect-ratio="1" />
                  <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                    Cargar Soporte <br>
                    <span v-if="v$.file.$errors" class="text-error">{{ v$.file.$errors[0]?.$message }}</span>
                  </div>
                  <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                    Tamaño máximo: {{ maxSizeFile / (1024 * 1024) }} MB <br>
                  </div>
                  <div class="text-center line-height text-caption font-weight-semibold">
                    Formato de archivo: {{ allowExtDocument.join(', ') }} <br>
                  </div>
                </div>
              </DragAndDropZone>
            </VCol>
            <VCol cols="12">
              <VTextarea 
                v-model="form.observation" 
                label="Observación" 
                rows="5" 
                counter 
                :error-messages="v$.observation.$errors[0]?.$message"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="text-center">
          <VBtn type="submit" class="mx-2" color="error" :loading="isLoading">
            {{ t('common.btn_delete') }}
          </VBtn>
          <VBtn type="button" variant="outlined" color="error" class="mx-2" @click.prevent="dialog = false">
            {{ t('common.btn_cancelar') }}
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
