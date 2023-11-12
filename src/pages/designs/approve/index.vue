<script setup>
import ApproveDesignForm from '@/components/designs/ApproveDesignForm.vue'
import DesignsFilter from '@/components/designs/DesignsFilter.vue'
import DataTable from '@/components/shared/DataTable.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'
import { getParameter } from '@/utils/parameter'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const breadcrumbs = [
  t('common.home'),
  t('design.module_name'),
  t('design.approve.page_title'),
]

const fieldsTable = [
  { key: "corporation", label: t('common.corporation') },
  { key: "circunscription", label: t('common.circunscription') },
  { key: "department", label: t('common.department') },
  { key: "municipality", label: t('common.municipality') }, 
  { key: "commune", label: t('common.commune') }, 
  { key: "totalGroupingPolitical", label: 'Total Agrupaciones Inscritas' },
  { key: "totalMissingGenerateE8", label: 'Faltantes por Generar E8' },
  { key: "totalRaffledGroupings", label: 'Total Agrupaciones Sorteadas' },
  { key: "actions", label: 'Acciones' },
]

const dialogFlag = ref(false)
const isLoadingDownload = ref(false)
const filtersControls = reactive({ loading: false, disabled: false })
const filtersData = ref({})
const cardDesigns = ref([])

const canApprove = ref(false)

const currentDesign = ref({})

const handlerSearch = async value => {
  filtersControls.disabled = true
  filtersControls.loading = true
  cardDesigns.value = []
  
  try {
    updateCanApprove()

    const { data } = await axios.get('/v1/card-designs/to-approve', { params: value })

    cardDesigns.value = data
    filtersData.value = value
  } catch (error) {
    filtersControls.disabled = false
    if (error.response && error.response.status < 500) {  
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    } else {
      Swal.fire({ icon: 'warning', text: 'No es posible realizar operación, por favor intenta más tarde.' })
    }
  }

  filtersControls.loading = false
}

const downloadDesign = async value => {
  isLoadingDownload.value = true
  try {
    const { data } = await axios.get(`/v1/card-designs/view?id=${value.cardId}`, { responseType: 'blob' })

    downloadBlob(data, value.fileName)
  } catch (e) {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
  }
  isLoadingDownload.value = false
}

const handlerSetCurrentDesign = value => {
  currentDesign.value = value
  dialogFlag.value = true
}

const handlerCanceled = () => {
  currentDesign.value = false
  dialogFlag.value = false
}

const handlerSaved = () => {
  handlerSearch(filtersData.value)
  currentDesign.value = null
  dialogFlag.value = false
}

const updateCanApprove =  async () => {
  const value = await getParameter("ENAPROTA")

  canApprove.value = value == "S"
}


onMounted(() => updateCanApprove())
</script>

<template>
  <div>
    <VBreadcrumbs :items="breadcrumbs" />
    <DesignsFilter 
      :loading="filtersControls.loading"
      enable-required
      class="mb-5" 
      @search="handlerSearch" 
    />

    <VCard v-if="cardDesigns && cardDesigns.length > 0">
      <DataTable :fields="fieldsTable" :items="cardDesigns" paginate>
        <template #cell(totalGroupingPolitical)="{ value }">
          <div class="text-center">
            {{ value ?? 0 }}
          </div>
        </template>
        <template #cell(totalMissingGenerateE8)="{ value }">
          <div class="text-center">
            {{ value ?? 0 }}
          </div>
        </template>
        <template #cell(totalRaffledGroupings)="{ value }">
          <div class="text-center">
            {{ value ?? 0 }}
          </div>
        </template>
        <template #cell(actions)="{ item }">
          <div class="text-no-wrap my-2">
            <VBtn 
              variant="outlined" 
              color="primary" 
              size="38" 
              class="me-2"
              @click="() => downloadDesign(item)"
            >
              <VIcon icon="tabler-download" />
            </VBtn>
            <VBtn 
              v-if="canApprove"
              variant="outlined" 
              color="success" 
              size="38" 
              class="me-2"
              @click="() => handlerSetCurrentDesign({ ...item, action: 1 })"
            >
              <VIcon icon="tabler-file-check" size="22" />
            </VBtn>
            <VBtn 
              v-if="canApprove"
              variant="outlined" 
              color="error" 
              size="38" 
              class="me-2"
              @click="() => handlerSetCurrentDesign({ ...item, action: 2 })"
            >
              <VIcon icon="tabler-file-x" size="22" />
            </VBtn>
          </div>
        </template>
      </DataTable>
    </VCard>

    <VDialog
      v-model="dialogFlag"
      persistent
      class="v-dialog-lg"
      transition="dialog-top-transition"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="handlerCanceled" />
      <ApproveDesignForm :current-design="currentDesign" @saved="handlerSaved" @canceled="handlerCanceled" />
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "designs-approve"
meta:
  authRequired: true
</route>
