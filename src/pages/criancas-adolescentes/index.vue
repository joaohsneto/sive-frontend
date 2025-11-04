<template>
  <div class="pa-2">
    <v-card class="pa-4" elevation="2">
      <v-row class="d-flex pa-2 justify-space-between align-center mb-4">
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

      <v-card-item class="pa-0">
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
        <v-row class="d-flex pa-2 justify-end align-center mt-2 mb-1 ml-auto mr-auto">
          <v-btn
            class="text-none w-100 w-md-auto"
            prepend-icon="mdi-file-pdf-box"
            :style="{ backgroundColor: '#E57373', color: 'white' }"
            to="/ficha-sive"
          >
            Gerar Fichar
          </v-btn>
        </v-row>
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
        <v-tabs v-model="abaAtiva" class="px-6" color="#347899">
          <v-tab value="monitoramento">Monitoramento</v-tab>
          <v-tab
            :disabled="!editando"
            value="encaminhamento"
          >
            Encaminhamento
          </v-tab>
        </v-tabs>

        <v-divider />
        <v-window v-model="abaAtiva">
          <v-window-item value="monitoramento">
            <div
              class="pa-4"
              style="max-height: 70vh; overflow-y: auto;"
            >
              <v-card-text class="pa-0">
                <h3 class="mb-4" :style="{ color: '#347899' }">Dados da criança ou do adolescente</h3>
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
                        :rules="[
                          v => !!v || 'CPF é obrigatório',
                          v => (v && v.length === 11) || 'CPF deve ter 11 dígitos'
                        ]"
                        type="tel"
                        variant="outlined"
                        @input="form.cpf = form.cpf.replace(/\D/g, '')"
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
                        inputmode="numeric"
                        label="Telefone"
                        maxlength="11"
                        :rules="[
                          v => !v || (v.length >= 10 && v.length <= 11) || 'Telefone deve ter entre 10 e 11 dígitos'
                        ]"
                        type="tel"
                        variant="outlined"
                        @input="form.telefone = form.telefone.replace(/\D/g, '')"
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
                        inputmode="numeric"
                        label="Telefone Contato"
                        maxlength="11"
                        :rules="[
                          v => !v || (v.length >= 10 && v.length <= 11) || 'Telefone deve ter entre 10 e 11 dígitos'
                        ]"
                        type="tel"
                        variant="outlined"
                        @input="form.telefone_contato = form.telefone_contato.replace(/\D/g, '')"
                      />
                    </v-col>

                    <v-col cols="12" md="3" sm="6">
                      <v-select
                        v-model="form.sexo"
                        color="#347899"
                        density="compact"
                        :items="opcoesSexo"
                        label="Sexo"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col cols="12" md="3" sm="6">
                      <v-select
                        v-model="form.registro_civil"
                        color="#347899"
                        density="compact"
                        :items="opcoesRegistroCivil"
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
                      <v-select
                        v-model="form.deficiencia"
                        color="#347899"
                        density="compact"
                        :items="opcoesDeficiencia"
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
                      <v-select
                        v-model="form.programas_sociais"
                        color="#347899"
                        density="compact"
                        :items="opcoesProgramasSociais"
                        label="Programas Sociais"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col cols="12" md="3" sm="6">
                      <v-select
                        v-model="form.renda_familiar"
                        color="#347899"
                        density="compact"
                        :items="opcoesRendaFamiliar"
                        label="Renda Familiar"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col cols="12" md="3" sm="6">
                      <v-select
                        v-model="form.tipo_imovel"
                        color="#347899"
                        density="compact"
                        :items="opcoesTipoImovel"
                        label="Tipo de Imóvel"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col cols="12" md="3" sm="6">
                      <v-select
                        v-model="form.situacao_trabalho"
                        color="#347899"
                        density="compact"
                        :items="opcoesSituacaoTrabalho"
                        label="Situação de Trabalho"
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

                  </v-row>

                  <v-divider class="my-6" />

                  <h3 class="mb-4" :style="{ color: '#347899' }">Informações de Monitoramento (SIVE)</h3>

                  <v-row dense>
                    <v-col cols="12">
                      <v-select
                        v-model="form.orgao_responsavel"
                        color="#347899"
                        density="compact"
                        :items="opcoesOrgao"
                        label="Órgão, programa, serviço ou OSC responsável"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col
                      v-if="form.orgao_responsavel === 'Outros(a):'"
                      cols="12"
                    >
                      <v-text-field
                        v-model="form.orgao_responsavel_outro"
                        color="#347899"
                        density="compact"
                        label="Descreva Outro Órgão Responsável"
                        required
                        :rules="[v => !!v || 'Descrição é obrigatória']"
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>

                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-date-input
                        v-model="form.data_encaminhamento"
                        color="#347899"
                        density="compact"
                        format="dd/MM/yyyy"
                        label="Data do encaminhamento"
                        maxlength="10"
                        prepend-icon=""
                        prepend-inner-icon="mdi-calendar"

                        variant="outlined"

                        @keypress="event => {
                          if (event.key.length > 1) return;
                          if (!/[0-9/]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }"
                      />
                    </v-col>

                    <v-col cols="12" md="8">
                      <v-select
                        v-model="form.motivacao_encaminhamento"
                        color="#347899"
                        density="compact"
                        :items="opcoesMotivacao"
                        label="Motivação do encaminhamento"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col
                      v-if="form.motivacao_encaminhamento === 'Outro(a):'"
                      cols="12"
                    >
                      <v-text-field
                        v-model="form.motivacao_encaminhamento_outro"
                        color="#347899"
                        density="compact"
                        label="Descreva Outra Motivação"
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>

                  <v-row dense>
                    <v-col cols="12">
                      <v-textarea
                        v-model="form.descricao_atendimento"
                        color="#347899"
                        density="compact"
                        label="Descrição do Atendimento"
                        rows="3"
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>

                  <v-row dense>
                    <v-col cols="12">
                      <v-textarea
                        v-model="form.relato_espontaneo"
                        color="#347899"
                        density="compact"
                        label="Relato espontâneo da criança ou do adolescente, quando houver"
                        rows="3"
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>

                  <v-row class="mt-4" dense>
                    <v-col cols="12">
                      <div class="mb-2" :style="{ color: '#347899', fontWeight: 'bold' }">8. Plano Individual de Atendimento (PIA) / Escuta Especializada</div>
                      <v-sheet border class="pa-3" rounded="lg">
                        <v-checkbox
                          v-model="form.Avaliacao_individual"
                          color="#347899"
                          density="compact"
                          :false-value="null"
                          hide-details
                          label="Avaliação diagnóstica individual"
                          :true-value="'Avaliação diagnóstica individual'"
                        />
                        <v-checkbox
                          v-model="form.Avaliacao_familiar"
                          color="#347899"
                          density="compact"
                          :false-value="null"
                          hide-details
                          label="Avaliação diagnóstica familiar"
                          :true-value="'Avaliação diagnóstica familiar'"
                        />
                        <v-checkbox
                          v-model="form.Avaliacao_domicilio"
                          color="#347899"
                          density="compact"
                          :false-value="null"
                          hide-details
                          label="Avaliação diagnóstica familiar com visita ao domicílio"
                          :true-value="'Avaliação diagnóstica familiar com visita ao domicílio'"
                        />
                        <v-checkbox
                          v-model="form.Escuta_especializada"
                          color="#347899"
                          density="compact"
                          :false-value="null"
                          hide-details
                          label="Escuta Especializada"
                          :true-value="'Escuta Especializada'"
                        />
                        <v-checkbox
                          v-model="form.Organ_cuidado_individual"
                          color="#347899"
                          density="compact"
                          :false-value="null"
                          hide-details
                          label="Organização das abordagens de cuidado e ou atividades para a criança e ou adolescente"
                          :true-value="'Organização das abordagens de cuidado e ou atividades para a criança e ou adolescente'"
                        />
                        <v-checkbox
                          v-model="form.Organ_cuidado_conjunto"
                          color="#347899"
                          density="compact"
                          :false-value="null"
                          hide-details
                          label="Organização das abordagens de cuidado e ou atividades de que juntos participam a criança e ou adolescente e membros da família"
                          :true-value="'Organização das abordagens de cuidado e ou atividades de que juntos participam a criança e ou adolescente e membros da família'"
                        />
                        <v-checkbox
                          v-model="form.Organ_cuidado_familia"
                          color="#347899"
                          density="compact"
                          :false-value="null"
                          hide-details
                          label="Organização abordagens de cuidado e ou atividades para membros da família"
                          :true-value="'Organização abordagens de cuidado e ou atividades para membros da família'"
                        />
                      </v-sheet>
                    </v-col>
                  </v-row>

                  <v-divider class="my-6" />

                  <v-row dense>
                    <!-- <v-col cols="12" md="6">
                      <v-text-field
                        v-model="form.agente_violador"
                        color="#347899"
                        density="compact"
                        label="Agente Violador (Própria Criança/Adolescente, Estado, Família, Sociedade)"
                        variant="outlined"
                      />
                    </v-col> -->

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.agente_violador"
                        color="#347899"
                        density="compact"
                        :items="opcoesAgenteViolador"
                        label="Agente Violador"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.status"
                        color="#347899"
                        density="compact"
                        :items="opcoesStatus"
                        label="Status"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.tipo_acompanhamento"
                        color="#347899"
                        density="compact"
                        :items="opcoesTipoAcompanhamento"
                        label="Tipo de Acompanhamento"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.periodo_acompanhamento"
                        color="#347899"
                        density="compact"
                        :items="opcoesPeriodoAcompanhamento"
                        label="Período do Acompanhamento"
                        variant="outlined"
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-select
                        v-model="form.motivo_encerramento"
                        color="#347899"
                        density="compact"
                        :items="opcoesMotivoEncerramento"
                        label="Motivo do encerramento do atendimento/acompanhamento"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col
                      v-if="form.motivo_encerramento === 'Outro(a):'"
                      cols="12"
                    >
                      <v-text-field
                        v-model="form.motivo_encerramento_outro"
                        color="#347899"
                        density="compact"
                        label="Outros Motivos do Encerramento"
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
            </div>
          </v-window-item>

          <v-window-item value="encaminhamento">
            <v-card-text class="pa-6">
              <Encaminhamento :criancas-adolescentes-id="form.criancas_adolescentes_id" @fechar-modal-principal="fecharModal" />
            </v-card-text>
          </v-window-item>
        </v-window>
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
  import { computed, onMounted, ref, watch } from 'vue'
  import Encaminhamento from '@/components/cadastros/Encaminhamento.vue'
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
  const abaAtiva = ref('monitoramento') // aba inici

  const formModelo = {
    // ... (restante do formModelo aqui para referência)
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
    situacao_trabalho: '',
    orgao_responsavel: '',
    orgao_responsavel_outro: '',
    data_encaminhamento: '',
    motivacao_encaminhamento: '',
    motivacao_encaminhamento_outro: '',
    descricao_atendimento: '',
    relato_espontaneo: '',
    Avaliacao_individual: null,
    Avaliacao_familiar: null,
    Avaliacao_domicilio: null,
    Escuta_especializada: null,
    Organ_cuidado_individual: null,
    Organ_cuidado_conjunto: null,
    Organ_cuidado_familia: null,
    agente_violador: '',
    status: '',
    tipo_acompanhamento: '',
    periodo_acompanhamento: '',
    motivo_encerramento: '',
    motivo_encerramento_outro: '',
  }

  const form = ref({ ...formModelo })

  // === Watchers para limpar campos 'Outro(a)' no FORM local ===
  // 1. Órgão responsável
  watch(() => form.value.orgao_responsavel, newValue => {
    if (newValue !== 'Outros(a):') {
      form.value.orgao_responsavel_outro = null
    }
  })

  // 2. Motivação do encaminhamento
  watch(() => form.value.motivacao_encaminhamento, newValue => {
    if (newValue !== 'Outro(a):') {
      form.value.motivacao_encaminhamento_outro = null
    }
  })

  // 3. Motivo do encerramento
  watch(() => form.value.motivo_encerramento, newValue => {
    if (newValue !== 'Outro(a):') {
      form.value.motivo_encerramento_outro = null
    }
  })
  // =======================================================

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

  // === Listas de Opções ===
  const opcoesOrgao = ref([
    'Escola',
    'Conselho Tutelar',
    'Medida protetiva determinada pelo Poder Judiciário',
    'Medida socioeducativa determinada pelo Poder Judiciário',
    'Encaminhamento do Ministério Público',
    'Encaminhamento da Assistência social (CREAS)',
    'Encaminhamento da Assistência social (CRAS)',
    'Encaminhamento do Serviço Especializado de Abordagem Social',
    'Encaminhamento da Saúde',
    'Procura direta da família pelo serviço (demanda espontânea)',
    'Procura direta da criança e ou adolescente pelo serviço (demanda espontânea)',
    'Busca ativa do próprio programa',
    'Busca ativa do próprio programa com mediação da REDE',
    'Outros(a):',
  ]) // Baseado no Item 1

  const opcoesRendaFamiliar = ref([
    '0-1 salário mínimo',
    '2-3 salários mínimos',
    '3-5 salários mínimos',
    'Mias que 5 salários mínimos',
    'Não sabe informar',
  ]) // Baseado no Item 11

  const opcoesTipoImovel = ref([
    'Próprio',
    'Alugado',
    'Cedido',
  ]) // Baseado no Item 13

  // NOVO: Situação de Trabalho
  const opcoesSituacaoTrabalho = ref([
    'Com Carteira de Trabalho',
    'Sem Carteira de Trabalho',
    'Sem Ocupação ou Atividade',
    'Não se aplica',
  ])

  const opcoesSexo = ref([
    'Masculino',
    'Feminino',
    'Outro',
  ]) // Adicionado para o campo Sexo

  const opcoesRegistroCivil = ref([
    'SIM',
    'NÃO',
  ]) // Adicionado para o campo Registro Civil

  const opcoesDeficiencia = ref([
    'Nenhuma',
    'Física',
    'Mental',
    'Intelectual',
    'Múltipla',
    'Outra',
  ]) // Adicionado para o campo Deficiência

  const opcoesProgramasSociais = ref([
    'Auxílio Gás dos Brasileiros',
    'Benefício de Prestação Continuada (BPC)',
    'Bolsa Família',
    'Cadastro Único (CadÚnico)',
    'Farmácia Popular',
    'Minha Casa, Minha Vida',
    'Pé-de-Meia',
    'Seguro Defeso (Pescador Artesanal)',
    'Tarifa Social de Energia Elétrica (TSEE)',
    'Outro(a):',
  ]) // Adicionado para o campo Programas Sociais

  const opcoesStatus = ref([
    'Procedente',
    'Pendente',
    'Improcedente',
    'Fora do perfil/atribuições da Justiça ou Segurança Pública',
  ]) // Baseado no Item 11

  const opcoesAgenteViolador = ref([
    'Própria Criança/Adolescente',
    'Estado',
    'Família',
    'Sociedade',
  ]) // Baseado no Item 10

  const opcoesTipoAcompanhamento = ref([
    'Audiência',
    'Relatório Escrito',
    'Relatório Telefônico',
  ]) // Baseado no Item 12

  const opcoesPeriodoAcompanhamento = ref([
    'Diária',
    'Semanal',
    'Quinzenal',
    'Mensal',
  ]) // Baseado no Item 13

  // Motivação do encaminhamento (Item 5)
  const opcoesMotivacao = ref([
    'Abandono familiar/rompimento de vínculos',
    'Abandono familiar/vínculos',
    'Adolescente autor de ato infracional',
    'Álcool e outras drogas',
    'Colocação familiar/Acolhimento institucional',
    'Elevado número de faltas injustificadas',
    'Evasão escolar',
    'Evasão ou impedimento de atendimento em serviço de saúde',
    'Gravidez precoce',
    'Insegurança alimentar',
    'Maus-tratos (abuso do poder familiar/negligência/omissões)',
    'Omissão/negligência',
    'Pessoas com deficiência',
    'Situação de rua',
    'Violência financeira',
    'Violência física',
    'Violência institucional',
    'Violência psicológica',
    'Violência sexual',
    'Violência sexual: exploração sexual comercial de crianças ou adolescentes',
    'Trabalho Infantil',
    'Violência doméstica/familiar',
    'Outro(a):', // Opção para descrever outro
  ]) // Baseado no Item 15

  // Motivo do encerramento (Item 14)
  const opcoesMotivoEncerramento = ref([
    'Fim da(s) situação(s) de abandono familiar',
    'Cumprimento de MSE pela política de Assistência Social',
    'Inclusão em tratamentos de saúde e alta médica',
    'Inclusão em Programa de Familiar Acolhedora/Acolhimento institucional',
    'Regulação das faltas / normalidade da presença',
    'Retorno a escola',
    'Fim de ciclos de violência',
    'Fim de ciclos de omissão/negligência',
    'Saída da condição de situação de rua',
    'Fim de ciclos de Trabalho Infantil',
    'Outro(a):', // Opção para descrever outro
  ])

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
      // Converte valores de 1/0 (string ou number) para booleanos no formulário ao carregar (se necessário, dependendo do retorno da API)
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao carregar cadastros', 'error')
    } finally {
      carregando.value = false
    }
  }

  function abrirModalNovo () {
    limparForm()
    editando.value = false
    abaAtiva.value = 'monitoramento' // Garante que volta para a primeira aba
    modalAberto.value = true
  }

  function abrirModalEditar (item) {
    // Copia o item para o formulário
    form.value = { ...item }

    // ALTERADO: Converte valores 1/0 (ou true/false) para a string da label ou null
    const isTrue = val => val === 1 || val === true || val === '1' || (typeof val === 'string' && val.length > 0)

    form.value.Avaliacao_individual = isTrue(item.Avaliacao_individual) ? 'Avaliação diagnóstica individual' : null
    form.value.Avaliacao_familiar = isTrue(item.Avaliacao_familiar) ? 'Avaliação diagnóstica familiar' : null
    form.value.Avaliacao_domicilio = isTrue(item.Avaliacao_domicilio) ? 'Avaliação diagnóstica familiar com visita ao domicílio' : null
    form.value.Escuta_especializada = isTrue(item.Escuta_especializada) ? 'Escuta Especializada' : null
    form.value.Organ_cuidado_individual = isTrue(item.Organ_cuidado_individual) ? 'Organização das abordagens de cuidado e ou atividades para a criança e ou adolescente' : null
    form.value.Organ_cuidado_conjunto = isTrue(item.Organ_cuidado_conjunto) ? 'Organização das abordagens de cuidado e ou atividades de que juntos participam a criança e ou adolescente e membros da família' : null
    form.value.Organ_cuidado_familia = isTrue(item.Organ_cuidado_familia) ? 'Organização abordagens de cuidado e ou atividades para membros da família' : null
    // FIM DA ALTERAÇÃO

    editando.value = true
    modalAberto.value = true
    abaAtiva.value = 'monitoramento' // Inicia na primeira aba, mesmo em edição
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
    // Se a aba Encaminhamento estiver ativa, volte para Monitoramento para validar o formulário principal
    if (abaAtiva.value === 'encaminhamento') {
      abaAtiva.value = 'monitoramento'
      // Pequeno delay para a v-form ser re-renderizada na nova aba
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    if (!formRef.value?.validate()) return
    carregandoBtn.value = true
    const endpointBase = '/cadastros/criancas-adolescentes'

    try {
      // Cria uma cópia limpa do formulário
      const body = {
        ...form.value,
      }

      // 1. Órgão responsável
      if (body.orgao_responsavel !== 'Outros(a):' && 'orgao_responsavel_outro' in body) {
        body.orgao_responsavel_outro = null
        // Se a API aceita 'null', a linha acima é suficiente. Se preferir não enviar a chave:
        // delete body.orgao_responsavel_outro;
      }

      // 2. Motivação do encaminhamento
      if (body.motivacao_encaminhamento !== 'Outro(a):' && 'motivacao_encaminhamento_outro' in body) {
        body.motivacao_encaminhamento_outro = null
        // delete body.motivacao_encaminhamento_outro;
      }

      // 3. Motivo do encerramento
      if (body.motivo_encerramento !== 'Outro(a):' && 'motivo_encerramento_outro' in body) {
        body.motivo_encerramento_outro = null
        // delete body.motivo_encerramento_outro;
      }

      // 1. Órgão responsável
      if (body.orgao_responsavel !== 'Outros(a):') {
        body.orgao_responsavel_outro = null
      }

      // 2. Motivação do encaminhamento
      if (body.motivacao_encaminhamento !== 'Outro(a):') {
        body.motivacao_encaminhamento_outro = null
      }

      // 3. Motivo do encerramento
      if (body.motivo_encerramento !== 'Outro(a):') {
        body.motivo_encerramento_outro = null
      }
      // FIM DA CORREÇÃO DE PAYLOAD

      if (editando.value) {
        // Rota PUT: /update?criancas_adolescentes_id=ID
        await api.put(`${endpointBase}/update?criancas_adolescentes_id=${form.value.criancas_adolescentes_id}`, body)
        exibirToast('Cadastro atualizado com sucesso!', 'success')
      } else {
        // Rota POST: /
        const { criancas_adolescentes_id, ...bodyNew } = body
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

/* Para o `v-text-field` de pesquisa na tabela */
.v-text-field.v-input--density-compact .v-field__input {
    color: #347899 !important;
}
/* 1. Centralizar o conteúdo da célula de Ações e impedir quebra de linha dos ícones */
.actions-cell {
  display: flex; /* Habilita flexbox para alinhar os botões */
  justify-content: center; /* **Centraliza** os botões horizontalmente */
  align-items: center;
  flex-wrap: nowrap; /* **Impede a quebra de linha** (essencial para telas pequenas) */
}
/* 🌟 Toast moderno */
.custom-toast {
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  padding: 12px 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.scrollable::-webkit-scrollbar {
  width: 8px;
}
.scrollable::-webkit-scrollbar-thumb {
  background-color: #cfd8dc;
  border-radius: 4px;
}
.scrollable::-webkit-scrollbar-thumb:hover {
  background-color: #b0bec5;
}
</style>
