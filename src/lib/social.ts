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
const ENGAGEMENT_KEY = 'pralis:social-engagement'

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

/** Erro de armazenamento (quota) — usado para avisar o admin em vez de falhar mudo. */
export class StorageFullError extends Error {
  constructor() {
    super('Nao foi possivel salvar: o armazenamento local esta cheio. Use uma imagem menor ou remova comunicados antigos com imagem. (Em producao as imagens vao para Storage/CDN.)')
    this.name = 'StorageFullError'
  }
}

/** Grava os posts e PROPAGA falha de quota (diferente de writeLS, que e silencioso). */
function persistPosts(all: SocialPost[]) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(all))
  } catch {
    throw new StorageFullError()
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
    if (e.key === POSTS_KEY || e.key === ENGAGEMENT_KEY) bump()
  })
}

// ------------------------------------------------------------
// Posts — leitura
// ------------------------------------------------------------
/** Todos os posts (admin), mais recentes primeiro. */
export function getAllPosts(): SocialPost[] {
  return readLS<SocialPost[]>(POSTS_KEY, []).sort((a, b) =>
    (b.updated_at ?? '').localeCompare(a.updated_at ?? ''),
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
    case 'manager':
      // atinge todos os colaboradores cujo gerente responsavel e este AdminUser
      return emp.gerenteId === audience.value
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
      return (b.published_at ?? b.created_at ?? '').localeCompare(a.published_at ?? a.created_at ?? '')
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
  created_by_role?: SocialPost['created_by_role']
  image?: string
  imageWidth?: number
  imageHeight?: number
  cardColor?: string
  textColor?: string
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
      image: input.image,
      imageWidth: input.imageWidth,
      imageHeight: input.imageHeight,
      cardColor: input.cardColor,
      textColor: input.textColor,
      updated_at: now,
    }
    all[idx] = next
    persistPosts(all)
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
    created_by_role: input.created_by_role,
    image: input.image,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    cardColor: input.cardColor,
    textColor: input.textColor,
    created_at: now,
    updated_at: now,
  }
  all.push(created)
  persistPosts(all)
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
// Engajamento — visualizacoes (lido) + confirmacoes ("Li e estou ciente")
// Registro GLOBAL (um por post+colaborador) que alimenta o relatorio do admin
// e o badge do colaborador. Em producao: tabela no Supabase (ver proposta).
// ------------------------------------------------------------
export interface SocialEngagement {
  post_id: string
  employee_id: string
  employee_name: string
  viewed_at: string | null
  confirmed_at: string | null
}

function readEngagement(): SocialEngagement[] {
  return readLS<SocialEngagement[]>(ENGAGEMENT_KEY, [])
}
function findRec(list: SocialEngagement[], postId: string, empId: string) {
  return list.find((r) => r.post_id === postId && r.employee_id === empId)
}

export function hasSeen(postId: string, employeeId: string): boolean {
  const r = findRec(readEngagement(), postId, employeeId)
  return Boolean(r && (r.viewed_at || r.confirmed_at))
}
export function hasConfirmed(postId: string, employeeId: string): boolean {
  const r = findRec(readEngagement(), postId, employeeId)
  return Boolean(r && r.confirmed_at)
}

/** Marca como visto (abrir o feed). Idempotente. */
export function markPostsViewed(emp: Employee, postIds: string[]) {
  const all = readEngagement()
  const now = new Date().toISOString()
  let changed = false
  for (const id of postIds) {
    const r = findRec(all, id, emp.id)
    if (r) {
      if (!r.viewed_at) { r.viewed_at = now; r.employee_name = emp.name; changed = true }
    } else {
      all.push({ post_id: id, employee_id: emp.id, employee_name: emp.name, viewed_at: now, confirmed_at: null })
      changed = true
    }
  }
  if (changed) { writeLS(ENGAGEMENT_KEY, all); bump() }
}

/** Confirma "Li e estou ciente". Idempotente — nao duplica a confirmacao. */
export function recordAck(emp: Employee, postId: string) {
  const all = readEngagement()
  const now = new Date().toISOString()
  const r = findRec(all, postId, emp.id)
  if (r) {
    if (!r.confirmed_at) {
      r.confirmed_at = now
      if (!r.viewed_at) r.viewed_at = now
      r.employee_name = emp.name
      writeLS(ENGAGEMENT_KEY, all); bump()
    }
    return
  }
  all.push({ post_id: postId, employee_id: emp.id, employee_name: emp.name, viewed_at: now, confirmed_at: now })
  writeLS(ENGAGEMENT_KEY, all); bump()
}

/** Quantidade de posts visiveis ao colaborador ainda nao vistos (badge). */
export function unreadCountForEmployee(emp: Employee): number {
  const eng = readEngagement()
  const seen = new Set(
    eng.filter((r) => r.employee_id === emp.id && (r.viewed_at || r.confirmed_at)).map((r) => r.post_id),
  )
  return postsForEmployee(emp).filter((p) => !seen.has(p.id)).length
}

/** Relatorio por post (admin): quem viu e quem confirmou, com data/hora. */
export function engagementForPost(postId: string): { views: SocialEngagement[]; confirms: SocialEngagement[] } {
  const recs = readEngagement().filter((r) => r.post_id === postId)
  return {
    views: recs.filter((r) => r.viewed_at).sort((a, b) => (b.viewed_at ?? '').localeCompare(a.viewed_at ?? '')),
    confirms: recs.filter((r) => r.confirmed_at).sort((a, b) => (b.confirmed_at ?? '').localeCompare(a.confirmed_at ?? '')),
  }
}
