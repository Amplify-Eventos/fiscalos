import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Users, FileText, Plus, TrendingUp } from "lucide-react"
import { signOut, getUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  let user
  let clients: any[] = []
  let error = null

  try {
    user = await getUser()
    console.log('🔍 User:', user?.id)
  } catch (e) {
    console.error('❌ Erro ao obter usuário:', e)
    error = 'Erro ao verificar autenticação'
  }

  // Buscar clientes via Supabase REST API
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
      console.log('✅ Clientes encontrados:', clients.length)
    } catch (e: any) {
      console.error('❌ Erro ao buscar clientes:', e)
      error = `Erro ao conectar: ${e.message}`
    }
  }

  const totalClients = clients.length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Display */}
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

        {/* Stats Cards */}
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
                {clients.filter(c => c.currentDAS || c.currentIRPJ).length}
              </p>
              <p className="text-xs text-slate-500">simulações concluídas</p>
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
                R$ 0
              </p>
              <p className="text-xs text-slate-500">em economia identificada</p>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
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
                      <p className="text-xs text-slate-400 mt-1">
                        Faturamento: R$ {(client.revenueLast12m || 0).toLocaleString('pt-BR')}
                      </p>
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
