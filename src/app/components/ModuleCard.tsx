import { motion } from 'framer-motion'
import { Check, Lock, ChevronRight } from 'lucide-react'
import type { Module } from '@/lib/types'
import { Icon } from './Icon'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { useTheme } from '../context/ThemeContext'

export type ModuleStatus = 'locked' | 'active' | 'in-progress' | 'done'

interface ModuleCardProps {
  module: Module
  status: ModuleStatus
  /** 0..1 */
  progress: number
  onOpen: () => void
}

/**
 * Item de lista compacto (88px) — estilo Notion/Linear. A cor do módulo
 * aparece só no detalhe: barra de acento à esquerda + ícone.
 */
export function ModuleCard({ module, status, progress, onOpen }: ModuleCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const locked = status === 'locked'
  const done = status === 'done'
  const inProgress = status === 'in-progress'
  const pct = Math.round(progress * 100)

  // superfícies por estado/tema (done usa verde, igual em ambos)
  const bg = locked
    ? isLight
      ? 'rgba(94,55,49,0.04)'
      : 'rgba(255,255,255,0.03)'
    : done
      ? 'linear-gradient(135deg, rgba(74,222,128,0.16) 0%, rgba(74,222,128,0.07) 100%)'
      : inProgress
        ? isLight
          ? `linear-gradient(135deg, ${module.accent}1f 0%, rgba(255,248,235,0.85) 100%)`
          : `linear-gradient(135deg, ${module.accent}25 0%, rgba(255,245,220,0.07) 100%)`
        : isLight
          ? 'rgba(94,55,49,0.06)'
          : 'rgba(255,245,220,0.09)'

  const borderColor = locked
    ? isLight
      ? 'rgba(94,55,49,0.10)'
      : 'rgba(255,255,255,0.06)'
    : done
      ? 'rgba(74,222,128,0.38)'
      : inProgress
        ? `${module.accent}60`
        : isLight
          ? 'rgba(184,134,11,0.25)'
          : 'rgba(255,245,220,0.16)'

  const boxShadow = locked
    ? 'none'
    : done
      ? isLight
        ? '0 0 24px rgba(74,222,128,0.10), 0 4px 18px rgba(94,55,49,0.10)'
        : '0 0 32px rgba(74,222,128,0.14), 0 6px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(74,222,128,0.12)'
      : inProgress
        ? isLight
          ? `0 0 22px ${module.accent}1f, 0 4px 18px rgba(94,55,49,0.10)`
          : `0 0 28px ${module.accent}25, 0 6px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.09)`
        : isLight
          ? 'var(--shadow-card)'
          : '0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)'

  const titleColor = locked
    ? isLight
      ? 'rgba(94,55,49,0.45)'
      : 'rgba(255,255,255,0.38)'
    : isLight
      ? 'var(--text-primary)'
      : '#fff'

  const subtitleColor = locked
    ? isLight
      ? 'rgba(94,55,49,0.35)'
      : 'rgba(255,255,255,0.25)'
    : isLight
      ? 'var(--text-secondary)'
      : 'rgba(232,207,160,0.72)'

  const chevronColor = isLight ? 'rgba(94,55,49,0.45)' : 'rgba(255,255,255,0.50)'
  const lockColor = isLight ? 'rgba(94,55,49,0.30)' : 'rgba(255,255,255,0.20)'

  return (
    <motion.button
      whileTap={locked ? undefined : { scale: 0.98, opacity: 0.9 }}
      whileHover={locked ? undefined : { scale: 1.015, y: -1 }}
      disabled={locked}
      onClick={onOpen}
      className="relative flex w-full items-center gap-3.5 overflow-hidden text-left"
      style={{
        height: 96,
        borderRadius: 18,
        padding: '0 16px',
        opacity: locked ? 0.5 : 1,
        background: bg,
        border: `1px solid ${borderColor}`,
        boxShadow,
        backdropFilter: locked ? undefined : 'blur(24px)',
        WebkitBackdropFilter: locked ? undefined : 'blur(24px)',
        transition: 'box-shadow 0.2s, background 0.2s',
      }}
    >
      {/* watermark do símbolo da marca */}
      <img
        src={brand.simboloPar}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -8,
          right: -8,
          width: 64,
          height: 'auto',
          opacity: locked ? (isLight ? 0.05 : 0.03) : done ? 0.12 : isLight ? 0.07 : 0.09,
          pointerEvents: 'none',
          filter: isLight ? 'brightness(0) saturate(100%) opacity(0.55)' : FILTER_WHITE,
        }}
      />

      {/* barra de acento esquerda (pulsa quando em andamento) */}
      <motion.span
        className="absolute left-0"
        style={{
          top: 12,
          bottom: 12,
          width: 4,
          borderRadius: 999,
          background: locked ? (isLight ? 'rgba(94,55,49,0.18)' : 'rgba(255,255,255,0.12)') : done ? '#4ade80' : module.accent,
          opacity: locked ? 0.25 : 1,
        }}
        animate={
          inProgress
            ? { boxShadow: [`0 0 6px ${module.accent}60`, `0 0 14px ${module.accent}90`, `0 0 6px ${module.accent}60`] }
            : { boxShadow: locked || done ? '0 0 0 rgba(0,0,0,0)' : `0 0 10px 2px ${module.accent}60` }
        }
        transition={inProgress ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      />

      {/* ícone do módulo */}
      <span
        className="flex shrink-0 items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          background: locked
            ? isLight
              ? 'rgba(94,55,49,0.06)'
              : 'rgba(255,255,255,0.04)'
            : done
              ? 'rgba(74,222,128,0.15)'
              : `${module.accent}25`,
          border: locked
            ? isLight
              ? '1px solid rgba(94,55,49,0.12)'
              : '1px solid rgba(255,255,255,0.06)'
            : done
              ? '1px solid rgba(74,222,128,0.25)'
              : `1px solid ${module.accent}40`,
          boxShadow: locked ? 'none' : done ? '0 0 12px rgba(74,222,128,0.12)' : `0 0 12px ${module.accent}25`,
        }}
      >
        <Icon name={module.icon} size={20} color={locked ? lockColor : done ? '#4ade80' : module.accent} />
      </span>

      {/* texto */}
      <span className="min-w-0 flex-1">
        <span
          className="block truncate font-display"
          style={{ fontSize: 16, lineHeight: 1.2, color: titleColor }}
        >
          {module.title}
        </span>
        <span
          className="mt-1 block font-body"
          style={{ fontSize: 12, color: subtitleColor }}
        >
          {locked
            ? 'Complete o anterior primeiro'
            : done
              ? `✓ Concluído · ${module.estimatedMinutes} min`
              : inProgress
                ? `${pct}% · continuar`
                : `${module.subtitle} · ${module.estimatedMinutes} min`}
        </span>
        {inProgress && (
          <span className="mt-2 block overflow-hidden rounded-full" style={{ height: 3, background: isLight ? 'rgba(94,55,49,0.12)' : 'rgba(255,255,255,0.10)' }}>
            <motion.span
              className="block h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              style={{ background: `linear-gradient(90deg, ${module.accent}, #f37435)`, boxShadow: `0 0 6px ${module.accent}80` }}
            />
          </span>
        )}
      </span>

      {/* status à direita */}
      <span className="shrink-0">
        {done ? (
          <span
            className="flex items-center justify-center"
            style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(74,222,128,0.18)', border: '1px solid rgba(74,222,128,0.40)', boxShadow: '0 0 12px rgba(74,222,128,0.20)' }}
          >
            <Check size={16} color="#4ade80" />
          </span>
        ) : locked ? (
          <Lock size={14} color={lockColor} />
        ) : (
          <ChevronRight size={18} color={chevronColor} />
        )}
      </span>
    </motion.button>
  )
}
