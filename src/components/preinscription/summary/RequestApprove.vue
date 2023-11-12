<script setup>
import axios from '@/plugins/axios'
import { useI18n } from 'vue-i18n'
import { useInscription } from '@/stores/inscription'
import Swal from '@/plugins/sweetalert2'
import { useRouter } from 'vue-router'
import { downloadBlob, openTabBlob } from '@/utils'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  radicateId: { type: String, default: "" },
})

const router = useRouter()
const inscriptionStore = useInscription()
const { t } = useI18n()

const inputOptions = new Promise(resolve => {
  setTimeout(() => {
    resolve({
      '1': t('type_approved.virtual'),
      '2': t('type_approved.manual'),
    })
  }, 1000)
})

const isBlankVote = computed(() => inscriptionStore.isBlankVotePromoter)
const candidateTotal = computed(() => inscriptionStore.candidates.list.length)

const candidatePending = computed(() => {
  return inscriptionStore
    .candidates.list
    .reduce((acc, item) => item.approveStatus != 1 ? acc + 1 : acc, 0)
})

const sendRequestElecAuth = async () => {

  if (!isBlankVote.value && candidateTotal.value == 0) {
    Swal.fire({
      icon: "warning",
      text: t('tabSummary.request_approve.must_register_candidates'),
    })
    
    return
  }

  Swal.fire({
    html: t('tabSummary.request_approve.question'),
    input: "radio",
    inputOptions: inputOptions,
    inputValidator: value => {
      if (!value) {
        return t('common.select_type_approve')
      }
    },
    icon: "question",
    customClass: { confirmButton: "bg-primary notAllowedEmulator" },
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    showLoaderOnConfirm: true,
    preConfirm: async radio => {

      let radios = document.querySelectorAll("input[type='radio'][name='swal2-radio']")

      if (radios.length > 0) {
        for (var i = 0; i < radios.length; i++) {
          radios[i].disabled = true
        }
      }
      
      try {
        await axios.get(`/v1/inscriptions/approve-request/${props.inscriptionId}`, { params: { type_approve_id: parseInt(radio) } })
        await Swal.fire({ 
          icon:"success", 
          text: t('tabSummary.request_approve.response'),
        })

        const { data } = await axios.get(`/v1/inscription-approval/download?id=${props.inscriptionId}`, { responseType: 'blob' })

        downloadBlob(data, `${props.radicateId}.pdf`,'application/pdf')
        router.replace({ name: 'preinscription-list' })
        
        return true
      } catch (error) {
        let message = 'No se pudo completar acción, por favor intente más tarde.'
        if (error.response && error.response.status < 500) 
          message = error.response.data.message
        Swal.fire({ icon: "warning", text: message })
        
        return false
      } finally {
        if (radios.length > 0) {
          for (var i = 0; i < radios.length; i++) {
            radios[i].disabled = false
          }
        }
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  })
}

document.addEventListener("click", function(event) {
  if (event.target.matches(".swal2-container input[name='swal2-radio']")) {
    const div = document.getElementById("swal2-validation-message")
    if (div) {
      div.innerHTML = "" // Limpiar contenido del div
      div.style.display = "none" // Ocultar el div
    }
  }
})
</script>

<template>
  <VCard class="d-flex align-center rounded-lg" variant="outlined" @click="sendRequestElecAuth">
    <VCardText class="text-body-2 text-primary text-justify">
      {{ t('tabSummary.request_approve.text_card') }}
      <div class="d-flex justify-center align-center text-primary pa-2">
        <VIcon icon="tabler-send" size="48" />
        <div class="line-height font-weight-bold" style="width: 120px;">
          {{ t('tabSummary.request_approve.title_card') }}
        </div>
      </div>
    </VCardText>
  </VCard> 
</template>
