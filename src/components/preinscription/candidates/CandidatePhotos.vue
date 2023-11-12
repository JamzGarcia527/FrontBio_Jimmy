<script setup>
import CardListCandidates from "@/components/preinscription/candidates/CardListCandidates.vue"

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  readonly: { type: Boolean, default: false },
})

const item = ref([])
</script>

<template>
  <div>
    <CardListCandidates v-bind="props" />
  </div>
</template>

