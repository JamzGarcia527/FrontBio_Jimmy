<script setup>
import Swal from "@/plugins/sweetalert2"
import axios from '@/plugins/axios'
import ModalWorkPlain from '@/components/workPlain/modalWorkPlain.vue'
import ModalWorkPlainEdit from '@/components/workPlain/modalWorkPlainEdit.vue'
import { ref } from 'vue'
import { useI18n } from "vue-i18n"
import TableLite from 'vue3-table-lite'

const searchTerm = ref("") 
const { t } = useI18n()
const showModal = ref(false)
const isLoading = ref(false)

// modal insert
const close = item => showModal.value = item
const open = () => showModal.value = true

const openEdit = () => showModalEdit.value = true
const closeEdit = item => showModalEdit.value = item

const editData = ref([])

const closeModal = () => {
  openModal.value = false
}

const dataRows = reactive([])
for (let i = 0; i < 20; i++) {
  dataRows.push({
    id: i,
    item: "item" + i,
    workPlain: "workPlain" + i + "@example.com",
  })
}

const  messages= {
  pagingInfo: "Mostrando {0}-{1} de {2}",
  pageSizeChangeLabel: "Mostrar :",
  gotoPageLabel: "Por Página, Actual:",
  noDataAvailable: "No hay datos para mostrar",
}
    

const table = reactive({
  isLoading: false,
  
  columns: [
    {
      label: "ITEM",
      field: "item",
      width: "3%",
      sortable: true,
      isKey: true,
    },
    {
      label: "Plan de Trabajo",
      field: "workPlain",
      width: "10%",
      sortable: true,
    },
    {
      label: "Acciones",
      field: "actions",
      width: "15%",
      sortable: true,
    },
  ],
  rows: computed(() => {
    return dataRows.filter(
      x =>
        x.item.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        x.workPlain.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }),
      
  totalRecordCount: computed(() => {
    return table.rows.length
  }),
  sortable: {
    order: "id",
    sort: "asc",
  },
  
})

// modal edit
const showModalEdit = ref(false)
const closeModalEdit = item => showModalEdit.value = item
const openModalEdit = () => showModalEdit.value = true

const closeModalEdition = () => {
  openModalEdit.value = false
}


const onCancelE7 = form => {
  // isLoading.value = true

  console.log("recibiendo en el padre", form)

  const formData = new FormData()

  formData.append("item", form.item)
  formData.append("workPlanName", form.workPlanName)
  
  console.log("form data", formData)


  axios.post('/workPlan/create', formData).then(() => {
    showModal.value = false
    isLoading.value = false

    Swal.fire({ 
      icon: "success", 
      text: t('tabSummary_e7.cancel.success_send'), 
    // eslint-disable-next-line promise/no-nesting
    }).then(() => {
      router.replace({ name: 'work-plain' })
    })  

  }).catch(error => {
    if (error.response && error.response.status <= 500) {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
    }
  }).finally(() => isLoading.value = false)
}

const resend = data => {
  // console.log("dio clic para abrir modal", data.value.id)

  showModalEdit.value = true

  editData.value = data.value

  console.log("editData", editData.value)
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('user.breadcrumbs.title'), t('user.breadcrumbs.work_plain') ]" />
    <VRow class="my-3 mx-1">
      <VSpacer />
      <VBtn color="secondary" @click="showModal = true">
        <VIcon
          start
          icon="tabler-user-plus"
        />
        {{ t('user.breadcrumbs.create_work_plain') }}
      </VBtn>
    </VRow>
    <VCard>
      <VRow>
        <VCol cols="12">
          <TableLite
            :is-slot-mode="1 === 1"
            :is-loading="table.isLoading"
            :columns="table.columns"
            :rows="table.rows"
            :total="table.totalRecordCount"
            :sortable="table.sortable"
            :is-static-mode="1===1"
            :messages="messages"
            @is-finished="table.isLoading = false"
          >
            <template #actions="data">
              <div class="d-flex justify-center">
                <VBtn
                  icon="tabler-edit"
                  variant="text"
                  color="secondary"
                  @click="resend(data)"
                />
              </div>
            </template>
          </TableLite>
        </VCol>
      </VRow>
    </VCard>
    <ModalWorkPlain
      :show-modal="showModal"
      :is-loading="isLoading"
      @close-modal="close" 
      @cancel-e7="onCancelE7"
      @open-modal="open"
    />
    <ModalWorkPlainEdit
      :show-modal-edit="showModalEdit"
      :is-loading="isLoading"
      :edit-data="editData" 
      @close-modal="closeEdit"
      @cancel-edit="onCancelE7"
      @open-modal="openEdit"
    />
  </div>
</template>

<route lang="yaml">
name: "work-plain"
meta:
authRequired: true
</route>

