// ============================================================
// Registro de Cargos (MVP localStorage, reativo) — espelha lib/lojas.ts
//
// Cargos personalizáveis: o admin gerencia a lista; os formulários de
// colaborador/gerente puxam dela (select + "+ Novo cargo") e gravam o NOME do
// cargo em Employee.role (retrocompatível com os 10 cargos atuais).
//
// SEMENTE: os 10 cargos de ROLES entram automaticamente (retrocompat) e podem
// ser editados/desativados — overrides ficam no localStorage. Em produção: tabela
// no Supabase. Sem migrations agora.
// ============================================================

import { useSyncExternalStore } from 'react'
import { ROLES, type Cargo } from './types'

const KEY = 'pralis:cargos'

export function slugCargo(nome: string): string {
  return (
    nome.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  ) || 'cargo'
}

/** Cargos semente (a partir de ROLES) — sempre presentes, editáveis/desativáveis. */
const SEED_CARGOS: Cargo[] = ROLES.map((nome) => ({ id: slugCargo(nome), nome, ativo: true }))
const SEED_IDS = SEED_CARGOS.map((c) => c.id)

function readLS(): Cargo[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as Cargo[]) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
function writeLS(list: Cargo[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* quota */ }
}

let version = 0
const listeners = new Set<() => void>()
function bump() { version++; listeners.forEach((l) => l()) }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) }
export function useCargosVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => version)
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === KEY) bump() })
}

/** Lista completa: sementes (na ordem de ROLES) + personalizados (alfabético).
 *  Overrides salvos no localStorage têm prioridade sobre a semente. */
export function getCargos(): Cargo[] {
  const stored = readLS()
  const byId = new Map<string, Cargo>()
  for (const c of SEED_CARGOS) byId.set(c.id, c)
  for (const c of stored) byId.set(c.id, { ...byId.get(c.id), ...c })
  const seeds = SEED_IDS.map((id) => byId.get(id)!).filter(Boolean)
  const extras = [...byId.values()]
    .filter((c) => !SEED_IDS.includes(c.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  return [...seeds, ...extras]
}

export function useCargos(): Cargo[] {
  useCargosVersion()
  return getCargos()
}

/** Só os ativos (para selects). */
export function cargosAtivos(): Cargo[] {
  return getCargos().filter((c) => c.ativo !== false)
}
/** Nomes ativos — usado nos selects de cadastro. */
export function cargoNomesAtivos(): string[] {
  return cargosAtivos().map((c) => c.nome)
}
/** Resolve um cargo pelo NOME (como gravado em Employee.role). */
export function getCargoByNome(nome: string): Cargo | undefined {
  const n = nome.trim().toLowerCase()
  return getCargos().find((c) => c.nome.trim().toLowerCase() === n)
}

const norm = (s: string) => s.trim().toLowerCase()

/** Cria/atualiza um cargo (idempotente por nome). Registra o usado nos cadastros. */
export function addCargo(input: { nome: string; accent?: string; icon?: string; gerenteId?: string; loja?: string }): Cargo {
  const nome = input.nome.trim()
  if (!nome) return { id: 'cargo', nome: '' }
  const id = slugCargo(nome)
  const stored = readLS()
  const idx = stored.findIndex((c) => c.id === id || norm(c.nome) === norm(nome))
  const base: Cargo = { id, nome, ativo: true, accent: input.accent, icon: input.icon, gerenteId: input.gerenteId, loja: input.loja }
  if (idx >= 0) stored[idx] = { ...stored[idx], ...base }
  else stored.push(base)
  writeLS(stored); bump()
  return base
}

/** Atualiza campos de um cargo (inclui sementes — vira override salvo). */
export function updateCargo(id: string, patch: Partial<Cargo>): void {
  const stored = readLS()
  const idx = stored.findIndex((c) => c.id === id)
  if (idx >= 0) {
    stored[idx] = { ...stored[idx], ...patch, id }
  } else {
    // override de uma semente ainda não persistida
    const seed = SEED_CARGOS.find((c) => c.id === id)
    stored.push({ ...(seed ?? { id, nome: id, ativo: true }), ...patch, id })
  }
  writeLS(stored); bump()
}

/** Ativa/desativa um cargo (sementes não somem; viram inativas). */
export function setCargoAtivo(id: string, ativo: boolean): void {
  updateCargo(id, { ativo })
}

/** Remove um cargo personalizado. Sementes não são removidas — apenas desativadas. */
export function removeCargo(id: string): void {
  if (SEED_IDS.includes(id)) { setCargoAtivo(id, false); return }
  writeLS(readLS().filter((c) => c.id !== id)); bump()
}
