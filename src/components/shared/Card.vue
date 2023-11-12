<script setup>
const props = defineProps({
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
})
</script>

<template>
  <VCard>
    <VCardTitle v-if="title" class="pb-0">
      <span class="text-h5">{{ title }}</span>
      <hr v-if="!subtitle">
    </VCardTitle>
    <VCardSubtitle v-if="subtitle" class="pt-2">
      <span class="text-subtitle-1 font-weight-bold" :class="{'text-disabled': title}">{{ subtitle }}</span>
      <hr>
    </VCardSubtitle>

    <slot />
  </VCard>
</template>
