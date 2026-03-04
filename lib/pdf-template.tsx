import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    backgroundColor: '#eff6ff',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: '#475569',
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  recommendation: {
    backgroundColor: '#dcfce7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: '4px solid #16a34a',
  },
  recommendationTitle: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 5,
  },
  recommendationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#15803d',
  },
  economy: {
    fontSize: 14,
    color: '#166534',
    marginTop: 5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderBottom: '1px solid #cbd5e1',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e2e8f0',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#1e293b',
  },
  tableCellHighlight: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#15803d',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #cbd5e1',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
  },
})

interface PDFProps {
  companyName: string
  cnpj: string
  cnaeMain: string
  revenue: number
  payroll: number
  fatorR: number
  anexoSimples: string
  simplesAnual: number
  presumidoAnual: number
  melhorRegime: string
  economiaAnual: number
}

export function FiscalReportPDF({
  companyName,
  cnpj,
  cnaeMain,
  revenue,
  payroll,
  fatorR,
  anexoSimples,
  simplesAnual,
  presumidoAnual,
  melhorRegime,
  economiaAnual,
}: PDFProps) {
  const today = new Date().toLocaleDateString('pt-BR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Planejamento Fiscal</Text>
          <Text style={styles.subtitle}>Relatório gerado automaticamente pelo FiscalOS</Text>
        </View>

        {/* Recomendação */}
        <View style={styles.recommendation}>
          <Text style={styles.recommendationTitle}>REGIME RECOMENDADO</Text>
          <Text style={styles.recommendationValue}>{melhorRegime}</Text>
          <Text style={styles.economy}>
            Economia estimada: R$ {economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano
          </Text>
        </View>

        {/* Dados da Empresa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da Empresa</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Razão Social</Text>
            <Text style={styles.value}>{companyName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CNPJ</Text>
            <Text style={styles.value}>{cnpj}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CNAE Principal</Text>
            <Text style={styles.value}>{cnaeMain}</Text>
          </View>
        </View>

        {/* Dados Financeiros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Financeiros (Últimos 12 meses)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Faturamento Acumulado</Text>
            <Text style={styles.value}>R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Folha Salarial Acumulada</Text>
            <Text style={styles.value}>R$ {payroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fator R</Text>
            <Text style={styles.value}>{(fatorR * 100).toFixed(1)}%</Text>
          </View>
        </View>

        {/* Comparativo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comparativo de Regimes Tributários</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Regime</Text>
              <Text style={styles.tableHeaderCell}>Imposto Anual</Text>
              <Text style={styles.tableHeaderCell}>Imposto Mensal</Text>
            </View>
            <View style={[styles.tableRow, melhorRegime === 'Simples Nacional' ? { backgroundColor: '#dcfce7' } : {}]}>
              <Text style={melhorRegime === 'Simples Nacional' ? styles.tableCellHighlight : styles.tableCell}>
                Simples Nacional (Anexo {anexoSimples})
              </Text>
              <Text style={melhorRegime === 'Simples Nacional' ? styles.tableCellHighlight : styles.tableCell}>
                R$ {simplesAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={melhorRegime === 'Simples Nacional' ? styles.tableCellHighlight : styles.tableCell}>
                R$ {(simplesAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.tableRow, melhorRegime === 'Lucro Presumido' ? { backgroundColor: '#dcfce7' } : {}]}>
              <Text style={melhorRegime === 'Lucro Presumido' ? styles.tableCellHighlight : styles.tableCell}>
                Lucro Presumido
              </Text>
              <Text style={melhorRegime === 'Lucro Presumido' ? styles.tableCellHighlight : styles.tableCell}>
                R$ {presumidoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={melhorRegime === 'Lucro Presumido' ? styles.tableCellHighlight : styles.tableCell}>
                R$ {(presumidoAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Gerado em {today}</Text>
          <Text style={styles.footerText}>FiscalOS - Planejamento Fiscal Inteligente</Text>
        </View>
      </Page>
    </Document>
  )
}
