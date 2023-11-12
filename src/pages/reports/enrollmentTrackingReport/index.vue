<script setup>
import SummaryFilter from '@/components/reports/enrollmentTrackingReport/enrollmentTrackingFilter.vue'
import axios from '@/plugins/axios'
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import imageLogo from '@images/pages/fondoContrasena.png'
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import SupportDocInscription from "@/components/reports/enrollmentTrackingReport/SupportDocFolioInscription.vue"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import { downloadBlob } from '@/utils'


const { t } = useI18n()

const filters = ref([])
const isDialogVisible = ref(false)  
const isDialogFomrt = ref(false)
const inscriptionIdBrackets = ref('') 
const groupingPoliticalTypeIdBrackets = ref('')
const isLoading = ref(false)
const error = ref(null)
const fileUrl = ref(null) 
const itemsBrackets = ref([])
const isDownloading = ref(false)
const inscriptionIE8 = ref('')
const nameFile = ref()
const fileType = ref()
const fileTypeSopor = ref(0)
const isVisible = ref(false)

const fieldsE6 = ref([
  { key: "statusInscription", label: t('preinscription.summary_header.status').toUpperCase() },
  { key: "creator", label: t('enrollment_tracking_report.letters.creation_user').toUpperCase()  },
  { key: 'created', label: t('enrollment_tracking_report.letters.Creation_date').toUpperCase() },
  { key: "formStatuE6", label: t('enrollment_tracking_report.letters.form_status').toUpperCase() },
  { key: "SoporteE6", label: t('enrollment_tracking_report.letters.e6_support_charged').toUpperCase() },
  { key: "FormularioE6", label:t('enrollment_tracking_report.letters.Form_E6').toUpperCase() },
])

const fieldsE7 = ref([
  { key: "radicate", label: t('enrollment_tracking_report.letters.Barcode').toUpperCase() },
  { key: "formStatuE7", label: t('enrollment_tracking_report.letters.state').toUpperCase()  },
  { key: "creator", label: t('enrollment_tracking_report.letters.creation_user').toUpperCase()  },
  { key: 'created', label: t('enrollment_tracking_report.letters.Creation_date').toUpperCase() },
  { key: "updated", label: t('enrollment_tracking_report.letters.date_last_modified').toUpperCase() },
  { key: "SoporteE7", label: t('enrollment_tracking_report.letters.document_generated_E7').toUpperCase() },
  { key: "FormularioE7", label:t('enrollment_tracking_report.letters.e7_support_charged').toUpperCase() },
  { key: "statusInscription", label:t('enrollment_tracking_report.letters.registration_status').toUpperCase() },

])


const handlerSearchFilter = value => {
  filters.value = value
  isVisible.value = value.valid
  valueE8()
}


const valueE8 = () => {
  const filter = filters.value

  if(  filter.groupingPoliticalTypeId !==-1  && filter.corporationId !== -1  && filter.department !== -1){
    const requestBody = {
      "department": filter.department,
      "municipality": filter.municipality,
      "commune": filter.commune,
      "corporationId": filter.corporationId,
      "isBlankVotePromote":filter.isBlankVotePromote,
      "circunscriptionId": filter.circunscriptionId,
      "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
      "groupingPoliticalId": filter.groupingPoliticalId,
    }

    try {
   
      axios.get("/v1/inscriptions/inscription-report-e-six", { params: requestBody })
        .then(response => {
          if(response.data.content[0])
            inscriptionIE8.value= response.data.content[0].inscription
        })


    } catch (error) {
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: 'warning', text: message })
      }

    }
  }
  else{
    inscriptionIE8.value = false
    Swal.fire({ icon: 'warning', text: 'Por favor seleccione uno de los filtros para buscar una Inscripción' })
  }
  
}


const openModalBracketsE6 =  async (inscription,groupingpoliticaltype) => {
  const filter = filters.value

  isDialogVisible.value = true
  inscriptionIdBrackets.value = inscription
  groupingPoliticalTypeIdBrackets.value = groupingpoliticaltype

  const requestBody = {
    inscription: inscription,
    groupingpoliticalType: groupingpoliticaltype,
  }

  try {
    await axios.get("v1/inscriptions-supporting-documents/from-supporting-documents", { params: requestBody })
      .then(response => {
        itemsBrackets.value = response.data
        fileTypeSopor.value = 1
      })
 

  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

    }
  }
}

const openModalBracketsE7 =  async (inscription,groupingpoliticaltype) => {
  const filter = filters.value

  isDialogVisible.value = true
  inscriptionIdBrackets.value = inscription
  groupingPoliticalTypeIdBrackets.value = groupingpoliticaltype
  
  const requestBody = {
    inscription: inscription,
    groupingpoliticalType: groupingpoliticaltype,
  }

  try {
    await axios.get("/v1/inscriptions-changes-supporting-documents/from-supporting-documents", { params: requestBody })
      .then(response => {
        itemsBrackets.value = response.data
        fileTypeSopor.value = 2
      })
 

  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

    }
  }
}


const openModalFormE6 = async  (inscriptionId,groupingpoliticaltype) => {
  
  isLoading.value = true
  error.value = null
  isDialogFomrt.value = true

  try {
    const { data } = await axios.get(`/v1/inscriptions/preview/${inscriptionId}`, { responseType: 'blob' })
    const file = new Blob([data], { type: 'application/pdf' })

    fileUrl.value = URL.createObjectURL(file)
  } catch (e) {
    fileUrl.value = null
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response && e.response.status < 500) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    error.value = text
  }
  isLoading.value = false
}


const openModalFormE7 = async  (inscriptionId,groupingpoliticaltype) => {
  
  isLoading.value = true
  error.value = null
  isDialogFomrt.value = true

  try {
    const { data } = await axios.get(`/v1/inscription-change/preview/${inscriptionId}`, { responseType: 'blob' })
    const file = new Blob([data], { type: 'application/pdf' })

    fileUrl.value = URL.createObjectURL(file)
  } catch (e) {
    fileUrl.value = null
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response && e.response.status < 500) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    error.value = text
  }
  isLoading.value = false
}


const exportar = type => {
  isDownloading.value = true

  const filter = filters.value

  const payload = {
    "department": filter.department,
    "municipality": filter.municipality,
    "commune": filter.commune,
    "corporationId": filter.corporationId,
    "circunscriptionId": filter.circunscriptionId,
    "isBlankVotePromote":filter.isBlankVotePromote,
    "groupingPoliticalTypeId": filter.groupingPoliticalTypeId,
    "groupingPoliticalId": filter.groupingPoliticalId,
    format: type,
  }

  axios.get(`/v1/inscription-change/inscription-report-e7-e6`, {
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    if(type ==='XLS'){
      nameFile.value = 'Reporte de Seguimiento de inscripción.xlsx'
      fileType.value = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
    }else if(type ==='CSV'){
      nameFile.value = 'Reporte de Seguimiento de inscripción.csv'
      fileType.value = 'text/csv;charset=utf-8'
    }

    downloadBlob(data, nameFile.value, fileType.value)
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isDownloading.value = false)
}


const openModalFormE8 = async  (inscriptionId,groupingpoliticaltype) => {
  
  isLoading.value = true
  error.value = null
  isDialogFomrt.value = true

  try {
    const { data } = await axios.get(`/v1/inscription-final/download/${inscriptionIE8.value}`, { responseType: 'blob' })
    const file = new Blob([data], { type: 'application/pdf' })

    fileUrl.value = URL.createObjectURL(file)
  } catch (e) {
    fileUrl.value = null
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response && e.response.status < 500) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    error.value = text
  }
  isLoading.value = false
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.letters.enrollment-tracking-report') ]" /> 
    <SummaryFilter class="mb-4" @search="handlerSearchFilter" />
    <VCard v-if="isVisible">
      <div style="margin-left: 90%;" class="me-3 mt-3 mb-2">
        <VMenu open-on-hover>
          <template #activator="{ props }">
            <VBtn v-bind="props">
              {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
            </VBtn>
          </template>

          <VList>
            <VListItem
              :title="t('formsPendingApproval.breadcrumbs.bntExcel')"
              @click="exportar('XLS')"
            />
            <VListItem
              :title="t('formsPendingApproval.breadcrumbs.bntCSV')"
              @click="exportar('CSV')"
            />
          </VList>
        </VMenu>
      </div>
      <VListItemTitle class="demo-space-x me-4 ps-5 mt-3 mb-2">
        {{ t('enrollment_tracking_report.letters.Information_E6').toUpperCase() }}
      </VListItemTitle>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/inscriptions/inscription-report-e-six"
        :params="filters"
        :fields="fieldsE6"
        show-empty-message
      >
        <template #cell(statusInscription)="{ item }">
          <VChip v-if="item.statusId == 1" color="warning">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.status }}</span>
          </VChip>
          <VChip v-else-if="item.statusId == 2" color="error">
            <VIcon start size="16" icon="tabler-circle-x" />
            <span>{{ item.status }}</span>
          </VChip>
          <VChip v-else-if="item.statusId == 3" color="text-info">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.status }}</span>
          </VChip>
          <VChip v-else-if="item.statusId == 4" color="success">
            <VIcon start size="16" icon="tabler-circle-check" />
            <span>{{ item.status }}</span>
          </VChip>
        </template>
        <template #cell(formStatuE6)="{ item }">
          <VChip v-if="item.formStatusId == 1" color="warning">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.formStatus }}</span>
          </VChip>
          <VChip v-else-if="item.formStatusId == 2" color="error">
            <VIcon start size="16" icon="tabler-circle-x" />
            <span>{{ item.formStatus }}</span>
          </VChip>
          <VChip v-else-if="item.formStatusId == 3" color="text-info">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.formStatus }}</span>
          </VChip>
          <VChip v-else-if="item.formStatusId == 4" color="success">
            <VIcon start size="16" icon="tabler-circle-check" />
            <span>{{ item.formStatus }}</span>
          </VChip>
        </template>
        <template #cell(SoporteE6)="{ item }">
          <div>
            <VBtn color="primary" @click="openModalBracketsE6(item.inscription,item.groupingpoliticaltype)">
              Consultar soportes E6
            </VBtn>
          </div>
        </template>
        <template #cell(FormularioE6)="{ item }">
          <div>
            <VBtn color="primary" @click="openModalFormE6(item.inscription,item.groupingpoliticaltype)">
              Consultar Formulario E6 
            </VBtn>
          </div>
        </template>
      </DataTableServerSide>
      <VListItemTitle class="demo-space-x me-4 ps-5 mt-3 mb-2">
        {{ t('enrollment_tracking_report.letters.Information_E7').toUpperCase() }}
      </VListItemTitle>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/inscription-change/list-report-e-seven"
        :params="filters"
        :fields="fieldsE7"
      >
        <template #cell(statusInscription)="{ item }">
          <VChip v-if="item.statusId == 1" color="warning">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.status }}</span>
          </VChip>
          <VChip v-else-if="item.statusId == 2" color="error">
            <VIcon start size="16" icon="tabler-circle-x" />
            <span>{{ item.status }}</span>
          </VChip>
          <VChip v-else-if="item.statusId == 3" color="text-info">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.status }}</span>
          </VChip>
          <VChip v-else-if="item.statusId == 4" color="success">
            <VIcon start size="16" icon="tabler-circle-check" />
            <span>{{ item.status }}</span>
          </VChip>
        </template>
        <template #cell(formStatuE7)="{ item }">
          <VChip v-if="item.formStatusId == 1" color="warning">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.formStatus }}</span>
          </VChip>
          <VChip v-else-if="item.formStatusId == 2" color="error">
            <VIcon start size="16" icon="tabler-circle-x" />
            <span>{{ item.formStatus }}</span>
          </VChip>
          <VChip v-else-if="item.formStatusId == 3" color="text-info">
            <VIcon start size="16" icon="tabler-alert-circle" />
            <span>{{ item.formStatus }}</span>
          </VChip>
          <VChip v-else-if="item.formStatusId == 4" color="success">
            <VIcon start size="16" icon="tabler-circle-check" />
            <span>{{ item.formStatus }}</span>
          </VChip>
        </template>

        <template #cell(FormularioE7)="{ item }">
          <div>
            <VBtn color="primary" @click="openModalBracketsE7(item.id,item.groupingpoliticaltype)">
              Consultar soportes E7
            </VBtn>
          </div>
        </template>
        <template #cell(SoporteE7)="{ item }">
          <div>
            <VBtn color="primary" @click="openModalFormE7(item.id,item.groupingpoliticaltype)">
              Consultar Formulario E7
            </VBtn>
          </div>
        </template>
      </DataTableServerSide>
      <VListItemTitle class="demo-space-x  ps-10 mt-3 mb-2">
        {{ t('enrollment_tracking_report.letters.Information_E8').toUpperCase() }}
      </VListItemTitle>
      <div class="demo-space-x me-2 ps-4 mb-10">
        <VBtn color="primary" @click="openModalFormE8">
          Consultar Formulario E8
        </VBtn>
      </div>
    </VCard>
    <VDialog
      v-model="isDialogVisible" 
      max-width="1000"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

      <!-- Dialog Content -->
      <VCard class="text-wrap">
        <VImg
          :src="imageLogo"
          cover
        />

        <SupportDocInscription
          :inscription-id="inscriptionIdBrackets" 
          :grouping-political-type-id="groupingPoliticalTypeIdBrackets"
          :items="itemsBrackets"
          :filetypesopor="fileTypeSopor"
        /> 
      </VCard>
    </VDialog>


    <VDialog
      v-model="isDialogFomrt" 
      max-width="600"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogFomrt = !isDialogFomrt" />

      <!-- Dialog Content -->
      <VCard class="text-wrap">
        <VImg
       
          :src="imageLogo"
          cover
        />
        <VCardText>
          <VDivider class="mt-2" />
          <VCardText 
            v-if="isLoading" 
            class="d-flex justify-center align-center" 
            style="height: 70vh;"
          >
            <VProgressCircular size="60" indeterminate />
          </VCardText>
          <VCardText v-else-if="error && error.length > 0">
            <div class="d-flex align-center text-h5 mb-2">
              <VIcon icon="tabler-alert-triangle" color="warning" class="me-2" /> 
              <div>¡Lo sentimos!</div>
            </div>
            <p>{{ error }}</p>
          </VCardText>  
          <template v-else>
            <embed
              :src="`${fileUrl}#toolbar=0`" 
              type="application/pdf" 
              width="100%"
              style="height: 70vh;"
            >
          </template>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "enrollment-tracking-report"
meta:
authRequired: true
</route>
