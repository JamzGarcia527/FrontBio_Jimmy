<script setup>
import axios from '@/plugins/axios'
import { onMounted } from 'vue'
import { useI18n } from "vue-i18n"
import DataView from '@/components/shared/DataView.vue'
import useEventBus from '@/utils/eventBus'
import Swal from '@/plugins/sweetalert2'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  groupingPoliticalTypeId:{ type:Number, required:true  },
})


const { t } = useI18n()
const { bus } = useEventBus()

const itemsRegistrationSupports = ref([])

const registrationSupports = async () => {
  try {
  
    const { data }  = await axios.get(`/v1/inscriptions-changes-supporting-documents/supporting-documents?inscription-change=${props.inscriptionId}`)

    itemsRegistrationSupports.value = data


  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
   
  }
}

const downloadFile = async (value, name) =>{
  const requestBody = {
    id: value,
  }

  await axios.get('v1/files/inscription-change-supporting-documents/download', {
    params: requestBody,
    responseType: "blob", // importante

  }).then(response => {

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")

    link.href = url
    link.setAttribute("download", name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }).catch(error => {
   
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

  
      Swal.fire({ icon: "warning", text: 'No se puede acceder al archivo' })
    }
  })
}


onMounted(async () => {

  await registrationSupports()
})

watch(() => bus.value.get('updateSupportDocs'), () => {
  registrationSupports()
})
</script>

<template>
  <VCard v-if="itemsRegistrationSupports.length" v-bind="dialogProps" class="rounded-lg" variant="outlined">
    <VCardText>
      <VRow>
        <VCol cols="12">
          <VListItemTitle class="text-h6 d-flex justify-center text-primary white-space">
            {{ t("tabSummary.registrationSupports") }}  
          </VListItemTitle>
        </VCol>

        <VCol cols="12">
          <DataView 
            :items="itemsRegistrationSupports" 
            paginate
            :size="2"
            :total-visible="3"
            :density="2"
          >
            <template #default="item">
              <VCol cols="12">
                <VListItemSubtitle class="mt-5">
                  <div>
                    <VIcon
                      size="30"
                      icon="tabler-file-text"
                    />
                    {{ item.name }}
                    <VBtn
                      icon="tabler-download"
                      variant="text"
                      color="secondary"
                      @click="downloadFile(item.id, item.name)"
                    />
                  </div>
                     
                  <div class="mt-2 ps-8">
                    {{ item.updateAt }}
                  </div>
                </VListItemSubtitle>
              </VCol>
            </template>
          </DataView>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <VCard v-else v-bind="dialogProps" class="rounded-lg" variant="outlined">
    <VCardText>
      <VListItemTitle class="text-h6 d-flex justify-center text-primary">
        {{ t("tabSummary.registrationSupports") }}  
      </VListItemTitle>
      <VListItemTitle class="text-h6 d-flex justify-center">
        {{ t("common.empty_table") }}  
      </VListItemTitle>
    </VCardText>
  </VCard> 
</template>

<style lang="scss">
.contenedor {
  overflow: hidden;
  font-size: 16;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
}

.contenedoricon {
  display: flex;
  align-items: center;
}

.contenedoricon v-icon {
  display: inline-block;
  margin-inline-end: 10px;
}

.white-space {
  white-space: break-spaces;
}
</style>
