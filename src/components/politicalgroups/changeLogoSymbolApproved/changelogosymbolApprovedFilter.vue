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

const emit = defineEmits(['next', 'clearFormFilter', 'change'])

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

const groupingPoliticalTypes = computed(() => {
  const array = generalfilter
    .groupingPoliticalTypes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const groupingPoliticals = computed(() => {
  const array = listGroupingPoliticalName.value
    .map(e => ({ title: `${e.idGroupingPolitical} - ${e.groupingPoliticalName}`, value: e.idGroupingPolitical }))

  return addOptionDefault(array)
})

const rules = reactive({
 
  groupingPoliticalTypes: [requiredEspecialSelectValidator],
  groupingPoliticals: [requiredEspecialSelectValidator],
})



const handlerChangeGroupingPoliticalType = async value => {
  generalfilter.setGroupingPoliticalType(value)
  formFilter.value.groupingPoliticalId = -1

  const {
    groupingPoliticalTypeId,
  } = generalfilter.selected

  const requestParams = {
    typeId: groupingPoliticalTypeId,
  }

  emit('change')
  await getGroupingPoliticalName(requestParams)
}

const handlerChangeGroup = () => {
  emit('change')
}

const form = ref(null)

const getGroupingPoliticalName = async value => {
  try {
    const { data } = await axios.get('/grouping-political/list-groupingpolitical-approved-logo', { params: value })

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

  emit('next', { idGroupingPolitical: formFilter.value.groupingPoliticalId, data: [...listGroupingPoliticalName.value] })
}
</script>

<template>
  <div>
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
                :disabled="disabled"
                :rules="rules.groupingPoliticals"
                @update:model-value="handlerChangeGroup"
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
  </div>
</template>

<style lang="scss">
.v-menu__content {
  inset-block-start: 100px;
}
</style>

