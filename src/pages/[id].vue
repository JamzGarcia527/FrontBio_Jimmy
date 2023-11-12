<script setup>
import Swal from '@/plugins/sweetalert2'
import axios from "@/plugins/axios"
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const route = useRoute()
const userId = route.params.id

try {
  const { data } = await axios.post(`/v1/user/${userId}/activate`)

  Swal.fire({
    icon: 'success',
    text: t('validations.user_activated'),
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
  }).then(() => {
    window.location.replace('/logout')
  })
} catch (error) {
  if (error.response && error.response.status < 500) {
    const { message } = error.response.data

    await Swal.fire({
      icon: 'warning',
      text: message,
    }).then(() => {
      window.location.replace('/logout')
    })
  }
}
</script>

<template>
  <div />
</template>

<route lang="yaml">
  name: "user-activate"
  meta:
    layout: blank-new
</route>
