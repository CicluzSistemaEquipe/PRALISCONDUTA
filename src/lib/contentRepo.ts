// ============================================================
// Repositório de CONTEÚDO (Fase 2 / P2.1)
//
// Lê/escreve os módulos no Supabase (tabela training_modules, content jsonb =
// Module). TUDO gated por `hasSupabase`: sem env vars, é no-op e o app segue
// 100% localStorage (modo local/demo intacto).
//
// Estratégia: o app continua lendo de forma SÍNCRONA via content.ts. Este
// módulo apenas HIDRATA um cache em localStorage (`pralis:content-cache`) a
// partir do Supabase, e ESPELHA as edições do admin de volta no Supabase.
// content.ts prefere esse cache quando hasSupabase; senão, comportamento atual.
// ============================================================

import { supabase, hasSupabase } from './supabase'
import type { Module } from './types'

export const CONTENT_CACHE_KEY = 'pralis:content-cache'

function writeCache(mods: Module[]) {
  try { localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(mods)) } catch { /* quota */ }
}

/** Lê o cache de conteúdo hidratado do Supabase (síncrono). */
export function readContentCache(): Module[] | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CONTENT_CACHE_KEY) : null
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? (parsed as Module[]) : null
  } catch {
    return null
  }
}

/** Linha do banco a partir de um Module. */
function toRow(m: Module, index: number) {
  const status = m.status ?? 'published'
  return {
    id: m.id,
    slug: m.id,
    section: m.section ?? 'geral',
    roles: m.roles,
    active: m.active !== false,
    status,
    sort_order: index,
    content: m,
    updated_at: new Date().toISOString(),
    published_at: status === 'published' ? new Date().toISOString() : null,
  }
}

/** Busca os módulos PUBLICADOS do Supabase (ou null se desligado/erro). */
export async function fetchPublishedModules(): Promise<Module[] | null> {
  if (!hasSupabase || !supabase) return null
  try {
    const { data, error } = await supabase
      .from('training_modules')
      .select('content')
      .eq('active', true)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
    if (error || !data) return null
    return data.map((r) => (r as { content: Module }).content)
  } catch {
    return null
  }
}

/** Hidrata o cache local a partir do Supabase. Retorna true se atualizou. */
export async function hydrateContentCache(): Promise<boolean> {
  if (!hasSupabase) return false
  const mods = await fetchPublishedModules()
  if (mods && mods.length) {
    writeCache(mods)
    return true
  }
  return false
}

/**
 * Espelha a lista local de módulos no Supabase (upsert) e atualiza o cache.
 * Best-effort: erros não quebram o fluxo local. No-op sem Supabase.
 */
export async function syncModules(mods: Module[]): Promise<void> {
  if (!hasSupabase || !supabase) return
  try {
    await supabase.from('training_modules').upsert(mods.map(toRow), { onConflict: 'id' })
    // o app lê só os publicados e ativos
    writeCache(mods.filter((m) => m.active !== false && (m.status ?? 'published') !== 'draft'))
  } catch {
    /* best-effort */
  }
}

/** Semente inicial: empurra os módulos atuais para o Supabase (idempotente). */
export async function seedModulesToSupabase(mods: Module[]): Promise<void> {
  return syncModules(mods)
}
