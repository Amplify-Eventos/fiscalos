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
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  CheckCircle,
  XCircle
} from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"
import { criarDigitalTwin } from "@/lib/digital-twin"
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

  // Criar Digital Twin com os dados do cliente
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
      total: Number(client.currentDAS || 0) + Number(client.currentIRPJ || 0) + Number(client.currentCSLL || 0) + Number(client.currentPIS || 0) + Number(client.currentCOFINS || 0) + Number(client.currentISS || 0) + Number(client.currentICMS || 0) + Number(client.currentINSS || 0)
    }
  })

  // Rodar análise completa (ASSÍNCRONO)
  const diagnostico = await digitalTwin.gerarDiagnostico()
  const melhorCenario = await digitalTwin.encontrarMelhorCenario()
  const todasSimulacoes = (await digitalTwin.rodarTodasSimulacoes()).slice(0, 10)
  const estrategias = await digitalTwin.detectingOportunidades()
  const fatorR = digitalTwin.calcularFatorR()

  // Dados para exibição
  const revenue = Number(client.revenueLast12m)
  const payroll = Number(client.payrollLast12m)

  // Cores do Score
  const scoreColors: Record<string, string> = {
    OTIMO: 'text-green-600 bg-green-100',
    BOM: 'text-green-500 bg-green-50',
    REGULAR: 'text-amber-600 bg-amber-100',
    RUIM: 'text-orange-600 bg-orange-100',
    CRITICO: 'text-red-600 bg-red-100'
  }

  const scoreColor = scoreColors[diagnostico.score.classificacao] || scoreColors.REGULAR

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
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{client.companyName}</h1>
          <p className="text-slate-600">CNPJ: {client.cnpj} • CNAE: {client.cnaeMain}</p>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* COLUNA ESQUERDA - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SCORE FISCAL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Score Fiscal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  {/* Score Circle */}
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${scoreColor}`}>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{diagnostico.score.score}</div>
                      <div className="text-xs">de 100</div>
                    </div>
                  </div>
                  
                  {/* Classificação e Status */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-2xl font-bold ${scoreColor.split(' ')[0]}`}>
                        {diagnostico.score.classificacao}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Risco Fiscal</p>
                        <p className={`font-semibold ${
                          diagnostico.riscoFiscal === 'BAIXO' ? 'text-green-600' :
                          diagnostico.riscoFiscal === 'MEDIO' ? 'text-amber-600' :
                          diagnostico.riscoFiscal === 'ALTO' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {diagnostico.riscoFiscal}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Eficiência</p>
                        <p className={`font-semibold ${
                          diagnostico.eficienciaTributaria === 'ALTA' ? 'text-green-600' :
                          diagnostico.eficienciaTributaria === 'MEDIA' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {diagnostico.eficienciaTributaria}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Potencial</p>
                        <p className={`font-semibold ${
                          diagnostico.potencialEconomia === 'ALTO' ? 'text-green-600' :
                          diagnostico.potencialEconomia === 'MEDIO' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {diagnostico.potencialEconomia}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Fatores do Score */}
                <div className="mt-6 space-y-2">
                  {diagnostico.score.fatores.map((fator, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-slate-600">{fator.fator}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            fator.nota >= 80 ? 'bg-green-500' :
                            fator.nota >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${fator.nota}%` }}
                        />
                      </div>
                      <div className="w-10 text-sm font-semibold text-right">{fator.nota}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MELHOR CENÁRIO */}
            {melhorCenario && melhorCenario.impostoTotal > 0 && (
              <Card className="border-2 border-green-500 bg-green-50">
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-green-700 font-medium">Melhor Cenário Identificado</p>
                      <h2 className="text-2xl font-bold text-green-900">{melhorCenario.nome}</h2>
                      <p className="text-sm text-green-700 mt-1">{melhorCenario.descricao}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-700">Economia Anual</p>
                      <p className="text-3xl font-bold text-green-900">
                        R$ {melhorCenario.economiaVsAtual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-green-700">
                        ({melhorCenario.percentualEconomia.toFixed(1)}% a menos)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TODAS AS SIMULAÇÕES */}
            {todasSimulacoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Simulações Fiscais (Top 10)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-2 px-3 font-semibold text-slate-600 text-sm">Cenário</th>
                          <th className="py-2 px-3 font-semibold text-slate-600 text-sm text-right">Imposto Anual</th>
                          <th className="py-2 px-3 font-semibold text-slate-600 text-sm text-right">Alíquota</th>
                          <th className="py-2 px-3 font-semibold text-slate-600 text-sm text-right">Economia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todasSimulacoes.map((cenario, idx) => (
                          <tr key={cenario.id} className={`border-b ${idx === 0 ? 'bg-green-50' : ''}`}>
                            <td className="py-3 px-3">
                              <div className="font-medium text-sm">{cenario.nome}</div>
                              <div className="text-xs text-slate-500">{cenario.descricao}</div>
                              {cenario.restricoes.length > 0 && (
                                <div className="text-xs text-amber-600 mt-1">
                                  {cenario.restricoes[0]}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold">
                              R$ {cenario.impostoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {(cenario.aliquotaEfetiva * 100).toFixed(2)}%
                            </td>
                            <td className="py-3 px-3 text-right">
                              {cenario.economiaVsAtual > 0 ? (
                                <span className="text-green-600 font-semibold">
                                  R$ {cenario.economiaVsAtual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ESTRATÉGIAS RECOMENDADAS */}
            {estrategias.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Estratégias de Economia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {estrategias.map((estrategia) => (
                    <div key={estrategia.id} className="border rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900">{estrategia.nome}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              estrategia.impacto === 'ALTO' ? 'bg-green-100 text-green-700' :
                              estrategia.impacto === 'MEDIO' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {estrategia.impacto}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{estrategia.descricao}</p>
                          
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 uppercase mb-1">Ações Necessárias:</p>
                            <ul className="space-y-1">
                              {estrategia.acoes.map((acao, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {acao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Economia Anual</p>
                          <p className="text-xl font-bold text-green-600">
                            R$ {estrategia.economiaAnual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">Prazo: {estrategia.prazoImplementacao}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* PROBLEMAS DETECTADOS */}
            {diagnostico.problemasDetectados.length > 0 && (
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-5 w-5" />
                    Problemas Detectados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diagnostico.problemasDetectados.map((problema, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-amber-700">
                        <XCircle className="h-4 w-4" />
                        {problema}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* COLUNA DIREITA - 1/3 */}
          <div className="space-y-6">
            
            {/* DADOS FINANCEIROS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados Financeiros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Faturamento 12m</span>
                  <span className="font-semibold">R$ {revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Folha 12m</span>
                  <span className="font-semibold">R$ {payroll.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Fator R</span>
                  <span className={`font-semibold ${fatorR >= 0.28 ? 'text-green-600' : 'text-amber-600'}`}>
                    {(fatorR * 100).toFixed(1)}% {fatorR >= 0.28 ? '✅' : '⚠️'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Funcionários</span>
                  <span className="font-semibold">{client.employeesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Regime Atual</span>
                  <span className="font-semibold text-sm">{client.taxRegime?.replace('_', ' ')}</span>
                </div>
              </CardContent>
            </Card>

            {/* RECEITAS POR TIPO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receitas por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Number(client.revenueServicos) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Serviços</span>
                    <span className="font-semibold">R$ {Number(client.revenueServicos).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                {Number(client.revenueComercio) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Comércio</span>
                    <span className="font-semibold">R$ {Number(client.revenueComercio).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                {Number(client.revenueLocacao) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Locação</span>
                    <span className="font-semibold">R$ {Number(client.revenueLocacao).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                {Number(client.revenueOutros) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Outros</span>
                    <span className="font-semibold">R$ {Number(client.revenueOutros).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AÇÕES */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações</CardTitle>
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

            {/* RESUMO DO IMPOSTO ATUAL */}
            {client.currentDAS && Number(client.currentDAS) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Impostos Atuais (Mensal)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Number(client.currentDAS) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">DAS</span>
                      <span>R$ {Number(client.currentDAS).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {Number(client.currentISS) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">ISS</span>
                      <span>R$ {Number(client.currentISS).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {Number(client.currentIRPJ) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">IRPJ</span>
                      <span>R$ {Number(client.currentIRPJ).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {Number(client.currentINSS) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">INSS</span>
                      <span>R$ {Number(client.currentINSS).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
