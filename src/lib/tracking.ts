// ============================================================
// Tracking de eventos do colaborador (login, módulos, assinatura)
//
// Demo: grava no localStorage (últimos 500 por colaborador). A localização
// é opcional e best-effort — se o usuário negar o GPS, o evento é gravado
// mesmo assim, apenas sem coordenadas.
// Fase 2: enviar para Supabase/analytics a partir do mesmo payload.
// ============================================================

export type TrackingEventType =
  | 'login'
  | 'modulo_inicio'
  | 'modulo_conclusao'
  | 'assinatura'
  | 'quiz_resposta'

export interface TrackingEvent {
  tipo: TrackingEventType
  colaboradorId: string
  moduloId?: string
  /** ISO timestamp */
  timestamp: string
  lat?: number
  lng?: number
  /** precisão do GPS em metros */
  precisao?: number
  userAgent?: string
}

const KEY = (id: string) => `pralis:tracking:${id}`
const CAP = 500

function append(event: TrackingEvent) {
  try {
    const raw = localStorage.getItem(KEY(event.colaboradorId))
    const all = raw ? (JSON.parse(raw) as TrackingEvent[]) : []
    all.push(event)
    localStorage.setItem(KEY(event.colaboradorId), JSON.stringify(all.slice(-CAP)))
  } catch {
    /* quota / modo privado — silenciar */
  }
}

/** Obtém a posição atual com timeout curto; resolve null se indisponível/negado. */
function getPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 },
    )
  })
}

/**
 * Registra um evento de tracking com timestamp e (best-effort) localização.
 * Nunca lança — falhas de GPS ou storage são silenciadas.
 */
export async function registrarEvento(
  input: Omit<TrackingEvent, 'timestamp' | 'userAgent'>,
): Promise<void> {
  const event: TrackingEvent = {
    ...input,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  }
  const pos = await getPosition()
  if (pos) {
    event.lat = pos.coords.latitude
    event.lng = pos.coords.longitude
    event.precisao = pos.coords.accuracy
  }
  append(event)
}

export function getEventos(colaboradorId: string): TrackingEvent[] {
  try {
    const raw = localStorage.getItem(KEY(colaboradorId))
    return raw ? (JSON.parse(raw) as TrackingEvent[]) : []
  } catch {
    return []
  }
}
