import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { modulesForRole } from '@/lib/content'
import type { Module } from '@/lib/types'
import { useSession } from '../context/SessionContext'
import { getSignature } from '@/lib/storage'
import { ModuleIcon } from '../components/ModuleIcon'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'
import { useTheme } from '../context/ThemeContext'

export default function ProgressScreen() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { employee, progress } = useSession()
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    if (employee) getSignature(employee.id).then((s) => setSigned(Boolean(s)))
  }, [employee, progress])

  const mods = useMemo(() => (employee ? modulesForRole(employee.role) : []), [employee])
  const isDone = (m: Module) => (m.kind === 'signature' ? signed : Boolean(progress[m.id]?.completed))
  const completed = mods.filter(isDone).length
  const total = mods.length
  const pct = total ? Math.round((completed / total) * 100) : 0

  // ring
  const SIZE = 168
  const STROKE = 10
  const R = (SIZE - STROKE * 2) / 2
  const C = 2 * Math.PI * R
  const offset = C - (pct / 100) * C

  if (!employee) return null

  return (
    <div className="app-shell">
      <AnimatedBackground />
      <main className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-28 pt-12">
        <h1
          className="text-center font-display text-3xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Seu progresso
        </h1>

        {/* ring global */}
        <div className="relative mx-auto mt-8 flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="absolute">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke="var(--stroke-soft)"
              strokeWidth={STROKE}
              fill="none"
            />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke="#f37435"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="text-center">
            <p
              className="font-display text-4xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {completed}
            </p>
            <p
              className="-mt-1 font-body text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              de {total} módulos
            </p>
          </div>
        </div>

        {/* grade de módulos */}
        <div className="mt-10 grid grid-cols-4 gap-3">
          {mods.map((m, i) => {
            const done = isDone(m)
            const started = (progress[m.id]?.story_index ?? 0) > 0
            return (
              <motion.button
                key={m.id}
                onClick={() => navigate('/feed')}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.04, type: 'spring', stiffness: 260, damping: 18 }}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl"
                style={{
                  background: done
                    ? isLight ? '#effff3' : '#31543a'
                    : started
                      ? 'var(--bg-card)'
                      : 'var(--bg-surface-2)',
                  border: `1px solid ${done ? 'var(--green)' : started ? m.accent : 'var(--stroke)'}`,
                }}
                aria-label={m.title}
              >
                <ModuleIcon
                  type={m.iconType}
                  size={26}
                  color={
                    done
                      ? '#4ade80'
                      : started
                        ? m.accent
                        : 'var(--text-locked)'
                  }
                />
                {done ? (
                  <Check size={12} color="#4ade80" />
                ) : !started ? (
                  <Lock size={11} color="var(--text-locked)" />
                ) : (
                  <span
                    className="font-body"
                    style={{ fontSize: 9, color: 'var(--text-secondary)' }}
                  >
                    {m.number}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        <p
          className="mt-10 text-center font-body text-base italic"
          style={{ color: 'var(--text-secondary)' }}
        >
          {pct >= 100
            ? 'Você concluiu tudo! Que orgulho. 🌾'
            : pct >= 50
              ? 'Você já passou da metade. Bora terminar!'
              : 'Cada passo conta. Continue firme! 💪'}
        </p>
      </main>

      <BottomNav active="progress" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}
