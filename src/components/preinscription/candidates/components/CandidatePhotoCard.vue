<script setup>
import axios from '@/plugins/axios'
import DialogUploadCandidatePhoto from '@/components/shared/candidate/DialogUploadCandidatePhoto.vue'
import { useDownloadFiles } from '@/composables/useDownloadFiles'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from 'vue-i18n'
import { useCustomMessage } from "@/composables/useCustomMessage"

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
  timePhoto: { type: Number, default: null },
  readonly: { type: Boolean, default: false },
  isUninominal: { type: Boolean, default: false },
})

const emit = defineEmits(['updateCandidatePhoto'])

const { can } = useAppAbility()
const { t } = useI18n()
const messageComposable = useCustomMessage()

const srcImage = computed(() => {
  return !props.hasPhoto ? null
    : `/v1/files/candidates?candidateDni=${props.dni}&inscriptionId=${props.inscriptionId}&time=${props.timePhoto}`
})

const { data: image } = useDownloadFiles(srcImage)

const status = computed(() => {
  if (props.approveStatus == 0) 
    return { text: t('candidates.pending'), color: 'warning' } 
  if (props.approveStatus == 1)
    return { text: t('candidates.approved'), color: 'success' }
  if (props.approveStatus == 5)
    return { text: t('candidates.resignation'), color: 'error' }
  
  return { text: t('candidates.rejected'), color: 'error' }
})

const handlerUpdateCandidatePhoto = hasPhoto => {
  emit('updateCandidatePhoto', { 
    candidateDni: props.dni, 
    inscriptionId: props.inscriptionId, 
    hasPhoto: hasPhoto,
  })
}

const deleteCandidatePhoto = () => {
  Swal.fire({
    html: "¿ Desea eliminar la imagen ?",
    icon: "question",
    customClass: { confirmButton: "bg-primary notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        const params = { 
          candidateDni: props.dni, 
          inscriptionId: props.inscriptionId, 
        }

        await axios.delete("v1/files/candidates", { params })
        handlerUpdateCandidatePhoto(false)
        
        return true
      } catch (error) {
        let message = messageComposable.get("MS0010")
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
      
        return false
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}
</script>


<template>
  <VCard variant="outlined" class="pa-2 bg-deep-orange-darken-4">
    <template v-if="!readonly">
      <div v-if="!readonly" class="tools">
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
            <VListItem>
              <DialogUploadCandidatePhoto 
                :inscription-id="inscriptionId" 
                :candidate-dni="Number(dni)" 
                :disabled="hasPhoto || !can('post', 'file-candidate')"
                @uploaded="() => handlerUpdateCandidatePhoto(true)"
              />
            </VListItem>
            <VListItem>
              <VBtn
                :disabled="!hasPhoto || !can('delete', 'file-candidate')"
                variant="tonal"
                color="error"
                :rounded="0"
                @click="deleteCandidatePhoto"
              >
                {{ t("dialog_candidates.delete_photo") }}
                <VIcon class="me-2" end icon="mdi-image-remove-outline" size="22" />
              </VBtn>
            </VListItem>
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
          <VCol v-if="!isUninominal" cols="6">
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
