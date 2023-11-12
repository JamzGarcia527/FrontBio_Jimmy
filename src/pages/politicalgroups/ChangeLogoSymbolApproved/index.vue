<script setup>
import ChangeVoteFilter from '@/components/politicalgroups/changeLogoSymbolApproved/changelogosymbolApprovedFilter.vue'
import ChangeVoteFilter2 from '@/components/politicalgroups/changeLogoSymbolApproved/logo/LogoSymbolComponent.vue'
import { useI18n } from "vue-i18n"

const formDisabled = ref(false)
const items = ref({})

const { t } = useI18n()

const filters = ref([])
const showData = ref(false)
const groupingPoliticalId = ref(null)
const groupingPoliticalTypeId = ref(null)
const logoHash = ref(null)
const logoStatus = ref(null)
const isLoading = ref(false)

const file = ref()
const disabledFileInput = ref(false)

const inputActive = async ()=>{
  disabledFileInput.value = true
}

const handlerSearchFilter = async value => {

  showData.value = true

  const { data } = value
  const filteredData = data.find(item => item.idGroupingPolitical === value.idGroupingPolitical)

  groupingPoliticalId.value = filteredData?.idGroupingPolitical
  groupingPoliticalTypeId.value = filteredData?.groupinPoliticalTypeId
  logoHash.value = filteredData?.hashLogo
  logoStatus.value = filteredData?.statusLogo
}

const handlerChange = () => {
  showData.value = false
  groupingPoliticalId.value = null
  groupingPoliticalTypeId.value = null
  logoHash.value = null
  logoStatus.value = null
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), 'Modificar Logo o Símbolo' ]" /> 
    <ChangeVoteFilter class="mb-4" @next="handlerSearchFilter" @change="handlerChange" />
    <div v-if="showData">
      <ChangeVoteFilter2 
        :grouping-political-id="groupingPoliticalId"
        :grouping-political-type="groupingPoliticalTypeId"
        :has-logo="Boolean(hashLogo)"
        :status="logoStatus"
      />
    </div>    
  </div>
</template>

<route lang="yaml">
name: "change-logo-symbol-approved"
meta:
  authRequired: true
</route>
