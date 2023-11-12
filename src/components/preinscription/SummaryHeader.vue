<script setup>
import { useDownloadFiles } from '@/composables/useDownloadFiles'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import useEventsBus from '@/utils/eventBus'

const props = defineProps({
  id: { type: Number, required: true },
  groupingPoliticalTypeName: { type: String, required: true },
  groupingPoliticalId: { type: Number, required: true },
  groupingPoliticalName: { type: String, required: true },
  corporationName: { type: String, required: true },
  circunscriptionName: { type: String, required: true },
  divipolName: { type: String, required: true },
  logoStatus: { type: String, default: null },
  inscriptionDocumentsDate: { type: String, default: null },
  approveDate: { type: String, default: null },
  sendApprove: { type: String, default: null },
  stateName: { type: String, default: null },
  radicateId: { type: String, default: null },
})

const { t } = useI18n()
const { bus } = useEventsBus()
const srcLogo = computed(() => `/v1/files/grouping-political-logo/${props.groupingPoliticalId}`)
const { data: logo, refetch } = useDownloadFiles(srcLogo)

watch(() => bus.value.get('uploadLogo'), () => {
  refetch()
})
</script>

<template>
  <div>
    <VListItem>
      <template #prepend>
        <VAvatar class="me-4" rounded="lg" size="120">
          <VImg v-if="logo" :src="logo" />
          <VIcon v-else icon="mdi-image-off-outline" size="60" />
        </VAvatar>
      </template>
      <VListItemTitle class="text-h6">
        {{ groupingPoliticalName }}
      </VListItemTitle>
      <VListItemSubtitle class="mt-1">
        {{ groupingPoliticalTypeName }}
      </VListItemSubtitle>
      <VListItemSubtitle class="my-2 font-weight-semibold">
        {{ corporationName }} - {{ circunscriptionName }} | {{ divipolName }}
      </VListItemSubtitle>
      <VListItemSubtitle>
        <VTable class="text-075">
          <tr>
            <td class="font-weight-semibold">
              {{ t('preinscription.summary_header.upload_doc_at') }}:
            </td> 
            <td class="ps-3">
              {{ inscriptionDocumentsDate }}
            </td>
          </tr>
          <tr>
            <td class="font-weight-semibold">
              {{ t('preinscription.summary_header.approved_at') }}:
            </td> 
            <td class="ps-3">
              {{ approveDate }}
            </td>
          </tr>
          <tr>
            <td class="font-weight-semibold">
              {{ t('preinscription.summary_header.send_approve') }}:
            </td> 
            <td class="ps-3">
              {{ sendApprove }}
            </td>
          </tr>
          <tr>
            <td class="font-weight-semibold">
              {{ t('preinscription.summary_header.status') }}:
            </td> 
            <td class="ps-3">
              {{ stateName }}
            </td>
          </tr>
          <tr>
            <td class="font-weight-semibold">
              {{ t('preinscription.summary_header.logo_status') }}:
            </td> 
            <td class="ps-3">
              {{ logoStatus }}
            </td>
          </tr>
          <tr>
            <td class="font-weight-semibold">
              {{ t('preinscription.summary_header.radicate') }}:
            </td> 
            <td class="ps-3">
              {{ radicateId }}
            </td>
          </tr>
        </VTable>
      </VListItemSubtitle>
    </VListItem>  
  </div>
</template>
