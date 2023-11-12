<script setup>
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { requiredEspecialSelectValidator } from "@/utils/validators"

const props = defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['search'])
const error = ref(null)
const { t } = useI18n()
const form = ref(null)
const messageType = ref([])
const messageCode = ref([])
const messageDescription = ref([])

const filter = ref({
  messageType: -1,
  messageCode: -1,
  messageDescription: -1,
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const messageTypeData = async () => {
  try{
    const { data } = await axios.get('/v1/message/list/type')

    messageType.value = data
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data
      
      //console.log(message)      
    }
  }
}

const messageTypeSelect = computed(() => {
  
  const array = messageType.value.map(e => ({ title: e.name, value: e.id })) 

  return addOptionDefault(array)
})

const messageCodeData = async value => {
    
  filter.value.messageCode = -1
  
  filter.value.messageDescription = -1
  try{

    const { data } = await axios.get(`/v1/message/list/filter/by/type?id=${value}`)

    messageCode.value = data
    
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data
      
      //console.log(message)      
    }
  }
}

const messageCodeSelect = computed(() => {
  
  const array = messageCode.value.map(e => ({ title: e.code, value: e.code }))

  return addOptionDefault(array)
})

const messageDescriptionData = async value => {
  filter.value.messageDescription = -1
  
  try{
    const { data } = await axios.get(`/v1/message/list/filter/by/type/code?code=${value}`)

    messageDescription.value = data
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data
      
      //console.log(message)      
    }
  }
}

const messageDescriptionSelect = computed(() => {

  const array = messageDescription.value.map(e => ({ title: e.description, value: e.description }))

  return addOptionDefault(array)
})

const rules = reactive({
  messageType: [value => {
    if (messageType.value === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  messageCode: [value => {
    if (messageCode.value === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
  messageTypeSelect: [requiredEspecialSelectValidator],
  messageCodeSelect: [requiredEspecialSelectValidator],
  messageType: [requiredEspecialSelectValidator],
  messageCode: [requiredEspecialSelectValidator],

})

const handlerSearchFilter = async () => {
  const { valid } = await form.value.validate()  
  if (!valid) return false
  emit('search', { ...filter.value, valid  })
  
}

onMounted(() => {
  messageTypeData()
})
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerSearchFilter">
      <VCardText> 
        <VRow>
          <h4>Filtro de Búsqueda</h4>
        </VRow>
        <br>       
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <VSelect 
              v-model="filter.messageType"
              label="Tipo de Mensaje"
              :items="messageTypeSelect"
              :rules="rules.messageType"
              @update:model-value="messageCodeData(filter.messageType)" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VSelect 
              v-model="filter.messageCode"
              label="Código de Mensaje"
              :items="messageCodeSelect"
              :rules="rules.messageCode"
              @update:model-value="messageDescriptionData(filter.messageCode)" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VSelect 
              v-model="filter.messageDescription"
              label="Descripción de Mensaje"
              :items="messageDescriptionSelect"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="d-flex justify-center gap-4">
        <VBtn :loading="loading" :disabled="disabled" type="submit">
          {{ t('common.consult') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
