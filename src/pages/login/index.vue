<template>
  <v-container class="login-page pa-0 fill-height" fluid>
    <v-row class="fill-height" no-gutters>
      <!-- Lado Esquerdo -->
      <v-col class="left-panel d-flex flex-column align-center justify-center" cols="12" md="6">
        <div class="text-center pa-4">
          <v-img
            alt="Logo"
            class="logo mx-auto mb-2"
            cover
            src="@/assets/logo.svg"
          />
          <h2 class="system-title">SIVE</h2>
          <p class="system-subtitle">
            Sistema de Monitoramento de Violência e Evasão
          </p>
        </div>
      </v-col>

      <!-- Lado Direito -->
      <v-col class="right-panel d-flex align-center justify-center" cols="12" md="6">
        <v-card class="login-card pa-8" elevation="4">
          <h3 class="mb-6 text-center font-weight-medium">Acesso ao Sistema</h3>
          <v-form>
            <v-text-field
              class="mb-4"
              color="#3B7D9D"
              label="E-mail (Login)"
              prepend-inner-icon="mdi-email"
              variant="outlined"
            />
            <v-text-field
              class="mb-4"
              color="#3B7D9D"
              label="Senha"
              prepend-inner-icon="mdi-lock"
              type="password"
              variant="outlined"
            />
            <v-btn
              block
              class="py-5 text-white"
              color="#3B7D9D"
              prepend-icon="mdi-login"
            >
              Entrar
            </v-btn>
            <div class="text-center mt-3">
              <a class="forgot-link" href="#">Esqueci minha senha</a>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
</script>

<style scoped>
.login-page {
  background-color: #f7f9fa;
}

.left-panel {
  background-color: #2C3E50;
  color: white;
  text-align: center;
  padding: 40px;
}

.logo-container {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

.logo {
  width: 150px; /* Logo maior, conforme solicitado */
  height: auto;
  border-radius: 50%;
  margin-bottom: 20px;
  box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.1); /* Um leve destaque */
}

.system-title {
  font-size: 2.5em;
  margin-bottom: 10px;
  color: #ecf0f1;
}

.system-subtitle {
  font-size: 1.1em;
  color: #bdc3c7;
}

.right-panel {
  background-color: #f8fafb;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 10px;
}

.v-btn {
  font-weight: 500;
  text-transform: none;
}

.forgot-link {
  color: #3B7D9D;
  font-size: 14px;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}
</style>
