<script setup>
import { useDownloadFiles } from '@/composables/useDownloadFiles'

const props = defineProps({
  url: { type: String, default: null },
})

const url = computed(() => props.url)

const { data: image } = useDownloadFiles(url)
</script>

<template>
  <VImg
    :src="image"
    aspect-ratio="1"
    class="pa-7 bg-secondary rounded-circle"
  />
</template>
