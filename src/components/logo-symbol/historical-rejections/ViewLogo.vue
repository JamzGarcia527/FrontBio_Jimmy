<script setup>
import { useDownloadFiles } from '@/composables/useDownloadFiles'

const props = defineProps({
  logoId: { type: Number, required: true },
  hash: { type: String, default: null },
})

const srcImage = computed(() => {
  if (!props.logoId) return null

  return !props.hash 
    ? `/v1/grouping-political-logo/download/${props.logoId}`
    : `/v1/grouping-political-logo/download/${props.logoId}/${props.hash}/history`
})

const { data: image } = useDownloadFiles(srcImage)
</script>

<template>
  <div>
    <VImg
      :src="image"
      aspect-ratio="1"
      class="pa-9 bg-secondary rounded-circle"
    />
  </div>  
</template>
