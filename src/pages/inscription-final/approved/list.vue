<script setup>
import ReportFilter from '@/components/shared/ReportFilter.vue'
import GroupingPoliticalCard from '@/components/shared/GroupingPoliticalCard.vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

const router = useRouter()
const { t } = useI18n()

const params = ref({})
const page = ref(1)
const size = ref(10)

const payload = computed(() => ({
  page: page.value - 1,
  size: size.value,
  ...params.value,
}))

const getData = async payload => {
  try {
    const { data } = await axios.get('/v1/inscription-final/approve', { params: payload.value })
        
    return data
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
        
    throw new Error(error)
  }
}

const { isLoading, data } = useQuery(
  ['inscriptions-final-approved', payload], 
  () => getData(payload), {
    cacheTime: 1000 * 60 * 5,
    refetchOnReconnect: 'always',
    keepPreviousData: true,
    retry: false,
  },
)

const rows = computed(() => data.value?.content || [])

const pageable = computed(() => {
  const { content, pageable, ...result } = data.value || {}
      
  return result
})


const totalPages = computed(() => pageable.value.totalPages)

const handleSearchFilter = value => {
  const {
    department: department_id, 
    municipality: municipality_id, 
    commune: commune_id, 
    corporationId: corporation_id, 
    circunscriptionId: circunscription_id, 
    isBlankVotePromote: promoter_blank_vote, 
    groupingPoliticalTypeId: grouping_political_type_id, 
    groupingPoliticalId: grouping_political_id,
  } = value
  
  page.value = 1
  params.value = { 
    department_id,
    municipality_id,
    commune_id,
    corporation_id,
    circunscription_id,
    promoter_blank_vote,
    grouping_political_type_id,
    grouping_political_id,
  }
}

const handlerClickInsription = payload => {
  router.push({ name: "inscription-final-approved-e8", params: { id: payload.id } })
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('supportingDocuments.breadcrumbs.title'), $t('inscription_final.title_view') ]" />
    
    <ReportFilter 
      class="mb-4"
      text-button="Consultar"
      @search="handleSearchFilter" 
    />

    <VRow class="match-height">
      <VCol v-for="(item, index) in rows" :key="index" cols="12" sm="6" md="4">
        <GroupingPoliticalCard
          :id="item.id"
          :grouping-political-id="item.groupingPoliticalId"
          :title="item.groupingPoliticalName"
          :subtitle="item.groupingPoliticalTypeName"
          :corporation="item.corporationName"
          :circunscription="item.circunscriptionName"
          :divipole="item.divipolName"
          :has-logo="item.hasLogo"
          :is-blank-vote-promoter="Boolean(item.blankVotePromoter)"
          @click="handlerClickInsription"
        />
      </VCol>


      <VCol v-if="isLoading" cols="12">
        <div class="text-center py-10">
          <VProgressCircular size="50" indeterminate />
        </div>
      </VCol>
        
      <VCol v-else-if="rows.length == 0" cols="12">
        <div class="text-center py-10">
          {{ t('common.empty_table') }}
        </div>
      </VCol>

      <VCol v-if="rows.length > 0" cols="12">
        <VPagination
          v-model="page"
          :total-visible="5"
          :length="totalPages"
          :disabled="isLoading"
        />
      </VCol>
    </VRow>
  </div>
</template>


<style lang="scss" scoped>
.inscription-header > .v-toolbar__content {
  block-size: inherit !important;
}
</style>

<route lang="yaml">
  name: "inscription-final-list"
  meta:
    authRequired: true
</route>