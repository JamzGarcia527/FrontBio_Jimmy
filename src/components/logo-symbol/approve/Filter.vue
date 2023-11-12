<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { requiredEspecialSelectValidator } from "@/utils/validators"
import { useI18n } from "vue-i18n"
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'

defineProps({
  title: { type: String, default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['next', 'clearFormFilter'])

const { t } = useI18n()
const generalfilter = useGeneralFilter()
const listGroupingPoliticalName = ref([])
const clearFilter = ref(false)

const formFilter = ref({
  groupingPoliticalId: -1,
})

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

// const corporations = computed(() => {
//   const array = generalfilter
//     .corporations
//     .map(e => ({ title: e.name, value: e.id }))

//   return addOptionDefault(array)
// })

// const circunscriptions = computed(() => {
//   const array = generalfilter
//     .circunscriptionsByCorporation
//     .map(e => ({ title: e.name, value: e.id }))

//   return addOptionDefault(array)
// })

// const departments = computed(() => {
//   const array = generalfilter
//     .departments
//     .map(e => ({ title: e.name, value: e.id }))

//   return [{ title: "Seleccione una opción o escriba", value: -1 }, ...array ]
// })

// const municipalities = computed(() => {
//   const array = generalfilter
//     .municipalities
//     .map(e => ({ title: e.name, value: e.id }))

//   return [{ title: "Seleccione una opción o escriba", value: -1 }, ...array ]
// })

// const communes = computed(() => {
//   const array = generalfilter
//     .comunes
//     .map(e => ({ title: e.name, value: e.id }))

//   return [{ title: "Seleccione una opción o escriba", value: -1 }, ...array ]
// })

// const blankVotePromoterOptions = computed(() => {
//   const array = [{ title: 'Sí', value: 1 },{ title: 'No', value: 0 }]
  
//   return addOptionDefault(array)
// })

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .groupingPoliticalTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const groupingPoliticals = computed(() => {
  const array = listGroupingPoliticalName.value
    .map(e => ({ title: `${e.groupingpoliticalId} - ${e.groupingpoliticalName}`, value: e.groupingpoliticalId }))
    .sort((a, b) => a.value - b.value)

  return addOptionDefault(array)
})

const rules = reactive({
  // corporations: [requiredEspecialSelectValidator],
  // circunscriptions: [value => {
  //   if (generalfilter.idCorporation === -1) return true

  //   return (value != null && value != -1) || 'Este campo es requerido'
  // }],
  // isBlankVotePromote: [requiredEspecialSelectValidator],
  // departments: [value => {
  //   if (generalfilter.idCorporation === -1) return true

  //   return (value != null && value != -1) || 'Este campo es requerido'
  // }],
  // municipalities: [value => {
  //   if (generalfilter.idDepartment === -1 || !generalfilter.enableMunicipality) return true

  //   return (value != null && value != -1) || 'Este campo es requerido'
  // }],
  // communes: [value => {
  //   if (generalfilter.idMunicipality === -1 || !generalfilter.enableCommune) return true

  //   return (value != null && value != -1) || 'Este campo es requerido'
  // }],
  groupingPoliticalTypes: [requiredEspecialSelectValidator],
  groupingPoliticals: [requiredEspecialSelectValidator],
})

// const handlerChangeCorporation = async value => {
//   generalfilter.setCorporation(value)

//   const {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     groupingPoliticalTypeId,
//     municipality,
//     isBlankVotePromote,
//   } = generalfilter.selected

//   const requestParams = {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     municipality,
//     promoterBlankVote: isBlankVotePromote,
//     groupingPoliticalTypeId,
//   }

//   await getGroupingPoliticalName(requestParams)
// }

// const handlerChangeCircunscription = async value => {
//   generalfilter.setCircunscription(value)

//   const {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     groupingPoliticalTypeId,
//     municipality,
//     isBlankVotePromote,
//   } = generalfilter.selected

//   const requestParams = {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     municipality,
//     promoterBlankVote: isBlankVotePromote,
//     groupingPoliticalTypeId,
//   }

//   await getGroupingPoliticalName(requestParams)
// }

// const handlerChangeBlankVote = async value => {
//   generalfilter.setBlankVotePromoter(value)

//   const {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     groupingPoliticalTypeId,
//     municipality,
//     isBlankVotePromote,
//   } = generalfilter.selected

//   const requestParams = {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     municipality,
//     promoterBlankVote: isBlankVotePromote,
//     groupingPoliticalTypeId,
//   }

//   await getGroupingPoliticalName(requestParams)
// }

// const handlerChangeDeparment = async value => {
//   generalfilter.setDepartment(value)

//   const {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     groupingPoliticalTypeId,
//     municipality,
//     isBlankVotePromote,
//   } = generalfilter.selected

//   const requestParams = {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     municipality,
//     promoterBlankVote: isBlankVotePromote,
//     groupingPoliticalTypeId,
//   }

//   await getGroupingPoliticalName(requestParams)
// }

// const handlerChangeMunicipality = async value => {
//   generalfilter.setMunicipality(value)

//   const {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     groupingPoliticalTypeId,
//     municipality,
//     isBlankVotePromote,
//   } = generalfilter.selected

//   const requestParams = {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     municipality,
//     promoterBlankVote: isBlankVotePromote,
//     groupingPoliticalTypeId,
//   }

//   await getGroupingPoliticalName(requestParams)
// }

// const handlerChangeCommune = async value => {
//   generalfilter.setCommune(value)

//   const {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     groupingPoliticalTypeId,
//     municipality,
//     isBlankVotePromote,
//   } = generalfilter.selected

//   const requestParams = {
//     corporationId,
//     circunscriptionId,
//     commune,
//     department,
//     municipality,
//     promoterBlankVote: isBlankVotePromote,
//     groupingPoliticalTypeId,
//   }

//   await getGroupingPoliticalName(requestParams)
// }

const handlerChangeGroupingPoliticalType = async value => {
  formFilter.value.groupingPoliticalId = -1
  generalfilter.setGroupingPoliticalType(value)

  const {
    corporationId,
    circunscriptionId,
    commune,
    department,
    groupingPoliticalTypeId,
    municipality,
  } = generalfilter.selected

  const requestParams = {
    corporationId,
    circunscriptionId,
    commune,
    department,
    municipality,
    groupingPoliticalTypeId,
  }

  await getGroupingPoliticalName(requestParams)
}

const form = ref(null)

const getGroupingPoliticalName = async value => {
  try {
    const { data } = await axios.get('/v1/grouping-political-logo/filter', { params: value })

    listGroupingPoliticalName.value = data
  } catch (error) {
    if (error.response && error.response.status < 500) {
      const { message } = error.response.data

      await Swal.fire({
        icon: "warning",
        text: message || t('assign_random_position.swal.not_operation'),
      })
    }

    return false
  }
}

const handlerNext = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return false
  clearFilter.value = true

  const { groupingPoliticalId } = formFilter.value

  const { radicate, inscriptionId } = listGroupingPoliticalName.value
    .find(item => item.groupingpoliticalId === groupingPoliticalId)

  if (radicate === null || radicate == '') {
    Swal.fire({
      icon: "warning",
      text: t('logo_symbol.generate_approval.swal.no_radicate'),
    })
  }


  emit('next', { groupingPoliticalId, radicate, inscriptionId, valid })
}

const clearFormFilter = () => {
  generalfilter.initSelected()
  formFilter.value.groupingPoliticalId = -1
  emit('clearFormFilter', true)
}
</script>

<template>
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="6">
            <VSelect 
              :label="t('common.grouping_political_type')"
              :model-value="generalfilter.idGroupingPoliticalType"
              :items="groupingPoliticalTypes" 
              :disabled="disabled"
              :rules="rules.groupingPoliticalTypes"
              @update:model-value="handlerChangeGroupingPoliticalType" 
            />
          </VCol>
          <VCol cols="12" md="6">
            <VAutocomplete 
              v-model="formFilter.groupingPoliticalId"
              :label="t('common.grouping_political_name')"
              :items="groupingPoliticals"
              :disabled="generalfilter.idGroupingPoliticalType === -1 || disabled"
              :rules="rules.groupingPoliticals"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="d-flex justify-center gap-4">
        <VBtn v-if="!disabled" :loading="loading" :disabled="disabled" type="submit">
          {{ t('common.consult') }}
        </VBtn>
        <VBtn v-if="disabled" @click="clearFormFilter">
          {{ t('common.btn_reset') }}
        </VBtn>
      </VCardText>
    </VForm>
  </VCard>
</template>

<style lang="scss">
.v-menu__content {
  inset-block-start: 100px;
}
</style>
