<script setup>
import { useI18n } from "vue-i18n"
import Filter from "@/components/logo-symbol/historical-rejections/Filter.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import ViewLogo from "@/components/logo-symbol/historical-rejections/ViewLogo.vue"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'
import moment from "moment"

// Definición e inicialización de variables
const { t } = useI18n()
const filtersControls = reactive({ loading: false, disabled: false })
const endpoint = '/v1/grouping-political-logo/historical/logo'
const filters = ref({})
const isVisibleTable = ref(false)

const fields = ref([
  { key: 'logo', label: t('logo_symbol.historical_rejections.table.logo'), thClass: 'text-center' },
  { key: 'state', label: t('logo_symbol.historical_rejections.table.state'), thClass: 'text-center' },
  { key: 'createdDate', label: t('logo_symbol.historical_rejections.table.createdDate'), thClass: 'text-center' },
  { key: 'createdBy', label: t('logo_symbol.historical_rejections.table.createdBy'), thClass: 'text-center' },
  { key: 'resolutionName', label: t('logo_symbol.historical_rejections.table.resolutionName'), thClass: 'text-center' },
  { key: 'resolutionLogo', label: t('logo_symbol.historical_rejections.table.resolutionLogo'), thClass: 'text-center' },
  { key: 'observation', label: t('logo_symbol.historical_rejections.table.observation'), thClass: 'text-center' },
])

// Funciones o métodos
const handlerFilter = value => {

  filtersControls.loading = true
  filtersControls.disabled = true

  const { department, municipality, commune, corporationId, circunscriptionId, isBlankVotePromote, groupingPoliticalId, groupingPoliticalTypeId, valid } = value

  filters.value = {
    nameGroupId: groupingPoliticalId,
    typeGroup: groupingPoliticalTypeId,
    voteBlank: isBlankVotePromote, 
    corporationId,
    circunscriptionId,
    departmentId: department,
    municipalityId: municipality,
    communeId: commune,
  }

  isVisibleTable.value = valid

  filtersControls.loading = false
  filtersControls.disabled = false
}

const handlerExportResolution = async value => {
  try {
    const { data } = await axios.get(`/v1/grouping-political-logo/filepdf/resolution/${value}`, { responseType: 'blob' })

    downloadBlob(data, value, 'application/pdf')
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
    throw new Error(e)
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs
      :items="[ 
        t('logo_symbol.historical_rejections.breadcrumbs.title'), 
        t('logo_symbol.historical_rejections.breadcrumbs.page'), 
      ]"
    />
    <Filter 
      :disabled="filtersControls.disabled" 
      :loading="filtersControls.loading"
      class="mb-2"
      @next="handlerFilter"
    />
    <DataTableServerSide v-if="isVisibleTable" :endpoint="endpoint" :params="filters" :fields="fields">
      <template #cell(logo)="{ item }">
        <div class="d-flex justify-center">
          <ViewLogo :logo-id="item.logo" :hash="item.hash" />
        </div>
      </template>
      <template #cell(createdDate)="{ item }">
        <div class="d-flex justify-center">
          {{ item.createdDate == null ? '-' : moment(item.createdDate).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
      </template>
      <template #cell(state)="{ item }">
        <div class="d-flex justify-center">
          {{ item.state === -1 ? 'Rechazado' : item.state === 1 ? 'Aprobado' : 'Pendiente' }}
        </div>
      </template>
      <template #cell(createdBy)="{ item }">
        <div class="d-flex justify-center">
          {{ item.createdBy }}
        </div>
      </template>
      <template #cell(resolutionName)="{ item }">
        <div class="d-flex justify-center">
          <VBtn v-if="item.resolutionName" variant="plain" color="primary" @click="() => handlerExportResolution(item.resolutionName)">
            <VTooltip
              activator="parent"
              location="top"
            >
              {{ t('logo_symbol.historical_rejections.table.downloadResolutionName') }}
            </VTooltip>
            <VIcon size="30" icon="tabler-download" class="me-2" />
          </VBtn>
        </div>
      </template>
      <template #cell(resolutionLogo)="{ item }">
        <div class="d-flex justify-center">
          <VBtn v-if="item.resolutionLogo" variant="plain" color="primary" @click="() => handlerExportResolution(item.resolutionLogo)">
            <VTooltip
              activator="parent"
              location="top"
            >
              {{ t('logo_symbol.historical_rejections.table.downloadResolutionLogo') }}
            </VTooltip>
            <VIcon size="30" icon="tabler-download" class="me-2" /> 
          </VBtn>
        </div>
      </template>
      <template #cell(observation)="{ item }">
        <div class="d-flex justify-center">
          <div class="text-wrap">
            {{ item.observation }}
          </div>
        </div>
      </template>
    </DataTableServerSide>
  </div>
</template>

<route lang="yaml">
name: "logo-symbol-historical-rejections"
meta:
authRequired: true
</route>
