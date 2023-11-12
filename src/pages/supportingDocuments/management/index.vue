<script setup>
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import Filter from '@/components/supportingDocuments/management/Filter.vue'
import Create from '@/components/supportingDocuments/management/create.vue'
import { useGeneralFilter } from "@/composables/useGeneralFilter"
import { keyPressOnlyNumber, pasteOnlyNumber } from '@/utils/events'
import { requiredEspecialSelectValidator, requiredValidator, maxLengthValidator,integerValidator } from "@/utils/validators"

// Definición e inicialización de variables
const { t } = useI18n()
const endpoint = '/v1/supporting-document/list'
const datatable = ref(null)
const dialogEdit = ref(false)
const tableIsVisible = ref(false)
const filters = ref({})
const filtersControls = reactive({ loading: false, disabled: false })
const openModalCreate = ref(false)

const formEdit = ref({
  id: null,
  phase: -1,
  corporation: -1,
  description: null,
  groupingPoliticalTypeId: -1,
  isBlankVotePromote: -1,
  checkbox:0,
  consecutivo:null,
})

const phasesList = [
  { title: t('common.select_one_option'), value: -1 },
  { title: 'ETAPA E6', value: 1 },
  { title: 'ETAPA E7', value: 2 },
]

const generalfilterCreate = useGeneralFilter()

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const corporations = computed(() => {
  const array = generalfilterCreate
    .getCorporations()
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const blankVotePromoterOptions = computed(() => {
  const array = [{ title: 'Sí', value: 1 },{ title: 'No', value: 0 }]
  
  return addOptionDefault(array)
})

const groupingPoliticalTypes = computed(() => {
  const array = generalfilterCreate.getGroupingPoliticalsTypes()
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const fields = ref([
  { key: 'phaseName', label: t('supportingDocuments.management.table.phase').toUpperCase(), thClass: 'text-center' },
  { key: 'corporation', label: t('supportingDocuments.management.table.corporation').toUpperCase() },
  { key: 'description', label: t('supportingDocuments.management.table.description').toUpperCase() },
  { key: 'action', label: t('supportingDocuments.management.table.action').toUpperCase(), thClass: 'text-center' },
])

const rules = reactive({
  consecutivo: [requiredValidator,integerValidator],
  corporations: [requiredEspecialSelectValidator],
  groupingPoliticalTypeId: [value => {
    if (formEdit.groupingPoliticalTypeId === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],

  isBlankVotePromote: [value => {
    if (blankVotePromoterOptions === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],

  description: [requiredValidator, maxLengthValidator(500)],
  phase: [value => {
    if (formEdit.phase === -1) return true

    return (value != null && value != -1) || 'Este campo es requerido'
  }],
})

const editForm = ref(null)

const handlerChangeStatus = async (value, status) => {
  const { active, id } = value

  Swal.fire({
    text: active == 1 ? t('supportingDocuments.management.swal.text_inactive') : t('supportingDocuments.management.swal.text_active'),
    icon: "question",
    customClass: { confirmButton: "bg-error" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await axios.put(`/v1/supporting-document/status/${id}?status=${status}`) // Endpoint para activar/inactivar soportes
        Swal.fire({ text: t('supportingDocuments.management.swal.msg_success'), icon: "success" })
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

const handlerOpenModalEdit = async value => {
  dialogEdit.value = true

  const { description, phaseId, corporationId, groupingPoliticalType, blankVotePromoter, id, required, consecutive } = value

  formEdit.value = {
    phase: phaseId,
    corporation: corporationId,
    description: description,
    groupingPoliticalTypeId: groupingPoliticalType,
    id,
    isBlankVotePromote: blankVotePromoter,
    checkbox:required,
    consecutivo:consecutive,

  }
  if (!dialogEdit.value) return formEdit.value = {}
}

const handlerFilter = value => {

  filtersControls.loading = true
  filtersControls.disabled = true

  const { valid, idGroupingPoliticalType, idCorporation, isBlankVotePromote, description, phase } = value

  const queryParams = {
    corporationId: idCorporation,
    groupingPoliticalType: idGroupingPoliticalType,
    description,
    phaseId: phase,
    blankVotePromoter: isBlankVotePromote,
  }

  filters.value = queryParams

  tableIsVisible.value = valid

  filtersControls.loading = false
  filtersControls.disabled = false
}

const handlerOpenModalCreate = () => {
  openModalCreate.value = true
}

const handlerCloseEditModal = () => {
  dialogEdit.value = false
}

const handlerUpdateEditInfo = async () => {

  const { valid } = await editForm.value.validate()
  if (!valid) return false
  const { phase, corporation, description, groupingPoliticalTypeId, isBlankVotePromote, id, checkbox, consecutivo } = formEdit.value

  const requestBody = {
    phaseId: phase,
    corporationId: corporation,
    groupingPoliticalType: groupingPoliticalTypeId,
    description,
    blankVotePromoter: isBlankVotePromote,
    required:checkbox,
    consecutive:consecutivo,
  }

  try {
    await axios.put(`/v1/supporting-document/update/${id}`, requestBody)
    Swal.fire({ text: t('supportingDocuments.management.swal.msg_success'), icon: "success" })

    const queryParams = {
      corporationId: requestBody.corporationId,
      groupingPoliticalTypeId: requestBody.groupingPoliticalType,
      description: requestBody.description,
      phaseId: requestBody.phaseId,
      blankVotePromoter: requestBody.blankVotePromoter,
    }

    filters.value = queryParams

    handlerCloseEditModal()
    formEdit.value = {}
    
    return true
  } catch (error) {
    let message = t('common.not_operation')
    if (error.response && error.response.status < 500) 
      message = error.response.data.message
    Swal.fire({ icon: "warning", text: message })
        
    return false
  }
}

const handlerSaved = value => {
  const { phaseId, corporationId, groupingpoliticalType, name, blankVote } = value.response

  const queryParams = {
    corporationId,
    groupingPoliticalTypeId: groupingpoliticalType,
    description: name,
    phaseId,
    blankVotePromoter: blankVote ? 1 : 0,
  }

  filters.value = queryParams
  tableIsVisible.value = true

  openModalCreate.value = false
}
</script>

<template>
  <div>
    <VBreadcrumbs
      :items="[ 
        t('supportingDocuments.management.breadcrumbs.title'), 
        t('supportingDocuments.management.breadcrumbs.page'), 
        t('supportingDocuments.management.breadcrumbs.child')
      ]"
    />
    <Filter :disabled="filtersControls.disabled" :loading="filtersControls.loading" class="mb-2" @search="handlerFilter" />
    <div class="d-flex justify-end me-3 mt-3 mb-2">
      <VBtn color="primary" @click="handlerOpenModalCreate">
        <VIcon start icon="tabler-file-plus" />
        Agregar soporte documento
      </VBtn>
    </div>
    <DataTableServerSide v-if="tableIsVisible" ref="datatable" :params="filters" :endpoint="endpoint" :fields="fields">
      <template #cell(phaseName)="{ item }">
        <div class="d-flex justify-center">
          {{ item.phaseName }}
        </div>
      </template>
      <template #cell(description)="{ item }">
        <div class="d-flex justify-justify text-wrap">
          {{ item.description }}
        </div>
      </template>
      <template #cell(action)="{ item }">
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
    <Create v-model="openModalCreate" @saved="handlerSaved" />
    <VDialog
      v-model="dialogEdit"
      width="1200"
      persistent
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="handlerCloseEditModal" />

      <!-- Dialog Content -->
      <VCard>
        <VForm ref="editForm" validate-on="submit" @submit.prevent="handlerUpdateEditInfo">
          <VCardText class="text-center">
            <h2 class="d-flex justify-center mb-3">
              Modificar información soporte documento
            </h2>
            <VDivider class="mb-5" />
            <VRow class="justify-center">
              <VCol cols="23" md="12">
                <VRow class="mb-2">
                  <VCol cols="12" md="6">
                    <VSelect
                      v-model="formEdit.phase" 
                      label="Etapa del proceso"
                      :items="phasesList"
                      :rules="rules.phase"
                    />
                  </VCol>  
                  <VCol cols="12" md="6">
                    <VSelect 
                      v-model="formEdit.corporation"
                      :label="t('common.corporation')"
                      :items="corporations"
                      :rules="rules.corporations"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol cols="12" md="6">
                    <VSelect 
                      v-model="formEdit.groupingPoliticalTypeId"
                      :label="t('user.groupingPoliticalTypes')"
                      :items="groupingPoliticalTypes"
                      :rules="rules.groupingPoliticalTypeId"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VSelect 
                      v-model="formEdit.isBlankVotePromote"
                      v-col
                      :label="t('common.blank_vote_promoter')"
                      :items="blankVotePromoterOptions"
                      :disabled="disabled"
                      :rules="rules.isBlankVotePromote"
                    />
                  </VCol>
                </VRow>
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="23" md="12">
                <VTextarea v-model="formEdit.description" :rules="rules.description" focused="true" placeholder="Por favor ingrese una descripción de máximo 500 caracteres" counter />
              </VCol>  
              <VCol cols="12" md="6">
                <VCheckbox
                  v-model="formEdit.checkbox"
                  :true-value="1"
                  :false-value="0"
                  label="Por favor seleccioné si el soporte documento es obligatorio"
                />
              </VCol> 
              <VCol cols="12" md="6">
                <VTextField
                  v-model="formEdit.consecutivo" 
                  label="Consecutivo"
                  class="mb-2 required"
                  :rules="rules.consecutivo"
                  :disabled="formDisabled"
                  @keypress="keyPressOnlyNumber"
                  @paste="pasteOnlyNumber"
                />
              </VCol>
            </VRow>
          </VCardText>

          <VCardText class="d-flex justify-end gap-2">
            <VBtn color="secondary" @click="handlerCloseEditModal">
              {{ t('common.btn_close') }}
            </VBtn>
            <VBtn type="submit">
              {{ t('common.btn_submit') }}
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "supporting-documents-management"
meta:
  authRequired: true
</route>
