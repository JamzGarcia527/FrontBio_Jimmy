<script setup>
import DifferentialFocusForm from '@/components/administration/differentialFocus/DifferentialFocusForm.vue'
import DataTable from '@/components/shared/DataTable.vue'
import Swal from '@/plugins/sweetalert2'
import { useCustomMessage } from "@/composables/useCustomMessage"
import { useGeneralFilter } from '@/stores/generalfilter'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const generalfilterStore = useGeneralFilter()

generalfilterStore.loadFilters()

const showForm = ref(false)
const form = ref(null)
const parentId = ref(null)
const messageComposable = useCustomMessage()

const parents = computed(() => {
  return generalfilterStore
    .differentialFocus
    .map(e => ({ title: e.name, value: e.id }))
})

const itemsTable = computed(() => {
  if (parentId.value == null) return  []
  
  const group = generalfilterStore
    .differentialFocus
    .find(e => parentId && e.id == parentId.value)
  
  if (!group) return  []
  
  return group.children.map(e => ({ ...e, parentId: parentId.value }))
})

const fieldsTable = [
  { key: 'append', label: ' ' },
  { key: 'code', label: t('differential_focus.fields.code') },
  { key: 'name', label: t('differential_focus.fields.name') },
  { key: 'action', label: t('differential_focus.fields.action') },
]

const handlerForm = payload => {
  form.value = payload
  showForm.value = true
}

const toggleActive = payload => {
  const requestBody = { ...payload, active: !payload.active }

  const { code, name: description, active } = requestBody 

  const message = active  
    ? { status_q: 'activar', status_r: 'activado' }
    : { status_q: 'inactivar', status_r: 'inactivado' }

  const { status_q, status_r } = message

  Swal.fire({
    html: t('differential_focus.delete_confirm.question', { status_new: status_q, code, description }),
    icon: "question",
    customClass: { confirmButton: "bg-error" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await generalfilterStore.saveDifferentialFocus(requestBody)
        Swal.fire({ text: t('differential_focus.delete_confirm.response', { status_new: status_r }), icon:"success" })
        
        return true
      } catch (error) {
        let message = messageComposable.get("MS0010")
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}
</script>

<template>
  <VBreadcrumbs :items="[ $t('common.home'), t('user.breadcrumbs.title'), t('user.breadcrumbs.differential_focus') ]" />
  <VCard :title="t('differential_focus.title_card')">
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <VSelect
            v-model="parentId"
            :label="t('differential_focus.label_group_differential_focus')"
            :items="parents"
            clearable
          />
        </VCol>
        <VCol cols="12" md="6" class="text-right">
          <VBtn 
            prepend-icon="tabler-circle-plus" 
            color="secondary"
            @click="() => handlerForm({})"
          >
            {{ t('differential_focus.label_btn_add') }}
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
    <VDivider />
    <DataTable 
      :fields="fieldsTable"
      :items="itemsTable"
      paginate
    >
      <template #cell(action)="{ item }">
        <VTooltip
          :text="t('common.btn_edit')"
          location="top"
        >
          <template #activator="{ props: tooltip }">
            <VBtn 
              v-bind="tooltip"
              icon="tabler-edit" 
              variant="text" 
              color="warning" 
              @click="() => handlerForm(item)" 
            />
          </template>
        </VTooltip>
        <VTooltip
          :text="item.active ? t('common.btn_inactive') : t('common.btn_active')"
          location="top"
        >
          <template #activator="{ props: tooltip }">
            <VBtn 
              v-bind="tooltip"
              icon="tabler-circle-filled" 
              variant="text"
              :color="item.active ? 'success' : 'error'"  
              @click="() => toggleActive(item)"
            />
          </template>
        </VTooltip>
      </template>
    </DataTable>
    <DifferentialFocusForm v-model="showForm" :data="form" />
  </VCard>
</template>

<route lang="yaml">
name: "administration-differential-focus"
meta:
  authRequired: true
</route>
