<script setup>
import { ref, watch } from 'vue'
import useEventsBus from '@/utils/eventBus'

const props = defineProps({
  accepts: {
    type: String,
    default: "*",
  },
  allowExt: {
    type: Array,
    default: () => ["jpg", "jpeg", "pdf", "png"], // add exts in minúsculas
  },
  maxSizeFile: {
    type: Number,
    default: 1048576, // Default 1 MB in bytes
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  clear: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:image', 'resetUpload'])

const { bus } = useEventsBus()

const fileObject = ref(null)
const messagesValidate = ref("")
const isErrorValidate = ref(false)
const refInputEl = ref("")

const inputFile = file => {
  const uploadfile = file.target.files[0]

  if ( validFile(uploadfile) ) {
    const reader = new FileReader()

    reader.onload = e => {
      fileObject.value = uploadfile
      
      emit("update:image", fileObject.value)
    }
    reader.readAsDataURL(uploadfile)
  } else {
    refInputEl.value.value = ""
    fileObject.value = null

    emit("update:image", null)
  }
}

const validFile = uploadfile => {
  
  if (uploadfile.size > props.maxSizeFile) {
    messagesValidate.value = "El archivo excede el peso permitido."
    isErrorValidate.value = true

    return false
  }

  const ext = uploadfile.name.split(".").pop().toLowerCase()
  if (!props.allowExt.includes(ext)) {
    messagesValidate.value = "El archivo no cumple con una extensión permitida."
    isErrorValidate.value = true

    return false
  }

  return true
}

const clearFile = () => {
  fileObject.value = null
  refInputEl.value.value = ""
  
  emit("update:image", null)
  emit("resetUpload", false)
}

watch(() => props.clear, () => {
  if (props.clear === true) clearFile() 
})

watch(() => bus.value.get('clearFile'), () => {
  clearFile()
})
</script>

<template>
  <div>
    <VRow>
      <VCol
        cols="12"
      >
        <VBtn
          v-if="!fileObject"
          :disabled="isLoading"
          type="button"
          block
          color="primary"
          variant="outlined"
          class="py-0 notAllowedEmulator"
          @click="refInputEl?.click()"
        >
          {{ $t('upload_logo.select_button') }} <VIcon
            class="ml-1"
            icon="mdi-tray-arrow-up"
          />
        </VBtn>

        <div v-else class="my-2">
          <span>{{ `${fileObject.name.slice(0,19)}...${fileObject.name.slice(-3)}` }}</span>

          <VBtn
            :disabled="isLoading"
            type="button"
            block
            color="error"
            variant="outlined"
            class="notAllowedEmulator"
            @click="clearFile"
          >
            {{ $t('common.btn_delete') }}
          </VBtn>
        </div>

        <input
          ref="refInputEl"
          type="file"
          :accept="props.accepts"
          hidden
          class="notAllowedEmulator"
          @input="inputFile"
        >
      </VCol>
    </VRow>

    <VSnackbar 
      v-model="isErrorValidate"  
      :timeout="3000"  
      color="warning"  
    >  
      <div class="text-alert text-white box-alert-login px-4">  
        <VIcon  
          size="30"  
          icon="mdi-close-circle-outline"  
        /> {{ messagesValidate }}  
      </div>  
    </VSnackbar>
  </div>
</template>

<style lang="scss" scoped>
.v-btn.v-btn--density-default {
  block-size: 30px !important;
}
</style>
