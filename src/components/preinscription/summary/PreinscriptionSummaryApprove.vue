<script setup>
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import imageLogo from '@images/pages/fondoContrasena.png'
import Swal from '@/plugins/sweetalert2'
import DownloadE6 from './DownloadE6.vue'
import SummaryTables from '@/components/preinscription/summary/SummaryTables.vue'
import SummarySupports from '@/components/preinscription/summary/SummarySupports.vue'
import SummaryInfo from '@/components/preinscription/summary/SummaryInfo.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import DataTable from "@/components/shared/DataTable.vue"
import DownloadE6Physical from "./DownloadE6Physical.vue"
import RegenerateE6 from "./RegenerateE6.vue"

const props = defineProps({
  inscriptionId: { type:Number, required:true },
  radicate: { type: String, required: true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
  isUninominal: { type: Boolean, default: false },
})

const { t } = useI18n()
const { can } = useAppAbility()

const inscriptionIdProps = ref(props.inscriptionId)
const groupingPoliticalTypeIdProps = ref(props.groupingPoliticalTypeId)
const btnDisabled = ref(false)
const isSnackbarVisible = ref(false)
const isSnackbarVisibleEmail = ref(false)
const isDialogVisible = ref(false)
const classPrimary = ref("")
const classPrimaryRequest = ref("") 
const classPrimaryE6 = ref("") 
const notifyMail = ref("")
const NumberRadicate = ref(null)
const showModalCheckList = ref(false)
const isDialogVisible3 = ref(false)
const Observation = ref("")
const showModal = ref(false)
const showModalAlert = ref(false)
const pdfUrl = ref('')
const zoom = ref('150%')



const sentNotification =  () => {
  
  isDialogVisible.value = true

}

const sentNotification1 = async () => {

  try {
    const { data }  = await axios.get(`v1/candidates/send-approve/${props.inscriptionId}`)   
    
    if(!data.sentMails == 0){
      isSnackbarVisible.value = true
      notifyMail.value = data.sentMails
      isDialogVisible.value = false
      classPrimary.value = "card-primary"
      btnDisabled.value = true
    }else{
      isSnackbarVisibleEmail.value = true
      isDialogVisible.value = false
      classPrimary.value = "card-primary"
      btnDisabled.value = true
    }
  } catch (error) {
    if (error.response && error.response.status < 500) {
      isDialogVisible.value = false

      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
 
  }

}



// Funciones para Aprobación por parte de la autoridad electoral

const items = ref([])

const fields = ref([
  { key: "name", label: "Nombre Documento" },
  { key: "folio", label: "Cantidad De Folios" },
  { key: "createdAt", label: "Fecha de Carga" },
  { key: "actions", label: "Acciones" },
  { key: "state", label: "Aprobar" },
])

const saveApproved =  async value => {
  let Radicate = NumberRadicate.value

  if (Radicate == "" || Radicate == null) {
    Swal.fire({ icon: "warning", text: "El número de radicado no puede estar vacío" })

    return 
  } else if (Radicate.length < 5){
    Swal.fire({
      icon: "warning",
      text: "El número de radicado debe contener mínimo (5) dígitos",
    })
    
    return 
  }

  const requestBody = {
    radicate: Radicate,
    status: value,
    observation: Observation.value,
  }

  try {
    const { data } = await axios
      .put(`v1/inscription-approval/${inscriptionIdProps.value}`, requestBody)

    const expr = data.message
    switch (expr) {
    case '1':
      Swal.fire({
        icon: "success",
        text: t('validations.inscription_success'),
      })
      break
    case '2':
      Swal.fire({
        icon: "warning",
        text: "La inscripción fue rechazada",
      })
      break
    case '3':
      Swal.fire({
        icon: "warning",
        text: "La inscripción debe ser aprobada por la segunda autoridad electoral competente.",
      })
      break
    }
  } catch (error) {
    if (error.response && error.response.status != 500) {

      const { message } = error.response.data

      await Swal.fire({

        icon: 'warning',

        text: message || 'No es posible realizar la aprobación de la inscripción.',

      })

    }
  }

}

const getData = async () => {
  const requestBody = {
    inscription: props.inscriptionId,
    groupingpoliticalType: props.groupingPoliticalTypeId,
  }
  
  await axios
    .get("v1/inscriptions-supporting-documents/supporting-documents", {
      params: requestBody,
    })
    .then(response => {
      items.value = response.data
    })
}

const showFile = async (name,id) => {
    
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
}

const handleFocusout = async value => {
  try {
    const requestBody = {
      folio: value.target.value,
    }

    const { data } = await axios.put(`/v1/inscriptions-supporting-documents/supporting-documents-folio/${inscriptionIdProps.value}`, requestBody)

    dataAccountType.value = data
  } catch (error) {
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

const downloadFile = async (value, name) =>{
  const requestBody = {
    id: value,
  }

  await axios.get('v1/files/inscriptions-supporting-documents', {
    params: requestBody,
    responseType: "blob", // importante
    
  }).then(response => {

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")

    link.href = url
    link.setAttribute("download", name)
    document.body.appendChild(link)
    link.click()
  })
}



onMounted(() => {
  getData()
})
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <VForm class="mt-5">
          <VRow>
            <VCol 
              cols="12" 
              md="8"
            >
              <SummaryInfo
                :inscription-id="inscriptionIdProps" 
                :grouping-political-type-id="groupingPoliticalTypeIdProps"
                :is-uninominal="isUninominal"
              />
              <SummaryTables
                :inscription-id="inscriptionIdProps" 
                :grouping-political-type-id="groupingPoliticalTypeIdProps"
              />
            </VCol>
            <VCol 
              cols="12" 
              md="4"
            >
              <SummarySupports
                style="width: 100%;"
                :inscription-id="inscriptionIdProps" 
                :grouping-political-type-id="groupingPoliticalTypeIdProps"
              />
              <br>

              <VRow class="match-height">
                <VCol cols="12">
                  <DownloadE6 class="mb-2" :inscription-id="inscriptionId" />
                  <DownloadE6Physical class="my-2" :inscription-id="inscriptionId" />
                  <RegenerateE6 
                    v-if="can('regenerate-approved-document', 'inscription')"
                    class="mt-2"
                    :inscription-id="inscriptionId" 
                    :radicate="radicate"
                  />
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VSnackbar v-model="isSnackbarVisible" color="success">
        <VRow>
          <VCol 
            cols="12" 
            md="1"
            class=""
          >
            <VIcon
              class="mt-4" 
              size="40"
              icon="mdi-checkbox-marked-circle-outline"
            />
          </VCol>
        
          <VCol 
            cols="12" 
            md="11"
            class="notify-mail"
          >
            <VListItemTitle class="text-h6 notify-mail">
              {{ t("tabSummary.mensaje_title") }}
            </VListItemTitle>
            <VListItemSubtitle class="mt-1 notify-mail">
              {{ t("tabSummary.mensaje_subtitle") }}  
            </VListItemSubtitle>
            <VListItemSubtitle class="mt-1 notify-mail">
              {{ t("tabSummary.number_candidates") }}: {{ notifyMail }}
            </VListItemSubtitle>
          </VCol>
        </VRow>
      </VSnackbar>
      <VSnackbar v-model="isSnackbarVisibleEmail" color="info">
        <VListItemTitle class="text-h6">
          <VIcon
          
            size="45"
            icon="mdi-alert-circle-outline"
          />
          {{ t("tabSummary.no_candidates") }} 
        </VListItemTitle>
      </VSnackbar>
    </vcard>
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
    <!-- Modal Show Alerts -->
    <VDialog v-model="showModalAlert" width="1050">
      <!-- Dialog close btn -->      
      <DialogCloseBtn @click="showModalAlert = !showModalAlert" />      
      <!-- Dialog Content -->      
      <VCard>
        <VCardText>          
          <p>alerta 1</p>      
        </VCardText>        
        <VCardText class="d-flex justify-end">
          <VBtn @click="showModalAlert = false">
            Cerrar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog v-model="showModalCheckList" width="1500">
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="showModalCheckList = !showModalCheckList" />

      <VCard title="Previsualizar E6">
        <VCardText class="d-flex justify-end">
          <VCol>
            <DataTable :fields="fields" :items="items" paginate>
              <template #cell(folio)="{ item }">
                <VTextField
                  v-model="item.folio"
                  clearable
                  type="number"
                  label="Message"
                  color="primary"
                  @focusout="handleFocusout"
                />
              </template>
              <template #cell(actions)="{item }">
                <div v-if="item.hash">
                  <div v-if="can('show', 'file-inscriptions-doc')">
                    <VBtn
                      class="text-center"
                      icon="tabler-eye"
                      variant="text"
                      color="secondary"
                      @click="showFile(item.name, item.id)"
                    />
                    <VBtn
                      class="text-center"
                      icon="tabler-download"
                      variant="text"
                      color="secondary"
                      @click="downloadFile(item.id, item.name)"
                    />
                  </div>
                </div>
              </template>
              <template #cell(state)="{ item }">
                <div>
                  <VCheckbox
                    v-model="item.state"
                    label="Aprobar"
                  />
                </div>
              </template>
            </DataTable>
            <VBtn @click="showModalCheckList = false">
              Enviar
            </VBtn>
          </VCol>
        </VCardText>
      </VCard>
    </VDialog>
    
    <VDialog v-model="isDialogVisible3" width="500">
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible3 = !isDialogVisible3" />

      <!-- Dialog Content -->
      <VCard title="Rechazar Formulario">
        <VTextField v-model="Observation" style="width: 90%; margin-top: 10px; margin-left: 10px;" label="Observacion de rechazo" />
        <VCardText class="d-flex justify-end">
          <VBtn @click="saveApproved(2)">
            Enviar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <VDialog
      v-model="isDialogVisible"
      max-width="550"
    >
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />   
      <VCard class="v-dialog-sm">
        <VImg
          :src="imageLogo"
          cover
        />
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VListItemTitle class="text-h6 d-flex justify-center">
                {{ t("tabSummary.shipping_confirmation") }}   
              </VListItemTitle>
              <VListItemSubtitle class="mt-4 d-flex justify-center">
                {{ t("tabSummary.confirmation_email") }}    
              </VListItemSubtitle>
              <VCardText  
                class="d-flex justify-center flex-wrap gap-3"
              >
                <VBtn
                  color="secondary"
                  variant="tonal"
                  @click="isDialogVisible = false"
                >
                  {{ t('auth.cancel') }}
                </VBtn>
                <VBtn
                  @click="sentNotification1"
                >
                  <VIcon 
                    size="20"
                    icon="mdi-send"
                  />
                  {{ t("tabSummary.send_confirmation") }}  
                </VBtn>
              </VCardText>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss">
.text-table {
  font-size: 1rem;
}

.card-primary {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

.notify-mail {
  color: black !important;
}
</style>
