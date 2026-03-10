'use server'

import { getUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateClientAction(clientId: string, formData: FormData): Promise<void> {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const companyName = formData.get('companyName') as string
  const cnpj = formData.get('cnpj') as string
  const cnaeMain = formData.get('cnaeMain') as string
  const employeesCount = parseInt(formData.get('employeesCount') as string) || 0
  const revenueLast12m = parseFloat(formData.get('revenueLast12m') as string) || 0
  const payrollLast12m = parseFloat(formData.get('payrollLast12m') as string) || 0

  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('clients')
      .update({
        companyName,
        cnpj,
        cnaeMain,
        employeesCount,
        revenueLast12m,
        payrollLast12m,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', clientId)
      .eq('userId', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error updating client:', error)
    throw new Error('Erro ao atualizar cliente')
  }

  redirect(`/dashboard/clientes/${clientId}`)
}

export async function deleteClientAction(clientId: string): Promise<void> {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('userId', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error deleting client:', error)
    throw new Error('Erro ao excluir cliente')
  }
  
  redirect('/dashboard')
}
