<script setup>
import { useI18n } from "vue-i18n"
import Filter from "@/components/logo-symbol/approve/Filter.vue"
import GroupingPoliticalDetail from "@/components/logo-symbol/approve/GroupingPoliticalDetail.vue"
import axios from '@/plugins/axios'
import Swal from "@/plugins/sweetalert2"

// Definición e inicialización de variables
const { t } = useI18n()
const filtersControls = reactive({ loading: false, disabled: false })
const isVisible = ref(false)
const dataImg = ref(null)
const radicateId = ref(null)
const groupingPoliticalId = ref(null)
const inscriptionId = ref(null)

// Métodos o funciones
const handlerGetGroupingPoliticalMedia = async value => {
  const { groupingPoliticalId: id, radicate, inscriptionId: inscription, valid } = value
  try {
    filtersControls.disabled = true
    filtersControls.loading = true
    
    const { data } = await axios.get(`/v1/files/grouping-political-logo/${id}`, { responseType: "blob" })

    dataImg.value = window.URL.createObjectURL(data)
    radicateId.value = radicate
    groupingPoliticalId.value = id
    inscriptionId.value = inscription
    isVisible.value = valid
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: "warning",
        text: message || t('logo_symbol.generate_approval.swal.msg_no_logo'),
      })
      window.URL.revokeObjectURL(dataImg.value) 
      filtersControls.disabled = false
    }

    return false
  } finally {
    filtersControls.loading = false
  }
}

const handlerClearFormFilter = value => {
  if (value) isVisible.value = false
  dataImg.value = null
  window.URL.revokeObjectURL(dataImg.value)
  filtersControls.disabled = false
}

onUnmounted(() => {
  if (dataImg) {
    window.URL.revokeObjectURL(dataImg)
  }
})
</script>

<template>
  <div>
    <VBreadcrumbs
      :items="[ 
        t('logo_symbol.generate_approval.breadcrumbs.title'), 
        t('logo_symbol.generate_approval.breadcrumbs.page'), 
      ]"
    />
    <Filter 
      :disabled="filtersControls.disabled" 
      :loading="filtersControls.loading"
      class="mb-2"
      @next="handlerGetGroupingPoliticalMedia"
      @clear-form-filter="handlerClearFormFilter"
    />
    <GroupingPoliticalDetail 
      v-if="isVisible || dataImg" 
      :img="dataImg" 
      :grouping-political-id="groupingPoliticalId" 
      :inscription-id="inscriptionId"
    />
  </div>
</template>

<route lang="yaml">
name: "logo-symbol-approve"
meta:
authRequired: true
</route>
