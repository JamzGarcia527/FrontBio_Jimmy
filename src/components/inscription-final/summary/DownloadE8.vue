<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useInscription } from '@/stores/inscription'
import {  openTabBlob } from '@/utils'
import { useI18n } from 'vue-i18n'
import { useAppAbility } from '@/plugins/casl/useAppAbility'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
})

const { t } = useI18n()
const inscriptionStore = useInscription()
const radicate = computed(() => inscriptionStore.radicate)

const isLoading = ref(false)

const { can } = useAppAbility()

const printE8 = async () =>  {
  // isLoading.value = true

  try {
    const { data } = await axios.get(`/v1/inscription-final/download/${props.inscriptionId}`, { responseType: 'blob' })

    console.log(data)  

    openTabBlob(data, props.radicateId,'application/pdf')

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
</script>

<template>
  <VCard v-if="can('download', 'inscription-final')" class="rounded-lg" variant="outlined" @click="printE8">
    <div class="d-flex justify-center align-center text-primary pa-2">
      <template v-if="isLoading">
        <VProgressCircular size="48" indeterminate />
      </template>
      <template v-else>
        <VIcon icon="tabler-printer" size="48" class="me-3" />
        <div class="w-50 line-height font-weight-bold">
          {{ t('tabSummary.download_e8.title_card') }}
        </div>
      </template>
    </div>
  </VCard>
</template>
