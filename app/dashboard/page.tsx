import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Users, FileText, Plus, TrendingUp } from "lucide-react"
import { signOut, getUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { criarDigitalTwin } from "@/lib/digital-twin"

// Função auxiliar para mapear o banco para o Digital Twin
function mapClientToTwin(client: any) {
  return {
    id: client.id,
    nome: client.companyName,
    cnpj: client.cnpj,
    naturezaJuridica: client.legalNature,
    porte: client.companySize,
    regimeAtual: client.taxRegime,
    cnaePrincipal: client.cnaeMain,
    cnaesSecundarios: client.cnaeSecondary ? client.cnaeSecondary.split(',') : [],
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
      total: 0
    },
    localizacao: {
      municipio: client.municipio || '',
      uf: client.uf || '',
      municipioIBGE: client.municipioIBGE || '0000000',
      issAliquota: 0.05
    },
    fiscalAtual: {
      das: Number(client.currentDAS || 0) / 12,
      irpj: Number(client.currentIRPJ || 0) / 12,
      csll: Number(client.currentCSLL || 0) / 12,
      pis: Number(client.currentPIS || 0) / 12,
      cofins: Number(client.currentCOFINS || 0) / 12,
      iss: Number(client.currentISS || 0) / 12,
      icms: Number(client.currentICMS || 0) / 12,
      inss: Number(client.currentINSS || 0) / 12,
      total: 0 // Será calculado no twin
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
      
      // Calcular economia potencial para cada cliente
      for (const client of clients) {
        if (Number(client.revenueLast12m) > 0) {
          const dados = mapClientToTwin(client)
          const twin = criarDigitalTwin(dados)
          const melhorCenario = await twin.encontrarMelhorCenario()
          if (melhorCenario && melhorCenario.economiaVsAtual > 0) {
            economiaTotal += melhorCenario.economiaVsAtual
            client.economiaPotencial = melhorCenario.economiaVsAtual
          } else {
            client.economiaPotencial = 0
          }
        } else {
          client.economiaPotencial = 0
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
            <CardTitle className="text-lg">Seus Clientes</CardTitle>
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
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-slate-900">{client.companyName}</h3>
                      <p className="text-sm text-slate-500">
                        CNPJ: {client.cnpj} • CNAE: {client.cnaeMain}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-slate-400">
                          Faturamento: R$ {Number(client.revenueLast12m || 0).toLocaleString('pt-BR')}
                        </p>
                        {client.economiaPotencial > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            Economia: R$ {client.economiaPotencial.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
                          </p>
                        )}
                      </div>
                    </div>
                    <Link href={`/dashboard/clientes/${client.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
