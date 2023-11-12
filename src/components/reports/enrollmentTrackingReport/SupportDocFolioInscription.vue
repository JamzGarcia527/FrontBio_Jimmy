<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useI18n } from "vue-i18n"
import useEventsBus from '@/utils/eventBus'

const props = defineProps({
  groupingPoliticalTypeId: { type: Number, required: true },
  inscriptionId: { type: Number, required: true },
  items: { type: Object, required: true },
  enableFolio: { type: Boolean, required: false },
  readonly: { type: Boolean, required: false },
  filetypesopor:{ type: Number, required: true },
})

const { emit: emitter } = useEventsBus()
const { t } = useI18n()


const isDialogVisible = ref(false)
const percentCompletedPdf = ref(0)
const pdfUrl = ref('')
const zoom = ref('150%')
const { can } = useAppAbility()
const nameFile = ref("")
// eslint-disable-next-line vue/no-setup-props-destructure
const showModal = ref(false)

const fields = computed(() => {
 
  const array = [
    { key: 'nameSupportingDocuments', label: 'Nombre Documento' },
    { key: 'updateAt', label: 'Fecha De Carga', thClass: 'text-center' },
    { key: 'actions', label: 'Acciones' },
  ]
  
  return array.filter(e => !Boolean(e.hidden))
})

const showFile = async (name,id) => {
  if(props.filetypesopor === 1 ){
    try {
    // get route PDF
      const response = await axios.get (`/v1/files/inscriptions-supporting-documents?id=${id}`, { responseType: 'blob' })
      const file = new Blob([response.data], { type: 'application/pdf' })

      pdfUrl.value = URL.createObjectURL(file)

      showModal.value = true

    } catch (error) {
      if(error){
        await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
      }
    }
  }else{
    try {
    // get route PDF
      const response = await axios.get (`/v1/files/inscription-change-supporting-documents?id=${id}`, { responseType: 'blob' })
      const file = new Blob([response.data], { type: 'application/pdf' })

      pdfUrl.value = URL.createObjectURL(file)

      showModal.value = true

    } catch (error) {
      if(error){
        await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
      }
    }
  }

}
</script>

<template>
  <div>
    <DataTable :fields="fields" :items="props.items" paginate>
      <template #cell(nameSupportingDocuments)="{ item }">
        <div style="max-width: 350px;">
          {{ item.nameSupportingDocuments }}
        </div>
      </template>

      <template #cell(actions)="{ item }">
        <div v-if="item.hash !== null && item.hash !== ''">
          <VBtn
            v-if="can('show', 'file-inscriptions-doc')"
            class="text-center"
            icon="tabler-eye"
            variant="text"
            color="secondary"
            @click="showFile(item.name, item.id)"
          />
        </div>
      </template>
    </DataTable>
    <!-- Modal Show PDF -->
    <VDialog v-model="showModal" width="1050">
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="showModal = !showModal" />
      <!-- Dialog Content -->
      <VCard>
        <VCardText>
          <embed :src="pdfUrl" type="application/pdf" width="100%" height="500" :zoom="zoom">
        </VCardText>
        <VCardText class="d-flex justify-end">
          <VBtn @click="showModal = false">
            Cerrar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
