import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ArrowLeft, TrendingUp, FileText, Edit, Trash2 } from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"
import { calculateSimplesNacional, calculateFatorR, calculateLucroPresumido } from "@/lib/fiscal-engine"
import { deleteClientAction } from "./actions"

export default async function ClienteDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    return notFound()
  }

  const client = await prisma.client.findUnique({
    where: { id, userId: user.id }
  })

  if (!client) {
    return notFound()
  }

  // Cálculos Fiscais
  const revenue = Number(client.revenueLast12m)
  const payroll = Number(client.payrollLast12m)
  
  const fatorR = calculateFatorR(payroll, revenue)
  const fatorROK = fatorR >= 0.28
  const anexoSimples = fatorROK ? 'III' : 'V'
  const simples = calculateSimplesNacional(revenue, anexoSimples as 'I' | 'II' | 'III' | 'IV' | 'V')
  const presumido = calculateLucroPresumido(revenue, 'servico')
  const melhorRegime = simples.impostoAnual < presumido.totalAnual ? 'Simples Nacional' : 'Lucro Presumido'
  const economiaAnual = Math.abs(simples.impostoAnual - presumido.totalAnual)
  const economiaMensal = economiaAnual / 12

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">FiscalOS</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{client.companyName}</h1>
          <p className="text-slate-600">CNPJ: {client.cnpj} • CNAE: {client.cnaeMain}</p>
        </div>

        {/* Recomendação Principal */}
        <Card className="mb-8 border-2 border-green-500 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Regime Recomendado</p>
                <h2 className="text-3xl font-bold text-green-900">{melhorRegime}</h2>
                {melhorRegime === 'Simples Nacional' && fatorROK && (
                  <p className="text-sm text-green-700">✅ Fator R acima de 28% - Anexo III aplicável</p>
                )}
                {melhorRegime === 'Simples Nacional' && !fatorROK && (
                  <p className="text-sm text-amber-700">⚠️ Fator R abaixo de 28% - Anexo V aplicável</p>
                )}
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-green-700">Economia Estimada</p>
                <p className="text-2xl font-bold text-green-900">R$ {economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</p>
                <p className="text-sm text-green-700">(~R$ {economiaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Cliente e Ações */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Dados Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Faturamento (12 meses)</span>
                <span className="font-semibold">R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Folha Salarial (12 meses)</span>
                <span className="font-semibold">R$ {payroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fator R</span>
                <span className={`font-semibold ${fatorROK ? 'text-green-600' : 'text-amber-600'}`}>
                  {(fatorR * 100).toFixed(1)}% {fatorROK ? '✅' : '⚠️'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Funcionários</span>
                <span className="font-semibold">{client.employeesCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href={`/api/pdf/${client.id}`} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Baixar Relatório PDF
                </Button>
              </a>
              <Link href={`/dashboard/clientes/${client.id}/editar`}>
                <Button className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Dados
                </Button>
              </Link>
              <form action={deleteClientAction.bind(null, client.id)}>
                <Button type="submit" className="w-full" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Cliente
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Comparativo de Regimes */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Regimes Tributários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Regime</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Alíquota Efetiva</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Imposto Anual</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Imposto Mensal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${melhorRegime === 'Simples Nacional' ? 'bg-green-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-medium">Simples Nacional</div>
                      <div className="text-sm text-slate-500">Anexo {anexoSimples}</div>
                    </td>
                    <td className="text-right py-3 px-4">{(simples.aliquotaEfetiva * 100).toFixed(2)}%</td>
                    <td className="text-right py-3 px-4 font-semibold">
                      R$ {simples.impostoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4">
                      R$ {simples.impostoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className={melhorRegime === 'Lucro Presumido' ? 'bg-green-50' : ''}>
                    <td className="py-3 px-4">
                      <div className="font-medium">Lucro Presumido</div>
                      <div className="text-sm text-slate-500">Serviços</div>
                    </td>
                    <td className="text-right py-3 px-4">{(presumido.aliquotaEfetiva * 100).toFixed(2)}%</td>
                    <td className="text-right py-3 px-4 font-semibold">
                      R$ {presumido.totalAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4">
                      R$ {presumido.totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
