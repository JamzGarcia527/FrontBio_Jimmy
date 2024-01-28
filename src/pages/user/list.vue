<script setup>
import DataTableServerSide from "@/components/user/DataTableServerSide.vue"
import UserFilter from "@/pages/user/userFilter.vue"
import Swal from '@/plugins/sweetalert2'
import axios from '@/plugins/axios'
import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"
import { useGeneralFilter } from "@/stores/generalfilter"
import { strPad } from "@/utils/index"

// Translate i18n
import { useI18n } from "vue-i18n"
import { storeToRefs } from "pinia"

const { t } = useI18n()
const datatable = ref(null)
const filters = ref({})

// sort.value: -1 => All, 1 => ASC, 2 => DESC
// sort.show: true, false
const fields = ref([
  { key: "username", label: t('user.username').toUpperCase(), thClass: 'text-center', sort: { key: 'username', value: -1, show: true } },
  { key: "fullname", label: t('user.fullname').toUpperCase(), thClass: 'text-center', sort: { key: 'fullname', value: -1, show: true } },
  { key: 'email', label: t('user.email').toUpperCase(), thClass: 'text-center', sort: { key: 'email', value: -1, show: true } },
  { key: "roleDescription", label: t('user.user_rol').toUpperCase(), thClass: 'text-center', sort: { key: 'roleName', value: -1, show: true } },
  { key: "groupingPoliticalTypeName", label: t('user.groupingPoliticalTypes').toUpperCase(), thClass: 'text-center', sort: { key: 'groupingPoliticalTypeName', value: -1, show: true } },
  { key: "departament", label: t('user.department_filter').toUpperCase(), thClass: 'text-center', sort: { key: 'departament', value: -1, show: true } },
  { key: "municipality", label: t('user.municipality_filter').toUpperCase(), thClass: 'text-center', sort: { key: 'municipality', value: -1, show: true } },
  { key: "commune", label: t('user.commune_filter').toUpperCase(), thClass: 'text-center', sort: { key: 'commune', value: -1, show: true } },
  { key: "active", label: t('user.status_header').toUpperCase(), thClass: 'text-center', sort: { key: 'active', value: -1, show: true } },
  { key: "actions", label: t('user.actions').toUpperCase(), thClass: 'text-center', sort: { key: 'test', value: -1, show: false } },
])

const { list: divipole } = storeToRefs(useGeneralFilter())

const filterUser = data => {
  filters.value = data
}

const resetPassword = id => {
  Swal.fire({
    title: t('user.are_you_sure'),
    text: t('user.text_swal'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: t('user.cancel'),
    confirmButtonText: t('user.confirm_button_text'),
    customClass: { confirmButton: "notAllowedEmulator" },
  }).then(async result => {
    if (result.isConfirmed) {
      try {
        await axios.post(`/v1/user/${id}/recovery-password`)
        Swal.fire(
          t('user.title_confirmed_change_password'),
          t('user.text_confirmed_change_password'),
          'success',
        )
        
        return true
      } catch (error) {
        if (error.response && error.response.status < 500) {
          const { message } = error.response.data

          // TODO: Pasar los mensajes por el i18n
          await Swal.fire({
            icon: 'warning',
            text: message,
          })
        }
    
        return false
      }
    }
  })
}

const buildTextDivipole = item => {
  let stringBuilder = ""
  
  const { department, municipality, commune } = item
  if (!department || department == -1) return stringBuilder
  const depa = divipole.value.departments.find(e => e.id == department)

  stringBuilder = depa?.name || ''  
  
  if (!municipality || municipality == -1) return stringBuilder
  const muni = divipole.value.municipalities.find(e => e.parent_id == strPad(department, 2) && e.id == municipality)

  stringBuilder = `${stringBuilder} > ${muni?.name || ''}`
  
  if (!commune || commune == -1) return stringBuilder
  const comm = divipole.value.communes.find(e => e.parent_id == `${strPad(department, 2)}${strPad(municipality, 3)}` && e.id == commune)

  stringBuilder = `${stringBuilder} > ${comm?.name || ''}`
  
  return stringBuilder
}

const getNameDepartament = depart => {
  const depa = divipole.value.departments.find(e => e.id == depart)

  return depa?.name || ''
}

const getNameMunicipality = (depart, munic) => {
  const muni = divipole.value.municipalities.find(e => e.parent_id == strPad(depart, 2) && e.id == munic)

  return muni?.name || ''
}

const getNameCommune = (depart, munic, comm) => {
  const commu = divipole.value.communes.find(e => e.parent_id == `${strPad(depart, 2)}${strPad(munic, 3)}` && e.id == comm)
    
  return commu?.name || ''
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), t('user.breadcrumbs.title'), t('user.breadcrumbs.users') ]" />
    <UserFilter @search="filterUser" />
    <VRow class="my-3 mx-1">
      <VSpacer />
      <VBtn color="secondary" :to="{ name: 'user-create' }">
        <VIcon start icon="tabler-user-plus" />
        {{ t('user.create_user') }}
      </VBtn>
    </VRow>
    <VCard>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/user"
        :empty-text="t('common.empty_table')"
        :params="filters"
        :fields="fields"
        table-class="text-center"
      >
        <template #cell(fullname)="{ item }">
          {{ item.firstName }}
          {{ item.secondName }}
          {{ item.firstSurname }}
          {{ item.secondSurname }}
        </template>

        <template #cell(roleDescription)="{ item }">
          <p class="font-weight-regular mb-0">
            {{ item.roleDetail.name }} <br>
            <small v-if="item.divipols.length" class="text-muted">
              {{ buildTextDivipole(item.divipols[0]) }}
            </small>
            <small v-if="item.groupingPoliticalTypeName" class="text-muted line-height">
              {{ item.groupingPoliticalTypeName }}
            </small>
          </p>
        </template>

        <template #cell(departament)="{ item }">
          {{ getNameDepartament(item.divipols[0]?.department || -1) }}
        </template>

        <template #cell(municipality)="{ item }">
          {{ getNameMunicipality(item.divipols[0]?.department || -1, item.divipols[0]?.municipality || -1) }}
        </template>

        <template #cell(commune)="{ item }">
          {{ getNameCommune(item.divipols[0]?.department || -1, item.divipols[0]?.municipality || -1, item.divipols[0]?.commune || -1) }}
        </template>

        <template #cell(active)="{ item }">
          <div class="text-center">
            <VChip label :color="item.active == true ? 'success' : 'error'">
              {{ item.active == true ? t("user.status") : t("user.inactive") }}
            </VChip>
          </div>
        </template>

        <template #cell(actions)="{ item }">
          <VBtn
            :disabled="item.active == false"
            class="text-center me-2"
            :icon="item.active == true ? 'tabler-lock-open' : 'tabler-lock-off'"
            variant="text"
            color="secondary"
            @click="resetPassword(item.id)"
          />
          <VBtn
            v-if="item.roleDetail.id > 2"
            class="text-center"
            icon="tabler-user-edit"
            variant="text"
            color="secondary"
            :to="{ name: 'user-edit-id', params: {id: item.id} }"
          />
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<style scoped>
.text-muted {
  color: #878a99 !important;
}
</style>

<route lang="yaml">
name: "user-list"
meta:
  authRequired: true
</route>
