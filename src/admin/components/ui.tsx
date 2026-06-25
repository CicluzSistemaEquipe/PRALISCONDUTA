import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

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

/** KPI / métrica. */
export function StatCard({
  icon: Icon,
  tone = 'orange',
  value,
  label,
  sub,
  loading,
}: {
  icon: LucideIcon
  tone?: Tone
  value: ReactNode
  label: string
  sub?: string
  loading?: boolean
}) {
  const t = TONES[tone]
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5 transition-shadow hover:shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px]" style={{ background: t.bg }}>
        <Icon className="h-5 w-5" style={{ color: t.fg }} strokeWidth={1.9} />
      </div>
      <div className="adm-kpi-val">
        {loading ? <span className="text-[var(--text-disabled)]">—</span> : value}
      </div>
      <div className="mt-1.5 text-[0.875rem] font-semibold text-[var(--ink)]">{label}</div>
      {sub && <div className="mt-0.5 text-[0.8125rem] text-[var(--text-muted)]">{sub}</div>}
    </div>
  )
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

/** Skeleton de carregamento. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[var(--bg-inset)] ${className}`} />
}
