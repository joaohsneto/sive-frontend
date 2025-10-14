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
                  hint="Opcional"
                  label="Telefone (Fixo/Celular)"
                  persistent-hint
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="responsavelForm.whatsapp"
                  color="#347899"
                  hint="Opcional"
                  label="Telefone WhatsApp"
                  persistent-hint
                  variant="outlined"
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
          <strong>{{ responsavelSelecionado?.nome }}</strong>?
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

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top"
      timeout="4000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import api from '@/services/api' // Presume-se que o serviço 'api' esteja configurado corretamente

  const responsaveis = ref([])
  const carregando = ref(false)
  const carregandoBtn = ref(false)
  const modalAberto = ref(false)
  const modalExcluir = ref(false)
  const editando = ref(false)
  const formValido = ref(false)
  const formRef = ref(null)
  const responsavelSelecionado = ref(null)
  const filtro = ref('')

  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
  })

  // Estrutura do formulário (DTO)
  const responsavelForm = ref({
    responsavel_id: null,
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    whatsapp: '',
    funcao: '',
  })

  // Definição dos cabeçalhos da v-data-table
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
      // Endpoint GET: http://localhost:3333/api/cadastros/responsavel
      const { data } = await api.get('/cadastros/responsavel')
      responsaveis.value = data
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao carregar responsáveis', 'error')
    } finally {
      carregando.value = false
    }
  }

  function abrirModalNovo () {
    limparForm()
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

  function limparForm () {
    responsavelForm.value = {
      responsavel_id: null,
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      whatsapp: '',
      funcao: '',
    }
    formRef.value?.resetValidation()
  }

  async function salvarResponsavel () {
    if (!formRef.value?.validate()) return
    carregandoBtn.value = true

    // Monta o payload, removendo o ID e campos vazios (opcionais) para a API
    const payload = { ...responsavelForm.value }
    delete payload.responsavel_id // O ID não vai no body de POST/PUT

    // Deleta campos opcionais vazios para enviar o body JSON corretamente, se a API exigir
    if (payload.telefone === '') delete payload.telefone
    if (payload.whatsapp === '') delete payload.whatsapp
    if (payload.funcao === '') delete payload.funcao

    try {
      if (editando.value) {
        // Endpoint PUT: http://localhost:3333/api/cadastros/responsavel/update?responsavel_id=...
        const id = responsavelForm.value.responsavel_id
        await api.put(`/cadastros/responsavel/update?responsavel_id=${id}`, payload)
        exibirToast('Responsável atualizado com sucesso!', 'success')
      } else {
        // Endpoint POST: http://localhost:3333/api/cadastros/responsavel
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
    responsavelSelecionado.value = item
    modalExcluir.value = true
  }

  function fecharModalExcluir () {
    modalExcluir.value = false
  }

  async function confirmarExclusao () {
    carregandoBtn.value = true
    try {
      // Endpoint DELETE: http://localhost:3333/api/cadastros/responsavel/delete?responsavel_id=...
      const id = responsavelSelecionado.value.responsavel_id
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

  // === Toast ===
  function exibirToast (text, color = 'success') {
    snackbar.value = { show: true, text, color }
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

/* Customização para v-text-field com variant="outlined" */
/* Ajusta as variáveis de cor globalmente para os text-fields com o estilo default/outlined */
.v-text-field.v-input--density-default {
    /* 1. Mudar a cor da borda quando NÃO está focado (default) para o azul */
    --v-field-border-color: #347899;
    /* 2. Mudar a cor da borda quando está focado para o azul */
    --v-theme-primary: #347899;
    /* 3. Mudar a cor do label para o azul */
    --v-field-label-color: #347899;
}

/* Sobrescreve a cor da borda quando não está focada */
.v-field--variant-outlined .v-field__outline {
    border-color: var(--v-field-border-color) !important;
    opacity: 1 !important;
}

/* Sobrescreve a cor da borda quando está focada */
.v-field--variant-outlined.v-field--focused .v-field__outline::after {
    border-color: var(--v-theme-primary) !important;
    border-width: 2px !important;
}

/* Garante que o texto do input também seja azul */
.v-text-field .v-field__input {
    color: #347899 !important;
}

/* Garante a cor azul para o label, tanto em repouso quanto flutuando */
.v-field__label {
    color: var(--v-field-label-color) !important;
    opacity: 1 !important;
}

/* Altera a cor do placeholder para azul se for um placeholder persistente ou normal */
.v-field__input::placeholder {
    color: #347899 !important;
    opacity: 1;
}

/* Para o `v-text-field` de pesquisa na tabela */
.v-text-field.v-input--density-compact .v-field__input {
    color: #347899 !important;
}
.v-text-field.v-input--density-compact .v-field__label {
    color: #347899 !important;
}
/* Aumenta a especificidade para a borda do campo de pesquisa (se for outlined também) */
.v-text-field.v-input--density-compact .v-field__outline {
    border-color: #347899 !important;
}
.v-text-field.v-input--density-compact.v-field--focused .v-field__outline::after {
    border-color: #347899 !important;
    border-width: 2px !important;
}

/* === Estilos para a Coluna Ações (Copia do exemplo anterior) === */

/* 1. Centralizar o conteúdo da célula de Ações e impedir quebra de linha dos ícones */
.actions-cell {
  display: flex; /* Habilita flexbox para alinhar os botões */
  justify-content: center; /* **Centraliza** os botões horizontalmente */
  align-items: center;
  flex-wrap: nowrap; /* **Impede a quebra de linha** (essencial para telas pequenas) */
}

/* Adicionando customização de cor para o ícone de pesquisa (mdi-magnify) */
.v-input--variant-outlined .v-input__prepend-inner .v-icon {
    color: #347899 !important;
}
</style>
