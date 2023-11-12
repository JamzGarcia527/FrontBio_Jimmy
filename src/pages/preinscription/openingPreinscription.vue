<script setup>
import { useI18n } from "vue-i18n"
import axios from "@/plugins/axios"
import PhasesCandidates from "@/components/preinscription/opening/phasesCandidates.vue"
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import Swal from "@/plugins/sweetalert2"
import useEventBus from '@/utils/eventBus'

// Translate i18n
const { t } = useI18n()

const { can } = useAppAbility()
const { bus } = useEventBus()

const formFilter = ref({})
const filters = ref({})
const showView = ref(false)

//Select
const roleList = ref([{ title: t('common.select_one_option'), value: -1 }])

const getRoles = () => {
  axios.get('/v1/role').then(({ data }) => {
    const items = data.map(e => {
      return { title: e.name, value: e.id }
    })

    roleList.value = [
      { title: t('common.select_one_option'), value: -1, disabled: true },
      ...items,
    ]
  })
}

//DataTable
const datatable = ref(null)

const fields = ref([
  { key: "dni", label: t('opening_preinscription.user_code') },
  { key: "fullName", label: t('opening_preinscription.username') },
  { key: "roleName", label: t('opening_preinscription.profile') },
  { key: "initialDateSix", label: t('opening_preinscription.opening_e6') },
  { key: 'finalDateSix', label: t('opening_preinscription.closing_e6') },
  { key: "initialDateSeven", label: t('opening_preinscription.opening_e7') },
  { key: 'finalDateSeven', label: t('opening_preinscription.closing_e7') },
  { key: "change_dates", label: t('opening_preinscription.change_dates') },
])

const filterUser = () => {
  filters.value = { ...formFilter.value }
}

const msnPhases = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}

onMounted(() => {

  if(can('get', 'phases-user')){
    showView.value = true
    getRoles()
  }else{
    showView.value = false
    msnPhases(t('opening_preinscription.warning_opening'), "warning")
  }
})

watch(() => bus.value.get('updatePhasesCandidates'), () => {
  filterUser()
})
</script>

<template>
  <div>
    <div>
      <VBreadcrumbs :items="[ t('opening_preinscription.breadcrumbs.title'), t('opening_preinscription.breadcrumbs.item_one') ]" />
      <PhasesCandidates />
      <VRow>
        <VCol cols="12" md="12">
          <VCard>
            <VCardText>
              <VForm ref="form">
                <VRow class="pa-3">
                  <VCol cols="12" md="3">
                    <VTextField v-model="formFilter.dni" prepend-inner-icon="tabler-filter" :label="t('opening_preinscription.user_code')" />
                  </VCol>
                  <VCol cols="12" md="3">
                    <VTextField v-model="formFilter.fullName" prepend-inner-icon="tabler-filter" :label="t('opening_preinscription.username')" />
                  </VCol>
                  <VCol cols="12" md="3">
                    <VSelect v-model="formFilter.roleId" :items="roleList" prepend-inner-icon="tabler-filter" :label="t('opening_preinscription.profile')" />
                  </VCol>
                  <VCol cols="12" md="3 ">
                    <VBtn block @click="filterUser">
                      {{ t('opening_preinscription.search_user') }}
                      <VIcon end icon="mdi-magnify" size="22" />
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
            <VRow class="pa-3">
              <VCol cols="12" md="12">
                <DataTableServerSide
                  ref="datatable"
                  endpoint="/v1/phases-user/list-filter"      
                  :params="filters"
                  :fields="fields"
                >
                  <template #cell(roleName)="{ item }">
                    <div>
                      {{ item.roleName }} <br>
                      <small class="text-muted">
                        {{ item.divipol }}
                      </small>
                    </div>
                  </template>
                  <template #cell(change_dates)="{ item }">
                    <div class="text-center">
                      <VBtn
                        class="text-center"
                        icon="mdi-calendar-edit-outline"
                        variant="text"
                        color="secondary"
                        :to="{ name: 'phases-edit-id', params: {id: item.userId} }"
                      />
                    </div>
                  </template>
                </DataTableServerSide>
              </VCol>
            </VRow>
          </VCard>  
        </VCol>
      </VRow>
    </div>
  </div>
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>

<route lang="yaml">
name: "phases-opening"
meta:
  authRequired: true
</route>
