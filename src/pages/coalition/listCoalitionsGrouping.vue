<script setup>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { onMounted } from 'vue'
import { useI18n } from "vue-i18n"
import DataTable from '@/components/shared/DataTable.vue'
import { useUserConfigStore } from '@/stores/userconfig'

// Definición de variables
const { t } = useI18n()
const isLoading = ref(false)
const isDisabled = ref(false)
const isDialogVisible = ref(false)
const selectedCoalition = ref(null)
const userConfig = useUserConfigStore()
const formDisabled = ref()

let form = ref({
  coalitionCode: null,
  groupingPoliticalName: null,
  coalitionName: null,
})


if(userConfig.userData.groupingPolitical == null){
 
}else{
  const groupingPoliticalName =ref(userConfig.userData.groupingPolitical.name)
  const groupingPoliticalId =ref(userConfig.userData.groupingPolitical.id)

  if(groupingPoliticalName && groupingPoliticalId){
    formDisabled.value = true
    form.value = {
      coalitionCode:groupingPoliticalId,
      groupingPoliticalName:groupingPoliticalName,
    }
  }
}



const items = ref([])

const fields = ref([
  { key: "id", label: t('coalitions.datatable.coalitionCode').toUpperCase(), thClass: 'text-center' },
  { key: "name", label: t('coalitions.datatable.coalitionName').toUpperCase() },
  { key: 'representativename', label: t('coalitions.datatable.representative').toUpperCase() },
 
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



const cleanFields =() =>{
  if(userConfig.userData.groupingPolitical == null){
    form.value = {}
  }else{
    const groupingPoliticalName =ref(userConfig.userData.groupingPolitical.name)
    const groupingPoliticalId =ref(userConfig.userData.groupingPolitical.id)

    if(groupingPoliticalName && groupingPoliticalId){
      formDisabled.value = true
      form.value = {
        coalitionCode:groupingPoliticalId,
        groupingPoliticalName:groupingPoliticalName,
      }
    }
  }

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
    <VBreadcrumbs :items="[ t('coalitions.breadcrumbs.listhome')]" />
    <VCard class="mb-5">
      <VForm ref="refForm" class="mb-4" @submit.prevent="getCoalitions">
        <VCardText>
          <VRow class="mb-2">
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.coalitionCode"
                :disabled="formDisabled"
                clearable
                :label="t('coalitions.code_grouping_political_type')"
                :placeholder="t('coalitions.code_grouping_political_type')"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.groupingPoliticalName"
                :disabled="formDisabled"
                clearable
                :label="t('coalitions.form.grouping_political_name')"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.trim="form.coalitionName"
               
                :label="t('coalitions.form.coalition_name')"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="text-start d-flex gap-4">
          <VBtn :loading="isLoading" type="submit">
            {{ t('coalitions.btn_search') }}
          </VBtn>
          <VBtn color="secondary" @click="cleanFields">
            {{ t('coalitions.btn_clear') }}
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
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
                  Agrupaciones pertenecientes a la coalición
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
name: "list-coalitions-grouping"
meta:
  authRequired: true
</route>
