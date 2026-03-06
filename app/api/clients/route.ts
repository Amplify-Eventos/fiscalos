import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        
        // Dados Jurídicos
        cnpj: body.cnpj,
        companyName: body.companyName,
        fantasyName: body.fantasyName || null,
        openingDate: body.openingDate ? new Date(body.openingDate) : null,
        legalNature: body.legalNature || 'LTDA',
        companySize: body.companySize || 'ME',
        taxRegime: body.taxRegime || 'SIMPLES_NACIONAL',
        simplesOpt: body.simplesOpt ?? true,
        
        // Atividade Econômica
        cnaeMain: body.cnaeMain,
        cnaeSecondary: body.cnaeSecondary || null,
        activityDesc: body.activityDesc || null,
        revenueType: body.revenueType || 'SERVICOS',
        
        // Localização
        municipioIBGE: body.municipioIBGE || '3550308',
        
        // Dados Financeiros
        revenueServicos: body.revenueServicos ? parseFloat(body.revenueServicos) : null,
        revenueComercio: body.revenueComercio ? parseFloat(body.revenueComercio) : null,
        revenueLocacao: body.revenueLocacao ? parseFloat(body.revenueLocacao) : null,
        revenueOutros: body.revenueOutros ? parseFloat(body.revenueOutros) : null,
        revenueLast12m: parseFloat(body.revenueLast12m) || 0,
        ticketMedio: body.ticketMedio ? parseFloat(body.ticketMedio) : null,
        clientCount: body.clientCount ? parseInt(body.clientCount) : null,
        
        // Custos
        payrollLast12m: parseFloat(body.payrollLast12m) || 0,
        rentExpense: body.rentExpense ? parseFloat(body.rentExpense) : null,
        supplierExpense: body.supplierExpense ? parseFloat(body.supplierExpense) : null,
        marketingExpense: body.marketingExpense ? parseFloat(body.marketingExpense) : null,
        adminExpense: body.adminExpense ? parseFloat(body.adminExpense) : null,
        
        // Trabalhistas
        employeesCount: parseInt(body.employeesCount) || 0,
        totalSalary: body.totalSalary ? parseFloat(body.totalSalary) : null,
        proLabore: body.proLabore ? parseFloat(body.proLabore) : null,
        benefits: body.benefits ? parseFloat(body.benefits) : null,
        
        // Fiscal Atual
        currentDAS: body.currentDAS ? parseFloat(body.currentDAS) : null,
        currentIRPJ: body.currentIRPJ ? parseFloat(body.currentIRPJ) : null,
        currentCSLL: body.currentCSLL ? parseFloat(body.currentCSLL) : null,
        currentPIS: body.currentPIS ? parseFloat(body.currentPIS) : null,
        currentCOFINS: body.currentCOFINS ? parseFloat(body.currentCOFINS) : null,
        currentISS: body.currentISS ? parseFloat(body.currentISS) : null,
        currentINSS: body.currentINSS ? parseFloat(body.currentINSS) : null,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
