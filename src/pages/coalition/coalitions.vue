<script setup>
import { ref, computed, defineEmits } from 'vue'
import Swal from '@/plugins/sweetalert2'
import axios from '@/plugins/axios'

// Translate i18n
import { useI18n } from 'vue-i18n'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  paginate: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["refreshCoalitions"])

const { t } = useI18n()

const page = ref(1)
const itemsPerPage = 30

const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage

  // Verificar si props.items existe y es un arreglo
  const items = Array.isArray(props.items) ? props.items : []
  
  return items.slice(start, end)
})

const totalPages = computed(() => {
  // Verificar si props.items existe y es un arreglo
  const items = Array.isArray(props.items) ? props.items : []
  
  return Math.ceil(items.length / itemsPerPage)
})

const deleteCoalition = async id => {
  Swal.fire({
    title: t('coalitions.title_confirmed_delete_coalitions'),
    icon: "question",
    customClass: { confirmButton: "bg-error notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await axios.delete(`/v1/coalitions/grouping-political?coalitionId=${id}`)

        
        Swal.fire({ text: t('coalitions.msg_coalition_deleted'), icon: "success" })
        
        emit("refreshCoalitions")
        
        return true
      } catch (error) {
        let message = t('coalitions.not_operation')
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
  <div>
    <VRow class="mb-5">
      <VCol v-for="(item, index) in paginatedItems" :key="index" cols="12" md="4">
        <VCard class="card h-100">
          <VCardItem>
            <div>
              <div class="text-h6 mb-1">
                {{ item.coalitionName }}
              </div>
              <div class="text-overline mb-1">
                {{ t('coalitions.form.coalition_code') }}: {{ item.coalitionId }}
              </div>
              <div class="text-caption">
                <VIcon
                  start
                  icon="tabler-user"
                />{{ item.representive.representativeName }}: ({{ item.representive.groupingpoliticalName }})
              </div>
            </div>
          </VCardItem>

          <VCardText>
            <div class="font-weight-bold ms-1 mb-2">
              {{ t('coalitions.coalitions_grouping') }}
            </div>

            <div>
              <VTimeline density="compact" align="start">
                <VTimelineItem v-for="grouping in item.groupingPoliticals" :key="grouping.id" size="x-small">
                  <div class="mb-4">
                    <div class="font-weight-normal">
                      <strong>{{ grouping.groupingpoliticalId }} -</strong> {{ grouping.groupingpoliticalName }}
                    </div>
                  </div>
                </VTimelineItem>
              </VTimeline>
            </div>
          </VCardText>
          <VCardActions class="buttonsAlign">
            <VBtn variant="outlined" @click="deleteCoalition(item.coalitionId)">
              <VIcon start icon="tabler-trash" />
              {{ t('coalitions.btn_delete') }}
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
    <VPagination v-model="page" :length="totalPages" />
  </div>
</template>

<style>
  .buttonsAlign {
    position: absolute;
    display: block;
    inset-block-end: 0;
    inset-inline-end: 0;
  }
</style>
