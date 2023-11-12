<script setup>
import { useI18n } from "vue-i18n"
import DataTableSearch from "@/components/shared/DataTableSearch.vue"
import Swal from "@/plugins/sweetalert2"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import axios from "@/plugins/axios"
import { downloadBlob } from "@/utils"

// Translate i18n
const { t } = useI18n()

const { can } = useAppAbility()
const showView = ref(false)

const valueRadioCheck = ref(null)
const filters = ref({})
const nameColumn = ref('name')
 
const filterTable = () => {
  filters.value = { 
    noInscriptions: valueRadioCheck.value == 'noInscriptions' ? true : false, 
    noEntriesSystem: valueRadioCheck.value == 'noEntriesSystem' ? true : false, 
    withInscriptions: valueRadioCheck.value == 'withInscriptions' ? true : false, 
    withIncomeSystem: valueRadioCheck.value == 'withIncomeSystem' ? true : false, 
  }
}

const fields = ref([
  { key: "id", label: t('monitoring_political_groups.code') },
  { key: "name", label: t('monitoring_political_groups.name_political_grouping') },
])

const clearRadioButton = () => {
  valueRadioCheck.value = null
  filterTable()
}

const msnPhases = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}

const isExporting = ref(false)

const exportFile = exportType => {

  isExporting.value = true
  let type = ""
  if (valueRadioCheck.value == 'noInscriptions'){
    type = "(Sin inscripciones)"
  } else if (valueRadioCheck.value == 'noEntriesSystem') {
    type = "(Sin ingreso al sistema)"
  } else if (valueRadioCheck.value == 'withInscriptions') {
    type = "(Con inscripciones)"
  } else if (valueRadioCheck.value == 'withIncomeSystem') {
    type = "(Con ingreso al sistema)"
  }
  
  const filename = `seguimiento-agrupaciones-politicas${type}`

  const mimeType = exportType == 2 ? 'text/csv;charset=utf-8' 
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'

  const requestParams = { ...filters.value, exportType }
  
  axios.get(`/grouping-political/monitoring/download`, {
    params: requestParams,
    responseType: "blob",
  }).then(({ data }) => {
    console.log(data)
    downloadBlob(data, filename, mimeType)
  }).catch(error => {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  }).finally(() => isExporting.value = false)
}

onMounted(() => {
  if(can('get', 'grouping-political-monitoring')){
    showView.value = true
    filterTable()
  }else{
    showView.value = false
    msnPhases(t('monitoring_political_groups.warning_opening'), "warning")
  }
})
</script>

<template>
  <div>
    <div v-if="showView" class="layout-default">
      <VBreadcrumbs :items="[ t('monitoring_political_groups.breadcrumbs.title'), t('monitoring_political_groups.title'), t('monitoring_political_groups.breadcrumbs.item_one') ]" />
      <VCard :title="t('monitoring_political_groups.page_title')">
        <VCardTitle>
          <hr>
        </VCardTitle>
        <VRow class="pa-8 py-2">
          <VCol cols="12" md="12">
            <VCardTitle>
              <VRow class="pa-3">
                <h6 class="font msn">
                  {{ t('monitoring_political_groups.select_option') }}
                </h6>
              </VRow>
              <VForm ref="form" @submit.prevent="() => {}">
                <VRadioGroup v-model="valueRadioCheck">
                  <VRow class="py-2">
                    <VCol cols="12" md="4" class="py-3">
                      <VRadio 
                        value="noInscriptions"
                        class="msn"
                        :label="t('monitoring_political_groups.no_inscriptions')"
                      />
                    </VCol>
                    <VCol cols="12" md="4" class="py-3">
                      <VRadio 
                        value="withInscriptions"
                        class="msn"
                        :label="t('monitoring_political_groups.with_inscriptions')"
                      />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol cols="12" md="4" class="py-3">
                      <VRadio 
                        value="noEntriesSystem"
                        class="msn"
                        :label="t('monitoring_political_groups.not_into_system')"
                      />
                    </VCol>
                    <VCol cols="12" md="4" class="py-3">
                      <VRadio
                        value="withIncomeSystem"
                        class="msn"
                        :label="t('monitoring_political_groups.into_system')"
                      />             
                    </VCol>
                    <VCol cols="12" md="4">
                      <VRow justify="start" class="gap-3 py-1">
                        <VBtn rounded="pill" variant="outlined" flat @click="clearRadioButton">
                          {{ t("monitoring_political_groups.exit") }}
                        </VBtn>
                        <VBtn
                          type="submit"
                          @click="filterTable"
                        >
                          {{ t("monitoring_political_groups.search") }}
                        </VBtn>
                      </VRow>
                    </VCol>
                  </VRow>
                </VRadioGroup>
              </VForm>
            </VCardTitle>
          </VCol>
        </VRow>
        <VCard :title="t('list_candidates.incidents_found')">
          <VCardTitle>
            <hr>
          </VCardTitle> 
          <DataTableSearch             
            endpoint="/grouping-political/monitoring" 
            :params="filters" 
            :fields="fields"
            :name-column-search="nameColumn"
          >
            <template #exportFile>
              <div class="text-right">
                <VMenu open-on-hover>
                  <template #activator="{ props }">
                    <VBtn v-bind="props" prepend-icon="tabler-table-export" :loading="isExporting">
                      {{ t('common.btn_export') }}
                    </VBtn>
                  </template>

                  <VList>
                    <VListItem
                      :title="t('common.btn_export_excel')"
                      @click="exportFile(1)"
                    />
                    <VListItem
                      :title="t('common.btn_export_csv')"
                      @click="exportFile(2)"
                    />
                  </VList>
                </VMenu>
              </div>
            </template>
          </DataTableSearch>
        </VCard>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>

<route lang="yaml">
name: "monitoring-political-groups"
meta:
  authRequired: true
</route>
