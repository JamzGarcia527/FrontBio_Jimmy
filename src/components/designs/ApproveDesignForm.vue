<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'

import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import banner from '@images/pages/dialog-banner-sm.webp'

import { useI18n } from 'vue-i18n'
import { useVuelidate } from '@vuelidate/core'

import { requiredVuelidate } from "@/utils/validators/vuelidate"
import { helpers } from '@vuelidate/validators'
import { useCustomMessage } from "@/composables/useCustomMessage"

const props = defineProps({
  currentDesign: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['saved', 'canceled'])

const responseMessage =  {
  1: 'Diseño aprobado',
  2: 'Diseño devuelto',
  3: 'Diseño aprobado parcialmente, Esta pendiente de la segunda aprobación.',
}

const file = ref(null)
const fileImage = computed(() => file.value ? iconpdf : unselectfile)

const allowExt = ['pdf']
const accepts = '.pdf'
const textMaxSize = 1
const maxSizeFile = 1024 * 1024 * textMaxSize // 1 MB

const clearFile = () => file.value = null
const messageComposable = useCustomMessage()

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


const isLoading = ref(false)

const form = ref({})

const rules = computed(() => ({
  observation: { requiredVuelidate },
  file: { required: helpers.withMessage('Este archivo es requerido', value => !!value) },
}))

const v$ = useVuelidate(rules, form)
const { t } = useI18n()

const handlerReset = () => {
  v$.value.$reset()
  form.value = {}
  file.value = null

  emit('canceled')
}

const handlerSave = async () => {
  form.value.file = file.value

  v$.value.$touch()
  if (v$.value.$invalid) return
  isLoading.value = true
  try {

    const formData = new FormData()

    formData.append('cardId', props.currentDesign.cardId)
    formData.append('observation', form.value.observation)
    formData.append('file', form.value.file)
    formData.append('status', props.currentDesign.action)

    const { data } = await axios.post('/v1/card-designs/approve', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    await Swal.fire({ icon: "success", text: responseMessage[data.message] })
    emit('saved')
  } catch (error) { 
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: messageComposable.get("MS0001") })
    } else {
      Swal.fire({ icon: "warning", text: messageComposable.get("MS0002") })
    }
  }
  isLoading.value = false
}
</script>

<template>
  <VCard v-if="currentDesign">
    <VImg :src="banner" height="90" cover />
    <div class="mt-4 text-center text-h6 font-weight-semibold">
      <template v-if="currentDesign.action == 1">
        {{ t('design.approve.approve_title') }}
      </template> 
      <template v-if="currentDesign.action == 2">
        {{ t('design.approve.reject_title') }}
      </template>
    </div>
    <VForm @submit.prevent="handlerSave">
      <VCardText>
        <VRow class="justify-center">
          <VCol cols="12" sm="6" md="5">
            <VTextarea 
              v-model="form.observation"
              class="mt-3"
              rows="10"
              no-resize
              :label="t('design.approve.observation')"
              :error-messages="v$.observation.$errors[0]?.$message"
            />
          </VCol>
          <VCol cols="12" sm="6" md="5">
            <VCard variant="plain" class="pa-4 mb-4">
              <VRow>
                <VCol cols="12" class="d-flex align-center">
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
                      <VImg :src="iconpdf" height="48" aspect-ratio="1" />
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
                    component-id="cargar-soporte" 
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
                <VCol cols="12" class="d-flex align-center">
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
                        {{ t('design.approve.file_max_size', { limit: `${textMaxSize} MB` }) }}
                      </div>
                      <div>
                        {{ t('design.approve.file_types', { type: accepts }) }}
                      </div>
                      <div v-if="v$.file.$error" class="text-error">
                        {{ v$.file.$errors[0]?.$message }}
                      </div>
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="text-center">
        <VBtn 
          v-if="currentDesign.action == 1" 
          type="submit" class="mx-2 notAllowedEmulator" 
          prepend-icon="tabler-file-check"
          :loading="isLoading"
        >
          {{ t('design.approve.btn_approve') }}
        </VBtn>
        <VBtn 
          v-if="currentDesign.action == 2" 
          type="submit" class="mx-2 notAllowedEmulator" 
          prepend-icon="tabler-file-x"
          :loading="isLoading"
        >
          {{ t('design.approve.btn_reject') }}
        </VBtn>
        <VBtn 
          type="button" 
          variant="outlined" 
          class="mx-2"
          :disabled="isLoading"
          @click.prevent="handlerReset"
        >
          {{ t('design.approve.btn_cancel') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>

<style lang="scss">
.close {
  position: absolute;
  z-index: 1;
  inset-block-start: 0;
  inset-inline-end: 0;
}
</style>
