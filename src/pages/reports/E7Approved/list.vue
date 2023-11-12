<script setup>
import FiltersList from "./FilterE7Approved.vue"
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs :items="[ $t('common.home'), $t('supportingDocuments.breadcrumbs.title'), $t('supportingDocuments.breadcrumbs.listE7Approved') ]" /> 

      <FiltersList />
    </div>
  </div>
</template>

<route lang="yaml">
name: "reports-e7approved-list"
meta:
  authRequired: true
</route>
