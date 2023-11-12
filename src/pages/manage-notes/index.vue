<script setup>
import { useI18n } from "vue-i18n"
import Filter from "@/components/manage-notes/Filter.vue"
import Create from "@/components/manage-notes/Create.vue"
import Edit from "@/components/manage-notes/Edit.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import Swal from '@/plugins/sweetalert2'
import axios from '@/plugins/axios'

// Inicialización de variables
const openModalEdit = ref(false)
const { t } = useI18n() 
const endpoint = '/notes/list'
const datatable = ref('')
const dataEdit = ref({})
const filtersControl = reactive({ loading: false, disabled: false })
const filters = ref({})
const tableIsVisible = ref(false)

const fields = ref([
  { key: 'groupingPoliticalType', label: t('manage_notes.table.groupingPoliticalType') },
  { key: 'corporation', label: t('manage_notes.table.corporation') },
  { key: 'circunscription', label: t('manage_notes.table.circunscription') },
  { key: 'description', label: t('manage_notes.table.description') },
  { key: 'phaseId', label: 'Etapa' },
  { key: 'actions', label: t('manage_notes.table.actions'), thClass: 'text-center' },
])

const handlerFilter = value => {
  filtersControl.loading = true
  filtersControl.disabled = true

  const { corporationId, circunscriptionId, isBlankVotePromote, groupingPoliticalTypeId, phaseId, valid } = value
  let queryParams = { corporationId, circunscriptionId, blankVote: isBlankVotePromote, groupingPoliticalType: groupingPoliticalTypeId, phaseId }
  filters.value = queryParams

  filtersControl.loading = false
  filtersControl.disabled = false
  tableIsVisible.value = valid
}

const handlerChangeStatus = async (value, status) => {

  const { active, id } = value

  Swal.fire({
    text: active == 1 ? t('manage_notes.swal.text_inactive') : t('manage_notes.swal.text_active'),
    icon: "question",
    customClass: { confirmButton: "bg-error" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await axios.put(`/notes/status/${id}?status=${status}`)
        Swal.fire({ text: t('manage_notes.swal.msg_success'), icon: "success" })
        datatable.value.refresh()
        
        return true
      } catch (error) {
        let message = t('common.not_operation')
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

const handlerOpenModalEdit = value => {
  openModalEdit.value = true
  dataEdit.value = value
}

const hanlderCloseDialogUpdate = () => {
  openModalEdit.value = false
}

const handlerUpdateList = value => {
  if (value) {
    datatable.value.refresh()
    hanlderCloseDialogUpdate()
  }
}

const formatDescription = description => {
  return description.replace(/\n/g, '<br>')
}

const handlerSubmitCreate = () => {
  datatable.value.refresh()
}
</script>

<template>
  <div>
    <Filter :loading="filtersControl.loading" :disabled="filtersControl.disabled" class="mb-2" @search="handlerFilter" />
    <Create @saved="handlerSubmitCreate" />
    <DataTableServerSide v-if="tableIsVisible" ref="datatable" :params="filters" :endpoint="endpoint" :fields="fields">
      <template #cell(description)="{ item }">
        <div>
          <div class="text-justify text-wrap" v-html="formatDescription(item.description)" />
        </div>
      </template>  
      <template #cell(phaseId)="{ item }">
        <div class="text-justify text-wrap">
          {{ item.phaseId == 1 ? 'E6' : item.phaseId == 2 ? 'E7' : item.phaseId == 3 ? 'E8' : '-' }}
        </div>
      </template>  
      <template #cell(actions)="{ item }">
        <div class="d-flex justify-center">
          <VBtn
            variant="text"
            color="secondary"
            @click="handlerOpenModalEdit(item)"
          >
            <VTooltip
              activator="parent"
              location="top"
            >
              Modificar
            </VTooltip>
            <VIcon size="25" icon="tabler-pencil" />
          </VBtn>
          
          <VBtn
            variant="text"
            color="secondary"
            @click="handlerChangeStatus(item, item.active == 1 ? 0 : 1)"
          >
            <VTooltip
              activator="parent"
              location="top"
            >
              {{ item.active == 1 ? 'Inactivar' : 'Activar' }}
            </VTooltip>
            <VIcon size="25" icon="tabler-circle-filled" :color="item.active ? 'success' : 'error'" />
          </VBtn>
        </div>
      </template>
    </DataTableServerSide>
    <Edit :is-open-dialog="openModalEdit" :data="dataEdit" @updated="handlerUpdateList" @close-dialog="hanlderCloseDialogUpdate" />
  </div>
</template>

<route lang="yaml">
name: "manage-notes"
meta:
  authRequired: true
</route>

