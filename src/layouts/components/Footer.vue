<script setup>

const version = APP_VERSION
</script>

<template>
  <div class="h-100 d-flex align-center justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center">
      <!-- &copy; {{ new Date().getFullYear() }} Registraduría Nacional -->
      Todos los derechos reservados 2023 
      <template v-if="version">
        - versión {{ version }}
      </template>
    </span>
  </div>
</template>
