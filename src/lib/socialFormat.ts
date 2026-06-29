// Helpers de apresentacao do Social — compartilhados pelo card do feed e pelo popup.
import type { SocialPost } from './types'

export function initials(name: string): string {
  const p = (name || 'Pralis').trim().split(/\s+/)
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : name.slice(0, 2)).toUpperCase()
}

export function roleLabel(post: SocialPost): string {
  if (post.created_by_role === 'dono') return 'Dono'
  if (post.created_by_role === 'gerente') return 'Gerente'
  return 'Pralis'
}

/** "26 de jun · 14:30" — data e hora curtas em pt-BR. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
