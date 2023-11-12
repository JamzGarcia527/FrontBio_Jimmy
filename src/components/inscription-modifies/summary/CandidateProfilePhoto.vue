<script setup>
import { useDownloadFiles } from '@/composables/useDownloadFiles'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  dni:{ type:Number, required:true  },
  hasPhoto: { type: Boolean, required: true },
  timePhoto: { type:Number, required: true },
})

const srcImage = computed(() => {
  return !props.hasPhoto ? null
    : `/v1/files/candidates?candidateDni=${props.dni}&inscriptionId=${props.inscriptionId}&time=${props.timePhoto}`
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
