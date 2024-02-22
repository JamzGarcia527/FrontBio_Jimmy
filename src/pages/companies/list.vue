<script setup>
import { ref } from 'vue'
import { useI18n } from "vue-i18n"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"

const { t } = useI18n()
const isLoading = ref(false)
const endPointDataListWorkPlan = ref(`/company/list`)
const datatable = ref(null)


const fields = ref([
  { key: "id", label: t('companies.serial') },
  { key: "idNumber", label: t('companies.idNumber') },
  { key: "idCompanyType", label: t('companies.companyType') },
  { key: "CompanyName", label: t('companies.companyName') }, 
  { key: "riskLevel", label: t('companies.levelRiskCompany') }, 
  { key: "actions", label: t('companies.actions') },
])
    
// methods
</script>

<template>
  <VCard>
    <VRow>
      <VCol cols="12" sm="12" md="12">
        <div class="rounded border border-primary">
          <DataTableServerSide 
            ref="datatable" 
            :empty-text="t('common.empty_table')" 
            :fields="fields" 
            :endpoint="endPointDataListWorkPlan"
          >
            <template #cell(actions)="{ item }">
              <div class="d-flex justify-center">
                <VBtn
                  class="text-center"
                  icon="tabler-edit"
                  variant="text"
                  color="secondary"
                  @click="onEditData(item)"
                />
              </div>
              <div class="d-flex justify-center">
                <VBtn
                  class="text-center"
                  icon="tabler-user"
                  variant="text"
                  color="secondary"
                  @click="getSubmitWorkTask(item.id)"
                />
              </div>
            </template>            
          </DataTableServerSide>
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>

<route lang="yaml">
name: "companies-list"
meta:
authRequired: true
</route>
