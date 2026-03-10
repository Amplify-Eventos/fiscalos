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
  Trash2
} from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { criarDigitalTwin } from "@/lib/digital-twin"
import { deleteClientAction } from "./actions"

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

  // Rodar diagnóstico para obter score
  let diagnostico = null
  try {
    diagnostico = await digitalTwin.gerarDiagnostico()
  } catch (e) {
    console.error('Erro ao gerar diagnóstico:', e)
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Link>

        {/* Client Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{client.companyName}</h1>
            <p className="text-slate-600">CNPJ: {client.cnpj}</p>
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

        {/* Score Card */}
        {diagnostico && (
          <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Score Fiscal</p>
                  <p className="text-5xl font-bold text-blue-600">{diagnostico.score.score}</p>
                  <p className="text-xs text-slate-500 mt-1">de 100 pontos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Classificação</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {diagnostico.score.classificacao}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Dados da Empresa */}
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

          {/* Dados Financeiros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Financeiros (12 meses)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Faturamento Total</span>
                <span className="font-medium">R$ {Number(client.revenueLast12m).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Folha de Pagamento</span>
                <span className="font-medium">R$ {Number(client.payrollLast12m).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
              </div>
              {Number(client.revenueServicos) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Receita Serviços</span>
                  <span>R$ {Number(client.revenueServicos).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {Number(client.revenueComercio) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Receita Comércio</span>
                  <span>R$ {Number(client.revenueComercio).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Impostos Atuais */}
        {client.currentDAS && Number(client.currentDAS) > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Impostos Atuais (12 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {Number(client.currentDAS) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">DAS</span>
                    <span>R$ {Number(client.currentDAS).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(client.currentIRPJ) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">IRPJ</span>
                    <span>R$ {Number(client.currentIRPJ).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(client.currentCSLL) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">CSLL</span>
                    <span>R$ {Number(client.currentCSLL).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(client.currentPIS) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">PIS</span>
                    <span>R$ {Number(client.currentPIS).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(client.currentCOFINS) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">COFINS</span>
                    <span>R$ {Number(client.currentCOFINS).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(client.currentISS) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">ISS</span>
                    <span>R$ {Number(client.currentISS).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(client.currentINSS) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">INSS</span>
                    <span>R$ {Number(client.currentINSS).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Problemas e Oportunidades */}
        {diagnostico && (diagnostico.problemasDetectados.length > 0 || diagnostico.oportunidadesIdentificadas.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Análise Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              {diagnostico.problemasDetectados.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-red-600 mb-2">Pontos de Atenção:</p>
                  <ul className="space-y-1">
                    {diagnostico.problemasDetectados.map((problema: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-red-500">⚠</span>
                        {problema}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {diagnostico.oportunidadesIdentificadas.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">Oportunidades:</p>
                  <ul className="space-y-1">
                    {diagnostico.oportunidadesIdentificadas.map((oportunidade: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-green-500">✓</span>
                        {oportunidade}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <div className="flex gap-4">
          <Link href={`/api/pdf/${client.id}`}>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório PDF
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
