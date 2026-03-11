import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Users, FileText, Plus, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react"
import { signOut, getUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { criarDigitalTwin } from "@/lib/digital-twin"

// Função auxiliar para mapear o banco para o Digital Twin
function mapClientToTwin(client: any) {
  const currentTotalTax = Number(client.currentDAS || 0) + Number(client.currentIRPJ || 0) + Number(client.currentCSLL || 0) + Number(client.currentPIS || 0) + Number(client.currentCOFINS || 0) + Number(client.currentISS || 0) + Number(client.currentICMS || 0) + Number(client.currentINSS || 0)

  return {
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
      total: Number(client.revenueLast12m || 0)
    },
    custos: {
      folhaTotal: Number(client.payrollLast12m || 0),
      aluguel: Number(client.rentExpense || 0),
      fornecedores: Number(client.supplierExpense || 0),
      marketing: Number(client.marketingExpense || 0),
      administrativo: Number(client.adminExpense || 0),
      total: Number(client.payrollLast12m || 0) + Number(client.rentExpense || 0) + Number(client.supplierExpense || 0) + Number(client.marketingExpense || 0) + Number(client.adminExpense || 0)
    },
    trabalhista: {
      funcionarios: client.employeesCount || 0,
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
  }
}

export default async function DashboardPage() {
  let user
  let clients: any[] = []
  let error = null
  let economiaTotal = 0

  try {
    user = await getUser()
  } catch (e) {
    error = 'Erro ao verificar autenticação'
  }

  if (user) {
    try {
      const supabase = await createClient()
      const { data, error: dbError } = await supabase
        .from('clients')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })
      
      if (dbError) throw dbError
      
      clients = data || []
      
      // Calcular economia potencial, score e alertas para cada cliente
      for (const client of clients) {
        const rev = Number(client.revenueLast12m)
        client.alertas = []

        if (rev > 0) {
          const dados = mapClientToTwin(client)
          const twin = criarDigitalTwin(dados)
          const todos = await twin.rodarTodasSimulacoes()
          const validos = todos.filter(c => c.viavel && c.impostoTotal > 0)
          
          if (validos.length > 0 && validos[0].economiaVsAtual > 0) {
            economiaTotal += validos[0].economiaVsAtual
            client.economiaPotencial = validos[0].economiaVsAtual
          } else {
            client.economiaPotencial = 0
          }

          const diagnostico = await twin.gerarDiagnostico()
          client.score = diagnostico.score.score
          client.status = diagnostico.score.classificacao

          // Fator R
          const payroll12m = Number(client.payrollLast12m || 0)
          const fatorR = (payroll12m / rev) * 100
          if (client.taxRegime === 'SIMPLES_NACIONAL' && fatorR < 28 && fatorR > 0) {
            client.alertas.push('Fator R < 28%')
          }

          // Sublimite
          if (client.taxRegime === 'SIMPLES_NACIONAL' && rev >= 3600000 * 0.9) {
            client.alertas.push('Risco Sublimite')
          }
        } else {
          client.economiaPotencial = 0
          client.score = 0
          client.status = 'Incompleto'
        }
      }
    } catch (e: any) {
      error = `Erro ao conectar: ${e.message}`
    }
  }

  const totalClients = clients.length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">FiscalOS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.user_metadata?.name || user?.email}
            </span>
            <form action={signOut}>
              <Button variant="ghost" type="submit">Sair</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Gerencie seus clientes e planejamentos fiscais</p>
          </div>
          <Link href="/dashboard/clientes/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total de Clientes
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{totalClients}</p>
              <p className="text-xs text-slate-500">empresas cadastradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Planejamentos Realizados
              </CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {clients.filter(c => Number(c.revenueLast12m) > 0).length}
              </p>
              <p className="text-xs text-slate-500">simulações ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Economia Potencial
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(economiaTotal)}
              </p>
              <p className="text-xs text-slate-500">em economia identificada/ano</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Painel de Clientes (Carteira)</span>
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Atualizado em tempo real</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Nenhum cliente cadastrado ainda</p>
                <Link href="/dashboard/clientes/novo">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Cliente
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3">Empresa</th>
                      <th className="px-4 py-3">Regime Atual</th>
                      <th className="px-4 py-3">Faturamento Anual</th>
                      <th className="px-4 py-3 text-center">Score Fiscal</th>
                      <th className="px-4 py-3">Economia Potencial</th>
                      <th className="px-4 py-3">Alertas</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">{client.companyName}</div>
                          <div className="text-xs text-slate-500">{client.cnpj}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                            {client.taxRegime?.replace('_', ' ') || 'SIMPLES'}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-700">
                          R$ {Number(client.revenueLast12m || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {client.score > 0 ? (
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 border">
                              {client.score}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {client.economiaPotencial > 0 ? (
                            <span className="text-green-600 font-bold flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              R$ {client.economiaPotencial.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Otimizado</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            {client.alertas?.map((alerta: string, idx: number) => (
                              <span key={idx} className="flex items-center text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded w-max">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {alerta}
                              </span>
                            ))}
                            {client.alertas?.length === 0 && client.score >= 80 && (
                              <span className="flex items-center text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded w-max">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Saudável
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/dashboard/clientes/${client.id}`}>
                            <Button variant="outline" size="sm" className="bg-white">
                              Analisar
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
