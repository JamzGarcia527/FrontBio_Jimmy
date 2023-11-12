<script setup>
import banner from '@images/pages/dialog-banner-sm.webp'
import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'

import { toRefs, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n' 
import { useVuelidate } from "@vuelidate/core" 
import { helpers, maxLength, required } from '@vuelidate/validators'
import Swal from '@/plugins/sweetalert2'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: true,
  },
  labelSubmit: {
    type: String,
    default: "Anular",
  },
  labelCancel: {
    type: String,
    default: "Cancelar",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['closeModal', 'cancelE7', 'openModal'])

const maxCantidad = 1000
const maxSizeFile = 1024 * 1024 // 1 MB
const allowExt = ['pdf','PDF']

const { showModal, labelSubmit, labelCancel, isLoading } = toRefs(props)

const { t } = useI18n()

const form = reactive({
  motive: null,
  file: null,
})

const formClear = reactive({
  motive: null,
  file: null,
})

const rules = computed(() => ({
  motive: {
    maxLength: helpers.withMessage(t('validations.field_max', { count: maxCantidad }), maxLength(maxCantidad)),
  },
  file: {
    required: helpers.withMessage(t('validations.support_required'), required),
  },
}))

const $v = useVuelidate(rules, form)

const fileImage = computed(() => form.file ? iconpdf : unselectfile)

// Methods
const validFile = value => {
  if (value.size > maxSizeFile) {
    emit('closeModal', false)

    Swal.fire({ text: t('candidates.upload.text_file_max_size'), icon: 'warning' })
      .then(() => emit('openModal'))
    
    return false
  }

  const ext = value.name.split('.').pop().toLowerCase()
  if (!allowExt.includes(ext)) {
    emit('closeModal', false)

    Swal.fire({ text: t('candidates.upload.text_error_extension'), icon: 'warning' })
      .then(() => emit('openModal'))
    
    return false
  }

  return true
}

const clearFile = () => {
  form.file = null
  $v.value.$reset()
}

const onDropFile = e => {
  const uploadfile = e.dataTransfer.files[0]

  form.file = validFile(uploadfile) ? uploadfile : null

  $v.value.$reset()
}

const onSelectedFile = e => {
  const uploadfile = e.target.files[0]

  form.file = validFile(uploadfile) ? uploadfile : null
}

const handlerReset = () => {
  Object.assign(form, formClear)
  $v.value.$reset()
  emit('closeModal', false)
}

const handlerSubmit = () => {
  $v.value.$touch()

  if (!$v.value.$invalid) {
    emit('cancelE7', form)
  }
}
</script>

<template>
  <div>
    <VDialog
      v-model="showModal"
      max-width="800"
    >
      <DialogCloseBtn @click="emit('closeModal', false)" />
      
      <VImg :src="banner" cover />
      
      <VCard>
        <VCardText>
          <VForm @submit.prevent="handlerSubmit">
            <VRow justify="center">
              <VCol cols="12">
                <VTextarea
                  v-model="form.motive"
                  :disabled="isLoading"
                  :label="$t('tabSummary_e7.cancel.motive')"
                  :error-messages="$v.motive.$errors[0]?.$message"
                  :counter="maxCantidad"
                  rows="2"
                  @input="$v.motive.$touch()"
                />
              </VCol>

              <VCol cols="12" md="8">
                <VCard variant="outlined" class="pa-4 mb-4">
                  <VRow>
                    <VCol cols="12" md="6" class="d-flex align-center">
                      <VCard v-if="form.file" variant="outlined" class="w-100">
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
                            {{ form.file.name }}
                          </div>
                          <div class="pt-1 line-height text-caption font-weight-semibold">
                            {{ Math.round((form.file.size / 1024) * 100) / 100 }} KB
                          </div>
                        </div>
                      </VCard>
                      <DragAndDropZone 
                        v-else
                        component-id="cancel-e7" 
                        label="Cargar" 
                        accepts=".pdf" 
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
                        <template v-if="!form.file">
                          <label 
                            for="browser"
                            class="v-btn v-btn--elevated v-theme--light bg-primary v-btn--density-default rounded-pill v-btn--size-default v-btn--variant-elevated cursor-pointer"
                          >
                            {{ t('candidates.upload.selectfile') }}
                            <VIcon class="ms-2" icon="tabler-upload" />
                          </label>
                          <input id="browser" type="file" class="d-none" accept=".pdf" @change="onSelectedFile"> 
                        </template>

                        <div class="text-caption text-primary mt-4">
                          <div>
                            {{ t('candidates.upload.file_max_size', { limit: '1 MB' }) }}
                          </div>
                          <div>
                            {{ t('candidates.upload.file_types', { type: '.pdf' }) }}
                          </div>
                        </div>
                      </div>
                    </VCol>
                  </VRow>
                </VCard>

                <VRow>
                  <VCol v-if="$v.file.$errors[0]?.$message" class="py-0">
                    <span class="text-body-2 text-error">{{ $v.file.$errors[0]?.$message }}</span>
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                :disabled="isLoading"
                @click="handlerReset"
              >
                {{ labelCancel }}
              </VBtn>
              <VBtn :loading="isLoading" class="notAllowedEmulator" :disabled="isLoading" type="submit">
                {{ labelSubmit }}
              </VBtn>
            </VCardText>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
