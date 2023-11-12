<script>
import axios from '@/plugins/axios'
import Swal from '@/plugins/sweetalert2'
import { useI18n } from "vue-i18n"
import useEventsBus from '@/utils/eventBus'

export default {
  props: {
    fields: {
      type: Array,
      default: () => ([]),
      required: true,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    endpoint: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    emptyText: {
      type: String,
      default: "No hay registros",
    },
    tableClass: {
      type: String,
      default: "",
    },
    typeLetter: {
      type: Number,
      default: 1,
    },
  },
  emits: ['loading', 'saving'],
  setup(props, { emit }) {

    const pageable = ref({})
    const items = ref([])
    const { t } = useI18n()
    const { bus } = useEventsBus()

    // 👉 Computing pagination data
    const currentPage = computed(() => pageable.value.number + 1)
    const totalPages = computed(() => pageable.value.totalPages)
    const rows = computed(() => items.value)
    const errorsLetters = ref([])
    const countError = ref(0)
    const iterable = ref(0)
    const showModal = ref(false)

    const startRow = computed(() => {
      const { size, number } = pageable.value
      
      return size * number + 1
    })

    const endRow = computed(() => {
      const { size, number, numberOfElements } = pageable.value
      
      return size * number + numberOfElements
    })

    const paginationData = computed(() => `Registros de ${startRow.value} hasta ${endRow.value} de ${pageable.value.totalElements}`)

    const getData = async payload => {
      emit('loading', true)

      const { params: paramsProp, endpoint } = props
      const customProps = Object.entries(paramsProp).reduce((a,[k,v]) => (v == null || v === -1 ? a : (a[k]=v, a)), {})
      const params = { ...customProps, ...payload }

      try {
        const { data } = await axios.get(endpoint, { params })
        const { content, ...result } = data
      
        items.value = content.map(item => ({ ...item, hashLocal: null, upload: false }))
        if (content.length === 0) {
          await Swal.fire({
            icon: 'warning',
            text: t('dataTablaServerSide.msg_no_info'),
          })
        }

        pageable.value = result

      } catch (error) {        
        if (error.response && error.response.status < 500) {
          const { message } = error.response.data

          Swal.fire({ icon: 'warning', text: message })
        }
      } finally {
        emit('loading', false)
      }
    }

    const savedChanges = () => {
      errorsLetters.value = []
      countError.value = 0
      iterable.value = 0

      if (rows.value.length === 0) {
        return Swal.fire({
          icon: 'warning',
          text: t('dataTablaServerSide.msg_no_info'),
        })
      }
      
      if (props.typeLetter === 1) {

        if (rows.value.some(item => item.hashLocal !== null)) {

          rows.value.forEach(async item => {
            iterable.value++

            if (item.hashLocal !== null) {

              let validate = item.observationsResignationLetter === null ? true 
                : item.observationsResignationLetter.length > 250 ? false : true 
            
              if (validate) {
                emit('saving', true)

                try {

                  const formData = new FormData()

                  formData.append("file", item.hashLocal)
                  formData.append("candidateDni", item.candidateDni)
                  formData.append("inscriptionId", item.inscriptionId)
                  formData.append("inscriptionChangeId", item.inscriptionChangeId || -1)
                  formData.append("observations", item.observationsResignationLetter !== null ? item.observationsResignationLetter : "")
                  formData.append("letterTypeId", props.typeLetter)

                  const { data } = await axios.post(`/v1/files/candidates/letter`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  })

                  item.hashResignationLetter = data.hash
                  item.letterNameResignation = data.name
                  item.hashLocal = null
                  item.upload = true

                  Swal.fire({ icon: "success", text: t('module_documents.alerts.success') })
                } catch (err) {
                  let message = `No fue posible cargar la Carta de Renuncia del Candidato ${item.firstname} ${item.secondname} ${item.firstsurname} ${item.secondsurname}`
                  if (err.response && err.response.status < 500) 
                    message = err.response.data.message
                
                  errorsLetters.value.push({
                    rowField: item.rowField,
                    candidateDni: item.candidateDni,
                    error: message,
                  })
                  
                  countError.value++
                } finally {
                  emit('saving', false)
                }
              } else {
                errorsLetters.value.push({
                  rowField: item.rowField,
                  candidateDni: item.candidateDni,
                  error: `Por favor validar los campos`,
                })

                countError.value++
              }
            }
          })

        } else {
          return Swal.fire({
            icon: 'warning',
            text: t('dataTablaServerSide.msg_not_change'),
          })
        }

      } else {
        
        if (rows.value.some(item => item.hashLocal !== null)) {

          rows.value.forEach(async item => {
            iterable.value++

            if (item.hashLocal !== null) {

              let validate = item.observationsApproveLetter === null ? true 
                : item.observationsApproveLetter.length > 250 ? false : true 
  
              if (validate) {
                emit('saving', true)

                try {

                  const formData = new FormData()

                  formData.append("file", item.hashLocal)
                  formData.append("candidateDni", item.candidateDni)
                  formData.append("inscriptionId", item.inscriptionId)
                  formData.append("inscriptionChangeId", item.inscriptionChangeId || -1)
                  formData.append("observations", item.observationsApproveLetter !== null ? item.observationsApproveLetter : "")
                  formData.append("letterTypeId", props.typeLetter)

                  const { data } = await axios.post(`/v1/files/candidates/letter`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  })

                  item.hashApproveLetter = data.hash
                  item.letterNameApprove = data.name
                  item.hashLocal = null
                  item.upload = true

                  Swal.fire({ icon: "success", text: t('module_documents.alerts.success_approve') })
                } catch (err) {
                  let message = `No fue posible cargar la Carta de Aceptación del Candidato ${item.firstname} ${item.secondname} ${item.firstsurname} ${item.secondsurname}`
                  if (err.response && err.response.status < 500) 
                    message = err.response.data.message
      
                  errorsLetters.value.push({
                    rowField: item.rowField,
                    candidateDni: item.candidateDni,
                    error: message,
                  })
                  
                  countError.value++
                } finally {
                  emit('saving', false)
                }
              } else {
                errorsLetters.value.push({
                  rowField: item.rowField,
                  candidateDni: item.candidateDni,
                  error: `Por favor validar los campos`,
                })

                countError.value++
              }
            }
          })

        } else {
          return Swal.fire({
            icon: 'warning',
            text: t('dataTablaServerSide.msg_not_change_approve'),
          })
        }

      }
    }

    const refresh = (value = null) => {
      const page = value || currentPage.value

      getData({ page: page - 1 })
    } 

    watch(() => bus.value.get('search'), () => {
      getData({ page: 0 })
    })
    
    watch(() => bus.value.get('saveChanges'), () => {
      savedChanges()
    })

    watch(countError, () => {
      if (countError.value > 0 && iterable.value == rows.value.length && errorsLetters.value.length > 0) {
        showModal.value = true
      }
    })

    onMounted(() => {
      getData({ page: 0 })
    })

    return {
      currentPage,
      totalPages,
      errorsLetters,
      showModal,

      // Computed
      startRow,
      endRow,
      rows,
      paginationData,
      
      // Pageable
      refresh,
    }
  },
}
</script>

<template>
  <VTable density="compact" class="text-no-wrap text-center" :class="tableClass">
    <thead class="table-light text-muted">
      <slot name="v-thead" />      
      <tr>
        <th 
          v-for="item in fields" 
          :key="item.key"
          :class="item.thClass" 
          scope="col"
        >
          {{ item.label || item.key }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-if="loading">
        <tr>
          <td :colspan="fields.length">
            <div class="text-center">
              <VProgressCircular size="50" indeterminate />
            </div> 
          </td>
        </tr>
      </template>
      <template v-else>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(item, colIndex) in fields" :key="colIndex" scope="col">
            <slot :name="`cell(${item.key})`" :value="row[item.key] || null" :item="row">
              {{ row[item.key] || "" }}
            </slot>
          </td>
        </tr>
        <tr v-if="rows.length == 0">
          <td :colspan="fields.length">
            <p class="text-muted my-5 fs-14 text-center">
              {{ emptyText }}
            </p> 
          </td>
        </tr>
      </template>
    </tbody>
  </VTable>

  <template v-if="rows.length > 0">
    <VDivider />

    <!-- SECTION Pagination -->
    <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3">
      <!-- 👉 Pagination meta -->
      <span class="text-sm text-disabled">{{ paginationData }}</span>

      <!-- 👉 Pagination -->
      <VPagination
        :model-value="currentPage"
        size="small"
        :total-visible="5"
        :length="totalPages"
        :disabled="loading"
        @update:model-value="refresh"
      />
    </VCardText>
  </template>

  <VDialog
    v-model="showModal" 
    width="800"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="showModal = !showModal" />

    <!-- Dialog Content -->
    <VCard class="text-wrap" :title="$t('module_documents.alerts.label_error')">
      <VCardText>
        <VDivider class="mb-3" />
        <VTable class="table">
          <thead>
            <tr>
              <th scope="col">
                {{ $t('candidates.row_field') }}
              </th>
              <th scope="col">
                {{ $t('module_documents.alerts.dni') }}
              </th>
              <th scope="col">
                {{ $t('module_documents.alerts.description') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in errorsLetters" :key="item.rowField">
              <th scope="row">
                {{ item.rowField }}
              </th>
              <td>{{ item.candidateDni }}</td>
              <td>{{ item.error }}</td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </VDialog>
</template>


<style scoped>
.btn {
  border-radius: 0.25rem !important;
}
</style>
