<template>
  <div class="pa-2">
    <v-card class="pa-4" elevation="2">
      <v-row class="d-flex pa-2 justify-space-between align-center mb-6">
        <h2 :style="{ color: '#347899' }">Gerar Ficha SIVE</h2>
      </v-row>

      <v-card-item class="pa-0">
        <v-form ref="formRef" v-model="formValido">
          <v-row class="mt-2">
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="selecao.criancaAdolescente"
                clearable
                color="#347899"
                density="compact"
                item-title="nome"
                item-value="criancas_adolescentes_id"
                :items="criancasAdolescentes"
                label="Criança/Adolescente"
                :loading="carregandoCriancas"
                required
                :rules="[v => !!v || 'Selecione a Criança/Adolescente']"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="selecao.responsavel"
                clearable
                color="#347899"
                density="compact"
                item-title="nome"
                item-value="responsavel_id"
                :items="responsaveis"
                label="Responsável"
                :loading="carregandoResponsaveis"
                required
                :rules="[v => !!v || 'Selecione o Responsável']"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col class="d-flex justify-end flex-wrap flex-column flex-md-row align-center" cols="12">
              <v-btn
                class="text-none mb-2 mb-md-0 mr-md-2 w-100 w-md-auto"
                elevation="2"
                prepend-icon="mdi-file-document-plus"
                :style="{ backgroundColor: '#347899', color: 'white' }"
                to="/criancas-adolescentes"
              >
                Novo Monitoramento
              </v-btn>
              <v-btn
                class="text-none mb-2 mb-md-0 mr-md-2 w-100 w-md-auto"
                :disabled="!formValido || carregandoCriancas || carregandoResponsaveis || gerando"
                prepend-icon="mdi-file-export"
                :style="{ backgroundColor: '#00B894', color: 'white' }"
                @click="submitCSV"
              >
                <template v-if="!gerando">Exportar CSV</template>
                <template v-else>Gerando...</template>
              </v-btn>

              <v-btn
                class="text-none w-100 w-md-auto"
                :disabled="!formValido || carregandoCriancas || carregandoResponsaveis || gerando"
                prepend-icon="mdi-file-pdf-box"
                :style="{ backgroundColor: '#E57373', color: 'white' }"
                @click="submitForm"
              >
                <template v-if="!gerando">Gerar PDF</template>
                <template v-else>Gerando...</template>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-item>
    </v-card>

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
  import jsPDF from 'jspdf'
  import autoTable from 'jspdf-autotable'
  import { onMounted, ref } from 'vue'
  import api from '@/services/api'

  const formRef = ref(null)
  const formValido = ref(false)
  const carregandoCriancas = ref(false)
  const carregandoResponsaveis = ref(false)
  const gerando = ref(false)

  const selecao = ref({
    criancaAdolescente: null,
    responsavel: null,
  })

  const criancasAdolescentes = ref([])
  const responsaveis = ref([])

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

  const headerColor = [52, 120, 153] // azul institucional

  async function carregarCriancasAdolescentes () {
    carregandoCriancas.value = true
    try {
      const { data } = await api.get('/cadastros/criancas-adolescentes')
      criancasAdolescentes.value = data
    } finally {
      carregandoCriancas.value = false
    }
  }

  async function carregarResponsaveis () {
    carregandoResponsaveis.value = true
    try {
      const { data } = await api.get('/cadastros/responsavel')
      responsaveis.value = data
    } finally {
      carregandoResponsaveis.value = false
    }
  }

  async function carregarImagemDataURL (path) {
    const res = await fetch(path, { cache: 'no-cache' })
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.addEventListener('error', reject)
      reader.readAsDataURL(blob)
    })
  }

  // Helpers
  function formatDate (dateString) {
    if (!dateString) return '____/____/______'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      const parts = dateString.split('T')[0].split('-')
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
      return dateString
    }
    const isoString = date.toISOString().split('T')[0]
    const parts = isoString.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  function convertToSimNao (value) {
    return value === 1 ? 'SIM' : 'NÃO'
  }

  // =========================================================================
  // === Funções para Exportação CSV (CORRIGIDAS) ===
  // =========================================================================

  function convertArrayOfObjectsToCSV (data, headerLabels, headerKeys, filename) {
    // Usando aspas simples conforme a instrução de personalização:
    // "Sempre gere o array com as aspas simples."
    // Isso é aplicado no encapsulamento dos valores.
    const header = headerLabels.join(';')

    const csvContent = data.map(row => {
      const values = headerKeys.map(key => {
        let value = row[key] // Pega o valor sem converter para string de imediato

        // 1. Tratamento para arrays de objetos (Encaminhamentos)
        if (Array.isArray(value)) {
          value = value.map(e => {
            const necessario = e.necessario === 1 ? 'Necessário' : 'Não Necessário'
            const efetuado = e.efetuado === 1 ? 'Efetuado' : 'Não Efetuado'
            const descricao = e.tipo_encaminhamento_outro ? ` - ${e.tipo_encaminhamento_outro}` : ''
            // Retorna uma string detalhada para cada encaminhamento
            return `${e.tipo_encaminhamento} (${necessario}, ${efetuado})${descricao}`
          }).join(' | ') // Junta todos os encaminhamentos com um separador de fácil leitura
        } else {
          // 2. Tratamento para valores normais (null, undefined, number, string)
          value = value !== undefined && value !== null ? value.toString() : ''
        }

        // 3. Limpeza e Escapamento
        // Substitui aspas duplas por duas aspas duplas (escapamento)
        value = value.replace(/"/g, '""')
        // Remove quebras de linha para evitar quebras de célula no CSV
        value = value.replace(/\r\n|\n|\r/g, ' ')

        // 4. Encapsula o valor em aspas duplas (padrão CSV), crucial para valores que contenham o separador (;)
        return `"${value}"`
      })
      return values.join(';')
    }).join('\r\n')

    // Monta o CSV final com BOM para UTF-8 (necessário para o Excel)
    const finalCSV = '\uFEFF' + header + '\r\n' + csvContent

    // Força o download
    const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (navigator.msSaveBlob) { // Para IE 10+
      navigator.msSaveBlob(blob, filename)
    } else {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    }
  }

  async function exportarFichaParaCSV (data) {
    const crianca = data.criancaAdolescente || {}
    const responsavel = data.responsavel || {}

    // Objeto simples que representa uma linha do CSV, iniciando com campos fixos
    const dadosFlat = {
      // Campos de Responsável
      Responsavel_Nome: responsavel.nome || '',
      Responsavel_Funcao: responsavel.funcao || '',
      Responsavel_Telefone: responsavel.telefone || '',
      Responsavel_Whatsapp: responsavel.whatsapp || '',
      Responsavel_Email: responsavel.email || '',

      // Campos de Criança/Adolescente (Abreviados para brevidade)
      CA_Nome: crianca.nome || '',
      CA_Filiacao_Pai: crianca.filiacao_pai || '',
      CA_Filiacao_Mae: crianca.filiacao_mae || '',
      CA_Com_Quem_Mora: crianca.com_quem_mora || '',
      CA_Endereco: crianca.endereco || '',
      CA_Ponto_Referencia: crianca.ponto_referencia || '',
      CA_Telefone: crianca.telefone || '',
      CA_Email: crianca.email || '',
      CA_Contato: crianca.contato || '',
      CA_Telefone_Contato: crianca.telefone_contato || '',
      CA_Idade_Nascimento: crianca.idade_nascimento || '',
      CA_Registro_Civil: crianca.registro_civil || '',
      CA_Sexo: crianca.sexo || '',
      CA_Outra_Identificacao: crianca.outra_identificacao || '',
      CA_Comunidade_Originarios: crianca.comunidade_originarios || '',
      CA_Deficiencia: crianca.deficiencia || '',
      CA_Condicao_Saude: crianca.condicao_saude || '',
      CA_Programas_Sociais: crianca.programas_sociais || '',
      CA_Ocupacao_Atividade: crianca.ocupacao_atividade || '',
      CA_Situacao_Trabalho: crianca.situacao_trabalho || '',
      CA_Renda_Familiar: crianca.renda_familiar || '',
      CA_Tipo_Imovel: crianca.tipo_imovel || '',

      // Campos de Órgão/Procedência (SIVE 1)
      SIVE_Data_Encaminhamento: formatDate(crianca.data_encaminhamento),
      SIVE_Orgao_Responsavel: crianca.orgao_responsavel || '',
      SIVE_Orgao_Responsavel_Outro: crianca.orgao_responsavel_outro || '',

      // Motivação (SIVE 5)
      SIVE_Motivacao_Encaminhamento: crianca.motivacao_encaminhamento || '',
      SIVE_Motivacao_Encaminhamento_Outro: crianca.motivacao_encaminhamento_outro || '',

      // Descrições (SIVE 6 e 7)
      SIVE_Descricao_Atendimento: crianca.descricao_atendimento || '',
      SIVE_Relato_Espontaneo: crianca.relato_espontaneo || '',

      // PIA/Escuta (SIVE 8)
      PIA_Avaliacao_Individual: convertToSimNao(crianca.Avaliacao_individual),
      PIA_Avaliacao_Familiar: convertToSimNao(crianca.Avaliacao_familiar),
      PIA_Avaliacao_Domicilio: convertToSimNao(crianca.Avaliacao_domicilio),
      PIA_Escuta_Especializada: convertToSimNao(crianca.Escuta_especializada),
      PIA_Organ_Cuidado_Individual: convertToSimNao(crianca.Organ_cuidado_individual),
      PIA_Organ_Cuidado_Conjunto: convertToSimNao(crianca.Organ_cuidado_conjunto),
      PIA_Organ_Cuidado_Familia: convertToSimNao(crianca.Organ_cuidado_familia),

      // Encaminhamentos (SIVE 9) - O array será formatado em uma única célula
      SIVE_Encaminhamentos: crianca.encaminhamentos || [],

      // Agente Violador (SIVE 10) - LÓGICA DINÂMICA APLICADA AQUI
      SIVE_Agente_Violador: crianca.agente_violador || '', // Campo principal sempre incluso
    }

    const agenteViolador = crianca.agente_violador || ''

    // Adiciona as colunas de detalhe APENAS se o agente selecionado for o correspondente E houver um valor de detalhe.

    // Detalhe Estado
    if (agenteViolador === 'Estado' && crianca.agente_violador_estado) {
      dadosFlat['SIVE_Agente_Violador_Estado'] = crianca.agente_violador_estado
    }

    // Detalhe Família
    if (agenteViolador === 'Família' && crianca.agente_violador_familia) {
      dadosFlat['SIVE_Agente_Violador_Familia'] = crianca.agente_violador_familia
    }

    // Detalhe Sociedade
    if (agenteViolador === 'Sociedade' && crianca.agente_violador_sociedade) {
      dadosFlat['SIVE_Agente_Violador_Sociedade'] = crianca.agente_violador_sociedade
    }

    // Status (SIVE 11) e Acompanhamento
    dadosFlat['SIVE_Status'] = crianca.status || ''
    dadosFlat['SIVE_Tipo_Acompanhamento'] = crianca.tipo_acompanhamento || ''
    dadosFlat['SIVE_Periodo_Acompanhamento'] = crianca.periodo_acompanhamento || ''

    // Encerramento (SIVE 14)
    dadosFlat['SIVE_Motivo_Encerramento'] = crianca.motivo_encerramento || ''
    dadosFlat['SIVE_Motivo_Encerramento_Outro'] = crianca.motivo_encerramento_outro || ''

    // Gera as chaves e labels dinamicamente
    const headerKeys = Object.keys(dadosFlat)
    const headerLabels = headerKeys.map(key => key.replace(/_/g, ' '))

    const rawName = (crianca.nome || 'ficha').toLowerCase()
    const safeName = rawName.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-')
    const fileName = `ficha-sive-${safeName}.csv`

    convertArrayOfObjectsToCSV([dadosFlat], headerLabels, headerKeys, fileName)

    exibirToast('Dados exportados para CSV. O arquivo deve iniciar o download.', 'success')
  }

  // === Função que chama a API e exporta para CSV ===
  async function submitCSV () {
    const { valid } = await formRef.value.validate()
    if (!valid) return
    if (!selecao.value.criancaAdolescente || !selecao.value.responsavel) {
      exibirToast('Selecione a criança/adolescente e o responsável.', 'error')
      return
    }

    gerando.value = true
    exibirToast('Preparando para exportar os dados...', 'info')
    try {
      const payload = {
        criancas_adolescentes_id: selecao.value.criancaAdolescente,
        responsavel_id: selecao.value.responsavel,
      }
      const { data } = await api.post('/relatorios/ficha-sive', payload)
      await exportarFichaParaCSV(data)
    } catch (error) {
      console.error(error)
      exibirToast('Erro ao exportar os dados para CSV.', 'error')
    } finally {
      gerando.value = false
    }
  }
  // =========================================================================
  // === FIM DAS FUNÇÕES CSV ===
  // =========================================================================

  async function gerarFichaPDF (payload) {
    gerando.value = true
    try {
      const { data } = await api.post('/relatorios/ficha-sive', payload)
      const crianca = data.criancaAdolescente || {}
      const responsavel = data.responsavel || {}

      // Helpers
      function formatDate (dateString) {
        if (!dateString) return '____/____/______'
        const date = new Date(dateString)
        if (Number.isNaN(date.getTime())) {
          // Tentativa de formatar se for um formato ISO completo
          const parts = dateString.split('T')[0].split('-')
          if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
          return dateString // Retorna o original se falhar
        }
        // Se for uma data JS válida (o que pode não ser o caso do seu YYYY-MM-DD puro)
        const isoString = date.toISOString().split('T')[0]
        const parts = isoString.split('-')
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      }

      function convertToSimNao (value) {
        // Assume que `1` é SIM e qualquer outra coisa (0, null, etc.) é NÃO.
        return value === 1 ? 'SIM' : 'NÃO'
      }

      const rawName = (crianca.nome || 'ficha').toLowerCase()
      const safeName = rawName.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '-')
      const fileName = `ficha-${safeName}.pdf`

      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 12
      let cursorY = 12

      const logoEsq = await carregarImagemDataURL('/logo.png')
      const logoDir = await carregarImagemDataURL('/farol.png')

      if (logoEsq) doc.addImage(logoEsq, 'PNG', margin, cursorY, 30, 30)
      if (logoDir) {
        const img = new Image()
        img.src = logoDir
        await new Promise(r => img.addEventListener('load', r))
        const aspect = img.width / img.height || 1
        const w = 30
        const h = w / aspect
        doc.addImage(logoDir, 'PNG', pageWidth - margin - w, cursorY, w, h)
      }

      doc.setFontSize(13)
      doc.text('Sistema de Monitoramento de Violência e Evasão - SIVE', pageWidth / 2, cursorY + 8, { align: 'center' })
      doc.setFontSize(10)
      doc.text('Informações de Monitoramento de Violência e Evasão', pageWidth / 2, cursorY + 15, { align: 'center' })
      cursorY += 46

      // Helper to break page if necessary
      function ensureSpace (needed = 60) {
        if (cursorY + needed > pageHeight - 40) {
          doc.addPage()
          cursorY = 12
        }
      }

      // ---------- 1. Órgão, programa, serviço ou OSC responsável (preenchimento dinâmico) ----------
      doc.setFontSize(10).setFont('helvetica', 'bold')
      doc.text('1. Órgão, programa, serviço ou OSC responsável pelo envio da informação', margin, cursorY)
      cursorY += 4

      const orgaoOptions = [
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
      ]

      const orgaoResponsavel = crianca.orgao_responsavel || ''
      // Utiliza o campo orgao_responsavel_outro, vindo do backend
      const orgaoOutro = crianca.orgao_responsavel_outro || ''
      const isOrgaoOutro = orgaoResponsavel === 'Outros(a):'

      const orgRows = orgaoOptions.map(option => {
        const isMarked = option === orgaoResponsavel
        // A opção 'Outros(a):' será tratada separadamente, então garantimos que as opções listadas não marquem se o campo for 'Outros(a):'
        return [`(${isMarked && !isOrgaoOutro ? 'X' : ' '}) ${option}`, '']
      })

      // Adiciona o "Outro" dinamicamente (APENAS UMA LINHA)
      const outroOrgaoOption = 'Outro tipo de procedência. Especificar:'
      const outroOrgaoRow = [`(${isOrgaoOutro ? 'X' : ' '}) ${outroOrgaoOption}`, orgaoOutro]
      orgRows.push(outroOrgaoRow)

      autoTable(doc, {
        startY: cursorY,
        head: [],
        body: orgRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 40 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 2. Data do envio (preenchimento dinâmico) ----------
      doc.setFont('helvetica', 'bold')
      doc.text('2. Data do envio das informações (encaminhamento)', margin, cursorY)
      cursorY += 4

      const dataEncaminhamento = formatDate(crianca.data_encaminhamento)

      autoTable(doc, {
        startY: cursorY,
        theme: 'plain',
        body: [[`Data do encaminhamento: ${dataEncaminhamento}`]],
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 24

      // ---------- 3. Responsável pelo preenchimento (dados da API) ----------
      ensureSpace(120)
      doc.setFont('helvetica', 'bold')
      doc.text('3. Responsável pelo preenchimento', margin, cursorY)
      cursorY += 4
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: cursorY,
        head: [['Nome', 'Função']],
        body: [[responsavel.nome || '', responsavel.funcao || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Contatos', '']],
        body: [[`Telefone(s): ${responsavel.telefone || ''}`, `WhatsApp: ${responsavel.whatsapp || ''}`]],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['E-mail']],
        body: [[responsavel.email || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 4. Dados da criança ou do adolescente (dados da API) ----------
      doc.setFont('helvetica', 'bold')
      doc.text('4. Dados da criança ou do adolescente', margin, cursorY)
      cursorY += 4
      doc.setFont('helvetica', 'normal')
      autoTable(doc, {
        startY: cursorY,
        head: [['Nome', 'Filiação - Pai', 'Filiação - Mãe']],
        body: [[crianca.nome || '', crianca.filiacao_pai || '', crianca.filiacao_mae || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Com quem mora']],
        body: [[crianca.com_quem_mora || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Endereço', 'Ponto de referência']],
        body: [[crianca.endereco || '', crianca.ponto_referencia || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Telefone', 'E-mail', 'Contato', 'Telefone de contato']],
        body: [[crianca.telefone || '', crianca.email || '', crianca.contato || '', crianca.telefone_contato || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Idade / Data de Nascimento']],
        body: [[crianca.idade_nascimento || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Registro civil', 'Sexo', 'Outra identificação', 'Comunidade ou povos originários']],
        body: [[crianca.registro_civil || '', crianca.sexo || '', crianca.outra_identificacao || '', crianca.comunidade_originarios || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Deficiência', 'Condição de saúde', 'Programas Sociais']],
        body: [[crianca.deficiencia || '', crianca.condicao_saude || '', crianca.programas_sociais || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Ocupação / Atividade', 'Situação de Trabalho', 'Renda Familiar']],
        body: [[crianca.ocupacao_atividade || '', crianca.situacao_trabalho || '', crianca.renda_familiar || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Tipo do imóvel']],
        body: [[crianca.tipo_imovel || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 6

      // ---------- 5. Motivação do encaminhamento (preenchimento dinâmico) ----------
      ensureSpace(120)
      doc.setFont('helvetica', 'bold')
      doc.text('5. Motivação do encaminhamento', margin, cursorY)
      cursorY += 4
      const motivacaoOptions = [
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
      ]
      const motivacao = crianca.motivacao_encaminhamento || ''
      const motivacaoOutro = crianca.motivacao_encaminhamento_outro || ''
      const isMotivacaoOutro = motivacao === 'Outro(a):' // CORRIGIDO: Era 'Outro:'
      const motivRows = motivacaoOptions.map(option => {
        const isMarked = option === motivacao
        const check = isMarked && !isMotivacaoOutro ? 'X' : ' '
        return [`(${check}) ${option}`, '']
      })
      // Adiciona o "Outro" dinamicamente (APENAS UMA LINHA)
      const outroMotivacaoOption = 'Outro(a):' // CORRIGIDO: Era 'Outro:'
      const outroValue = isMotivacaoOutro ? motivacaoOutro : ''
      const isMarkedMotivacao = isMotivacaoOutro ? 'X' : ' '
      motivRows.push([`(${isMarkedMotivacao}) ${outroMotivacaoOption}`, outroValue])
      autoTable(doc, {
        startY: cursorY,
        body: motivRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 40 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 6

      // ---------- 6. Descrição do atendimento (preenchimento dinâmico) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('6. Descrição do atendimento', margin, cursorY)
      cursorY += 4
      doc.setFont('helvetica', 'normal')

      // Usa splitTextToSize para quebrar o texto longo
      const descriptionLines = doc.splitTextToSize(crianca.descricao_atendimento || '', pageWidth - margin * 2)

      const lineSpacing = 4 // Espaçamento entre as linhas
      const textHeight = descriptionLines.length * lineSpacing + 2

      ensureSpace(textHeight + 10)

      doc.rect(margin, cursorY, pageWidth - margin * 2, textHeight) // Desenha o retângulo
      let currentY = cursorY + 3
      for (const line of descriptionLines) {
        doc.text(line, margin + 2, currentY, { maxWidth: pageWidth - margin * 2 - 4 })
        currentY += lineSpacing
      }
      cursorY = currentY + 4 // Atualiza o cursor Y após o texto longo

      // ---------- 7. Relato espontâneo da criança ou do adolescente, quando houver (preenchimento dinâmico) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('7. Relato espontâneo da criança ou do adolescente, quando houver', margin, cursorY)
      cursorY += 4
      doc.setFont('helvetica', 'normal')

      const relatoLines = doc.splitTextToSize(crianca.relato_espontaneo || '', pageWidth - margin * 2)

      const relatoHeight = relatoLines.length * lineSpacing + 2

      ensureSpace(relatoHeight + 10)

      doc.rect(margin, cursorY, pageWidth - margin * 2, relatoHeight) // Desenha o retângulo
      currentY = cursorY + 3
      for (const line of relatoLines) {
        doc.text(line, margin + 2, currentY, { maxWidth: pageWidth - margin * 2 - 4 })
        currentY += lineSpacing
      }
      cursorY = currentY + 4

      // ---------- 8. Plano Individual de Atendimento (PIA) / Escuta Especializada (preenchimento dinâmico) ----------
      ensureSpace(120)
      doc.setFont('helvetica', 'bold')
      doc.text('8. Plano Individual de Atendimento (PIA) / Escuta Especializada', margin, cursorY)
      cursorY += 4

      const piaRows = [
        ['Avaliação diagnóstica individual.', crianca.Avaliacao_individual === null ? ' ' : 'X'],
        ['Avaliação diagnóstica familiar.', crianca.Avaliacao_familiar === null ? ' ' : 'X'],
        ['Avaliação diagnóstica familiar com visita ao domicílio.', crianca.Avaliacao_domicilio === null ? ' ' : 'X'],
        ['Escuta Especializada', crianca.Escuta_especializada === null ? ' ' : 'X'],
        ['Organização das abordagens de cuidado e ou atividades para a criança e ou adolescente.', crianca.Organ_cuidado_individual === null ? ' ' : 'X'],
        ['Organização das abordagens de cuidado e ou atividades de que juntos participam a criança e o adolescente e membros da família.', crianca.Organ_cuidado_conjunto === null ? ' ' : 'X'],
        ['Organização abordagens de cuidado e ou atividades para membros da família.', crianca.Organ_cuidado_familia === null ? ' ' : 'X'],
      ]

      const piaBody = piaRows.map(([label, isChecked]) => [label, isChecked === 'X' ? 'X' : ' '])

      autoTable(doc, {
        startY: cursorY,
        head: [['Procedimento técnico', 'Sim', 'Não']],
        body: piaBody.map(([label, sim]) => [label, sim, sim === 'X' ? ' ' : 'X']),
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
        theme: 'grid',
        columnStyles: { 1: { cellWidth: 24, halign: 'center' }, 2: { cellWidth: 24, halign: 'center' } },
      })
      cursorY = doc.lastAutoTable.finalY + 6

      // ---------- 9. Encaminhamentos necessários e/ou efetuados (preenchimento dinâmico) ----------
      ensureSpace(120)
      doc.setFont('helvetica', 'bold')
      doc.text('9. Encaminhamentos necessários e/ou efetuados', margin, cursorY)
      cursorY += 4

      const encaminhamentos = crianca.encaminhamentos || []

      const encaminhamentoOptions = [
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
        'Atividades culturais libres',
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
      ]

      const encaminhamentoRows = encaminhamentoOptions.map(option => {
        const item = encaminhamentos.find(e => e.tipo_encaminhamento === option)
        const isNecessary = item?.necessario === 1 ? 'SIM' : ''
        const isExecuted = item?.efetuado === 1 ? 'SIM' : ''
        return [option, isNecessary, isExecuted]
      })

      // Trata a opção 'Outro(a):'
      const outroItem = encaminhamentos.find(e => e.tipo_encaminhamento === 'Outro(a):')
      const outroNecessario = outroItem?.necessario === 1 ? 'SIM' : ' '
      const outroEfetuado = outroItem?.efetuado === 1 ? 'SIM' : ' '
      const outroDescricao = outroItem?.tipo_encaminhamento_outro || ''

      encaminhamentoRows.push([`Outro(a): ${outroDescricao}`, outroNecessario, outroEfetuado])

      autoTable(doc, {
        startY: cursorY,
        head: [['Tipo do encaminhamento', 'Necessário', 'Efetuado']],
        body: encaminhamentoRows,
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
        theme: 'grid',
        columnStyles: { 1: { cellWidth: 24, halign: 'center' }, 2: { cellWidth: 24, halign: 'center' } },
      })
      cursorY = doc.lastAutoTable.finalY + 6

      // ---------- 10. Agente Violador (preenchimento dinâmico) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('10. Agente Violador', margin, cursorY)
      cursorY += 4

      const agenteViolador = crianca.agente_violador || ''

      const agenteRows = [
        [`(${agenteViolador === 'Própria Criança/Adolescente' ? 'X' : ' '}) Própria Criança/Adolescente`, ''],
        [`(${agenteViolador === 'Estado' ? 'X' : ' '}) Estado:`, crianca.agente_violador_estado || ''],
        [`(${agenteViolador === 'Família' ? 'X' : ' '}) Família:`, crianca.agente_violador_familia || ''],
        [`(${agenteViolador === 'Sociedade' ? 'X' : ' '}) Sociedade:`, crianca.agente_violador_sociedade || ''],
      ]

      autoTable(doc, {
        startY: cursorY,
        body: agenteRows,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 40 } },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 11. Status (preenchimento dinâmico) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('11. Status', margin, cursorY)
      cursorY += 4

      const status = crianca.status || ''
      const statusOptions = ['Pendente', 'Improcedente', 'Fora do perfil/atribuições da Justiça ou Segurança Pública', 'Procedente']

      const statusRows
        = statusOptions.map(option => [`(${status === option ? 'X' : ' '}) ${option}`, ''])

      autoTable(doc, {
        startY: cursorY,
        body: statusRows,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 12. Acompanhamento (preenchimento dinâmico) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('12. Acompanhamento', margin, cursorY)
      cursorY += 4

      const tipoAcompanhamento = crianca.tipo_acompanhamento || ''

      const acompanhamentoOptions = ['Audiência', 'Relatório Escrito', 'Relatório Telefônico']
      const isOutroTipoAcompanhamento = !acompanhamentoOptions.includes(tipoAcompanhamento)

      const acompanhamentoRows = acompanhamentoOptions.map(option => [`(${tipoAcompanhamento === option ? 'X' : ' '}) ${option}`, ''])

      const outroTipoAcompanhamentoLabel = 'Outros:'
      const outroTipoAcompanhamentoValue = isOutroTipoAcompanhamento ? tipoAcompanhamento : ''
      const outroTipoAcompanhamentoCheck = isOutroTipoAcompanhamento ? 'X' : ' '

      acompanhamentoRows.push([`(${outroTipoAcompanhamentoCheck}) ${outroTipoAcompanhamentoLabel}`, outroTipoAcompanhamentoValue])

      autoTable(doc, {
        startY: cursorY,
        body: acompanhamentoRows,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 40 } },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 13. Acompanhamento - Período (preenchimento dinâmico) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('13. Acompanhamento', margin, cursorY)
      cursorY += 4

      const periodoAcompanhamento = crianca.periodo_acompanhamento || ''

      const periodoOptions = ['Diária', 'Semanal', 'Quinzenal', 'Mensal']
      const isOutroPeriodo = !periodoOptions.includes(periodoAcompanhamento)

      const periodoRows = periodoOptions.map(option => [`(${periodoAcompanhamento === option ? 'X' : ' '}) ${option}`, ''])

      const outroPeriodoLabel = 'Outros (Dias):'
      const outroPeriodoValue = isOutroPeriodo ? periodoAcompanhamento : ''
      const outroPeriodoCheck = isOutroPeriodo ? 'X' : ' '

      periodoRows.push([`(${outroPeriodoCheck}) ${outroPeriodoLabel}`, outroPeriodoValue])

      autoTable(doc, {
        startY: cursorY,
        body: periodoRows,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 40 } },
      })
      cursorY = doc.lastAutoTable.finalY + 6

      // ---------- 14. Motivo do encerramento do atendimento/acompanhamento (preenchimento dinâmico) ----------
      ensureSpace(100)
      doc.setFont('helvetica', 'bold')
      doc.text('14. Motivo do encerramento do atendimento/acompanhamento', margin, cursorY)
      cursorY += 4
      const encerramentoOptions = [
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
      ]

      const encerramento = crianca.motivo_encerramento || ''
      const encerramentoOutro = crianca.motivo_encerramento_outro || ''
      const isEncerramentoOutro = encerramento === 'Outro(a):' // CORRIGIDO: Era 'Outro:'
      const encerramentoRows = encerramentoOptions.map(option => {
        const isMarked = option === encerramento
        const check = isMarked && !isEncerramentoOutro ? 'X' : ' '
        return [`(${check}) ${option}`, '']
      })

      // Adiciona o "Outro" dinamicamente (APENAS UMA LINHA)
      const outroEncerramentoOption = 'Outro(a):' // CORRIGIDO: Era 'Outro:'
      const outroEncerramentoValue = isEncerramentoOutro ? encerramentoOutro : ''
      const isMarkedEncerramento = isEncerramentoOutro ? 'X' : ' '
      encerramentoRows.push([`(${isMarkedEncerramento}) ${outroEncerramentoOption}`, outroEncerramentoValue])

      autoTable(doc, {
        startY: cursorY,
        body: encerramentoRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 40 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 24

      // Rodapé
      const footerY = pageHeight - 12
      doc.setFontSize(8).setFont('helvetica', 'normal')
      doc.text('Rua Clarice Baeta, 85 | Bairro Tércio Wanderley | 57 230 000 | Coruripe/AL', pageWidth / 2, footerY, { align: 'center' })
      doc.text('consultoriafarol2019@hotmail.com; weliton_al@hotmail.com', pageWidth / 2, footerY + 4, { align: 'center' })

      // Abrir em nova aba
      const blobUrl = doc.output('bloburl')
      window.open(blobUrl, '_blank')
      exibirToast('Ficha gerada. Abrindo em nova aba...', 'success')
    } catch (error) {
      console.error(error)
      exibirToast('Erro ao gerar a ficha PDF.', 'error')
    } finally {
      gerando.value = false
    }
  }

  async function submitForm () {
    const { valid } = await formRef.value.validate()
    if (!valid) return
    if (!selecao.value.criancaAdolescente || !selecao.value.responsavel) {
      exibirToast('Selecione a criança/adolescente e o responsável.', 'error')
      return
    }
    exibirToast('Preparando para gerar a ficha...', 'info')
    await gerarFichaPDF({
      criancas_adolescentes_id: selecao.value.criancaAdolescente,
      responsavel_id: selecao.value.responsavel,
    })
  }

  onMounted(() => {
    carregarCriancasAdolescentes()
    carregarResponsaveis()
  })
</script>
