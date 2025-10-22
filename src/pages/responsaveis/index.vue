<template>
  <div class="pa-4">
    <v-card class="pa-10" elevation="2">
      <v-row class="d-flex justify-space-between align-center mb-4">
        <h2 :style="{ color: '#347899' }">Gerenciar Responsáveis</h2>
        <v-btn
          class="text-none"
          prepend-icon="mdi-plus"
          :style="{ backgroundColor: '#347899', color: 'white' }"
          @click="abrirModalNovo"
        >
          Novo Cadastro
        </v-btn>
      </v-row>

      <v-card-item>
        <v-data-table
          class="custom-table"
          :header-props="{ class: 'header-color' }"
          :headers="headers"
          :items="responsaveisFiltrados"
          :loading="carregando"
          loading-text="Carregando responsáveis..."
        >
          <template #top>
            <v-row class="justify-start mt-4">
              <v-col cols="12" md="3" sm="4">
                <v-text-field
                  v-model="filtro"
                  clearable
                  color="#347899"
                  density="compact"
                  label="Pesquisar..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </template>

          <template #loading>
            <v-sheet class="pa-3 text-center">
              <v-progress-circular color="#347899" indeterminate size="32" />
              <div class="mt-2">Carregando responsáveis...</div>
            </v-sheet>
          </template>

          <template #item.acoes="{ item }">
            <div class="actions-cell">
              <v-btn
                icon="mdi-pencil"
                :style="{ color: '#347899' }"
                variant="text"
                @click="abrirModalEditar(item)"
              />
              <v-btn
                icon="mdi-delete"
                :style="{ color: '#C02929' }"
                variant="text"
                @click="abrirModalConfirmarExclusao(item)"
              />
            </div>
          </template>
        </v-data-table>
      </v-card-item>
    </v-card>

    <v-dialog v-model="modalAberto" max-width="800px">
      <v-card>
        <v-card-title
          class="text-h6 px-6 pt-6"
          :style="{ color: '#347899' }"
        >
          {{ editando ? 'Editar Responsável' : 'Cadastrar Responsável' }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValido">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="responsavelForm.nome"
                  color="#347899"
                  density="compact"
                  label="Nome Completo"
                  required
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="responsavelForm.cpf"
                  color="#347899"
                  density="compact"
                  label="CPF"
                  maxlength="11"
                  required
                  :rules="[
                    v => !!v || 'CPF é obrigatório',
                    v => (v && v.length === 11 && /^\d+$/.test(v)) || 'O CPF deve ter 11 dígitos (somente números)'
                  ]"
                  variant="outlined"
                  @input="maskCpf"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="responsavelForm.email"
                  color="#347899"
                  density="compact"
                  label="E-mail"
                  required
                  :rules="[v => !!v || 'E-mail é obrigatório', v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido']"
                  type="email"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="responsavelForm.funcao"
                  color="#347899"
                  density="compact"
                  hint="Opcional"
                  label="Função"
                  persistent-hint
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="responsavelForm.telefone"
                  color="#347899"
                  density="compact"
                  hint="Opcional"
                  inputmode="numeric"
                  label="Telefone (Fixo/Celular)"
                  maxlength="11"
                  persistent-hint
                  :rules="[
                    v => !v || (v.length >= 10 && v.length <= 11) || 'Telefone deve ter entre 10 e 11 dígitos'
                  ]"
                  type="tel"
                  variant="outlined"
                  @input="responsavelForm.telefone = responsavelForm.telefone.replace(/\D/g, '')"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="responsavelForm.whatsapp"
                  color="#347899"
                  density="compact"
                  hint="Opcional"
                  inputmode="numeric"
                  label="Telefone WhatsApp"
                  maxlength="11"
                  persistent-hint
                  :rules="[
                    v => !v || (v.length >= 10 && v.length <= 11) || 'Telefone deve ter entre 10 e 11 dígitos'
                  ]"
                  type="tel"
                  variant="outlined"
                  @input="responsavelForm.whatsapp = responsavelForm.whatsapp.replace(/\D/g, '')"
                />
              </v-col>

            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            elevation="0"
            :style="{ backgroundColor: '#E0E0E0', color: '#347899' }"
            @click="fecharModal"
          >
            Cancelar
          </v-btn>
          <v-btn
            :loading="carregandoBtn"
            :style="{ backgroundColor: '#347899', color: 'white' }"
            @click="salvarResponsavel"
          >
            {{ editando ? 'Atualizar' : 'Salvar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="modalExcluir" max-width="400px">
      <v-card class="pa-4">
        <v-card-title
          class="text-h6 pb-4"
          :style="{ color: '#347899' }"
        >
          Confirmar Exclusão
        </v-card-title>
        <v-card-text :style="{ color: '#347899' }">
          Tem certeza que deseja remover o responsável
          <strong>{{ responsavel?.nome }}</strong>?
        </v-card-text>
        <v-card-actions class="pt-4">
          <v-spacer />
          <v-btn
            elevation="0"
            :style="{ backgroundColor: '#E0E0E0', color: '#347899' }"
            @click="fecharModalExcluir"
          >
            Cancelar
          </v-btn>
          <v-btn
            :loading="carregandoBtn"
            :style="{ backgroundColor: '#C02929', color: 'white' }"
            @click="confirmarExclusao"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 🎉 Snackbar estilizado e animado -->
    <v-slide-y-transition>
      <v-snackbar
        v-model="snackbar.show"
        class="custom-toast"
        :color="snackbar.color"
        elevation="8"
        location="top center"
        timeout="4000"
        variant="elevated"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-2" :icon="snackbar.icon" />
          <span>{{ snackbar.text }}</span>
        </div>
      </v-snackbar>
    </v-slide-y-transition>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import api from '@/services/api'

  const responsaveis = ref([])
  const carregando = ref(false)
  const carregandoBtn = ref(false)
  const modalAberto = ref(false)
  const modalExcluir = ref(false)
  const editando = ref(false)
  const formValido = ref(false)
  const formRef = ref(null)
  const responsavel = ref(null)
  const filtro = ref('')

  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    icon: 'mdi-check-circle-outline',
  })

  // === Toast moderno ===
  function exibirToast (text, type = 'info') {
    const config = {
      success: { color: 'success', icon: 'mdi-check-circle-outline' },
      error: { color: 'error', icon: 'mdi-alert-circle-outline' },
      warning: { color: 'warning', icon: 'mdi-alert-outline' },
      info: { color: 'info', icon: 'mdi-information-outline' },
    }

    const { color, icon } = config[type] || config.info

    snackbar.value = {
      show: true,
      text,
      color,
      icon,
    }
  }

  // === Estrutura do formulário ===
  const responsavelForm = ref({
    responsavel_id: null,
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    whatsapp: '',
    funcao: '',
  })

  // === Definição dos cabeçalhos da v-data-table ===
  const headers = [
    { title: 'Nome', key: 'nome' },
    { title: 'CPF', key: 'cpf' },
    { title: 'E-mail', key: 'email' },
    { title: 'Telefone', key: 'telefone' },
    { title: 'Função', key: 'funcao' },
    { title: 'Ações', key: 'acoes', sortable: false, align: 'center' },
  ]

  // === Computed para filtro ===
  const responsaveisFiltrados = computed(() => {
    if (!filtro.value) return responsaveis.value
    const termo = filtro.value.toLowerCase()
    return responsaveis.value.filter(r =>
      r.nome?.toLowerCase().includes(termo)
      || r.cpf?.toLowerCase().includes(termo)
      || r.email?.toLowerCase().includes(termo)
      || r.funcao?.toLowerCase().includes(termo),
    )
  })

  // === Funções de Máscara ===
  function maskCpf (event) {
    let value = event.target.value.replace(/\D/g, '')
    if (value.length > 11) {
      value = value.slice(0, 11)
    }
    responsavelForm.value.cpf = value
  }

  // === Funções CRUD ===
  async function carregarResponsaveis () {
    try {
      carregando.value = true
      const { data } = await api.get('/cadastros/responsavel')
      responsaveis.value = data
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao carregar responsáveis', 'error')
    } finally {
      carregando.value = false
    }
  }

  function abrirModalNovo () {
    responsavelForm.value = {}
    editando.value = false
    modalAberto.value = true
  }

  function abrirModalEditar (item) {
    responsavelForm.value = { ...item }
    editando.value = true
    modalAberto.value = true
  }

  function fecharModal () {
    modalAberto.value = false
  }

  async function salvarResponsavel () {
    if (!formRef.value?.validate()) return
    carregandoBtn.value = true

    const payload = { ...responsavelForm.value }

    try {
      if (editando.value) {
        await api.put(`/cadastros/responsavel/update?responsavel_id=${payload.responsavel_id}`, payload)
        exibirToast('Responsável atualizado com sucesso!', 'success')
      } else {
        delete payload.responsavel_id
        await api.post('/cadastros/responsavel', payload)
        exibirToast('Responsável cadastrado com sucesso!', 'success')
      }
      fecharModal()
      await carregarResponsaveis()
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao salvar responsável', 'error')
    } finally {
      carregandoBtn.value = false
    }
  }

  // === Exclusão ===
  function abrirModalConfirmarExclusao (item) {
    responsavel.value = item
    modalExcluir.value = true
  }

  function fecharModalExcluir () {
    modalExcluir.value = false
  }

  async function confirmarExclusao () {
    carregandoBtn.value = true
    try {
      const id = responsavel.value.responsavel_id
      await api.delete(`/cadastros/responsavel/delete?responsavel_id=${id}`)
      exibirToast('Responsável excluído com sucesso!', 'success')
      modalExcluir.value = false
      await carregarResponsaveis()
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao excluir responsável', 'error')
    } finally {
      carregandoBtn.value = false
    }
  }

  onMounted(() => {
    carregarResponsaveis()
  })
</script>

<style>
/* Estilo para o cabeçalho da tabela */
.header-color {
  background-color: #347899 !important;
  color: white !important;
}
/* Para o `v-text-field` do formulário e da pesquisa na tabela */
.v-text-field .v-field__input {
    color: #347899 !important;
}
/* Para os icones da coluna Ações não quebrar a linha */
.actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}
/* 🌟 Toast moderno */
.custom-toast {
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  padding: 12px 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}
</style>
