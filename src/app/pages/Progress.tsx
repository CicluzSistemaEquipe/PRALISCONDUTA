import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Lock, ChevronRight, PlayCircle } from 'lucide-react'
import { modulesForRole } from '@/lib/content'
import type { Module } from '@/lib/types'
import { useSession } from '../context/SessionContext'
import { getSignature } from '@/lib/storage'
import { ModuleIcon } from '../components/ModuleIcon'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'

export default function ProgressScreen() {
  const navigate = useNavigate()
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
  const SIZE = 120
  const STROKE = 9
  const R = (SIZE - STROKE * 2) / 2
  const C = 2 * Math.PI * R
  const offset = C - (pct / 100) * C

  const motivational = pct >= 100
    ? 'Você concluiu tudo! Que orgulho. 🌾'
    : pct >= 50
      ? 'Você já passou da metade. Bora terminar!'
      : 'Cada passo conta. Continue firme! 💪'

  if (!employee) return null

  return (
    <div className="app-shell">
      <AnimatedBackground accent="#b8860b" />

      <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-4 pb-28 pt-8">

        {/* ── cabeçalho ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 text-center"
        >
          <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>
            Seu progresso
          </h1>
          <p className="mt-1 font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
            {employee.name} · {employee.role}
          </p>
        </motion.div>

        {/* ── card de resumo ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="mb-5 flex items-center gap-5 px-5 py-5"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--stroke)',
            borderRadius: 24,
          }}
        >
          {/* ring */}
          <div className="relative flex shrink-0 items-center justify-center" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} className="absolute">
              <circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} fill="none" />
              <motion.circle
                cx={SIZE / 2} cy={SIZE / 2} r={R}
                stroke={pct >= 100 ? '#4ade80' : '#f37435'}
                strokeWidth={STROKE}
                fill="none"
                strokeLinecap="round"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="text-center">
              <p className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>{pct}%</p>
              <p className="font-body" style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: -2 }}>concluído</p>
            </div>
          </div>

          {/* stats */}
          <div className="flex flex-1 flex-col gap-3">
            <div>
              <p className="font-display text-2xl" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>
                {completed}<span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}> / {total}</span>
              </p>
              <p className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>módulos concluídos</p>
            </div>

            {/* barra de progresso */}
            <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: 4,
                  background: pct >= 100 ? '#4ade80' : 'linear-gradient(90deg, #f37435, #b8860b)',
                }}
              />
            </div>

            <p className="font-body text-xs italic" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {motivational}
            </p>
          </div>
        </motion.div>

        {/* ── lista de módulos ── */}
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="font-body uppercase" style={{ fontSize: 10, fontWeight: 900, color: '#f37435', letterSpacing: '0.18em' }}>
            módulos
          </p>
          <p className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>
            {total - completed} pendente{total - completed !== 1 ? 's' : ''}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.3 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--stroke)',
            borderRadius: 22,
            overflow: 'hidden',
          }}
        >
          {mods.map((m, i) => {
            const done    = isDone(m)
            const started = (progress[m.id]?.story_index ?? 0) > 0 && !done
            const locked  = !done && !started && i > 0 && !isDone(mods[i - 1])

            let statusColor = 'var(--text-secondary)'
            let statusLabel = 'Pendente'
            let StatusIcon  = Lock

            if (done)    { statusColor = '#4ade80'; statusLabel = 'Concluído'; StatusIcon = Check }
            else if (started) { statusColor = m.accent; statusLabel = 'Em andamento'; StatusIcon = PlayCircle }

            return (
              <motion.button
                key={m.id}
                onClick={() => navigate(`/modulo/${m.id}`)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + i * 0.04, duration: 0.25 }}
                whileTap={{ scale: 0.985 }}
                className="flex w-full items-center gap-3 px-4 text-left"
                style={{
                  paddingTop: 13,
                  paddingBottom: 13,
                  borderBottom: i < mods.length - 1 ? '1px solid var(--stroke)' : 'none',
                  opacity: locked ? 0.5 : 1,
                }}
              >
                {/* ícone colorido */}
                <span
                  className="flex shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    width: 44, height: 44,
                    background: done
                      ? 'rgba(74,222,128,0.12)'
                      : started
                        ? `${m.accent}22`
                        : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : started ? `${m.accent}55` : 'var(--stroke)'}`,
                  }}
                >
                  <ModuleIcon
                    type={m.iconType}
                    size={22}
                    color={done ? '#4ade80' : started ? m.accent : 'var(--text-locked)'}
                  />
                </span>

                {/* texto */}
                <span className="min-w-0 flex-1">
                  <span className="block font-display" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {m.title}
                  </span>
                  <span className="flex items-center gap-1 mt-0.5">
                    <StatusIcon size={10} color={statusColor} />
                    <span className="font-body" style={{ fontSize: 11, color: statusColor }}>
                      {statusLabel}
                    </span>
                    {m.estimatedMinutes && !done && (
                      <span className="font-body" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        · {m.estimatedMinutes} min
                      </span>
                    )}
                  </span>
                </span>

                {/* chevron */}
                {!locked && (
                  <ChevronRight size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                )}
                {locked && (
                  <Lock size={14} style={{ color: 'var(--text-locked)', flexShrink: 0 }} />
                )}
              </motion.button>
            )
          })}
        </motion.div>

      </main>

      <BottomNav active="progress" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}
