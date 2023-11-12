<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { onMounted } from 'vue'
import { useI18n } from "vue-i18n"
import DataTable from '@/components/shared/DataTable.vue'

// Definición de variables
const { t } = useI18n()
const isLoading = ref(false)
const isDisabled = ref(false)
const isDialogVisible = ref(false)
const selectedCoalition = ref(null)

const form = ref({
  coalitionCode: null,
  groupingPoliticalName: null,
  coalitionName: null,
})

const items = ref([])

const fields = ref([
  { key: "id", label: t('coalitions.datatable.coalitionCode').toUpperCase(), thClass: 'text-center' },
  { key: "name", label: t('coalitions.datatable.description').toUpperCase() },
  { key: "corporation", label: t('acceptance_rejection.letters.corporationName').toUpperCase() },
  { key: 'department', label: t('acceptance_rejection.letters.department').toUpperCase() },
  { key: "municipality", label: t('acceptance_rejection.letters.municipality').toUpperCase() },
  { key: "commune", label:t('acceptance_rejection.letters.commune').toUpperCase() },
  { key: 'representativename', label: t('coalitions.datatable.representative').toUpperCase() },
  { key: 'action', label: t('coalitions.datatable.action').toUpperCase(), thClass: 'text-center' }, 
])

const getCoalitions = async () => {

  const { coalitionCode, groupingPoliticalName, coalitionName  } = form.value

  const requestBody = {
    groupId: coalitionCode,
    groupName: groupingPoliticalName,
    coalitionName: coalitionName,
  }

  isLoading.value = true
  isDisabled.value = true

  try {
    // const { data } = await axios.get('/v1/coalitions/grouping-political', { params: queryParams })
    const { data } = await axios.post('/v1/coalitions/list-filter', requestBody )

    items.value = data

    return true
  } catch (error) {
    let message = t('coalitions.not_operation')
    if (error.response && error.response.status < 500) 
      message = error.response.data.message
    Swal.fire({ icon: "warning", text: message })
        
    return false
  } finally {
    isLoading.value = false
    isDisabled.value = false
  }
}

const deleteCoalition = async id => {
  Swal.fire({
    title: t('coalitions.title_confirmed_delete_coalitions'),
    icon: "question",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await axios.delete(`/v1/coalitions/${id}`)

        
        Swal.fire({ text: t('coalitions.msg_coalition_deleted'), icon: "success" })
        getCoalitions()
        
        return true
      } catch (error) {
        let message = t('coalitions.not_operation')
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

const openModal = id => {
  selectedCoalition.value = items.value.find(item => item.id === id)
  isDialogVisible.value = true
}

onMounted(() => {
  getCoalitions()
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('coalitions.breadcrumbs.home')]" />
    <VCard class="mb-5">
      <VForm ref="refForm" :disabled="formDisabled" class="mb-4" @submit.prevent="getCoalitions">
        <VCardText>
          <VRow class="mb-2">
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.coalitionCode"
                clearable
                :label="t('coalitions.code_grouping_political_type')"
                :placeholder="t('coalitions.code_grouping_political_type')"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.groupingPoliticalName"
                clearable
                :label="t('coalitions.form.grouping_political_name')"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.coalitionName"
                clearable
                :label="t('coalitions.form.coalition_name')"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="text-start d-flex gap-4">
          <VBtn :loading="isLoading" type="submit">
            {{ t('coalitions.btn_search') }}
          </VBtn>
          <VBtn :disabled="isDisabled" type="reset" color="secondary">
            {{ t('coalitions.btn_clear') }}
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
    <!-- 
      <VRow class="my-3 mx-1">
      <VSpacer />
      <VBtn color="secondary" :to="{ name: 'coalition-create' }">
      <VIcon
      start
      icon="tabler-users"
      />
      {{ t('coalitions.create_coalition') }}
      </VBtn>
      </VRow>
    -->
    <DataTable v-if="items.length != 0" :items="items" :fields="fields" paginate>
      <template #cell(id)="{ item }">
        <div class="d-flex justify-center">
          <VBtn variant="plain" color="dark" @click="openModal(item.id)">
            {{ item.id }}
          </VBtn>
        </div>
      </template>
      <template #cell(representative)="{ item }">
        {{ item.representativename }}
      </template>
      <template #cell(action)="{ item }">
        <div class="d-flex justify-center">
          <VBtn
            color="error"
            variant="text"
            @click="deleteCoalition(item.id)"
          >
            <VTooltip
              location="top"
              activator="parent"
            >
              {{ t('coalitions.btn_delete') }}
            </VTooltip>
            <VIcon
              size="25"
              icon="tabler-trash"
            />
          </VBtn>
        </div>
      </template>
    </DataTable>
    <VCard v-else>
      <VAlert color="secondary">
        No hay registros para mostrar
      </VAlert>
    </VCard>
    <VDialog
      v-model="isDialogVisible" width="600"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="isDialogVisible = !isDialogVisible" />

      <!-- Dialog Content -->
      <VCard class="text-wrap" :title="t('coalitions.coalitions_grouping')">
        <VCardText>
          <VDivider class="mb-3" />
          <VTable class="table table-bordered">
            <thead>
              <tr>
                <th class="text-center" scope="col">
                  {{ t('coalitions.political_grouping_code') }}
                </th>
                <th scope="col">
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedCoalition.members" :key="item.groupingpoliticalId">
                <th class="text-center" scope="row">
                  {{ item.groupId }}
                </th>
                <td>{{ item.groupName }}</td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardText>
          <VCardText class="d-flex justify-end">
            <VBtn @click="isDialogVisible = false">
              {{ t('coalitions.btn_close_modal') }}
            </VBtn>
          </VCardText>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "coalition-list"
meta:
  authRequired: true
</route>
