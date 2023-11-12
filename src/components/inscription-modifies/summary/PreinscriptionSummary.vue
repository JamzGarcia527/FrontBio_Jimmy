<script setup>
import { useI18n } from "vue-i18n"
import PreviewE7 from './PreviewE7.vue'
import RequestApprove from './RequestApprove.vue'
import SummaryTables from '@/components/inscription-modifies/summary/SummaryTables.vue'
import SummarySupports from '@/components/inscription-modifies/summary/SummarySupports.vue'
import SummaryInfo from '@/components/inscription-modifies/summary/SummaryInfo.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import CancelE7 from "./CancelE7.vue"

const props = defineProps({
  inscriptionId: { type:Number, required:true },
  inscriptionModifyId: { type:Number, required:true },
  radicateId: { type: String, default: "" },
  groupingPoliticalTypeId:{ type:Number, required:true  },
  isUninominal: { type: Boolean, default: false },
})

const { t } = useI18n()


const { inscriptionId, inscriptionModifyId, groupingPoliticalTypeId } = toRefs(props)


const isSnackbarVisible = ref(false)
const isSnackbarVisibleEmail = ref(false)
const notifyMail = ref("")
const { can } = useAppAbility()
const showModal = ref(false)
const showModalAlert = ref(false)
const pdfUrl = ref('')
const zoom = ref('150%')
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <VForm class="mt-5">
          <VRow>
            <VCol cols="12" md="8">
              <SummaryInfo
                :inscription-id="inscriptionId" 
                :grouping-political-type-id="groupingPoliticalTypeId"
                :is-uninominal="isUninominal"
              />

              <SummaryTables
                :inscription-id="inscriptionModifyId" 
                :grouping-political-type-id="groupingPoliticalTypeId"
              />
            </VCol>
            <VCol 
            
              cols="12" 
              md="4"
              class="ps-10"
            >
              <SummarySupports
                style="width: 100%;"
                :inscription-id="inscriptionModifyId" 
                :grouping-political-type-id="groupingPoliticalTypeId"
              />

              <br>

              <VRow class="match-height">
                <VCol cols="12">
                  <PreviewE7 v-if="can('get-preview', 'inscription-change')" :inscription-id="inscriptionModifyId" />
                </VCol>
                <VCol cols="12" sm="4" md="12">
                  <RequestApprove 
                    v-if="can('approve-request', 'inscription-change')" 
                    :inscription-id="inscriptionModifyId" 
                    :radicate-id="radicateId"
                  />
                </VCol>
                <VCol cols="12" sm="4" md="12">
                  <CancelE7 v-if="can('cancel-request', 'inscription-change')" :inscription-id="inscriptionModifyId" />
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
