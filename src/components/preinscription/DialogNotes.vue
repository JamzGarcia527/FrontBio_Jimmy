<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  modelValue: { type: Boolean, default: false },
  notes: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:model-value', 'closed'])

const toggleDialog = value => {
  emit('update:model-value', value)
}

const { t } = useI18n()
const checkbox = ref(false)

const handleClose = () => {
  toggleDialog(false)
  emit('closed', checkbox.value)
  setTimeout(() => checkbox.value = false, 500)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    persistent
    class="v-dialog-sm"
    transition="dialog-top-transition"
    @update:model-value="toggleDialog"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="handleClose" />

    <!-- Dialog Content -->
    <VCard :title="t('notes.dialog_title')">
      <VCardText>
        <ol class="order-list text-caption text-justify mx-4">
          <li v-for="(item, index) of notes" :key="index">
            <div>{{ item }}</div>
          </li>
        </ol>
      </VCardText>
      <VCardActions class="justify-center">
        <VCheckbox
          v-model="checkbox"
          :label="t('notes.accept_terms_and_conditions')"
          @update:model-value="handleClose"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
