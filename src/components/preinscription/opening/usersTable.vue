<script setup>
import { useI18n } from "vue-i18n"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"

const { t } = useI18n()

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "userBy", label: t('opening_preinscription.user_code') },
  { key: "userName", label: t('opening_preinscription.username') },
  { key: "rolName", label: t('opening_preinscription.profile') },
  { key: "initialDateSix", label: t('opening_preinscription.opening_e6') },
  { key: 'finalDateSix', label: t('opening_preinscription.closing_e6') },
  { key: "initialDateSeven", label: t('opening_preinscription.opening_e7') },
  { key: 'finalDateSeven', label: t('opening_preinscription.closing_e7') },
  { key: "change_dates", label: t('opening_preinscription.change_dates') },
])
</script>

<template>
  <div>
    <VRow class="pa-3">
      <VCol cols="12" md="12">
        <DataTableServerSide
          ref="datatable"
          endpoint="/v1/phases-user/filter"
          :params="filters"
          :fields="fields"
        >
          <template #cell(roleDescription)="{ item }">
            {{ item.roleDetail.name }}
          </template>
          <template #cell(change_dates)="{ item }">
            <div class="text-center">
              <VBtn
                class="text-center"
                icon="mdi-calendar-edit-outline"
                variant="text"
                color="secondary"
              />
            </div>
          </template>
        </DataTableServerSide>
      </VCol>
    </VRow>
  </div>
</template>

