<script setup>
import ReportFilter from '@/components/shared/ReportFilter.vue'
import GroupingPoliticalCard from '@/components/shared/GroupingPoliticalCard.vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import { onMounted } from 'vue'
import { useUserConfigStore } from "@/stores/userconfig"
import { useAppAbility } from '@/plugins/casl/useAppAbility'

const { can } = useAppAbility()
const router = useRouter()
const { t } = useI18n()

const userConfig = useUserConfigStore()

const isCommittee = computed(()=> userConfig.isCommittee)

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
    const { data } = await axios.get('/v1/inscriptions', { params: payload.value })
        
    return data
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: 'warning', text: message })
    }
        
    throw new Error(error)
  }
}

const { isLoading, data, refetch } = useQuery(
  ['inscriptions-inprogress', payload], 
  () => getData(payload), {
    cacheTime: 1000 * 60 * 5,
    refetchOnReconnect: 'always',
    keepPreviousData: true,
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
  router.push({ name: "preinscription-id", params: { id: payload.id } })
}

onMounted(() => {
  refetch()
})
</script>

<template>
  <div>
    <ReportFilter
      v-if="!isCommittee"
      class="mb-4"
      @search="handleSearchFilter" 
    />
    
    <VRow v-if="!isCommittee" class="my-3 mx-1">
      <VSpacer />
      <VBtn v-if="can('create', 'inscription:create')" color="secondary" :to="{ name: 'preinscription-create' }">
        Crear Inscripción
      </VBtn>
    </VRow>

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

<route lang="yaml">
name: "preinscription-list"
meta:
  authRequired: true
</route>
