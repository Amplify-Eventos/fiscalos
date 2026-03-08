// Cliente Supabase para operações de banco de dados
// Usa a API REST do Supabase para evitar problemas de conexão direta

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})

// Tipos para o banco
export interface ClientDB {
  id: string
  user_id: string
  cnpj: string
  company_name: string
  legal_nature?: string
  company_size?: string
  tax_regime?: string
  cnae_main: string
  cnae_secondary?: string
  municipio?: string
  municipio_ibge?: string
  uf?: string
  revenue_last12m: number
  revenue_servicos?: number
  revenue_comercio?: number
  revenue_locacao?: number
  revenue_outros?: number
  payroll_last12m: number
  rent_expense?: number
  supplier_expense?: number
  marketing_expense?: number
  admin_expense?: number
  employees_count: number
  total_salary?: number
  pro_labore?: number
  benefits?: number
  current_das?: number
  current_irpj?: number
  current_csll?: number
  current_pis?: number
  current_cofins?: number
  current_iss?: number
  current_icms?: number
  current_inss?: number
  revenue_type?: string
  created_at: string
  updated_at: string
}

// Funções helper
export async function getClients(userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as ClientDB[]
}

export async function getClient(clientId: string, userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data as ClientDB
}

export async function createClient(client: Partial<ClientDB>) {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single()
  
  if (error) throw error
  return data as ClientDB
}

export async function updateClient(clientId: string, userId: string, updates: Partial<ClientDB>) {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as ClientDB
}

export async function deleteClient(clientId: string, userId: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('user_id', userId)
  
  if (error) throw error
}
