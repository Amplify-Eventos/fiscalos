'use server'

import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
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
    await prisma.client.update({
      where: { id: clientId, userId: user.id },
      data: {
        companyName,
        cnpj,
        cnaeMain,
        employeesCount,
        revenueLast12m,
        payrollLast12m,
      },
    })

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
    await prisma.client.delete({
      where: { id: clientId, userId: user.id },
    })

    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error deleting client:', error)
    throw new Error('Erro ao excluir cliente')
  }
  
  redirect('/dashboard')
}
