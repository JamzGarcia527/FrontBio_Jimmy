<script setup>
import Filter from '@/pages/candidates/applicationAcceptanceCheck/filter.vue'
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

const filtersControls = reactive({ loading: false, disabled: false })
const filters = ref({})
const { t } = useI18n()
const datatable = ref(null)
const isVisible = ref(false)

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

const handleNextFilter = async value => {
  
  filtersControls.loading = true
  filtersControls.disabled = true

  const { 
    circunscriptionId,
    commune,
    corporationId,
    department,
    groupingPoliticalId,
    groupingPoliticalTypeId,
    municipality,
    valid,
  } = value

  filters.value = { 
    circunscriptionId,
    communeId: commune,
    corporationId,
    departmentId: department,
    groupingPoliticalId,
    groupingPoliticalTypeId,
    municipalityId: municipality,
  }

  isVisible.value = valid
  filtersControls.loading = false
  filtersControls.disabled = false
}

const handlerApplicationAcceptance = async (candidateDni, inscriptionId, inscriptionsChangeId, candidateId, value) => {

  const requestBody = {
    inscriptionId,
    approveStatus: value,
    candidateId,
    inscriptionsChangeId,
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
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      } finally {
        datatable.value.refresh()
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('candidates.applicationAcceptanceCheck.breadcrumbs.title'), t('candidates.applicationAcceptanceCheck.breadcrumbs.page') ]" />
    <Filter 
      :loading="filtersControls.loading"
      :disabled="filtersControls.disabled"
      class="mb-4"
      @next="handleNextFilter"
    />
    <DataTableServerSide
      v-if="isVisible"
      ref="datatable"
      endpoint="/v1/candidates/check"
      :empty-text="t('common.empty_table')"
      :params="filters"
      :fields="fields"
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
              @update:model-value="$event => handlerApplicationAcceptance(item.candidateDni, item.inscriptionId, item.inscriptionChangeId, item.candidateId, $event)"
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
  </div>
</template>

<style scoped>
.text-muted {
  color: #878a99 !important;
}
</style>

<route lang="yaml">
name: "candidates-application-acceptance-check"
meta:
  authRequired: true
</route>
