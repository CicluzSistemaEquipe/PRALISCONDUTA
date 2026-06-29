// ============================================================
// Presets visuais do Social + utilitarios de contraste (WCAG)
//
// Cada tipo de post tem um preset seguro (fundo escuro tematico + texto legivel
// + acento). O admin pode sobrescrever cor do card/texto, mas a legibilidade e
// validada (contraste minimo AA) antes de salvar.
// ============================================================

import type { SocialPostType } from './types'

export interface SocialPreset {
  label: string
  card: string   // fundo do card (escuro, combina com o feed)
  text: string   // texto sobre o card
  accent: string // chip/realce
}

export const SOCIAL_PRESETS: Record<SocialPostType, SocialPreset> = {
  aviso:       { label: 'Aviso',        card: '#2a2410', text: '#fff3d6', accent: '#e3a92f' },
  importante:  { label: 'Importante',   card: '#2a1416', text: '#ffe9e6', accent: '#ef4444' },
  treinamento: { label: 'Treinamento',  card: '#2a1708', text: '#ffe6d2', accent: '#f37435' },
  geral:       { label: 'Geral',        card: '#1c1610', text: '#f0e7dc', accent: '#b8860b' },
}

export function presetFor(type: SocialPostType): SocialPreset {
  return SOCIAL_PRESETS[type] ?? SOCIAL_PRESETS.geral
}

/** Paleta curada de cores de card (escuras, seguras) para escolha manual. */
export const SAFE_CARD_COLORS = [
  '#1c1610', '#2a1416', '#2a2410', '#10241a', '#231033', '#2a1708', '#0e2230', '#14140f',
]

// ---------- contraste (WCAG 2.x) ----------
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
function channel(c: number): number {
  const x = c / 255
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
/** Razao de contraste entre duas cores (1..21). */
export function contrastRatio(a: string, b: string): number {
  const L1 = luminance(a), L2 = luminance(b)
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2)
  return (hi + 0.05) / (lo + 0.05)
}
/** true quando o contraste atende AA para texto normal (>= 4.5). */
export function isReadable(bg: string, fg: string): boolean {
  return contrastRatio(bg, fg) >= 4.5
}
/** Escolhe automaticamente texto claro/escuro com melhor contraste sobre `bg`. */
export function readableTextOn(bg: string): string {
  const white = contrastRatio(bg, '#ffffff')
  const dark = contrastRatio(bg, '#141210')
  return white >= dark ? '#ffffff' : '#141210'
}
