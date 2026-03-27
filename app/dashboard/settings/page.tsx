import { getUser } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Settings, Palette, Building, Image as ImageIcon, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSettingsAction } from './actions'

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    return notFound()
  }

  const supabase = await createClient()
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('agencyName, agencyLogo, agencyColor, agencyColorSecondary, agencyWebsite')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error(error)
  }

  const agencyName = userProfile?.agencyName || ''
  const agencyLogo = userProfile?.agencyLogo || ''
  const agencyColor = userProfile?.agencyColor || '#2563eb'
  const agencyColorSecondary = userProfile?.agencyColorSecondary || '#1e40af'
  const agencyWebsite = userProfile?.agencyWebsite || ''

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Configurações</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.email}</span>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Personalização White-Label</h1>
          <p className="text-slate-600">Configure como a sua marca vai aparecer nos relatórios em PDF para os clientes.</p>
        </div>

        <Card className="border-blue-100">
          <form action={updateSettingsAction}>
            <CardHeader className="border-b bg-blue-50/50 pb-4">
              <CardTitle className="text-xl flex items-center text-slate-800">
                <Palette className="h-5 w-5 mr-2 text-blue-600" />
                Dados do Escritório Contábil
              </CardTitle>
              <CardDescription>
                Esses dados vão aparecer no cabeçalho e rodapé dos relatórios de planejamento estratégico que você exportar.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="agencyName" className="flex items-center text-slate-700">
                  <Building className="h-4 w-4 mr-2" /> Nome do Escritório / Agência
                </Label>
                <Input 
                  id="agencyName" 
                  name="agencyName" 
                  defaultValue={agencyName} 
                  placeholder="Ex: Contabilidade Silva"
                  className="max-w-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyLogo" className="flex items-center text-slate-700">
                  <ImageIcon className="h-4 w-4 mr-2" /> URL da Logo
                </Label>
                <Input 
                  id="agencyLogo" 
                  name="agencyLogo" 
                  defaultValue={agencyLogo} 
                  placeholder="https://meusite.com/logo.png"
                />
                <p className="text-xs text-slate-500">Cole a URL de uma imagem da sua logo (formato PNG ou JPG). Recomendado: fundo transparente.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agencyColor" className="flex items-center text-slate-700">
                    <Palette className="h-4 w-4 mr-2" /> Cor Primária da Marca (HEX)
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      id="agencyColor" 
                      name="agencyColor" 
                      type="color"
                      defaultValue={agencyColor}
                      className="w-14 p-1 h-10"
                    />
                    <Input 
                      type="text" 
                      defaultValue={agencyColor} 
                      className="uppercase font-mono w-28"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-slate-500">Essa cor será usada nas linhas e destaques principais do PDF.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencyColorSecondary" className="flex items-center text-slate-700">
                    <Palette className="h-4 w-4 mr-2" /> Cor Secundária (HEX)
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      id="agencyColorSecondary" 
                      name="agencyColorSecondary" 
                      type="color"
                      defaultValue={agencyColorSecondary}
                      className="w-14 p-1 h-10"
                    />
                    <Input 
                      type="text" 
                      defaultValue={agencyColorSecondary} 
                      className="uppercase font-mono w-28"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-slate-500">Essa cor será usada em títulos e botões no PDF.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="agencyWebsite" className="flex items-center text-slate-700">
                    <Globe className="h-4 w-4 mr-2" /> Site do Escritório
                  </Label>
                  <Input 
                    id="agencyWebsite" 
                    name="agencyWebsite" 
                    defaultValue={agencyWebsite} 
                    placeholder="https://contabilidadesilva.com.br"
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  )
}