<template>
  <v-app>
    <SideBar v-if="showSidebar" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import SideBar from './components/SideBar.vue'

  const route = useRoute()

  // Oculta o sidebar apenas na tela de login
  const showSidebar = computed(() => route.path !== '/login')
</script>
