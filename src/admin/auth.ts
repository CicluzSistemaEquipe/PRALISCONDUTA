// ============================================================
// Auth unificada — Dono + Gerente
// Demo mode: usuários em localStorage (semeados com DEMO_USERS).
// Fase 2: substituir por Supabase Auth.
// ============================================================

import type { AdminUser } from '@/lib/types'

const SESSION_KEY = 'pralis:admin-session'
const USERS_KEY = 'pralis:admin-users'

// ── Senhas do modo demo (sem Supabase) ───────────────────────
// VITE_* é PÚBLICO (vai no bundle) — isto NÃO é segredo real; a auth de
// verdade é o Supabase Auth (Fase 2). Sem a env var definida:
//   • DEV  → usa um default conhecido p/ o fluxo local seguir funcionando;
//   • PROD → login demo desativado (string vazia ⇒ nenhuma senha confere).
const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD ?? (import.meta.env.DEV ? 'pralis2024' : '')
const LEGACY_PASSWORD =
  import.meta.env.VITE_ADMIN_LEGACY_PASSWORD ?? (import.meta.env.DEV ? 'pralis2024' : '')

// ── Usuários demo (sementes iniciais) ────────────────────────
export const DEMO_USERS: AdminUser[] = [
  {
    id: 'dono-001',
    email: 'dono@pralis.com.br',
    nome: 'Administrador',
    role: 'dono',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'gerente-001',
    email: 'gerente@pralis.com.br',
    nome: 'Gerente Loja 1',
    role: 'gerente',
    colaboradoresIds: [],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
]

// ── Registro de usuários (demo: localStorage) ────────────────
export function getAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS))
      return [...DEMO_USERS]
    }
    return JSON.parse(raw) as AdminUser[]
  } catch {
    return [...DEMO_USERS]
  }
}

function saveAdminUsers(users: AdminUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    /* ignore */
  }
}

export function listGerentes(): AdminUser[] {
  return getAdminUsers().filter((u) => u.role === 'gerente')
}

export function addGerente(input: { nome: string; email: string }): AdminUser {
  const users = getAdminUsers()
  const gerente: AdminUser = {
    id: `gerente-${Date.now().toString(36)}`,
    email: input.email.toLowerCase().trim(),
    nome: input.nome.trim(),
    role: 'gerente',
    colaboradoresIds: [],
    createdAt: new Date().toISOString(),
  }
  users.push(gerente)
  saveAdminUsers(users)
  return gerente
}

export function removeGerente(id: string) {
  saveAdminUsers(getAdminUsers().filter((u) => u.id !== id))
}

// ── Sessão ────────────────────────────────────────────────────
export function getAdminSession(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AdminUser) : null
  } catch {
    return null
  }
}

export function isAdminAuthed(): boolean {
  return getAdminSession() !== null
}

function setSession(user: AdminUser) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {
    /* ignore */
  }
}

/**
 * Login. Aceita:
 *  - email + senha (>= 4 chars em demo) → busca o AdminUser pelo email
 *  - senha legada única no 1º argumento (ex.: "pralis2024") → entra como Dono
 */
export function adminLogin(emailOrPassword: string, password?: string): boolean {
  // modo legado: senha única (dono) — só quando há senha legada configurada
  if (!password && LEGACY_PASSWORD && emailOrPassword === LEGACY_PASSWORD) {
    const dono = getAdminUsers().find((u) => u.role === 'dono') ?? DEMO_USERS[0]
    setSession(dono)
    return true
  }

  // modo novo: email + senha
  const email = emailOrPassword.toLowerCase().trim()
  const user = getAdminUsers().find((u) => u.email === email)
  if (!user) return false

  // Fase 2: validar senha no Supabase. Em demo, exige a senha configurada
  // (ADMIN_PASSWORD). Sem senha configurada (prod sem env) ⇒ rejeita.
  if (password && ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
    setSession(user)
    return true
  }
  return false
}

export function adminLogout(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

// ── Helpers de permissão ────────────────────────────────────
export function isDono(): boolean {
  return getAdminSession()?.role === 'dono'
}

export function isGerente(): boolean {
  return getAdminSession()?.role === 'gerente'
}

/** Dono vê todos. Gerente vê só os seus (por colaboradoresIds OU gerenteId). */
export function canViewEmployee(employeeId: string, employeeGerenteId?: string): boolean {
  const session = getAdminSession()
  if (!session) return false
  if (session.role === 'dono') return true
  if (employeeGerenteId && employeeGerenteId === session.id) return true
  return session.colaboradoresIds?.includes(employeeId) ?? false
}
