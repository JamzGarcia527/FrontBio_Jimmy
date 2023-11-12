<script setup>
import { useGeneralFilter } from "@/stores/generalfilter"
import { useI18n } from "vue-i18n"
import { watch } from 'vue'
import axios from '@/plugins/axios'
import ImgSearch from "@/assets/images/pages/new-img-user.png"

defineProps({

  title: { type: String, default: null },

  disabled: { type: Boolean, default: false },

  loading: { type: Boolean, default: false },

})


const emit = defineEmits(['search'])
const result = ref(null)
const loading = ref(false)
const error = ref(null)
const { t } = useI18n()
const send = ref(false)
const selectedOption = ref('')



const generalfilter = useGeneralFilter()

generalfilter.loadFilters().then(() => {
  generalfilter.initSelected()
})

const addOptionDefault = array => {
  return [ { title: t('common.select_one_option'), value: -1 }, ...array]
}

const corporations = computed(() => {
  const array = generalfilter
    .corporations
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const circunscriptions = computed(() => {
  const array = generalfilter
    .circunscriptionsByCorporation
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

const departments = computed(() => {
  const array = generalfilter
    .departments
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})


const municipalities = computed(() => {
  const array = generalfilter
    .municipalities
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})





const communes = computed(() => {
  const array = generalfilter
    .comunes
    .map(e => ({ title: e.name, value: e.id }))

  return addOptionDefault(array)
})

let form = null

const handlerNext = async () => {
  const { valid } = await form.validate()
  if (!valid) return false

  loading.value = true

  const {
    corporationId: corp, 
    circunscriptionId: circ, 
    department: depa,
    municipality: muni,
    commune: comu,
  } = generalfilter.$state.selected

  const payload = {
    exte: 1,
    corp,
    circ,
    depa,
    muni,
    comu,
  }
}



const getData  = async () => {
  loading.value = true
  if(generalfilter.idCorporation ==-1){
    send.value = false  
  }else{

    try {
      const response = await axios.get('/v1/corporations/amount/candidate/by/Corporation', {
        params: {
          corporation: generalfilter.idCorporation,  
          circunscriptionId: generalfilter.idCircunscription,  
          department: generalfilter.idDepartment,  
          municipality: generalfilter.idMunicipality,  
          commune: generalfilter.idCommune, 
        },
      })

      result.value = response.data
      send.value = true
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

 


}

const selectDownload=()=>{
  downloadIReportFile()
}


const downloadIReportFile= async () =>{
  const params = {
    corporation: generalfilter.idCorporation,  
    circunscriptionId: generalfilter.idCircunscription,  
    department: generalfilter.idDepartment,  
    municipality: generalfilter.idMunicipality,  
    commune: generalfilter.idCommune,
    format:selectedOption.value,
  }

  const response = await axios.get('/v1/corporations/amount/candidate/by/Corporation/export',{
    params,
    responseType: 'blob', 
    
  })

  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')

  link.href = downloadUrl
  if(selectedOption.value=="XLS"){
    link.setAttribute('download', 'reporte.xlsx')
  }else{
    link.setAttribute('download', 'reporte.csv')

  }
 

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

watch(() => generalfilter.$state.selected, () => {
  send.value = false
}, { deep: true })
</script>




<template>
  <VBreadcrumbs :items="[ $t('common.home'), $t('candidate.candidate_corporation.title')]" />
  
  <VCard :title="title">
    <VForm ref="form" validate-on="submit" @submit.prevent="handlerNext">
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="5">
            <VSelect 
              :label="t('common.corporation')"
              :model-value="generalfilter.idCorporation"
              :items="corporations" 
            
              @update:model-value="generalfilter.setCorporation" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <VSelect 
              :label="t('common.circunscription')"
              :model-value="generalfilter.idCircunscription"
              :items="circunscriptions" 
              @update:model-value="generalfilter.setCircunscription" 
            />
          </VCol>

          <VCol cols="12" md="4">
            <VAutocomplete 
              :label="t('common.department')"
              filter-mode="some"
              :model-value="generalfilter.idDepartment"
              :items="departments"
              :disabled="disabled || !generalfilter.enableDeparment"
              @update:model-value="generalfilter.setDepartment" 
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.municipality')"
              filter-mode="some"
              :model-value="generalfilter.idMunicipality"
              :items="municipalities" 
              :disabled="disabled || !generalfilter.enableMunicipality"
              @update:model-value="generalfilter.setMunicipality" 
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <VAutocomplete 
              :label="t('common.commune')"
              filter-mode="some"
              :model-value="generalfilter.idCommune"
              :items="communes" 
              :disabled="disabled || !generalfilter.enableCommune"
              @update:model-value="generalfilter.setCommune" 
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <div class="div-boton">  
          <button class="button-search" @click="getData">
            {{ $t('candidate.candidate_corporation.button') }}
          </button>
        </div>
      </VCardText>
    </VForm>
  </VCard>
  <div v-if="send" style="margin-top: 8%;">
    <VCard>
      <div class="div-select">
        <select v-model="selectedOption" class="select" @change="selectDownload">
          <option disabled value="">
            Exportar
          </option>
          <option value="XLS">
            XLS
          </option>
          <option value="CSV">
            CSV
          </option>
        </select>
      </div>
      <VTable>
        <thead>
          <tr>
            <th class="text-left">
              {{ $t('candidate.candidate_corporation.table.corporation') }}
            </th>
            <th class="text-left">
              {{ $t('candidate.candidate_corporation.table.amount') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ result.nameCorporation }}</td>
            <td>{{ result.amountCandidate }}</td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  </div>
  <div v-if="!send" class="contentNoInformation">
    <div>
      <div class="img-main">
        <VImg :src="ImgSearch" class="img-candidate" />
      </div>
          
      <label class="label1">
        {{ $t('candidate.candidate_corporation.warning.title_main') }} <br>
      </label>
      <label class="label2">
        {{ $t('candidate.candidate_corporation.warning.title_second') }}
      </label>
    </div>
  </div>
</template>

<style scoped>
.button-search {
  border-radius: 1.5em;
  background-color: #002d55;
  color: white;
  margin-inline-start: 4%;
  padding-block: 8px;
  padding-inline: 20px;
}

.select {
  border: none;
  border-radius: 1.5em;
  background-color: #002d55;
  color: white;
  margin-inline-start: 2%;
  padding-block: 8px;
  padding-inline: 20px;
}

.select:focus {
  outline: none;
}

.div-select {
  display: grid;
  margin-block: 3%;
  padding-inline-end: 5%;
  place-items: flex-end;
}

.div-boton {
  display: grid;
  place-items: center;
}

.contentNoInformation {
  margin-block-end: 5%;
  margin-block-start: 5%;
}

.contentNoInformation div {
  text-align: center;
}

.contentNoInformation div .label1 {
  color: #bebdc0;
  font-size: 25px;
  font-weight: 500;
}

.contentNoInformation div .label2 {
  color: #bebdc0;
  font-size: 20px;
  font-weight: 350;
}

.img-main {
  display: grid;
  place-items: center;
}

.img-candidate {
  inline-size: 45%;
}
</style>


<route lang="yaml">
  name: "reports-candidate-candidatecorporation"
  meta:
    authRequired: true
  </route>
