<script setup>
import DialogNotes from '@/components/preinscription/DialogNotes.vue'
import Filter from '@/components/politicalgroups/Filter.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from 'vue-i18n'
import DataTable from '@/components/shared/DataTable.vue'
import { useCustomMessage } from "@/composables/useCustomMessage"

const { t } = useI18n()

const filtersControls = reactive({ loading: false, disabled: false })

const fields = ref([
  { key: 'id', label: t("common.code") },
  { key: 'name', label: t("common.grouping_political_name") },
  { key: 'type', label: t("common.grouping_political_type") },
  { key: 'email', label: t("user.email") },
  { key: 'phoneCelular', label: t("common.celular_phone") },
  { key: 'phone', label: t("common.phone") },
  { key: 'state', label: t("preinscription.grouping_political.state") },
  { key: 'mod', label: t("common.btn_edit") },
])

const items = ref([])
const firstLoad = ref(false)
const messageComposable = useCustomMessage()
const valueBtn = ref()

const modificar = btn => {
}

// List all registrations according to search filters || Argenedis Alvarez 28-02-2023
const getGroups = async value => {
  const requestBody = {
    "filter": value.filter.value,
    "description": value.description.value,
  }

  try {
    filtersControls.loading = true

    const { data } = await axios.get('/grouping-political', { params: requestBody })

    items.value = data
    
    filtersControls.loading = false
    firstLoad.value = true
    
    return true

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0017"),
      })
    }
    
    return false
  }
}
</script>

<template>
  <div>
    <VBreadcrumbs :items="[ $t('common.home'), t('modifyUserLimit.title'), t('modifyUserLimit.manage_political_grouping')]" />
    <DialogNotes v-model="notesShowDialog" :notes="notes" @closed="handleClosedNotes" />
    <Filter 
      :loading="filtersControls.loading" 
      :disabled="filtersControls.disabled" 
      class="mb-4"
      @next="getGroups" 
    />

    <VBtn
      :to="{ name: 'political-groups-create'}"
      class="mb-4"
    >
      Crear Agrupación Política
    </VBtn>

    <!-- <TablePoliticalGroups/> -->
    <VCard v-if="firstLoad">
      <DataTable :items="items" :fields="fields" paginate>
        <template #cell(state)="{ item }">
          <div class="text-center">
            <VChip label :color="item.state == 'A' ? 'success' : 'error'">
              {{ item.state == 'A' ? t("user.status") : t("user.inactive") }}
            </VChip>
          </div>
        </template>
        <template #cell(mod)="{ item }">
          <VBtn
            class="text-center"
            icon="mdi-square-edit-outline"
            variant="text"
            color="secondary"
            :to="{ name: 'political-groups-update', params: {id: item.id} }"
          />
          <!-- <VBtn @click="modificar(item.id)">Editar</VBtn> -->
        </template>
      </DataTable>
    </VCard>
  </div>
</template>

<route lang="yaml">
  name: "list-political-groups"
  meta:
  authRequired: true
</route>
