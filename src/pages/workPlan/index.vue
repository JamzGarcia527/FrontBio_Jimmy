<script setup>
import Swal from "@/plugins/sweetalert2"
import axios from '@/plugins/axios'
import ModalWorkPlain from '@/components/workPlain/modalWorkPlain.vue'
import ModalWorkPlainEdit from "@/components/workPlain/modalWorkPlainEdit.vue"
import { reactive, ref } from 'vue'
import { useI18n } from "vue-i18n"
import DataTable from '@/components/shared/DataTable.vue'
import useEventBus from "@/utils/eventBus"

const { t } = useI18n()
const { emit: emiting } = useEventBus()
const { bus } = useEventBus()
const showModal = ref(false)
const isLoading = ref(false)
const editData = ref([])
const items = ref([])
const showModalEdit = ref(false)


// modal insert
const close = item => showModal.value = item
const open = () => showModal.value = true


const closeEdit = item => showModalEdit.value = item
const openEdit = () => showModalEdit.value = true


const fields = ref([
  { key: "item", label: t('tabSummary.fullname') },
  { key: "workPlanName", label: t('tabSummary.approveStatus') },
  { key: "actions", label: t('tabSummary.approveStatus') },
])
    
// metho
const onEditData = formEdit => {
  emiting('mostraData', true)
  showModalEdit.value = true 

  // Abrir el modal
  editData.value = formEdit // Asignar los datos a editData
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

const getData = async () => {
  try {
    await axios
      .get("workPlan/list")
      .then(response => {
        items.value = response.data

        console.log("data list", items.value)
      })
  } catch (error) {
    console.log(error)
  }  
}

watch(() => bus.value.get('getData1'), () => {
  console.log("en el watch")
  getData()
})

onMounted(() => {
  getData()
})
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
        <VCol cols="12" sm="12" md="12">
          <div class="rounded border border-primary">
            <DataTable :fields="fields" :items="items" style="width: 100%;">
              <template #cell(actions)="{ item }">
                <div class="d-flex justify-center">
                  <VBtn
                    class="text-center"
                    icon="tabler-edit"
                    variant="text"
                    color="secondary"
                    @click="onEditData(item)"
                  />
                </div>
              </template>
            </DataTable>
          </div>
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
      :show-modal="showModalEdit"
      :edit-data="editData"
      :is-loading="isLoading"
      @close-modal="closeEdit"
      @open-modal="openEdit"
    />
  </div>
</template>

<route lang="yaml">
name: "work-plan"
meta:
authRequired: true
</route>

