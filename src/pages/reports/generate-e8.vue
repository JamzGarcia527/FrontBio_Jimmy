<script setup>
import Filters from "@/components/reports/generateE8/Filters.vue"
import DataTableServerSide from "@/components/reports/generateE8/DataTableServerSide.vue"
import Card from "@/components/shared/Card.vue"
import { reactive } from "vue"
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import useEventBus from "@/utils/eventBus"
import { useAppAbility } from "@/plugins/casl/useAppAbility"
import axios from "@/plugins/axios"

const { t } = useI18n()
const { can } = useAppAbility()
const { emit: emiting } = useEventBus()

const params = reactive({
  corporationId: -1,
  circunscriptionId: -1,
})

const fields = ref([
  { key: 'corporationName', label: t('common.corporation'), thClass: 'text-center' },
  { key: 'circunscriptionName', label: t('common.circunscription'), thClass: 'text-center' },
  { key: 'department', label: t('common.department'), thClass: 'text-center' },
  { key: 'municipality', label: t('common.municipality'), thClass: 'text-center' },
  { key: 'commune', label: t('common.commune'), thClass: 'text-center' },
  { key: 'groupingPoliticalName', label: t('common.grouping_political_name'), thClass: 'text-center' },
  { key: 'groupingPoliticalTypeName', label: t('common.grouping_political_type'), thClass: 'text-center' },
  { key: 'check', label: 'Seleccionar Formulario E8', thClass: 'text-center' },
])

const showTable = ref(false)
const disabled = ref(false)
const loading = ref(false)
const all = ref(false)
const datatable = ref(null)

const search = selected => {
  if(!can('get-pending-to-create', 'inscription-final')) {
    Swal.fire({ icon: "warning", text: t('permissions_profiles.warning_permissions') })

    return
  }

  params.corporationId = selected.corporationId
  params.circunscriptionId = selected.circunscriptionId
  showTable.value = true
  all.value = false
  emiting('search', true)
}

const generateE8 = items => {
  if(!can('create', 'inscription-final')) {
    Swal.fire({ icon: "warning", text: t('permissions_profiles.warning_permissions') })

    return
  }

  const exist = items.some(e => e.check === true)
  
  if (exist) {
    const payload = {
      inscriptionsIds: items.flatMap(e => e.check === true ? e.id : []),
    } 

    disabled.value = true
    loading.value = true

    axios.post(`/v1/inscription-final`, payload)
      .then(() => {
        Swal.fire({ icon: "success", text: `Generación de E8 Exitosa` })

        all.value = false
        emiting('clearCheck', true)
        datatable.value.refresh()
      })
      .catch(error => {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
      })
      .finally(() => {
        disabled.value = false
        loading.value = false
      })
  } else {
    Swal.fire({ icon: "warning", text: "Para Generar E8 mínimo debe chequear una Agrupación Política" })
  }
}

const changeAll = () => {
  emiting('checkAll', all.value)
}
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), $t('supportingDocuments.breadcrumbs.title'), $t('generate_e8.title') ]" />

      <Filters 
        :subtitle="$t('generate_e8.title')" 
        readonly 
        @search="search" 
      />

      <Card
        v-if="showTable"
        class="mt-5" 
        :subtitle="$t('monitoring_political_groups.search_result')"
      >
        <VCardText class="text-center">
          <DataTableServerSide 
            ref="datatable"
            endpoint="/v1/inscription-final/pending-to-create" 
            :params="params" 
            :fields="fields" 
            :disabled="disabled"
            :loading="loading"
            table-class="table-bordered"
            @handler="generateE8"
          >          
            <template #v-thead>
              <tr>
                <th colspan="7" />
                <th class="text-center border">
                  Seleccionar Todos
                  <div class="d-flex justify-center">
                    <VCheckbox
                      v-model="all"
                      color="primary"
                      hide-details
                      @change="changeAll"
                    />
                  </div>
                </th>
              </tr>
            </template>

            <template #cell(check)="{ item }">
              <div class="d-flex justify-center">
                <VCheckbox
                  v-model="item.check"
                  color="primary"
                  hide-details
                />
              </div>
            </template>
          </DataTableServerSide>
        </VCardText>
      </Card>
    </div>
  </div>
</template>


<style lang="scss" scoped>
//
</style>

<route lang="yaml">
  name: "generate-e8"
  meta:
    authRequired: true
</route>