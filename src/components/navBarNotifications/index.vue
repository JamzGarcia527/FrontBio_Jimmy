<script setup>
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useI18n } from 'vue-i18n'
import { useEventBus } from '@vueuse/core'

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
  },
  badgeProps: {
    type: null,
    required: false,
    default: undefined,
  },
  location: {
    type: null,
    required: false,
    default: 'bottom end',
  },
})

const eventBus = useEventBus('notifications')
const { t } = useI18n()

const mostarTodo = ref(false)

const menu = ref(false)

const menuNumber = ref('2') 
const returnValue = ref(false)



// const notificationsUpdate = async () => {
  
//   const notificationsId = props.notifications.map(notification => notification.id) 

//   const notificationsIdEmpyty = notificationsId.length === 0
  

//   if(!notificationsIdEmpyty)
//   {
//     const requestBody = {
//       notificationIds: notificationsId,
//     }

//     try {
   
//       const { data } = await axios.post("/v1/notification-box", requestBody)
  
//       menu.value = false
//       returnValue.value= false
//       eventBus.emit()

//       //await Swal.fire({ text: data, icon: "success" })

//     } catch (error) {
    
//       if (error.response && error.response.status < 500) {
//         const { message } = error.response.data

//         //  Swal.fire({ icon: 'warning', text: message })
//       }
 
//     }
//   }

// }

// const onMenuChange =  newValue => {
//   if(!newValue){
//     mostarTodo.value = false
//     menu.value = false
//     returnValue.value= false
//   }

// }
</script>

<template>
  <VBadge>
    <div class="px-1">
      <VBtn
        icon
        variant="text"
        color="default"
        size="small"
      >
        <VBadge
          color="error"
        >
          <VIcon
            icon="tabler-message"
            size="43"
          />
          <VTooltip
            activator="parent"
            location="bottom"
          >
            <p class="text-justify">
              {{ t('notifications.notifications_time') }} - {{ t('notifications.notifications_message_tiem') }}  <span>{{ t('notifications.notifications_message_leer') }}</span>
            </p>
          </VTooltip>
        </VBadge>

        <VMenu
          v-model="menu"
          activator="parent"
          width="380px"
       
          :location="props.location"
          offset="14px"
          :return-value="returnValue"
          :close-on-content-click="returnValue"
        >
          <VList class="py-0">
            <!-- 👉 Header -->
            <VListItem
              :title="t('notifications.notifications_title')"
              class="notification-section"
              height="48px"
            >
              <template #append>
                <VChip
                 
                  color="warning"
                  size="small"
                >
                  10 Nuevo
                </VChip>
              </template>
            </VListItem>

            <VDivider />

            <!-- 👉 Notifications list -->
            <div>
              <template>
                <VListItem
                  title="notification example"
                  subtitle="Example 1"
                  link
                  lines="one"
                  min-height="66px"
                  class="v-list-item__no-overflow"
                >
                  <small>Enviado: </small> 
                  <small class="whitespace-no-wrap text-medium-emphasis">25 - 01 - 2024</small>
                </VListItem>
                <VDivider />
              </template>
            </div>
            <template>
              <VListItem
                :title="t('notifications.notifications_title_no')"
                lines="one"
                min-height="66px"
                class="d-flex justify-cente"
              />
              <VDivider />
            </template>

            <!-- 👉 Footer -->
            <VListItem class="notification-section">
              <VBtn
                v-if="!mostarTodo "
                block @click="mostarTodo = true"
              >
                {{ t('notifications.notifications_message_btn') }}
              </VBtn>
              <VBtn
                block color="warning"
                class="notAllowedEmulator"
              >
                {{ t('notifications.notifications_message_leer_btn') }}
              </VBtn>
            </VListItem>
          </VList>
        </VMenu>
      </VBtn>
    </div>
  </VBadge>
</template>

<style lang="scss">
.notification-section {
  padding: 14px !important;
}
</style>
