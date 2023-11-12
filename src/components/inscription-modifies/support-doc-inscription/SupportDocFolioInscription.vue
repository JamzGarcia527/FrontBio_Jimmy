<script setup>
import { keyPressOnlyNumber, pasteOnlyNumber } from "@/utils/events"
import DataTable from '@/components/shared/DataTable.vue'
import axios from "@/plugins/axios"
import GlobalDropZoneFiles from '@/components/inscription-modifies/support-doc-inscription/GlobalDropZoneFiles.vue'
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
  isDelete: { type: Boolean, default: true },
  isApproved: { type: Boolean, required: true },
})

const { emit: emitter } = useEventsBus()
const { t } = useI18n()

const staticAlert = 'Todos los documentos con (*) son obligatorios.'

const isDialogVisible = ref(false)
const percentCompletedPdf = ref(0)
const pdfUrl = ref('')
const zoom = ref('150%')
const { can } = useAppAbility()
const nameFile = ref("")
const viewDownload = computed(() => can('download', 'supporting-documents'))
const viewBtnAccions = computed(() => props.enableFolio && can('update', 'supporting_document') && can('download', 'supporting-documents'))
// eslint-disable-next-line vue/no-setup-props-destructure
const showModal = ref(false)
const showFolio = computed(() => props.enableFolio && can('update', 'supporting_document'))

const fields = computed(() => {

  const array = [
    { key: 'index', label: 'No.' },
    { key: 'nameSupportingDocuments', label: 'Nombre Documento' },
    { key: 'folio', label: 'Cantidad De Folios', thClass: 'text-center', hidden: !showFolio.value },
    { key: 'updateAt', label: 'Fecha De Carga', thClass: 'text-center' },
    { key: 'actions', label: 'Acciones' },
    { key: 'aprovate', label: 'Aprobar', hidden: props.readonly || !showFolio.value },
  ]
  
  return array.filter(e => !Boolean(e.hidden))
})

const showFile = async (name,id) => {
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

const downloadFile = async (value, name) =>{
  const requestBody = {
    id: value,
  }

  await axios.get('v1/files/inscription-change-supporting-documents/download', {
    params: requestBody,
    responseType: "blob", // importante

  }).then(response => {

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")

    link.href = url
    link.setAttribute("download", name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  })
}

const dropFile = async id => {
  try {
    await axios.delete(`/v1/files/inscription-change-supporting-documents?id=${id}`)
    
    emitter('updateSupportDocs', true)
    emitter('reload', true)

    await Swal.fire({
      text: "El archivo fue removido de manera exitosa",
      icon: "success",
      confirmButtonText: "Aceptar",
      customClass: { confirmButton: "btn btn-primary" },
    })
  } catch (error) {
    await Swal.fire({
      text: "Ocurrio un error, por favor intente más tarde",
      icon: "warning",
      confirmButtonText: "Aceptar",
      customClass: { confirmButton: "btn btn-primary" },
    })
  }
}

const handleCheck = async item => {
  if(item.folio == null || item.folio === '') {
    item.state = false
    await Swal.fire({
      icon: 'warning',
      text: 'Los folios no pueden estar vacio',
    })
  } else {
    try {
      const requestBody = {
        folio: item.folio,
        check: 1,
      }

      const { data } = await axios.put(`/v1/inscriptions-changes-supporting-documents/supporting-documents-check/${item.id}`, requestBody)

    } catch (error) {
      item.state = false
      if (error.response && error.response.status != 500) {
        const { message } = error.response.data

        await Swal.fire({
          icon: 'warning',
          text: message || 'No existen agrupaciones políticas.',
          target: document.getElementById('formCampaign'),
        })
      }
    }
  }
}
</script>

<template>
  <div>
    <DataTable :fields="fields" :items="props.items" paginate>
      <template #cell(index)="{ index }">
        {{ index + 1 }}
      </template>

      <template #cell(nameSupportingDocuments)="{ item }">
        <div style="max-width: 350px;">
          {{ item.nameSupportingDocuments }}
        </div>
      </template>

      <template #cell(folio)="{ item }">
        <div v-if="item.state" class="text-center">
          {{ item.folio }}
        </div>
        <div v-else>
          <div v-if="item.hash">
            <VTextField
              v-model="item.folio"
              clearable
              type="text"
              label="Folio"
              color="primary"
              @keypress="keyPressOnlyNumber"
              @paste="pasteOnlyNumber"
            />
          </div>
        </div>
      </template>

      <template #cell(updateAt)="{ item }">
        <div v-if="item.hash !== null && item.hash !== ''" class="text-center">
          {{ item.updateAt }}
        </div>
        <div v-else-if="!readonly && can('post', 'file-inscriptions-doc')">
          <GlobalDropZoneFiles
            :supporting-documents="item"
            :inscription-id="props.inscriptionId"
          />
        </div>
        <div v-else class="text-center">
          -
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
          <VBtn
            v-if="can('get', 'file-inscriptions-doc') || viewDownload"
            class="text-center"
            icon="tabler-download"
            variant="text"
            color="secondary"
            @click="downloadFile(item.id, item.name)"
          />
          <VBtn
            v-if="!readonly && can('delete', 'file-inscriptions-doc')"
            class="text-center notAllowedEmulator"
            icon="tabler-trash"
            variant="text"
            color="secondary"
            @click="dropFile(item.id)"
          />
        </div>
      </template>

      <template #cell(aprovate)="{ item }">
        <div v-if="item.hash !== null && item.hash !== ''" class="notAllowedEmulator">
          <VCheckbox
            v-model="item.state"
            :label="t('common.correct')"
            :readonly="item.state && isApproved"
            class="notAllowedEmulator"
            @change="handleCheck(item)"
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
