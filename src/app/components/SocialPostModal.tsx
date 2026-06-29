import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X, Pin, Check, CheckCheck } from 'lucide-react'
import type { SocialPost } from '@/lib/types'
import { presetFor } from '@/lib/socialPresets'
import { initials, roleLabel, formatDateTime } from '@/lib/socialFormat'

/**
 * Popup de leitura de um comunicado. Imersivo (usa a cor escolhida no admin),
 * responsivo e acessivel: role=dialog, ESC fecha, foco inicial no fechar,
 * clique no fundo fecha, scroll do body travado. O "Li e estou ciente" vive aqui.
 */
export function SocialPostModal({
  post, confirmed = false, onAck, onClose, authorAvatar,
}: {
  post: SocialPost
  confirmed?: boolean
  onAck?: () => void
  onClose: () => void
  authorAvatar?: string
}) {
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const preset = presetFor(post.type)
  const cardBg = post.cardColor ?? preset.card
  const textColor = post.textColor ?? preset.text
  const accent = preset.accent
  const muted = textColor + 'b3'

  // ESC fecha + trava o scroll do body + foco inicial
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(8,5,2,0.66)', backdropFilter: 'blur(7px)', WebkitBackdropFilter: 'blur(7px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="spm-title"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="no-scrollbar flex w-full max-w-[460px] flex-col overflow-y-auto"
        style={{
          background: cardBg, color: textColor,
          maxHeight: '88vh',
          borderRadius: '24px 24px 0 0',
          border: `1px solid ${accent}3d`,
          boxShadow: '0 -10px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* faixa de acento no topo */}
        <div aria-hidden style={{ height: 4, background: accent, flex: 'none' }} />

        {/* cabecalho: autor + fechar */}
        <div className="flex items-center gap-3" style={{ padding: '16px 18px 10px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flex: 'none', overflow: 'hidden',
            display: 'grid', placeItems: 'center', background: accent + '33',
            border: `1.5px solid ${accent}66`, color: textColor, fontWeight: 800, fontSize: 15,
          }}>
            {authorAvatar
              ? <img src={authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(post.created_by_name ?? 'Pralis')}
          </div>
          <div className="min-w-0 flex-1">
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }} className="truncate">
              {post.created_by_name ?? 'Pralis'}
            </div>
            <div style={{ fontSize: 12.5, color: muted }}>
              {roleLabel(post)} · {formatDateTime(post.published_at ?? post.created_at)}
            </div>
          </div>
          <button
            ref={closeRef} onClick={onClose} aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{ background: textColor + '14', color: textColor }}
          >
            <X size={18} />
          </button>
        </div>

        {/* chip de tipo + fixado */}
        <div className="flex items-center gap-2" style={{ padding: '0 18px 10px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: accent,
            background: accent + '22', border: `1px solid ${accent}55`, borderRadius: 999, padding: '3px 10px',
          }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: accent }} />
            {preset.label}
          </span>
          {post.pinned && (
            <span className="inline-flex items-center gap-1" style={{ fontSize: 11.5, fontWeight: 600, color: muted }}>
              <Pin size={13} /> Fixado
            </span>
          )}
        </div>

        {/* titulo + mensagem completa */}
        <div style={{ padding: '0 18px' }}>
          <h2 id="spm-title" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}>{post.title}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.62, marginTop: 8, color: muted, whiteSpace: 'pre-wrap' }}>
            {post.message}
          </p>
        </div>

        {/* imagem opcional */}
        {post.image && (
          <div style={{ marginTop: 14, background: 'rgba(0,0,0,0.3)' }}>
            <img src={post.image} alt={post.title}
              style={{ display: 'block', width: '100%', maxHeight: '52vh', objectFit: 'contain' }} />
          </div>
        )}

        {/* rodape: confirmacao de leitura (fica grudado embaixo) */}
        <div style={{ padding: '14px 18px calc(16px + var(--safe-bottom, 0px))', marginTop: 'auto' }}>
          {confirmed ? (
            <div className="flex items-center justify-center gap-2"
              style={{ fontSize: 14, fontWeight: 700, color: accent, background: accent + '1f', borderRadius: 14, padding: '13px' }}>
              <CheckCheck size={18} strokeWidth={2.4} /> Você confirmou a leitura
            </div>
          ) : (
            <button onClick={onAck} className="flex w-full items-center justify-center gap-2"
              style={{
                fontSize: 14.5, fontWeight: 700, color: '#1a0e00', border: 'none', cursor: 'pointer',
                borderRadius: 14, padding: '14px',
                background: 'linear-gradient(110deg,#f8936a,#f37435 45%,#d4a017)',
              }}>
              <Check size={18} strokeWidth={2.6} /> Li e estou ciente
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
