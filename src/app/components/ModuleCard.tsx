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
}

export function ModuleCard({ module, status, progress, onOpen, highlight = false }: ModuleCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const locked = status === 'locked'
  const done = status === 'done'
  const inProgress = status === 'in-progress'
  const pct = Math.round(progress * 100)
  const recommended = highlight && !locked && !done

  const doneText = isLight ? '#12341e' : '#5dd87a'
  const doneSubtle = isLight ? '#225238' : 'rgba(93,216,122,0.75)'
  const doneSurface = isLight ? '#eaffe9' : 'rgba(93,216,122,0.12)'

  // linha de estado (lida sem precisar interpretar texto longo)
  const stateLine = locked
    ? 'Conclua o anterior primeiro'
    : done
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
      whileTap={locked ? undefined : { scale: 0.98 }}
      whileHover={locked ? undefined : { y: -1 }}
      disabled={locked}
      onClick={onOpen}
      className="relative flex w-full items-center gap-3.5 overflow-hidden text-left"
      style={{
        minHeight: 96,
        borderRadius: 16,
        padding: '16px',
        opacity: locked ? 0.58 : 1,
        background: done ? doneSurface : 'var(--bg-card)',
        border: `1.5px solid ${done ? '#1f7a39' : recommended || inProgress ? module.accent : 'var(--stroke)'}`,
        boxShadow: recommended ? `0 0 0 1px ${module.accent}, 0 12px 30px -14px ${module.accent}` : 'none',
        transition: 'background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0"
        style={{
          top: 12,
          bottom: 12,
          width: recommended ? 5 : 4,
          borderRadius: 999,
          background: locked ? 'var(--stroke)' : done ? '#1f7a39' : module.accent,
        }}
      />

      <span
        className="relative flex shrink-0 items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: done
            ? doneSurface
            : recommended
              ? `color-mix(in srgb, ${module.accent} 16%, transparent)`
              : 'var(--bg-surface-2)',
          border: `1px solid ${done ? (isLight ? '#1f7a39' : '#5dd87a') : locked ? 'var(--stroke)' : module.accent}`,
        }}
      >
        <Icon name={module.icon} size={20} color={locked ? 'var(--text-locked)' : done ? (isLight ? '#1f7a39' : '#5dd87a') : module.accent} />
      </span>

      <span className="relative min-w-0 flex-1">
        <span
          className="block font-display"
          style={{
            fontSize: 'clamp(15px, 4.4vw, 17px)',
            lineHeight: 1.18,
            color: locked ? 'var(--text-locked)' : done ? doneText : 'var(--text-primary)',
          }}
        >
          {module.title}
        </span>
        <span
          className="mt-1 block font-body"
          style={{
            fontSize: 'clamp(11px, 3.2vw, 12.5px)',
            fontWeight: recommended ? 700 : 400,
            color: locked ? 'var(--text-locked)' : done ? doneSubtle : recommended ? module.accent : 'var(--text-secondary)',
          }}
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
          <span
            className="flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: doneSurface,
              border: `2px solid ${isLight ? '#1f7a39' : '#5dd87a'}`,
            }}
          >
            <Check size={18} color={isLight ? '#1f7a39' : '#5dd87a'} strokeWidth={3} />
          </span>
        ) : locked ? (
          <Lock size={15} color="var(--text-locked)" />
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
