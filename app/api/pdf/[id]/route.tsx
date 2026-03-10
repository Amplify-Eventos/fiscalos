import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { criarDigitalTwin } from '@/lib/digital-twin'
import { renderToStream } from '@react-pdf/renderer'
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Registra fontes padrão caso necessário (opcional)
// Font.register({ family: 'Open Sans', src: '...' })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
    marginBottom: 30,
  },
  headerLeft: {
    width: '60%',
  },
  headerRight: {
    width: '40%',
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cnpj: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
    marginBottom: 10,
  },
  scoreCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
  },
  scoreLeft: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRight: {
    width: '70%',
    paddingLeft: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  scoreDesc: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricName: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  bestScenario: {
    backgroundColor: '#dcfce7',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
    marginBottom: 20,
  },
  bestScenarioLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#15803d',
    textTransform: 'uppercase',
  },
  bestScenarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14532d',
    marginTop: 4,
  },
  bestScenarioDesc: {
    fontSize: 12,
    color: '#166534',
    marginTop: 4,
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14532d',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
  },
  tableCol1: { width: '40%' },
  tableCol2: { width: '20%', textAlign: 'right' },
  tableCol3: { width: '20%', textAlign: 'right' },
  tableCol4: { width: '20%', textAlign: 'right' },
  tableCellHeader: {
    fontSize: 10,
    color: '#334155',
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
    color: '#475569',
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  tableCellGreen: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  strategyCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  strategyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  strategyImpact: {
    fontSize: 8,
    fontWeight: 'bold',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  strategyDesc: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 10,
  },
  strategyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  }
})

function formatCurrency(value: number) {
  return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const ReportDocument = ({ client, diagnostico, melhorCenario, simulacoes, estrategias }: any) => {
  const scoreColors: any = {
    OTIMO: '#16a34a',
    BOM: '#22c55e',
    REGULAR: '#ca8a04',
    RUIM: '#ea580c',
    CRITICO: '#dc2626'
  }
  const color = scoreColors[diagnostico.score.classificacao] || '#2563eb'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Planejamento Fiscal</Text>
            <Text style={styles.subtitle}>Relatório Estratégico gerado em {new Date().toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{client.companyName}</Text>
            <Text style={styles.cnpj}>CNPJ: {client.cnpj}</Text>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <View style={[styles.scoreCircle, { backgroundColor: color }]}>
              <Text style={styles.scoreText}>{diagnostico.score.score}</Text>
            </View>
          </View>
          <View style={styles.scoreRight}>
            <Text style={[styles.scoreLabel, { color }]}>{diagnostico.score.classificacao}</Text>
            <Text style={styles.scoreDesc}>
              {diagnostico.score.score >= 70 
                ? 'Sua empresa possui uma boa estrutura fiscal, mas ainda há oportunidades de otimização.' 
                : 'Sua estrutura fiscal precisa de atenção urgente para evitar desperdício de dinheiro.'}
            </Text>
            
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricName}>Risco Fiscal</Text>
                <Text style={styles.metricValue}>{diagnostico.riscoFiscal}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricName}>Eficiência</Text>
                <Text style={styles.metricValue}>{diagnostico.eficienciaTributaria}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricName}>Potencial Economia</Text>
                <Text style={styles.metricValue}>{diagnostico.potencialEconomia}</Text>
              </View>
            </View>
          </View>
        </View>

        {melhorCenario && melhorCenario.economiaVsAtual > 0 && (
          <View style={styles.bestScenario}>
            <Text style={styles.bestScenarioLabel}>Melhor Cenário Identificado</Text>
            <Text style={styles.bestScenarioTitle}>{melhorCenario.nome}</Text>
            <Text style={styles.bestScenarioDesc}>{melhorCenario.descricao}</Text>
            <Text style={styles.savingsText}>{formatCurrency(melhorCenario.economiaVsAtual)} / ano</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simulações de Cenários (Top 5)</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol1}><Text style={styles.tableCellHeader}>Cenário</Text></View>
              <View style={styles.tableCol2}><Text style={styles.tableCellHeader}>Imposto Anual</Text></View>
              <View style={styles.tableCol3}><Text style={styles.tableCellHeader}>Alíquota Efet.</Text></View>
              <View style={styles.tableCol4}><Text style={styles.tableCellHeader}>Economia</Text></View>
            </View>
            
            {simulacoes.map((sim: any, idx: number) => (
              <View key={idx} style={[styles.tableRow, idx === 0 ? { backgroundColor: '#f0fdf4' } : {}]}>
                <View style={styles.tableCol1}>
                  <Text style={idx === 0 ? styles.tableCellBold : styles.tableCell}>{sim.nome}</Text>
                </View>
                <View style={styles.tableCol2}>
                  <Text style={styles.tableCell}>{formatCurrency(sim.impostoTotal)}</Text>
                </View>
                <View style={styles.tableCol3}>
                  <Text style={styles.tableCell}>{(sim.aliquotaEfetiva * 100).toFixed(2)}%</Text>
                </View>
                <View style={styles.tableCol4}>
                  <Text style={sim.economiaVsAtual > 0 ? styles.tableCellGreen : styles.tableCell}>
                    {sim.economiaVsAtual > 0 ? formatCurrency(sim.economiaVsAtual) : '-'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {estrategias.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plano de Ação Estratégico</Text>
            {estrategias.map((est: any, idx: number) => (
              <View key={idx} style={styles.strategyCard} wrap={false}>
                <View style={styles.strategyHeader}>
                  <Text style={styles.strategyTitle}>{est.nome}</Text>
                  <Text style={styles.strategyImpact}>{est.impacto} IMPACTO</Text>
                </View>
                <Text style={styles.strategyDesc}>{est.descricao}</Text>
                <View style={styles.strategyFooter}>
                  <Text style={styles.tableCellGreen}>Economia: {formatCurrency(est.economiaAnual)}/ano</Text>
                  <Text style={styles.tableCell}>Prazo: {est.prazoImplementacao}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footerText} fixed>
          Este relatório é uma simulação estratégica baseada em dados informados e não substitui a análise legal de um contador habilitado. FiscalOS - Motor de Decisão Fiscal.
        </Text>
      </Page>
    </Document>
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('userId', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const currentTotalTax = Number(client.currentDAS || 0) + Number(client.currentIRPJ || 0) + Number(client.currentCSLL || 0) + Number(client.currentPIS || 0) + Number(client.currentCOFINS || 0) + Number(client.currentISS || 0) + Number(client.currentICMS || 0) + Number(client.currentINSS || 0)

    const digitalTwin = criarDigitalTwin({
      id: client.id,
      nome: client.companyName,
      cnpj: client.cnpj,
      naturezaJuridica: client.legalNature || 'LTDA',
      porte: client.companySize || 'ME',
      regimeAtual: client.taxRegime || 'SIMPLES_NACIONAL',
      cnaePrincipal: client.cnaeMain,
      tipoAtividade: client.revenueType || 'SERVICOS',
      receitas: {
        servicos: Number(client.revenueServicos || 0),
        comercio: Number(client.revenueComercio || 0),
        locacao: Number(client.revenueLocacao || 0),
        outros: Number(client.revenueOutros || 0),
        total: Number(client.revenueLast12m)
      },
      custos: {
        folhaTotal: Number(client.payrollLast12m),
        aluguel: Number(client.rentExpense || 0),
        fornecedores: Number(client.supplierExpense || 0),
        marketing: Number(client.marketingExpense || 0),
        administrativo: Number(client.adminExpense || 0),
        total: Number(client.payrollLast12m) + Number(client.rentExpense || 0) + Number(client.supplierExpense || 0) + Number(client.marketingExpense || 0) + Number(client.adminExpense || 0)
      },
      trabalhista: {
        funcionarios: client.employeesCount,
        salarioTotal: Number(client.totalSalary || 0),
        proLabore: Number(client.proLabore || 0),
        beneficios: Number(client.benefits || 0)
      },
      localizacao: {
        municipio: client.municipio || '',
        uf: client.uf || '',
        municipioIBGE: client.municipioIBGE || '3550308',
        issAliquota: 0.05
      },
      fiscalAtual: {
        das: Number(client.currentDAS || 0),
        irpj: Number(client.currentIRPJ || 0),
        csll: Number(client.currentCSLL || 0),
        pis: Number(client.currentPIS || 0),
        cofins: Number(client.currentCOFINS || 0),
        iss: Number(client.currentISS || 0),
        icms: Number(client.currentICMS || 0),
        inss: Number(client.currentINSS || 0),
        total: currentTotalTax
      }
    })

    const diagnostico = await digitalTwin.gerarDiagnostico()
    const melhorCenario = await digitalTwin.encontrarMelhorCenario()
    const todasSimulacoes = (await digitalTwin.rodarTodasSimulacoes()).slice(0, 5)
    const estrategias = await digitalTwin.detectingOportunidades()

    // Renderiza o componente React num stream de PDF
    const stream = await renderToStream(
      <ReportDocument 
        client={client} 
        diagnostico={diagnostico} 
        melhorCenario={melhorCenario} 
        simulacoes={todasSimulacoes} 
        estrategias={estrategias} 
      />
    )
    
    // Converte o Node.js Stream para Web Stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', chunk => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', err => controller.error(err))
      }
    })

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="diagnostico-${client.cnpj}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}