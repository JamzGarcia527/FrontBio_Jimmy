<script setup>
import { useCustomMessage } from "@/composables/useCustomMessage"

const messageComposable = useCustomMessage()
const welcomeMessage = ref('')

onMounted(() => {
  welcomeMessage.value = messageComposable.get('MS0039')
})
</script>

<template>
  <div>
    <VAlert
      border="start"
      border-color="secondary"
      title="Bienvenido(a)"
      style="background-color: white;"
    >
      <div class="text-justify">
        {{ welcomeMessage }}
      </div>
    </VAlert>
  </div>
</template>
