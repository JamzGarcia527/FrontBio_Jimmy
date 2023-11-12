<script setup>
import LettersFilter from "@/components/letters/LettersFilter.vue"
import DataTableServerSide from './components/DataTableServerSide.vue'
import { ref } from "vue"
import { useI18n } from 'vue-i18n'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import FileUpload from '@/components/shared/FileUpload.vue'
import useEventsBus from '@/utils/eventBus'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { downloadBlob } from '@/utils'

const { t } = useI18n()
const { can } = useAppAbility()
const { emit } = useEventsBus()

const filters = ref({})
const showItems = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const datatable = ref(null)

const fields = ref([
  { key: 'rowField', label: t('candidates.row_field'), thClass: 'text-center' },
  { key: 'candidateDni', label: t('candidates.form.dni'), thClass: 'text-center' },
  { key: 'names', label: t('candidates.names'), thClass: 'text-center' },
  { key: 'surnames', label: t('candidates.lastNames'), thClass: 'text-center' },
  { key: 'gender', label: t('candidates.gender'), thClass: 'text-center' },
  { key: 'age', label: t('candidates.age'), thClass: 'text-center' },
  { key: 'letter', label: t('module_documents.acceptance.title_single'), thClass: 'text-center' },
  { key: 'upload', label: t('candidates.upload.title_upload_attachment'), thClass: 'text-center' },
  { key: 'comment', label: t('candidates.form.observations'), thClass: 'text-center' },
  { key: 'approved', label: t('candidates.upload.label_approve_letter'), thClass: 'text-center' },
])

const handler = async selected => {
  const { 
    groupingPoliticalTypeId: grouping_political_type_id,
    groupingPoliticalId: grouping_political_id,
    corporationId: corporation_id,
    circunscriptionId: circunscription_id,
    department: department_id,
    municipality: municipality_id,
    commune: commune_id,
    size = Number.MAX_SAFE_INTEGER,
  } = selected

  filters.value = {
    grouping_political_type_id,
    grouping_political_id,
    corporation_id,
    circunscription_id,
    department_id,
    municipality_id,
    commune_id,
    size,
  }  

  showItems.value = true
  isLoading.value = true

  emit('search', true)
}

const changeLoading = value => isLoading.value = value
const changeSaving = value => isSaving.value = value

const saveChanges = () => {
  emit('saveChanges', true)
}

const deleteLetter = item => {

  Swal.fire({
    title: t('module_documents.acceptance.title_accepted'),
    icon: "question",
    customClass: { confirmButton: "bg-primary notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        isSaving.value = true
        
        const formData = new FormData()

        formData.append("inscriptionId", item.inscriptionId)
        formData.append("inscriptionChangeId", item.inscriptionChangeId || -1)
        formData.append("candidateDni", item.candidateDni)
        formData.append("letterTypeId", 2)

        await axios.post(`/v1/files/candidates/letter-delete`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }).then(() => {
          item.hashLocal = null
          item.hashApproveLetter = null
          item.upload = true
          item.observationsApproveLetter = null
        })

        await Swal.fire({ 
          icon:"success", 
          text: t('module_documents.acceptance.delete_success'),
        })

        return true
      } catch (error) {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
      
        return false
      } finally {
        isSaving.value = false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }) 
}

const download = item => {
  axios.get('/v1/files/candidates/letter', { 
    params: { 
      inscriptionId: item.inscriptionId, 
      inscriptionChangeId: item.inscriptionChangeId || -1, 
      candidateDni: item.candidateDni, 
      type: 2,
    },
    responseType: "blob",
  }).then(({ data }) => {
    downloadBlob(data, item.letterNameApprove, 'application/pdf')
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  })
}

const msgValidate = ref({}) 

const inputKey = item => {
  msgValidate.value[item.candidateId] = item.observationsApproveLetter == null ? "" 
    : item.observationsApproveLetter.length > 250 ? "Máximo 250 caracteres" : "" 
}

// eslint-disable-next-line sonarjs/no-identical-functions
const acceptanceLetter = item => {
  Swal.fire({
    title: t('module_documents.acceptance.title_accepted_confirm'),
    icon: "question",
    customClass: { confirmButton: "bg-primary notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        isSaving.value = true

        await axios.put(`/v1/candidates/approve-letters/${item.inscriptionId}/${item.inscriptionChangeId || -1}/${item.candidateDni}/${2}`)
          .then(() => {
            item.stateApproveLetter = 2
            item.hashLocal = null
          })

        await Swal.fire({ 
          icon:"success", 
          text: t('module_documents.acceptance.approve_success'),
        })

        return true
      } catch (error) {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      } finally {
        isSaving.value = false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

// eslint-disable-next-line sonarjs/no-identical-functions
const revokeLetter = item => {
  Swal.fire({
    title: t('module_documents.acceptance.title_revoke_confirm'),
    icon: "question",
    customClass: { confirmButton: "bg-primary notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        isSaving.value = true

        await axios.delete(`/v1/files/candidates/revoke/letter?inscriptionId=${item.inscriptionId}&inscriptionChangeId=${item.inscriptionChangeId || -1}&candidateDni=${item.candidateDni}&letterTypeId=2`)
          .then(() => {
            item.hashLocal = null
          })

        await Swal.fire({ 
          icon:"success", 
          text: t('module_documents.acceptance.revoke_success'),
        })

        datatable.value.refresh()

        return true
      } catch (error) {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      } finally {
        isSaving.value = false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), $t('module_documents.title'), $t('module_documents.acceptance.title') ]" /> 
      
      <LettersFilter @search="handler" />

      <VCard v-if="showItems" class="mt-5">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <DataTableServerSide 
                ref="datatable"
                endpoint="/v1/candidates/all-states" 
                :params="filters" 
                :fields="fields" 
                :loading="isLoading" 
                :type-letter="2"
                table-class="table-bordered"
                @loading="changeLoading"
                @saving="changeSaving"
              >
                <template #v-thead>
                  <tr>
                    <th class="text-center border" colspan="6">
                      Datos del Candidato
                    </th>
                    <th class="text-center border" colspan="4">
                      Sección Carta Anexo
                    </th>
                  </tr>
                </template>

                <template #cell(letter)="{ item }">
                  <div class="d-flex justify-center">
                    <VBtn
                      v-if="item.hashApproveLetter !== null"
                      icon="mdi-file-download-outline"
                      variant="text"
                      color="secondary"
                      @click="download(item)"
                    />

                    <VBtn
                      v-if="item.hashApproveLetter !== null && item.stateApproveLetter !== 2 && item.canManage"
                      icon="mdi-trash-outline"
                      variant="text"
                      color="error"
                      @click="deleteLetter(item)"
                    />
                  </div>
                </template> 

                <template #cell(upload)="{ item }">
                  <div v-if="item.approveStatus===0" class="d-flex justify-center">
                    <FileUpload
                      v-if="item.hashApproveLetter == null"
                      v-model:image="item.hashLocal"
                      :clear="item.upload"
                      accepts=".pdf"
                      :allow-ext="['pdf']"
                      :is-loading="isLoading"
                      @reset-upload="item.upload = value"
                    />
                  </div>
                </template>

                <template #cell(comment)="{ item }">
                  <div v-if="item.approveStatus===0" class="my-2" style="position: relative; width: 350px;">
                    <span
                      v-if="(item.hashLocal !== null && item.hashApproveLetter !== null) || 
                        (item.hashLocal === null && item.hashApproveLetter !== null)"
                      style=" display: block;width: 100%; white-space: normal;"
                    >{{ item.observationsApproveLetter
                    }}</span>
                    <VTextarea
                      v-else v-model="item.observationsApproveLetter
                      " rows="1" :error-messages="msgValidate[item.candidateId] || ''" @input="inputKey(item)"
                    />
                  </div>
                </template>
            
                <template #cell(approved)="{ item }">
                  <div v-if="can('get', 'view-letters-resignation') && item.hashApproveLetter !== null" class="d-flex justify-center">
                    <VChip 
                      v-if="item.stateApproveLetter == 2"
                      prepend-icon="mdi-check"
                      color="success"
                      size="small"
                      variant="outlined"
                      class="my-auto"
                    >
                      Carta Aprobada
                    </VChip>
                    <VBtn
                      v-else-if="item.canManage"
                      icon="mdi-file-document-check-outline"
                      variant="text"
                      color="secondary"
                      @click="acceptanceLetter(item)"
                    />
                    <VBtn
                      v-if="item.stateApproveLetter == 2 && can('revoke', 'letters')"
                      icon="mdi-file-document-remove-outline"
                      variant="text"
                      color="error"
                      :disabled="isSaving"
                      class="ml-2"
                      @click="revokeLetter(item)"
                    />
                  </div>
                </template>
              </DataTableServerSide>
            </VCol>
          </VRow>

          <VRow justify="center">
            <VCol cols="12" sm="3">
              <VBtn
                :disabled="isLoading || isSaving"
                type="button"
                block
                color="primary"
                variant="flat"
                class="py-0 notAllowedEmulator"
                @click="saveChanges"
              >
                {{ $t('common.btn_submit') }}
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<route lang="yaml">
name: "candidates-letters-approve"
meta:
  authRequired: true
</route>
