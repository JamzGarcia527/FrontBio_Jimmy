<script setup>
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import Filter from '@/pages/EISCodeUpload/Filter.vue'
import imageLogo from '@images/pages/fondoContrasena.png'
import DragAndDropZone from '@/components/shared/DragAndDropZone.vue'
import Swal from '@/plugins/sweetalert2'
import iconpdf from '@images/icon/pdf.png'
import unselectfile from '@images/icon/unselectfile.png'
import axios from '@/plugins/axios'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useVuelidate } from '@vuelidate/core'

// Translate i18n
import { useI18n } from "vue-i18n"

// Validators
import {
  requiredVuelidate,
} from '@/utils/validators/vuelidate'

const { can } = useAppAbility()
const { t } = useI18n()
const filters = ref({})
const isDialogVisible = ref(false)
const isDisabled = ref(false)
const isLoading = ref(false)
const showItems = ref(false)
const file = ref(null)
const importResponse = ref(null)
const allowExt = ['pdf']
const maxSizeFile = 1024 * 1024 // 1 MB
const fileImage = computed(() => file.value ? iconpdf : unselectfile)
const candidateDni = ref(null)
const inscriptionId = ref(null)
const inscriptionChangeId = ref(null)
const eisExists = ref('')
const endpoint = ref('/v1/candidates/all')
const reload = ref(0)

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

const fields = ref([
  { key: "rowField", label: t('candidates.eis.table.line').toUpperCase() },
  { key: "candidateDni", label: t('candidates.eis.table.dni').toUpperCase() },
  { key: "names", label: t('candidates.eis.table.names').toUpperCase() },
  { key: "surnames", label: t('candidates.eis.table.surnames').toUpperCase() },
  { key: "gender", label: t('candidates.eis.table.gender').toUpperCase() },
  { key: "age", label: t('candidates.eis.table.age').toUpperCase() },
  { key: "eis", label: t('candidates.eis.table.eisCode').toUpperCase() },
  { key: "eisFileName", label: t('candidates.eis.table.chargedSupport').toUpperCase(), thClass: 'text-center' },
  { key: 'action', label: t('candidates.eis.table.action').toUpperCase(), thClass: 'text-center' },
])

const form = ref({
  eisCode: null,
})

// Forms rules
const rules = computed(() => ({
  eisCode: { requiredVuelidate },
}))

const v$ = useVuelidate(rules, form)

const handleSearchFilter = value => {
  const {
    department: department_id,
    municipality: municipality_id,
    commune: commune_id,
    corporationId: corporation_id,
    circunscriptionId: circunscription_id,
    groupingPoliticalTypeId: grouping_political_type_id,
    groupingPoliticalId: grouping_political_id,
  } = value

  filters.value = {
    department_id,
    municipality_id,
    commune_id,
    corporation_id,
    circunscription_id,
    grouping_political_type_id,
    grouping_political_id,
  }

  showItems.value = true
}

const handlerReset = () => {
  file.value = null
  form.value = {}
  v$.value.$reset()
  importResponse.value = null
  isDialogVisible.value = false
}

const handlerSubmit = async () => {

  v$.value.$touch()
  if (v$.value.$invalid) return

  isLoading.value = true
  isDisabled.value = true

  const formData = new FormData()

  formData.append('file', file.value)
  formData.append('inscriptionId', inscriptionId.value)
  formData.append('inscriptionChangeId', inscriptionChangeId.value || -1)
  formData.append('candidateDni', candidateDni.value)
  formData.append('eisCode', form.value.eisCode)

  axios.post('/v1/files/candidates/upload-eis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(({ data }) => {
    if (eisExists.value) {
      Swal.fire({ icon: "success", text: t('candidates.upload.text_modified_eis') })
    } else {
      Swal.fire({ icon: "success", text: t('candidates.upload.text_success_eis') })
    }

    file.value = null
    inscriptionId.value = null
    inscriptionChangeId.value = null
    candidateDni.value = null
    form.value.eisCode = null
    importResponse.value = data
  }).catch(error => {
    if (error.response && error.response.status <= 500) {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
    }
  }).finally(() => {
    isLoading.value = false
    isDisabled.value = false
    getAllCandidates()
    handlerReset()
    reloadTable()
  })
}

const reloadTable = () => {
  reload.value++
}

const getAllCandidates = async () => {
  await axios.get('/v1/candidates/all')
}

const openModal = item => {
  inscriptionId.value = item.inscriptionId
  candidateDni.value = item.candidateDni
  eisExists.value = item.eis
  inscriptionChangeId.value = item.inscriptionChangeId
  isDialogVisible.value = true
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('candidates.eis.breadcrumbs.title'), t('candidates.eis.breadcrumbs.page') ]" />
    <Filter 
      class="mb-4"
      @search="handleSearchFilter" 
    />
    <VCard v-if="showItems">
      <DataTableServerSide :key="reload" :params="filters" :fields="fields" :endpoint="endpoint">
        <template #cell(names)="{ item }">
          {{ item.firstname }}
          {{ item.secondname }}
        </template>
        <template #cell(surnames)="{ item }">
          {{ item.firstsurname }}
          {{ item.secondsurname }}
        </template>
        <template #cell(eisFileName)="{ item }">
          <div class="d-flex justify-center">
            {{ item.eisFileName === '' || item.eisFileName === null ? 'NO' : 'SI' }}
          </div>
        </template>
        <template v-if="can('post', 'candidate-eis')" #cell(action)="{ item }">
          <div v-if="item.approveStatus===0" class="d-flex justify-center">
            <VBtn 
              icon="tabler-upload"
              variant="text"
              color="secondary"
              @click="openModal(item)"
            />
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
    <VDialog
      v-model="isDialogVisible"
      max-width="800"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />
      <VImg
        :src="imageLogo"
        cover
      />
      <!-- Dialog Content -->
      <VCard title="Cargue código EIS">
        <VCardText>
          <VForm ref="refForm" class="mt-2" @submit.prevent="handlerSubmit">
            <VRow>
              <VCol
                cols="12"
                md="12"
              >
                <VTextField
                  v-model.trim="form.eisCode"
                  label="Código EIS"
                  :error-messages="v$.eisCode.$errors[0]?.$message"
                />
              </VCol>
              <VCol
                cols="12"
                md="12"
              />
            </VRow>
            <VRow class="justify-center">
              <VCol cols="8">
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
                        class="w-100"
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
            <VCardText class="d-flex justify-end flex-wrap gap-3">
              <VBtn
                variant="tonal"
                color="secondary"
                :disabled="isDisabled"
                @click="handlerReset"
              >
                Cerrar
              </VBtn>
              <VBtn :loading="isLoading" class="notAllowedEmulator" :disabled="isDisabled" type="submit">
                Guardar
              </VBtn>
            </VCardText>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>  
</template>

<route lang="yaml">
name: "eisCodeUpload"
meta:
  authRequired: true
</route>
