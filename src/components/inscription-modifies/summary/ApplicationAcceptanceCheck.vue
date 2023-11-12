<script setup>
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import { useI18n } from "vue-i18n"
import { useInscriptionModify } from '@/stores/inscriptionModify'

// Dependencies
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { toRefs } from 'vue'


// Defining props
const props = defineProps({
  inscriptionModifyId: { type: Number, required: true },
  isDialogVisible: { type: Boolean, required: true },
})

// Emits
const emits = defineEmits(['close-modal'])


// Variable definition and initialization
const { isDialogVisible } = toRefs(props)
const { t } = useI18n()
const listApplicationAcceptanceCheck = ref(`/v1/inscription-change/list/${props.inscriptionModifyId}`)
const datatable = ref(null)
const inscriptionStore = useInscriptionModify()

const fields = ref([
  { key: "rowField", label: t('candidates.applicationAcceptanceCheck.table.line').toUpperCase(), thClass: 'text-center' },
  { key: "candidateDni", label: t('candidates.applicationAcceptanceCheck.table.dni').toUpperCase() },
  { key: "fullName", label: t('candidates.applicationAcceptanceCheck.table.fullName').toUpperCase() },
  { key: "gender", label: t('candidates.applicationAcceptanceCheck.table.gender').toUpperCase(), thClass: 'text-center' },
  { key: "age", label: t('candidates.applicationAcceptanceCheck.table.age').toUpperCase(), thClass: 'text-center' },
  { key: "stage", label: t('candidates.applicationAcceptanceCheck.table.stage').toUpperCase(), thClass: 'text-center' },
  { key: "acceptedCandidacy", label: t('candidates.applicationAcceptanceCheck.table.acceptedCandidacy').toUpperCase(), thClass: 'text-center' },
  { key: "eisTransaction", label: t('candidates.applicationAcceptanceCheck.table.eisCode').toUpperCase(), thClass: 'text-center' },
  { key: "approvalType", label: t('candidates.applicationAcceptanceCheck.table.approvalType').toUpperCase(), thClass: 'text-center' },
])

// Functions or methods
const handlerApplicationAcceptance = async (candidateDni, inscriptionsChangeId, inscriptionId, candidateId, value) => {

  const requestBody = {
    inscriptionsChangeId,
    inscriptionId,
    approveStatus: value,
    candidateId,
  }

  Swal.fire({
    title: value == 1 ? t('candidates.applicationAcceptanceCheck.titleAcceptCandidacy') : t('candidates.applicationAcceptanceCheck.titleRejectCandidacy'),
    icon: "question",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        const response = await axios.put(`/v1/candidates/check/${candidateDni}`, requestBody)

        if (response.status == 204) {
          Swal.fire({ text: t('candidates.applicationAcceptanceCheck.msg_confirmation'), icon: "success" }) 
          
          return true
        }
        
      } catch (error) {
        let message = t('candidates.applicationAcceptanceCheck.not_operation')
        if (error.response && error.response.status <= 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      } finally {
        datatable.value.refresh()
        await inscriptionStore.getCandidates(props.inscriptionModifyId)
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}
</script>

<template>
  <div>
    <VDialog
      v-model="isDialogVisible"
      persistent
      max-width="1700"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="emits('close-modal', false)" />

      <!-- Dialog Content -->
      <VCard :title="t('tabSummary.applicationAcceptanceCheck')">
        <VCardText>
          <DataTableServerSide 
            ref="datatable" 
            :empty-text="t('common.empty_table')" 
            :fields="fields" 
            :endpoint="listApplicationAcceptanceCheck"
          >
            <template #cell(rowField)="{ item }">
              <div class="d-flex justify-center">
                {{ item.rowField }}
              </div>
            </template>
            <template #cell(fullName)="{ item }">
              {{ item.firstName }}
              {{ item.secondName }}
              {{ item.firstSurname }}
              {{ item.secondSurname }}
            </template>
            <template #cell(gender)="{ item }">
              <div class="d-flex justify-center">
                {{ item.gender }}
              </div>
            </template>
            <template #cell(age)="{ item }">
              <div class="d-flex justify-center">
                {{ item.age }}
              </div>
            </template>
            <template #cell(stage)="{ item }">
              <div class="d-flex justify-center">
                {{ item.stage }}
              </div>
            </template>
            <template #cell(acceptedCandidacy)="{ value, item }">
              <div class="d-flex justify-center">
                <div>
                  <VRadioGroup 
                    :disabled="item.icon == 1 || item.icon == 2 || item.icon == 3 || item.approveType == null"
                    :model-value="value" inline 
                    @update:model-value="$event => handlerApplicationAcceptance(item.candidateDni, item.inscriptionChangeId, item.inscriptionId, item.candidateId, $event)"
                  >
                    <VRadio label="Si" :value="item.approveStatus == 1 ? value : 1" />
                    <VRadio label="No" :value="item.approveStatus == 2 ? value : 2" />
                  </VRadioGroup>
                </div>
              </div>
            </template>
            <template #cell(eisTransaction)="{ item }">
              <div class="d-flex justify-center">
                {{ item.eisTransaction == null || item.eisTransaction.trim() === '' ? '-' : item.eisTransaction }}
              </div>
            </template>
            <template #cell(approvalType)="{ item }">
              <div class="d-flex justify-center">
                <div v-if="item.icon == 1 || item.icon == 2 || item.icon == 3 || item.icon == 4">
                  <p v-if="item.icon == 1" class="text-center font-weight-regular mb-0">
                    <VIcon
                      start
                      size="16"
                      icon="tabler-mood-smile-beam"
                    /> Biometría facial <br>
                    <small v-if="item.codeTransactional" class="text-muted">
                      Código transacción - {{ item.codeTransactional }}
                    </small>
                  </p>
                  <p v-if="item.icon == 2" class="text-center font-weight-regular mb-0">
                    <VIcon
                      start
                      size="16"
                      icon="tabler-barcode"
                    /> Código EIS <br>
                    <small v-if="item.codeTransactional" class="text-muted">
                      Código transacción - {{ item.codeTransactional }}
                    </small>
                  </p>
                  <VChip v-if="item.icon == 3">
                    <VIcon
                      start
                      size="16"
                      :icon="item.approveType == 'Carta de aceptación' ? 'tabler-checklist' : 'tabler-hand-click'"
                    />
                    {{ item.approveType == null || item.approveType.trim() === '' ? 'Manual' : item.approveType }}
                  </VChip>
                  <VChip v-if="item.icon == 4 && item.approveType == null">
                    <VIcon
                      start
                      size="16"
                      icon="tabler-hand-click"
                    />
                    {{ item.approveType == null || item.approveType.trim() === '' ? 'Manual' : '-' }}
                  </VChip>
                  <span v-if="item.approveType == 'Pendiente'">
                    -
                  </span>
                </div>
              </div>
            </template>
          </DataTableServerSide>
        </VCardText>

        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="emits('close-modal', false)"
          >
            {{ t('common.close_modal') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
