<script setup>
import { ref } from "vue"

const props = defineProps({
  numId: { type: Number, default: 0 },
  accepts: { type: String, default: "*" },
})

const active = ref(false)

const toggleActive = () => {
  active.value = !active.value
}
</script>

<template>
  <div
    :class="{ 'active-dropzone': active }"
    class="dropzone position-relative"
    @dragenter.prevent="toggleActive"
    @dragleave.prevent="toggleActive"
    @dragover.prevent
    @drop.prevent="toggleActive"
  >
    <label :for="`dropzoneFile${numId}`" class="d-flex cursor-pointer">
      <div class="mb-1 text-center" style="width: 35%;">
        <VIcon class="display-4" icon="tabler-cloud-upload" />
      </div>
      <span
        :for="`dropzoneFile${numId}`"
        class="bg-light text-dark stretched-link text-center"
        style="width: 65%;"
      >Cargar Archivo</span>
    </label>
    <br>
    <input
      :id="`dropzoneFile${numId}`"
      type="file"
      class="dropzoneFile btn btn-primary notAllowedEmulator"
      :accept="accepts"
    >
  </div>
</template>



<style scoped>
.display-4 {
  font-size: 3rem;
  line-height: 1.2;
}

.dropzone {
  display: flex;
  flex-direction: row !important;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(var(--v-theme-grey-500));
  border-radius: 6px;
  background-color: transparent !important;
  row-gap: 16px;
  transition: all 0.3s ease;
}

.active-dropzone {
  border-color: #fff;
  background-color: transparent;
  color: #fff;
}

.position-relative {
  position: relative !important;
}

.text-muted {
  color: #878a99 !important;
}

.dropzone input {
  display: none;
}

.dropzone label {
  padding-block: 8px;
  padding-inline: 12px;
  transition: all 0.3s ease;
}

.stretched-link {
  position: static;
}
</style>
