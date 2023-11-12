<script setup>
import { keyPressOnlyNumber, pasteOnlyNumber } from '@/utils/events'

const props = defineProps({
  label: { type: String, default: null },
  errorMessages: { type: String, default: '' },
  rules: { type: Array, default: null },
  modelValue: { type: String, default: null },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:model-value'])

const items = [
  { value: 601, text: "Cundinamarca y Bogotá D.C." },
  { value: 602, text: "Cauca, Nariño y Valle." },
  { value: 604, text: "Antioquia, Córdoba y Chocó." },
  { value: 605, text: "Atlántico, Bolívar, César, La Guajira, Magdalena y Sucre." },
  { value: 606, text: "Caldas, Quindío y Risaralda." },
  { value: 607, text: "Arauca, Norte de Santander y Santander." },
  { value: 608, text: "Amazonas, Boyacá, Casanare, Caquetá, Guaviare, Guainía, Huila, Meta, Tolima, Putumayo, San Andrés, Vaupés y Vichada." },
]

const { modelValue } = toRefs(props)
const prefix = ref(601)

const prefixComputed = computed(() => {
  return modelValue.value ? modelValue.value.substring(0, 3) : prefix.value || items[0].value 
})

const numberComputed = computed(() => {
  prefix.value = modelValue.value ? modelValue.value.substring(0, 3) : prefix.value
  
  return modelValue.value ? modelValue.value.substring(3, modelValue.value.length) : null
})

const updateModelValue = (prefix, number) => {
  const modelValue = number ? `${prefix}${number}` : null

  emit('update:model-value', modelValue)
}

const handlerChangePrefix = value => {
  prefix.value = value
  updateModelValue(value, numberComputed.value)
}

const handlerChangeNumber = value => {
  updateModelValue(prefixComputed.value, value)
}
</script>

<template>
  <VTextField
    :label="label" 
    :model-value="numberComputed"
    :error-messages="errorMessages"
    :disabled="disabled" 
    :readonly="readonly"
    @update:model-value="handlerChangeNumber"
    @keypress="keyPressOnlyNumber"
    @paste="pasteOnlyNumber"
  >
    <template #prepend-inner>
      <VMenu
        content-class="elevation-24"
        location="bottom"
        :disabled="disabled || readonly"
      >
        <template #activator="{ props: propsMenu, isActive }">
          <div class="activator" v-bind="propsMenu">
            <div class="d-flex">
              <VIcon icon="tabler-phone" />
              <span class="mx-1">
                {{ prefix }}
              </span>
              <VIcon 
                icon="tabler-chevron-down" 
                :class="isActive ? 'rotate-180': ''"
              />
            </div>
          </div> 
        </template>
        <VCard
          class="card-container mt-2"
          max-width="300"
        >
          <VList density="compact" lines="three">
            <VListItem
              v-for="(item, index) in items" :key="index"
              @click="handlerChangePrefix(item.value)"
            >
              <template #prepend>
                {{ item.value }}
              </template>
              <VListItemTitle>{{ item.text }}</VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </VMenu>
    </template>
  </VTextField>
</template>

<style lang="scss" scoped>
.activator {
  cursor: pointer;

  .v-icon {
    transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .v-icon.rotate-180 {
    opacity: var(--v-high-emphasis-opacity);
    transform: rotate(180deg);
  }
}

.card-container {
  .v-list-item {
    font-size: 0.75rem;
    padding-inline: 0.25rem;

    .v-list-item__content {
      .v-list-item-title {
        font-size: 0.75rem !important;
        line-height: 1.25;
        margin-inline-start: 0.75rem;
        white-space: inherit;
      }
    }
  }
}
</style>
