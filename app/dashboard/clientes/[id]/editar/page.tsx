import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ArrowLeft } from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { prisma } from "@/lib/prisma"
import { updateClientAction } from "../actions"

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    redirect('/login')
  }

  const client = await prisma.client.findUnique({
    where: { id, userId: user.id }
  })

  if (!client) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">FiscalOS</span>
          </div>
          <Link href={`/dashboard/clientes/${id}`}>
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Editar Cliente: {client.companyName}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateClientAction.bind(null, id)} className="space-y-6">
              {/* Dados da Empresa */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Dados da Empresa</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome / Razão Social</Label>
                  <Input 
                    id="companyName" 
                    name="companyName" 
                    placeholder="Empresa Exemplo Ltda" 
                    defaultValue={client.companyName}
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input 
                      id="cnpj" 
                      name="cnpj" 
                      placeholder="00.000.000/0001-00" 
                      defaultValue={client.cnpj}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnaeMain">CNAE Principal</Label>
                    <Input 
                      id="cnaeMain" 
                      name="cnaeMain" 
                      placeholder="0000-0/00" 
                      defaultValue={client.cnaeMain}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeesCount">Número de Funcionários</Label>
                  <Input 
                    id="employeesCount" 
                    name="employeesCount" 
                    type="number" 
                    min="0" 
                    defaultValue={client.employeesCount}
                    placeholder="0" 
                  />
                </div>
              </div>

              {/* Dados Financeiros */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Dados Financeiros (Últimos 12 meses)</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="revenueLast12m">Faturamento Acumulado (R$)</Label>
                  <Input 
                    id="revenueLast12m" 
                    name="revenueLast12m" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="Ex: 500000.00"
                    defaultValue={Number(client.revenueLast12m)}
                    required 
                  />
                  <p className="text-xs text-slate-500">Soma do faturamento bruto dos últimos 12 meses</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payrollLast12m">Folha Salarial Acumulada (R$)</Label>
                  <Input 
                    id="payrollLast12m" 
                    name="payrollLast12m" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="Ex: 120000.00"
                    defaultValue={Number(client.payrollLast12m)}
                    required 
                  />
                  <p className="text-xs text-slate-500">Soma dos salários + pró-labore dos últimos 12 meses (para cálculo do Fator R)</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href={`/dashboard/clientes/${id}`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">Cancelar</Button>
                </Link>
                <Button type="submit" className="flex-1">Salvar Alterações</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
