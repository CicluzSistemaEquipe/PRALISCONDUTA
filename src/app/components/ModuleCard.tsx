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
}

export function ModuleCard({ module, status, progress, onOpen }: ModuleCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const locked = status === 'locked'
  const done = status === 'done'
  const inProgress = status === 'in-progress'
  const pct = Math.round(progress * 100)

  const doneText = isLight ? '#12341e' : '#5dd87a'
  const doneSubtle = isLight ? '#225238' : 'rgba(93,216,122,0.75)'
  const doneSurface = isLight ? '#eaffe9' : 'rgba(93,216,122,0.12)'

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
        border: `1.5px solid ${done ? '#1f7a39' : inProgress ? module.accent : 'var(--stroke)'}`,
        boxShadow: 'none',
        transition: 'background 0.18s, border-color 0.18s, transform 0.18s',
      }}
    >
      {!locked && !done && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(110deg, transparent 0%, transparent 38%, rgba(243,116,53,0.16) 48%, rgba(184,134,11,0.18) 58%, transparent 70%)',
            backgroundSize: '220% 100%',
          }}
          animate={{ backgroundPosition: ['140% 0%', '-80% 0%'] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <span
        aria-hidden="true"
        className="absolute left-0"
        style={{
          top: 12,
          bottom: 12,
          width: 4,
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
          background: done ? doneSurface : 'var(--bg-surface-2)',
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
            color: locked ? 'var(--text-locked)' : done ? doneSubtle : 'var(--text-secondary)',
          }}
        >
          {locked
            ? 'Complete o anterior primeiro'
            : done
              ? `Concluído · ${module.estimatedMinutes} min`
              : inProgress
                ? `${pct}% · continuar`
                : `${module.subtitle} · ${module.estimatedMinutes} min`}
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
        ) : (
          <ChevronRight size={18} color="var(--text-secondary)" />
        )}
      </span>
    </motion.button>
  )
}
