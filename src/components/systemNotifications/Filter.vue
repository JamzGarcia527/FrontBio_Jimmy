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
const notificationName = ref([])

const filter = ref({
  notificationName: -1,
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const notificationNameData = async () => {
  try{
    const { data } = await axios.get('/v1/emailtemplate/filter')

    notificationName.value = data
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data
      
      //console.log(message)      
    }
  }
}

const notificationNameSelect = computed(() => {
  
  const array = notificationName.value.map(e => ({ title: e.subject, value: e.id })) 

  return addOptionDefault(array)
})

const rules = reactive({
  notificationName: [value => {
    if (notificationName.value === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],

})

const handlerSearchFilter = async () => {
  const { valid } = await form.value.validate()  
  if (!valid) return false
  emit('search', { ...filter.value, valid  })
  
}

onMounted(() => {
  notificationNameData()
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
          <VCol cols="12" sm="12" md="12">
            <VSelect 
              v-model="filter.notificationName"
              label="Descripción del Asunto"
              :items="notificationNameSelect"
              :rules="rules.notificationName"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="d-flex justify-center gap-4">
        <VBtn :loading="loading" :disabled="disabled" type="submit">
          {{ t('common.search') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>
