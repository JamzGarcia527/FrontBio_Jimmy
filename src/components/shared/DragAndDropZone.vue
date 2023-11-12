<script setup>
import { ref } from "vue"

const props = defineProps({
  componentId: { type: String, required: true },
  accepts: { type: String, default: '*' },
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
    <label :for="`dropzoneFile${componentId}`" class="cursor-pointer pa-0">
      <slot>
        <div class="text-center">
          <div class="mb-2">
            <VIcon class="text-h2" icon="tabler-cloud-upload" />
          </div>
          <div>Examinar</div>
        </div>
      </slot>
    </label>
    <input
      :id="`dropzoneFile${componentId}`" type="file" class="dropzoneFile btn btn-primary"
      :accept="accepts"
    >
  </div>
</template>



<style scope>
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(var(--v-theme-grey-500));
  border-radius: 6px;
  background-color: transparent;
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
