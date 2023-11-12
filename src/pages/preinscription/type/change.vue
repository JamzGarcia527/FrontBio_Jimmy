
<script setup>
import { useI18n } from "vue-i18n"
import DialogNotes from '@/components/preinscription/DialogNotes.vue'
import GeneralFilter from '@/components/inscriptionType/GeneralFilter.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import DataTable from '@/components/shared/DataTable.vue'

const filtersControls = reactive({ loading: false, disabled: false })
const { t } = useI18n()

const fields = ref([
  { key: 'groupingPoliticalName', label:  t('common.grouping_political_name').toUpperCase() },
  { key: 'corporationName', label: t('common.corporation').toUpperCase() },
  { key: 'circunscriptionName', label:t('common.circunscription').toUpperCase() },
  { key: 'department', label: t('common.department').toUpperCase() },
  { key: 'municipality', label: t('common.municipality').toUpperCase()  },
  { key: 'commune', label: t('common.commune').toUpperCase() },
  { key: 'inscriptionTypeId', label:t('common.inscription_type').toUpperCase() },
])

const items = ref([])

const changeInscriptionType = async (inscriptionId, value) => {
  const requestBody = {
    "inscriptionType": value,
  }

  try {

    await axios.put(`/v1/inscriptions/inscription/${inscriptionId}`, requestBody)

    const item = items.value.find(e => e.id == inscriptionId)

    if (item) item.inscriptionTypeId = value

    // TODO: Pasar los mensajes por el i18n
    await Swal.fire({
      icon: 'success',
      text: 'Cambio aplicado correctamente',
    })
    
    return true
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
    
    return false
  }

}

// List all registrations according to search filters || Argenedis Alvarez 28-02-2023
const getInscriptions = async value => { 
  
  const requestBody = {
    "corporationId": value.corporationId,
    "circunscriptionId": value.circunscriptionId,
    "groupingPoliticalTypeId": value.groupingPoliticalTypeId,
    "groupingPoliticalId": value.groupingPoliticalId,
    "department": value.department,
    "municipality": value.municipality,
    "commune": value.commune,
    "inscriptionType": value.inscriptionTypeId,
    "blankVotePromoter": value.isBlankVotePromote,
  }

  try {
    filtersControls.loading = true

    const { data } = await axios.get('/v1/inscriptions/inscription', { params: requestBody })

    items.value = data
    
    filtersControls.loading = false
    
    return true

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || 'No existen inscripciones.',
      })
      filtersControls.loading = false
    }

    return false
  } finally {
    filtersControls.loading = false
  }

}
</script> 
  
<template>
  <div>
    <VCard class="mb-6">
      <DialogNotes v-model="notesShowDialog" :notes="notes" @closed="handleClosedNotes" />
      <GeneralFilter 
        :loading="filtersControls.loading" 
        :disabled="filtersControls.disabled" 
        @next="getInscriptions" 
      />
    </VCard>
    <VCard v-if="items.length != 0">
      <DataTable :items="items" :fields="fields" paginate>
        <template #cell(inscriptionTypeId)="{ value, item }">
          <VRadioGroup 
            :model-value="value" inline 
            @update:model-value="$event => changeInscriptionType(item.id, $event)"
          >
            <VRadio label="Virtual" :value="1" />
            <VRadio label="Manual" :value="2" />
          </VRadioGroup>
        </template>
      </DataTable>
    </VCard>
    <VCard v-else>
      <VAlert color="secondary">
        No hay registros para mostrar
      </VAlert>
    </VCard>
  </div>
</template>

<route lang="yaml">
name: "preinscription-type-change"
meta:
  authRequired: true
</route>
