<script setup>
import DefinitiveCandidatesListFilter from "@/components/definitiveCandidatesListReport/definitiveCandidatesListFilter.vue"
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), $t('supportingDocuments.breadcrumbs.title'), $t('supportingDocuments.breadcrumbs.definitiveCandidatesList') ]" /> 

      <DefinitiveCandidatesListFilter />
    </div>
  </div>
</template>

<route lang="yaml">
name: "definitive-candidates-list"
meta:
authRequired: true
</route>
