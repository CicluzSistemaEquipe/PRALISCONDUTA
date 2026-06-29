import { Pin, Check, CheckCheck } from 'lucide-react'
import type { SocialPost } from '@/lib/types'
import { presetFor } from '@/lib/socialPresets'

function initials(name: string): string {
  const p = (name || 'Pralis').trim().split(/\s+/)
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : name.slice(0, 2)).toUpperCase()
}

function roleLabel(post: SocialPost): string {
  if (post.created_by_role === 'dono') return 'Dono'
  if (post.created_by_role === 'gerente') return 'Gerente'
  return 'Pralis'
}

function formatDateTime(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' as ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function SocialPostCard({
  post, isNew = false, confirmed = false, onAck, authorAvatar,
}: {
  post: SocialPost
  isNew?: boolean
  confirmed?: boolean
  onAck?: () => void
  authorAvatar?: string
}) {
  const preset = presetFor(post.type)
  const cardBg = post.cardColor ?? preset.card
  const textColor = post.textColor ?? preset.text
  const accent = preset.accent
  const muted = textColor + 'b3' // ~70% alpha p/ texto secundario sobre o card

  return (
    <article
      style={{
        background: cardBg,
        color: textColor,
        border: `1px solid ${post.pinned ? accent + '88' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: post.pinned ? `0 0 0 1px ${accent}33` : 'none',
      }}
    >
      {/* topo: autor */}
      <div className="flex items-center gap-3" style={{ padding: '14px 16px 10px' }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%', flex: 'none', overflow: 'hidden',
            display: 'grid', placeItems: 'center', background: accent + '33',
            border: `1.5px solid ${accent}66`, color: textColor, fontWeight: 800, fontSize: 14,
          }}
        >
          {authorAvatar ? (
            <img src={authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials(post.created_by_name ?? 'Pralis')
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.2 }} className="truncate">
            {post.created_by_name ?? 'Pralis'}
          </div>
          <div style={{ fontSize: 12, color: muted }}>
            {roleLabel(post)} · {formatDateTime(post.published_at ?? post.created_at)}
          </div>
        </div>
        {post.pinned && <Pin size={16} strokeWidth={2.2} style={{ color: accent }} aria-label="Fixado" />}
        {isNew && !confirmed && (
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: '#ef4444', borderRadius: 999, padding: '2px 8px', letterSpacing: '0.04em' }}>
            NOVO
          </span>
        )}
      </div>

      {/* chip de tipo */}
      <div style={{ padding: '0 16px 8px' }}>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: accent,
            background: accent + '22', border: `1px solid ${accent}55`, borderRadius: 999, padding: '3px 10px',
          }}
        >
          <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
          {preset.label}
        </span>
      </div>

      {/* titulo + mensagem */}
      <div style={{ padding: '0 16px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>{post.title}</h3>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, marginTop: 6, color: muted, whiteSpace: 'pre-wrap' }}>
          {post.message}
        </p>
      </div>

      {/* imagem opcional — object-contain, fundo neutro elegante */}
      {post.image && (
        <div style={{ marginTop: 12, background: 'rgba(0,0,0,0.28)' }}>
          <img
            src={post.image}
            alt={post.title}
            style={{ display: 'block', width: '100%', maxHeight: '62vh', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* rodape: confirmacao */}
      <div style={{ padding: '12px 16px 14px' }}>
        {confirmed ? (
          <div
            className="flex items-center justify-center gap-2"
            style={{ fontSize: 13.5, fontWeight: 700, color: preset.accent, background: accent + '1f', borderRadius: 12, padding: '11px' }}
          >
            <CheckCheck size={17} strokeWidth={2.4} /> Você confirmou a leitura
          </div>
        ) : (
          <button
            onClick={onAck}
            className="flex w-full items-center justify-center gap-2"
            style={{
              fontSize: 14, fontWeight: 700, color: '#1a0e00', border: 'none', cursor: 'pointer',
              borderRadius: 12, padding: '12px',
              background: 'linear-gradient(110deg,#f8936a,#f37435 45%,#d4a017)',
            }}
          >
            <Check size={17} strokeWidth={2.6} /> Li e estou ciente
          </button>
        )}
      </div>
    </article>
  )
}
