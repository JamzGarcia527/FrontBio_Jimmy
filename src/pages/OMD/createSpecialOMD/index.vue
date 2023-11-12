<script setup>
import FilterOMD from '@/components/OMD/createSpecialOMDFilter.vue'
import useEventBus from '@/utils/eventBus'
import { useI18n } from "vue-i18n"
import CreateSpecialOMDRevokeCandidate from './createSpecialOMDRevokeCandidate/index.vue'
import CreateSpecialOMDWithdrawCandidate from './createSpecialOMDWithdrawCandidate/index.vue'
import CreateSpecialOMDAddCandidate from './createSpecialOMDAddCandidate/index.vue'

const { t } = useI18n()

// import FileUpload from './components/uploadFile.vue'

const { bus } = useEventBus()
const filters = ref([])
const typeOfAction = ref(0)

const handlerSearchFilter = value => {
  filters.value = value
  typeOfAction.value = value.typeApproveRadios

}

watch(() => bus.value.get('omdReverse'), () => {
  typeOfAction.value = 0
})
watch(() => bus.value.get('claeCheckbox'), () => {
  typeOfAction.value = 0
})
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ t('OMD.group_political.breadcrumbs'), t('OMD.change_data_group_political.CreateOMDEspecial') ]" />
      <FilterOMD class="mb-4" @search="handlerSearchFilter" />
      <CreateSpecialOMDRevokeCandidate v-if="typeOfAction == 1" :params="filters" />
      <CreateSpecialOMDWithdrawCandidate v-if="typeOfAction == 2" :params="filters" />
      <CreateSpecialOMDAddCandidate v-if="typeOfAction == 3" :params="filters" />
    </div>
  </div>
</template>


<route lang="yaml">
name: "create-special-OMD"
meta:
authRequired: true
</route>
