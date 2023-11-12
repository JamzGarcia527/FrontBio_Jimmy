<script setup>
import axios from '@/plugins/axios'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
})

const { t } = useI18n()

const isLoading = ref(false)
const fileUrl = ref(null)
const allRightCheck = ref(false)
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
    const { data } = await axios.get(`/v1/inscription-change/preview/${props.inscriptionId}`, { responseType: 'blob' })
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
          <VIcon icon="tabler-file-text" size="48" />
          <div class="line-height font-weight-bold" style="width: 70%;">
            {{ t('tabSummary_e7.btn_e7') }}
          </div>
        </div>
      </VCard>   
    </template>

    <!-- Dialog close btn -->
    <DialogCloseBtn @click="() => dialog = false" />

    <VCard :title="t('tabSummary_e7.preview_e7.title_card')">
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
        <VCardActions class="justify-center">
          <VCheckbox
            v-model="allRightCheck"
            :label="t('tabSummary_e7.preview_e7.all_right')"
          />
        </VCardActions>
      </template>
    </VCard>
  </VDialog>
</template>
