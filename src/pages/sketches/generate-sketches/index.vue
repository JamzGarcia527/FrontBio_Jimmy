<script setup>
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import GenerateSketches from '@/pages/sketches/generate-sketches/components/GenerateSketches.vue'
import DataTableServerSide from '@/pages/sketches/generate-sketches/components/DataTableServerSide.vue'

// Defining and initializing variables
const { t } = useI18n()
const filtersControls = reactive({ loading: false, disabled: false })
const endpoint = '/v1/card-sketch/list'
const datatable = ref(null)
const filters = ref({})
const isvisible = ref(false)

const fields = ref([
  { key: "corporationName", label: t('generate_sketches.table.corporation').toUpperCase() },
  { key: "department", label: t('generate_sketches.table.department').toUpperCase() },
  { key: "municipality", label: t('generate_sketches.table.municipality').toUpperCase() },
  { key: "commune", label: t('generate_sketches.table.commune').toUpperCase() },
  { key: "totalGroupingPolitical", label: t('generate_sketches.table.totalGroupingPolitical').toUpperCase(), thClass: 'text-center' },
  { key: "totalMissingGenerateE8", label: t('generate_sketches.table.totalMissingGenerateE8').toUpperCase(), thClass: 'text-center' },
  { key: "totalRaffledGroupings", label: t('generate_sketches.table.totalRaffledGroupings').toUpperCase(), thClass: 'text-center' },
])

// Methods and functions
const handlerGenerateSketches = async value => {
  const { corporationId, circunscriptionId, department, municipality, commune } = value
  let requestBody = { corporationId, circunscriptionId, department, municipality, commune }

  await Swal.fire({
    text: t('generate_sketches.swal.info_noPhoto'),
    icon: "info",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: 'Cancelar',
    confirmButtonText: 'Aceptar',
    showLoaderOnConfirm: true,
    
    preConfirm: async () => {
      filtersControls.loading = true
      filtersControls.disabled = true
      try {
        const { status } = await axios.post('/v1/card-sketch/create', requestBody)
    
        if (status === 201) {
          filters.value = requestBody
          isvisible.value = true
          await Swal.fire({
            icon: 'success',
            text: t('generate_sketches.swal.msg_success_generate'),
          })
        }
      } catch (error) {
        if (error.response && error.response.status != 500 || error.response.status === 500) {      
          const { message } = error.response.data
    
          await Swal.fire({
            icon: "warning",
            text: message || t('common.not_operation'),
          })
        }
    
        return false
      } finally {
        filtersControls.loading = false
        filtersControls.disabled = false
        datatable.value.refresh()
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })

}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ t('generate_sketches.breadcrumbs.title'), t('generate_sketches.breadcrumbs.page')]" />
    <GenerateSketches
      :disabled="filtersControls.disabled" 
      :loading="filtersControls.loading" 
      class="mb-4"
      @generate-sketches="handlerGenerateSketches"
    />
    <p v-if="isvisible" class="font-weight-normal">
      {{ t("generate_sketches.e8_info") }}
    </p>
    <VDivider v-if="isvisible" class="mb-5" />
    <DataTableServerSide v-if="isvisible" ref="datatable" :params="filters" :fields="fields" :endpoint="endpoint">
      <template #cell(totalGroupingPolitical)="{item}">
        <div class="d-flex justify-center">
          {{ item.totalGroupingPolitical }}
        </div>  
      </template>
      <template #cell(totalMissingGenerateE8)="{item}">
        <div class="d-flex justify-center">
          {{ item.totalMissingGenerateE8 }}
        </div>  
      </template>
      <template #cell(totalRaffledGroupings)="{item}">
        <div class="d-flex justify-center">
          {{ item.totalRaffledGroupings }}
        </div>  
      </template>
    </DataTableServerSide>
  </div>  
</template>

<route lang="yaml">
name: "sketches-generate"
meta:
authRequired: true
</route>
