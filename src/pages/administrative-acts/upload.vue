<script setup>
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import UploadFilter from "@/components/administrative-acts/UploadFilter.vue"
import AddCandidate from "@/components/administrative-acts/AddCandidate.vue"
import WithdrawCandidate from "@/components/administrative-acts/WithdrawCandidate.vue"
import RevokeCandidate from "@/components/administrative-acts/RevokeCandidate.vue"

const candidateWillBeRevoked = ref(false)
const candidateToBeAdded = ref(false)
const candidateIsWithdrawing = ref(false)
const listRowfields = ref({})
const filters = ref({})
const availableLines = ref({})

const handlerFilter = async value => {
  candidateWillBeRevoked.value = value.action === 1
  candidateIsWithdrawing.value = value.action === 2
  candidateToBeAdded.value = value.action === 3

  const {
    groupingPoliticalTypeId,
    groupingPoliticalId,
    corporationId,
    circunscriptionId,
    department,
    municipality,
    commune,
  } = value

  const queryParams = {
    groupingPoliticalType: groupingPoliticalTypeId,
    groupingPoliticalId,
    corporationId,
    circunscriptionId,
    department,
    municipality,
    commune,
  }

  filters.value = queryParams
  if (candidateIsWithdrawing.value || candidateWillBeRevoked.value) {
    await getLines(queryParams)
  }

  if (candidateToBeAdded.value) {
    await getAvailableLines(queryParams)
  }
}

const getLines = async value => {
  try {
    const { data } = await axios.get("/v1/administrative-acts/list-row-field", {
      params: value,
    })

    listRowfields.value = data

    return true
  } catch (error) {
    // capturar errores
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
    
    return false
  }
}

const getAvailableLines = async value => {
  try {
    const { data } = await axios.get("/v1/omd/filter/omd/create/row-field", {
      params: value,
    })

    availableLines.value = data

    return true
  } catch (error) {
    // capturar errores
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      Swal.fire({ icon: "warning", text: message })
    }
    
    return false
  }
}

const refreshData = async value => {
  if (value) {
    await getLines(filters.value)
  }
}

const refreshDataAvailableLines = async value => {
  if (value) {
    await getAvailableLines(filters.value)
  }
}

const handlerReset = value => {
  candidateWillBeRevoked.value = value
  candidateIsWithdrawing.value = value
  candidateToBeAdded.value = value
}
</script>

<template>
  <div>
    <UploadFilter
      class="mb-4" 
      @search="handlerFilter" 
      @reset-filter="handlerReset" 
    />
    <AddCandidate :lines="availableLines" :is-visible="candidateToBeAdded" @refresh-data="refreshDataAvailableLines" />
    <WithdrawCandidate :lines="listRowfields" :is-visible="candidateIsWithdrawing" @refresh-data="refreshData" />
    <RevokeCandidate :lines="listRowfields" :is-visible="candidateWillBeRevoked" @refresh-data="refreshData" />
  </div>
</template>

<route lang="yaml">
name: "administrative-acts-upload"
meta:
  authRequired: true
</route>

