import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Cliente Supabase — só é instanciado quando as variáveis de ambiente
 * estão presentes. Enquanto não houver backend, todo o app funciona via
 * a camada de storage (localStorage). Veja `lib/storage.ts`.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const hasSupabase = supabase !== null
