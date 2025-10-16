<template>
  <div class="pa-4">
    <v-card class="pa-10" elevation="2">
      <v-row class="d-flex justify-space-between align-center mb-6">
        <h2 :style="{ color: '#347899' }">Gerar Ficha SIVE</h2>
      </v-row>

      <v-card-item>
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
            <v-col class="d-flex justify-end" cols="12">
              <v-btn
                class="text-none"
                :disabled="!formValido || carregandoCriancas || carregandoResponsaveis || gerando"
                prepend-icon="mdi-file-pdf-box"
                :style="{ backgroundColor: '#347899', color: 'white' }"
                @click="submitForm"
              >
                <template v-if="!gerando">Gerar</template>
                <template v-else>Gerando...</template>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-item>
    </v-card>

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
  })

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

  async function gerarFichaPDF (payload) {
    gerando.value = true
    try {
      const { data } = await api.post('/relatorios/ficha-sive', payload)
      const crianca = data.criancaAdolescente || {}
      const responsavel = data.responsavel || {}

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

      // ---------- 1. Órgão, programa, serviço ou OSC responsável (tabela com duas colunas: texto | espaço) ----------
      doc.setFontSize(10).setFont('helvetica', 'bold')
      doc.text('1. Órgão, programa, serviço ou OSC responsável pelo envio da informação', margin, cursorY)
      cursorY += 4
      const orgRows = [
        ['Escola', ''],
        ['Conselho Tutelar', ''],
        ['Medida protetiva determinada pelo Poder Judiciário', ''],
        ['Medida socioeducativa determinada pelo Poder Judiciário', ''],
        ['Encaminhamento do Ministério Público', ''],
        ['Encaminhamento da Assistência social (CREAS)', ''],
        ['Encaminhamento da Assistência social (CRAS)', ''],
        ['Encaminhamento do Serviço Especializado de Abordagem Social', ''],
        ['Encaminhamento da Saúde', ''],
        ['Procura direta da família pelo serviço (demanda espontânea)', ''],
        ['Procura direta da criança e ou adolescente pelo serviço (demanda espontânea)', ''],
        ['Busca ativa do próprio programa', ''],
        ['Busca ativa do próprio programa com mediação da REDE', ''],
        ['Outro tipo de procedência. Especificar:', ''],
        ['Outro tipo de procedência. Especificar: ', ''],
      ]
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

      // ---------- 2. Data do envio ----------
      doc.setFont('helvetica', 'bold')
      doc.text('2. Data do envio das informações (encaminhamento)', margin, cursorY)
      cursorY += 4
      autoTable(doc, {
        startY: cursorY,
        theme: 'plain',
        body: [['Data do encaminhamento: ____/____/______']],
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
        head: [['Ocupação / Atividade', 'Situação de Trabalho']],
        body: [[crianca.ocupacao_atividade || '', crianca.situacao_trabalho || '']],
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      autoTable(doc, {
        startY: cursorY,
        head: [['Renda Familiar']],
        body: [[crianca.renda_familiar || '']],
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

      // ---------- 5. Motivação do encaminhamento (tabela) ----------
      ensureSpace(120)
      doc.setFont('helvetica', 'bold')
      doc.text('5. Motivação do encaminhamento', margin, cursorY)
      cursorY += 4
      const motivRows = [
        ['Abandono familiar/rompimento de vínculos', ''],
        ['Abandono familiar/vínculos', ''],
        ['Adolescente autor de ato infracional', ''],
        ['Álcool e outras drogas', ''],
        ['Colocação familiar/Acolhimento institucional', ''],
        ['Elevado número de faltas injustificadas', ''],
        ['Evasão escolar', ''],
        ['Evasão ou impedimento de atendimento em serviço de saúde', ''],
        ['Gravidez precoce', ''],
        ['Insegurança alimentar', ''],
        ['Maus-tratos (abuso do poder familiar/negligência/omissões)', ''],
        ['Omissão/negligência', ''],
        ['Pessoas com deficiência', ''],
        ['Situação de rua', ''],
        ['Violência financeira', ''],
        ['Violência física', ''],
        ['Violência institucional', ''],
        ['Violência psicológica', ''],
        ['Violência sexual', ''],
        ['Violência sexual: exploração sexual comercial de crianças ou adolescentes', ''],
        ['Trabalho Infantil', ''],
        ['Violência doméstica/familiar', ''],
        ['Outro:', ''],
        ['Outro:', ''],
        ['Outro:', ''],
      ]
      autoTable(doc, {
        startY: cursorY,
        body: motivRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 40 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 6. Descrição do atendimento (linhas para preenchimento) ----------
      ensureSpace(120)
      doc.setFont('helvetica', 'bold')
      doc.text('6. Descrição do atendimento', margin, cursorY)
      cursorY += 4
      // create many slim rows for manual writing
      const linhas6 = Array.from({ length: 14 }).map(() => [''])
      autoTable(doc, {
        startY: cursorY,
        body: linhas6,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2, minCellHeight: 6 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // 7. Relato (14 linhas)
      doc.setFont('helvetica', 'bold')
      doc.text('7. Relato espontâneo da criança ou do adolescente, quando houver', margin, cursorY)
      cursorY += 4
      const linhas7 = Array.from({ length: 14 }).map(() => [''])
      autoTable(doc, {
        startY: cursorY,
        body: linhas7,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2, minCellHeight: 6 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 24

      // 8. PIA / Escuta
      ensureSpace(120)
      const piaRows = [
        ['Avaliação diagnóstica individual.', '', ''],
        ['Avaliação diagnóstica familiar.', '', ''],
        ['Avaliação diagnóstica familiar com visita ao domicílio.', '', ''],
        ['Escuta Especializada', '', ''],
        ['Organização das abordagens de cuidado e ou atividades para a criança e ou adolescente.', '', ''],
        ['Organização das abordagens de cuidado e ou atividades de que juntos participam a criança e o adolescente e membros da família.', '', ''],
        ['Organização abordagens de cuidado e ou atividades para membros da família.', '', ''],
      ]
      doc.setFont('helvetica', 'bold')
      doc.text('8. Plano Individual de Atendimento (PIA) / Escuta Especializada', margin, cursorY)
      cursorY += 4
      autoTable(doc, {
        startY: cursorY,
        head: [['Procedimento técnico', 'Sim', 'Não']],
        body: piaRows,
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9, cellPadding: 3 },
        theme: 'grid',
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 20 }, 2: { cellWidth: 20 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 6

      // ---------- 9. Encaminhamentos (tabela 3 colunas) ----------
      ensureSpace(220)
      doc.setFont('helvetica', 'bold')
      doc.text('9. Encaminhamentos necessários e/ou efetuados', margin, cursorY)
      cursorY += 4
      const encaminRows = [
        ['Acompanhamento escolar', '', ''],
        ['Assistência médica clínica', '', ''],
        ['Assistência médica farmacológica', '', ''],
        ['Assistência médica psiquiátrica', '', ''],
        ['Assistência odontológica', '', ''],
        ['Assistência psicológica – psicoterapia individual', '', ''],
        ['Assistência psicológica – psicoterapia em grupo', '', ''],
        ['Assistência psicológica – psicoterapia familiar', '', ''],
        ['Atendimento psicossocial individual', '', ''],
        ['Atendimento psicossocial em grupo', '', ''],
        ['Atividades culturais livres', '', ''],
        ['Aulas de informática', '', ''],
        ['Cursos de qualificação profissional', '', ''],
        ['Educador físico', '', ''],
        ['Fisioterapia', '', ''],
        ['Fonoaudiologia', '', ''],
        ['Nutricionista', '', ''],
        ['Oficina de artes', '', ''],
        ['Oficina de artesanato', '', ''],
        ['Oficina de audiovisual', '', ''],
        ['Oficina de capoeira', '', ''],
        ['Oficina de dança', '', ''],
        ['Oficina de desenvolvimento da cidadania e ou do protagonismo social', '', ''],
        ['Oficina de Educomunicação', '', ''],
        ['Oficina de esportes', '', ''],
        ['Oficina de formação política', '', ''],
        ['Oficina de geração de renda', '', ''],
        ['Oficina de música', '', ''],
        ['Oficina estruturada para desenvolvimento de capacidades de autocuidado com a saúde física e mental', '', ''],
        ['Oficina estruturada para desenvolvimento de capacidades de autocuidado nas relações afetivas e sexuais', '', ''],
        ['Oficina estruturada para desenvolvimento de capacidades de cuidado com o meio ambiente', '', ''],
        ['Orientação jurídico-social', '', ''],
        ['Recuperação de atraso de aprendizagem / escolar (reforço escolar)', '', ''],
        ['Reintegração na família natural origem ou integração na família natural extensa ou integração em família substituta adotiva', '', ''],
        ['Serviço Social', '', ''],
        ['Técnico de apoio a escolas', '', ''],
        ['Terapia ocupacional', '', ''],
        ['Outro(a):', '', ''],
        ['Outro(a):', '', ''],
      ]
      autoTable(doc, {
        startY: cursorY,
        head: [['Tipo do encaminhamento', 'Necessário', 'Efetuado']],
        body: encaminRows,
        headStyles: { fillColor: headerColor },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 80 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } },
        margin: { left: margin, right: margin },
        theme: 'grid',
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 10. Agente Violador (caixa com opções) ----------
      ensureSpace(60)
      doc.setFont('helvetica', 'bold')
      doc.text('10. Agente Violador', margin, cursorY)
      cursorY += 4
      const agenteRows = [
        ['(    ) Própria Criança/Adolescente'],
        ['(    ) Estado: ________________________________'],
        ['(    ) Família: ________________________________'],
        ['(    ) Sociedade: ________________________________'],
      ]
      autoTable(doc, {
        startY: cursorY,
        body: agenteRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 11. Status (opções) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('11. Status', margin, cursorY)
      cursorY += 4
      autoTable(doc, {
        startY: cursorY,
        body: [
          ['Pendente (    )  Improcedente (    )  Fora do perfil/atribuições da Justiça ou Segurança Pública (    )'],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 12. Acompanhamento (tipo) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('12. Acompanhamento', margin, cursorY)
      cursorY += 4
      autoTable(doc, {
        startY: cursorY,
        body: [
          ['Audiência (    )    Relatório Escrito (    )    Relatório Telefônico (    )    Outros (    ): _______________________'],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 13. Acompanhamento (frequência) ----------
      ensureSpace(40)
      doc.setFont('helvetica', 'bold')
      doc.text('13. Acompanhamento', margin, cursorY)
      cursorY += 4
      autoTable(doc, {
        startY: cursorY,
        body: [
          ['Diária (    )    Semanal (    )    Quinzenal (    )    Mensal (    )    Outros (Dias): ____________________'],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 12

      // ---------- 14. Motivo do encerramento (tabela) ----------
      ensureSpace(160)
      doc.setFont('helvetica', 'bold')
      doc.text('14. Motivo do encerramento do atendimento/acompanhamento', margin, cursorY)
      cursorY += 4
      const motivoRows = [
        ['Fim da(s) situação(s) de abandono familiar', ''],
        ['Cumprimento de MSE pela política de Assistência Social', ''],
        ['Inclusão em tratamentos de saúde e alta médica', ''],
        ['Inclusão em Programa de Familiar Acolhedora/Acolhimento institucional', ''],
        ['Regulação das faltas / normalidade da presença', ''],
        ['Retorno a escola', ''],
        ['Fim de ciclos de violência', ''],
        ['Fim de ciclos de omissão/negligência', ''],
        ['Saída da condição de situação de rua', ''],
        ['Fim de ciclos de Trabalho Infantil', ''],
        ['Outro:', ''],
        ['Outro:', ''],
        ['Outro:', ''],
      ]
      autoTable(doc, {
        startY: cursorY,
        body: motivoRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: pageWidth - margin * 2 - 40 }, 1: { cellWidth: 40 } },
        margin: { left: margin, right: margin },
      })
      cursorY = doc.lastAutoTable.finalY + 8

      // Rodapé
      const footerY = pageHeight - 18
      doc.setFontSize(8)
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

  function exibirToast (text, color) {
    snackbar.value = { show: true, text, color }
  }

  onMounted(() => {
    carregarCriancasAdolescentes()
    carregarResponsaveis()
  })
</script>

<style>
.v-autocomplete .v-field__input {
  color: #347899 !important;
}
.v-field--density-compact .v-field__outline {
  padding-top: 10px;
}
</style>
