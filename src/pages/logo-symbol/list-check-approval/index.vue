<script setup>
import Filter from '@/components/logo-symbol/list-check-approval/Filter.vue'
import DataTableServerSide from '@/components/shared/DataTableServerSide.vue'
import axios from '@/plugins/axios'
import Swal from "@/plugins/sweetalert2"

const fields = ref([
  { key: 'groupingPoliticalName', label: 'Nombre de la agrupación política'.toUpperCase() },
  { key: 'donwloadLogo', label: 'Logo o símbolo'.toUpperCase(), thClass: 'text-center' },
  { key: 'compliance', label: 'Cumplimiento'.toUpperCase(), thClass: 'text-center' },
])

const filters = ref({})
const endpoint = '/v1/grouping-political-logo/check-logo'
const isDownloadingLogo = ref({})

// Methods and functions
const handlerFilter = value => {

  const { department, municipality, commune, corporationId, circunscriptionId, isBlankVotePromote, groupingPoliticalTypeId, groupingPoliticalId,
  } = value

  let queryParams = {
    groupingPoliticalTypeId: groupingPoliticalTypeId,
    groupingPoliticalId,
    blankVotePromoter: isBlankVotePromote,
    corporationId,
    circunscriptionId,
    department,
    municipality,
    commune,
  }
  filters.value = queryParams
}

const handlerDownloadLogo = async id => {
  const link = document.createElement('a')
  try {
    isDownloadingLogo.value = { [id]: true }

    const { data } = await axios.get(`/v1/files/grouping-political-logo/${id}`, { responseType: "blob" })

    link.href = window.URL.createObjectURL(data)
    link.setAttribute("download", `${id}.jpg`)
    document.body.appendChild(link)
    link.click() 
  } catch (error) {
    
  } finally {
    // remove element and urlobject
    link.remove()

    isDownloadingLogo.value = { [id]: false }
  }
}
</script>

<template>
  <div>
    <Filter 
      class="mb-2"
      @next="handlerFilter"
    />
    <DataTableServerSide :params="filters" :endpoint="endpoint" :fields="fields">
      <template #cell(groupingPoliticalName)="{ item }">
        {{ item.groupingPoliticalId }} - {{ item.groupingPoliticalName }}
      </template>
      <template #cell(donwloadLogo)="{ item }">
        <div class="d-flex justify-center">
          <VBtn
            variant="text"
            color="secondary"
            :loading="isDownloadingLogo[item.groupingPoliticalId]"
            @click="handlerDownloadLogo(item.groupingPoliticalId)"
          >
            <VTooltip
              activator="parent"
              location="top"
            >
              Descargar logo o símbolo
            </VTooltip>
            <VIcon size="33" icon="tabler-download" />
          </VBtn>
        </div>
      </template>
      <template #cell(compliance)="{ value, item }">
        <div class="d-flex justify-center">
          <div>
            <VRadioGroup 
              disabled
              :model-value="value" inline 
            >
              <VRadio label="Aprobado" :value="item.status === 1 ? value : 1" />
              <VRadio label="No aprobado" :value="item.status === -1 ? value : 0" />
            </VRadioGroup>
          </div>
        </div>
      </template>
    </DataTableServerSide>
  </div>
</template>

<route lang="yaml">
name: "logo-list-check-approval"
meta:
authRequired: true
</route>

