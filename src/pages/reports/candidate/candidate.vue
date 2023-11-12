
<script setup>
import { ref, toRefs } from 'vue'
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import ImgSearch from "@/assets/images/pages/new-img-user.png"

 
const searchByDni= ref('')
const searchError = ref('')
const dataCandidate = ref([])
const showTable= ref(false)
const selectedOption = ref('')
let dni = ''

const selectDownload=()=>{
  downloadIReportFile()
}


const downloadIReportFile=async ()=>{
  const response = await axios.get("/v1/candidates/candidate-report-e6/by-dn-export/"+dni+"?format="+selectedOption.value, {
    responseType: 'blob', // Indicamos que la respuesta es un archivo
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


const getInfoCandidate = () => {
  dni = searchByDni.value
  if (searchByDni.value.trim() === '') {
    searchError.value = 'El campo es requerido'
  } else {
    searchError.value = ''
    axios.get("/v1/candidates/candidate-report-e6/by-dni/"+searchByDni.value).then(data=>{
      dataCandidate.value = data.data
      if (dataCandidate.value.length>0){
        showTable.value = true

      }else{
        showTable.value = false
        Swal.fire(
          {
            text: 'El número de cédula no existe',
            icon: 'warning',
          },
        )

      }
    })
   
  }

}
</script>

<template>
  <VBreadcrumbs :items="[ $t('common.home'), $t('candidate.title')]" />
  
  <Vcontainer>
    <Vlayaout>
      <VCard>
        <VCardTitle style="color: #bebdc0;">
          <VBreadcrumbs :items="[$t('candidate.title')]" />
        </VCardTitle>
        <hr class="horizontal-line">
        <div class="div-search">
          <label>{{ $t('candidate.name_search') }}</label><br>
          <input v-model="searchByDni" type="search" class="search">
       
          <button class="button-search" @click="getInfoCandidate">
            Buscar
          </button>
          <label v-if="searchError" class="valid"><br>
            {{ searchError }}
          </label>
        </div>
        <VCardTitle style="color: #bebdc0;">
          <VBreadcrumbs :items="[$t('candidate.sub_title')]" />
        </VCardTitle>
        <hr class="horizontal-line">

        <div v-if="showTable" class="table">
          <div>
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
          <VTable
            fixed-header
            height="300px"
          >
            <thead>
              <tr>
                <th class="text-left">
                  {{ $t('candidate.table.dni') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.names') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.last_name') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.status') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.created_at') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.created_by') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.update_at') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.update_by') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.name_grounping_political') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.corporation') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.circunscription') }}
                </th>
                <th class="text-left">
                  {{ $t('candidate.table.place') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in dataCandidate" :key="result.inscriptionId">
                <td>{{ result.dni }}</td>
                <td>{{ result.candidateName }}</td>
                <td>{{ result.lastnameCandidate }}</td>
                <td>{{ result.status }}</td>
                <td>{{ result.createdAt }}</td>
                <td>{{ result.createdBy }}</td>
                <td>{{ result.updatedAt }}</td>
                <td>{{ result.updateBy }}</td>
                <td>{{ result.grounpingPolitical }}</td>
                <td>{{ result.corporation }}</td>
                <td>{{ result.circunscription }}</td>
                <td>{{ result.place }}</td>
              </tr>
            </tbody>
          </VTable>
        </div>
        <div v-if="!showTable" class="contentNoInformation">
          <div>
            <div class="img-main">
              <VImg :src="ImgSearch" class="img-candidate" />
            </div>
          
            <label class="label1">
              No ha filtrado información del candidato <br>
            </label>
            <label class="label2">
              Filtre la información por número de cedula del candidato
            </label>
          </div>
        </div>
      </VCard>
    </Vlayaout>
  </Vcontainer>
</template>

<style scoped>
.horizontal-line {
  inline-size: 97%;
  margin-block: 0;
  margin-inline: auto;
}

.div-search {
  margin-block-end: 5%;
  margin-block-start: 5%;
  margin-inline-start: 2%;
}

.div-search .search {
  border: 1px solid #d2d2d5;
  border-radius: 2.5em;
  block-size: 40px;
  color: #bebdc0;
  inline-size: 40%;
  padding-block: 5px;
  padding-inline: 10px;
}

.div-search .search:focus {
  outline: none;
}

.div-search .button-search {
  border-radius: 1.5em;
  background-color: #002d55;
  color: white;
  margin-inline-start: 4%;
  padding-block: 8px;
  padding-inline: 20px;
}

.title {
  color: #bebdc0;
}

.valid {
  color: red;
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
  inline-size: 60%;
}

.table {
  margin-block-start: 5%;
}

.select {
  border: none;
  border-radius: 1.5em;
  background-color: #002d55;
  color: white;
  margin-block-end: 2%;
  margin-inline-start: 2%;
  padding-block: 8px;
  padding-inline: 20px;
}

.select:focus {
  outline: none;
}
</style>

<route lang="yaml">
  name: "reports-candidate-candidate"
  meta:
    authRequired: true
  </route>
