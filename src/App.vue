<template>
  <v-app>
    <SideBar v-if="showSidebar" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import { computed, watchEffect } from 'vue'
  import { useRoute } from 'vue-router'
  import SideBar from './components/SideBar.vue'

  const route = useRoute()

  // === Trecho para empurrar pra baixo os cards principais das páginas selecionas ===
  watchEffect(() => {
    // limpa as classes anteriores
    document.body.classList.remove(
      'page-criancas-adolescentes',
      'page-responsaveis',
      'page-usuarios',
      'page-ficha-sive',
    )

    // adiciona classe conforme a rota
    if (['/criancas-adolescentes', '/responsaveis', '/usuarios', '/ficha-sive'].includes(route.path)) {
      const className = 'page' + route.path.replace('/', '-')
      document.body.classList.add(className)
    }
  })
  // === Fim do trecho para empurrar pra baixo os cards principais das páginas selecionas ===

  // Oculta o sidebar apenas na tela de login
  const showSidebar = computed(() => route.path !== '/login')
</script>

<style>
/* TRECHO PARA EMPURRAR OS CARDS PARA BAIXO EM PÁGINAS ESPECÍFICAS */
/* Só nas páginas especificadas */
.page-criancas-adolescentes main,
.page-criancas-adolescentes .v-main,
.page-responsaveis main,
.page-responsaveis .v-main,
.page-usuarios main,
.page-usuarios .v-main,
.page-ficha-sive main,
.page-ficha-sive .v-main {
  /* comportamento normal */
}

@media (max-width: 960px) {
  .page-criancas-adolescentes main,
  .page-criancas-adolescentes .v-main,
  .page-responsaveis main,
  .page-responsaveis .v-main,
  .page-usuarios main,
  .page-usuarios .v-main,
  .page-ficha-sive main,
  .page-ficha-sive .v-main {
    margin-top: 60px !important; /* empurra os cards pra baixo */
  }
}
/* TRECHO PARA EMPURRAR OS CARDS PARA BAIXO EM PÁGINAS ESPECÍFICAS */

</style>
