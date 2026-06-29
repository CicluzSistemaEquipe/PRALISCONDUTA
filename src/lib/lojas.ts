// ============================================================
// Registro de Lojas/Unidades (MVP localStorage, reativo)
//
// Cadastre as lojas uma vez; os formularios de gerente/colaborador puxam a
// lista (autocomplete) e gravam o NOME da loja. Ao salvar um cadastro, a loja
// usada e registrada automaticamente (idempotente). Em producao: tabela no
// Supabase. Sem migrations agora.
// ============================================================

import { useSyncExternalStore } from 'react'

const KEY = 'pralis:lojas'

function readLS(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
function writeLS(list: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* quota */ }
}

let version = 0
const listeners = new Set<() => void>()
function bump() { version++; listeners.forEach((l) => l()) }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) }
export function useLojasVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => version)
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === KEY) bump() })
}

/** Lista de lojas (ordem alfabetica, sem duplicatas). */
export function getLojas(): string[] {
  return [...readLS()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

/** Hook reativo com a lista de lojas. */
export function useLojas(): string[] {
  useLojasVersion()
  return getLojas()
}

const norm = (s: string) => s.trim().toLowerCase()

/** Registra uma loja (idempotente — ignora vazio/duplicata case-insensitive). */
export function addLoja(nome: string): void {
  const v = nome.trim()
  if (!v) return
  const all = readLS()
  if (all.some((l) => norm(l) === norm(v))) return
  all.push(v)
  writeLS(all)
  bump()
}

/** Remove uma loja do registro (nao altera cadastros existentes). */
export function removeLoja(nome: string): void {
  writeLS(readLS().filter((l) => norm(l) !== norm(nome)))
  bump()
}
