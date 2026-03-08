'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Extrair todos os campos do formData
  const companyName = formData.get('companyName') as string
  const cnpj = formData.get('cnpj') as string
  const fantasyName = formData.get('fantasyName') as string || null
  const legalNature = formData.get('legalNature') as string || 'LTDA'
  const companySize = formData.get('companySize') as string || 'ME'
  const taxRegime = formData.get('taxRegime') as string || 'SIMPLES_NACIONAL'
  const simplesOpt = formData.get('simplesOpt') === 'true'
  
  const cnaeMain = formData.get('cnaeMain') as string
  const cnaeSecondary = formData.get('cnaeSecondary') as string || null
  const activityDesc = formData.get('activityDesc') as string || null
  const revenueType = formData.get('revenueType') as string || 'SERVICOS'
  
  // Localização
  const municipioIBGE = formData.get('municipioIBGE') as string || '3550308'
  
  // Financeiro
  const revenueServicos = parseFloat(formData.get('revenueServicos') as string) || 0
  const revenueComercio = parseFloat(formData.get('revenueComercio') as string) || 0
  const revenueLocacao = parseFloat(formData.get('revenueLocacao') as string) || 0
  const revenueOutros = parseFloat(formData.get('revenueOutros') as string) || 0
  const revenueLast12m = revenueServicos + revenueComercio + revenueLocacao + revenueOutros
  const ticketMedio = parseFloat(formData.get('ticketMedio') as string) || null
  const clientCount = parseInt(formData.get('clientCount') as string) || null
  
  // Custos
  const payrollLast12m = parseFloat(formData.get('payrollLast12m') as string) || 0
  const rentExpense = parseFloat(formData.get('rentExpense') as string) || null
  const supplierExpense = parseFloat(formData.get('supplierExpense') as string) || null
  const marketingExpense = parseFloat(formData.get('marketingExpense') as string) || null
  const adminExpense = parseFloat(formData.get('adminExpense') as string) || null
  
  // Trabalhistas
  const employeesCount = parseInt(formData.get('employeesCount') as string) || 0
  const totalSalary = parseFloat(formData.get('totalSalary') as string) || null
  const proLabore = parseFloat(formData.get('proLabore') as string) || null
  const benefits = parseFloat(formData.get('benefits') as string) || null
  
  // Fiscal Atual
  const currentDAS = parseFloat(formData.get('currentDAS') as string) || null
  const currentIRPJ = parseFloat(formData.get('currentIRPJ') as string) || null
  const currentCSLL = parseFloat(formData.get('currentCSLL') as string) || null
  const currentPIS = parseFloat(formData.get('currentPIS') as string) || null
  const currentCOFINS = parseFloat(formData.get('currentCOFINS') as string) || null
  const currentISS = parseFloat(formData.get('currentISS') as string) || null
  const currentINSS = parseFloat(formData.get('currentINSS') as string) || null

  let clientId = ''

  try {
    // Garantir que usuário existe
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (!existingUser) {
      await supabase
        .from('User')
        .insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || 'Usuário',
          planTier: 'FREE',
        })
    }

    // Buscar dados do município selecionado
    const { data: municipioData } = await supabase
      .from('IssRate')
      .select('cityName, stateCode')
      .eq('ibgeCode', municipioIBGE)
      .single()

    // Criar cliente usando Supabase REST API
    const { data: client, error } = await supabase
      .from('Client')
      .insert({
        userId: user.id,
        // Dados Jurídicos
        companyName,
        cnpj,
        fantasyName,
        legalNature,
        companySize,
        taxRegime,
        simplesOpt,
        // Atividade
        cnaeMain,
        cnaeSecondary,
        activityDesc,
        revenueType,
        // Localização
        municipioIBGE,
        municipio: municipioData?.cityName || null,
        uf: municipioData?.stateCode || null,
        // Financeiro
        revenueServicos,
        revenueComercio,
        revenueLocacao,
        revenueOutros,
        revenueLast12m,
        ticketMedio,
        clientCount,
        // Custos
        payrollLast12m,
        rentExpense,
        supplierExpense,
        marketingExpense,
        adminExpense,
        // Trabalhistas
        employeesCount,
        totalSalary,
        proLabore,
        benefits,
        // Fiscal Atual
        currentDAS,
        currentIRPJ,
        currentCSLL,
        currentPIS,
        currentCOFINS,
        currentISS,
        currentINSS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) throw error
    clientId = client.id

  } catch (error) {
    console.error('Error creating client:', error)
    return redirect('/dashboard?error=create_failed')
  }
  
  if (clientId) {
    redirect(`/dashboard/clientes/${clientId}`)
  }
}
