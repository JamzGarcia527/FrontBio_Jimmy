<script setup>
import DataTable from '@/components/shared/DataTable.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from 'vue-i18n'
import { useCustomMessage } from "@/composables/useCustomMessage"

const props = defineProps({
  groupingPoliticalId: { type: Number, required: true },
})

const { t } = useI18n()
const items = ref([])
const isLoading = ref(true)
const messageComposable = useCustomMessage()

const fields = ref([
  { key: "dni", label: t('committeeMembers.dni').toUpperCase() },
  { key: "fullname", label: t('committeeMembers.full_name').toUpperCase() },
  { key: 'email', label: t('committeeMembers.email').toUpperCase() },
  { key: "cellPhone", label: t('committeeMembers.cell_phone').toUpperCase() },
  { key: "phone", label: t('committeeMembers.local_phone').toUpperCase() },
])

const getCommitteeMembersByIdInscription = async () => {
  try {
    const { data } = await axios.get(`/v1/inscriptions/${props.groupingPoliticalId}/committee-members`)

    items.value = data
    isLoading.value = false
    
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      
      const { message } = error.response.data
      
      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
  } finally {
    isLoading.value = false
  }
}
 
onMounted(() => {
  getCommitteeMembersByIdInscription()
})
</script>

<template>
  <div>
    <div class="demo-space-y mb-5">
      <VAlert
        icon="tabler-alert-circle"
        variant="tonal" 
        prominent
        type="warning"
      >
        {{ messageComposable.get("MS0005") }}
      </VAlert> 
    </div>
    <VCard v-if="!isLoading">
      <DataTable :items="items" :fields="fields" paginate>
        <template #cell(fullname)="{ item }">
          {{ item.firstName }}  
          {{ item.secondName }}  
          {{ item.firstSurName }}  
          {{ item.secondSurName }}  
        </template>
      </DataTable>
    </Vcard>
    <VCol v-if="isLoading" cols="12">
      <div class="text-center py-10">
        <VProgressCircular size="50" indeterminate />
      </div>
    </VCol>
  </div>
</template>
