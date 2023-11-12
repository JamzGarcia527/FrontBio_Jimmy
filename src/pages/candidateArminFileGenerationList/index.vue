<script setup>
import CandidateArminFileGenerationListReport from "@/components/candidateArminFileGenerationListReport/candidateArminFileGenerationListFilter.vue"
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), $t('supportingDocuments.breadcrumbs.title'), $t('candidate_generationList_report.title') ]" /> 

      <CandidateArminFileGenerationListReport />
    </div>
  </div>
</template>


<route lang="yaml">
name: "candidate-armin-file-generationList"
meta:
authRequired: true
</route>
