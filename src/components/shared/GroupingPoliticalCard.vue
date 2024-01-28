<script setup>
import { useDownloadFiles } from '@/composables/useDownloadFiles'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const props = defineProps({
  id: { type: Number, default: null },
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
  groupingPoliticalId: { type: Number, default: null },
  corporation: { type: String, default: null },
  circunscription: { type: String, default: null },
  divipole: { type: String, default: null },
  isBlankVotePromoter: { type: Boolean, default: false },
  hasLogo: { type: Boolean, default: false },
  radicate: { type: String, default: null },
})

const emit = defineEmits(['click'])
const srcLogo = computed(() => `/v1/files/grouping-political-logo/${props.groupingPoliticalId}`)

const { data: logo, refetch } = useDownloadFiles(srcLogo)
const { t } = useI18n()

const handlerClick = () => {
  emit('click', { ...props })
}

watch(() => props.hasLogo, () => {
  refetch()
})
</script>

<template>
  <VCard @click="handlerClick">
    <VCardItem class="pa-4">
      <VListItem>
        <template #prepend>
          <VAvatar rounded="lg">
            <VImg v-if="props.hasLogo" cover :src="logo" :alt="logo" size="48" />
            <VIcon icon="mdi-image-off-outline" size="32" />
          </VAvatar>
        </template>
        <VListItemTitle>
          {{ groupingPoliticalId }} - {{ title }}
        </VListItemTitle>
        <VListItemSubtitle class="mt-1 text-075">
          {{ subtitle }}
        </VListItemSubtitle>
      </VListItem>
    </VCardItem>
    <VCardText>
      <VTable class="text-075">
        <tr>
          <td class="font-weight-semibold">
            {{ t('common.corporation') }}:
          </td> 
          <td class="ps-3">
            {{ corporation }}
          </td>
        </tr>
        <tr>
          <td class="font-weight-semibold">
            {{ t('common.circunscription') }}:
          </td> 
          <td class="ps-3">
            {{ circunscription }}
          </td>
        </tr>
        <tr>
          <td class="font-weight-semibold text-no-wrap max-width">
            {{ t('common.blank_vote_promoter') }}:
          </td> 
          <td class="ps-3">
            {{ isBlankVotePromoter ? 'SI' : 'NO' }}
          </td>
        </tr>
        <tr>
          <td class="d-flex align-top font-weight-semibold">
            Lugar de Inscripción:
          </td> 
          <td class="ps-3">
            {{ divipole }}
          </td>
        </tr>
      </VTable>
    </VCardText>
  </VCard>
</template>


<style lang="scss" scoped>
.v-list-item-title {
  white-space: inherit;
}

.max-width {
  inline-size: 10rem;
}
</style>
