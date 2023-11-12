<script setup>
import Footer from '@/layouts/components/Footer.vue'
import { useSkins } from '@core/composable/useSkins'

const { injectSkinClasses } = useSkins()

// ℹ️ This will inject classes in body tag for accurate styling
injectSkinClasses()
</script>

<template>
  <div class="layout-wrapper layout-blank">
    <div id="auth-particles" class="auth-one-bg-position auth-one-bg">
      <div class="bg-overlay" />
      <div class="shape">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 1440 120"
        >
          <path
            d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8
            1440,40L1440 140L0 140z"
          />
        </svg>
      </div>
    </div>
    <div class="auth-body">
      <div class="auth-main d-flex flex-column align-center">
        <RouterView />
      </div>
      <footer class="layout-footer">
        <div class="footer-content-container">
          <Footer />
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper.layout-blank {
  flex-direction: column;
}

.auth-one-bg {
  background-position: 50%;
  background-size: cover;
}

.auth-one-bg-position {
  position: absolute;
  block-size: 50%;
  inline-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
}

.bg-overlay {
  position: absolute;
  background-color: #000;
  block-size: 100%;
  inline-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
  opacity: 0.7;
}

.auth-one-bg .bg-overlay {
  background-color: #003057;
  opacity: 0.8;
}

.auth-one-bg .shape {
  position: absolute;
  inset-block-end: 0;
  inset-inline: 0;
  inset-inline-start: 0;
  pointer-events: none;
}

.auth-one-bg .shape > svg {
  block-size: auto;
  fill: rgba(var(--v-theme-background)) !important;
  inline-size: 100%;
  vertical-align: middle;
}

.auth-body {
  display: flex;
  flex-direction: column;
  min-block-size: 100vh;
}

.auth-main {
  flex: 1 0 auto;
}
</style>
