'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Não autorizado")
  }

  const agencyName = formData.get('agencyName') as string
  const agencyLogo = formData.get('agencyLogo') as string
  const agencyColor = formData.get('agencyColor') as string
  const agencyColorSecondary = formData.get('agencyColorSecondary') as string
  const agencyWebsite = formData.get('agencyWebsite') as string

  const { error } = await supabase
    .from('users')
    .update({
      agencyName,
      agencyLogo,
      agencyColor,
      agencyColorSecondary,
      agencyWebsite,
      updatedAt: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Erro ao salvar configurações:', error)
    throw new Error('Falha ao salvar as configurações')
  }

  revalidatePath('/dashboard/settings')
}