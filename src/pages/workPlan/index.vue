<script setup>
import Swal from "@/plugins/sweetalert2"
import axios from '@/plugins/axios'
import ModalWorkPlain from '@/components/workPlain/modalWorkPlain.vue'
import ModalWorkPlainEdit from "@/components/workPlain/modalWorkPlainEdit.vue"
import ModalWorkPlanTaskList from "@/components/workPlain/modalWorkPlainTask.vue"
import { ref } from 'vue'
import { useI18n } from "vue-i18n"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import useEventBus from "@/utils/eventBus"

const { t } = useI18n()
const { emit: emiting } = useEventBus()
const { bus } = useEventBus()
const showModal = ref(false)
const isLoading = ref(false)
const editData = ref([])
const items = ref([])
const showModalEdit = ref(false)
const showModalEditList = ref(false)
const formData = ref({})
const itemId = ref(null)
const itemId11 = ref(false)
const endPointDataListWorkPlan = ref(`/workPlan/list`)
const datatable = ref(null)


// modal insert
const close = item => showModal.value = item
const open = () => showModal.value = true


const closeEdit = item => showModalEdit.value = item
const openEdit = () => showModalEdit.value = true

const closeEditList = item => showModalEditList.value = item
const openEditList = () => showModalEditList.value = true

const formClear = ref({
  item: null,
  workPlanName: null,
})

const fields = ref([
  { key: "item", label: t('workPlan.item') },
  { key: "workPlanName", label: t('workPlan.workPlanName') },
  { key: "companyName", label: t('workPlan.companyName') },
  { key: "actions", label: t('workPlan.actions') },
])
    
// methods
const onEditData = formEdit => {

  console.log("formEdit in father", formEdit)

  emiting('mostraData', true)
  showModalEdit.value = true  // Abrir el modal
  editData.value = formEdit // Asignar los datos a editData
}

const getSubmitWorkTask = dataSend => {
  console.log("getSubmitWorkTask dio clic", dataSend)
  console.log("showModalEditList.value", showModalEditList.value)
  showModalEditList.value = true  // Abrir el modal
  console.log("showModalEditList.value now", showModalEditList.value)
  
  itemId.value = dataSend
  console.log("itemId.value now", itemId.value)
  itemId11.value = true
}



const onCancelE7 = form => {

  console.log("form en el padre", form)

  isLoading.value = true

  formData.value = {
    "item":form.item,
    "workPlanName":form.workPlanName,
    "companyId":form.companyId,
  }

  axios.post('/workPlan/create', formData.value).then(() => {
    showModal.value = false
    isLoading.value = false
    
    Swal.fire({ 
      icon: "success", 
      text: t('tabSummary_e7.cancel.success_send'), 
    // eslint-disable-next-line promise/no-nesting
    }).then(() => {
      datatable.value.refresh()
      handlerReset()
      formData.value = {
        "item":null,
        "workPlanName":null,
      }
    })  

  }).catch(error => {
    if (error.response && error.response.status <= 500) {
      Swal.fire({ icon: "warning", text: "No fue posible ejecutar la acción, por favor contacte a la mesa de ayuda." })
    }
  }).finally(() => isLoading.value = false)
}

const mostraDataList = form => {
  emiting('mostraDataList', true)
  console.log("recibiendo data del hijo mostraDataList", form.value)
}

// // get data work plan 
// const getData = async () => {
//   try {
//     await axios
//       .get("workPlan/list")
//       .then(response => {
//         items.value = response.data
//       })
//   } catch (error) {
//     console.log(error)
//   }  
// }



const handlerReset = () => {
  Object.assign(formData, formClear)
}

watch(() => bus.value.get('getData1'), () => {
  datatable.value.refresh()
})

// onMounted(() => {
//   getData()
// })
</script>

<template>
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
          <DataTableServerSide 
            ref="datatable" 
            :empty-text="t('common.empty_table')" 
            :fields="fields" 
            :endpoint="endPointDataListWorkPlan"
          >
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
              <div class="d-flex justify-center">
                <VBtn
                  class="text-center"
                  icon="tabler-user"
                  variant="text"
                  color="secondary"
                  @click="getSubmitWorkTask(item.id)"
                />
              </div>
            </template>            
          </DataTableServerSide>
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
  <div v-if="itemId11">
    <ModalWorkPlanTaskList 
      :show-modal="showModalEditList"
      :item-id="itemId"  
      @mostra-data-list="mostraDataList" 
      @close-modal="closeEditList"
      @open-modal="openEditList"
    />
  </div>
</template>

<route lang="yaml">
name: "work-plan"
meta:
authRequired: true
</route>

