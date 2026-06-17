import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { modulesForRole } from '@/lib/content'
import type { Module } from '@/lib/types'
import { useSession } from '../context/SessionContext'
import { getSignature } from '@/lib/storage'
import { ModuleCard, type ModuleStatus } from '../components/ModuleCard'
import { LisHeaderAvatar } from '../components/LisHeaderAvatar'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'
import { SkeletonCard } from '../components/SkeletonCard'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { useTheme } from '../context/ThemeContext'
import { isDevMode } from '@/lib/devMode'

/** Primeiro nome legível; nunca exibe um e-mail. */
function firstName(name: string): string {
  const base = name.includes('@') ? name.split('@')[0] : name
  const first = base.trim().split(/[\s._-]+/)[0] || 'colaborador'
  return first.charAt(0).toUpperCase() + first.slice(1)
}

function ProgressRing({ progress, size = 92 }: { progress: number; size?: number }) {
  const strokeW = 8
  const r = (size - strokeW * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--stroke-soft)" strokeWidth={strokeW} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      />
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b8860b" />
          <stop offset="60%" stopColor="#d4a017" />
          <stop offset="100%" stopColor="#f37435" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const SECTION_ORDER: Record<NonNullable<Module['section']>, number> = { geral: 0, cargo: 1, final: 2 }
const SECTION_LABEL: Record<NonNullable<Module['section']>, string> = {
  geral: 'Para todos',
  cargo: 'Para o seu cargo',
  final: 'Para concluir',
}

const SECTION_ACCENT: Record<NonNullable<Module['section']>, string> = {
  geral: '#b8860b',
  cargo: '#f37435',
  final: '#e8cfa0',
}

type SectionState = 'complete' | 'current' | 'pending'

export default function Feed() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { employee, progress } = useSession()
  const [signed, setSigned] = useState(false)
  const [ready, setReady] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!employee) return
    getSignature(employee.id).then((s) => {
      setSigned(Boolean(s))
      setReady(true)
    })
  }, [employee, progress])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const ordered = useMemo<Module[]>(() => {
    if (!employee) return []
    return modulesForRole(employee.role).sort(
      (a, b) => SECTION_ORDER[a.section ?? 'geral'] - SECTION_ORDER[b.section ?? 'geral'],
    )
  }, [employee])

  const isModuleDone = (m: Module) =>
    m.kind === 'signature' ? signed : Boolean(progress[m.id]?.completed)

  const { statusOf, fractionOf, completedCount } = useMemo(() => {
    const statusMap = new Map<string, ModuleStatus>()
    const fracMap = new Map<string, number>()
    let prevDone = true
    let completed = 0
    const devMode = isDevMode()

    for (const m of ordered) {
      const done = isModuleDone(m)
      const started = (progress[m.id]?.story_index ?? 0) > 0
      const frac = done ? 1 : Math.min(1, (progress[m.id]?.story_index ?? 0) / m.stories.length)
      fracMap.set(m.id, frac)

      let status: ModuleStatus
      if (done) status = 'done'
      else if (!prevDone && !devMode) status = 'locked' // dev mode: sem bloqueio
      else if (started) status = 'in-progress'
      else status = 'active'
      statusMap.set(m.id, status)

      if (done) completed++
      prevDone = prevDone && done
    }
    return {
      statusOf: (id: string) => statusMap.get(id) ?? 'locked',
      fractionOf: (id: string) => fracMap.get(id) ?? 0,
      completedCount: completed,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered, progress, signed])

  const globalProgress = ordered.length ? (completedCount / ordered.length) * 100 : 0

  const groups = useMemo(() => {
    const map = new Map<NonNullable<Module['section']>, Module[]>()
    for (const m of ordered) {
      const key = m.section ?? 'geral'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return [...map.entries()]
  }, [ordered])

  const open = (m: Module) => {
    if (statusOf(m.id) === 'locked') return
    if (m.kind === 'signature') navigate('/conclusao')
    else navigate(`/modulo/${m.id}`)
  }

  if (!employee) return null

  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(now)
  const timeLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now)
  const currentSection = groups.find(([, mods]) => mods.some((m) => !isModuleDone(m)))?.[0]

  return (
    <div className="app-shell">
      <AnimatedBackground accent="#b8860b" />

      {/* header */}
      <header
        className="sticky top-0 z-20 flex flex-col gap-2.5 overflow-hidden px-5 pb-3"
        style={{
          paddingTop: 'calc(var(--safe-top) + 0.75rem)',
          background: isLight
            ? 'linear-gradient(135deg, #ffffff 0%, #fff4eb 48%, #f7e1cc 100%)'
            : 'linear-gradient(135deg, #75483f 0%, #5e3731 48%, #8b3f23 100%)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          borderBottom: '1px solid rgba(232,207,160,0.26)',
          boxShadow: isLight ? '0 8px 20px rgba(94,55,49,0.06)' : '0 8px 20px rgba(43,22,15,0.14)',
        }}
      >
        <motion.img
          src={brand.simboloEspiga}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[-64px] top-2"
          style={{
            width: 180,
            opacity: isLight ? 0.035 : 0.055,
            filter: isLight ? 'none' : FILTER_WHITE,
            mixBlendMode: isLight ? 'multiply' : 'screen',
          }}
          animate={{ y: [0, 8, 0], rotate: [-3, 0, -3] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 w-20"
          style={{
            left: -80,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
            transform: 'skewX(-16deg)',
          }}
          animate={{ x: [0, 620] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative min-h-[112px]">
          <motion.img
            src={isLight ? brand.logoSVGPreta : brand.logoSVGBranca}
            alt="padaria pralis"
            style={{ width: 112, height: 'auto', filter: isLight ? 'none' : FILTER_WHITE, transformOrigin: 'left center' }}
            animate={{ y: [0, -1.5, 0], scale: [1, 1.015, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.96, rotate: -1 }}
          />
          <div className="absolute right-0 top-0 flex flex-col items-center gap-1">
            <LisHeaderAvatar globalProgress={globalProgress} size={82} onClick={() => navigate('/progresso')} />
            <div className="text-center font-body" style={{ color: 'rgba(255,255,255,0.90)' }}>
              <p style={{ fontSize: 13, fontWeight: 900, lineHeight: 1 }}>{timeLabel}</p>
              <p style={{ fontSize: 9, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{dateLabel}</p>
            </div>
          </div>
        </div>

        <div className="relative -mt-14 flex flex-col gap-0.5 pr-28">
          <p
            className="font-body uppercase"
            style={{ fontSize: 9, fontWeight: 800, color: '#f37435', letterSpacing: '0.20em' }}
          >
            {employee.role}
          </p>
          <h1
            className="font-display leading-none"
            style={{ fontSize: 'clamp(19px, 5.2vw, 25px)', color: 'var(--text-primary)' }}
          >
            Ol&aacute;, {firstName(employee.name)}!
          </h1>
        </div>
      </header>

      {/* feed */}
      <main className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 pb-28 pt-5">
        {!ready ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* hero: anel de progresso com % no centro + copy contextual */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.1 }}
              className="relative mb-6 flex items-center gap-5 overflow-hidden"
              style={{
                padding: '20px 20px',
                background: isLight
                  ? 'linear-gradient(135deg, #ffffff 0%, #fff4eb 100%)'
                  : 'linear-gradient(135deg, #75483f 0%, #6a4038 100%)',
                border: '1px solid rgba(232,207,160,0.30)',
                borderRadius: 22,
                boxShadow: 'none',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
              }}
            >
              {/* textura da marca */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'transparent',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />
              {/* símbolo da marca como watermark */}
              <img
                src={brand.simboloPar}
                aria-hidden="true"
                alt=""
                style={{
                  position: 'absolute',
                  right: -12,
                  bottom: -12,
                  width: 90,
                  height: 'auto',
                  opacity: isLight ? 0.04 : 0.08,
                  pointerEvents: 'none',
                  filter: isLight ? 'brightness(0) saturate(100%) opacity(0.5)' : 'brightness(0) invert(1)',
                }}
              />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <ProgressRing progress={globalProgress} size={92} />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 'clamp(15px, 4.2vw, 18px)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                  }}
                >
                  {Math.round(globalProgress)}%
                </span>
              </div>
              <div style={{ position: 'relative', minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 'clamp(18px, 5vw, 23px)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: 1.18,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {completedCount === 0
                    ? 'Comece sua jornada'
                    : completedCount === ordered.length
                      ? 'Jornada concluída!'
                      : `${completedCount} de ${ordered.length} concluídos`}
                </p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(11.5px, 3.4vw, 13px)', color: 'var(--text-secondary)', marginTop: 5, lineHeight: 1.4 }}>
                  {completedCount === 0
                    ? 'Toque em um módulo para começar'
                    : completedCount === ordered.length
                      ? 'Você completou toda a trilha!'
                      : 'Continue no seu ritmo'}
                </p>
                {/* mini barra linear */}
                <div style={{ marginTop: 10, height: 3, borderRadius: 99, background: 'var(--stroke-soft)', overflow: 'hidden', maxWidth: 160 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${globalProgress}%` }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    style={{ height: '100%', borderRadius: 99, background: '#b8860b' }}
                  />
                </div>
              </div>
            </motion.div>

            {groups.map(([section, mods]) => {
              const doneInSection = mods.filter(isModuleDone).length
              const missing = mods.length - doneInSection
              const sectionState: SectionState = missing === 0 ? 'complete' : section === currentSection ? 'current' : 'pending'

              return (
            <section key={section} className="mb-6">
              <SectionDivider
                label={SECTION_LABEL[section]}
                accent={SECTION_ACCENT[section]}
                state={sectionState}
                done={doneInSection}
                missing={missing}
                total={mods.length}
                isLight={isLight}
              />
              <div className="flex flex-col gap-2">
                {mods.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 32, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ModuleCard module={m} status={statusOf(m.id)} progress={fractionOf(m.id)} onOpen={() => open(m)} />
                  </motion.div>
                ))}
              </div>
            </section>
              )
            })}
          </>
        )}

        <div className="flex flex-col items-center gap-2 pb-2 pt-4">
          <img src={brand.simboloPar} alt="" aria-hidden="true" style={{ width: 28, opacity: isLight ? 0.28 : 0.2, filter: isLight ? 'brightness(0) saturate(100%) opacity(0.5)' : FILTER_WHITE }} />
          <p className="text-center font-body" style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            a prova é ser feliz
          </p>
        </div>
      </main>

      <BottomNav active="feed" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}

function SectionDivider({
  label,
  accent,
  state,
  done,
  missing,
  total,
  isLight,
}: {
  label: string
  accent: string
  state: SectionState
  done: number
  missing: number
  total: number
  isLight: boolean
}) {
  const complete = state === 'complete'
  const current = state === 'current'
  const bg = complete
    ? isLight
      ? '#effff3'
      : 'rgba(93,216,122,0.18)'
    : current
      ? isLight
        ? '#fff0e8'
        : 'rgba(243,116,53,0.18)'
      : isLight
        ? '#f7f2ec'
        : 'rgba(117,72,63,0.76)'
  const color = complete ? '#5dd87a' : current ? '#f37435' : accent
  const missingPercent = total > 0 ? Math.round((missing / total) * 100) : 0
  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0
  const labelText = complete ? 'Concluído' : `${missingPercent}% falta`

  return (
    <motion.div
      className="mb-3 overflow-hidden"
      initial={false}
      animate={
        current
          ? {
              boxShadow: [
                '0 0 0 0 rgba(243,116,53,0)',
                '0 0 0 4px rgba(243,116,53,0.14)',
                '0 0 0 0 rgba(243,116,53,0)',
              ],
            }
          : { boxShadow: 'none' }
      }
      transition={{ duration: 1.8, repeat: current ? Infinity : 0, ease: 'easeInOut' }}
      style={{
        padding: '9px 10px 10px',
        borderRadius: 15,
        background: bg,
        border: `1px solid ${complete ? 'rgba(93,216,122,0.45)' : current ? 'rgba(243,116,53,0.48)' : 'rgba(232,207,160,0.22)'}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-3">
        <motion.span
          style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}
          animate={current ? { scale: [1, 1.55, 1], opacity: [1, 0.65, 1] } : { scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, repeat: current ? Infinity : 0, ease: 'easeInOut' }}
        />
        <h2
          className="font-body font-bold uppercase"
          style={{ fontSize: 10.5, color, letterSpacing: '0.20em', whiteSpace: 'nowrap' }}
        >
          {label}
        </h2>
        <span style={{ flex: 1 }} />
        <span
          className="font-body uppercase"
          style={{
            flexShrink: 0,
            borderRadius: 999,
            padding: '4px 8px',
            background: complete ? 'rgba(93,216,122,0.18)' : current ? '#ffffff' : 'rgba(255,255,255,0.08)',
            color: complete ? '#5dd87a' : current ? '#5e3731' : 'var(--text-secondary)',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '0.08em',
          }}
        >
          {labelText}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 5,
          marginTop: 8,
          borderRadius: 999,
          overflow: 'hidden',
          background: isLight ? 'rgba(94,55,49,0.10)' : 'rgba(255,255,255,0.12)',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${donePercent}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            borderRadius: 999,
            background: complete
              ? 'linear-gradient(90deg, #5dd87a, #a7f3b7)'
              : current
                ? 'linear-gradient(90deg, #f37435, #ffb07f)'
                : `linear-gradient(90deg, ${accent}, rgba(232,207,160,0.72))`,
          }}
        />
        {current && (
          <motion.div
            className="absolute inset-y-0"
            style={{ width: 44, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.82), transparent)' }}
            animate={{ x: ['-60px', '420px'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </motion.div>
  )
}

