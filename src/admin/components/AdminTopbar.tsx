import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CalendarDays } from 'lucide-react'
import { getAdminSession } from '../auth'

function greetingFor(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Barra superior (desktop): saudação personalizada + data/hora ao vivo + notificações. */
export function AdminTopbar() {
  const [bellOpen, setBellOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // a11y: ESC fecha o dropdown de notificações
  useEffect(() => {
    if (!bellOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setBellOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [bellOpen])

  const firstName = (getAdminSession()?.nome ?? 'Administrador').trim().split(/\s+/)[0]
  const hi = greetingFor(now.getHours())
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-[var(--border)] bg-white/85 px-9 backdrop-blur md:flex">
      <motion.p
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-[0.95rem] text-[var(--text-secondary)]"
      >
        {hi}, <strong className="font-semibold text-[var(--ink)]">{firstName}</strong> <span className="ml-0.5">👋</span>
      </motion.p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[0.8125rem] text-[var(--text-muted)]">
          <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
          <span className="capitalize">{dateStr}</span>
          <span className="text-[var(--border-strong)]">·</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{timeStr}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setBellOpen((v) => !v)}
            aria-label="Notificações"
            aria-expanded={bellOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>

          <AnimatePresence>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} aria-hidden="true" />
                <motion.div
                  role="dialog"
                  aria-label="Notificações"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
                  className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-md)]"
                >
                  <div className="border-b border-[var(--border)] px-4 py-3">
                    <p className="text-[0.8125rem] font-semibold text-[var(--ink)]">Notificações</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
                    <Bell className="mb-1 h-6 w-6 text-[var(--text-disabled)]" strokeWidth={1.6} />
                    <p className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">Nenhuma notificação ainda</p>
                    <p className="text-[0.75rem] text-[var(--text-muted)]">Avisos sobre colaboradores e progresso aparecem aqui.</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
