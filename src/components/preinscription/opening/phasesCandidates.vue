<script setup>
import { useI18n } from "vue-i18n"
import AppDateTimePicker from "@/@core/components/AppDateTimePicker.vue"
import { isEmptyArray, isNullOrUndefined } from '@core/utils/index'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { ref } from "vue"
import { useVuelidate } from "@vuelidate/core"
import {  helpers } from "@vuelidate/validators"
import useEventBus from "@/utils/eventBus"



// 👉 Required Validator
const requiredValidator = value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return t('opening_preinscription.field_required')
  
  return !!String(value).trim().length || t('opening_preinscription.field_required')
}

// Translate i18n
const { t } = useI18n()
const { emit: emiting } = useEventBus()

//Datatime
const dateE6 = ref('')
const dateE7 = ref('')
const dateCloseE6 = ref('')
const dateCloseE7 = ref('')

const refForm = ref()
const minDateEndE6 = ref(null)
const disabledDateEndE6 = ref(false)
const minDateEndE7 = ref(null)
const disabledDateEndE7 = ref(false)

const descriptionsSwo = ref(false)


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

const changeStatusDateEndE6 = value => {
  disabledDateEndE6.value = true
  dateCloseE6.value = ''
  descriptionsSwo.value = true
}

const methodChangeDateE6 = (selectedDates, dateStr, instance) =>{
  disabledDateEndE6.value = true
  minDateEndE6.value = dateStr
 
}

const changeStatusDateEndE7 = value => {
  disabledDateEndE7.value = true
  dateCloseE7.value = ''
  descriptionsSwo.value = true
}

const methodChangeDateE7 = (selectedDates, dateStr, instance) =>{
  disabledDateEndE7.value = true
  console.log(dateStr)
  minDateEndE7.value = dateStr
}

const restartDates = () => {
  dateE6.value = null
  dateCloseE6.value = null
  dateE7.value = null
  dateCloseE7.value = null
  formDataDes.value = {}
  v$.value.$reset()
  descriptionsSwo.value = true
}


const v$ = useVuelidate(rules, formDataDes)

const saveDates = async () =>{

  v$.value.$touch()
  if (v$.value.$invalid) return

  const { valid } = await refForm.value.validate()

  if (valid){
    const{ description }=formDataDes.value

    const arraySave = { 
      "initialDateSix": dateE6.value, 
      "finalDateSix": dateCloseE6.value, 
      "initialDateSeven": dateE7.value, 
      "finalDateSeven": dateCloseE7.value, 
      "observation": description, 
    }


    axios.post("/v1/phase", arraySave).then(response => {
      if (response.status == 201) {
        msnPhases(t('opening_preinscription.success_phases'), "success")
        emiting('updatePhasesCandidates', true)
      }else{
        msnPhases(t('opening_preinscription.success_phases'), "warning")
      }
    }).catch(error => {
      
      if (error.response && error.response.status < 500) {
        const { message } = error.response.data

        Swal.fire({ icon: "warning", text: message })
        restartDates()
      }
    })
    
  }
}

const msnPhases = async function (message, typeMessage) {
  Swal.fire(message, "", typeMessage)
}



const consultPhasesSave = () => {
  axios.get("/v1/phase").then(response => {
    
    response.data.forEach(item => {
      if(item.name == 'E6'){
        dateE6.value = item.initialDate
        minDateEndE6.value = item.initialDate
        dateCloseE6.value = item.finalDate
        descriptionsSwo.value = false
      }else if(item.name == 'E7'){
        dateE7.value = item.initialDate
        minDateEndE7.value = item.initialDate
        dateCloseE7.value = item.finalDate
        descriptionsSwo.value = false
      }
    })
  })
}

onMounted(() => {
  consultPhasesSave()
})
</script>

<template>
  <div class="layout-default">
    <VForm
      ref="refForm"
      @submit.prevent="() => {}"
    >
      <VCard :title="t('opening_preinscription.page_title')">
        <VCardTitle>
          <hr>
        </VCardTitle>
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
                        v-model="dateE6" 
                        prepend-inner-icon="mdi-calendar-outline" 
                        :label="t('opening_preinscription.opening_date')" 
                        :rules="[requiredValidator]"
                        :config="{
                          enableTime: true,
                          dateFormat: 'Y-m-d H:i:ss'}"
                        @on-change="methodChangeDateE6"
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
                          dateFormat: 'Y-m-d H:i:ss'
                        }"
                        :rules="[requiredValidator, value => value >= dateE6 || 'Fecha de cierre no puede ser inferior a la de apertura']"
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
                        :rules="[requiredValidator, value => value >= dateCloseE6 || 'Fecha de apertura de modificaciones no puede ser inferior a la fecha de cierre de pre-inscripciones']"
                        :config="{ 
                          enableTime: true,
                          dateFormat: 'Y-m-d H:i:ss'}"
                        @on-change="methodChangeDateE7"
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
                          dateFormat: 'Y-m-d H:i:ss'
                        }"
                        :rules="[requiredValidator, value => value >= dateE7 || 'Fecha de cierre no puede ser inferior a la de apertura']"
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
                <VBtn
                  rounded="pill" variant="outlined" flat
                  @click="restartDates"
                >
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
            <UsersTable />
          </VRow>
        </VRow>
      </VCard>
    </VForm>
  </div>
</template>

<style lang="scss">
.v-messages__message {
  white-space: normal !important;
}
</style>
