<script setup>
import DataTableServerSide from "@/components/shared/DataTableServerSideReports.vue"
import { downloadBlob } from '@/utils'
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import { useUserConfigStore } from '@/stores/userconfig'


const { t } = useI18n()
const filters = ref([])
const datatable = ref(null)
const showModal = ref(false)
const pdfUrl = ref('')
const zoom = ref('150%')
const videoUrl = ref('')
const  isPdf = ref(false)


const userConfig = useUserConfigStore()

const fieldsVideos = ref([
  { key: "fileName", label: 'NOMBRE DE LOS VIDEOS' },
  { key: 'link', label: 'DESCARGAR VIDEOS' },
  { key: 'showFile', label: 'VISUALIZAR VIDEOS' },
])

const fieldsManuals = ref([
  { key: "fileName", label: 'NOMBRE DE LOS MANUALES' },
  { key: 'link', label: 'DESCARGAR MANUALES' },
  { key: 'showFile', label: 'VISUALIZAR MANUALES' },
])


const isLoading = ref(false)

const download = value => {
  isLoading.value = true

  const  nameFile = value

  axios.get(`/v1/documents/logo?file=${value}`, {
    responseType: "blob", // importante
  }).then(({ data }) => {
    downloadBlob(data, nameFile,'application/pdf')
  }).catch(async e => {
    let text = 'No es posible realizar operación, por favor intenta más tarde.'
    if (e.response) {
      const { data } = e.response
      const response = data instanceof Blob ? JSON.parse(await data.text()) : data

      text = response.message
    }
    Swal.fire({ icon: 'warning', text: text })
  }).finally(() => isLoading.value = false)
}

const showFile = async value => {

  isLoading.value = true
  try {
    // get route PDF
    const response = await axios.get (`/v1/documents/logo?file=${value}`, { responseType: 'blob' })
    const file = new Blob([response.data], { type: 'application/pdf' })

    pdfUrl.value = URL.createObjectURL(file)
    isPdf.value = true
    showModal.value = true
    isLoading.value = false

  } catch (error) {
    isLoading.value = false
    if(error){
      await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
    }
  }
}

const watchVideo = async (fileName,link) => {
  isLoading.value = true

  if (link == null) {

    try {
   
      // get route video
      const response = await axios.get (`/v1/documents/logo?file=${fileName}`, { responseType: 'blob' })
      const file = new Blob([response.data], { type: 'application/json' })

      videoUrl.value = URL.createObjectURL(file)
      isPdf.value = false
      showModal.value = true
      isLoading.value = false

    } catch (error) {
      isLoading.value = false
      if(error){
        await Swal.fire({ icon: 'warning', text: 'El recurso solicitado no existe'  })
      }
    }
  } else {

    window.open(link, "_blank")
    isLoading.value = false

  }


 
}
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ $t('common.home'), $t('view_user_manuals_videos.title') ]" /> 
    <VCard>
      <VListItemTitle class="font-weight-semibold demo-space-x me-4 ps-5 mt-3 mb-2 text-primary">
        {{ $t('view_user_manuals_videos.title') }}
      </VListItemTitle>
      <hr>
      <VListItemTitle class="font-weight-semibold demo-space-x me-4 ps-5 mt-3 mb-7">
        {{ userConfig.userData.firstName }} {{ userConfig.userData.firstSurname }} : {{ userConfig.role }}
      </VListItemTitle>
      <VListItemTitle class="font-weight-semibold demo-space-x me-4 ps-5 mt-3 mb-2 text-primary">
        {{ t('view_user_manuals_videos.letters.user_manual') }}
      </VListItemTitle>
      <hr>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/file?type=0"
        table-class="table-bordered"
        :params="filters"
        :fields="fieldsManuals"
      >
        <template #cell(showFile)="{ item }">
          <VBtn
            class="text-center"
            icon="tabler-eye"
            variant="text"
            color="secondary"
            :loading="isLoading"
            @click="showFile(item.fileName)"
          />
        </template>
        <template #cell(link)="{ item }">
          <div>
            <VBtn
              class="d-flex justify-center"
              variant="text"
              icon="tabler-download"
              color="secondary"
              :loading="isLoading"
              @click="download(item.fileName)"
            />
          </div>
        </template>
      </DataTableServerSide>
      <VListItemTitle class="font-weight-semibold demo-space-x me-4 ps-5 mt-3 mb-2 text-primary">
        {{ t('view_user_manuals_videos.letters.video_tutorial') }}
      </VListItemTitle>
      <hr>
      <DataTableServerSide
        ref="datatable"
        endpoint="/v1/file?type=1"
        table-class="table-bordered"
        :params="filters"
        :fields="fieldsVideos"
      >
        <template #cell(link)="{ item }">
          <div>
            <VBtn
              v-if="item.link == null"
              class="d-flex justify-center"
              variant="text"
              icon="tabler-download"
              color="secondary"
              :loading="isLoading"
              @click="download(item.fileName)"
            />
          </div>
        </template>
        <template #cell(showFile)="{ item }">
          <div>
            <VBtn
              class="d-flex justify-center"
              variant="text"
              icon="tabler-eye"
              color="secondary"
              :loading="isLoading"
              @click="watchVideo(item.fileName,item.link)"
            />
          </div>
        </template>
      </DataTableServerSide>
    </VCard>
    <!-- Modal Show PDF -->
    <VDialog
      v-model="showModal" width="1100" 
      persistent
    >
      <!-- Dialog close btn -->      
      <DialogCloseBtn @click="showModal = !showModal" />      
      <!-- Dialog Content -->      
      <VCard>
        <VCardText>          
          <embed v-if="isPdf" :src="pdfUrl" type="application/pdf" width="100%" height="500" :zoom="zoom">    
          <video v-else ref="videoPlayer" controls width="1050">
            <source :src="videoUrl" type="video/mp4">
          </video>
        </VCardText>        
        <VCardText class="d-flex justify-end">
          <VBtn @click="showModal = false">
            Cerrar
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<route lang="yaml">
name: "view-user-manuals-videos"
meta:
authRequired: true
</route>
