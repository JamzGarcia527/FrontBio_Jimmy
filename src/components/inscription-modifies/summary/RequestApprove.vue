<script setup>
import axios from '@/plugins/axios'
import { useI18n } from 'vue-i18n'
import { useInscriptionModify } from '@/stores/inscriptionModify'
import Swal from '@/plugins/sweetalert2'
import { useRouter } from 'vue-router'
import { downloadBlob, openTabBlob } from '@/utils'

const props = defineProps({
  inscriptionId: { type: Number, required: true },
  radicateId: { type: String, default: "" },
})

const router = useRouter()
const inscriptionStore = useInscriptionModify()
const { t } = useI18n()

const isBlankVote = computed(() => inscriptionStore.isBlankVotePromoter)
const candidateTotal = computed(() => inscriptionStore.candidates.list.length)

const inputOptions = new Promise(resolve => {
  setTimeout(() => {
    resolve({
      '1': t('type_approved.virtual'),
      '2': t('type_approved.manual'),
    })
  }, 1000)
})

const candidatePending = computed(() => {
  return inscriptionStore
    .candidates.list
    .reduce((acc, item) => item.approveStatus != 1 ? acc + 1 : acc, 0)
})

const sendRequestElecAuth = () => {
  if (!isBlankVote.value && candidateTotal.value == 0) {
    Swal.fire({
      icon: "warning",
      text: t('tabSummary_e7.request_approve.must_register_candidates'),
    })
    
    return
  }

  Swal.fire({
    html: t('tabSummary_e7.request_approve.question'),
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
        await axios.get(`/v1/inscription-change/approve-request/${props.inscriptionId}`, { params: { type_approve_id: parseInt(radio) } })
        await Swal.fire({ 
          icon:"success", 
          text: t('tabSummary_e7.request_approve.response'),
        })

        const { data } = await axios.get(`/v1/inscription-change-approval/download?id=${props.inscriptionId}`, { responseType: 'blob' })

        downloadBlob(data, `${props.radicateId}.pdf`,'application/pdf')
        router.replace({ name: 'inscription-modifies-list' })
        
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
  <VCard class="rounded-lg" variant="outlined" @click="sendRequestElecAuth">
    <div class="d-flex justify-center align-center text-primary pa-2 h-100">
      <VIcon icon="tabler-send" size="48" />
      <div class="line-height font-weight-bold" style="width: 70%;">
        {{ t('tabSummary_e7.request_approve.title_card') }}
      </div>
    </div>
  </VCard> 
</template>
