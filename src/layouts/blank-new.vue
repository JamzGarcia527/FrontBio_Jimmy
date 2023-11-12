<script setup>
import Footer from '@/layouts/components/Footer.vue'
import { useSkins } from '@core/composable/useSkins'

const { injectSkinClasses } = useSkins()

// ℹ️ This will inject classes in body tag for accurate styling
injectSkinClasses()
</script>

<template>
  <div class="layout-wrapper layout-blank">
    <div class="background-login">
      <div class="auth-body">
        <div class="auth-main d-flex align-center">
          <RouterView />
        </div>
        <footer class="layout-footer">
          <div class="footer-content-container">
            <Footer />
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-wrapper.layout-blank {
  flex-direction: column;
}

.background-login {
  background-size: cover;
  block-size: 100%;
  background-color: white;
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
