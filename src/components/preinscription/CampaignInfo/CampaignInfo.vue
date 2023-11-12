<script setup>
import { useI18n } from "vue-i18n"
import DataTable from '@/components/shared/DataTable.vue'
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import DialogInfo from '@/components/preinscription/CampaignInfo/DialogInfo.vue'
import DialogForm from '@/components/preinscription/CampaignInfo/DialogForm.vue'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { useCustomMessage } from "@/composables/useCustomMessage"

const props = defineProps({
  inscriptionId: { type: String, required: true },
  groupingPoliticalTypeId:{ type: Number, required: true },
  isUninominal: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
})

const { t } = useI18n()
const { can } = useAppAbility()
const messageComposable = useCustomMessage()

const fields = computed(() => ([
  { key: 'nameCandidat', label: 'Candidato' },
  { key: 'nameManager', label: 'Nombres Y Apellidos' },
  { key: 'dniManager', label: 'Cédula' },
  { key: 'rowField', label: 'Renglón', hidden: props.isUninominal },
  { key: 'celularPhone', label: 'Célular' },
  { key: 'callsign', label: 'Indicativo' },
  { key: 'phone', label: 'Teléfono Fijo' },
  { key: 'email', label: 'Correo Electrónico' },
  { key: 'action', label: 'Acciones' },
].filter(e => !e.hidden)))

const items = ref([])
const itemsFilters = ref([])

const infoShowDialog = ref(false)
const formShowDialog = ref(false)
let shoudEditForm = ref(false)
let itemEdit = ref(null)

const dataDialog = ref({})

const valueLabelSearch = ref(null)

const showDialog = value => {
  dataDialog.value = value
  infoShowDialog.value = true
  formShowDialog.value = false
}

const showFormDialog = () => {
  formShowDialog.value = true
}

const getCampaignInfo = async () => {
 
  try {

    const { data } = await axios.get('/v1/campaign/get-campaign-information/'+toRefs(props).inscriptionId.value)

    const dataFormate = data.map(e => ({
      nameCandidat: (e.firstNameCandidat + ' ' + e.secondNameCandidat + ' ' + e.firstSurnameCandidat + ' ' + e.secondSurnameCandidat).trim(),
      nameManager: (e.firstNameManager + ' ' + e.secondNameManager + ' ' + e.firstSurnameManager + ' ' + e.secondSurnameManager).trim(),
      nameCounter: (e.firstNameCounter + ' ' + (e.secondNameCounter == null ? '' : e.secondNameCounter + ' ') + e.firstSurnameCounter + ' ' + (e.secondSurnameCounter == null ? '' : e.secondSurnameCounter)).trim(),
      action: e.id,
      ...e,
    }))

    items.value = dataFormate
    itemsFilters.value = dataFormate
    
    return true

  } catch (error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0003"),
      })
    }
    
    return false
  }
}

getCampaignInfo()

const handleSubmit = async value => {
  try {

    const requestBody = {
      "inscriptionId": value.form.value.inscriptionId || toRefs(props).inscriptionId.value,
      "candidateDni": value.form.value.candidateDni,
      "idCandidat": value.form.value.idCandidat,
      "dniManager": value.form.value.dniManager,
      "firstNameManager": value.form.value.firstNameManager,
      "secondNameManager": value.form.value.secondNameManager,
      "firstSurnameManager": value.form.value.firstSurnameManager,
      "secondSurnameManager": value.form.value.secondSurnameManager,
      "celularPhone": value.form.value.celularPhone,
      "callsign": null,
      "phone": value.form.value.phone,
      "email": value.form.value.email,
      "accountNumber": value.form.value.accountNumber,
      "financialEntity": value.form.value.financialEntity,
      "accountType": value.form.value.accountType,
      "dniCounter": value.form.value.dniCounter,
      "firstNameCounter": value.form.value.firstNameCounter,
      "secondNameCounter": value.form.value.secondNameCounter,
      "firstSurnameCounter": value.form.value.firstSurnameCounter,
      "secondSurnameCounter": value.form.value.secondSurnameCounter,
      "professionalCard": value.form.value.professionalCard,
      "numberBooksAccount": value.form.value.numberBooksAccount,
      "all": value.form.value.isCheck,
      "phase":"E6",
      "inscriptionChangeId":null,
    }

    if(value.edit.value) {
      await axios.put('/v1/campaign/campaign-information/' + value.form.value.id, requestBody)
      
    } else {
      await axios.post('/v1/campaign/campaign-information', requestBody)
    }


    formShowDialog.value = false
    getCampaignInfo()
  } catch(error) {
    if (error.response && error.response.status != 500) {
      const { message } = error.response.data

      // TODO: Pasar los mensajes por el i18n
      await Swal.fire({
        icon: 'warning',
        text: message || messageComposable.get("MS0017"),
      })
    }
  } finally {
    shoudEditForm.value = false
  }
}

const searchListCampaign = () => {
  if (valueLabelSearch.value.length > 0) {
    itemsFilters.value = items.value.filter(word =>
      word.nameCandidat.toUpperCase().includes(valueLabelSearch.value.toUpperCase()),
    )
  } else {
    itemsFilters.value = items.value
  }
}

const editForm = item => {
  itemEdit.value = item
  shoudEditForm.value = true
  formShowDialog.value = true
}

const closeForm = () => {
  itemEdit.value = null
  shoudEditForm.value = false
}
</script>

<template>
  <div>
    <DialogInfo
      v-model="infoShowDialog"
      :data="dataDialog"
    />
    <DialogForm
      v-model="formShowDialog"
      :inscription-id="inscriptionId" 
      :grouping-political-type-id="groupingPoliticalTypeId"
      :data="itemEdit"
      :edit="shoudEditForm"
      @submit="handleSubmit"
      @closed="closeForm"
    />
    <VCard>
      <VRow>
        <VCol class="v-col-sm-6 px-12 py-12">
          <VTextField
            v-model="valueLabelSearch"
            :label="t('candidates.search')"
            append-inner-icon="mdi-magnify"
            @keyup="searchListCampaign"
          />
        </VCol>
        <VCol class="v-col-sm-6 px-12 py-12 text-end">
          <VBtn
            v-if="can('post', 'campaign-information')"
            @click="showFormDialog"
          >
            Ingrese Información de Campaña
          </VBtn>
        </VCol>
      </VRow>
      <VCard v-if="items.length != 0" variant="flat">
        <VCard variant="tonal" class="rounded-0">
          <h4 class="text-center bold">
            {{ t('candidates.title_table') }}
          </h4>
        </VCard>
        <DataTable :items="itemsFilters" :fields="fields" paginate>
          <template #cell(action)="{ item }">
            <div class="text-center text-no-wrap">
              <VBtn
                class="text-center"
                icon="mdi-magnify"
                variant="text"
                color="secondary"
                @click="showDialog(item)"
              />
              <VBtn
                v-if="can('post', 'campaign-information')"
                class="text-center"
                icon="mdi-square-edit-outline"
                variant="text"
                color="secondary"
                @click="editForm(item)"
              />
            </div>
            <!-- :to="{ name: 'political-groups-update', params: {id: item.id} }" -->
          </template>
          <template #cell(rowField)="{ value }">
            <div class="text-center">
              {{ value }}
            </div>
          </template>
        </DataTable>
      </VCard>
      <VCard v-else>
        <VAlert color="secondary">
          No hay registros para mostrar
        </VAlert>
      </VCard>
    </VCard>
  </div>
</template>

<style lang="scss">
.justify-content-between {
  justify-content: space-between !important;
}

.d-flex {
  display: flex !important;
}

.text-end {
  text-align: end !important;
}

.text-center {
  text-align: center !important;
}
</style>
