<template>
  <!-- Botão hamburguer (só aparece em telas pequenas) -->
  <v-btn
    v-if="!drawer && isMobile"
    class="hamburger-btn"
    color="white"
    icon="mdi-menu"
    @click="drawer = true"
  />

  <!-- Drawer lateral -->
  <v-navigation-drawer
    v-model="drawer"
    app
    class="my-drawer"
    color="#2c3e50"
    :permanent="!isMobile"
    :temporary="isMobile"
    width="260"
  >
    <!-- LOGO E TÍTULO -->
    <div class="text-center pa-4">
      <v-img
        alt="Logo"
        class="mx-auto mb-2"
        cover
        max-width="90"
        src="@/assets/logo.svg"
      />
      <h3 class="text-white text-h6 font-weight-bold">
        SIVE - Monitoramento
      </h3>
    </div>

    <v-divider color="grey-darken-3" />

    <!-- MENU -->
    <v-list class="menu-list" density="compact" nav>
      <v-list-group
        class="menu-group"
        color="white"
        prepend-icon="mdi-folder"
        value="cadastros"
      >
        <template #activator="{ props }">
          <v-list-item v-bind="props" class="menu-item">
            <v-list-item-title class="text-white list-title">Cadastros</v-list-item-title>
          </v-list-item>
        </template>

        <v-list-item
          v-if="userRole === 'admin'"
          class="sub-item"
          :class="{ active: isActive('/usuarios') }"
          prepend-icon="mdi-account"
          to="/usuarios"
        >
          <v-list-item-title class="text-white list-title">Usuários</v-list-item-title>
        </v-list-item>

        <v-list-item
          class="sub-item"
          :class="{ active: isActive('/criancas-adolescentes') }"
          prepend-icon="mdi-baby-face-outline"
          to="/criancas-adolescentes"
        >
          <v-list-item-title class="text-white list-title">
            Criança/Adolescente
          </v-list-item-title>
        </v-list-item>

        <v-list-item
          class="sub-item"
          :class="{ active: isActive('/responsaveis') }"
          prepend-icon="mdi-account-group"
          to="/responsaveis"
        >
          <v-list-item-title class="text-white list-title">Responsáveis</v-list-item-title>
        </v-list-item>
      </v-list-group>

      <v-list-item
        class="menu-item"
        :class="{ active: isActive('/ficha-sive') }"
        prepend-icon="mdi-file-document"
        to="/ficha-sive"
      >
        <v-list-item-title class="text-white list-title">Gerar Ficha SIVE</v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- SAIR no rodapé -->
    <template #append>
      <div class="logout-container">
        <v-divider color="grey-darken-3" />
        <v-list-item
          class="logout-btn"
          prepend-icon="mdi-logout"
          @click="logout"
        >
          <v-list-item-title class="text-white list-title">Sair [Logout]</v-list-item-title>
        </v-list-item>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()

  const userRole = ref(localStorage.getItem('userRole') || '')
  const drawer = ref(true)
  const isMobile = ref(false)

  function checkMobile () {
    isMobile.value = window.innerWidth < 960
    drawer.value = !isMobile.value
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkMobile)
  })

  function isActive (path) {
    return route.path === path
  }

  function logout () {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }
</script>

<style scoped>
.text-white { color: #ecf0f1 !important; }

/* 🔹 Botão hamburguer fixo e discreto no canto */
.hamburger-btn {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 2000;
  background-color: rgba(44, 62, 80, 0.85);
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  border-radius: 8px;
  width: 42px;
  height: 42px;
  transition: all 0.2s ease;
}

.hamburger-btn:hover {
  background-color: rgba(44, 62, 80, 0.95);
  transform: scale(1.05);
}

/* layout geral */
.my-drawer .v-navigation-drawer__content {
  padding-left: 4px !important;
  padding-right: 4px !important;
}

.menu-list { padding-left: 0 !important; }

::v-deep .v-list-item {
  min-height: 36px !important;
  padding-left: 2px !important;
  padding-right: 4px !important;
}

.sub-item {
  padding-left: 0px !important;
  margin-left: -12px !important;
}

::v-deep .v-list-item__prepend {
  width: 24px !important;
  margin-left: 0 !important;
  margin-right: 4px !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.list-title {
  white-space: normal !important;
  word-break: break-word;
  display: inline-block;
  vertical-align: middle;
  max-width: 180px;
  line-height: 1.1;
}

::v-deep .v-list-item {
  transition: background-color 0.25s ease, transform 0.2s ease;
}
::v-deep .v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  transform: translateX(2px);
}
.active {
  background-color: rgba(59, 85, 110, 0.95) !important;
  border-radius: 6px;
  transform: scale(1.02);
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.logout-container {
  position: absolute;
  bottom: 20px;
  width: 100%;
  left: 0;
  padding-left: 6px;
  padding-right: 6px;
}
.logout-btn {
  min-height: 44px;
  border-radius: 6px;
  transition: background-color 0.25s ease, transform 0.2s ease;
}
.logout-btn:hover {
  background-color: rgba(255,255,255,0.08);
  transform: translateX(3px);
}
.logout-btn ::v-deep .v-list-item__prepend {
  width: 28px !important;
  margin-right: 6px !important;
}

/* 🔧 Evita o scroll do menu lateral */
::v-deep(.v-navigation-drawer__content) {
  overflow-y: hidden !important;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

/* Ajusta a área de menu para ocupar o espaço entre o topo e o botão sair */
.menu-list {
  flex: 1;
  overflow-y: auto;
}

/* Em telas menores, o menu vira conteúdo fluido */
@media (max-width: 960px) {
  ::v-deep(.v-navigation-drawer__content) {
    height: auto !important;
    overflow-y: visible !important;
  }

  .logout-container {
    position: relative !important;
    bottom: 0 !important;
    margin-top: 1rem;
  }
}
</style>
