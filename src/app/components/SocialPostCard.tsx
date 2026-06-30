import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Pin, Heart, BookOpen } from 'lucide-react'
import type { SocialPost } from '@/lib/types'
import { presetFor, readableTextOn, isReadable } from '@/lib/socialPresets'
import { initials, roleLabel, formatDateTime } from '@/lib/socialFormat'

/**
 * Card do feed — uma POSTAGEM, não um aviso. Quando há imagem, a peça aparece
 * inteira (contain, sem cortar/distorcer, adapta vertical/horizontal/quadrada) e
 * a legenda fica abaixo, como rede social. Confirmação de leitura é leve: um
 * coração discreto (clique) ou DUPLO-TOQUE na imagem — ambos chamam o MESMO
 * `onAck` ("ciente"), nunca um like paralelo. O "Li e estou ciente" completo
 * continua no popup (SocialPostModal). Elemento-assinatura: a espinha vertical
 * com a cor da categoria.
 */
const DOUBLE_TAP_MS = 250

export function SocialPostCard({
  post, isNew = false, confirmed = false, onOpen, onAck, authorAvatar,
}: {
  post: SocialPost
  isNew?: boolean
  confirmed?: boolean
  onOpen?: () => void
  onAck?: () => void
  authorAvatar?: string
}) {
  const reduce = useReducedMotion()
  const preset = presetFor(post.type)
  const accent = preset.accent
  // Fundo = cor escolhida no admin; TUDO (texto/ícones/chip) usa um foreground
  // legível calculado sobre esse fundo (respeita a fonte escolhida só quando já
  // tem contraste suficiente). Garante AA em qualquer cor de card.
  const cardBg = post.cardColor ?? preset.card
  const fg = post.textColor && isReadable(cardBg, post.textColor) ? post.textColor : readableTextOn(cardBg)
  const muted = fg + 'b8'   // ~72% — texto secundário
  const soft = fg + '14'    // preenchimento muito leve (avatar/heart idle)
  const line = fg + '40'    // bordas sutis (perceptíveis; igual ao popup)

  const hasImage = Boolean(post.image)
  const longText = (post.message?.length ?? 0) > 200

  // ── duplo-toque na imagem = confirmar ciência + coração no centro ──────────
  const [burst, setBurst] = useState(0)
  const tapTimer = useRef<number | null>(null)
  useEffect(() => () => { if (tapTimer.current !== null) window.clearTimeout(tapTimer.current) }, [])

  const ackBurst = () => { onAck?.(); if (!reduce) setBurst((b) => b + 1) }

  const onImageClick = () => {
    if (tapTimer.current !== null) {        // 2º toque dentro da janela → duplo-toque
      window.clearTimeout(tapTimer.current)
      tapTimer.current = null
      ackBurst()
    } else {                                 // 1º toque → abre depois da janela (se não vier o 2º)
      tapTimer.current = window.setTimeout(() => { tapTimer.current = null; onOpen?.() }, DOUBLE_TAP_MS)
    }
  }

  const chip = (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase', color: fg,
      background: soft, border: `1px solid ${line}`, borderRadius: 999, padding: '2px 8px',
    }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
      {preset.label}
    </span>
  )

  return (
    <article
      className="relative w-full overflow-hidden"
      style={{
        background: cardBg, color: fg,
        border: `1px solid ${post.pinned ? fg + '52' : fg + '1f'}`,
        borderRadius: 20,
        boxShadow: post.pinned ? '0 6px 20px rgba(0,0,0,0.26)' : '0 3px 12px rgba(0,0,0,0.18)',
      }}
    >
      {/* espinha da categoria (cor do tipo) — assinatura do feed */}
      <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent, zIndex: 2 }} />

      {/* topo: autor + meta + estado */}
      <header className="flex items-center gap-2.5" style={{ padding: '13px 14px 11px 18px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flex: 'none', overflow: 'hidden',
          display: 'grid', placeItems: 'center', background: soft,
          border: `1.5px solid ${line}`, color: fg, fontWeight: 800, fontSize: 13,
        }}>
          {authorAvatar
            ? <img src={authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials(post.created_by_name ?? 'Pralis')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate" style={{ fontSize: 13.5, fontWeight: 700, color: fg, lineHeight: 1.2 }}>
            {post.created_by_name ?? 'Pralis'}
          </div>
          <div className="truncate" style={{ fontSize: 11.5, color: muted }}>
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
      </header>

      {/* imagem inteira (contain) — peça principal; duplo-toque = ciente */}
      {hasImage && (
        <div
          onClick={onImageClick}
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.() } }}
          aria-label={`Abrir comunicado: ${post.title}`}
          className="relative flex w-full cursor-pointer items-center justify-center select-none"
          style={{
            background: 'rgba(0,0,0,0.30)', maxHeight: 440, minHeight: 120, overflow: 'hidden',
            // reserva o espaço antes do decode (evita CLS) quando há dimensões salvas
            aspectRatio: post.imageWidth && post.imageHeight ? `${post.imageWidth} / ${post.imageHeight}` : undefined,
          }}
        >
          <img
            src={post.image} alt={post.title} draggable={false} loading="lazy" decoding="async"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 440, objectFit: 'contain' }}
          />
          {/* coração do duplo-toque (transform/opacity, single-fire, off em reduced-motion) */}
          <AnimatePresence>
            {burst > 0 && (
              <motion.span
                key={burst}
                className="pointer-events-none absolute inset-0 grid place-items-center"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.18, 1, 1.08] }}
                transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1], times: [0, 0.3, 0.6, 1] }}
                onAnimationComplete={() => setBurst(0)}
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              >
                <Heart size={84} fill="#ffffff" color="#ffffff" strokeWidth={1.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* legenda: chip + título + resumo (abaixo da imagem, como post) */}
      <button
        type="button" onClick={onOpen}
        aria-label={`Abrir comunicado: ${post.title}`}
        className="block w-full text-left transition-transform active:scale-[0.99]"
        style={{ padding: hasImage ? '12px 14px 6px 18px' : '0 14px 6px 18px', background: 'transparent', color: fg }}
      >
        {chip}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: fg, lineHeight: 1.28, marginTop: 7, overflowWrap: 'anywhere' }}>
          {post.title}
        </h3>
        {post.message && (
          <p style={{
            fontSize: 13.5, lineHeight: 1.5, marginTop: 4, color: muted, overflowWrap: 'anywhere',
            display: '-webkit-box', WebkitLineClamp: hasImage ? 2 : (longText ? 3 : 6), WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.message}
          </p>
        )}
      </button>

      {/* rodapé: ciência leve (esq.) + ler/reler (dir.) */}
      <footer className="flex items-center justify-between" style={{ padding: '6px 12px 11px 16px', gap: 8 }}>
        {confirmed ? (
          <span
            className="inline-flex items-center gap-1.5"
            style={{ minHeight: 44, padding: '0 8px', fontSize: 12.5, fontWeight: 700, color: fg }}
            aria-label="Você confirmou a leitura"
          >
            <Heart size={17} fill={fg} color={fg} strokeWidth={2} /> Ciente
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); ackBurst() }}
            className="inline-flex items-center gap-1.5 transition-transform active:scale-95"
            style={{
              minHeight: 44, padding: '0 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 700,
              color: fg, background: soft, border: `1px solid ${line}`, cursor: 'pointer',
            }}
            aria-label="Confirmar leitura deste comunicado"
          >
            <Heart size={17} color={fg} strokeWidth={2} /> Confirmar leitura
          </button>
        )}
        <button
          type="button" onClick={onOpen}
          className="group inline-flex items-center gap-1 transition-transform active:scale-95"
          style={{ minHeight: 44, padding: '0 8px', fontSize: 12.5, fontWeight: 700, color: fg, opacity: 0.92, cursor: 'pointer', background: 'transparent', border: 'none' }}
          aria-label={confirmed ? 'Reler comunicado' : 'Ler comunicado completo'}
        >
          <BookOpen size={14} strokeWidth={2.2} /> {confirmed ? 'Reler' : 'Ler comunicado'}
        </button>
      </footer>
    </article>
  )
}
