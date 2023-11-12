<script setup>
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"

// Translate i18n
const { t } = useI18n()
const dniFilter = ref({})
const filters = ref({})

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "corporation", label: t('list_candidates_dni.candidate_dni') },
  { key: "circunscription", label: t('list_candidates_dni.name') },
  { key: "groupingPoliticalType", label: t('list_candidates_dni.surname') },
  { key: "groupingPolitical", label: t('list_candidates_dni.status') },
  { key: 'department', label: t('list_candidates_dni.registration_date') },
  { key: "municipality", label: t('list_candidates_dni.registered_by') },
  { key: 'commune', label: t('list_candidates_dni.modification_date') },
  { key: "candidateDni", label: t('list_candidates_dni.modification_by') },
  { key: "names", label: t('list_candidates_dni.grouping_political_name') },
  { key: "surnames", label: t('list_candidates_dni.corporation') },
  { key: "surnames", label: t('list_candidates_dni.circunscription') },
  { key: "surnames", label: t('list_candidates_dni.registration_place') },
])


const filterDNI = () => {
  filters.value = { ...dniFilter.value  }
}


const msnList = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}



onMounted(() => {
  const dni = 32100002
  const url = `/v1/candidates/report/${dni}`

  axios.get(`${url}`).then(response => {
    console.log(response)
  })

})
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ t('list_candidates_dni.breadcrumbs.title'), t('list_candidates_dni.breadcrumbs.item_one') ]" />
      <VCard :title="t('list_candidates_dni.breadcrumbs.item_one')">
        <VCardTitle>
          <hr>
        </VCardTitle>
        <VRow>
          <VRow class="pa-12 py-11">
            <VCol cols="12" md="7">
              <VTextField
                :v-model="dniFilter"
                clearable 
                prepend-inner-icon="tabler-filter"
                :label="t('list_candidates_dni.dni')"
              />
            </VCol>
            <VCol cols="12" md="2" class="py-5">
              <VRow justify="center" class="gap-6 py-1">
                <VBtn rounded="pill" type="submit" @click="filterDNI">
                  {{ t("list_candidates_dni.search") }}
                </VBtn>
              </VRow>
            </VCol>
          </VRow>
        </VRow>
        <VCard :title="t('list_candidates_dni.incidents_found')">
          <VCardTitle>
            <hr>
          </VCardTitle> 
          <VRow>
            <VRow justify="end" class="me-11 mt-5 mb-1">
              <VMenu open-on-hover>
                <template #activator="{ props }">
                  <VBtn v-bind="props">
                    {{ t('formsPendingApproval.breadcrumbs.btnExportTitle') }}
                  </VBtn>
                </template> <VList>
                  <VListItem value="exportCsv">
                    <template #prepend>
                      <VIcon size="22" class="me-3" icon="la-file-csv" />
                    </template> <VListItemTitle color="white">
                      {{ t('formsPendingApproval.breadcrumbs.bntCSV') }}
                    </VListItemTitle>
                  </VListItem> <VListItem value="exportXls">
                    <template #prepend>
                      <VIcon size="22" class="me-3" icon="la-file-excel" />
                    </template> <VListItemTitle color="white">
                      {{ t('formsPendingApproval.breadcrumbs.bntExcel') }}
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </VRow>
            <VCol cols="12" md="12">
              <DataTableServerSide
                ref="datatable"
                endpoint="/v1/phases-user/filter"      
                :params="filters"
                :fields="fields"
              />
            </VCol>
          </VRow>
        </VCard>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>
