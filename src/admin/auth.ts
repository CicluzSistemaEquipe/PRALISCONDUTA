// ============================================================
// Auth unificada — Dono + Gerente
// Demo mode: usuários em localStorage (semeados com DEMO_USERS).
// Fase 2: substituir por Supabase Auth.
// ============================================================

import type { AdminUser } from '@/lib/types'
import { disableAdminPreview } from '@/lib/devMode'

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

/** Campos editaveis de um gerente (alem de nome/email obrigatorios). */
export interface GerenteInput {
  nome: string
  email: string
  nomePublico?: string
  loja?: string
  whatsapp?: string
  descricao?: string
  status?: 'ativo' | 'inativo'
  avatarUrl?: string
}

export function addGerente(input: GerenteInput): AdminUser {
  const users = getAdminUsers()
  const gerente: AdminUser = {
    id: `gerente-${Date.now().toString(36)}`,
    email: input.email.toLowerCase().trim(),
    nome: input.nome.trim(),
    role: 'gerente',
    nomePublico: input.nomePublico?.trim() || undefined,
    loja: input.loja?.trim() || undefined,
    whatsapp: input.whatsapp?.trim() || undefined,
    descricao: input.descricao?.trim() || undefined,
    status: input.status ?? 'ativo',
    avatarUrl: input.avatarUrl,
    colaboradoresIds: [],
    createdAt: new Date().toISOString(),
  }
  users.push(gerente)
  saveAdminUsers(users)
  return gerente
}

/** Atualiza um gerente existente (merge dos campos editaveis). */
export function updateGerente(id: string, patch: Partial<GerenteInput>): AdminUser | null {
  const users = getAdminUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx < 0) return null
  const updated: AdminUser = {
    ...users[idx],
    nome: patch.nome?.trim() ?? users[idx].nome,
    email: patch.email ? patch.email.toLowerCase().trim() : users[idx].email,
    nomePublico: patch.nomePublico?.trim() || undefined,
    loja: patch.loja?.trim() || undefined,
    whatsapp: patch.whatsapp?.trim() || undefined,
    descricao: patch.descricao?.trim() || undefined,
    status: patch.status ?? users[idx].status ?? 'ativo',
    avatarUrl: patch.avatarUrl,
  }
  users[idx] = updated
  saveAdminUsers(users)
  // se for o usuario logado, reflete na sessao
  if (getAdminSession()?.id === id) setSession(updated)
  return updated
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

/** Busca um AdminUser por id (ex.: resolver avatar do autor de um post). */
export function getAdminUserById(id: string): AdminUser | null {
  return getAdminUsers().find((u) => u.id === id) ?? null
}

/** Define/remove a foto de perfil do admin logado (data URL ou null). */
export function setAdminAvatar(avatarUrl: string | null): AdminUser | null {
  const session = getAdminSession()
  if (!session) return null
  const users = getAdminUsers()
  const idx = users.findIndex((u) => u.id === session.id)
  const base = idx >= 0 ? users[idx] : session
  const updated: AdminUser = { ...base, avatarUrl: avatarUrl ?? undefined }
  if (idx >= 0) users[idx] = updated
  else users.push(updated)
  saveAdminUsers(users)
  setSession(updated)
  return updated
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
    disableAdminPreview()
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
