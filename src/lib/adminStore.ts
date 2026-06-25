// ============================================================
// Admin Store — fonte editável do CONTEÚDO do app (MVP localStorage)
//
// Guarda módulos, termos e configuração da tela inicial sob a chave
// `pralis_admin_data`. Ao inicializar faz MERGE com o conteúdo padrão de
// `content.ts` — nunca sobrescreve dado já salvo pelo gestor.
//
// Reativo via useSyncExternalStore: qualquer edição no admin re-renderiza
// todas as telas que consomem o store, e o app do colaborador lê os mesmos
// dados (ver `modulesForRole`, Splash e Completion).
//
// Colaboradores/assinaturas continuam em `storage.ts` (fonte de verdade do
// app), por isso NÃO ficam aqui — evita duas verdades para a mesma entidade.
// ============================================================

import { useCallback, useSyncExternalStore } from 'react'
import { MODULES, TERMS } from './content'
import type { Module } from './types'

export const ADMIN_DATA_KEY = 'pralis_admin_data'

export interface SplashConfig {
  welcomeText: string
  mission: string
  vision: string
  values: string[]
}

export interface AdminData {
  modules: Module[]
  termsText: string
  termsVersion: string
  termsEffectiveDate: string // ISO date (YYYY-MM-DD)
  splashConfig: SplashConfig
  lastUpdated: string // ISO datetime
}

// ------------------------------------------------------------
// Conteúdo padrão (seed) — usado quando ainda não há dado salvo
// ------------------------------------------------------------

function defaultTermsText(): string {
  return TERMS.map((t) => `<h3>${t.title}</h3>\n<p>${t.text}</p>`).join('\n\n')
}

export function defaultAdminData(): AdminData {
  return {
    modules: MODULES,
    termsText: defaultTermsText(),
    termsVersion: 'v1.0',
    termsEffectiveDate: '2024-03-09',
    splashConfig: {
      welcomeText: 'a prova é ser feliz',
      mission:
        'Levar felicidade através de produtos de qualidade, feitos com respeito e cuidado em cada detalhe.',
      vision:
        'Ser referência em panificação artesanal, reconhecida pela excelência e pelo carinho com as pessoas.',
      values: ['Comprometimento', 'Humildade', 'Respeito', 'Qualidade', 'Cuidado com as pessoas'],
    },
    lastUpdated: new Date().toISOString(),
  }
}

// ------------------------------------------------------------
// Store externo (singleton) — leitura/escrita + notificação
// ------------------------------------------------------------

let cache: AdminData | null = null
const listeners = new Set<() => void>()

function readRaw(): AdminData {
  const base = defaultAdminData()
  try {
    const raw = localStorage.getItem(ADMIN_DATA_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<AdminData>
    // merge raso: mantém defaults para chaves ausentes e faz merge do splash
    return {
      ...base,
      ...parsed,
      splashConfig: { ...base.splashConfig, ...(parsed.splashConfig ?? {}) },
      modules: parsed.modules?.length ? parsed.modules : base.modules,
    }
  } catch {
    return base
  }
}

function load(): AdminData {
  if (!cache) cache = readRaw()
  return cache
}

function persist(next: AdminData) {
  cache = next
  try {
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(next))
  } catch {
    /* quota / modo privado — silencia */
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

// sincroniza entre abas
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === ADMIN_DATA_KEY) {
      cache = null
      listeners.forEach((l) => l())
    }
  })
}

// ------------------------------------------------------------
// Acesso não-reativo (para módulos não-React: content.ts, etc.)
// ------------------------------------------------------------

/** Lê o conteúdo salvo SEM React. Retorna defaults se nada foi salvo. */
export function getAdminData(): AdminData {
  return load()
}

/** Módulos salvos pelo gestor, ou null se ainda não houve edição. */
export function getStoredModules(): Module[] | null {
  try {
    const raw = localStorage.getItem(ADMIN_DATA_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AdminData>
    return parsed.modules?.length ? parsed.modules : null
  } catch {
    return null
  }
}

// ------------------------------------------------------------
// Hook reativo + CRUD
// ------------------------------------------------------------

export function useAdminStore() {
  const data = useSyncExternalStore(subscribe, load, load)

  const update = useCallback((patch: Partial<AdminData>) => {
    persist({ ...load(), ...patch, lastUpdated: new Date().toISOString() })
  }, [])

  const saveModule = useCallback(
    (mod: Module) => {
      const mods = load().modules.slice()
      const idx = mods.findIndex((m) => m.id === mod.id)
      if (idx >= 0) mods[idx] = mod
      else mods.push(mod)
      update({ modules: mods })
    },
    [update],
  )

  const deleteModule = useCallback(
    (id: string) => update({ modules: load().modules.filter((m) => m.id !== id) }),
    [update],
  )

  const toggleActive = useCallback(
    (id: string) =>
      update({
        modules: load().modules.map((m) =>
          m.id === id ? { ...m, active: m.active === false } : m,
        ),
      }),
    [update],
  )

  /** Reordena módulos a partir de uma lista de ids na nova ordem. */
  const reorderModules = useCallback(
    (orderedIds: string[]) => {
      const byId = new Map(load().modules.map((m) => [m.id, m]))
      const next = orderedIds.map((id) => byId.get(id)).filter(Boolean) as Module[]
      // preserva quaisquer módulos não citados (segurança)
      for (const m of load().modules) if (!orderedIds.includes(m.id)) next.push(m)
      update({ modules: next })
    },
    [update],
  )

  const setSplash = useCallback(
    (patch: Partial<SplashConfig>) =>
      update({ splashConfig: { ...load().splashConfig, ...patch } }),
    [update],
  )

  const setTerms = useCallback(
    (patch: Partial<Pick<AdminData, 'termsText' | 'termsVersion' | 'termsEffectiveDate'>>) =>
      update(patch),
    [update],
  )

  const resetAll = useCallback(() => persist(defaultAdminData()), [])

  return {
    data,
    update,
    saveModule,
    deleteModule,
    toggleActive,
    reorderModules,
    setSplash,
    setTerms,
    resetAll,
    getModule: (id: string) => data.modules.find((m) => m.id === id),
  }
}
