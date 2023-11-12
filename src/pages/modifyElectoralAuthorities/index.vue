<script setup>
import Filter from '@/components/modifyElectoralAuthorities/modifyElectoralAuthoritiesFilter.vue'
import DataTableServerSide from "@/components/shared/DataTableServerSideReports.vue"
import { _buildDownloadCSV } from "@/utils/functions"
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"


const { t } = useI18n()
const filters = ref([])
const datatable = ref(null)


const fields = ref([
  { key: "department", label: t('reports_inscription.letters.department').toUpperCase() },
  { key: 'municipality',label: t('reports_inscription.letters.municipality').toUpperCase() },
  { key: 'commune',label: t('reports_inscription.letters.commune').toUpperCase() },
  { key: 'authority',label: t('modify_electoral_authorities.letters.number_authorities').toUpperCase() },
  { key: 'action', label: 'ACCIONES', thClass: 'text-center' },
])





const handlerSearchFilter = value => {
  const filter = value
 
  filters.value= {
    "departmentId": filter.department,
    "municipalityId":filter.municipality,
    "communeId": filter.commune,
    "size":10,
  }
}

const isLoading = ref(false)

const handlerToggleAuthorities = async (payload, authority) => {
  isLoading.value = true

  const { departmentId, mucipalityId, communeId } = payload
  try {
    const requestBody = {
      "commune": communeId,
      "municipality":mucipalityId,
      "department": departmentId,
      "authorities": authority,
    }

    const { data } = await axios.put(`/v1/divipol`, requestBody)

    payload.authority = authority
    Swal.fire({ icon: "success", text: data.message })
  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message ,
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('menu_phases.breadcrumbs.module'), $t('modify_electoral_authorities.title') ]" /> 
    <Filter class="mb-4" @search="handlerSearchFilter" />
    <VCard>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/divipol"
        table-class="table-bordered"
        :params="filters"
        :fields="fields"
      >
        <template #cell(authority)="{ item }">
          <div class="d-flex justify-center">
            {{ item.authority }}
          </div>
        </template>
        <template #cell(action)="{ item }">
          <div class="mt-1 mb-1 d-flex justify-center">
            <VBtn 
              v-if="item.authority == 1"
              variant="text" 
              prepend-icon="tabler-user"
              @click="() => handlerToggleAuthorities(item, 2)"
            >
              {{ item.authority }}
            </VBtn>
            <VBtn 
              v-if="item.authority == 2"
              variant="text" 
              prepend-icon="tabler-users"
              @click="() => handlerToggleAuthorities(item, 1)"
            >
              {{ item.authority }}
            </VBtn>
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "modify-electoral-authorities"
meta:
authRequired: true
</route>
