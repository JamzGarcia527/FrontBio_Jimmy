<script setup>
import EmulateUserForm from '@/components/shared/EmulateUserForm.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useI18n } from 'vue-i18n'
import WelcomeMessage from '@/components/principalPage/WelcomeMessage.vue'

const { t } = useI18n()
const { can } = useAppAbility()
</script>

<template>
  <div>
    <div class="d-flex justify-center">
      <WelcomeMessage />
    </div>
    <div class="d-flex justify-center pa-5 my-10">
      <EmulateUserForm v-if="can('user', 'emulate')" />
    </div>
  </div>
</template>

<route lang="yaml">
name: index
meta:
  authRequired: true
</route>
