'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const companyName = formData.get('companyName') as string
  const cnpj = formData.get('cnpj') as string
  const cnaeMain = formData.get('cnaeMain') as string
  const employeesCount = parseInt(formData.get('employeesCount') as string) || 0
  const revenueLast12m = parseFloat(formData.get('revenueLast12m') as string) || 0
  const payrollLast12m = parseFloat(formData.get('payrollLast12m') as string) || 0

  let clientId = ''

  try {
    // Garantir que usuário existe no Prisma
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || 'Usuário',
      },
    })

    const client = await prisma.client.create({
      data: {
        userId: dbUser.id,
        companyName,
        cnpj,
        cnaeMain,
        employeesCount,
        revenueLast12m,
        payrollLast12m,
      },
    })
    
    clientId = client.id

  } catch (error) {
    console.error('Error creating client:', error)
    // Em caso de erro, redireciona para o dashboard com mensagem
    return redirect('/dashboard?error=create_failed')
  }
  
  // Redirecionamento fora do try/catch para evitar erro do Next.js
  if (clientId) {
    redirect(`/dashboard`)
  }
}
