<script setup>
import DataView from '@/components/shared/DataView.vue'
import { useInscriptionFinal } from '@/stores/inscriptionFinal'
import { useI18n } from 'vue-i18n'
import CandidatePhotoCard from './components/CandidatePhotoCard.vue'

const props = defineProps({
  readonly: { type: Boolean, default: false },
})

const inscriptionFinalStore = useInscriptionFinal()

const isLoading = ref(false)
const searchTextCandidates = ref("")

const candidates = computed(() => inscriptionFinalStore.candidates.list
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

const handlerUpdateCandidatePhoto = payload => {
  inscriptionFinalStore.updateCandidatePhoto(payload)
}

const { t } = useI18n()
</script>

<template>
  <div>
    <VCard :title="t('candidates.page_title')">
      <VCardTitle>
        <hr>
      </VCardTitle>
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
                :inscription-id="inscriptionFinalStore.information.id"
                :approve-status="item.stateId"
                :readonly="isReadOnly"
                @update-candidate-photo="handlerUpdateCandidatePhoto"
              />
            </VCol>
          </template>
        </DataView>
      </VCardText>
    </VCard>
  </div>
</template>
