<script setup>
import DataTableServerSide from "@/components/shared/DataTableServerSideReports.vue"
import imageLogo from '@images/pages/fondoContrasena.png'
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const isDialogVisible = ref(false)
const filters = ref([])
const filtersDetail = ref([])

const fields = ref([
  { key: "corporationName", label: t('common.corporation').toUpperCase(),thClass: 'text-center'  },
  { key: "totalOmd", label: t('summary_signed_OMD.letters.total_OME').toUpperCase(),thClass: 'text-center' },
  { key: 'signed', label: t('summary_signed_OMD.letters.signed').toUpperCase(),thClass: 'text-center'  },
  { key: "pending", label: t('summary_signed_OMD.letters.Earrings_sign').toUpperCase(),thClass: 'text-center'  }, 
])

const fieldsDetail = ref([
  { key: "idOMD", label: t('summary_signed_OMD.letters.No_OMD').toUpperCase() },
  { key: "departmentName", label: t('reports_inscription.letters.department').toUpperCase() },
  { key: 'municipalityName',label: t('reports_inscription.letters.municipality').toUpperCase() },
  { key: 'communeName',label: t('reports_inscription.letters.commune').toUpperCase() },
  { key: "corporationName", label: t('common.corporation').toUpperCase() },
  { key: "circunscriptionsName", label: t('common.circunscription').toUpperCase()  },
  { key: "groupingpoliticalTypesName", label: t('common.grouping_political_type').toUpperCase() },
  { key: "groupingpoliticalName", label: t('common.grouping_political_name').toUpperCase() },
  { key: "reasonOMD", label: t('summary_signed_OMD.letters.OMD_reason').toUpperCase() },
  { key: "createdBy", label: t('summary_signed_OMD.letters.creation_user').toUpperCase() },
  { key: "createdAt", label: t('summary_signed_OMD.letters.creation_date').toUpperCase() },
])

const openModal = async value => {

  isDialogVisible.value = true
 
  filtersDetail.value = {
    "corporationId": value,
    "size": 10, 
  }
  
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('OMD.change_data_group_political.breadcrumbs'), $t('summary_signed_OMD.title') ]" /> 
    <VCard :title="t('summary_signed_OMD.title')">
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/omd/summary-signed-omd"
        table-class="table-bordered"
        :params="filters"
        :fields="fields"
      >
        <template #cell(pending)="{ item }">
          <div class="d-flex justify-center">
            <VBtn variant="plain" @click="openModal(item.corporationId)">
              {{ item.pending == null ? '0' :item.pending }}
            </VBtn>
          </div>
        </template>
        <template #cell(signed)="{ item }">
          <div class="d-flex justify-center">
            {{ item.signed == null ? '0' :item.signed }}
          </div>
        </template>
        <template #cell(totalOmd)="{ item }">
          <div class="d-flex justify-center">
            {{ item.totalOmd == null ? '0' :item.totalOmd }}
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
  <VDialog
    v-model="isDialogVisible" width="1000"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

    <!-- Dialog Content -->
    <VCard class="text-wrap">
      <VImg
        :src="imageLogo"
        cover
      />
      <VCardText>
        <VListItemTitle class="text-h6  d-flex justify-center ">
          {{ t('summary_signed_OMD.letters.titleDetalle') }}
        </VListItemTitle>
      </VCardText>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/omd/summary-signed-omd-detailed"
        table-class="table-bordered"
        :params="filtersDetail"
        :fields="fieldsDetail"
      />
      <VCardText class="d-flex justify-end">
        <VBtn @click="isDialogVisible = false">
          {{ t('coalitions.btn_close_modal') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
name: "summary-signed-OMD"
meta:
authRequired: true
</route>
