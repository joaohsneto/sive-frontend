<template>
  <v-container class="login-page pa-0 fill-height" fluid>
    <v-row class="fill-height" no-gutters>
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

      <v-col class="right-panel d-flex align-center justify-center" cols="12" md="6">
        <v-card class="login-card pa-8" elevation="4">
          <h3 class="mb-6 text-center font-weight-medium" :style="{ color: '#347899' }">Acesso ao Sistema</h3>
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="credentials.login"
              class="mb-4"
              color="#3B7D9D"
              :disabled="loading"
              label="Usuário (Login)"
              prepend-inner-icon="mdi-account"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="credentials.senha"
              class="mb-4"
              color="#3B7D9D"
              :disabled="loading"
              label="Senha"
              prepend-inner-icon="mdi-lock"
              required
              type="password"
              variant="outlined"
            />
            <v-btn
              block
              class="py-5 text-white"
              color="#3B7D9D"
              :loading="loading"
              prepend-icon="mdi-login"
              type="submit"
            >
              Entrar
            </v-btn>
            <div class="text-center mt-3">
              <p v-if="error" class="text-red">{{ error }}</p>
              <a class="forgot-link" href="#">Esqueci minha senha</a>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import api from '@/services/api'

  const router = useRouter()
  const credentials = ref({
    login: '',
    senha: '',
  })
  const loading = ref(false)
  const error = ref(null)

  async function handleLogin () {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', credentials.value)
      const { token, usuario } = response.data

      if (!token || !usuario || !usuario.funcao) {
        throw new Error('Erro ao fazer login: token ou função ausentes.')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('userRole', usuario.funcao)
      localStorage.setItem('userInfo', JSON.stringify(usuario))

      router.push('/')
    } catch (error_) {
      console.error('Erro de Login:', error_)
      error.value = err.response && err.response.status === 401 ? 'Usuário ou senha incorretos.' : 'Ocorreu um erro ao tentar fazer login.'
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userInfo')
    } finally {
      loading.value = false
    }
  }
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
  width: 150px;
  height: auto;
  border-radius: 50%;
  margin-bottom: 20px;
  box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.1);
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

.text-red { color: #e53935; }
</style>
