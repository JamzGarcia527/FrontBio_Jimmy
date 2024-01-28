<script setup lang>
import { useIdle } from '@vueuse/core'

const props = defineProps({
  timeout: { type: Number, default: () => 5 * 60 * 1000 },
  messageIdle: { type: String, default: 'Ha pasado mucho tiempo de inactividad. Tu sesión sera cerrada' },
})

const emit = defineEmits(['idle'])

const { idle } = useIdle(props.timeout)
const idInterval = ref(null)
const time = ref(60)

const handlerIdleDialog = value => {
  if (value) {
    time.value = 60
    idInterval.value = setInterval(() => {
      time.value -= 1 
      if (time.value < 1) {
        clearInterval(idInterval.value)
        emit('idle')
      }
    }, 1000)
  } else if (idInterval.value) {
    clearInterval(idInterval.value)
  }
}

watch(idle, handlerIdleDialog)
</script>

<template>
  <VDialog
    v-model="idle"
    width="500"
  >
    <VCard title="Sesión inactiva">
      <VCardText>
        <p>{{ messageIdle }}</p>
        <p>Quedan {{ time }} segundos</p>
      </VCardText>
    </VCard>
  </VDialog>
</template>
