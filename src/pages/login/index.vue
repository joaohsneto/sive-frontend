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
          <h3 class="mb-6 text-center font-weight-medium" :style="{ color: '#347899' }">
            Acesso ao Sistema
          </h3>
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
            <!-- <div class="text-center mt-3">
              <a class="forgot-link" href="#">Esqueci minha senha</a>
            </div> -->
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- 🎉 Snackbar (sistema de notificações) -->
    <v-slide-y-transition>
      <v-snackbar
        v-model="showToast"
        class="custom-toast"
        :color="toastColor"
        elevation="8"
        location="top center"
        timeout="3500"
        variant="elevated"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-2" :icon="toastIcon" />
          <span>{{ toastMessage }}</span>
        </div>
      </v-snackbar>
    </v-slide-y-transition>
  </v-container>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import api from '@/services/api'

  const router = useRouter()

  // Dados do formulário
  const credentials = ref({
    login: '',
    senha: '',
  })
  const loading = ref(false)
  const error = ref(null)

  // 🔔 Controle do toast
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref('error') // pode ser: success, error, warning, info

  // Define cor e ícone com base no tipo do toast
  const toastColor = computed(() => {
    switch (toastType.value) {
      case 'success': { return 'success'
      }
      case 'warning': { return 'warning'
      }
      case 'info': { return 'info'
      }
      default: { return 'error'
      }
    }
  })

  const toastIcon = computed(() => {
    switch (toastType.value) {
      case 'success': { return 'mdi-check-circle-outline'
      }
      case 'warning': { return 'mdi-alert-outline'
      }
      case 'info': { return 'mdi-information-outline'
      }
      default: { return 'mdi-alert-circle-outline'
      }
    }
  })

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

      // ✅ Exibe toast de sucesso
      toastMessage.value = 'Login realizado com sucesso!'
      toastType.value = 'success'
      showToast.value = true

      setTimeout(() => router.push('/'), 1000)
    } catch (error_) {
      console.error('Erro de Login:', error_)

      toastType.value = 'error'
      if (error_.response?.data?.message) {
        toastMessage.value = error_.response.data.message
      } else if (error_.message) {
        toastMessage.value = error_.message
      } else {
        toastMessage.value = 'Ocorreu um erro ao tentar fazer login.'
      }
      showToast.value = true

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

/* 🌟 Toast estilizado */
.custom-toast {
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  padding: 12px 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}
</style>
