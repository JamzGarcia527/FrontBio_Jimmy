<script setup>
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import imageLogo from '@images/pages/fondoContrasena.png'
import Swal from '@/plugins/sweetalert2'
import PreviewE6 from './PreviewE6.vue'
import RequestApprove from './RequestApprove.vue'
import SummaryTables from '@/components/preinscription/summary/SummaryTables.vue'
import SummarySupports from '@/components/preinscription/summary/SummarySupports.vue'
import SummaryInfo from '@/components/preinscription/summary/SummaryInfo.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import DeleteE6 from "./DeleteE6.vue"

const props = defineProps({
  inscriptionId: { type:Number, required:true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
  radicateId: { type: String, default: "" },
  isUninominal: { type: Boolean, default: false },
})

const { t } = useI18n()

const inscriptionIdProps = ref(props.inscriptionId)
const groupingPoliticalTypeIdProps = ref(props.groupingPoliticalTypeId)
const isSnackbarVisible = ref(false)
const isSnackbarVisibleEmail = ref(false)
const notifyMail = ref("")
const { can } = useAppAbility()
const NumberRadicate = ref(null)
const isDialogVisible3 = ref(false)
const Observation = ref("")
const showModal = ref(false)
const showModalAlert = ref(false)
const pdfUrl = ref('')
const zoom = ref('150%')


// Funciones para Aprobación por parte de la autoridad electoral
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
              class="ps-10"
            >
              <SummarySupports
                style="width: 100%;"
                :inscription-id="inscriptionIdProps" 
                :grouping-political-type-id="groupingPoliticalTypeIdProps"
              />

              <br>

              <VRow class="match-height">
                <VCol cols="12">
                  <PreviewE6 v-if="can('get-preview', 'inscription')" :inscription-id="inscriptionId" />
                </VCol>
                <VCol v-if="can('approve-request', 'inscription')" cols="12" sm="6" md="12">
                  <RequestApprove 
                    :inscription-id="inscriptionId" 
                    :radicate-id="props.radicateId"
                  />
                </VCol>
                <VCol v-if="can('delete', 'inscription')" cols="12" sm="6" md="12">
                  <DeleteE6 :inscription-id="inscriptionId" />
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
