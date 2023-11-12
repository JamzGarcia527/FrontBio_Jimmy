<script setup>
import FormCreate from '@/components/politicalgroups/FormCreate.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useRouter } from 'vue-router'
import { useI18n } from "vue-i18n"
import { useCustomMessage } from "@/composables/useCustomMessage"

const { t } = useI18n()
const router = useRouter()

const filtersControls = reactive({ loading: false, disabled: false })
const messageComposable = useCustomMessage()

const handleNextFilter = async value => {
  filtersControls.loading = true

  const fName = value.form.value.contactFirstName
  const sName = value.form.value.contactSecondName
  const fSurname = value.form.value.contactFirstSurname
  const sSurname = value.form.value.contactSecondSurname
  const fullName = `${fName}${sName==''?sName:' '+sName} ${fSurname}${sSurname==''?sSurname:' '+sSurname}`

  const requestBodyGrouping = {
    "id": value.form.value.id,
    "name": value.form.value.name,
    "grouping_political_type": value.form.value.groupingPoliticalType,
    "email": value.form.value.email,
    "alternate_email": value.form.value.alternateEmail,
    "contact_name": fullName,
    "department_id": value.form.value.deptoId,
    "municipality_id": value.form.value.muniId,
    "address": value.form.value.address,
    "phone": value.form.value.phone,
    "celular_phone": value.form.value.celularPhone,
    "personage": value.form.value.personage,
    "blank_vote_promoter": value.form.value.blankVotePromoter,
    "logo_up": value.form.value.logoUp,
    "representative_dni": value.form.value.representativeDni,
    "representative_name": fullName,
    "state": value.form.value.state,
  }

  try {

    await axios.post(`/grouping-political/`, requestBodyGrouping)

    await Swal.fire({
      icon: 'success',
      text: t('validations.grouping_create_success'),

      //ajuste de mensaje
    })
    router.push({ name: 'list-political-groups' })
      
    return true

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0017"),
      })
    }
      
    return false
  } finally {
    filtersControls.loading = false
  }
}
</script>

<template>
  <div>
    <FormCreate
      :loading="filtersControls.loading"
      @next="handleNextFilter"
    />
  </div>
</template>

<route lang="yaml">
  name: "political-groups-create"
  meta:
  authRequired: true
</route>
