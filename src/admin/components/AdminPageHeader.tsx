import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'

/** Cabeçalho padrão das páginas do admin (eyebrow + título + ação opcional). */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-7 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <span className="adm-eyebrow">{eyebrow}</span>
        <h1 className="adm-h1 mt-1.5 text-[clamp(1.5rem,3vw,2.1rem)]">{title}</h1>
        {description && <p className="mt-1.5 max-w-[60ch] text-sm text-[var(--text-muted)]">{description}</p>}
      </div>
      {action}
    </motion.header>
  )
}

/** Placeholder visual para seções ainda não construídas. */
export function AdminPlaceholder({ note }: { note: string }) {
  return (
    <div className="adm-card flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-muted)]">
        <Wrench className="h-[22px] w-[22px] text-[var(--text-muted)]" strokeWidth={1.6} />
      </div>
      <p className="text-sm text-[var(--text-muted)]">{note}</p>
    </div>
  )
}
