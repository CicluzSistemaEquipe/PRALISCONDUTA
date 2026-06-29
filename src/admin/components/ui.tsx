import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, X, type LucideIcon } from 'lucide-react'

/* ============================================================
   Primitivos do Admin (Design System v1) — claros, reutilizáveis.
   Ver docs/ADMIN_DESIGN_SYSTEM.md
   ============================================================ */

export type Tone = 'orange' | 'green' | 'gold' | 'brown' | 'neutral'

const TONES: Record<Tone, { bg: string; fg: string }> = {
  orange: { bg: 'var(--accent-tint)', fg: '#f26b2a' },
  green: { bg: '#ecf7f0', fg: '#1e7e4e' },
  gold: { bg: 'rgba(184,134,11,0.12)', fg: '#b8860b' },
  brown: { bg: 'var(--brown-tint)', fg: '#5e3731' },
  neutral: { bg: 'var(--bg-muted)', fg: 'var(--text-secondary)' },
}

/* ---------- Count-up: número que anima suavemente (0 → alvo) ---------- */
function useCountUp(target: number, duration = 650) {
  const reduce = useReducedMotion()
  const [val, setVal] = useState(reduce ? target : 0)
  const raf = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (reduce) { setVal(target); return }
    let start: number | null = null
    const tick = (t: number) => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / duration)
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p) // easeOutExpo (mais refinado)
      setVal(Math.round(target * eased))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration, reduce])
  return val
}

/** Renderiza um valor numérico (ex.: "33%", "12") animando o número; passa texto não-numérico direto. */
export function AnimatedNumber({ value }: { value: string | number }) {
  const str = String(value)
  const m = str.match(/^(\D*)(\d+)(\D*)$/)
  const animated = useCountUp(m ? parseInt(m[2], 10) : 0)
  if (!m) return <>{str}</>
  return <>{m[1]}{animated}{m[3]}</>
}

/** KPI / métrica. Quando recebe `onClick`, vira um atalho clicável (drill-down). */
export function StatCard({
  icon: Icon,
  tone = 'orange',
  value,
  label,
  sub,
  loading,
  onClick,
  progress,
}: {
  icon: LucideIcon
  tone?: Tone
  value: ReactNode
  label: string
  sub?: string
  loading?: boolean
  onClick?: () => void
  progress?: number
}) {
  const t = TONES[tone]
  const animatable = typeof value === 'string' || typeof value === 'number'
  const base =
    'group relative w-full rounded-xl border border-[var(--border)] bg-white p-5 text-left transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]'
  const inner = (
    <>
      {onClick && (
        <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-[var(--text-muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}
      {progress != null ? (
        <div className="relative mb-4 h-11 w-11 transition-transform duration-200 group-hover:scale-[1.06]">
          <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="19" fill="none" stroke="var(--bg-inset)" strokeWidth="3.5" />
            <motion.circle
              cx="22" cy="22" r="19" fill="none" stroke={t.fg} strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 19}
              initial={{ strokeDashoffset: 2 * Math.PI * 19 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 19) * (1 - Math.min(Math.max(progress, 0), 100) / 100) }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-[18px] w-[18px]" style={{ color: t.fg }} strokeWidth={1.9} />
          </div>
        </div>
      ) : (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] transition-transform duration-200 group-hover:scale-[1.06]" style={{ background: t.bg }}>
          <Icon className="h-5 w-5" style={{ color: t.fg }} strokeWidth={1.9} />
        </div>
      )}
      <div className="adm-kpi-val">
        {loading ? <span className="text-[var(--text-disabled)]">—</span> : animatable ? <AnimatedNumber value={value as string | number} /> : value}
      </div>
      <div className="mt-1.5 text-[0.875rem] font-semibold text-[var(--ink)]">{label}</div>
      {sub && <div className="mt-0.5 text-[0.8125rem] text-[var(--text-muted)]">{sub}</div>}
    </>
  )
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label}: ${typeof value === 'string' || typeof value === 'number' ? value : ''} — ver detalhes`}
        className={`${base} cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:border-[var(--accent)] focus-visible:shadow-[0_0_0_3px_rgba(242,107,42,0.25)] focus-visible:outline-none`}
      >
        {inner}
      </button>
    )
  }
  return <div className={base}>{inner}</div>
}

/** Card de seção, com título marcado pelo acento laranja + ação opcional. */
export function SectionCard({
  title,
  action,
  children,
  className = '',
  bodyClassName = '',
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={`rounded-xl border border-[var(--border)] bg-white p-5 ${className}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-[3px] rounded-full bg-[var(--accent)]" />
          <h2 className="text-[0.95rem] font-semibold text-[var(--ink)]">{title}</h2>
        </div>
        {action}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

/** Estado vazio elegante. */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  compact,
}: {
  icon?: LucideIcon
  title: string
  hint?: string
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-center ${compact ? 'px-4 py-8' : 'px-6 py-12'}`}>
      {Icon && (
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-muted)]">
          <Icon className="h-[22px] w-[22px] text-[var(--text-muted)]" strokeWidth={1.6} />
        </div>
      )}
      <p className="text-[0.95rem] font-semibold text-[var(--ink)]">{title}</p>
      {hint && <p className="max-w-sm text-[0.8125rem] text-[var(--text-muted)]">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Skeleton de carregamento — shimmer premium (respeita prefers-reduced-motion via admin.css). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`adm-skel ${className}`} />
}

/* ---------- Avatar com iniciais (compartilhado por todas as telas) ---------- */
export function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export function Avatar({ name, size = 36, src }: { name: string; size?: number; src?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="shrink-0 rounded-lg object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--brand-brown)] font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </div>
  )
}

/* ---------- Modal (bottom-sheet no mobile, centralizado no desktop) ----------
   Fecha com ESC e move o foco para dentro ao abrir (acessibilidade). */
export function ModalShell({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  // Foco move-se para o modal SO na montagem. (Antes ficava em [onClose]: como o
  // onClose costuma ser uma arrow nova a cada render, o efeito re-rodava a cada
  // tecla e roubava o foco do input — impedindo digitar mais de 1 caractere.)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  // Listener de ESC separado: pode re-vincular sem mexer no foco.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Renderiza via PORTAL no <body> para escapar de qualquer contexto de
  // empilhamento de ancestrais (ex.: o modal de perfil aberto pela sidebar
  // ficava ATRAS da página — bug P15). z-index alto garante o topo.
  if (typeof document === 'undefined') return null
  return createPortal(
    <>
      <motion.div className="fixed inset-0 z-[100] bg-[rgba(26,23,20,0.45)]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div className="fixed inset-0 z-[101] flex items-end justify-center sm:items-center sm:p-4" onClick={onClose}>
        <motion.div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 28 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[92dvh] w-full max-w-[460px] overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-md)] outline-none sm:rounded-2xl"
        >
          {children}
        </motion.div>
      </div>
    </>,
    document.body,
  )
}

export function ModalHeader({ icon: Icon, eyebrow, title, onClose }: { icon: LucideIcon; eyebrow: string; title: string; onClose: () => void }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--accent-tint)]">
          <Icon className="h-5 w-5 text-[#f26b2a]" strokeWidth={1.9} />
        </div>
        <div>
          <p className="adm-eyebrow">{eyebrow}</p>
          <h2 className="mt-0.5 text-[1.15rem] font-semibold text-[var(--ink)]">{title}</h2>
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]">
        <X className="h-[18px] w-[18px]" />
      </button>
    </div>
  )
}
