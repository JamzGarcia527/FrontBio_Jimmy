<script setup>
import { useI18n } from "vue-i18n"
import AppDateTimePicker from "@/@core/components/AppDateTimePicker.vue"
import { isEmptyArray, isNullOrUndefined } from '@core/utils/index'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useVuelidate } from "@vuelidate/core"
import {  helpers } from "@vuelidate/validators"
import {
  requiredVuelidate,
  integerVuelidate,
} from "@/utils/validators/vuelidate"

const props = defineProps({ 
  modelValue: { type: Boolean, default: false },
  dateInitE6: { type: String, default: null },
})

const emit = defineEmits(['update:model-value'])

const paramsId = computed(() => Number(route.params.id))

const formDataDes = ref({
  description:'',
})


const rules = computed(() =>({
  description: {
    length: helpers.withMessage(
      "El Campo observación tiene un máximo de 500 caracteres",
      value => !value || String(value).length < 499,
    ),
  },
}))

// 👉 Required Validator
const requiredValidator = value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return t('opening_preinscription.field_required')
  
  return !!String(value).trim().length || t('opening_preinscription.field_required')
}

// Translate i18n
const { t } = useI18n()

//Datatime
const dialogDateE6 = ref(props.dateInitE6)
const dateE7 = ref('')
const dateCloseE6 = ref('')
const dateCloseE7 = ref('')
const route = useRoute()

const refForm = ref()
const minDateEndE6 = ref(null)
const disabledDateEndE6 = ref(false)
const minDateEndE7 = ref(null)
const disabledDateEndE7 = ref(false)

const dataUser = ref({})
const descriptionsSwo = ref(false)

const changeStatusDateEndE6 = value => {
  disabledDateEndE6.value = false
  dateCloseE6.value = ''
  descriptionsSwo.value = true
}

const methodChangeDateE6 = value =>{
  disabledDateEndE6.value = true
  minDateEndE6.value = value
}

const changeStatusDateEndE7 = value => {
  disabledDateEndE7.value = false
  dateCloseE7.value = ''
  descriptionsSwo.value = true
}

const methodChangeDateE7 = value =>{
  disabledDateEndE7.value = true
  minDateEndE7.value = value
}

const v$ = useVuelidate(rules, formDataDes)

const saveDates = async () =>{

  v$.value.$touch()
  if (v$.value.$invalid) return

  const { valid } = await refForm.value.validate()

  if (valid){
    const{ description }=formDataDes.value

    dataUser.value.content[0].initialDateSix = dialogDateE6.value
    dataUser.value.content[0].finalDateSix = dateCloseE6.value 
    dataUser.value.content[0].initialDateSeven = dateE7.value
    dataUser.value.content[0].finalDateSeven = dateCloseE7.value
    dataUser.value.content[0].observation = description
    dataUser.value.content[0].userId = paramsId

    axios.put("/v1/phases-user", dataUser.value.content[0]).then(response => {
      if (response.status == 200) {
        msnPhases(t('opening_preinscription.success_phases_update'), "success")
        returnView()
      }else{
        msnPhasest(t('opening_preinscription.warning_phases_update'), "warning")
      }
    }).catch(error => {
      
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: "warning", text: message })
      }
    }) 
  }
}

const msnPhases = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}

const returnView = () =>{
  window.history.back()
}


onMounted(() => {
  axios.get("/v1/phases-user/list-filter?userName=&userId="+paramsId.value+"&rolName=").then(response => {
    descriptionsSwo.value = false
    dataUser.value = response.data
    dialogDateE6.value = dataUser.value.content[0].initialDateSix
    dateCloseE6.value = dataUser.value.content[0].finalDateSix
    dateE7.value = dataUser.value.content[0].initialDateSeven
    dateCloseE7.value = dataUser.value.content[0].finalDateSeven
    
  })
})
</script>

<template>
  <div class="layout-default">
    <VBreadcrumbs :items="[ t('opening_preinscription.breadcrumbs.title'), t('opening_preinscription.breadcrumbs.item_one') ]" />
    <VCard :title="t('opening_preinscription.title_edit_form')">
      <VCardTitle>
        <hr>
      </VCardTitle>
      <VCardText>
        <VForm
          ref="refForm"
          @submit.prevent="() => {}"
        >
          <div class="layout-default">
            <VCard>
              <VRow>
                <VRow class="pa-12 py-8">
                  <VCol cols="12" md="6">
                    <VCard variant="outlined">
                      <VCardTitle>
                        <VRow class="pa-3">
                          <h6 class="font">
                            {{ t('opening_preinscription.card_title_e6') }}
                          </h6>
                        </VRow>
                        <VRow>
                          <VCol cols="11" md="11" class="ma-4 py-1">
                            <AppDateTimePicker 
                              v-model="dialogDateE6" 
                              prepend-inner-icon="mdi-calendar-outline" 
                              :label="t('opening_preinscription.opening_date')" 
                              :rules="[requiredValidator]"
                              :config="{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i:ss'}"
                              @change="methodChangeDateE6(dialogDateE6)"
                              @click="changeStatusDateEndE6"
                            />
                          </VCol>
                        </VRow>
                        <VRow>
                          <VCol cols="11" md="11" class="ma-4 py-1">
                            <AppDateTimePicker
                              v-if="disabledDateEndE6"
                              v-model="dateCloseE6"
                              prepend-inner-icon="mdi-calendar-clock-outline" 
                              :label="t('opening_preinscription.closing_date')" 
                              :config="{ 
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i:ss',
                                minDate: minDateEndE6}"
                              :rules="[requiredValidator]"
                            />
                          </VCol>
                        </VRow>
                      </VCardTitle>
                    </VCard>
                  </VCol>
                  <VCol cols="12" md="6">
                    <VCard variant="outlined">
                      <VCardTitle>
                        <VRow class="pa-3">
                          <h6 class="font">
                            {{ t('opening_preinscription.card_title_e7') }}
                          </h6>
                        </VRow>
                        <VRow>
                          <VCol cols="11" md="11" class="ma-4 py-1">
                            <AppDateTimePicker 
                              v-model="dateE7" 
                              prepend-inner-icon="mdi-calendar-outline" 
                              :label="t('opening_preinscription.opening_date')" 
                              :rules="[requiredValidator]"
                              :config="{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i:ss'}"
                              @change="methodChangeDateE7(dateE7)"
                              @click="changeStatusDateEndE7"
                            />
                          </VCol>
                        </VRow>
                        <VRow>
                          <VCol cols="11" md="11" class="ma-4 py-1">
                            <AppDateTimePicker
                              v-if="disabledDateEndE7"
                              v-model="dateCloseE7"
                              prepend-inner-icon="mdi-calendar-clock-outline" 
                              :label="t('opening_preinscription.closing_date')" 
                              :config="{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i:ss',
                                minDate: minDateEndE7}"
                              :rules="[requiredValidator]" 
                            />
                          </VCol>
                        </VRow>
                      </VCardTitle>
                    </VCard>
                  </VCol>
                  <VCol v-if="descriptionsSwo" cols="12" md="12">
                    <VCard variant="outlined">
                      <VCardTitle>
                        <VRow class="pa-3">
                          <h6 class="font">
                            {{ t('upload_logo.observacion') }}
                          </h6>
                        </VRow>
                        <div class="ps-5 mr-5">
                          <VTextarea
                            v-if="dialogDateE6"
                            v-model.trim="formDataDes.description" 
                            :error-messages="v$.description.$errors[0]?.$message"
                            prepend-inner-icon="tabler-message-2" 
                            :label="t('upload_logo.observacion')"
                          />
                        </div>
                      </VCardTitle>
                    </VCard>
                  </VCol>
                  <VCol cols="12" md="12">
                    <VRow justify="center" class="py-2 gap-3">
                      <VBtn rounded="pill" variant="outlined" flat @click="returnView">
                        {{ t("opening_preinscription.exit_opening") }}
                      </VBtn>
                      <VBtn
                        type="submit"
                        @click="saveDates"
                      >
                        {{ t("opening_preinscription.save_opening") }}
                      </VBtn>
                    </VRow>
                  </VCol>
                </VRow>
              </VRow>
            </VCard>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "src/styles/listCandidates.scss";
</style>

<route lang="yaml">
name: "phases-edit-id"
meta:
  authRequired: true
</route>

