<script setup>
import DataTable from "@/components/shared/DataTable.vue"
import { onMounted } from 'vue'
import Swal from "@/plugins/sweetalert2"
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  dialogIsVisible: { type: Boolean, required: true },
})

const emit = defineEmits(['closeModal'])
const { t } = useI18n()
const items = ref([])
const viewDialogCandidates = computed(() => props.dialogIsVisible)

const fields = ref([
  { key: 'dni', label: t('logo_symbol.generate_approval.tableCandidates.dni'), thClass: 'text-center' },
  { key: 'fullName', label: t('logo_symbol.generate_approval.tableCandidates.fullName') },
  { key: 'email', label: t('logo_symbol.generate_approval.tableCandidates.email') },
  { key: 'gender', label: t('logo_symbol.generate_approval.tableCandidates.gender'), thClass: 'text-center' },
])

const getCandidateLists = async () => {
  try {
    const data = await axios.get(`/v1/candidates/list/${props.inscriptionId}`)

    items.value = data.data
  } catch (error) {
    if (error.response && error.response.status <= 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message || t('assign_random_position.swal.not_operation') })
      
      return false
    }
  }
}

const closeDialog = () => {
  emit('closeModal')
}

onMounted(async () => {
  await getCandidateLists()
})
</script>

<template>
  <div>
    <VDialog
      v-model="viewDialogCandidates"
      width="1500"
      persistent
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="closeDialog" />

      <!-- Dialog Content -->
      <VCard>
        <VCardText class="text-center">
          <DataTable :items="items" :fields="fields">
            <template #cell(fullName)="{ item }">
              <div class="d-flex justify-start">
                {{ item.firstname }} {{ item.secondname }} {{ item.firstsurname }} {{ item.secondsurname }}
              </div>
            </template>
            <template #cell(email)="{ item }">
              <div class="d-flex justify-start">
                {{ item.email }}
              </div>
            </template>
          </DataTable>
        </VCardText>
      </VCard>
    </VDialog>
  </div>  
</template>

