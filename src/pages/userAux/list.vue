<script setup>
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import UserFilter from "@/pages/userAux/userFilter.vue"
import Swal from '@/plugins/sweetalert2'
import axios from '@/plugins/axios'

import { useGeneralFilter as useGeneralFilterComposable } from "@/composables/useGeneralFilter"

// Translate i18n
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const datatable = ref(null)
const filters = ref({})


const fields = ref([
  { key: "index", label: " " },
  { key: "userCode", label: t('user.listUserAux.userCode').toUpperCase() },
  { key: "username", label: t('user.listUserAux.userName').toUpperCase() },
  { key: 'email', label: t('user.listUserAux.email').toUpperCase() },
  { key: "roleName", label: t('user.listUserAux.roleName').toUpperCase() },
  { key: "groupingPoliticalNameType", label: t('user.listUserAux.groupingPoliticalNameType').toUpperCase() },
  { key: "department", label: t('user.listUserAux.department').toUpperCase() },
  { key: "municipality", label: t('user.listUserAux.municipality').toUpperCase() },
  { key: "active", label: t('user.listUserAux.status').toUpperCase() },
  { key: 'changePassword', label: t('user.change_password').toUpperCase() },
  { key: "e6Quantity", label: t('user.listUserAux.e6Quantity').toUpperCase() },
  { key: "e7Quantity", label: t('user.listUserAux.e7Quantity').toUpperCase() },
  
])

const divipole = useGeneralFilterComposable()

const filterUser = data => {
  console.log("data.filter", data.filter)
  console.log("data.name", data.name)

  
  filters.value = { 
    filter_option: data.filter, 
    filter_value: data.name === null || data.name === "" ? "0" : data.name, 
  }
  

   
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
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('user.breadcrumbs.title'), t('user.breadcrumbs.users') ]" />
    <UserFilter @search="filterUser" />
    <VRow class="my-3 mx-1">
      <VSpacer />
      <VBtn color="secondary" :to="{ name: 'userAux-create' }">
        <VIcon
          start
          icon="tabler-user-plus"
        />
        {{ t('user.create_user') }}
      </VBtn>
    </VRow>
    <VCard>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/user/auxiliary"
        :params="filters"
        :fields="fields"
      >
        <template #cell(active)="{ item }">
          <div class="text-center">
            <VChip label :color="item.status == true ? 'success' : 'error'">
              {{ item.status == true ? t("user.status") : t("user.instatus") }}
            </VChip>
          </div>
        </template>
        <template #cell(changePassword)="{ item }">
          <div class="text-center">
            <VBtn
              :disabled="item.status == false"
              class="text-center"
              :icon="item.status == true ? 'tabler-lock-open' : 'tabler-lock-off'"
              variant="text"
              color="secondary"
              @click="resetPassword(item.userId)"
            />
          </div>
        </template>
        <template #cell(e6Quantity)="{ item }">
          <div class="text-center">
            {{ item.e6Quantity }}
          </div>
        </template>
        <template #cell(e7Quantity)="{ item }">
          <div class="text-center">
            {{ item.e7Quantity }}
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "userAux-list"
meta:
  authRequired: true
</route>
