<template>
  <v-navigation-drawer
    app
    class="my-drawer"
    color="#2c3e50"
    permanent
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

        <!-- Submenus perfeitamente alinhados com o “C” -->
        <v-list-item
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
        :class="{ active: isActive('/relatorios') }"
        prepend-icon="mdi-file-document"
        to="/relatorios"
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
  import { useRoute, useRouter } from 'vue-router'
  const route = useRoute()
  const router = useRouter()

  function isActive (path) {
    return route.path === path
  }

  function logout () {
    router.push('/login')
  }
</script>

<style scoped>
.text-white { color: #ecf0f1 !important; }

/* layout geral */
.my-drawer .v-navigation-drawer__content {
  padding-left: 4px !important;
  padding-right: 4px !important;
}

.menu-list { padding-left: 0 !important; }

/* Ícones colados no texto e tudo alinhado */
::v-deep .v-list-item {
  min-height: 36px !important;
  padding-left: 2px !important;
  padding-right: 4px !important;
}

/* remove completamente o recuo padrão dos subitens */
.sub-item {
  padding-left: 0px !important;
  margin-left: -12px !important; /* traz os submenus exatamente abaixo do C */
}

/* Ícones mais próximos ao texto */
::v-deep .v-list-item__prepend {
  width: 24px !important;
  margin-left: 0 !important;
  margin-right: 4px !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* título com quebra e tamanho controlado */
.list-title {
  white-space: normal !important;
  word-break: break-word;
  display: inline-block;
  vertical-align: middle;
  max-width: 180px;
  line-height: 1.1;
}

/* hover e active com transição suave */
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

/* Rodapé: botão sair mais alto do fundo */
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
</style>
