<script setup>
import { keyPressOnlyNumber, pasteOnlyNumber } from '@/utils/events'
import { isEmpty } from '@/utils'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

const props = defineProps({
  label: { type: String, default: null },
  baseUrl: { type: String, default: '/ani' },
  errorMessages: { type: String, default: '' },
  rules: { type: Array, default: null },
  modelValue: { type: String, default: null },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:model-value', 'found'])

const { modelValue, baseUrl } = toRefs(props)

const found = ref(props.modelValue) 
const isLoading = ref(false)

const clearable = computed(() => found.value != null)

watch(modelValue, value => {
  if (!value) found.value = null
})

const handlerChangeModelValue = value => {
  emit('update:model-value', value)
}

const handerFinder = () => {
  const value = modelValue.value
  if (isEmpty(value)) return

  isLoading.value = true
  found.value = null

  axios.get(`${baseUrl.value}/${String(value).trim()}`).then(({ data }) => {
    found.value = data
    emit('found', data)
    isLoading.value = false
  }).catch(error => {
    emit('found', value)
    isLoading.value = false
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
  })
}

const handlerClear = () => {
  found.value = null
  emit('found', null)
  emit('update:model-value', null)
}
</script>

<template>
  <VTextField
    :label="label" 
    :model-value="modelValue"
    :error-messages="errorMessages"
    :disabled="disabled" 
    :readonly="readonly || isLoading || clearable"
    :clearable="clearable"
    :class="{ 'readonly-control': readonly }"
    @click:clear="handlerClear"
    @update:model-value="handlerChangeModelValue"
    @keypress="keyPressOnlyNumber"
    @paste="pasteOnlyNumber"
  >
    <template #append-inner>
      <template v-if="isLoading">
        <VProgressCircular size="24" indeterminate />
      </template>
      <template v-if="!isLoading && !clearable && !readonly">
        <VIcon icon="mdi-magnify" @click="handerFinder" />
      </template>
    </template>
  </VTextField>
</template>

