<script setup>
import { useI18n } from 'vue-i18n'
import imageLogo from '@images/pages/dialog-banner-lg.png'

defineProps({
  modelValue: { type: Boolean, default: false },
  data: { type: Object, default: null },
})

const emit = defineEmits(['update:model-value', 'closed'])

const toggleDialog = value => {
  emit('update:model-value', value)
}

const { t } = useI18n()

const handleClose = () => {
  toggleDialog(false)
  emit('closed')
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    persistent
    class="v-dialog-xl"
    transition="dialog-top-transition"
    @update:model-value="toggleDialog"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="handleClose" />

    <VImg :src="imageLogo" cover />
    <!-- Dialog Content -->
    <VCard class="px-5 py-5">
      <VCardTitle>
        {{ t('preinscription.grouping_political.dialog_info_g') }}
        <hr>
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.dniManager"
              :label="t('preinscription.grouping_political.dni_manager')"
              color="primary"
              readonly
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol class="v-col-sm-3">
            <VTextField
              :model-value="data.firstNameManager"
              :label="t('preinscription.representative.first_name')"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-3">
            <VTextField
              :model-value="data.secondNameManager"
              :label="t('preinscription.representative.second_name')"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-3">
            <VTextField
              :model-value="data.firstSurnameManager"
              :label="t('preinscription.representative.first_surname')"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-3">
            <VTextField
              :model-value="data.secondSurnameManager"
              :label="t('preinscription.representative.second_surname')"
              readonly
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.celularPhone"
              :label="t('preinscription.grouping_political.celular_phone')"
              prepend-inner-icon="tabler-device-mobile"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.phone"
              :label="t('common.phone')"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.email"
              :label="t('preinscription.grouping_political.email')"
              prepend-inner-icon="tabler-mail"
              readonly
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardTitle>
        {{ t('preinscription.grouping_political.dialog_info') }}
        <hr>
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.accountNumber"
              :label="t('preinscription.grouping_political.number_account')"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.financialEntity"
              :label="t('preinscription.grouping_political.financial_entity')"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.accountType"
              :label="t('preinscription.grouping_political.accountType')"
              readonly
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardTitle :title="t('preinscription.grouping_political.dialog_info')">
        {{ t('preinscription.grouping_political.info_counter') }}
        <hr>
      </VCardTitle>
      <VCardText>
        <VRow>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.dniCounter"
              :label="t('preinscription.grouping_political.dni')"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.nameCounter"
              :label="t('preinscription.grouping_political.names_surnames')"
              readonly
            />
          </VCol>
          <VCol class="v-col-sm-4">
            <VTextField
              :model-value="data.professionalCard"
              :label="t('preinscription.grouping_political.professional_card')"
              readonly
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>
