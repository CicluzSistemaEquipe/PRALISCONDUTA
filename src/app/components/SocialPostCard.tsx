import { Pin, ChevronRight, CheckCheck } from 'lucide-react'
import type { SocialPost } from '@/lib/types'
import { presetFor, readableTextOn, isReadable } from '@/lib/socialPresets'
import { initials, roleLabel, formatDateTime } from '@/lib/socialFormat'

/**
 * Card COMPACTO do feed: mostra so um resumo. Tocar abre o popup de leitura
 * (SocialPostModal), onde fica a mensagem completa e o "Li e estou ciente".
 * Elemento-assinatura: a espinha vertical colorida pela categoria.
 */
export function SocialPostCard({
  post, isNew = false, confirmed = false, onOpen, authorAvatar,
}: {
  post: SocialPost
  isNew?: boolean
  confirmed?: boolean
  onOpen?: () => void
  authorAvatar?: string
}) {
  const preset = presetFor(post.type)
  const accent = preset.accent
  // Fundo = cor escolhida no admin. TUDO (texto, ícones, chip) usa um foreground
  // legível calculado automaticamente sobre esse fundo (respeita a fonte escolhida
  // só quando ela já tem contraste suficiente).
  const cardBg = post.cardColor ?? preset.card
  const fg = post.textColor && isReadable(cardBg, post.textColor) ? post.textColor : readableTextOn(cardBg)
  const muted = fg + 'b8'   // ~72% — texto secundário
  const soft = fg + '1f'    // preenchimento leve (chip/avatar)
  const line = fg + '40'    // bordas sutis

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Abrir comunicado: ${post.title}`}
      className="group relative block w-full overflow-hidden text-left transition-transform active:scale-[0.985]"
      style={{
        background: cardBg,
        color: fg,
        border: `1px solid ${post.pinned ? fg + '66' : fg + '24'}`,
        borderRadius: 18,
        boxShadow: post.pinned ? `0 8px 24px rgba(0,0,0,0.28)` : '0 6px 18px rgba(0,0,0,0.22)',
      }}
    >
      {/* brilho sutil no topo p/ profundidade */}
      <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.06), transparent 42%)', pointerEvents: 'none' }} />
      {/* espinha da categoria (cor do tipo) */}
      <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent }} />

      <div className="relative" style={{ padding: '13px 14px 13px 18px' }}>
        {/* topo: autor + status */}
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flex: 'none', overflow: 'hidden',
            display: 'grid', placeItems: 'center', background: soft,
            border: `1.5px solid ${line}`, color: fg, fontWeight: 800, fontSize: 12,
          }}>
            {authorAvatar
              ? <img src={authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(post.created_by_name ?? 'Pralis')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate" style={{ fontSize: 13, fontWeight: 700, color: fg, lineHeight: 1.2 }}>
              {post.created_by_name ?? 'Pralis'}
            </div>
            <div style={{ fontSize: 11.5, color: muted }}>
              {roleLabel(post)} · {formatDateTime(post.published_at ?? post.created_at)}
            </div>
          </div>

          {post.pinned && <Pin size={14} strokeWidth={2.2} style={{ color: fg, flex: 'none' }} aria-label="Fixado" />}
          {isNew && !confirmed && (
            <span aria-label="Novo" style={{
              flex: 'none', fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
              color: cardBg, background: fg, borderRadius: 999, padding: '2px 7px',
            }}>NOVO</span>
          )}
          {confirmed && <CheckCheck size={15} strokeWidth={2.4} style={{ color: fg, flex: 'none' }} aria-label="Lido" />}
        </div>

        {/* corpo: chip + titulo + resumo (+ thumb opcional) */}
        <div className="mt-2.5 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.05em', textTransform: 'uppercase', color: fg,
              background: soft, border: `1px solid ${line}`, borderRadius: 999, padding: '2px 8px',
            }}>
              <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
              {preset.label}
            </span>
            <h3 className="truncate" style={{ fontSize: 15, fontWeight: 700, color: fg, lineHeight: 1.3, marginTop: 6 }}>
              {post.title}
            </h3>
            <p style={{
              fontSize: 13, lineHeight: 1.5, marginTop: 3, color: muted,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.message}
            </p>
          </div>
          {post.image && (
            <img src={post.image} alt="" style={{
              width: 58, height: 58, flex: 'none', borderRadius: 12, objectFit: 'cover',
              border: `1px solid ${line}`,
            }} />
          )}
        </div>

        {/* afford: tocar para ler */}
        <div className="mt-2.5 flex items-center gap-1" style={{ fontSize: 11.5, fontWeight: 700, color: fg, opacity: 0.92 }}>
          {confirmed ? 'Reler comunicado' : 'Toque para ler'}
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  )
}
