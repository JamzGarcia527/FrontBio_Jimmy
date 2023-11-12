<!-- eslint-disable promise/no-nesting -->
<script setup>
import ModalCancelE7 from './components/modalCancelE7.vue'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'
import Swal from '@/plugins/sweetalert2'


const props = defineProps({
  inscriptionId: { type: Number, required: true },
})

const { t } = useI18n()
const router = useRouter()

const showModal = ref(false)
const isLoading = ref(false)

const close = item => showModal.value = item
const open = () => showModal.value = true

const onCancelE7 = form => {
  isLoading.value = true

  const formData = new FormData()

  formData.append("file", form.file)
  formData.append("motive", form.motive === null || form.motive === "" ? '-1' : form.motive)
  formData.append("inscriptionChangeId", props.inscriptionId)

  axios.post('/v1/inscription-change/cancel-e7', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(() => {
    showModal.value = false
    isLoading.value = false

    Swal.fire({ 
      icon: "success", 
      text: t('tabSummary_e7.cancel.success_cancel'), 
    }).then(() => {
      router.replace({ name: 'inscription-modifies-list' })
    })  

  }).catch(error => {
    if (error.response && error.response.status <= 500) {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
    }
  }).finally(() => isLoading.value = false)
}
</script>

<template>
  <div>
    <VCard class="rounded-lg" variant="outlined" @click="showModal = true">
      <div class="d-flex justify-center align-center text-primary pa-2 h-100">
        <VIcon icon="tabler-trash" size="48" />
        <div class="line-height font-weight-bold" style="width: 70%;">
          {{ t('tabSummary_e7.cancel.title_card') }}
        </div>
      </div>
    </VCard> 

    <ModalCancelE7
      :show-modal="showModal"
      :is-loading="isLoading"
      @close-modal="close" 
      @cancel-e7="onCancelE7"
      @open-modal="open"
    />
  </div>
</template>
