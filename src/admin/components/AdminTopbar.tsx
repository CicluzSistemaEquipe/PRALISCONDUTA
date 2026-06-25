import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  colaboradores: 'Colaboradores',
  gerentes: 'Gerentes',
  modulos: 'Módulos',
  termos: 'Termos',
  relatorios: 'Relatórios',
  inicio: 'Início',
}

function useSection() {
  const { pathname } = useLocation()
  const seg = pathname.split('/').filter(Boolean)[1] ?? 'dashboard'
  return SECTION_LABELS[seg] ?? 'Painel'
}

/** Barra superior enxuta (desktop): contexto da seção + notificações. */
export function AdminTopbar() {
  const section = useSection()
  const [bellOpen, setBellOpen] = useState(false)

  return (
    <div className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-[var(--border)] bg-white/85 px-9 backdrop-blur md:flex">
      <nav aria-label="Você está em" className="flex items-center gap-2 text-[0.8125rem]">
        <span className="font-medium text-[var(--text-muted)]">Painel</span>
        <span className="text-[var(--border-strong)]">/</span>
        <span className="font-semibold text-[var(--ink)]">{section}</span>
      </nav>

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
                  <p className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">
                    Nenhuma notificação ainda
                  </p>
                  <p className="text-[0.75rem] text-[var(--text-muted)]">
                    Avisos sobre colaboradores e progresso aparecem aqui.
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
