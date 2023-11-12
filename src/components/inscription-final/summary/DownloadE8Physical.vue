<script setup>
import axios from '@/plugins/axios'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import Swal from '@/plugins/sweetalert2'
import { useInscriptionFinal } from '@/stores/inscriptionFinal'
import { downloadBlob } from '@/utils'
import { useI18n } from 'vue-i18n'

import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'
import { requiredVuelidate } from '@/utils/validators/vuelidate'
import { useVuelidate } from '@vuelidate/core'

import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
})

const { t } = useI18n()
const { can } = useAppAbility()
const inscriptionFinal = useInscriptionFinal()

const radicate = computed(() => inscriptionFinal.radicate)

const isLoading = ref(false)
const infoDoc = ref({ hasPhysicalDoc: false })

const canUpload = computed(() => !infoDoc.value.hasPhysicalDoc && can('update-physical-doc', 'inscription-final'))
const canDelete = computed(() => !!infoDoc.value.hasPhysicalDoc && can('delete-physical-doc', 'inscription-final'))

const getInfoDoc = () => {
  axios
    .get(`/v1/inscription-final/infodoc/${props.inscriptionId}`)
    .then(({ data }) => infoDoc.value = data)
}

const download = async () =>  {
  isLoading.value = true
  try {
    const { data } = await axios.get(`/v1/inscription-final/download/${props.inscriptionId}/physical`, { responseType: 'blob' })
    
    downloadBlob(data, `${radicate.value}.pdf`, { type: 'application/pdf' })
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
  }
  setTimeout(() => isLoading.value = false, 1000)
}

const handleDelete = async () =>  {
  Swal.fire({
    title: "¿Estas seguro de eliminar documento?",
    icon: "question",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Eliminar",
    showLoaderOnConfirm: true,
    preConfirm: async () => {      
      try {
        await axios.delete(`/v1/inscription-final/physical-doc`, {
          params: {
            inscriptionChangeId: props.inscriptionId,
            radicate: radicate.value,
          },
        })
        getInfoDoc()
        Swal.fire({ text: "¡Formulario firmado eliminado!", icon: "success" })

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

onMounted(() => {
  getInfoDoc()
})

//  Cargar documento

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
    html: `¿ Estas seguro de cargar documento firmado ${radicate.value} ?`,
    icon: "question",
    customClass: { confirmButton: "bg-primary notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        const formData = new FormData()

        formData.append('inscriptionChangeId', props.inscriptionId)
        formData.append('radicate', radicate.value)
        formData.append('file', form.value.file)

        await axios.put(`/v1/inscription-final/physical-doc`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        getInfoDoc()
        Swal.fire({ icon: "success", text: "¡Documento Cargado!" })
        clear()
        dialog.value = false
        
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
  <div>
    <div v-if="infoDoc.hasPhysicalDoc" class="py-1">
      <VCard class="rounded-lg" variant="outlined" @click="download">
        <div class="d-flex justify-center align-center text-primary pa-2">
          <template v-if="isLoading">
            <VProgressCircular size="48" indeterminate />
          </template>
          <template v-else>
            <VIcon icon="tabler-writing-sign" size="48" class="me-3" />
            <div class="w-50 line-height font-weight-bold">
              {{ t('tabSummary.download_e7.title_card_physical') }}
            </div>
          </template>
        </div>
      </VCard>
    </div>
    <div v-if="canDelete" class="py-3">
      <VCard class="rounded-lg border border-error" @click="handleDelete">
        <div class="d-flex justify-center align-center text-error pa-2">
          <VIcon icon="tabler-trash" size="48" />
          <div class="w-50 line-height font-weight-bold">
            Eliminar Documento Firmado
          </div>
        </div>
      </VCard> 
    </div>
    <div v-if="canUpload" class="py-3">
      <VDialog
        v-if="canUpload"
        v-model="dialog"
        class="v-dialog-sm"
        transition="dialog-bottom-transition"
        persistent
      >
        <template #activator="{ props: dialogProps }">
          <VCard v-bind="dialogProps" class="rounded-lg" variant="outlined">
            <div class="d-flex justify-center align-center text-primary pa-2">
              <VIcon icon="tabler-upload" size="48" />
              <div class="w-50 line-height font-weight-bold">
                Cargar Formulario Firmado
              </div>
            </div>
          </VCard>   
        </template>

        <!-- Dialog close btn -->
        <DialogCloseBtn @click="() => dialog = false" />

        <VCard title="Cargar Formulario Firmado">
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
                    <span class="ml-2">Formulario Firmado</span>
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
              </VRow>
            </VCardText>
            <VCardText class="text-center">
              <VBtn type="submit" class="mx-2" :loading="isLoading">
                {{ t('common.btn_submit') }}
              </VBtn>
              <VBtn type="button" variant="outlined" class="mx-2" @click.prevent="dialog = false">
                {{ t('common.btn_cancelar') }}
              </VBtn>
            </VCardText>
          </VForm>
        </VCard>
      </VDialog>
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
