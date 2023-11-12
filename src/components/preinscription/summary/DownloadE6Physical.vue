<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useInscription } from '@/stores/inscription'
import { downloadBlob } from '@/utils'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
})

const { t } = useI18n()
const inscriptionStore = useInscription()
const radicate = computed(() => inscriptionStore.radicate)

const isLoading = ref(false)
const infoDoc = ref({ hasPhysicalDoc: false })

const getInfoDoc = () => {
  axios
    .get(`/v1/inscription-approval/infodoc/${props.inscriptionId}/${radicate.value}`)
    .then(({ data }) => infoDoc.value = data)
}

const download = async () =>  {
  isLoading.value = true
  try {
    const { data } = await axios.get(`v1/inscription-approval/download/${props.inscriptionId}/${radicate.value}/physical`, { responseType: 'blob' })
    
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


onMounted(() => {
  getInfoDoc()
})
</script>

<template>
  <VCard v-if="infoDoc.hasPhysicalDoc" class="rounded-lg" variant="outlined" @click="download">
    <div class="d-flex justify-center align-center text-primary pa-2">
      <template v-if="isLoading">
        <VProgressCircular size="48" indeterminate />
      </template>
      <template v-else>
        <VIcon icon="tabler-writing-sign" size="48" class="me-3" />
        <div class="w-50 line-height font-weight-bold">
          {{ t('tabSummary.download_e6.title_card_physical') }}
        </div>
      </template>
    </div>
  </VCard>
</template>
