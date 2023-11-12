<script setup>
import DataTable from "@/components/shared/DataTable.vue"
import axios from "@/plugins/axios"
import Swal from "@/plugins/sweetalert2"
import { useAppAbility } from "@/plugins/casl/useAppAbility"
import { useI18n } from "vue-i18n"

const props = defineProps({
  groupingPoliticalTypeId: { type: Number, required: true },
  inscriptionId: { type: Number, required: true },
  items: { type: Object, required: true },
  enableCheck: { type: Boolean, required: false },
})

const { t } = useI18n()
const { can } = useAppAbility()


const fields = [
  { key: 'name', label: 'Chequeo Documental' },
  { key: 'actions', label: 'Acciones', thClass: 'text-center' },
]

const updateCheck = async item => {
  if (!props.enableCheck) {
    item.responseCheck = 0

    return Swal.fire({
      text: "Esta acción no es permitida en esta pantalla",
      icon: "warning",
      confirmButtonText: "Aceptar",
      customClass: { confirmButton: "btn btn-primary notAllowedEmulator" },
    })
  }

  if (!can('post', 'checks')) {
    item.responseCheck = 0

    return Swal.fire({
      text: t("validations.privileges"),
      icon: "warning",
      confirmButtonText: "Aceptar",
      customClass: { confirmButton: "btn btn-primary notAllowedEmulator" },
    })
  }

  const payload = {
    inscriptionId: props.inscriptionId,
    checkId: item.id,
    responseCheck: item.responseCheck,
  }

  try {
    await axios.post(`v1/check_inscription`, payload)
  } catch (err) {
    item.responseCheck = 0

    Swal.fire({
      text: "Ocurrio un error, por favor intente más tarde",
      icon: "warning",
      confirmButtonText: "Aceptar",
      customClass: { confirmButton: "btn btn-primary notAllowedEmulator" },
    })
  }  
}
</script>

<template>
  <div>
    <DataTable 
      :fields="fields" 
      :items="props.items" 
      :rows-per-page="15"
      paginate 
    >
      <template #cell(actions)="{ item }">
        <div class="container-radio notAllowedEmulator" style="width: 150px;">
          <VRadioGroup 
            v-model="item.responseCheck" 
            inline
            :disabled="item.responseCheck !== 0 || !can('post', 'checks') || !props.enableCheck"
            @change="updateCheck(item)"
          >
            <VRadio 
              label="Si"
              :value="1"
            />

            <VRadio 
              label="No"
              :value="2"
            />
          </VRadioGroup>
        </div>
      </template>
    </DataTable>
  </div>
</template>


<style lang="scss" scoped>
//
</style>
