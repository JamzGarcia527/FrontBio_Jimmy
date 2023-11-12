<script setup>
import { useI18n } from "vue-i18n"
import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import axios from "@/plugins/axios"
import Swal from '@/plugins/sweetalert2'
import { requiredEspecialSelectValidator, requiredValidator } from "@/utils/validators"

const props = defineProps({
  isVisible: { type: Boolean, default: false },
  lines: { type: Array, default: () => [] },
})

const emits = defineEmits(['refreshData'])

const { t } = useI18n()
const disabledOfForm = ref(true)
const selectedRow = ref(-1)
const file = ref(null)
const allowExt = ['pdf']
const maxSizeFile = 1024 * 1024 * 5 // 5 MB
const fileImage = computed(() => file.value ? iconpdf : unselectfile)
const documentType = ref(-1)
const actionType = ref(-1)
const otherDocumentType = ref(null)
const isLoading = ref(false)
const loading = ref(false)

const formCandidate = ref({
  dni: null,
  firstname: null,
  secondName: null,
  firstSurname: null,
  secondSurname: null,
  gender: null,
  age: null,
  dniExpDate: null,
  birthday: null,
})

const formToSend = ref({
  documentName: null,
  documentNumber: null,
  documentAt: null,
  issuingEntity: null,
  rapporteurMagistrate: null,
  filedNumber: null,
  courtOffice: null,
  filedAt: null,
})

const documentTypes = [
  { title: t('common.select_one_option'), value: -1 },
  { title: 'Acción de Tutela', value: 1 },
  { title: 'Resolución de Revocatoria', value: 2 },
  { title: 'Actos Administrativos', value: 3 },
  { title: 'Otros documentos', value: 4 },
]

const typeActions = [
  { title: t('common.select_one_option'), value: -1 },
  { title: 'Sentencia', value: 1 },
  { title: 'Medida cautelar', value: 2 },
]

const clearFile = () => file.value = null

const validFile = value => {
  if (value.size > maxSizeFile) {
    Swal.fire({ text: t('candidates.upload.text_file_max_size'), icon: 'warning' })
    
    return false
  }

  const ext = value.name.split('.').pop().toLowerCase()
  if (!allowExt.includes(ext)) {
    Swal.fire({ text: t('candidates.upload.text_error_extension'), icon: 'warning' })
    
    return false
  }

  return true
}

const onSelectedFile = e => {
  const uploadfile = e.target.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null
}
  
const onDropFile = e => {
  const uploadfile = e.dataTransfer.files[0]

  file.value = validFile(uploadfile) ? uploadfile : null
}

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const rowFields = computed(() => {
  if (Array.isArray(props.lines.rowField)) {
    return addOptionDefault(props.lines.rowField.map(e => (
      { title: `Renglón ${e}`, value: e }
    )))
  }
  
  return []
})

const handlerSelect = value => {
  if (value === -1) {
    formCandidate.value = {}
  }
}

const handlerFindByDni = async value => {
  // Inicializar formulario de candidato
  formCandidate.value = {
    dni: value || null,
    firstname: null,
    secondName: null,
    firstSurname: null,
    secondSurname: null,
    gender: null,
    age: null,
  }

  try {
    isLoading.value = true

    const { data } = await axios.get(`/v1/candidates/validate/${props.lines.inscriptionId}/ani/${value}`)

    const selectedData = data

    formCandidate.value = {
      dni: selectedData.ani.dni || null,
      firstname: selectedData.ani.first_name || null,
      secondName: selectedData.ani.second_name || null,
      firstSurname: selectedData.ani.first_surname || null,
      secondSurname: selectedData.ani.second_surname || null,
      gender: selectedData.ani.gender || null,
      age: selectedData.age || null,
      dniExpDate: selectedData.ani.expedition_date || null,
      birthday: selectedData.ani.birthdate || null,
    } 
  } catch (error) {
    // capturar errores
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
    
    return false
  } finally {
    isLoading.value = false
  }
}

const form = ref(null)

const rules = reactive({

  dni: [requiredValidator],

  rowFields: [
    value => (selectedRow.value === -1) ? requiredEspecialSelectValidator(value) : true,
  ],

  documentTypes: [
    value => (documentType.value === -1) ? requiredEspecialSelectValidator(value) : true,
  ],

  // Validaciones para resoluciones o actos administrativos
  documentNumber: [
    value => (documentType.value === 2 || documentType.value === 3) ? requiredValidator(value) : true,
  ],
  documentAt: [
    value => (documentType.value === 2 || documentType.value === 3) ? requiredValidator(value) : true,
  ],
  issuingEntity: [
    value => (documentType.value === 2 || documentType.value === 3) ? requiredValidator(value) : true,
  ],
  rapporteurMagistrate: [
    value => (documentType.value === 2 || documentType.value === 3) ? requiredValidator(value) : true,
  ],

  // Validaciones para acciones de tutela
  filedNumber: [
    value => (documentType.value === 1) ? requiredValidator(value) : true,
  ],
  courtOffice: [
    value => (documentType.value === 1) ? requiredValidator(value) : true,
  ],
  filedAt: [
    value => (documentType.value === 1) ? requiredValidator(value) : true,
  ],
  actionType: [
    value => (documentType.value === 1) ? requiredEspecialSelectValidator(value) : true,
  ], 

  // Validaciones para otros documentos
  documentName: [
    value => (documentType.value === 4) ? requiredValidator(value) : true,
  ],
})

const handlerSubmit = async () => {

  const { valid } = await form.value.validate()
  if (!valid) return false
  
  const { dni, firstname, secondName, firstSurname, secondSurname, gender, age, dniExpDate, birthday } = formCandidate.value
  
  const formData = new FormData()

  formData.append('inscriptionId', props.lines.inscriptionId)
  formData.append('rowField', selectedRow.value)
  formData.append('dni', dni)
  formData.append('firstName', firstname)
  formData.append('secondName', secondName)
  formData.append('firstSurname', firstSurname)
  formData.append('secondSurname', secondSurname)
  formData.append('gender', gender)
  formData.append('age', age)
  formData.append('dniExpDate', dniExpDate)
  formData.append('birthday', birthday)
  formData.append('documentType', documentType.value)
  formData.append('documentSupportFile', file.value)

  if (documentType.value === 1) {
    formData.append('actionType', actionType.value === -1 ? null : actionType.value)
    formData.append('filedNumber', formToSend.value.filedNumber ? formToSend.value.filedNumber : null)
    formData.append('courtOffice', formToSend.value.courtOffice ? formToSend.value.courtOffice : null)
    formData.append('filedAt', formToSend.value.filedAt ? formToSend.value.filedAt : null)
  }

  if (documentType.value === 2 || documentType.value === 3) { 
    formData.append('documentNumber', formToSend.value.documentNumber ? formToSend.value.documentNumber : null)
    formData.append('documentAt', formToSend.value.documentAt ? formToSend.value.documentAt : null)
    formData.append('issuingEntity', formToSend.value.issuingEntity ? formToSend.value.issuingEntity : null)
    formData.append('rapporteurMagistrate', formToSend.value.rapporteurMagistrate ? formToSend.value.rapporteurMagistrate : null)
  }

  if (documentType.value === 4) {
    formData.append('description', formToSend.value.documentName ? formToSend.value.documentName : null)
  }

  if (!file.value || file.value == null) {
    Swal.fire({ icon: "warning", text: "El soporte es requerido" })

    return false
  }

  try {

    loading.value = true

    const response = await axios.post('/v1/administrative-acts/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.status == 200) { 
      formCandidate.value = {}
      formToSend.value = {}
      documentType.value = -1
      actionType.value = -1
      otherDocumentType.value = null
      selectedRow.value = -1
      file.value = null

      Swal.fire({ icon: "success", text: "Operación realizada correctamente" })

      emits('refreshData', true)

      return { success: true, data: response.data }
    }

  } catch (error) {
    if (error.response && error.response.status <= 500) {

      const { message, data } = error.response

      Swal.fire({ icon: "warning", text: data.message || message || "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })

      return { success: false }
    }
  } finally {
    loading.value = false
  } 
}
</script>

<template>
  <div v-if="isVisible" class="layout-default">
    <VCard>
      <VCardText>
        <VForm ref="form" class="mb-4" validate-on="submit" @submit.prevent="handlerSubmit">
          <VCol cols="12">
            <p class="font-weight-bold">
              AGREGAR CANDIDATO
            </p>
            <VDivider class="mb-4" />
          </VCol>
          <VRow class="mb-2">
            <VCol cols="12" md="6">
              <VSelect v-model="selectedRow" label="Renglón" :rules="rules.rowFields" :items="rowFields" @update:model-value="handlerSelect" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formCandidate.dni"
                label="Número de cédula de ciudadanía"
                append-inner-icon="tabler-search"
                :rules="rules.dni"
                @click:append-inner="handlerFindByDni(formCandidate.dni)"
              />
            </VCol>
          </VRow>
          <VRow class="mb-2">
            <VCol cols="12" md="3">
              <VTextField v-model="formCandidate.firstname" :readonly="disabledOfForm" label="Primer nombre" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="formCandidate.secondName" :readonly="disabledOfForm" label="Segundo nombre" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="formCandidate.firstSurname" :readonly="disabledOfForm" label="Primer apellido" />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField v-model="formCandidate.secondSurname" :readonly="disabledOfForm" label="Segundo apellido" />
            </VCol>
          </VRow>
          <VRow class="mb-2">
            <VCol cols="12" md="6">
              <VTextField v-model="formCandidate.gender" :readonly="disabledOfForm" label="Género" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="formCandidate.age" :readonly="disabledOfForm" label="Edad" />
            </VCol>
          </VRow>
          <VCol cols="12">
            <p class="font-weight-bold">
              CARGAR SOPORTE
            </p>
            <VDivider />
          </VCol>
          <VRow class="justify-center">
            <VCol cols="12" md="6">
              <VSelect v-model="documentType" class="mt-4" :rules="rules.documentTypes" :items="documentTypes" label="Tipo de documento a cargar" />
            </VCol>
            <VCol v-if="documentType === 1" cols="12" md="6">
              <VSelect v-model="actionType" class="mt-4" :rules="rules.actionType" :items="typeActions" label="Tipo de acción" />
            </VCol>
            <VCol v-if="documentType === 2 || documentType === 3" class="mt-4" cols="12" md="3">
              <VTextField v-model="formToSend.documentNumber" :rules="rules.documentNumber" label="Número de documento" />
            </VCol>
            <VCol v-if="documentType === 2 || documentType === 3" class="mt-4" cols="12" md="3">
              <VTextField v-model="formToSend.documentAt" :rules="rules.documentAt" type="date" label="Fecha de documento" />
            </VCol>
            <VCol v-if="documentType === 2 || documentType === 3" cols="12" md="6">
              <VTextField v-model="formToSend.issuingEntity" :rules="rules.issuingEntity" label="Entidad que lo expide" />
            </VCol>
            <VCol v-if="documentType === 2 || documentType === 3" cols="12" md="6">
              <VTextField v-model="formToSend.rapporteurMagistrate" :rules="rules.rapporteurMagistrate" label="Magistrado ponente" />
            </VCol>
            <VCol v-if="documentType === 1" cols="12" md="4">
              <VTextField v-model="formToSend.filedNumber" :rules="rules.filedNumber" label="Número de radicado" />
            </VCol>
            <VCol v-if="documentType === 1" cols="12" md="4">
              <VTextField v-model="formToSend.courtOffice" :rules="rules.courtOffice" label="Despacho judicial" />
            </VCol>
            <VCol v-if="documentType === 1" cols="12" md="4">
              <VTextField v-model="formToSend.filedAt" type="date" :rules="rules.filedAt" label="Fecha de radicado" />
            </VCol>
            <VCol v-if="documentType === 4" cols="12" md="6">
              <VTextField v-model="formToSend.documentName" class="mt-4" :rules="rules.documentName" label="Nombre del documento" />
            </VCol>
          </VRow>
          <VRow class="justify-center">
            <VCol cols="12" md="6">
              <VCard variant="outlined" class="pa-4 mb-4">
                <VRow>
                  <VCol cols="12" md="6" class="d-flex align-center">
                    <VCard v-if="file" variant="outlined" class="w-100">
                      <div class="close">
                        <VIcon 
                          class="cursor-pointer"
                          icon="tabler-square-rounded-x-filled" 
                          color="error" 
                          @click="clearFile"
                        />
                      </div>
                      <div class="text-center px-10 py-10">
                        <VImg :src="iconpdf" height="48" aspect-ratio="1" />
                        <div class="pt-1 text-center line-height text-caption ">
                          {{ file.name }}
                        </div>
                        <div class="pt-1 line-height text-caption font-weight-semibold">
                          {{ Math.round((file.size / 1024) * 100) / 100 }} KB
                        </div>
                      </div>
                    </VCard>
                    <DragAndDropZone 
                      v-else
                      component-id="importar-eis" 
                      label="Cargar" 
                      accepts="pdf" 
                      @drop.prevent="onDropFile" 
                      @change="onSelectedFile" 
                    >
                      <div class="text-center px-10 py-10">
                        <VImg :src="fileImage" height="48" aspect-ratio="1" />
                        <div class="pt-1 text-center line-height text-caption font-weight-semibold">
                          {{ t('candidates.upload.unselectfile') }}
                        </div>
                      </div>
                    </DragAndDropZone>
                  </VCol>
                  <VCol cols="12" md="6" class="d-flex align-center order-md-first">
                    <div>
                      <template v-if="!file">
                        <label 
                          for="browser"
                          class="v-btn v-btn--elevated v-theme--light bg-primary 
                        v-btn--density-default rounded-pill v-btn--size-default 
                        v-btn--variant-elevated cursor-pointer"
                        >
                          {{ t('candidates.upload.selectfile') }}
                          <VIcon class="ms-2" icon="tabler-upload" />
                        </label>
                        <input id="browser" type="file" class="d-none" accept="pdf" @change="onSelectedFile"> 
                      </template>

                      <div class="text-caption text-primary mt-4">
                        <div>
                          {{ t('candidates.upload.file_max_size', { limit: '1 MB' }) }}
                        </div>
                        <div>
                          {{ t('candidates.upload.file_types', { type: '.pdf' }) }}
                        </div>
                      </div>
                    </div>
                  </VCol>
                </VRow>
              </VCard>
              <VRow class="justify-center mt-4">
                <VBtn :loading="loading" :disabled="loading" type="submit">
                  Guardar
                </VBtn>
              </VRow>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
  <!-- Dialog -->
  <VDialog
    v-model="isLoading"
    persistent
    width="300"
  >
    <VCard
      color="primary"
      width="300"
    >
      <VCardText class="pt-3">
        Por favor, espere
        <VProgressLinear
          indeterminate
          class="mb-0"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>
