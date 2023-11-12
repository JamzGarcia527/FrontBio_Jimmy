<script setup>
import FiltersList from "@/components/reports/FiltersList.vue"
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), $t('supportingDocuments.breadcrumbs.title'), $t('supportingDocuments.breadcrumbs.listE6Approved') ]" /> 

      <FiltersList />
    </div>
  </div>
</template>


<style lang="scss" scoped>
//
</style>

<route lang="yaml">
  name: "generation-listE6-approved"
  meta:
    authRequired: true
</route>