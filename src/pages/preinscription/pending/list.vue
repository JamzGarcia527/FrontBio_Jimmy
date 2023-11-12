
<script setup>
import FiltersFormsPendingApproval from '@/components/shared/FilterFormsPendingApproval.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
// eslint-disable-next-line import/no-unresolved
import DataTableServerSideWithLogo from '@/components/preinscription/logosymbol/DatatableServerSideWithLogo.vue'
import { useI18n } from "vue-i18n"
import { _buildDownloadCSV, excelParser } from "@/utils/functions"
import htmlToPdf from 'html2pdf.js'
import { reactive, computed } from 'vue'
import { useRouter } from "vue-router"

const { t } = useI18n()
const exportLoading = ref(false)
const datatable = ref(null)
const filters = ref({})
const items = ref([])
const router = useRouter()
const dataForCSV = ref()
const dataForExcel = ref()
const dataForPDF = ref()

const fields = ref([
  { key:"hasLogo", label:'LOGO' }, 
  { key: "corporationName", label: t('formsPendingApproval.corporation').toUpperCase() },
  { key: "circunscriptionName", label: t('formsPendingApproval.circunscripcion').toUpperCase() },
  { key: 'department', label: t('formsPendingApproval.departament').toUpperCase() },
  { key: 'municipality', label: t('formsPendingApproval.municipality').toUpperCase() },
  { key: 'commune', label: t('formsPendingApproval.commune').toUpperCase() }, 
  { key: 'groupingPoliticalTypeName', label: t('formsPendingApproval.group_politic_tipe').toUpperCase() },  
  { key: "groupingPoliticalName", label: t('formsPendingApproval.group_politic').toUpperCase() },
  { key: "consecutive", label: t('formsPendingApproval.consecutive').toUpperCase() },
  { key: "stateDescription", label: t('formsPendingApproval.state').toUpperCase() },  
  { key: "inscriptionTypeName", label: t('formsPendingApproval.breadcrumbs.inscriptionTypeName').toUpperCase() },
  { key: 'DocumentsE6_charged', label: t('formsPendingApproval.DocumentsE6_charged').toUpperCase() },
  { key: "approvedForm_E6", label: t('formsPendingApproval.approvedForm_E6').toUpperCase() },
  
])

// data para la tabla
const getInscriptions = value => {
  
  const requestBody = {
    "grouping_political_type_id": value.groupingPoliticalTypeId,
    "grouping_political_id": value.groupingPoliticalId,
    "inscription_type_id": value.inscriptionTypeId,
  }

  filters.value = requestBody
  dataForCSV.value = requestBody
}

// llena el segundo filtro 
const changeInscriptionType = async (inscriptionId, value) => {
  const requestBody = {
    "inscriptionType": value,
  }

  try {

    await axios.put(`/v1/inscriptions/${inscriptionId}`, requestBody)

    const item = items.value.find(e => e.id == inscriptionId)

    if (item) item.inscriptionTypeId = value

    // TODO: Pasar los mensajes por el i18n
    await Swal.fire({
      icon: 'success',
      text: 'Cambio aplicado correctamente',
    })
    
    return true
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
    
    return false
  }

}

// Reports CSV, EXCEL y PDF 

// funcion fecha para enviarla al pdf
const state = reactive({
  fecha: new Date(),
})

const fechaActual = computed(() => {
  return `${state.fecha.toLocaleDateString()} ${state.fecha.toLocaleTimeString()}`
})

setInterval(() => {
  state.fecha = new Date()
}, 1000)

function generatePdf(data) {
  const element = document.createElement('div')

  element.innerHTML = data
  htmlToPdf(element, {
    margin: [0.5, 0.5],
    filename: 'formularios_pendientes_por_aprobar.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter', compressPDF: true },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  })
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const exportPdf = async () => {
  
  const value = filters.value
  
  const requestBody = { 
    ...value,
    "page": 0,
    "size": 99999,
  }

  const { data } = await axios.get('/v1/inscriptions/pending', { params: requestBody })

  dataForPDF.value = data.content
  if (dataForPDF.value) {

    const data = dataForPDF.value.map(row => {
      return {
        'corporationName': row.corporationName === null ? "" : row.corporationName,
        "circunscriptionName": row.circunscriptionName === null ? "" : row.circunscriptionName,
        "department": row.department === null ? "" : row.department,
        "municipality": row.municipality === null ? "" : row.municipality,
        "commune": row.commune === null ? "" : row.commune,
        "groupingPoliticalName": row.groupingPoliticalName === null ? "" : row.groupingPoliticalName,
        "consecutive": row.consecutive === null ? "" : row.consecutive,
        "blankVotePromoter": row.blankVotePromoter === null ? "" : row.blankVotePromoter === 1 ? "SÍ" : "NO",
        "stateDescription": row.stateDescription === null ? "" : row.stateDescription,
        "inscriptionTypeName": row.inscriptionTypeName === null ? "" : row.inscriptionTypeName,
      }
    })

    let dateNow = fechaActual.value
    let html = `
        <html>
          <head>
            <title>Formularios pendientes de aprobación</title>
            <style type="text/css">
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1em;
              font-size: 8px; /* Establecer tamaño de fuente */
            }

            th, td {
              border: 1px solid #ddd;
              padding: 0.5em;
              font-size: 8px; /* Aplicar tamaño de fuente a celdas */
            }

            th {
              text-align: left;
              background-color: #f2f2f2;
            }

            tbody tr:nth-child(even) {
              background-color: #f2f2f2;
            }
              </style>
          </head>
          <body>
            <div>
            <h4>FORMULARIOS PENDIENTES DE APROBACIÓN</h4>
            <img alt="Logo" src="./assets/logo.scg" width="5%">
            </div>
            <div>
              <h6>Fecha Reporte: ${dateNow}</h6>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;" border="0">
              `
    html+=`
  <tr style="width: 50%">
  <th>Corporación</th>
  <th>Circunscripción</th>
  <th>Departamento</th>
  <th>Municipio</th>
  <th>Comuna</th>
  <th>Agrupación Politíca</th>
  <th>Consecutivo</th>
  <th>Promotor Voto En Blanco</th>
  <th>Estado</th>
  <th>Tipo de Inscripción</th>
  </tr>
  `
    for (const row of data) {
      html += '<tr>'
    
      const keys = Object.keys(row)

      for (const key of keys) {
        html+=`<td>${row[key]}</td>`
      }
    
      html += '</tr>'
    }          
    html += `
            </table>
          </body>
        </html>
      `
    generatePdf(html)
  }
}

const exportCSV = async () => {
  
  const value = filters.value

  console.log(value)

  const requestBody = {
    ...value,
    "page": 0,
    "size": 99999,
  }

  const { data } = await axios.get('/v1/inscriptions/pending', { params: requestBody })

  dataForCSV.value = data.content
  exportLoading.value = true
  let dataCSV = dataForCSV.value.map(row => {

    return {
      'corporationName': row.corporationName === null ? "" : row.corporationName,
      "circunscriptionName": row.circunscriptionName === null ? "" : row.circunscriptionName,
      "department": row.department === null ? "" : row.department,
      "municipality": row.municipality === null ? "" : row.municipality,
      "commune": row.commune === null ? "" : row.commune,
      "blankVotePromoter": row.blankVotePromoter === null ? "" : row.blankVotePromoter === 1 ? "SÍ" : "NO",
      "groupingPoliticalName": row.groupingPoliticalName === null ? "" : row.groupingPoliticalName,
      "consecutive": row.consecutive === null ? "" : row.consecutive,
      "stateDescription": row.stateDescription === null ? "" : row.stateDescription,
      "inscriptionTypeName": row.inscriptionTypeName === null ? "" : row.inscriptionTypeName,
    }
  })
  _buildDownloadCSV(dataCSV, 'formularios_pendientes_por_aprobar')
  exportLoading.value = false
}

const exportFileXls = async () => {

  const value = filters.value

  const requestBody = {
    ...value,
    "page": 0,
    "size": 99999,
  }

  const { data } = await axios.get('/v1/inscriptions/pending', { params: requestBody })
  
  dataForExcel.value = data.content
  exportLoading.value = true
  let nameFile = "formularios_pendientes_por_aprobar"
  let dataExcel = dataForExcel.value.map(row => {
    return {
      'CORPORACIÓN': row.corporationName === null ? "" : row.corporationName,
      'CIRCUNSCRIPCIÓN': row.circunscriptionName === null ? "" : row.circunscriptionName,
      "DEPARTAMENTO": row.department === null ? "" : row.department,
      "MUNICIPIO": row.municipality === null ? "" : row.municipality,
      "COMUNA/LOCALIDAD/CORREGIMIENTO": row.commune === null ? "" : row.commune,
      "PROMOTOR VOTO EN BLANCO": row.blankVotePromoter === null ? "" : row.blankVotePromoter === 1 ? "SÍ" : "NO",
      "NOMBRE DE LA AGRUPACIÓN POLÍTICA": row.groupingPoliticalName === null ? "" : row.groupingPoliticalName,
      "CONSECUTIVO": row.consecutive === null ? "" : row.consecutive,
      "ESTADO": row.stateDescription === null ? "" : row.stateDescription,
      "TIPO DE INSCRIPCIÓN": row.inscriptionTypeName === null ? "" : row.inscriptionTypeName,
    }
  })

  excelParser().exportDataFromJSON(dataExcel, nameFile, null)
}

const GoSupportInscription = id => {

  // soporte de inscripción
  router.push({ name: 'preinscription-pending-id', params: { id: Number(id), tab: 'inscription-docsupports' } })
}
    
const GoViewApprovallE6 = (id, name) => {
  // pantalla de aprobación
  router.push({ name: 'preinscription-pending-id', params: { id: Number(id), tab: 'summary' } })
}
</script> 
  
<template>
  <div>
    <VCard class="mb-6">
      <VBreadcrumbs :items="[ t('formsPendingApproval.breadcrumbs.title')]" />
      <FiltersFormsPendingApproval 
        @next="getInscriptions" 
      />
    </VCard>
    <VCard v-if="items.length == 0">
      <div>
        <div class="me-3 mt-3 mb-2 text-right">
          <VMenu open-on-hover class="me-3 mb-2 ms-3 mt-3">
            <template #activator="{ props }">
              <VBtn v-bind="props">
                {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
              </VBtn>
            </template>
            <VCard>
              <VCardBody>
                <ul class="pa-3">
                  <li class="my-1">
                    <a
                      class="dropdown-item"
                      href="javascript:void(0)"
                      @click.prevent="exportCSV"
                    >
                      <i class="me-2 las la-file-csv" />
                      {{ t('formsPendingApproval.breadcrumbs.bntCSV') }}
                    </a>
                  </li>
                  <li class="my-1">
                    <a
                      class="dropdown-item"
                      href="javascript:void(0)"
                      @click.prevent="exportFileXls"
                    >
                      <i class="me-2 las la-file-excel" />
                      {{ t('formsPendingApproval.breadcrumbs.bntExcel') }}
                    </a>
                  </li>
                  <li class="my-1">
                    <a
                      class="dropdown-item"
                      href="javascript:void(0)"
                      @click.prevent="exportPdf"
                    >
                      <i class="me-2 las la-file-excel" />
                      {{ t('formsPendingApproval.breadcrumbs.bntPDF') }}
                    </a>
                  </li>
                </ul>
              </VCardBody>
            </VCard>
          </VMenu>
        </div>
      </div>
      <div>
        <DataTableServerSideWithLogo
          ref="datatable"
          endpoint="/v1/inscriptions/pending"
          :params="filters"
          :fields="fields"
        >
          <template #cell(hasLogo)="{ item }">
            <VAvatar rounded="lg">
              <VImg v-if="item.hasLogo" cover :src="item.logo" size="48" />
              <VIcon icon="mdi-image-off-outline" size="32" />
            </VAvatar>
          </template>
          <template #cell(DocumentsE6_charged)="{ item }">
            <VBtn variant="plain" @click.prevent="GoSupportInscription(item.id)">
              Link ->  {{ t('formsPendingApproval.breadcrumbs.bntDocumentsInscription') }}
            </VBtn>
          </template>
          <template #cell(blankVotePromoter)="{ item }">
            <span v-if="item.blankVotePromoter === 1">
              SÍ
            </span>
            <span v-else>
              NO
            </span>
          </template>
          
          <template #cell(approvedForm_E6)="{ item }">
            <VBtn variant="plain" @click.prevent="GoViewApprovallE6(item.id)"> 
              {{ t('formsPendingApproval.breadcrumbs.bntDocumentsApprovedE6') }}
            </VBtn>
          </template>
        </DataTableServerSideWithLogo>
      </div>
    </VCard>
    <VCard v-else>
      <VAlert color="secondary">
        {{ t('formsPendingApproval.alertDataNull.alert') }}
      </VAlert>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "preinscription-pending-list"
meta:
  authRequired: true
</route>
