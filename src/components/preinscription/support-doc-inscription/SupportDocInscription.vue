<script setup>
import axios from "@/plugins/axios"
import SupportDocFolioInscription from './SupportDocFolioInscription.vue'
import CheckDocInscription from './CheckDocInscription.vue'
import useEventsBus from '@/utils/eventBus'
import { ref, watch, computed } from 'vue'
import { useCustomMessage } from "@/composables/useCustomMessage"

//props que reciben data del padre
const props = defineProps({
  groupingPoliticalTypeId: { type: Number, required: true },
  inscriptionId: { type: Number, required: true },
  readonly: { type: Boolean, default: false },
  enableFolio: { type: Boolean, default: false },
  enableCheck: { type: Boolean, default: false },
  isApproved: { type: Boolean, required: true },
})

const messageComposable = useCustomMessage()
const staticAlert = messageComposable.get("MS0012")
const isLoading = computed(() => !(!isLoadingFolio.value && !isLoadingCheck.value))
const isLoadingFolio = ref(false)
const isLoadingCheck = ref(false)
const isDialogVisible = ref(false)
const pdfUrl = ref('')
const zoom = ref('150%')
const items = ref([])
const itemsCheck = ref([])

const { bus } = useEventsBus()

const getData = async (enableLoading = true) => {
  const requestBody = {
    inscription: props.inscriptionId,
    groupingpoliticalType: props.groupingPoliticalTypeId,
  }

  isLoadingFolio.value = enableLoading

  await axios.get("v1/inscriptions-supporting-documents/from-supporting-documents", { params: requestBody })
    .then(response => {
      items.value = response.data
    }).finally(() => isLoadingFolio.value = false)
}

const getChecks = async (enableLoading = true) => {
  isLoadingCheck.value = enableLoading

  await axios.get(`v1/check_inscription/${props.inscriptionId}`)
    .then(({ data }) => {
      itemsCheck.value = data
    }).finally(() => isLoadingCheck.value = false)
}

watch(() => bus.value.get('reload'), () => {
  getData(false)
})

onMounted(() => {
  getData()
  getChecks()
})
</script>

<template>
  <div>
    <VCard>
      <div>
        <div class="text-right my-3 me-3">
          <h5>
            Formato Permitido: PDF
          </h5>
          <h5>
            Tamaño por Archivo: Hasta 1 Mb
          </h5>
        </div>
        <VCardText v-if="isLoading" class="text-center py-16">
          <VProgressCircular size="50" indeterminate />
        </VCardText>
        <div v-else-if="items.length > 0">
          <VAlert 
            type="warning" 
            variant="tonal" 
            :text="staticAlert" 
            class="text-body-2 mb-0"
            rounded="0" 
          />
          
          <SupportDocFolioInscription
            :grouping-political-type-id="groupingPoliticalTypeId"
            :inscription-id="inscriptionId"
            :items="items"
            :enable-folio="enableFolio"
            :readonly="readonly"
            :is-approved="isApproved"
          />
        </div>
        <VCardText v-else class="text-center py-16">
          No hay registros para mostrar
        </VCardText>
      </div>
    </VCard>

    <VCard v-if="enableCheck && !isLoading" class="mt-7">
      <VCardText>
        <VRow>
          <VCol v-if="itemsCheck.length > 0" cols="12">
            <CheckDocInscription 
              :grouping-political-type-id="groupingPoliticalTypeId"
              :inscription-id="inscriptionId"
              :items="itemsCheck"
              :enable-check="enableCheck"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VDialog v-model="isDialogVisible" width="1050">
      <!-- Dialog close btn -->      
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />      
      <!-- Dialog Content -->      
      <VCard>
        <VCardText>          
          <embed :src="pdfUrl" type="application/pdf" width="100%" height="500" :zoom="zoom">        
        </VCardText>        
        <VCardText class="d-flex justify-end">
          <VBtn @click="isDialogVisible = false">
            Cerrar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
