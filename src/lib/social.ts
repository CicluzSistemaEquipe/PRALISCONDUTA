// ============================================================
// Social / Comunicados / Notificacoes — store de dominio (MVP localStorage)
//
// Posts ficam em `pralis:social-posts`; leituras por colaborador em
// `pralis:social-reads:{employeeId}`. Reativo via useSyncExternalStore.
//
// Compativel com Opcao A (localStorage). Quando o Supabase entrar, estas mesmas
// funcoes ganham o caminho remoto (gated por hasSupabase) — ver
// docs/SOCIAL_SUPABASE_PROPOSAL.md. NENHUMA migration aplicada agora.
// ============================================================

import { useSyncExternalStore } from 'react'
import type { Employee, SocialPost, SocialPostStatus, SocialAudience } from './types'
import { normalizeStore } from './normalize'

const POSTS_KEY = 'pralis:social-posts'
const READS_KEY = (employeeId: string) => `pralis:social-reads:${employeeId}`

// ------------------------------------------------------------
// util
// ------------------------------------------------------------
function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'sp-' + Math.random().toString(36).slice(2, 10)
}
function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeLS<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / modo privado */
  }
}

// ------------------------------------------------------------
// reatividade (version counter — snapshot estavel)
// ------------------------------------------------------------
let version = 0
const listeners = new Set<() => void>()
function bump() {
  version++
  listeners.forEach((l) => l())
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
/** Hook base: re-renderiza quando qualquer post/leitura muda. */
export function useSocialVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => version)
}

// sincroniza entre abas
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === POSTS_KEY || (e.key && e.key.startsWith('pralis:social-reads:'))) bump()
  })
}

// ------------------------------------------------------------
// Posts — leitura
// ------------------------------------------------------------
/** Todos os posts (admin), mais recentes primeiro. */
export function getAllPosts(): SocialPost[] {
  return readLS<SocialPost[]>(POSTS_KEY, []).sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  )
}

export function getPost(id: string): SocialPost | null {
  return readLS<SocialPost[]>(POSTS_KEY, []).find((p) => p.id === id) ?? null
}

/** O post atinge este colaborador? */
export function audienceMatches(audience: SocialAudience, emp: Employee): boolean {
  switch (audience.kind) {
    case 'all':
      return true
    case 'store':
      return normalizeStore(emp.store) === normalizeStore(audience.value)
    case 'role':
      return emp.role === audience.value
    case 'employee':
      return emp.id === audience.value
    default:
      return false
  }
}

/** Posts publicados visiveis a este colaborador — fixados primeiro, recentes depois. */
export function postsForEmployee(emp: Employee): SocialPost[] {
  return readLS<SocialPost[]>(POSTS_KEY, [])
    .filter((p) => p.status === 'published' && audienceMatches(p.audience, emp))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at)
    })
}

// ------------------------------------------------------------
// Posts — escrita (admin)
// ------------------------------------------------------------
export interface SocialPostInput {
  id?: string
  title: string
  message: string
  type: SocialPost['type']
  audience: SocialAudience
  pinned?: boolean
  status?: SocialPostStatus
  created_by: string
  created_by_name?: string
}

/** Cria ou atualiza um post. Publicar define published_at na 1a publicacao. */
export function savePost(input: SocialPostInput): SocialPost {
  const all = readLS<SocialPost[]>(POSTS_KEY, [])
  const now = new Date().toISOString()
  const idx = input.id ? all.findIndex((p) => p.id === input.id) : -1
  const status: SocialPostStatus = input.status ?? 'draft'

  if (idx >= 0) {
    const prev = all[idx]
    const next: SocialPost = {
      ...prev,
      title: input.title,
      message: input.message,
      type: input.type,
      audience: input.audience,
      pinned: input.pinned ?? prev.pinned,
      status,
      published_at:
        status === 'published' ? prev.published_at ?? now : prev.published_at,
      updated_at: now,
    }
    all[idx] = next
    writeLS(POSTS_KEY, all)
    bump()
    return next
  }

  const created: SocialPost = {
    id: input.id ?? uid(),
    title: input.title,
    message: input.message,
    type: input.type,
    audience: input.audience,
    pinned: input.pinned ?? false,
    status,
    published_at: status === 'published' ? now : null,
    created_by: input.created_by,
    created_by_name: input.created_by_name,
    created_at: now,
    updated_at: now,
  }
  all.push(created)
  writeLS(POSTS_KEY, all)
  bump()
  return created
}

export function setPostStatus(id: string, status: SocialPostStatus) {
  const all = readLS<SocialPost[]>(POSTS_KEY, [])
  const idx = all.findIndex((p) => p.id === id)
  if (idx < 0) return
  const now = new Date().toISOString()
  all[idx] = {
    ...all[idx],
    status,
    published_at:
      status === 'published' ? all[idx].published_at ?? now : all[idx].published_at,
    updated_at: now,
  }
  writeLS(POSTS_KEY, all)
  bump()
}

export function togglePin(id: string) {
  const all = readLS<SocialPost[]>(POSTS_KEY, [])
  const idx = all.findIndex((p) => p.id === id)
  if (idx < 0) return
  all[idx] = { ...all[idx], pinned: !all[idx].pinned, updated_at: new Date().toISOString() }
  writeLS(POSTS_KEY, all)
  bump()
}

export function deletePost(id: string) {
  writeLS(POSTS_KEY, readLS<SocialPost[]>(POSTS_KEY, []).filter((p) => p.id !== id))
  bump()
}

// ------------------------------------------------------------
// Leituras (por colaborador)
// ------------------------------------------------------------
export function getReadIds(employeeId: string): Set<string> {
  return new Set(readLS<{ post_id: string }[]>(READS_KEY(employeeId), []).map((r) => r.post_id))
}

export function isRead(employeeId: string, postId: string): boolean {
  return getReadIds(employeeId).has(postId)
}

export function markRead(employeeId: string, postId: string) {
  const all = readLS<{ post_id: string; read_at: string }[]>(READS_KEY(employeeId), [])
  if (all.some((r) => r.post_id === postId)) return
  all.push({ post_id: postId, read_at: new Date().toISOString() })
  writeLS(READS_KEY(employeeId), all)
  bump()
}

export function markAllRead(employeeId: string, postIds: string[]) {
  const all = readLS<{ post_id: string; read_at: string }[]>(READS_KEY(employeeId), [])
  const have = new Set(all.map((r) => r.post_id))
  const now = new Date().toISOString()
  let changed = false
  for (const id of postIds) {
    if (!have.has(id)) {
      all.push({ post_id: id, read_at: now })
      changed = true
    }
  }
  if (changed) {
    writeLS(READS_KEY(employeeId), all)
    bump()
  }
}

/** Quantidade de posts visiveis ao colaborador ainda nao lidos. */
export function unreadCountForEmployee(emp: Employee): number {
  const read = getReadIds(emp.id)
  return postsForEmployee(emp).filter((p) => !read.has(p.id)).length
}
