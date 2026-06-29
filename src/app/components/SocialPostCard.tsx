import { Pin } from 'lucide-react'
import type { SocialPost, SocialPostType } from '@/lib/types'

const TYPE_META: Record<SocialPostType, { label: string; color: string }> = {
  aviso:          { label: 'Aviso',       color: '#e3a92f' },
  gratidao:       { label: 'Gratidao',    color: '#5dd87a' },
  aniversariante: { label: 'Aniversario', color: '#a855f7' },
  importante:     { label: 'Importante',  color: '#ef4444' },
  treinamento:    { label: 'Treinamento', color: '#f37435' },
  geral:          { label: 'Geral',       color: '#b8860b' },
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export function SocialPostCard({ post, isNew = false }: { post: SocialPost; isNew?: boolean }) {
  const meta = TYPE_META[post.type] ?? TYPE_META.geral

  return (
    <article
      style={{
        background: 'var(--glass-bg)',
        border: `1px solid ${post.pinned ? 'rgba(243,116,53,0.45)' : 'var(--stroke)'}`,
        borderRadius: 18,
        padding: '16px 16px 14px',
        position: 'relative',
      }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
        <span
          className="font-body"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: meta.color, background: `${meta.color}1f`,
            border: `1px solid ${meta.color}55`, borderRadius: 999, padding: '3px 9px',
          }}
        >
          <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: meta.color }} />
          {meta.label}
        </span>

        {post.pinned && (
          <span className="inline-flex items-center" style={{ color: '#f37435' }} aria-label="Fixado">
            <Pin size={14} strokeWidth={2.2} />
          </span>
        )}

        {isNew && (
          <span
            className="font-body"
            style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#fff',
              background: '#ef4444', borderRadius: 999, padding: '2px 8px', letterSpacing: '0.04em',
            }}
          >
            NOVO
          </span>
        )}
      </div>

      <h3 className="font-body" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
        {post.title}
      </h3>

      <p
        className="font-body"
        style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: 6, whiteSpace: 'pre-wrap' }}
      >
        {post.message}
      </p>

      <div
        className="font-body"
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}
      >
        <span style={{ fontWeight: 600 }}>{post.created_by_name ?? 'Pralis'}</span>
        <span aria-hidden>·</span>
        <span>{formatDate(post.published_at ?? post.created_at)}</span>
      </div>
    </article>
  )
}
