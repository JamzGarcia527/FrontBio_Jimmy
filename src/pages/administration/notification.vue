<script setup>
import DataTableServerSide from "@/components/shared/DataTableServerSide.vue"
import DataTable from "@/components/shared/DataTable.vue"
import { useI18n } from "vue-i18n"
import Swal from "@/plugins/sweetalert2"
import { useCustomMessage } from "@/composables/useCustomMessage"
import axios from "@/plugins/axios"

const { t } = useI18n()
const messageComposable = useCustomMessage()

const email = ref(null)
const datatable = ref(null)
const isLoadingStatics = ref(false)
const isLoading = ref(false)
const isDisabled = ref(false)
const clearable = computed(() => email.value != null)

const filters = reactive({
  size: 50,
  email: "-1",
})

const keys = { isLoading: false }

const itemsStatistics = ref([])

const fieldsStatistics = ref([
  { key: "stateId", label: t("notifications.statistics.id") },
  { key: "stateName", label: t("notifications.statistics.name") },
  { key: "amount", label: t("notifications.statistics.count") },
])

const fields = ref([
  { key: "idEmail", label: t("notifications.list.id") },
  { key: "recipientEmail", label: t("notifications.list.recipient") },
  { key: "subject", label: t("notifications.list.subject") },
  { key: "stateName", label: t("notifications.list.state") },
  { key: "actions", label: t("common.resend") },
])

const getStatistics = async () => {
  isLoadingStatics.value = true

  try {
    const { data } = await axios.get(`/v1/notification-email/statistics`)

    itemsStatistics.value = data
  } catch (error) {
    itemsStatistics.value = []

    let message = messageComposable.get("MS0010")
    if (error.response && error.response.status < 500)
      message = error.response.data.message
    Swal.fire({ icon: "warning", text: message })
  } finally {
    isLoadingStatics.value = false
  }
}

const reload = () => {
  getStatistics()

  datatable.value.refresh()
}

const handerFinder = () => {
  filters.email = email.value
}

const handlerClear = () => {
  filters.email = "-1"
  email.value = null
}

const resend = async item => {
  item.isLoading = true
  isDisabled.value = true

  try {
    await axios.post(`/v1/notification-email/resend-email/${item.idEmail}`)

    reload()
    Swal.fire({ icon: 'success', text: "Correo electrónico reenviado." })
  } catch (error) {
    let message = messageComposable.get("MS0010")
    if (error.response && error.response.status < 500)
      message = error.response.data.message
    Swal.fire({ icon: "warning", text: message })
  } finally {
    item.isLoading = false
    isDisabled.value = false
  }
}

onMounted(() => {
  reload()
})
</script>

<template>
  <div>
    <div class="layout-default">
      <VBreadcrumbs
        :items="[
          $t('common.home'),
          $t('update_local_ani.breadcrumbs.title'),
          $t('notifications.title'),
        ]"
      />

      <VCard :title="t('notifications.title')">
        <VCardText>
          <VRow>
            <VCol cols="12" sm="6" md="8">
              <div v-if="isLoadingStatics" class="text-center py-10">
                <VProgressCircular size="50" indeterminate />
              </div>

              <DataTable v-else :fields="fieldsStatistics" :items="itemsStatistics">
                <template #cell(amount)="{ item }">
                  <div class="text-end">
                    {{ item.amount }}
                  </div>
                </template>
              </DataTable>
            </VCol>

            <VCol cols="12" sm="6" md="4">
              <VBtn
                prepend-icon="tabler-reload"
                :loading="isLoadingStatics"
                :disabled="isLoadingStatics"
                block
                type="button"
                @click="reload"
              >
                Refrescar
              </VBtn>
            </VCol>
          </VRow>

          <VRow justify="end" class="mt-10">
            <VCol cols="12" sm="6">
              <VTextField
                v-model.trim="email"
                :label="t('auth.email')"
                :clearable="clearable"
                @click:clear="handlerClear"
              >
                <template #append-inner>
                  <template v-if="isLoading">
                    <VProgressCircular size="24" indeterminate />
                  </template>

                  <template v-if="!isLoading">
                    <VIcon icon="mdi-magnify" @click="handerFinder" />
                  </template>
                </template>
              </VTextField>
            </VCol>

            <VCol cols="12">
              <DataTableServerSide
                ref="datatable"
                endpoint="/v1/notification-email/list/all"
                :params="filters"
                :fields="fields"
                :keys="keys"
              >
                <template #cell(actions)="{ item }">
                  <div v-if="item.state != 9" class="d-flex justify-center">
                    <VBtn
                      icon="tabler-mail-forward"
                      variant="text"
                      color="secondary"
                      :disabled="isDisabled"
                      :loading="item?.isLoading"
                      @click="resend(item)"
                    />
                  </div>
                </template>
              </DataTableServerSide>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<route lang="yaml">
name: "administration-notification"
meta:
  authRequired: true
</route>
