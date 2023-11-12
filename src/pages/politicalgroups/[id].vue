<script setup>
import Form from '@/components/politicalgroups/Form.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useRouter } from 'vue-router'
import { useCustomMessage } from "@/composables/useCustomMessage"
  
const route = useRoute()
const router = useRouter()
const messageComposable = useCustomMessage()
const groupingPoliticalId = route.params.id

const filtersControls = reactive({ loading: false, disabled: false })

const handleNextFilter = async value => {
  filtersControls.loading = true

  const requestBody = {
    "name": value.form.value.name,
    "grouping_political_type": value.form.value.groupingPoliticalType,
    "email": value.form.value.email,
    "alternate_email": value.form.value.alternateEmail,
    "contact_name": value.form.value.contactName,
    "department_id": value.form.value.deptoId,
    "municipality_id": value.form.value.muniId,
    "address": value.form.value.address,
    "phone": value.form.value.phone,
    "celular_phone": value.form.value.celularPhone,
    "personage": value.form.value.personage,
    "blank_vote_promoter": value.form.value.blankVotePromoter,
    "logo_up": value.form.value.logoUp,
    "representative_dni": value.form.value.representativeDni,
    "representative_name": value.form.value.contactName,
    "state": value.form.value.state,
    "is_committee": value.form.value.is_committee,
  }

  try {

    const { data } = await axios.put(`/grouping-political/`+groupingPoliticalId, requestBody)

    await Swal.fire({
      icon: 'success',
      text: 'Agrupación modificada exitosamente',

      //modificar mensajes
    })

    router.push({ name: 'list-political-groups' })

    filtersControls.loading = false
    
    return true

  } catch (error) {
    filtersControls.loading = false
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0017"),
      })
    }
      
    return false
  }
}
</script>

<template>
  <div>
    <Form
      :grouping-political-id="groupingPoliticalId"
      :loading="filtersControls.loading"
      @next="handleNextFilter"
    />
  </div>
</template>

<route lang="yaml">
  name: "political-groups-update"
  meta:
  authRequired: true
</route>
