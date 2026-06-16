import { supabase, hasSupabase } from '@/lib/supabase'

const DASH_KEY = 'pralis:dash-admin'

/**
 * Login do RH. Com Supabase configurado, usa o Auth real (e-mail/senha).
 * Sem backend (modo demo), aceita qualquer e-mail com a senha "pralis"
 * e guarda a sessão localmente.
 */
export async function dashLogin(email: string, password: string): Promise<boolean> {
  if (hasSupabase && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return false
    localStorage.setItem(DASH_KEY, '1')
    return true
  }
  // modo demo
  if (email.trim() && password === 'pralis') {
    localStorage.setItem(DASH_KEY, '1')
    return true
  }
  return false
}

export async function dashLogout() {
  if (hasSupabase && supabase) await supabase.auth.signOut()
  localStorage.removeItem(DASH_KEY)
}

export function isDashAuthed(): boolean {
  return localStorage.getItem(DASH_KEY) === '1'
}
