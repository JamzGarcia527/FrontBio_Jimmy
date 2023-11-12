<script setup>
import photoCandidate from "@images/pages/photo-candidate.png"
import DialogUploadCandidatePhoto from "@/components/preinscription/candidates/DialogUploadCandidatePhoto.vue"
import { useI18n } from "vue-i18n"
import { onMounted, watch } from 'vue'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useUserConfigStore } from '@/stores/userconfig'
import useEventBus from '@/utils/eventBus'

const variable = defineProps({
  inscriptionId: { type: Number, required: true },
  readonly: { type: Boolean, default: false },
  enablePhoto: { type: Boolean, default: false }, 
})

const { t } = useI18n()
const { bus } = useEventBus()

const userConfig = useUserConfigStore()
const valueLabelSearch = ref(null)
const listCandidatesFilter = ref([])
const currentPage = ref(1)
const pages = ref(null)
const listCandidates = toRefs([])
const actualPage = ref(1)


const SearchListCandidates = function () {
  if (valueLabelSearch.value.length > 0) {
    listCandidatesFilter.value = listCandidates.value.filter(word =>
      word.firstname.toUpperCase().includes(valueLabelSearch.value.toUpperCase()),
    )
  } else {
    listCandidatesFilter.value = listCandidates.value
  }
}

const SearchImageCandidate = async function (e) {
  
  const blobresponse = await axios.get(
    "/v1/files/candidates?candidateDni=" + e.dni + "&inscriptionId=" + e.inscriptionId + "",
    {
      responseType: "blob",
    },
  )

  let blob = new Blob([blobresponse.data], { type: "image/jpg" })

  return window.URL.createObjectURL(blob)
}

const handleClosedDialog = function(file, idCandidate, inscriptionIdCandidate) {
  const formData = new FormData()

  formData.append("file", file)

  axios.post(
    "/v1/files/candidates?dni=" +
      idCandidate +
      "&inscriptionId=" +
      inscriptionIdCandidate +
      "&createdBy=" +
      userConfig.userData.id +
      "",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  ).then(response => {
    SearchCandidate()
  })
}

const SearchCandidate = function () {
  axios.get("v1/candidates/" + variable.inscriptionId).then(async response => {
    const items = response.data.sort((a, b) => a.rowField > b.rowField)

    listCandidates.value = items
    listCandidatesFilter.value = items
    updatePage(actualPage.value)
  })
}

const queryCandidates = async function () {
  for (const g of listCandidatesFilter.value) {
    if (g.hash != null) {
      const urlNueva = await SearchImageCandidate(g)

      g.path = urlNueva
    } else {
      g.path = photoCandidate
    }
  }
}

const handleClosedDialog2 = async function (CandidateId, InscriptionId) {
  Swal.fire({
    title: "¿ Desea eliminar la imagen ?",
    customClass: { confirmButton: "bg-primary notAllowedEmulator" },
    showDenyButton: true,
    confirmButtonText: "Confirmar",
    denyButtonText: "Cancelar",
  }).then(result => {
    if (result.isConfirmed) {
      Swal.fire("Eliminado", "", "success")
      confirmarEliminarImagen(CandidateId, InscriptionId)
    } else if (result.isDenied) {
      Swal.fire("Accion cancelada", "", "info")
    }
  })
}

const confirmarEliminarImagen = async (CandidateId, InscriptionId) => {
  await axios.delete(
    "v1/files/candidates?candidateDni=" + CandidateId + "&inscriptionId=" + InscriptionId + "",
  )
  await SearchCandidate()
}

const updatePage = function(currentPage){
  
  actualPage.value = currentPage
  let _start = (currentPage - 1) * 10
  let _end = currentPage * 10
  pages.value = listCandidates.value.length / 10
  listCandidatesFilter.value = listCandidates.value.slice(_start, _end, currentPage)

  queryCandidates()
}

onMounted(async () => {
  SearchCandidate()
})

watch(() => bus.value.get('updateCandidate'), () => {
  SearchCandidate()
})
</script>

<template>
  <div class="layout-default">
    <VCard :title="t('candidates.page_title')">
      <VCardTitle>
        <hr>
      </VCardTitle>
      <VRow>
        <div class="v-col-sm-6 v-col-12" />
        <VCardText class="v-col-sm-6 px-8 py-10">
          <VTextField
            v-model="valueLabelSearch"
            :label="t('candidates.search')"
            append-inner-icon="mdi-magnify"
            @keyup="SearchListCandidates"
          />
        </VCardText>
      </VRow>
      <VRow>
        <VCol
          cols="12" class="d-flex justify-center"
        >
          <TextSubtitle1 v-if="listCandidatesFilter.length == 0">
            {{ t("candidates.no_records") }}
          </TextSubtitle1>
        </VCol>
      </VRow>
      <VRow class="px-6">
        <div
          v-for="(reco, index) in listCandidatesFilter"
          :key="index"
          class="v-col-sm-6 v-col-12"
        >
          <VCard variant="outlined" class="d-flex align-center px-1 rounded">
            <div class="v-col-sm-5 v-col-5">
              <VRow>
                <div class="v-col-sm-6 v-col-12 px-2">
                  <VImg
                    :src="reco.path"
                    class="pa-9 bg-secondary rounded-circle imgmq"
                  />
                </div>
                <VCol cols="6">
                  <div class="text-caption text-center">
                    {{ t("candidates.row_field") }}
                  </div>
                  <VCard variant="outlined" class="h-auto lcard">
                    <h2 class="text-center">
                      {{ reco.rowField }}
                    </h2>
                  </VCard>
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12" md="12" class="py-2">
                  <div>
                    <p class="caption-1 fontc">
                      {{ t("candidates.full_name") }}
                    </p>
                    <h4 class="fontc">
                      {{ reco.firstname }}
                    </h4>
                    <h4 class="fontc">
                      {{ reco.firstsurname }}
                    </h4>
                  </div>
                </VCol>
              </VRow>
            </div>
            <VCol cols="12" md="7" class="py-9 px-1" style="width: 50%;">
              <VRow>
                <div class="col-3 borders px-8">
                  <p class="caption-2 text-lg-right fontc">
                    {{ t("candidates.corporation") }}
                  </p>
                </div>
                <div class="col-3 px-2">
                  <p class="caption-2 font-weight-bold fontc">
                    {{ reco.corporation }}
                  </p>
                </div>
                <div class="col-1">
                  <div class="tools">
                    <VMenu v-if="!readonly" open-on-hover location="bottom end">
                      <template #activator="{ props: menu }">
                        <VBtn
                          color="secondary"
                          variant="plain"
                          icon="mdi-dots-vertical"
                          style="color: black !important;"
                          v-bind="menu"
                        />
                      </template>
                      <VList>
                        <DialogUploadCandidatePhoto
                          :id-candidate="reco.dni"
                          :inscription-id-candidate="reco.inscriptionId"
                          :path="reco.hash"
                          :status="reco.approveStatus"
                          @closed="handleClosedDialog"
                          @closed2="handleClosedDialog2(reco.dni, reco.inscriptionId)"
                        />
                      </VList>
                    </VMenu>
                  </div>
                </div>
              </VRow>
              <div class="v-row float-left">
                <div class="v-col-sm-12 infoc">
                  <div class="spaced">
                    <VIcon icon="mdi-card-account-details-outline" size="medium" />
                    <Vtext class="caption-1 px-2">
                      {{ reco.dni }}
                    </Vtext>
                  </div>
                  <div class="spaced">
                    <VIcon icon="mdi-email-outline" size="medium" />
                    <Vtext class="caption-1 px-2">
                      {{ reco.email }}
                    </Vtext>
                  </div>
                  <div class="spaced">
                    <VIcon icon="fa-mobile" size="medium" />
                    <Vtext class="caption-1 px-2">
                      {{ reco.phone }}
                    </Vtext>
                  </div>
                  <div class="spaced">
                    <VIcon icon="mdi-phone-outline" size="medium" />
                    <Vtext class="caption-1 px-2">
                      {{ reco.localphone }}
                    </Vtext>
                  </div>
                </div>
                <div style=" margin-bottom: 5%;margin-left: 60%;">
                  <VRow>
                    <VChip
                      v-if="reco.approveStatus == 0"
                      class="text-warning v-chip--size-small"
                    >
                      <VIcon icon="mdi-circle-medium" size="medium" />
                      {{ t("candidates.pending") }}
                    </VChip>
                    <VChip
                      v-else-if="reco.approveStatus == 1"
                      class="text-success v-chip--size-small"
                    >
                      <VIcon icon="mdi-circle-medium" size="medium" />
                      {{ t("candidates.approved") }}
                    </VChip>
                    <VChip
                      v-else-if="reco.approveStatus == 5"
                      class="text-error v-chip--size-small"
                    >
                      <VIcon icon="mdi-circle-medium" size="small" />
                      {{ t("candidates.resignation") }}
                    </VChip>
                    <VChip v-else class="text-error v-chip--size-small">
                      <VIcon icon="mdi-circle-medium" size="small" />
                      {{ t("candidates.rejected") }}
                    </VChip>
                  </VRow>
                </div>
              </div>
            </VCol>
          </VCard>
        </div>
      </VRow>
      <div class="py-4">
        <VPagination
          v-model="currentPage"
          size="small"
          :length="pages"
          @click="updatePage(currentPage)"
          @next="updatePage"
          @prev="updatePage"
        />
      </div>
    </VCard>
  </div>  
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>
