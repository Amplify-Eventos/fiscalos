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
  AlertTriangle,
  PieChart,
  AlertCircle
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
  let simulacoes: any[] = []
  
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

  const revenue12m = Number(client.revenueLast12m || 0)
  const payroll12m = Number(client.payrollLast12m || 0)
  const fatorR = revenue12m > 0 ? (payroll12m / revenue12m) * 100 : 0
  
  const sublimiteSimples = 3600000
  const isAbaixoSublimite = revenue12m < sublimiteSimples
  const porcentagemSublimite = revenue12m > 0 ? Math.min((revenue12m / sublimiteSimples) * 100, 100) : 0

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
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {diagnostico && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Score Fiscal</p>
                    <p className="text-4xl font-bold text-blue-600">{diagnostico.score.score}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: <span className="font-semibold text-slate-800">{diagnostico.score.classificacao}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Imposto Atual</p>
                  <p className="text-2xl font-bold text-red-500">
                    {currentTotalTax > 0 ? `R$ ${currentTotalTax.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'Não info'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Carga: {currentTotalTax > 0 && revenue12m > 0 ? ((currentTotalTax / revenue12m) * 100).toFixed(1) : 0}%</p>
                </div>
                <PieChart className="h-5 w-5 text-slate-400" />
              </div>
              {/* Memória de Cálculo Simplificada */}
              <div className="mt-3 text-xs space-y-1 pt-3 border-t">
                {Number(client.currentDAS || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">DAS</span><span className="font-medium">R$ {Number(client.currentDAS).toLocaleString('pt-BR', {maximumFractionDigits:0})}</span></div>}
                {Number(client.currentIRPJ || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">IRPJ/CSLL</span><span className="font-medium">R$ {(Number(client.currentIRPJ)+Number(client.currentCSLL)).toLocaleString('pt-BR', {maximumFractionDigits:0})}</span></div>}
                {Number(client.currentPIS || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">PIS/COFINS</span><span className="font-medium">R$ {(Number(client.currentPIS)+Number(client.currentCOFINS)).toLocaleString('pt-BR', {maximumFractionDigits:0})}</span></div>}
                {Number(client.currentISS || 0) > 0 && <div className="flex justify-between"><span className="text-slate-500">ISS</span><span className="font-medium">R$ {Number(client.currentISS).toLocaleString('pt-BR', {maximumFractionDigits:0})}</span></div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Fator R (Serviços)</p>
                  <p className="text-2xl font-bold text-slate-800">{fatorR.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {fatorR >= 28 ? <span className="text-green-600 font-medium">Anexo III (Seguro)</span> : <span className="text-red-500 font-medium">Anexo V (Alerta)</span>}
                  </p>
                </div>
                <AlertCircle className={`h-5 w-5 ${fatorR >= 28 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                  <div className={`h-1.5 rounded-full ${fatorR >= 28 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(fatorR, 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400">Meta: 28%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-green-700 mb-1">Economia Potencial</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {economiaMaxima.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-green-700 mt-1">por ano (estimativa)</p>
            </CardContent>
          </Card>
        </div>

        {/* Gestão de Risco: Sublimite */}
        {client.taxRegime === 'SIMPLES_NACIONAL' && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div className="w-1/3">
                <p className="text-sm font-semibold text-amber-900">Alerta de Sublimite (R$ 3,6M)</p>
                <p className="text-xs text-amber-700">Faturamento acumulado: R$ {revenue12m.toLocaleString('pt-BR')}</p>
              </div>
              <div className="w-2/3 pl-4">
                <div className="w-full bg-amber-200 rounded-full h-2.5 mb-1">
                  <div className={`h-2.5 rounded-full ${porcentagemSublimite > 90 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${porcentagemSublimite}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-amber-700 font-medium">
                  <span>0</span>
                  <span>{porcentagemSublimite.toFixed(1)}% atingido</span>
                  <span>R$ 3.600.000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

                        {/* NOVA DRE COMPARATIVA DETALHADA */}
        {simulacoes.length > 0 && currentTotalTax > 0 && (
          <Card className="mb-6 shadow-md border-blue-100">
            <CardHeader className="border-b bg-blue-50/50 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center text-slate-800">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Raio-X Tributário: Atual vs Ideal
                </CardTitle>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                  Recomendação: {simulacoes[0].regime.replace('_', ' ')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-600 uppercase bg-slate-100">
                    <tr>
                      <th className="px-6 py-4">Tributo / Indicador (Ano)</th>
                      <th className="px-6 py-4 bg-red-50/80 text-red-900 border-x border-red-100">Cenário Atual ({client.taxRegime?.replace('_', ' ') || 'SIMPLES'})</th>
                      <th className="px-6 py-4 bg-green-50/80 text-green-900">Cenário Ideal ({simulacoes[0].regime.replace('_', ' ')})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-700">Faturamento Bruto</td>
                      <td className="px-6 py-4 border-x border-slate-100">R$ {revenue12m.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4">R$ {revenue12m.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    
                    <tr className="hover:bg-slate-50 text-slate-500">
                      <td className="px-6 py-3 pl-10 flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div> DAS / Simples</td>
                      <td className="px-6 py-3 border-x border-slate-100">R$ {Number(client.currentDAS || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-3">R$ {simulacoes[0].regime === 'SIMPLES_NACIONAL' ? simulacoes[0].impostoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'}</td>
                    </tr>
                    
                    <tr className="hover:bg-slate-50 text-slate-500">
                      <td className="px-6 py-3 pl-10 flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div> IRPJ + CSLL</td>
                      <td className="px-6 py-3 border-x border-slate-100">R$ {(Number(client.currentIRPJ || 0) + Number(client.currentCSLL || 0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-3">R$ {simulacoes[0].regime !== 'SIMPLES_NACIONAL' ? (simulacoes[0].impostoTotal * 0.4).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'} <span className="text-[10px]">*</span></td>
                    </tr>
                    
                    <tr className="hover:bg-slate-50 text-slate-500">
                      <td className="px-6 py-3 pl-10 flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div> PIS + COFINS</td>
                      <td className="px-6 py-3 border-x border-slate-100">R$ {(Number(client.currentPIS || 0) + Number(client.currentCOFINS || 0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-3">R$ {simulacoes[0].regime !== 'SIMPLES_NACIONAL' ? (simulacoes[0].impostoTotal * 0.3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'} <span className="text-[10px]">*</span></td>
                    </tr>
                    
                    <tr className="hover:bg-slate-50 text-slate-500">
                      <td className="px-6 py-3 pl-10 flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div> ISS / ICMS</td>
                      <td className="px-6 py-3 border-x border-slate-100">R$ {(Number(client.currentISS || 0) + Number(client.currentICMS || 0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-3">R$ {simulacoes[0].regime !== 'SIMPLES_NACIONAL' ? (simulacoes[0].impostoTotal * 0.3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'} <span className="text-[10px]">*</span></td>
                    </tr>

                    <tr className="bg-slate-50 font-semibold">
                      <td className="px-6 py-4 text-slate-900">Carga Tributária Efetiva</td>
                      <td className="px-6 py-4 border-x border-slate-200 text-red-700">{revenue12m > 0 ? ((currentTotalTax / revenue12m) * 100).toFixed(2) : 0}%</td>
                      <td className="px-6 py-4 text-green-700">{revenue12m > 0 ? ((simulacoes[0].impostoTotal / revenue12m) * 100).toFixed(2) : 0}%</td>
                    </tr>
                    
                    <tr className="bg-red-50/30">
                      <td className="px-6 py-4 font-bold text-slate-900">Total Pago em Impostos</td>
                      <td className="px-6 py-4 text-red-600 font-bold border-x border-red-100 text-lg">R$ {currentTotalTax.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">R$ {simulacoes[0].impostoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    
                    <tr className="bg-green-100/50 border-t-2 border-green-200">
                      <td className="px-6 py-5 font-bold text-green-900 uppercase tracking-wider text-sm flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Economia Anual Projetada
                      </td>
                      <td className="px-6 py-5 border-x border-green-200"></td>
                      <td className="px-6 py-5 font-black text-green-700 text-2xl">+ R$ {simulacoes[0].economiaVsAtual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

                {/* TERMÔMETRO FATOR R AVANÇADO */}
        {client.taxRegime === 'SIMPLES_NACIONAL' && (
          <Card className="mb-6 shadow-sm border-slate-200">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl flex items-center text-slate-800">
                <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                Termômetro Fator R (Inteligência de Pró-Labore)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3">
                  <div className="relative pt-4 text-center">
                    <div className="text-5xl font-black text-slate-800 mb-2">{fatorR.toFixed(1)}%</div>
                    <p className="text-sm text-slate-500 mb-4">Folha de Pagamento / Faturamento</p>
                    
                    <div className="w-full bg-slate-200 rounded-full h-4 mb-2 overflow-hidden flex">
                      <div className="bg-red-400 h-4" style={{ width: '28%' }}></div>
                      <div className="bg-green-500 h-4" style={{ width: '72%' }}></div>
                      
                      {/* Marcador atual */}
                      <div 
                        className="absolute w-1 h-6 bg-slate-900 top-1/2 -mt-3 shadow-md" 
                        style={{ left: `${Math.min(fatorR, 100)}%`, transition: 'left 0.5s ease-out' }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>0%</span>
                      <span className="text-indigo-600 relative -left-4">Meta 28%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3">
                  {fatorR >= 28 ? (
                    <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                      <h3 className="text-lg font-bold text-green-800 mb-2 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Empresa Segura no Anexo III
                      </h3>
                      <p className="text-sm text-green-700">
                        A folha de pagamento atual (R$ {payroll12m.toLocaleString('pt-BR', {maximumFractionDigits:0})}) já representa 28% ou mais do faturamento. 
                        A tributação dos serviços está na alíquota inicial de 6% (Anexo III) e não em 15.5% (Anexo V).
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                      <h3 className="text-lg font-bold text-amber-800 mb-2 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Risco de Tributação no Anexo V (15.5%)
                      </h3>
                      <p className="text-sm text-amber-800 mb-4">
                        A folha de pagamento atual (R$ {payroll12m.toLocaleString('pt-BR', {maximumFractionDigits:0})}) está abaixo de 28% do faturamento (R$ {revenue12m.toLocaleString('pt-BR', {maximumFractionDigits:0})}).
                      </p>
                      
                      <div className="bg-white p-4 rounded border border-amber-100 mt-2">
                        <p className="font-semibold text-slate-800 text-sm mb-1">Ação Recomendada:</p>
                        <p className="text-slate-600 text-sm">
                          Para atingir 28% e cair do Anexo V (15.5%) para o Anexo III (6%), o Pró-Labore/Folha acumulado de 12 meses deve ser de no mínimo <strong>R$ {(revenue12m * 0.28).toLocaleString('pt-BR', {maximumFractionDigits:0})}</strong>.
                        </p>
                        <p className="text-indigo-700 text-sm font-medium mt-2">
                          Faltam R$ {((revenue12m * 0.28) - payroll12m).toLocaleString('pt-BR', {maximumFractionDigits:0})} na folha anual (aprox. R$ {(((revenue12m * 0.28) - payroll12m) / 12).toLocaleString('pt-BR', {maximumFractionDigits:0})}/mês) para garantir a alíquota menor.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
