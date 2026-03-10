import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calculator, 
  ArrowLeft, 
  TrendingUp, 
  FileText, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { criarDigitalTwin } from "@/lib/digital-twin"
import { deleteClientAction } from "./actions"
import { SimulationsChart } from "@/components/charts/SimulationsChart"

export default async function ClienteDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    return notFound()
  }

  // Buscar cliente via Supabase REST API
  const supabase = await createClient()
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('userId', user.id)
    .single()

  if (error || !client) {
    return notFound()
  }

  // Criar Digital Twin com os dados do cliente
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

  // Rodar diagnstico para obter score
  let diagnostico = null
  let simulacoes = []
  
  try {
    diagnostico = await digitalTwin.gerarDiagnostico()
    const todosCenarios = await digitalTwin.rodarTodasSimulacoes()
    
    // Filtra e formata para o gráfico
    simulacoes = todosCenarios
      .filter(c => c.viavel && c.impostoTotal > 0)
      .slice(0, 4)
      .map(sim => ({
        nome: sim.nome,
        impostoTotal: sim.impostoTotal,
        economiaVsAtual: sim.economiaVsAtual,
        regime: sim.regime
      }))
  } catch (e) {
    console.error('Erro ao gerar simulações/diagnóstico:', e)
  }

  const economiaMaxima = simulacoes.length > 0 && simulacoes[0].economiaVsAtual > 0 
    ? simulacoes[0].economiaVsAtual 
    : 0

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">FiscalOS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/dashboard" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{client.companyName}</h1>
            <p className="text-slate-600">CNPJ: {client.cnpj} | Faturamento: R$ {Number(client.revenueLast12m).toLocaleString('pt-BR')}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/clientes/${client.id}/editar`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            <form action={deleteClientAction.bind(null, client.id)}>
              <Button variant="destructive" size="sm" type="submit">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </form>
          </div>
        </div>

        {/* Dashboard Cards Resumo */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {diagnostico && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Score Fiscal</p>
                    <p className="text-5xl font-bold text-blue-600">{diagnostico.score.score}</p>
                    <p className="text-xs text-slate-500 mt-1">Classificação: <span className="font-semibold text-slate-800">{diagnostico.score.classificacao}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-600 mb-1">Imposto Anual Atual</p>
              <p className="text-3xl font-bold text-red-500">
                {currentTotalTax > 0 ? `R$ ${currentTotalTax.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'Não informado'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Carga de {currentTotalTax > 0 && Number(client.revenueLast12m) > 0 ? ((currentTotalTax / Number(client.revenueLast12m)) * 100).toFixed(1) : 0}%</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-green-700 mb-1">Economia Potencial Encontrada</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {economiaMaxima.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-green-700 mt-1">por ano, caso aplique as recomendações</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Simulações */}
        {simulacoes.length > 0 && currentTotalTax > 0 && (
          <Card className="mb-6">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Comparativo de Cenários Tributários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimulationsChart data={simulacoes} impostoAtual={currentTotalTax} />
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">CNAE Principal</span>
                <span className="font-medium">{client.cnaeMain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Regime Tributário</span>
                <span className="font-medium">{client.taxRegime?.replace('_', ' ') || 'Simples Nacional'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Porte</span>
                <span className="font-medium">{client.companySize || 'ME'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Funcionários</span>
                <span className="font-medium">{client.employeesCount}</span>
              </div>
              {client.municipio && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Localização</span>
                  <span className="font-medium">{client.municipio} - {client.uf}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {diagnostico && (diagnostico.problemasDetectados.length > 0 || diagnostico.oportunidadesIdentificadas.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insights e Plano de Ação</CardTitle>
              </CardHeader>
              <CardContent>
                {diagnostico.problemasDetectados.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-red-600 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Pontos de Atenção:
                    </p>
                    <ul className="space-y-2">
                      {diagnostico.problemasDetectados.map((problema: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-slate-700 bg-red-50 p-2 rounded">
                          {problema}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {diagnostico.oportunidadesIdentificadas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> Oportunidades:
                    </p>
                    <ul className="space-y-2">
                      {diagnostico.oportunidadesIdentificadas.map((oportunidade: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-slate-700 bg-green-50 p-2 rounded border border-green-100">
                          {oportunidade}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Link href={`/api/pdf/${client.id}`}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-5 w-5 mr-2" />
              Gerar Relatório Consultivo PDF
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
