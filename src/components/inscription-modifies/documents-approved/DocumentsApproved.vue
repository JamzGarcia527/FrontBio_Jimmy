<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useInscription } from '@/stores/inscription'
import { downloadBlob } from '@/utils'

//props que reciben data del padre
const props = defineProps({
  groupingPoliticalTypeId: { type: Number, required: true },
  inscriptionId: { type: Number, required: true },
})

const inscriptionStore = useInscription()
const radicate = computed(() => inscriptionStore.radicate)
const items = ref([])

const fields = ref ([
  { key: 'name', label: 'Nombre Documento' },  
  { key: 'createdAt', label: 'Fecha de Carga' },
  { key: 'actions', label: 'Descargar Formulario Aprobado E7' },
])

const nameFile = ref("")


const getData = async () => {
  try {
    const { data } = await axios.get(`v1/inscription-change-approval/details?id=${props.inscriptionId}`)

    items.value = data
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
    
    return false
  }
}


const download = async radicate =>  {
  //isLoading.value = true
  try {

    const { data } = await axios.get(`/v1/inscription-change-approval/download?id=${props.inscriptionId}`, { responseType: 'blob' })

    const file = new Blob([data], { type: 'application/pdf' })


    downloadBlob(file, radicate,'application/pdf')
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
  }
}

onMounted(() => {
  getData()
})
</script>

<template>
  <div>
    <VCard>
      <div class="ml-3 mt-3 mb-2">
        <h3>Documentos Generados</h3>
      </div>  
      <VCard v-if="items.length != 0">  
        <DataTable :fields="fields" :items="items" paginate>
          <template #cell(actions)="{ item }">
            <div class=" ">
              <VBtn
                class="d-flex justify-center"
                variant="text"
                icon="tabler-download"
                color="secondary"
        
                @click="download(item.radicate)"
              />
            </div>
          </template>  
        </DataTable>
      </VCard>
      <VCard v-else>
        <VAlert color="secondary">
          No hay registros para mostrar
        </VAlert>
      </VCard>
    </VCard>
  </div>
</template>
