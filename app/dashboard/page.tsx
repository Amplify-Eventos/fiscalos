import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Users, FileText, Plus, TrendingUp } from "lucide-react"
import { signOut, getUser } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const user = await getUser()

  // Buscar clientes do banco
  const clients = user ? await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  }) : []

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
              <div className="text-3xl font-bold text-slate-900">{totalClients}</div>
              <p className="text-xs text-slate-500 mt-1">Cadastrados no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Planejamentos Gerados
              </CardTitle>
              <FileText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Economia Gerada
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">R$ 0</div>
              <p className="text-xs text-slate-500 mt-1">Para seus clientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Clientes ou Empty State */}
        {totalClients === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhum cliente cadastrado
              </h3>
              <p className="text-slate-600 text-center max-w-sm mb-6">
                Comece cadastrando seu primeiro cliente para gerar um planejamento fiscal automaticamente.
              </p>
              <Link href="/dashboard/clientes/novo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Seus Clientes</h2>
            <div className="grid gap-4">
              {clients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{client.companyName}</h3>
                      <p className="text-sm text-slate-600">CNPJ: {client.cnpj}</p>
                      <p className="text-xs text-slate-500">
                        Faturamento: R$ {Number(client.revenueLast12m).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Link href={`/dashboard/clientes/${client.id}`}>
                      <Button variant="outline">Ver Detalhes</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
