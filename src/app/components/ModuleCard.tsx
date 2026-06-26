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

const CARD_RADIUS = 16
const CARD_MIN_H = 92

export function ModuleCard({ module, status, progress, onOpen, highlight = false }: ModuleCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const locked = status === 'locked'
  const done = status === 'done'
  const inProgress = status === 'in-progress'
  const pct = Math.round(progress * 100)
  const recommended = highlight && !locked && !done

  // ── BLOQUEADO: mistério — cadeado grande + conteúdo embaçado (efeito glass).
  //    Não revela o que é o módulo; só aparece quando desbloquear.
  if (locked) {
    return (
      <div
        className="relative flex w-full items-center overflow-hidden"
        style={{
          minHeight: CARD_MIN_H,
          borderRadius: CARD_RADIUS,
          padding: 16,
          background: isLight ? 'rgba(94,55,49,0.05)' : 'rgba(255,255,255,0.04)',
          border: `1.5px dashed ${isLight ? 'rgba(94,55,49,0.20)' : 'rgba(255,255,255,0.14)'}`,
        }}
      >
        {/* conteúdo real, mas borrado e esmaecido (não dá pra ler) */}
        <div className="flex items-center gap-3.5" style={{ filter: 'blur(7px)', opacity: 0.42, pointerEvents: 'none', userSelect: 'none' }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-surface-2)', border: '1px solid var(--stroke)', flexShrink: 0 }} />
          <span>
            <span className="block font-display" style={{ fontSize: 16, color: 'var(--text-primary)' }}>{module.title}</span>
            <span className="mt-1 block font-body" style={{ fontSize: 12 }}>{module.subtitle}</span>
          </span>
        </div>

        {/* camada glass + cadeado grande, centralizado */}
        <div className="absolute inset-0 flex items-center gap-3 px-4" style={{ background: isLight ? 'rgba(247,242,236,0.30)' : 'rgba(21,9,0,0.30)' }}>
          <span
            className="flex shrink-0 items-center justify-center"
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: isLight ? 'rgba(94,55,49,0.10)' : 'rgba(255,255,255,0.08)',
              border: `1.5px solid ${isLight ? 'rgba(94,55,49,0.22)' : 'rgba(255,255,255,0.18)'}`,
            }}
          >
            <Lock size={22} color="var(--text-secondary)" strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <span className="block font-display" style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Bloqueado</span>
            <span className="mt-0.5 block font-body" style={{ fontSize: 12, color: 'var(--text-locked, var(--text-secondary))', opacity: 0.85 }}>
              Conclua o módulo anterior para abrir
            </span>
          </span>
        </div>
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
