<script setup>
import { useI18n } from "vue-i18n"
import axios from "@/plugins/axios"
import Swal from '@/plugins/sweetalert2'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useCustomMessage } from "@/composables/useCustomMessage"

//Global Variables
const formFilter = ref({})
const selectRole = ref(null)
const menuUnassigned = ref([])
const menuAssigned = ref([])  
const { can } = useAppAbility()
const showView = ref(false)
const messageComposable = useCustomMessage()

// Translate i18n
const { t } = useI18n()

//Select
const roles = ref([])
const rolCodeExc = ['ROOT', 'SA', 'REDIS', 'REAX', 'REES', 'REMU']

// Get roles
const getRoles = () => {
  axios.get('/v1/role').then(({ data }) => {
    roles.value = data
  })
}

const roleList = computed(() => {
  const items = roles.value
    .flatMap(e => rolCodeExc.includes(e.code) ? [] : { title: e.name, code: e.code, value: e.id })

  return [
    { title: t('common.select_one_option'), value: -1, disabled: true },
    ...items,
  ]
})

const methodChangeSelect = value =>{
  selectRole.value = value.roleId
  listMenu()
}

const fixMenuItem = value => {
  return value
    .filter(e => {
      if (e.route == null && Array.isArray(e.menuChildren))
        return e.menuChildren.some(a => a.route != 'blank')
      
      return e.route != 'blank'
    }).map(e => {
      if (Array.isArray(e.menuChildren)) 
        e.menuChildren = fixMenuItem(e.menuChildren)

      return e
    })
}

const listMenu = function (){
  axios.get(`v1/role/menu/${selectRole.value}`).then(async response => {
    const { menuAvailable, menuNotAvailable } = response.data

    menuAssigned.value = fixMenuItem(menuAvailable)
    menuUnassigned.value = fixMenuItem(menuNotAvailable)
  })
}

const updateItemsMenu = () => {
  Swal.fire({
    text: `¿Está seguro que desea realizar estos cambios?`,
    icon: "question",
    customClass: { confirmButton: "btn btn-danger" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {

        const modelIdsMenuUpdate = buildModelUpdate()
        const modelCompletUpdateMenu = { "menuIds": modelIdsMenuUpdate }

        axios.put(`v1/role/menu/${selectRole.value}`, modelCompletUpdateMenu).then(response => {
          if(response.status == 200){
            listMenu()
            Swal.fire({ title: messageComposable.get("MS0023"), icon:"success" })  
          }
        })
        
        return true
      } catch (error) {
        let message = messageComposable.get("MS0024")
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        throw error

        return false
      }
    },
  })
}

const buildModelUpdate = () =>{
  const listReturnIdsMenu = ref([])

  menuAssigned.value
    .forEach(a => {
      if (Array.isArray(a.menuChildren)) {
        const resultMapReturnsId = a.menuChildren
          .filter(e => !e.selected)
          .map(e => e.id)
  
        listReturnIdsMenu.value = listReturnIdsMenu.value.concat(resultMapReturnsId)
      } else if (a.route && !a.selected) {
        listReturnIdsMenu.value.push(a.id)
      }
    })

  menuUnassigned.value
    .forEach(a => {
      if (Array.isArray(a.menuChildren)) {
        const resultMapReturnsId = a.menuChildren
          .filter(e => e.selected === true)
          .map(e => e.id)

        listReturnIdsMenu.value = listReturnIdsMenu.value.concat(resultMapReturnsId)
      } else if (a.route && a.selected) {
        listReturnIdsMenu.value.push(a.id)
      }
    })

  return listReturnIdsMenu.value
}

const msnPhases = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}

onMounted(() => {
  if(can('get', 'role-menu')){
    showView.value = true
    getRoles()
  }else{
    showView.value = false
    msnPhases(t('permissions_profiles.warning_permissions'), "warning")
  }
})
</script>

<template>
  <div>
    <div v-if="showView" class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), t('permissions_profiles.administration'), t('permissions_profiles.permission_assignment') ]" />
      <VCard :title="t('permissions_profiles.page_title')">
        <VCardTitle>
          <hr>
        </VCardTitle>
        <VRow>
          <VRow class="pa-12 py-11">
            <VCol cols="12" md="12">
              <VRow justify="center">
                <VCol cols="11" md="11" class="py-5">
                  <VSelect
                    v-model="formFilter.roleId" 
                    :items="roleList" 
                    prepend-inner-icon="tabler-filter" 
                    :label="t('permissions_profiles.search_profiles')"
                    @update:model-value="methodChangeSelect(formFilter)"
                  />
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VRow>
        <VRow>
          <VCol cols="12" md="12">
            <VCard>
              <VCardText>
                <VForm ref="form">
                  <VRow style="overflow: auto;flex-grow: 1;">
                    <VCol cols="12" md="6">
                      <p class="font-weight-bold text-center">
                        {{ t('permissions_profiles.unassigned_menu') }}
                      </p>
                      <VCard variant="outlined" style=" display: flex !important; flex-direction: column;block-size: 430px;">
                        <VCol cols="12" md="12" style="overflow: auto;flex-grow: 1;">
                          <div
                            v-for="(reco, index) in menuUnassigned" 
                            :key="index"
                          > 
                            <template v-if="Array.isArray(reco.menuChildren)">
                              <p class="font-weight-bold px-1">
                                <VIcon icon="mdi-circle-medium" size="small" />
                                {{ reco.title }}
                              </p>  
                              <div>
                                <VCheckbox
                                  v-for="(item, key) in reco.menuChildren"
                                  :key="item['id']"
                                  v-model="reco.menuChildren[key]['selected']"
                                  class="px-5"
                                  :label="item['title']"
                                  color="info"
                                />
                              </div>
                            </template>
                            <template v-else-if="reco.route">
                              <VCheckbox
                                v-model="reco['selected']"
                                class="px-5"
                                :label="reco['title']"
                                color="info"
                              />
                            </template>
                            <br>
                          </div>
                        </VCol>
                      </VCard>
                    </VCol>    
                    <VCol cols="12" md="6">
                      <p class="font-weight-bold text-center">
                        {{ t('permissions_profiles.assigned_menu') }}
                      </p>
                      <VCard variant="outlined" style=" display: flex !important; flex-direction: column;block-size: 430px;">
                        <VCol cols="12" md="12" style="overflow: auto;flex-grow: 1;">
                          <div
                            v-for="(reco, index) in menuAssigned" 
                            :key="index"
                          > 
                            <template v-if="Array.isArray(reco.menuChildren)">
                              <p class="font-weight-bold px-1">
                                <VIcon icon="mdi-circle-medium" size="small" />
                                {{ reco.title }}
                              </p>
                              <div>
                                <VCheckbox
                                  v-for="(item, key) in reco.menuChildren"
                                  :key="item['id']"
                                  v-model="reco.menuChildren[key]['selected']"
                                  class="px-5"
                                  :label="item['title']"
                                />
                              </div>
                            </template>
                            <template v-else-if="reco.route">
                              <VCheckbox
                                v-model="reco['selected']"
                                class="px-5"
                                :label="reco['title']"
                                color="info"
                              />
                            </template>
                            <br>
                          </div>
                        </VCol>
                      </VCard>
                    </VCol>      
                    <VBtn
                      style="margin-top: -25%;margin-left: 48%;"
                      relative
                      color="info"
                      icon="mdi-swap-horizontal"
                      @click="updateItemsMenu"
                    />
                  </VRow>
                </VForm>
              </VCardText>
              <UsersTable />
            </VCard>  
          </VCol>
        </VRow>
      </VCard>    
    </div>
  </div>
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>

<route lang="yaml">
name: "permission-assignment"
meta:
  authRequired: true
</route>
