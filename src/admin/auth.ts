// ============================================================
// Autenticação do Admin (MVP) — gate por senha em sessionStorage.
// Substituir por auth real (Supabase) quando o backend for plugado.
// ============================================================

const AUTH_KEY = 'admin_auth'

/** Senha padrão do MVP. Mover para o backend na Fase 2. */
export const ADMIN_PASSWORD = 'pralis2024'

export function isAdminAuthed(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === 'true'
  } catch {
    return false
  }
}

export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    try {
      sessionStorage.setItem(AUTH_KEY, 'true')
    } catch {
      /* ignore */
    }
    return true
  }
  return false
}

export function adminLogout(): void {
  try {
    sessionStorage.removeItem(AUTH_KEY)
  } catch {
    /* ignore */
  }
}
