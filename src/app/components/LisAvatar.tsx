import { motion, type TargetAndTransition } from 'framer-motion'
import type { LisState } from '@/lib/types'
import lisFull from '@/assets/lis/lis-full.png'
import lisBust from '@/assets/lis/lis-bust.png'

interface LisAvatarProps {
  state?: LisState
  size?: number
  className?: string
}

const RING: Record<LisState, string> = {
  neutral: 'rgba(184,134,11,0.2)',
  idle: 'rgba(184,134,11,0.2)',
  talking: 'rgba(184,134,11,0.2)',
  celebrating: 'rgba(93,216,122,0.25)',
  thinking: 'rgba(212,160,23,0.2)',
  correct: 'rgba(93,216,122,0.25)',
  wrong: 'rgba(243,116,53,0.25)',
  alert: 'rgba(243,116,53,0.25)',
}

/**
 * Lis — mascote da Pralís. Renderiza o avatar animado (Framer Motion + PNG).
 *
 * NOTA (perf RC1): a animação Rive foi desativada enquanto `/lis.riv` não
 * existe. Antes, o runtime do Rive (@rive-app, ~171KB) era carregado e caía
 * SEMPRE neste fallback, sem renderizar nada — peso morto puro. O resultado
 * visual é idêntico ao de hoje. Para reativar quando o asset chegar, restaurar
 * o uso de `useRive`/`useStateMachineInput` (ver histórico do git).
 */
export function LisAvatar({ state = 'idle', size = 56, className }: LisAvatarProps) {
  return <LisFallback state={state} size={size} className={className} />
}

function LisFallback({ state = 'idle', size = 56, className }: LisAvatarProps) {
  const ring = RING[state ?? 'idle']

  // Para tamanhos grandes (≥80px) → usa PNG real da Lis
  if (size >= 80) {
    const anim: TargetAndTransition =
      state === 'celebrating' || state === 'correct'
        ? { y: [0, -10, 0, -6, 0], scale: [1, 1.05, 1] }
        : state === 'wrong' || state === 'alert'
          ? { x: [0, -8, 8, -6, 6, 0] }
          : state === 'talking'
            ? { y: [0, -4, 0] }
            : { y: [0, -3, 0] }

    const transition =
      state === 'talking'
        ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' as const }
        : state === 'idle' || state === 'neutral'
          ? { repeat: Infinity, duration: 3.5, ease: 'easeInOut' as const }
          : { duration: 0.5, ease: 'easeOut' as const }

    return (
      <motion.div
        className={`shrink-0 ${className ?? ''}`}
        style={{ width: size, height: size * 2.09, position: 'relative' }}
        animate={anim}
        transition={transition}
        aria-label={`Lis (${state})`}
      >
        {/* halo dourado por baixo */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: size * 0.8, height: size * 0.15, borderRadius: '50%',
          background: ring,
          opacity: 0.4,
          filter: 'blur(8px)',
        }} />
        <img
          src={lisFull}
          alt="Lis"
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', position: 'relative' }}
        />
      </motion.div>
    )
  }

  // Para tamanhos pequenos (<80px) → busto circular com PNG
  const bustAnim: TargetAndTransition =
    state === 'talking'
      ? { scale: [1, 1.06, 1] }
      : state === 'celebrating' || state === 'correct'
        ? { scale: [1, 1.15, 0.95, 1.1, 1], rotate: [0, -5, 5, -3, 0] }
        : state === 'wrong' || state === 'alert'
          ? { x: [0, -6, 6, -4, 4, 0] }
          : { scale: [1, 1.02, 1] }

  const bustTransition =
    state === 'idle' || state === 'neutral' || state === 'talking'
      ? { repeat: Infinity, duration: state === 'talking' ? 1.4 : 3, ease: 'easeInOut' as const }
      : { duration: 0.5, ease: 'easeOut' as const }

  return (
    <motion.div
      className={`shrink-0 overflow-hidden rounded-full ${className ?? ''}`}
      style={{
        width: size, height: size,
        background: 'rgba(184,134,11,0.28)',
        border: `2px solid ${ring}`,
        boxShadow: `0 0 0 3px ${ring}, 0 0 20px rgba(184,134,11,0.25)`,
      }}
      animate={bustAnim}
      transition={bustTransition}
      aria-label={`Lis (${state})`}
    >
      <img src={lisBust} alt="Lis" style={{ width: '110%', height: '110%', objectFit: 'cover', objectPosition: 'center 10%', marginLeft: '-5%' }} />
    </motion.div>
  )
}
