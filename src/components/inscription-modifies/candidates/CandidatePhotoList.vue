<script setup>
import DataView from '@/components/shared/DataView.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import Swal from '@/plugins/sweetalert2'
import { useInscriptionModify } from '@/stores/inscriptionModify'
import { useI18n } from 'vue-i18n'
import CandidatePhotoCard from './components/CandidatePhotoCard.vue'
import { useCustomMessage } from "@/composables/useCustomMessage"

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  inscriptionModifyId: { type: Number, required: true },
  readonly: { type: Boolean, default: false },
  isUninominal: { type: Boolean, defautl: false },
})

const inscriptionModify = useInscriptionModify()
const messageComposable = useCustomMessage()
const isLoading = ref(false)
const searchTextCandidates = ref("")

const candidates = computed(() => inscriptionModify.candidates.list
  .filter(c => {
    if (!searchTextCandidates.value) return true
    const searchText = searchTextCandidates.value.toLowerCase()
    let fullname = ''
    if (c.firstname) fullname += c.firstname
    if (c.firstname) fullname += ` ${c.secondname}`
    if (c.firstname) fullname += ` ${c.firstsurname}`
    if (c.firstname) fullname += ` ${c.secondsurname}`

    return fullname.toLowerCase().includes(searchText) || String(c.dni).startsWith(searchText)
  }).sort((a, b) => a.rowField > b.rowField))

const isReadOnly = computed(() => props.readonly)

const emptyText = computed(() => {
  return String(searchTextCandidates.value)
    ? "No hay registros para la busqueda" : t('candidates.empty_preregistred_list')
})

const getCandidates = async () => {
  try {
    isLoading.value = true
    await inscriptionModify.getCandidates(props.inscriptionModifyId)
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (candidates.length = 0) 
    getCandidates()
})

const handlerUpdateCandidatePhoto = payload => {
  inscriptionModify.updateCandidatePhoto(payload)
}

const defaultMessagePhoto = messageComposable.get("MS0011") 
const { can } = useAppAbility()
const { t } = useI18n()
</script>

<template>
  <div>
    <VCard :title="t('candidates.page_title')">
      <VCardTitle>
        <hr>
      </VCardTitle>
      <VAlert 
        type="warning" 
        variant="tonal" 
        class="text-body-2"
        rounded="0" 
      >
        {{ defaultMessagePhoto }}
      </VAlert>
      <VRow>
        <div class="v-col-sm-6 v-col-12" />
        <VCardText class="v-col-sm-6 px-8 py-10">
          <VTextField
            v-model="searchTextCandidates"
            :label="t('candidates.search')"
            append-inner-icon="tabler-search"
          />
        </VCardText>
      </VRow>
      <VCardText>
        <DataView 
          :items="candidates" 
          :loading="isLoading" 
          :empty-text="emptyText"
          paginate
          :size="9"
        >
          <template #default="item">
            <VCol cols="12" sm="6" xl="4">
              <CandidatePhotoCard  
                v-bind="item" 
                :id="item.candidateId"
                :is-uninominal="isUninominal"
                :readonly="readonly"
                @update-candidate-photo="handlerUpdateCandidatePhoto"
              />
            </VCol>
          </template>
        </DataView>
      </VCardText>
    </VCard>
  </div>
</template>
