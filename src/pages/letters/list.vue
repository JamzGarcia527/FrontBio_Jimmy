<script setup>
import DataTableServerSide from './components/DataTableServerSide.vue'
import { keyPressOnlyNumber, pasteOnlyNumber } from "@/utils/events"
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useEventsBus from '@/utils/eventBus'
import { downloadBlob } from '@/utils'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

const { t } = useI18n()
const { emit } = useEventsBus()

const dni = ref(null)
const isLoading = ref(false)
const isDownloading = ref(false)
const filters = ref({ size: 15 })

const fields = ref([
  { key: 'candidateDni', label: t('candidates.form.dni'), thClass: 'text-center' },
  { key: 'names', label: t('candidates.names'), thClass: 'text-center' },
  { key: 'surnames', label: t('candidates.lastNames'), thClass: 'text-center' },
  { key: 'approveState', label: t('candidates.status'), thClass: 'text-center' },
  { key: 'createdAt', label: t('candidates.created_at'), thClass: 'text-center' },
  { key: 'updatedUsername', label: t('candidates.update_by'), thClass: 'text-center' },
  { key: 'updatedAt', label: t('candidates.update_at'), thClass: 'text-center' },
  { key: 'groupingPoliticalType', label: t('common.grouping_political_type'), thClass: 'text-center' },
  { key: 'groupingPolitical', label: t('common.grouping_political_name'), thClass: 'text-center' },
  { key: 'corporation', label: t('common.corporation'), thClass: 'text-center' },
  { key: 'circunscription', label: t('common.circunscription'), thClass: 'text-center' },
  { key: 'department', label: t('candidates.registration_location'), thClass: 'text-center' },
  { key: 'rowField', label: t('candidates.row_field'), thClass: 'text-center' },
  { key: 'letterHash', label: t('module_reports.letters.label_letter_submitted'), thClass: 'text-center' },
  { key: 'letterType', label: t('module_reports.letters.label_letter_type'), thClass: 'text-center' },
  { key: 'observationLetter', label: t('module_reports.letters.observation'), thClass: 'text-center' },
  { key: 'createUsernameLetter', label: t('module_reports.letters.label_upload_by'), thClass: 'text-center' },
])

const firstLoad = ref(false)
const changeLoading = value => isLoading.value = value

const search = () => {
  filters.value = dni.value === "" || dni.value === null ? { dni: -1, size: 15 } : { dni: dni.value, size: 15 }

  firstLoad.value = true
  emit('search', true)
}

const download = item => {
  axios.get('/v1/files/candidates/letter', { 
    params: { 
      inscriptionId: item.inscriptionId, 
      inscriptionChangeId: item.inscriptionChangeId || -1,
      candidateDni: item.candidateDni, 
      type: item.letterTypeId,      
    },
    responseType: "blob",
  }).then(({ data }) => {
    downloadBlob(data, item.letterName, 'application/pdf')
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  })
}

const exportar = type => {
  isDownloading.value = true

  const payload = {
    type: type === 'CSV' ? 2 : 1,
    dni: dni.value === "" || dni.value === null ? -1 : dni.value,
  }

  axios.get(`/v1/files/candidates/letter/download`, {
    params: payload,
    responseType: "blob", // importante
  }).then(({ data }) => {
    const nameFile = type === 'CSV' ? 'Listado de Cartas Recibidas.csv' : 'Listado de Cartas Recibidas.xlsx'

    downloadBlob(data, nameFile, type === 'CSV' ? 'text/csv;charset=utf-8' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isDownloading.value = false)
}
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), $t('module_reports.title'), $t('module_reports.letters.title') ]" /> 

      <VCard>
        <VCardText>
          <VRow justify="space-between">
            <VCol cols="12" sm="9" md="7">
              <VRow>
                <VCol cols="12" sm="8" md="8" lg="7">
                  <VTextField
                    v-model="dni"
                    :label="$t('candidates.form.dni')"
                    :disabled="isLoading || isDownloading"
                    @keypress="keyPressOnlyNumber"
                    @paste="pasteOnlyNumber"
                  />
                </VCol>

                <VCol cols="12" sm="4" md="3">
                  <VBtn 
                    prepend-icon="mdi-account-search-outline"
                    type="button"
                    block
                    :disabled="isLoading || isDownloading"
                    @click="search"
                  >
                    {{ $t('common.search') }}
                  </VBtn>
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="12" sm="3" md="2">
              <VRow v-if="firstLoad">
                <VCol cols="12" align="end">
                  <VBtn
                    prepend-icon="mdi-file-export-outline"
                    color="primary"
                    block
                    variant="outlined"
                  >
                    Exportar
                    <VMenu activator="parent">
                      <VList>
                        <VListItem
                          title="XLS"
                          @click="exportar('XLS')"
                        />
                        <VListItem
                          title="CSV"
                          @click="exportar('CSV')"
                        />
                      </VList>
                    </VMenu>
                  </VBtn>
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VCardText>

        <template v-if="firstLoad">
          <VDivider />

          <VRow>
            <VCol cols="12">
              <DataTableServerSide 
                endpoint="/v1/candidates/letters"
                :params="filters" 
                :fields="fields" 
                :loading="isLoading" 
                table-class="table-bordered"
                @loading="changeLoading"
              >
                <template #v-thead>
                  <tr>
                    <th class="text-center border bg-info-light" colspan="7">
                      Datos Candidato
                    </th>
                    <th class="text-center border bg-orange-light" colspan="6">
                      Registrado en
                    </th>
                    <th class="text-center border bg-success-light" colspan="4">
                      Carta Anexa
                    </th>
                  </tr>
                </template>

                <template #cell(observations)="{ item }">
                  <div style="position: relative; width: 350px;">
                    <span style=" display: block;width: 100%; white-space: normal;">{{ item.observationsApproveLetter }} {{ item.observationsResignationLetter }}</span>
                  </div>
                </template>

                <template #cell(letterHash)="{ item }">
                  <div class="d-flex justify-center">
                    <VBtn
                      icon="mdi-file-download-outline"
                      variant="text"
                      color="secondary"
                      @click="download(item)"
                    />
                  </div>
                </template>
              </DataTableServerSide>
            </VCol>
          </VRow>
        </template>
      </VCard>
    </div>
  </div>
</template>

<route lang="yaml">
name: "candidates-letters-list"
meta:
  authRequired: true
</route>
