<script setup>
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['next'])

const { t } = useI18n()
  
const addOptions = [
  { title: t('common.select_one_option'), value: -1 },
  { title: 'Código', value: 1 },
  { title: 'Descripción Agrupación Política', value: 2 },
  { title: 'Tipo de Agrupación Política', value: 3 },
]
  
const description = ref("")
const filter = ref(-1)

const form = ref(null)

const handlerNext = async () => {
  emit('next', { filter: filter, description: description })
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VSelect 
              v-model="filter"
              :label="t('common.filter')"
              :items="addOptions" 
              :disabled="disabled"
            />
          </VCol>
          <VCol>
            <VTextField v-model="description" label="Descripción" />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText v-if="!disabled || loading" class="text-center">
        <VBtn :loading="loading" type="submit">
          {{ t('common.next') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
