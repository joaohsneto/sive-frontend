<template>
  <div class="d-flex align-center justify-center fill-height">
    <v-img
      alt="Logo Central"
      class="watermark-logo position-absolute text-disabled"
      :max-width="800"
      src="/logo.svg"
      :width="500"
    />
  </div>
</template>

<script setup>
</script>

<style scoped>

.watermark-logo {
    opacity: 0.2 !important;
    max-height: 80vh;
}
</style>
