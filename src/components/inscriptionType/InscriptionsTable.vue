<script setup>
import { ref } from 'vue'
import { useI18n } from "vue-i18n"

defineProps({
  data: { type: Array, default: () => [] },
})

const headers = [
  {
    text: 'Dessert (100g serving)',
    align: 'start',
    sortable: false,
    value: 'name',
  },
  { text: 'Calories', value: 'calories' },
  { text: 'Fat (g)', value: 'fat' },
  { text: 'Carbs (g)', value: 'carbs' },
  { text: 'Protein (g)', value: 'protein' },
  { text: 'Iron (%)', value: 'iron' },
]

const { t } = useI18n()
</script>

<template>
  <VTable
    :headers="headers"
    :items="data"
    :items-per-page="5"
    class="elevation-1"
  />
</template>
