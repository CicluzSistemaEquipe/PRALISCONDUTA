import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

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
        {description && <p className="mt-1.5 max-w-[60ch] text-sm text-[var(--cream-muted)]">{description}</p>}
      </div>
      {action}
    </motion.header>
  )
}

/** Placeholder visual para seções ainda não construídas. */
export function AdminPlaceholder({ note }: { note: string }) {
  return (
    <div className="adm-card flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <span className="text-2xl">🚧</span>
      <p className="text-sm text-[var(--cream-muted)]">{note}</p>
    </div>
  )
}
