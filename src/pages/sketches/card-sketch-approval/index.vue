<script setup>
import { useI18n } from "vue-i18n"
import Filter from '@/pages/sketches/card-sketch-approval/components/Filter.vue'
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import axios from '@/plugins/axios'
import imageLogo from '@images/pages/fondoContrasena.png'
import Swal from '@/plugins/sweetalert2'

const dataList = ref([])
const { t } = useI18n()
const endpoint = '/v1/card-sketch/list-approval'
const filtersControls = reactive({ loading: false, disabled: false })
const filters = ref({})
const pdfUrl = ref('')
const pdfFileName = ref('')
const isDialogVisible = ref(false)
const dialogFormReject = ref(false)
const zoom = ref('200%')
const datatable = ref(null)
const isVisible = ref(false)
const buttonEnabled = ref(false)

const fields = ref([
  { key: 'corporationName', label: t('print_sketch.table.corporation').toUpperCase() },
  { key: 'department', label: t('print_sketch.table.department').toUpperCase() },
  { key: 'municipality', label: t('print_sketch.table.municipality').toUpperCase() },
  { key: 'commune', label: t('print_sketch.table.commune').toUpperCase() },
  { key: 'actions', label: t('print_sketch.table.actions').toUpperCase(), thClass: 'text-center' },
])

const handlerFilter = value => {
  filtersControls.loading = true
  filtersControls.disabled = true

  const { corporationId, department, municipality, commune, valid } = value 

  const queryParams = {}

  if (corporationId !== -2) {
    queryParams.corporationId = corporationId
  }

  if (department !== -2) {
    queryParams.department = department
  }

  if (municipality !== -2) {
    queryParams.municipality = municipality
  }

  if (commune !== -2) {
    queryParams.commune = commune
  }

  filters.value = queryParams
  isVisible.value = valid

}

const formReject = ref({
  id: null,
  observation: null,
})

const downloadSketch = () => {
  const a = document.createElement('a')

  a.href = pdfUrl.value
  a.download = pdfFileName.value
  a.click()

  a.remove()
}

const previewApprovalSketch = async (action, value, name) => {
  switch (action) {
  case 1:
    // Preview sketch
    let file
    try {
      const response = await axios.get(`/v1/card-sketch/preview?cardSketchId=${value}`, { responseType: 'blob' })
      const file = new Blob([response.data], { type: 'application/pdf' })

      pdfUrl.value = URL.createObjectURL(file)
      pdfFileName.value = name
      isDialogVisible.value = true
    
      // const a = document.createElement('a')
      // a.href = pdfUrl.value
      // a.download = `${name}.pdf`
      // a.click()
    } catch (e) {
      let text = 'No es posible realizar operación, por favor intenta más tarde.'
      if (e.response) {
        const { data } = e.response
        const response = data instanceof Blob ? JSON.parse(await data.text()) : data

        text = response.message
      }
      Swal.fire({ icon: 'warning', text: text })
    } finally {
      if (file) {
        URL.revokeObjectURL(file)
        pdfUrl.value = null
      }
    }
    break

  case 2:
    // Approval sketch manual or massived
    if (value.length >= 2) {
      Swal.fire({
        text: t('card_sketch_approval.swal.questionMasive'),
        icon: "question",
        customClass: { confirmButton: "bg-error notAllowedEmulator" },
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await axios.post('/v1/card-sketch/approve', value)
            Swal.fire({ text: t('card_sketch_approval.swal.msg_approveMasive'), icon: "success" })
            datatable.value.refresh()
        
            return true
          } catch (error) {
            let message = t('common.not_operation')
            if (error.response && error.response.status < 500) 
              message = error.response.data.message
            Swal.fire({ icon: "warning", text: message })
        
            return false
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      })
    } else {
      Swal.fire({
        text: t('card_sketch_approval.swal.question'),
        icon: "question",
        customClass: { confirmButton: "bg-error notAllowedEmulator" },
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await axios.post('/v1/card-sketch/approve', value)
            Swal.fire({ text: t('card_sketch_approval.swal.msg_approve'), icon: "success" })
            datatable.value.refresh()
        
            return true
          } catch (error) {
            let message = t('common.not_operation')
            if (error.response && error.response.status < 500) 
              message = error.response.data.message
            Swal.fire({ icon: "warning", text: message })
        
            return false
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      })
    }
    break
  }
}

const openFormSketchReject = value => {
  dialogFormReject.value = true
  formReject.value.id = value
}

const handlerSketchReject = async () => {
  try {
    const { id, observation } = formReject.value
    const requestBody = { cardSketchId: id, observation }

    await axios.post('/v1/card-sketch/reject', requestBody)
    dialogFormReject.value = true
    Swal.fire({ text: t('card_sketch_approval.swal.msg_reject'), icon: "success" })
    assign()
    datatable.value.refresh()
    
    return true
  } catch (error) {
    let message = t('common.not_operation')
    if (error.response && error.response.status < 500) 
      message = error.response.data.message
    Swal.fire({ icon: "warning", text: message })
        
    return false
  } finally {
    formReject.value = {}
  }
}

const assign = items => {
  filtersControls.loading = false
  filtersControls.disabled = false
  dataList.value = items
}

watch(dataList, newDataList => {
  if (newDataList.length >= 2) {
    buttonEnabled.value = true
  } else {
    buttonEnabled.value = false
  }
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('card_sketch_approval.breadcrumbs.title'), t('card_sketch_approval.breadcrumbs.page')]" />
    <Filter
      :disabled="filtersControls.disabled"
      :loading="filtersControls.loading"
      class="mb-2"
      @next="handlerFilter" 
    />
    <div v-if="isVisible" class="d-flex justify-end mb-2">
      <VBtn color="primary" class="notAllowedEmulator" :disabled="!buttonEnabled" @click="previewApprovalSketch(2, dataList.map(item => { return item.id }))">
        {{ t('card_sketch_approval.btn_approveSketchMasive') }}
      </VBtn>  
    </div>
    <DataTableServerSide v-if="isVisible" ref="datatable" :endpoint="endpoint" :params="filters" :fields="fields" @return-data="assign">
      <template #cell(actions)="{item}">
        <div class="d-flex justify-center">
          <VBtn size="38" variant="secondary" @click="previewApprovalSketch(1, item.id, item.fileName)">
            <VIcon
              icon="tabler-eye"
              size="22"
            />
            <VTooltip
              activator="parent"
              location="start"
            >
              Previsualizar boceto
            </VTooltip>
          </VBtn>
          <VBtn size="38" variant="secondary" class="notAllowedEmulator" @click="previewApprovalSketch(2, [item.id])">
            <VIcon
              icon="tabler-check"
              size="22"
            />
            <VTooltip
              activator="parent"
              location="start"
            >
              Revisar boceto
            </VTooltip>
          </VBtn>
        </div>
      </template>
    </DataTableServerSide>
    
    <VDialog
      v-model="isDialogVisible"
      width="1050"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

      <!-- Dialog Content -->
      <VCard>
        <VCardText>
          <embed :src="`${pdfUrl}#toolbar=0`" type="application/pdf" width="100%" height="500" :zoom="zoom">
        </VCardText>

        <VCardText class="d-flex justify-space-between">
          <VBtn variant="outlined" prepend-icon="tabler-download" @click="downloadSketch">
            {{ t('common.btn_download') }}
          </VBtn>
          <VBtn @click="isDialogVisible = false">
            {{ t('common.btn_close') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog
      v-model="dialogFormReject"
      width="700"
      persistent
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="dialogFormReject = !dialogFormReject" />

      <!-- Dialog Content -->
      <VCard>
        <VForm @submit.prevent="handlerSketchReject">
          <VImg
            :src="imageLogo"
            cover
          />
          <VCardText>
            <h2 class="d-flex justify-center">
              Observaciones para boceto rechazado
            </h2>
            <p class="d-flex justify-center">
              A continuación registre las observaciones encontradas en el boceto
            </p>
            <VRow>
              <VCol cols="23" md="12">
                <VTextarea v-model="formReject.observation" />
              </VCol>  
            </VRow>
          </VCardText>

          <VCardText class="d-flex justify-end gap-2">
            <VBtn color="secondary" @click="dialogFormReject = false">
              {{ t('common.btn_close') }}
            </VBtn>
            <VBtn type="submit">
              {{ t('common.btn_submit') }}
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "sketches-card-sketch-approval"
meta:
authRequired: true
</route>
