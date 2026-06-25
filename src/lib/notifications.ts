// ============================================================
// Notificações — eventos relevantes para Dono / Gerente
//
// Demo: registra no console (DEV) e guarda as últimas no localStorage.
// Fase 2: enviar via e-mail / webhook / push a partir destes payloads.
// ============================================================

import type { SignatureRecord } from './types'

export type NotificationType =
  | 'assinatura_concluida'
  | 'treinamento_concluido'
  | 'colaborador_novo'

export interface NotificationPayload {
  tipo: NotificationType
  colaboradorNome: string
  colaboradorId: string
  /** gerente responsável, quando houver */
  gerenteNome?: string
  gerenteEmail?: string
  /** ISO timestamp do evento */
  data: string
  /** dados auxiliares específicos do tipo */
  extra?: Record<string, unknown>
}

const LOG_KEY = 'pralis:notifications'
const LOG_CAP = 200

function persist(payload: NotificationPayload) {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    const all = raw ? (JSON.parse(raw) as NotificationPayload[]) : []
    all.push(payload)
    localStorage.setItem(LOG_KEY, JSON.stringify(all.slice(-LOG_CAP)))
  } catch {
    /* quota / modo privado — silenciar */
  }
}

const LABELS: Record<NotificationType, string> = {
  assinatura_concluida: 'Assinatura concluída',
  treinamento_concluido: 'Treinamento concluído',
  colaborador_novo: 'Novo colaborador',
}

/**
 * Dispara uma notificação. Em DEV imprime no console; sempre persiste a última.
 * Em produção (fase 2) este é o ponto de integração com e-mail/webhook.
 */
export async function enviarNotificacao(payload: NotificationPayload): Promise<void> {
  persist(payload)
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[NOTIFICAÇÃO] ${LABELS[payload.tipo]}`, payload)
  }
}

// ── Helpers de validade da assinatura ─────────────────────────────────────────

/** Uma assinatura é válida quando foi confirmada e tem data registrada. */
export function isSignatureValid(sig: SignatureRecord | null | undefined): boolean {
  return Boolean(sig && sig.confirmed && sig.signed_at)
}

/**
 * Colaborador "em dia": concluiu todos os módulos e tem assinatura válida.
 * Mantém a regra de negócio em um só lugar para Dono e Gerente.
 */
export function isColaboradorEmDia(input: {
  completedModules: number
  totalModules: number
  signature?: SignatureRecord | null
}): boolean {
  const concluiu = input.totalModules > 0 && input.completedModules >= input.totalModules
  return concluiu && isSignatureValid(input.signature)
}
