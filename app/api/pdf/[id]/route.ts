import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { calculateSimplesNacional, calculateFatorR, calculateLucroPresumido } from '@/lib/fiscal-engine'

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

    const client = await prisma.client.findUnique({
      where: { id, userId: user.id }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Cálculos
    const revenue = Number(client.revenueLast12m)
    const payroll = Number(client.payrollLast12m)
    const fatorR = calculateFatorR(payroll, revenue)
    const fatorROK = fatorR >= 0.28
    const anexoSimples = fatorROK ? 'III' : 'V'
    const simples = calculateSimplesNacional(revenue, anexoSimples as 'I' | 'II' | 'III' | 'IV' | 'V')
    const presumido = calculateLucroPresumido(revenue, 'servico')
    const melhorRegime = simples.impostoAnual < presumido.totalAnual ? 'Simples Nacional' : 'Lucro Presumido'
    const economiaAnual = Math.abs(simples.impostoAnual - presumido.totalAnual)

    const today = new Date().toLocaleDateString('pt-BR')
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Planejamento Fiscal - ${client.companyName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .title { font-size: 28px; color: #1e3a8a; margin: 0; }
    .subtitle { color: #64748b; margin-top: 5px; }
    .recommendation { background: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #16a34a; }
    .recommendation-title { color: #166534; font-size: 12px; margin-bottom: 5px; }
    .recommendation-value { color: #15803d; font-size: 24px; font-weight: bold; }
    .economy { color: #166534; margin-top: 5px; }
    .section { margin-bottom: 25px; }
    .section-title { background: #eff6ff; padding: 10px; color: #1e40af; font-weight: bold; margin-bottom: 15px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .label { color: #475569; }
    .value { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: bold; color: #334155; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .highlight { background: #dcfce7; font-weight: bold; color: #15803d; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; color: #94a3b8; font-size: 12px; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">Planejamento Fiscal</h1>
    <p class="subtitle">Relatório gerado automaticamente pelo FiscalOS</p>
  </div>

  <div class="recommendation">
    <p class="recommendation-title">REGIME RECOMENDADO</p>
    <p class="recommendation-value">${melhorRegime}</p>
    <p class="economy">Economia estimada: R$ ${economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</p>
  </div>

  <div class="section">
    <div class="section-title">Dados da Empresa</div>
    <div class="row"><span class="label">Razão Social</span><span class="value">${client.companyName}</span></div>
    <div class="row"><span class="label">CNPJ</span><span class="value">${client.cnpj}</span></div>
    <div class="row"><span class="label">CNAE Principal</span><span class="value">${client.cnaeMain}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Dados Financeiros (Últimos 12 meses)</div>
    <div class="row"><span class="label">Faturamento Acumulado</span><span class="value">R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
    <div class="row"><span class="label">Folha Salarial Acumulada</span><span class="value">R$ ${payroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
    <div class="row"><span class="label">Fator R</span><span class="value">${(fatorR * 100).toFixed(1)}%</span></div>
  </div>

  <div class="section">
    <div class="section-title">Comparativo de Regimes Tributários</div>
    <table>
      <thead>
        <tr>
          <th>Regime</th>
          <th>Imposto Anual</th>
          <th>Imposto Mensal</th>
        </tr>
      </thead>
      <tbody>
        <tr class="${melhorRegime === 'Simples Nacional' ? 'highlight' : ''}">
          <td>Simples Nacional (Anexo ${anexoSimples})</td>
          <td>R$ ${simples.impostoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td>R$ ${(simples.impostoAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr class="${melhorRegime === 'Lucro Presumido' ? 'highlight' : ''}">
          <td>Lucro Presumido</td>
          <td>R$ ${presumido.totalAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td>R$ ${(presumido.totalAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <span>Gerado em ${today}</span>
    <span>FiscalOS - Planejamento Inteligente</span>
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
