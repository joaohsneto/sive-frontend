<template>
  <div class="pa-4">
    <v-card class="pa-4" elevation="0">
      <v-card-item>
        <v-data-table
          class="custom-table"
          :header-props="{ class: 'header-color' }"
          :headers="headers"
          :items="encaminhamentosFiltrados"
          :loading="carregando"
          loading-text="Carregando encaminhamentos..."
          no-data-text="Nenhum encaminhamento registrado para esta criança/adolescente."
        >
          <template #top>
            <v-row class="d-flex justify-space-between align-center">
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
              <v-btn
                class="text-none ml-3 mr-3 mb-6"
                prepend-icon="mdi-plus"
                :style="{ backgroundColor: '#347899', color: 'white' }"
                @click="abrirModalNovo"
              >
                Novo Encaminhamento
              </v-btn>
            </v-row>
          </template>

          <template #loading>
            <v-sheet class="pa-3 text-center">
              <v-progress-circular color="#347899" indeterminate size="32" />
              <div class="mt-2">Carregando encaminhamentos...</div>
            </v-sheet>
          </template>

          <!-- NOVO BLOCO: Renderiza o Tipo do Encaminhamento com a descrição extra -->
          <template #item.tipo_encaminhamento="{ item }">
            <div class="d-flex flex-column">
              <!-- Exibe o tipo principal -->
              <span>{{ item.tipo_encaminhamento }}</span>

              <!-- Se o tipo for 'Outro(a):' E o campo extra tiver conteúdo, exibe-o abaixo em cinza -->
              <span
                v-if="item.tipo_encaminhamento === 'Outro(a):' && item.tipo_encaminhamento_outro"
                class="text-caption text-medium-emphasis"
                :style="{ color: '#666' }"
              >
                ({{ item.tipo_encaminhamento_outro }})
              </span>
            </div>
          </template>

          <template #item.necessario="{ value }">
            <v-chip
              :color="value === 1 ? 'success' : 'grey'"
              density="compact"
              label
            >
              {{ value === 1 ? 'Sim' : 'Não' }}
            </v-chip>
          </template>

          <template #item.efetuado="{ value }">
            <v-chip
              :color="value === 1 ? 'success' : 'grey'"
              density="compact"
              label
            >
              {{ value === 1 ? 'Sim' : 'Não' }}
            </v-chip>
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
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          elevation="0"
          :style="{ backgroundColor: '#E0E0E0', color: '#347899' }"
          @click="fecharModalPrincipal"
        >
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="modalAberto" max-width="600px">
      <v-card>
        <v-card-title
          class="text-h6 px-6 pt-6"
          :style="{ color: '#347899' }"
        >
          {{ editando ? 'Editar Encaminhamento' : 'Novo Encaminhamento' }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValido">
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="form.tipo_encaminhamento"
                  color="#347899"
                  density="compact"
                  :items="tiposEncaminhamento"
                  label="Tipo do Encaminhamento"
                  variant="outlined"
                />
              </v-col>
              <v-col
                v-if="form.tipo_encaminhamento === 'Outro(a):'"
                cols="12"
              >
                <v-text-field
                  v-model="form.tipo_encaminhamento_outro"
                  color="#347899"
                  density="compact"
                  label="Descreva Outro Encaminhamento"
                  required
                  :rules="[v => !!v || 'Descrição é obrigatória']"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="form.necessario"
                  color="#347899"
                  :false-value="0"
                  hide-details
                  label="Necessário"
                  :true-value="1"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="form.efetuado"
                  color="#347899"
                  :false-value="0"
                  hide-details
                  label="Efetuado"
                  :true-value="1"
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
            @click="salvarEncaminhamento"
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
          Tem certeza que deseja remover o encaminhamento
          <strong>{{ selecionado?.tipo_encaminhamento }}</strong>?
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
  // Presume que o caminho do serviço de API é o mesmo do exemplo
  import api from '@/services/api'

  // === EMITS ===
  const emit = defineEmits(['fechar-modal-principal'])

  // === PROPS ===
  const props = defineProps({
    criancasAdolescentesId: {
      type: [String, Number],
      required: true,
    },
  })

  // === VARIÁVEIS REATIVAS E ESTADO ===
  const encaminhamentos = ref([])
  const carregando = ref(false)
  const carregandoBtn = ref(false)
  const modalAberto = ref(false)
  const modalExcluir = ref(false)
  const editando = ref(false)
  const formValido = ref(false)
  const formRef = ref(null)
  const selecionado = ref(null)
  const filtro = ref('')

  // DTO base
  const formModelo = {
    encaminhamento_id: null,
    tipo_encaminhamento: '',
    necessario: 0,
    efetuado: 0,
    tipo_encaminhamento_outro: '', // NOVO CAMPO OPCIONAL
  }

  const form = ref({ ...formModelo })

  // === TOAST/SNACKBAR ===
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    icon: 'mdi-check-circle-outline',
  })

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

  // === DADOS ESTÁTICOS: LISTA DE TIPOS DE ENCAMINHAMENTO (Atualizada) ===
  const tiposEncaminhamento = [
    'Acompanhamento escolar',
    'Assistência médica clínica',
    'Assistência médica farmacológica',
    'Assistência médica psiquiátrica',
    'Assistência odontológica',
    'Assistência psicológica – psicoterapia individual',
    'Assistência psicológica – psicoterapia em grupo',
    'Assistência psicológica – psicoterapia familiar',
    'Atendimento psicossocial individual',
    'Atendimento psicossocial em grupo',
    'Atividades culturais livres',
    'Aulas de informática',
    'Cursos de qualificação profissional',
    'Educador físico',
    'Fisioterapia',
    'Fonoaudiologia',
    'Nutricionista',
    'Oficina de artes',
    'Oficina de artesanato',
    'Oficina de audiovisual',
    'Oficina de capoeira',
    'Oficina de dança',
    'Oficina de desenvolvimento da cidadania e ou do protagonismo social',
    'Oficina de Educomunicação',
    'Oficina de esportes',
    'Oficina de formação política',
    'Oficina de geração de renda',
    'Oficina de música',
    'Oficina estruturada para desenvolvimento de capacidades de autocuidado com a saúde física e mental',
    'Oficina estruturada para desenvolvimento de capacidades de autocuidado nas relações afetivas e sexuais',
    'Oficina estruturada para desenvolvimento de capacidades de cuidado com o meio ambiente',
    'Orientação jurídico-social',
    'Recuperação de atraso de aprendizagem / escolar (reforço escolar)',
    'Reintegração na família natural origem ou integração na família natural extensa ou integração em família substituta adotiva',
    'Serviço Social',
    'Técnico de apoio a escolas',
    'Terapia ocupacional',
    'Outro(a):',
  ]

  // === DATATABLE HEADERS ===
  const headers = [
    { title: 'Tipo do Encaminhamento', key: 'tipo_encaminhamento' },
    { title: 'Necessário', key: 'necessario', align: 'center' },
    { title: 'Efetuado', key: 'efetuado', align: 'center' },
    { title: 'Ações', key: 'acoes', sortable: false, align: 'center' },
  ]

  // === COMPUTED PARA FILTRO (ATUALIZADO PARA INCLUIR O CAMPO EXTRA) ===
  const encaminhamentosFiltrados = computed(() => {
    if (!filtro.value) return encaminhamentos.value
    const termo = filtro.value.toLowerCase()
    return encaminhamentos.value.filter(item =>
      item.tipo_encaminhamento?.toLowerCase().includes(termo)
      || item.tipo_encaminhamento_outro?.toLowerCase().includes(termo),
    )
  })

  // === FUNÇÕES DE CRUD E MODAIS ===

  function fecharModalPrincipal () {
    emit('fechar-modal-principal')
  }

  async function carregarEncaminhamentos (id) {
    if (!id) return
    const endpoint = `/cadastros/encaminhamentos/crianca_adolescente?criancas_adolescentes_id=${id}`
    try {
      carregando.value = true
      const { data } = await api.get(endpoint)
      encaminhamentos.value = data
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao carregar encaminhamentos.', 'error')
    } finally {
      carregando.value = false
    }
  }

  function abrirModalNovo () {
    form.value = { ...formModelo }
    editando.value = false
    modalAberto.value = true
  }

  function abrirModalEditar (item) {
    form.value = { ...item }
    form.value.encaminhamento_id = item.encaminhamento_id
    // Garante que o campo extra para 'Outro' seja carregado, se houver
    form.value.tipo_encaminhamento_outro = item.tipo_encaminhamento_outro || ''

    editando.value = true
    modalAberto.value = true
  }

  function fecharModal () {
    modalAberto.value = false
    formRef.value?.resetValidation()
    form.value = { ...formModelo }
  }

  async function salvarEncaminhamento () {
    const { valid } = await formRef.value.validate()
    // A validação agora checa o campo de descrição se "Outro(a):" estiver selecionado
    if (!valid) return

    carregandoBtn.value = true

    const payload = {
      criancas_adolescentes_id: props.criancasAdolescentesId,
      tipo_encaminhamento: form.value.tipo_encaminhamento,
      necessario: form.value.necessario,
      efetuado: form.value.efetuado,
      // Inclui o campo opcional no payload
      tipo_encaminhamento_outro: form.value.tipo_encaminhamento_outro,
    }

    // AJUSTE DE ROBUSTEZ: Se o tipo não for "Outro(a):", garante que o campo extra é nulo/vazio
    if (payload.tipo_encaminhamento !== 'Outro(a):') {
      payload.tipo_encaminhamento_outro = null
    }

    try {
      if (editando.value) {
        const updateEndpoint = `/cadastros/encaminhamentos/update?encaminhamento_id=${form.value.encaminhamento_id}&criancas_adolescentes_id=${props.criancasAdolescentesId}`
        await api.put(updateEndpoint, payload)
        exibirToast('Encaminhamento atualizado com sucesso!', 'success')
      } else {
        await api.post('/cadastros/encaminhamentos', payload)
        exibirToast('Encaminhamento cadastrado com sucesso!', 'success')
      }

      fecharModal()
      await carregarEncaminhamentos(props.criancasAdolescentesId)
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao salvar encaminhamento', 'error')
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
    try {
      const id = selecionado.value.encaminhamento_id
      const criancaId = props.criancasAdolescentesId
      const deleteEndpoint = `/cadastros/encaminhamentos/delete?encaminhamento_id=${id}&criancas_adolescentes_id=${criancaId}`
      await api.delete(deleteEndpoint)

      exibirToast('Encaminhamento excluído com sucesso!', 'success')
      fecharModalExcluir()
      await carregarEncaminhamentos(criancaId)
    } catch (error) {
      exibirToast(error.response?.data?.message || 'Erro ao excluir encaminhamento', 'error')
    } finally {
      carregandoBtn.value = false
    }
  }

  // === LIFECYCLE E WATCHERS ===

  watch(() => props.criancasAdolescentesId, newId => {
    if (newId) {
      carregarEncaminhamentos(newId)
    } else {
      encaminhamentos.value = []
    }
  }, { immediate: true })

  onMounted(() => {
    if (props.criancasAdolescentesId) {
      carregarEncaminhamentos(props.criancasAdolescentesId)
    }
  })
</script>

<style scoped>
/* Estilos para centralizar ações e garantir a cor do header da tabela */
.header-color {
  background-color: #347899 !important;
  color: white !important;
}
.actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}
/* Estilo para o Toast (Necessário pois ele está fora do escopo do index.vue) */
.custom-toast {
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
  padding: 12px 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}
</style>
