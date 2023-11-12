<script setup>
import Notifications from '@/components/navBarNotifications/index.vue'
import axios from '@/plugins/axios'
import { useQuery } from '@tanstack/vue-query'
import { useEventBus } from '@vueuse/core'

const eventBus = useEventBus('notifications')

eventBus.reset()
 
const getNotifications = async () => {
  try {
  
    const { data }  = await axios.get(`/v1/notification-box`)

    return data    

  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: 'warning',
        text: message,
      })
    }
    throw new Error(error)
  }
}

const { data,refetch } = useQuery( 
  ['notifications'], 
  () => getNotifications(), { 
    cacheTime: 1000 * 60 * 5, 
    refetchOnReconnect: 'always', 
  }, 
)


eventBus.on(() => refetch())

const notifications = computed(()=>data.value || [])
</script>

<template>
  <Notifications :notifications="notifications" />
</template>
