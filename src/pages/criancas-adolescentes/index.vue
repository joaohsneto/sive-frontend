<template>
  <div class="pa-4">
    <v-card class="pa-10" elevation="2">
      <v-row class="d-flex justify-space-between align-center mb-4">
        <h2 :style="{ color: '#347899' }">Gerenciar Crianças e Adolescentes</h2>
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
          :items="criancasAdolescentesFiltrados"
          :loading="carregando"
          loading-text="Carregando cadastros..."
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
              <v-progress-circular color="primary" indeterminate size="32" />
              <div class="mt-2">Carregando cadastros...</div>
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

    <v-dialog v-model="modalAberto" max-width="1200px">
      <v-card>
        <v-card-title
          class="text-h6 px-6 pt-6"
          :style="{ color: '#347899' }"
        >
          {{ editando ? 'Editar Cadastro' : 'Novo Cadastro' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValido">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.nome"
                  color="#347899"
                  density="compact"
                  label="Nome Completo"
                  required
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.cpf"
                  color="#347899"
                  density="compact"
                  inputmode="numeric"
                  label="CPF (somente números)"
                  maxlength="11"
                  required
                  :rules="[v => !!v || 'CPF é obrigatório', v => (v && v.length === 11) || 'CPF deve ter 11 dígitos']"
                  type="tel"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.email"
                  color="#347899"
                  density="compact"
                  label="E-mail"
                  required
                  :rules="[
                    v => !!v || 'E-mail é obrigatório',
                    v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
                  ]"
                  type="email"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.idade_nascimento"
                  color="#347899"
                  density="compact"
                  label="Idade / Data de Nascimento"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.filiacao_pai"
                  color="#347899"
                  density="compact"
                  label="Filiação Pai"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.filiacao_mae"
                  color="#347899"
                  density="compact"
                  label="Filiação Mãe"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.com_quem_mora"
                  color="#347899"
                  density="compact"
                  label="Com Quem Mora"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.telefone"
                  color="#347899"
                  density="compact"
                  label="Telefone"
                  type="tel"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.endereco"
                  color="#347899"
                  density="compact"
                  label="Endereço"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="form.ponto_referencia"
                  color="#347899"
                  density="compact"
                  label="Ponto de Referência"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.contato"
                  color="#347899"
                  density="compact"
                  label="Contato"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.telefone_contato"
                  color="#347899"
                  density="compact"
                  label="Telefone Contato"
                  type="tel"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.sexo"
                  color="#347899"
                  density="compact"
                  label="Sexo"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.registro_civil"
                  color="#347899"
                  density="compact"
                  label="Registro Civil"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.comunidade_originarios"
                  color="#347899"
                  density="compact"
                  label="Comunidade/Originários"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.deficiencia"
                  color="#347899"
                  density="compact"
                  label="Deficiência"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.condicao_saude"
                  color="#347899"
                  density="compact"
                  label="Condição de Saúde"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.programas_sociais"
                  color="#347899"
                  density="compact"
                  label="Programas Sociais"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.ocupacao_atividade"
                  color="#347899"
                  density="compact"
                  label="Ocupação/Atividade"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.renda_familiar"
                  color="#347899"
                  density="compact"
                  label="Renda Familiar"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="form.tipo_imovel"
                  color="#347899"
                  density="compact"
                  label="Tipo de Imóvel"
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
            @click="salvarCadastro"
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
          Tem certeza que deseja remover o cadastro de
          <strong>{{ selecionado?.nome }}</strong>?
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
  // Presume que o caminho do serviço de API é o mesmo do exemplo
  import api from '@/services/api'

  // Variáveis Reativas
  const criancasAdolescentes = ref([])
  const carregando = ref(false)
  const carregandoBtn = ref(false)
  const modalAberto = ref(false)
  const modalExcluir = ref(false)
  const editando = ref(false)
  const formValido = ref(false)
  const formRef = ref(null)
  const selecionado = ref(null) // Para guardar o item selecionado na exclusão/edição
  const filtro = ref('')

  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
  })

  // Estrutura do formulário (baseado nos campos de POST)
  const formModelo = {
    criancas_adolescentes_id: null,
    cpf: '',
    email: '',
    nome: '',
    filiacao_pai: '',
    filiacao_mae: '',
    idade_nascimento: '',
    com_quem_mora: '',
    endereco: '',
    ponto_referencia: '',
    telefone: '',
    contato: '',
    telefone_contato: '',
    registro_civil: '',
    sexo: '',
    comunidade_originarios: '',
    deficiencia: '',
    condicao_saude: '',
    programas_sociais: '',
    ocupacao_atividade: '',
    renda_familiar: '',
    tipo_imovel: '',
  }

  const form = ref({ ...formModelo })

  // Definição dos Headers da Tabela
  const headers = [
    { title: 'Nome', key: 'nome' },
    { title: 'CPF', key: 'cpf' },
    { title: 'Idade/Nasc.', key: 'idade_nascimento' },
    { title: 'Mora com', key: 'com_quem_mora' },
    { title: 'Telefone', key: 'telefone' },
    // Ação: Adicionamos o 'align: center' para centralizar o cabeçalho
    { title: 'Ações', key: 'acoes', sortable: false, align: 'center' },
  ]

  // === Computed para filtro ===
  const criancasAdolescentesFiltrados = computed(() => {
    if (!filtro.value) return criancasAdolescentes.value
    const termo = filtro.value.toLowerCase()
    return criancasAdolescentes.value.filter(item =>
      item.nome?.toLowerCase().includes(termo)
      || item.cpf?.toLowerCase().includes(termo)
      || item.idade_nascimento?.toLowerCase().includes(termo)
      || item.com_quem_mora?.toLowerCase().includes(termo)
      || item.telefone?.toLowerCase().includes(termo),
    )
  })

  // === Funções de CRUD ===

  async function carregarCadastros () {
    const endpoint = '/cadastros/criancas-adolescentes'
    try {
      carregando.value = true
      const { data } = await api.get(endpoint)
      criancasAdolescentes.value = data
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao carregar cadastros', 'error')
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
    // Copia o item para o formulário
    form.value = { ...item }
    editando.value = true
    modalAberto.value = true
  }

  function fecharModal () {
    modalAberto.value = false
    limparForm()
  }

  function limparForm () {
    form.value = { ...formModelo }
    formRef.value?.resetValidation()
  }

  async function salvarCadastro () {
    // A validação do formulário deve ser suficiente agora.
    if (!formRef.value?.validate()) return
    carregandoBtn.value = true
    const endpointBase = '/cadastros/criancas-adolescentes'

    try {
      if (editando.value) {
        // Rota PUT: /update?criancas_adolescentes_id=ID
        await api.put(`${endpointBase}/update?criancas_adolescentes_id=${form.value.criancas_adolescentes_id}`, form.value)
        exibirToast('Cadastro atualizado com sucesso!', 'success')
      } else {
        // Rota POST: /
        // Desestrutura para garantir que apenas os campos do body POST sejam enviados
        const { criancas_adolescentes_id, ...bodyNew } = form.value
        await api.post(endpointBase, bodyNew)
        exibirToast('Cadastro realizado com sucesso!', 'success')
      }
      fecharModal()
      await carregarCadastros()
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao salvar cadastro', 'error')
    } finally {
      carregandoBtn.value = false
    }
  }

  // === Exclusão ===
  function abrirModalConfirmarExclusao (item) {
    selecionado.value = item
    modalExcluir.value = true
  }

  function fecharModalExcluir () {
    modalExcluir.value = false
    selecionado.value = null
  }

  async function confirmarExclusao () {
    carregandoBtn.value = true
    const endpoint = '/cadastros/criancas-adolescentes/delete'
    try {
      // Rota DELETE: /delete?criancas_adolescentes_id=ID
      await api.delete(`${endpoint}?criancas_adolescentes_id=${selecionado.value.criancas_adolescentes_id}`)
      exibirToast('Cadastro excluído com sucesso!', 'success')
      fecharModalExcluir()
      await carregarCadastros()
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao excluir cadastro', 'error')
    } finally {
      carregandoBtn.value = false
    }
  }

  // === Toast ===
  function exibirToast (text, color = 'success') {
    snackbar.value = { show: true, text, color }
  }

  onMounted(() => {
    carregarCadastros()
  })
</script>

<style>
/* Estilos existentes */
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
/* O Vuetify usa um pseudo-elemento ::after para a linha de destaque */
.v-field--variant-outlined.v-field--focused .v-field__outline::after {
    border-color: var(--v-theme-primary) !important;
    border-width: 2px !important; /* Assegura que a borda do foco é visível */
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

/* === Novos Estilos para a Coluna Ações === */

/* 1. Centralizar o conteúdo da célula de Ações e impedir quebra de linha dos ícones */
.actions-cell {
  display: flex; /* Habilita flexbox para alinhar os botões */
  justify-content: center; /* **Centraliza** os botões horizontalmente */
  align-items: center;
  flex-wrap: nowrap; /* **Impede a quebra de linha** (essencial para telas pequenas) */
}

/* Opcional: Centralizar o conteúdo da célula do cabeçalho de Ações */
/* O alinhamento do cabeçalho (title) foi feito via 'align: center' na definição de `headers` */
/* Se precisar de mais controle, este CSS pode ajudar a garantir o alinhamento */
.custom-table th[role="columnheader"]:last-child {
  /* O último cabeçalho geralmente é o de Ações, mas depende da ordem */
  text-align: center !important;
}

</style>
