<script setup>
import Filter from "@/components/upload-certification-signature/Filter.vue"
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import UploadCertificate from '@/components/upload-certification-signature/UploadCertificate.vue'
import { useI18n } from "vue-i18n"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"

// Declaring and initializing variables
const { t } = useI18n()
const filtersControls = reactive({ loading: false, disabled: false })
const endpoint = 'v1/committee-certificate/list'
const tableIsVisible = ref(false)
const filters = ref({})
const openDialogUploadCertificate = ref(false)
const groupingPoliticalIdSelected = ref(null)
const datatable = ref('')
const deletingFileUpload = ref(false)
const disabledDeleteFileUpload = ref(false)
const corporationIdSelected = ref(null)
const inscriptionIdSelected = ref(null)
const groupingPoliticalTypeIdSelected = ref(null)
const blankVotePromoterSelected = ref(null)
const pdfUrl = ref('')
const pdfFileName = ref('')
const zoom = ref('200%')
const isDialogVisible = ref(false)

const fields = ref([
  { key: 'corporationName', label: t('upload_certification_signature.table.corporation').toUpperCase()  },
  { key: 'departmentName', label: t('upload_certification_signature.table.department').toUpperCase()  },
  { key: 'municipalityName', label: t('upload_certification_signature.table.municipality').toUpperCase()  },
  { key: 'communeName', label: t('upload_certification_signature.table.commune').toUpperCase()  },
  { key: 'signaturesRequired', label: t('upload_certification_signature.table.signaturesRequired').toUpperCase(), thClass: 'text-center' },
  { key: 'uploadCertificate', label: t('upload_certification_signature.table.uploadCertificate').toUpperCase(), thClass: 'text-center' },
  { key: 'didYouMeetTheMinimumNumberOfSignatures', label: t('upload_certification_signature.table.didYouMeetTheMinimumNumberOfSignatures').toUpperCase(), thClass: 'text-wrap text-center' },
])

// Methods and functions
const handlerFilter = value => {

  const { department, municipality, commune, corporationId, circunscriptionId, isBlankVotePromote, groupingPoliticalTypeId, groupingPoliticalId, valid,
  } = value

  let queryParams = {
    groupingPoliticalType: groupingPoliticalTypeId,
    groupingPoliticalId,
    blankVotePromoter: isBlankVotePromote,
    corporationId,
    circunscriptionId,
    department,
    municipality,
    commune,
  }
  filters.value = queryParams
  tableIsVisible.value = valid
}

const hanlderCloseDialogUpload = () => {
  openDialogUploadCertificate.value = false
}

const handlerOpenDialogUpload = (isOpen, item) => {
  groupingPoliticalIdSelected.value = item.groupingPoliticalId
  openDialogUploadCertificate.value = isOpen
  corporationIdSelected.value = item.corporationId
  inscriptionIdSelected.value = item.inscriptionId
  groupingPoliticalTypeIdSelected.value = item.groupingPoliticalType
  blankVotePromoterSelected.value = item.blankVotePromoter
}

const handlerSavedUpload = value => {
  if (value) {
    openDialogUploadCertificate.value = false
    datatable.value.refresh()
  }
}

const handlerDeleteFileUploaded = async value => {
  const { groupingPoliticalId, supportingDocumentId, inscriptionSupportingDocumentId } = value

  const queryParams = {
    groupingPoliticalId,
    supportingDocumentId,
    inscriptionSupportingDocumentId,
  }

  try {
    deletingFileUpload.value = true
    await axios.post("/v1/committee-certificate/delete", null, {
      params: queryParams,
    })
    Swal.fire({ icon: "success", text: 'Operación realizada correctamente' })
    datatable.value.refresh()

    return true
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: "warning",
        text: message || t('assign_random_position.swal.not_operation'),
      })
    }

    return false
  } finally {
    deletingFileUpload.value = false
  }
}

const previewCerticate = async (value, name) => {
  let file
  try {
    const response = await axios.get(`/v1/committee-certificate/preview?committeeCertificateId=${value}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)
    pdfFileName.value = name
    isDialogVisible.value = true
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
}

const downloadCertificate = () => {
  const a = document.createElement('a')

  a.href = pdfUrl.value
  a.download = pdfFileName.value
  a.click()

  a.remove()
}
</script>

<template>
  <div>
    <VBreadcrumbs
      :items="[ 
        t('upload_certification_signature.breadcrumbs.title'), 
        t('upload_certification_signature.breadcrumbs.page'), 
      ]"
    />
    <Filter 
      :disabled="filtersControls.disabled" 
      :loading="filtersControls.loading"
      class="mb-2"
      @next="handlerFilter"
    />
    <DataTableServerSide v-if="tableIsVisible" ref="datatable" :fields="fields" :params="filters" :endpoint="endpoint">
      <template #cell(signaturesRequired)="{ item }">
        <div class="d-flex justify-center">
          {{ item.signaturesRequired == null ? '-' : item.signaturesRequired }}
        </div>
      </template>
      <template #cell(uploadCertificate)="{ item }">
        <div class="d-flex justify-center">
          <VBtn 
            v-if="!item.active" 
            variant="plain" 
            color="primary" 
            class="notAllowedEmulator"
            @click="() => handlerOpenDialogUpload(true, item)"
          >
            <VTooltip activator="parent" location="top">
              Examinar
            </VTooltip>
            <VIcon size="25" icon="tabler-upload" class="me-2" /> 
          </VBtn>
          <VBtn
            v-if="item.active" 
            class="notAllowedEmulator"
            :loading="deletingFileUpload" 
            :disabled="disabledDeleteFileUpload" 
            variant="plain" color="primary" 
            @click="() => handlerDeleteFileUploaded(item)"
          >
            <VTooltip
              activator="parent"
              location="top"
            >
              Eliminar 
            </VTooltip>
            <VIcon size="25" icon="tabler-trash" class="me-2" /> 
          </VBtn>
          <VBtn
            v-if="item.active || deletingFileUpload" 
            variant="plain" 
            color="primary" 
            @click="() => previewCerticate(item.committeeCertificateId, item.registrationPlace)"
          >
            <VTooltip
              activator="parent"
              location="top"
            >
              Ver documento 
            </VTooltip>
            <VIcon size="25" icon="tabler-eye" class="me-2" /> 
          </VBtn>
        </div>
      </template>
      <template #cell(didYouMeetTheMinimumNumberOfSignatures)="{ item }">
        <div v-if="item.fulfilledSignature == 0 || item.fulfilledSignature == 1" class="d-flex justify-center">
          {{ item.fulfilledSignature == 1 ? 'SI' : 'NO' }}
        </div>
      </template>
    </DataTableServerSide>
    <UploadCertificate 
      :dialog-is-open="openDialogUploadCertificate"
      :inscription-id="inscriptionIdSelected"
      :corporation-id="corporationIdSelected"
      :grouping-political-id="groupingPoliticalIdSelected"
      :blank-vote-promoter="blankVotePromoterSelected"
      :grouping-political-type-id="groupingPoliticalTypeIdSelected"
      @close-dialog-upload-certificate="hanlderCloseDialogUpload"
      @saved-upload="handlerSavedUpload"
    />
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
          <VBtn variant="outlined" prepend-icon="tabler-download" @click="downloadCertificate">
            {{ t('common.btn_download') }}
          </VBtn>
          <VBtn @click="isDialogVisible = false">
            {{ t('common.btn_close') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "upload-certification-signature"
meta:
authRequired: true
</route>

