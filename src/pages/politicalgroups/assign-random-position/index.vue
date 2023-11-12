<script setup>
import { useI18n } from "vue-i18n"
import Filter from "@/pages/politicalgroups/assign-random-position/components/Filter.vue"
import AssignRandomPosition from "@/pages/politicalgroups/assign-random-position/components/AssignRandomPosition.vue"
import DataTable from "@/components/shared/DataTable.vue"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import { onMounted } from 'vue'

// Defining and initializing variabless
const { t } = useI18n()
const filtersControls = reactive({ loading: false, disabled: false })
const controlsAssignRandomPosition = reactive({ loading: false, disabled: false })
const isVisible = ref(false)
const setNull = ref(false)
const listData = ref([])
const isLoading = ref(false)
const params = ref({})
const sopvnParam = ref(null) 
const preferentialPriority = ref(false)
const noPreferentialPriority = ref(false)
const formIsVisible = ref(false)
const file = ref(null)
const allowExt = ['pdf']
const maxSizeFile = 1024 * 1024 // 1 MB
const fileImage = computed(() => file.value ? iconpdf : unselectfile)

const formObservation = ref({
  observation: null,
})

const fields = ref([
  { key: "index", label: t('assign_random_position.table.item').toUpperCase(), thClass: 'text-center' },
  { key: "groupingPoliticalName", label: t('assign_random_position.table.groupingPoliticalName').toUpperCase() },
  { key: "preferentialVote", label: t('assign_random_position.table.preferentialVote').toUpperCase(), thClass: 'text-center' },
  { key: "corporation", label: t('assign_random_position.table.corporation').toUpperCase() },
  { key: "circunscription", label: t('assign_random_position.table.circunscription').toUpperCase() },
  { key: "location", label: t('assign_random_position.table.location').toUpperCase() },
  { key: "positionNumber", label: t('assign_random_position.table.position').toUpperCase(), thClass: 'text-center' },
])

const items = computed(() => {
  if (preferentialPriority.value) {
    return listData.value.sort((a, b) => b.preferentialVote - a.preferentialVote)
  }

  if (noPreferentialPriority.value) {
    return listData.value.sort((a, b) => a.preferentialVote - b.preferentialVote)
  }

  return listData.value
})

// Functions and methods
const handleSearchFilter = async value => {
  listData.value = []
  params.value = {
    corporationId: value.corporationId,
    circunscriptionId: value.circunscriptionId,
    department: value.department,
    municipality: value.municipality,
    commune: value.commune,
  }
  await getListData(params.value)
  filtersControls.loading = false
  filtersControls.disabled = false
  isVisible.value = value.valid
}

const handlerAssignRandomPosition = async value => {
  try {
    controlsAssignRandomPosition.loading = true
    controlsAssignRandomPosition.disabled = true

    const requestBody = {
      groupingPoliticalId: +value.groupingPoliticalId,
      positionNumber: +value.groupingPoliticalPosition,
      inscriptionId: value.inscriptionId,
    }

    const isCombinate = sopvnParam.value == 'C'


    preferentialPriority.value   = sopvnParam.value == 'P' || (sopvnParam.value == 'S' && value.isPreferential == 1)
    noPreferentialPriority.value = sopvnParam.value == 'N' || (sopvnParam.value == 'S' && value.isPreferential == 0)

    const currentGroup = listData.value.find(e => e.groupingPoliticalId == requestBody.groupingPoliticalId)
    const preferentialPendingLength = listData.value.filter(e => e.preferentialVote == 1 && !e.positionNumber).length
    const noPreferentialPendingLength = listData.value.filter(e => e.preferentialVote == 0 && !e.positionNumber).length

    if (!isCombinate && preferentialPriority.value && currentGroup.preferentialVote == 0 && preferentialPendingLength > 0) {
      // llene primero los preferenciales
      Swal.fire({
        icon: "warning",
        text: t('assign_random_position.swal.msg_priority_preferente'),
      })
      
      return false
    }

    if (!isCombinate && noPreferentialPriority.value && currentGroup.preferentialVote == 1 && noPreferentialPendingLength > 0) {
      // llene primero los no preferenciales
      Swal.fire({
        icon: "warning",
        text: t('assign_random_position.swal.msg_priority_NoPreferente'),
      })
      
      return false
    }

    if ((isCombinate && requestBody.positionNumber > listData.value.length)
      || (!isCombinate && requestBody.positionNumber > listData.value.filter(e => e.preferentialVote == currentGroup.preferentialVote).length)) {
      Swal.fire({
        icon: "warning",
        text: t('assign_random_position.swal.msg_invalid_position'),
      })

      return false
    }

    const aux = listData.value.find(e => {
      return e.groupingPoliticalId != requestBody.groupingPoliticalId
        && e.positionNumber == requestBody.positionNumber
        && (isCombinate || e.preferentialVote == currentGroup.preferentialVote)
    })

    // Si se trata de asignar una posición que ya tiene asignada otra agrupación política
    // con la misma opción de voto
    if (aux) {
      const response = await Swal.fire({
        text: t('assign_random_position.swal.question_cleanPosition'),
        icon: "question",
        customClass: { confirmButton: "bg-error" },
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No",
      })

      let requestBodyOverride = { ...requestBody, override: true }

      if (response.isConfirmed) {
        await axios.post('/v1/inscription-final/set-position', requestBodyOverride)
        await getListData(params.value)
        await Swal.fire({
          icon: "success",
          text: t('assign_random_position.swal.msg_confirmation'),
        })

        setNull.value = true

        return true
      }
      
    }
    await axios.post('/v1/inscription-final/set-position', requestBody)
    await getListData(params.value)
    await Swal.fire({
      icon: "success",
      text: t('assign_random_position.swal.msg_confirmation'),
    })

    setNull.value = true

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
    controlsAssignRandomPosition.loading = false
    controlsAssignRandomPosition.disabled = false
  }
}

const getListData = async queryParams => {
  try {
    isLoading.value = true

    const params = { ...queryParams, page: 0, size: 1000 }

    const response = await axios.get('/v1/inscription-final/list-position', { params })
    const data = response.data

    listData.value = data.content
    
    return true
  } catch (error) {
    let message = 'No se pudo completar la acción, por favor intente más tarde.'
    if (error.response && error.response.status < 500) {
      message = error.response.data.message
    }
    Swal.fire({ icon: 'warning', text: message })

    return false
  } finally {
    isLoading.value = false
  }
}

const getParameter = async () => {
  try {
    let parameter = "SOPVN"
    const { data } = await axios.get(`/v1/parameter/${parameter}`)

    // Si el parámetro es "S" se sorteará la opción de voto y se podrá elegir la prioridad entre preferente y no preferente
    sopvnParam.value = data.value
    
    return true
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: "warning",
        text: message,
      })
    }

    return false
  }
}

const getIsPreferential = value => {
  if (value) {
    preferentialPriority.value = value.isPreferential == 1
    noPreferentialPriority.value = value.isPreferential == 0
  }
}

const openFormReversePositionMasive = async value => {
  formIsVisible.value = value
}

const reversePositionMasive = async () => {


  const result = await reversePositionUpload(params.value) // Upload file in DB

  if (result.success) { 
    Swal.fire({
      title: t('assign_random_position.swal.title'),
      text: t('assign_random_position.swal.description_reverse'),
      icon: "question",
      customClass: { confirmButton: "bg-error" },
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await axios.post('/v1/inscription-final/reverse-position', params.value)
          Swal.fire({ icon: "success", text: t('assign_random_position.swal.msg_confirmation') })
          formIsVisible.value = false
          await getListData(params.value)
          file.value = null
          formObservation.value = {}
        
          return true
        } catch (error) {
          let message = 'No se pudo completar la acción, por favor intente más tarde.'
          if (error.response && error.response.status < 500) 
            message = error.response.data.message
          Swal.fire({ icon: "warning", text: message })
        
          return false
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    })
  }
}

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

const reversePositionUpload = async value => {
  const { observation } = formObservation.value
  const { corporationId, circunscriptionId, department, municipality, commune } = value

  // Verificar la longitud de la observación
  if (observation?.length > 1000) {
    Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, el campo observaciones supera los 1000 caracteres." })
    
    return { success: false }
  }

  if (observation == null || observation.trim() === '') {
    Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, el campo observaciones no puede estar vacío" })
    
    return { success: false }
  }

  const formData = new FormData()
  
  formData.append('file', file.value)
  
  formData.append('observation', observation)
  formData.append('corporationId', corporationId)
  formData.append('circunscriptionId', circunscriptionId)
  formData.append('department', department)
  formData.append('municipality', municipality)
  formData.append('commune', commune)
  
  try {
    const response = await axios.post('/v1/inscription-final/reverse-position-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      
    return { success: true, data: response.data }
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
      
      return { success: false }
    }
  }
}


onMounted(async () => {
  await getParameter()
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('assign_random_position.breadcrumbs.title'), t('assign_random_position.breadcrumbs.page') ]" />
    <Filter
      :loading="filtersControls.loading"
      :disabled="filtersControls.disabled"
      class="mb-4"
      @search="handleSearchFilter"
    />
    <AssignRandomPosition
      v-if="isVisible" 
      :loading="controlsAssignRandomPosition.loading"
      :disabled="!isVisible || controlsAssignRandomPosition.disabled"
      :divipole="params"
      :set-null="setNull"
      :list-data="listData"
      :sopvn-param="sopvnParam"
      class="mb-4" 
      @assign-random-position="handlerAssignRandomPosition"
      @voting-option-priority="getIsPreferential"
      @reverse-masive="openFormReversePositionMasive"
    />
    <DataTable v-if="listData.length > 0" :items="items" :fields="fields">
      <template #cell(index)="{ index }"> 
        <div class="d-flex justify-center">
          {{ index + 1 }}
        </div>
      </template>
      <template #cell(groupingPoliticalName)="{ item }">
        <p class="font-weight-regular mb-0">
          {{ item.groupingPoliticalId }} - {{ item.groupingPoliticalName }} <br>
          <small v-if="item.groupingPoliticalType" class="text-muted line-height">
            {{ item.groupingPoliticalType }}
          </small>
        </p>
      </template>
      <template #cell(preferentialVote)="{ item }">
        <div class="d-flex justify-center">
          {{ item.preferentialVote == 0 ? 'NO PREFERENTE' : 'PREFERENTE' }}
        </div>
      </template>
      <template #cell(location)="{ item }">
        <p class="font-weight-regular mb-0">
          {{ item.department }} <VIcon v-if="item.municipality" start icon="tabler-arrow-right" /> {{ item.municipality }} <br>
          <small v-if="item.commune" class="text-muted line-height">
            {{ item.commune }}
          </small>
        </p>
      </template>
      <template #cell(positionNumber)="{ item }"> 
        <div v-if="item?.positionNumber == null || item?.positionNumber === ''" class="d-flex justify-center">
          <VIcon size="25" start icon="tabler-question-circle" />
        </div>
        <div v-else class="d-flex justify-center">
          {{ item?.positionNumber }}
        </div>
      </template>
    </DataTable>
    <template v-if="isLoading">
      <VCol cols="12">
        <div class="text-center py-10">
          <VProgressCircular size="50" indeterminate />
        </div>
      </VCol>
    </template>
    <VDialog
      v-model="formIsVisible"
      width="700"
      persistent
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="formIsVisible = !formIsVisible" />

      <!-- Dialog Content -->
      <VCard>
        <VForm ref="refForm" @submit.prevent="reversePositionMasive">
          <VCardText class="text-center">
            <h2 class="d-flex justify-center">
              Observaciones para reversar posiciones de las agrupaciones políticas
            </h2>
            <p class="d-flex justify-center">
              A continuación ingrese una breve descripción de la acción a realizar
            </p>

            <VRow class="justify-center">
              <VCol cols="23" md="12">
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
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="23" md="12">
                <VTextarea v-model.trim="formObservation.observation" focused="true" placeholder="Por favor ingrese sus observaciones máximo 1000 caracteres" counter />
              </VCol>  
            </VRow>
          </VCardText>

          <VCardText class="d-flex justify-end gap-2">
            <VBtn color="secondary" class="notAllowedEmulator" @click="formIsVisible = false">
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

<style scoped>
.text-muted {
  color: #878a99 !important;
}
</style>

<route lang="yaml">
  name: "assign-random-position"
  meta:
  authRequired: true
</route>

