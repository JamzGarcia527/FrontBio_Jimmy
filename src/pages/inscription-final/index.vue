<script setup>
import GeneralFilter from "@/components/inscription-final/GeneralFilter.vue"
import SummaryHeader from "@/components/inscription-final/SummaryHeader.vue"
import SummaryInfo from "@/components/inscription-final/summary/SummaryInfo.vue"
import SummaryCandidates from "@/components/inscription-final/summary/SummaryCandidates.vue"
import SummaryMembers from "@/components/inscription-final/summary/SummaryMembersCommittee.vue"
import Card from "@/components/shared/Card.vue"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useI18n } from "vue-i18n"
import { useAppAbility } from "@/plugins/casl/useAppAbility"
import ReprocessChanges from "@/components/inscription-final/summary/ReprocessChanges.vue"

const { t } = useI18n()
const { can } = useAppAbility()

const filtersControls = reactive({ loading: false, disabled: false, previousValue: {} })
const inscription = ref(null)
const inscriptionId = ref(null)
const isUninominal = computed(() => Boolean(inscription.value?.isUninominal))

const handleNextFilter = async value => {
  if(!can('get', 'inscription-final')) {
    Swal.fire({ icon: "warning", text: t('permissions_profiles.warning_permissions') })

    return
  }

  filtersControls.disabled = true
  filtersControls.loading = true
  filtersControls.previousValue = { ...value }

  try {
    const payload = {
      corporationId: value.corporationId,
      circunscriptionId: value.circunscriptionId,
      groupingPoliticalTypeId: value.groupingPoliticalTypeId,
      groupingPoliticalId: value.groupingPoliticalId,
      department: value.department,
      municipality: value.municipality,
      commune: value.commune,
      blankVotePromoter: value.isBlankVotePromote,
    }

    const { data } = await axios.get(`/v1/inscription-final/get-preview`, { params: payload })
    
    inscriptionId.value = data.headerPreview.inscriptionId
    inscription.value = {
      header: {
        groupingPoliticalTypeName: data.headerPreview.groupingPoliticalTypeName,
        groupingPoliticalId: data.groupingPolitical.id,
        groupingPoliticalName: data.headerPreview.groupingPoliticalName,
        corporationName: data.headerPreview.corporation,
        circunscriptionName: data.headerPreview.circunscription,
        logoStatus: data.headerPreview.logoState,
        inscriptionDocumentsDate: data.headerPreview.documentDate,
        approveDate: data.headerPreview.approveDate,
        stateName: data.headerPreview.state,
        radicateId: data.headerPreview.radicate,
      },
      resumen: {
        inscriptionId: data.headerPreview.inscriptionId,
        groupingPoliticalTypeId: data.groupingPolitical.grouping_political_type,
      },
      candidates: data.candidates,
      members: data.committeeMembers,
    }
  } catch (error) {
    inscription.value = null

    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  } finally {
    filtersControls.disabled = false
    filtersControls.loading = false
  }

}
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), $t('supportingDocuments.breadcrumbs.title'), $t('inscription_final.title_preview') ]" />

      <GeneralFilter
        :loading="filtersControls.loading"
        :disabled="filtersControls.disabled"
        class="mb-4"
        @next="handleNextFilter"
      />

      <template v-if="filtersControls.loading">
        <div 
          class="d-flex justify-center align-center" 
          style="height: 70vh;"
        >
          <VProgressCircular size="60" indeterminate />
        </div>
      </template>

      <template v-else-if="inscription">
        <VCard>
          <div class="v-toolbar__content">
            <SummaryHeader v-bind="inscription.header" class="my-5" />
          </div>
        </VCard>

        <Card subtitle="Resumen" class="mt-3">
          <VCardText>
            <VRow>
              <VCol cols="12">
                <SummaryInfo v-bind="inscription.resumen" />
              </VCol>
            </VRow>
          </VCardText>
        </Card>

        <Card subtitle="Candidatos Inscritos" class="mt-3">
          <VCardText>
            <VRow>
              <VCol cols="12">
                <SummaryCandidates 
                  :items="inscription.candidates" 
                  :inscription-id="inscription.resumen.inscriptionId" 
                  :show-row-field="!isUninominal"
                />
              </VCol>
            </VRow>
            <VRow justify="center">
              <VCol cols="12" sm="6" md="4">
                <ReprocessChanges 
                  v-if="can('reprocess-changes', 'inscription-final')" 
                  :inscription-id="inscriptionId" 
                  @executed="() => handleNextFilter(filtersControls.previousValue)"
                />
              </VCol>
            </VRow>
          </VCardText>
        </Card>

        <Card v-if="inscription.members.length" subtitle="Integrantes del Comité Inscriptor" class="mt-3">
          <VCardText>
            <VRow>
              <VCol cols="12">
                <SummaryMembers :items="inscription.members" />
              </VCol>
            </VRow>
          </VCardText>
        </Card>
      </template>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.inscription-header > .v-toolbar__content {
  block-size: inherit !important;
}
</style>

<route lang="yaml">
  name: "inscription-final-preview-e8"
  meta:
    authRequired: true
</route>
