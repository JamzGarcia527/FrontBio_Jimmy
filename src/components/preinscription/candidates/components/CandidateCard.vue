<script setup>
import { useDownloadFiles } from '@/composables/useDownloadFiles'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  id: { type: Number, default: null },
  inscriptionId: { type: Number, default: null },
  dni: { type: String, default: null },
  dniexpdate: { type: String, default: null },
  firstname: { type: String, default: null },
  secondname: { type: String, default: null },
  firstsurname: { type: String, default: null },
  secondsurname: { type: String, default: null },
  email: { type: String, default: null },
  phone: { type: String, default: null },
  localphone: { type: String, default: null },
  birthdate: { type: String, default: null },
  gender: { type: String, default: null },
  age: { type: Number, default: null },
  rowField: { type: Number, default: null },
  focusVictim: { type: Number, default: null },
  focusRacial: { type: Number, default: null },
  focusDisability: { type: Number, default: null },
  focusLgtbiqIdentity: { type: Number, default: null },
  focusLgtbiqOrientation: { type: Number, default: null },
  approveStatus: { type: Number, default: null },
  approveSendAt: { type: String, default: null },
  approveResponseAt: { type: String, default: null },
  hasPhoto: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  uninominal: { type: Boolean, default: false },
  groupingPoliticalId: { type: Number, default: null },
})

const emit = defineEmits(['edit', 'delete'])

const { can } = useAppAbility()
const { t } = useI18n()

const srcImage = computed(() => `/v1/files/candidates?candidateDni=${props.dni}&inscriptionId=${props.inscriptionId}`)
const { data: image } = props.hasPhoto ? useDownloadFiles(srcImage) : { data: null }

const status = computed(() => {
  if (props.approveStatus == 0) 
    return { text: t('candidates.pending'), color: 'warning' } 
  if (props.approveStatus == 1)
    return { text: t('candidates.approved'), color: 'success' }
  if (props.approveStatus == 5)
    return { text: t('candidates.resignation'), color: 'error' }

  return { text: t('candidates.rejected'), color: 'error' }
})

const handlerEdit = () => {
  emit('edit', { ...props })
}

const handlerDelete = () => {
  emit('delete', { ...props })
}
</script>


<template>
  <VCard variant="outlined" class="pa-2">
    <template v-if="!readonly">
      <div v-if="can('update', 'candidate') || can('delete', 'candidate')" class="tools">
        <VMenu open-on-hover location="bottom end">
          <template #activator="{ props: menu }">
            <VBtn
              color="secondary"
              variant="plain"
              icon="mdi-dots-vertical"
              style="color: black !important;"
              v-bind="menu"
            />
          </template>
          <VList class="caption">
            <VListItem 
              v-if="can('update', 'candidate')"
              prepend-icon="tabler-edit" 
              :title="t('candidates.edit_candidate')" 
              @click="handlerEdit"
            />
            <VListItem 
              v-if="can('delete', 'candidate')"
              class="text-error"
              prepend-icon="tabler-trash" 
              :title="t('candidates.delete_candidate')" 
              @click="handlerDelete"
            />
          </VList>
        </VMenu> 
      </div>
    </template>
    <VRow>
      <VCol cols="12" sm="5">
        <VRow>
          <VCol cols="6">
            <VImg
              :src="image"
              aspect-ratio="1"
              class="pa-9 bg-secondary rounded-circle"
            />
          </VCol>
          <VCol v-if="uninominal" cols="6" />
          <VCol v-else cols="6">
            <div class="text-caption text-center">
              {{ t("candidates.row_field") }}
            </div>
            <VCard variant="outlined" class="h-auto">
              <h2 class="text-center">
                {{ rowField }}
              </h2>
            </VCard>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <p class="text-caption my-2">
              {{ t("candidates.full_name") }}
            </p>
            <h4 class="text-body-2 font-weight-semibold">
              {{ firstname }} {{ secondname }}
            </h4>
            <h4 class="text-body-2 font-weight-semibold">
              {{ firstsurname }} {{ secondsurname }}
            </h4>
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="12" sm="7" class="pt-xs-0">
        <VList class="caption bg-transparent">
          <VListItem prepend-icon="mdi-card-account-details-outline" :title="dni" />
          <VListItem prepend-icon="mdi-email-outline" :title="email" />
          <VListItem prepend-icon="mdi-cellphone" :title="phone" />
          <VListItem prepend-icon="mdi-phone-outline" :title="localphone" />
        </VList>
        <VRow class="text-center mb-2">
          <VCol cols="6" class="pa-2">
            <h4 class="text-body-2 font-weight-semibold">
              {{ gender }}
            </h4>
            <p class="text-caption my-0">
              {{ t("candidates.gender") }}
            </p>
          </VCol>
          <VCol cols="6" class="pa-2">
            <h4 class="text-body-2 font-weight-semibold">
              {{ age }}
            </h4>
            <p class="text-caption my-0">
              {{ t("candidates.age") }}
            </p>
          </VCol>
        </VRow>
        <div class="text-center">
          <VChip 
            prepend-icon="mdi-circle-medium" 
            size="small"
            :color="status.color"
            :text="status.text"
          />
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss" scoped>
.tools {
  position: absolute;
  z-index: 1;
  inset-block-start: 0;
  inset-inline-end: 0;
}
</style>
