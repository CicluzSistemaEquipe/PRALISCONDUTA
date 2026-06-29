// ============================================================
// Caixa de entrada do Admin — mensagens privadas Gerente -> Dono
//
// NAO vai para colaboradores. localStorage (`pralis:admin-inbox`), reativo.
// Em producao: tabela no Supabase (ver proposta). Sem migrations agora.
// ============================================================

import { useSyncExternalStore } from 'react'
import type { AdminMessage, AdminMessageReply } from './types'

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

/** Envia uma mensagem. Sem `to_id`/`to_all_gerentes` => vai para o Admin (gerente
 *  -> dono). Com destino => Admin envia para gerente específico ou todos. */
export function sendMessage(input: {
  from_id: string; from_name: string; title: string; message: string
  from_role?: 'dono' | 'gerente'; to_id?: string; to_all_gerentes?: boolean
}): AdminMessage {
  const msg: AdminMessage = {
    id: uid(),
    from_id: input.from_id,
    from_name: input.from_name,
    from_role: input.from_role ?? 'gerente',
    to_id: input.to_id,
    to_all_gerentes: input.to_all_gerentes,
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

/** Uma mensagem é "para o Admin" quando não tem destino de gerente. */
function isToAdmin(m: AdminMessage): boolean {
  return !m.to_id && !m.to_all_gerentes
}

/** Todas as mensagens, mais recentes primeiro. */
export function listMessages(): AdminMessage[] {
  return readLS().sort((a, b) => b.created_at.localeCompare(a.created_at))
}
/** Caixa de entrada do Admin: recebidas dos gerentes, nao arquivadas. */
export function inboxForAdmin(): AdminMessage[] {
  return listMessages().filter((m) => isToAdmin(m) && !m.archived)
}
/** Caixa de entrada de um gerente: enviadas pelo Admin a ele (ou a todos). */
export function inboxForGerente(gerenteId: string): AdminMessage[] {
  return listMessages().filter((m) => !m.archived && (m.to_id === gerenteId || m.to_all_gerentes))
}
/** Mensagens enviadas por alguem (gerente -> admin), com status/respostas. */
export function sentBy(senderId: string): AdminMessage[] {
  return listMessages().filter((m) => m.from_id === senderId && isToAdmin(m))
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
/** Adiciona uma resposta (thread) a uma mensagem. */
export function replyMessage(id: string, reply: Omit<AdminMessageReply, 'created_at'>) {
  const all = readLS()
  const idx = all.findIndex((m) => m.id === id)
  if (idx < 0) return
  const full: AdminMessageReply = { ...reply, created_at: new Date().toISOString() }
  all[idx] = { ...all[idx], replies: [...(all[idx].replies ?? []), full], read: true }
  writeLS(all); bump()
}
/** Marca/desmarca como concluída (resolvida). */
export function resolveMessage(id: string, resolved = true) {
  const all = readLS()
  const idx = all.findIndex((m) => m.id === id)
  if (idx < 0) return
  all[idx] = { ...all[idx], resolved, read: true }
  writeLS(all); bump()
}
/** Mensagens novas para o Admin (nao lidas, nao arquivadas) — badge do Admin. */
export function unreadInboxCount(): number {
  return readLS().filter((m) => isToAdmin(m) && !m.read && !m.archived).length
}
/** Mensagens novas para um gerente — badge do gerente. */
export function unreadForGerente(gerenteId: string): number {
  return readLS().filter((m) => !m.archived && !m.read && (m.to_id === gerenteId || m.to_all_gerentes)).length
}
