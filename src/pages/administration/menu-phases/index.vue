<script setup>
import axios from '@/plugins/axios'
import DataTable from '@/components/shared/DataTable.vue'
import { useI18n } from 'vue-i18n'
import Swal from '@/plugins/sweetalert2'


const { t } = useI18n()

const breadcrumbs = [
  t('common.home'), 
  t('menu_phases.breadcrumbs.module'),
  t('menu_phases.breadcrumbs.page_title'),
]

const isLoading = ref(false)
const isLoadingSave = ref(false)
const phases = ref([])
const menus = ref([])

function flattenTree(nodes, depth = 0) {
  return nodes
    .filter(node => !node.route || node.route != 'blank')
    .flatMap(node => {
      const { menuChildren: children, ...rest } = node
      const hasChildren = children && children.length > 0
      const hasRoute = Boolean(rest.route && !hasChildren)

      const pick = {
        id: rest.id,
        title: rest.title,
        outPhase: rest.outPhase,
        phases: rest.phases,
        hasRoute,
      }

      return [
        { depth, ...pick },
        ...(children ? flattenTree(children, depth + 1) : []),
      ]
    })
    
}

const getData = async () => {
  isLoading.value = true
  try {
    const { data } =  await axios.get('/v1/phase-menus')

    phases.value = data.phases
    menus.value = data.menus

    menus.value = flattenTree(data.menus)
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    } else {
      Swal.fire({ icon: 'warning', text: "No se pudo cargar elementos, por favor intente mas tarde."  })
    }
  }
  isLoading.value = false
}

const fieldsTable = computed(() => {
  const phasesColumns = phases.value.map(e => ({ key: e.name, label: e.name }))
  
  return [
    { key: 'title', label: 'Opciones de Menu' },
    { key: 'outphase', label: 'Fuera de fases' },
    ...phasesColumns,
  ]
})

const handlerSave = async () => {
  const requestBody = menus.value
    .filter(e => e.hasRoute)
    .map(e => ({ menuId: e.id, outPhase: !!e.outPhase, phases: [...e.phases] }))

  isLoadingSave.value = true
  try {
    await axios.post('/v1/phase-menus', { menus: requestBody })

    Swal.fire({ icon: 'success', text: "Configuración actualizada" })
  } catch (e) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    } else {
      Swal.fire({ icon: 'warning', text: "No se pudo cargar elementos, por favor intente mas tarde."  })
    }
  }
  isLoadingSave.value = false
}

onMounted(() => {
  getData()
})
</script>

<template>
  <div>
    <VBreadcrumbs :items="breadcrumbs" /> 
    <VCard>
      <DataTable 
        :fields="fieldsTable" 
        :items="menus" 
        :loading="isLoading"
      >
        <template #cell(title)="{ item, value }">
          <div 
            :class="{ 'font-weight-bold': !item.hasRoute }"
            :style="{ marginLeft: (item.depth || 0 ) * 20 + 'px' }"
          >
            {{ value }}
          </div>
        </template>

        <template #cell(outphase)="{ item }">
          <VCheckbox 
            v-if="item.hasRoute" 
            v-model="item.outPhase" 
            class="d-flex justify-center" 
          />
        </template>

        <template #cell(E6)="{ item }">
          <VCheckbox v-if="item.hasRoute" v-model="item.phases" :value="1" :disabled="item.outPhase" />
        </template>
        <template #cell(E7)="{ item }">
          <VCheckbox v-if="item.hasRoute" v-model="item.phases" :value="2" :disabled="item.outPhase" />
        </template>
        <template #cell(E8)="{ item }">
          <VCheckbox v-if="item.hasRoute" v-model="item.phases" :value="3" :disabled="item.outPhase" />
        </template>
      </DataTable>
      <template v-if="!isLoading">
        <VDivider />
        <VCardText class="text-center">
          <VBtn :loading="isLoadingSave" @click="handlerSave">
            {{ t('menu_phases.btn_save') }}
          </VBtn>
        </VCardText>
      </template>
    </VCard>
  </div>
</template>


<route lang="yaml">
  name: "administration-menu-phases"
  meta:
    authRequired: true
</route>
