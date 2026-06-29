import { motion } from 'framer-motion'
import { Check, ChevronRight, Lock } from 'lucide-react'
import type { Module } from '@/lib/types'
import { Icon } from './Icon'
import { useTheme } from '../context/ThemeContext'

export type ModuleStatus = 'locked' | 'active' | 'in-progress' | 'done'

interface ModuleCardProps {
  module: Module
  status: ModuleStatus
  progress: number
  onOpen: () => void
  /** marca este módulo como o "próximo passo" recomendado (glow + seta preenchida). */
  highlight?: boolean
  /** rótulo do card bloqueado: "Módulo bloqueado" (padrão) ou "Treinamento bloqueado". */
  lockedLabel?: string
}

const CARD_RADIUS = 16
const CARD_MIN_H = 92

export function ModuleCard({ module, status, progress, onOpen, highlight = false, lockedLabel }: ModuleCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const locked = status === 'locked'
  const done = status === 'done'
  const inProgress = status === 'in-progress'
  const pct = Math.round(progress * 100)
  const recommended = highlight && !locked && !done

  // ── BLOQUEADO: mostra o módulo real (nome + descrição) esmaecido, com cadeado
  //    e estado claro. SEM backdrop-blur (regra de performance do app).
  if (locked) {
    const titleColor = isLight ? '#5e3731' : '#fff6ea'
    const subColor = isLight ? 'rgba(94,55,49,0.72)' : 'rgba(255,246,234,0.66)'
    const stateLabel = lockedLabel ?? 'Módulo bloqueado'
    return (
      <div
        className="relative flex w-full items-center gap-3.5 overflow-hidden"
        style={{
          minHeight: 84,
          borderRadius: CARD_RADIUS,
          padding: 16,
          background: 'var(--bg-card)',
          border: `1.5px solid ${isLight ? 'rgba(94,55,49,0.14)' : 'rgba(255,255,255,0.10)'}`,
          opacity: 0.92,
        }}
      >
        <span aria-hidden="true" className="absolute left-0" style={{ top: 12, bottom: 12, width: 4, borderRadius: 999, background: module.accent, opacity: 0.4 }} />

        <span
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-surface-2)', border: `1px solid ${isLight ? 'rgba(94,55,49,0.18)' : 'rgba(255,255,255,0.12)'}` }}
        >
          <span style={{ opacity: 0.5, display: 'flex' }}><Icon name={module.icon} size={20} color={module.accent} /></span>
          <span
            className="absolute flex items-center justify-center"
            style={{ right: -4, bottom: -4, width: 20, height: 20, borderRadius: '50%', background: isLight ? '#efe7df' : '#2a1c17', border: `1px solid ${isLight ? 'rgba(94,55,49,0.2)' : 'rgba(255,255,255,0.18)'}` }}
          >
            <Lock size={11} color={titleColor} strokeWidth={2.6} />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-display" style={{ fontSize: 'clamp(15px, 4.4vw, 17px)', lineHeight: 1.18, color: titleColor }}>
            {module.title}
          </span>
          <span className="mt-1 block truncate font-body" style={{ fontSize: 'clamp(11px, 3.2vw, 12.5px)', color: subColor }}>
            {module.subtitle}
          </span>
          <span className="mt-1.5 inline-flex items-center gap-1 font-body font-bold" style={{ fontSize: 10, color: subColor, letterSpacing: '0.02em' }}>
            <Lock size={10} strokeWidth={2.6} /> {stateLabel} · conclua o anterior
          </span>
        </span>
      </div>
    )
  }

  const doneText = isLight ? '#12341e' : '#5dd87a'
  const doneSubtle = isLight ? '#225238' : 'rgba(93,216,122,0.75)'
  const doneSurface = isLight ? '#eaffe9' : 'rgba(93,216,122,0.12)'

  const stateLine = done
    ? `Concluído · ${module.estimatedMinutes} min`
    : recommended
      ? inProgress
        ? `${pct}% · continuar agora`
        : `Recomendado agora · ${module.estimatedMinutes} min`
      : inProgress
        ? `${pct}% · continuar`
        : `${module.subtitle} · ${module.estimatedMinutes} min`

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      onClick={onOpen}
      className="relative flex w-full items-center gap-3.5 overflow-hidden text-left"
      style={{
        minHeight: CARD_MIN_H,
        borderRadius: CARD_RADIUS,
        padding: 16,
        background: done ? doneSurface : 'var(--bg-card)',
        border: `1.5px solid ${done ? '#1f7a39' : recommended || inProgress ? module.accent : 'var(--stroke)'}`,
        boxShadow: recommended ? `0 0 0 1px ${module.accent}, 0 12px 30px -14px ${module.accent}` : 'none',
        transition: 'background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0"
        style={{ top: 12, bottom: 12, width: recommended ? 5 : 4, borderRadius: 999, background: done ? '#1f7a39' : module.accent }}
      />

      <span
        className="relative flex shrink-0 items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: done ? doneSurface : recommended ? `color-mix(in srgb, ${module.accent} 16%, transparent)` : 'var(--bg-surface-2)',
          border: `1px solid ${done ? (isLight ? '#1f7a39' : '#5dd87a') : module.accent}`,
        }}
      >
        <Icon name={module.icon} size={20} color={done ? (isLight ? '#1f7a39' : '#5dd87a') : module.accent} />
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="block font-display" style={{ fontSize: 'clamp(15px, 4.4vw, 17px)', lineHeight: 1.18, color: done ? doneText : 'var(--text-primary)' }}>
          {module.title}
        </span>
        <span
          className="mt-1 block font-body"
          style={{ fontSize: 'clamp(11px, 3.2vw, 12.5px)', fontWeight: recommended ? 700 : 400, color: done ? doneSubtle : recommended ? module.accent : 'var(--text-secondary)' }}
        >
          {stateLine}
        </span>
        {inProgress && (
          <span className="mt-2 block overflow-hidden rounded-full" style={{ height: 4, background: 'var(--stroke-soft)' }}>
            <motion.span
              className="block h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.45 }}
              style={{ background: module.accent }}
            />
          </span>
        )}
      </span>

      <span className="relative shrink-0">
        {done ? (
          <span className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: '50%', background: doneSurface, border: `2px solid ${isLight ? '#1f7a39' : '#5dd87a'}` }}>
            <Check size={18} color={isLight ? '#1f7a39' : '#5dd87a'} strokeWidth={3} />
          </span>
        ) : recommended ? (
          <span className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: '50%', background: module.accent }}>
            <ChevronRight size={18} color="#fff" strokeWidth={2.6} />
          </span>
        ) : (
          <ChevronRight size={18} color="var(--text-secondary)" />
        )}
      </span>
    </motion.button>
  )
}
