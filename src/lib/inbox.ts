// ============================================================
// Caixa de entrada do Admin — mensagens privadas Gerente -> Dono
//
// NAO vai para colaboradores. localStorage (`pralis:admin-inbox`), reativo.
// Em producao: tabela no Supabase (ver proposta). Sem migrations agora.
// ============================================================

import { useSyncExternalStore } from 'react'
import type { AdminMessage } from './types'

const KEY = 'pralis:admin-inbox'

function readLS(): AdminMessage[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AdminMessage[]) : []
  } catch {
    return []
  }
}
function writeLS(list: AdminMessage[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* quota */ }
}
function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'msg-' + Math.random().toString(36).slice(2, 10)
}

let version = 0
const listeners = new Set<() => void>()
function bump() { version++; listeners.forEach((l) => l()) }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) }
export function useInboxVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => version)
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === KEY) bump() })
}

/** Gerente envia uma mensagem para o Admin. */
export function sendMessage(input: { from_id: string; from_name: string; title: string; message: string }): AdminMessage {
  const msg: AdminMessage = {
    id: uid(),
    from_id: input.from_id,
    from_name: input.from_name,
    title: input.title.trim(),
    message: input.message.trim(),
    created_at: new Date().toISOString(),
    read: false,
    archived: false,
  }
  const all = readLS()
  all.push(msg)
  writeLS(all)
  bump()
  return msg
}

/** Todas as mensagens, mais recentes primeiro. */
export function listMessages(): AdminMessage[] {
  return readLS().sort((a, b) => b.created_at.localeCompare(a.created_at))
}
/** Caixa de entrada do Admin: recebidas e nao arquivadas. */
export function inboxForAdmin(): AdminMessage[] {
  return listMessages().filter((m) => !m.archived)
}
/** Mensagens enviadas por um gerente (com status lido/enviado). */
export function sentBy(gerenteId: string): AdminMessage[] {
  return listMessages().filter((m) => m.from_id === gerenteId)
}
export function markMessageRead(id: string) {
  const all = readLS()
  const idx = all.findIndex((m) => m.id === id)
  if (idx < 0 || all[idx].read) return
  all[idx] = { ...all[idx], read: true }
  writeLS(all); bump()
}
export function archiveMessage(id: string) {
  const all = readLS()
  const idx = all.findIndex((m) => m.id === id)
  if (idx < 0) return
  all[idx] = { ...all[idx], archived: true, read: true }
  writeLS(all); bump()
}
/** Mensagens novas (nao lidas e nao arquivadas) — badge do Admin. */
export function unreadInboxCount(): number {
  return readLS().filter((m) => !m.read && !m.archived).length
}
