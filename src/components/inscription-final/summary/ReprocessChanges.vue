<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
})

const emit = defineEmits(['executed'])

const { t } = useI18n()
const isLoading = ref(false)

const mounted = async () =>  {
  isLoading.value = true
  error.value = null
}


const reprocess = async () =>  {
  Swal.fire({
    title: "Reprocesar Modificaciones",
    text: "Ingresar contraseña de confirmación",
    input: "password",
    inputPlaceholder: "Contraseña de confirmación",
    showCancelButton: true,
    customClass: { 
      confirmButton: "bg-primary notAllowedEmulator",
      cancelButton: "bg-danger",
    },
    showLoaderOnConfirm: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Continuar",
    preConfirm: async password => {
      if (String(password).trim().length == 0) {
        Swal.showValidationMessage("La observación es obligatoria")
        
        return false
      }
      
      try {
        await axios.post(`v1/inscription-final/reprocess-changes`, {
          inscriptionId: props.inscriptionId,
          password: password,
        })
        
        Swal.fire({ 
          title: "Modificaciones reprocesadas!", 
          text: "Las modificaiones de E7 fueron reprocesadas, validar los cambios.",
          icon: "success",
        })

        emit('executed')

        return true
      } catch (e) {
        let text = 'No es posible realizar operación, por favor intenta más tarde.'
        if (e.response && e.response.status < 500) {
          const { data } = e.response

          text = data.message
        }
        Swal.fire({ text, icon: "warning" })
        
        return false
      }
    },
    allowOutsideClick: false,
  })  
}

onMounted(() => mounted)
</script>

<template>
  <VCard class="rounded-lg" variant="outlined" @click="reprocess">
    <div class="d-flex justify-center align-center text-primary pa-2">
      <template v-if="isLoading">
        <VProgressCircular size="48" indeterminate />
      </template>
      
      <template v-else>
        <VIcon icon="tabler-cpu" size="48" class="me-3" />
        <div class="w-50 line-height font-weight-bold">
          Reprocesar Modificaciones
        </div>
      </template>
    </div>
  </VCard>
</template>
