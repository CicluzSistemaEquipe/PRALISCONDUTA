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

/** Primeiro nome legível — nunca exibe um e-mail. */
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
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(184,134,11,0.40))' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeW} />
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

export default function Feed() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { employee, progress } = useSession()
  const [signed, setSigned] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!employee) return
    getSignature(employee.id).then((s) => {
      setSigned(Boolean(s))
      setReady(true)
    })
  }, [employee, progress])

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

    for (const m of ordered) {
      const done = isModuleDone(m)
      const started = (progress[m.id]?.story_index ?? 0) > 0
      const frac = done ? 1 : Math.min(1, (progress[m.id]?.story_index ?? 0) / m.stories.length)
      fracMap.set(m.id, frac)

      let status: ModuleStatus
      if (done) status = 'done'
      else if (!prevDone) status = 'locked'
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

  return (
    <div className="app-shell">
      <AnimatedBackground accent="#b8860b" />

      {/* header */}
      <header
        className="sticky top-0 z-20 flex flex-col gap-3 px-5 pb-4"
        style={{
          paddingTop: 'calc(var(--safe-top) + 1rem)',
          background: isLight
            ? 'linear-gradient(180deg, rgba(253,246,236,0.94) 0%, rgba(253,246,236,0.82) 100%)'
            : 'linear-gradient(180deg, rgba(13,8,0,0.96) 0%, rgba(13,8,0,0.85) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderBottom: '1px solid var(--nav-border)',
          boxShadow: isLight
            ? '0 4px 30px rgba(94,55,49,0.08), inset 0 -1px 0 rgba(184,134,11,0.12)'
            : '0 4px 40px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(184,134,11,0.15)',
        }}
      >
        <div className="flex items-center justify-between">
          <img src={isLight ? brand.logoSVGPreta : brand.logoSVGBranca} alt="padaria pralís" style={{ width: 140, height: 'auto', filter: isLight ? 'none' : FILTER_WHITE }} />
          <LisHeaderAvatar globalProgress={globalProgress} onClick={() => navigate('/progresso')} />
        </div>

        <div className="flex flex-col gap-0.5">
          <p
            className="font-body uppercase"
            style={{ fontSize: 11, fontWeight: 700, color: '#f37435', letterSpacing: '0.22em' }}
          >
            {employee.role}
          </p>
          <h1
            className="font-display leading-none"
            style={{ fontSize: 'clamp(26px, 7vw, 34px)', color: isLight ? 'var(--text-primary)' : '#fff' }}
          >
            Olá, {firstName(employee.name)}!
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
                  ? 'linear-gradient(135deg, rgba(184,134,11,0.14) 0%, rgba(255,248,235,0.85) 55%, rgba(243,116,53,0.10) 100%)'
                  : 'linear-gradient(135deg, rgba(184,134,11,0.22) 0%, rgba(94,55,49,0.14) 55%, rgba(243,116,53,0.12) 100%)',
                border: '1px solid var(--stroke)',
                borderRadius: 22,
                boxShadow: isLight
                  ? 'var(--shadow-card)'
                  : '0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(184,134,11,0.08), inset 0 1px 0 rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* textura da marca */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${brand.patternBrand})`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '110px',
                  opacity: isLight ? 0.06 : 0.10,
                  pointerEvents: 'none',
                  filter: isLight ? 'brightness(0) saturate(100%) opacity(0.6)' : 'none',
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
                  opacity: isLight ? 0.08 : 0.10,
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
                    fontFamily: 'MadeByDillan, serif',
                    fontSize: 18,
                    fontWeight: 700,
                    color: isLight ? 'var(--text-primary)' : '#fff',
                  }}
                >
                  {Math.round(globalProgress)}%
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <p style={{ fontFamily: 'MadeByDillan, serif', fontSize: 22, color: isLight ? 'var(--text-primary)' : '#fff', lineHeight: 1.15 }}>
                  {completedCount === 0
                    ? 'Comece sua jornada'
                    : completedCount === ordered.length
                      ? 'Jornada concluída! 🌾'
                      : `${completedCount} de ${ordered.length} concluídos`}
                </p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12.5, color: isLight ? 'var(--text-secondary)' : 'rgba(232,207,160,0.75)', marginTop: 5, lineHeight: 1.4 }}>
                  {completedCount === 0
                    ? 'Toque em um módulo para começar'
                    : completedCount === ordered.length
                      ? 'Você completou toda a trilha!'
                      : 'Continue no seu ritmo 💛'}
                </p>
                {/* mini barra linear */}
                <div style={{ marginTop: 10, height: 3, borderRadius: 99, background: isLight ? 'rgba(94,55,49,0.14)' : 'rgba(255,255,255,0.12)', overflow: 'hidden', maxWidth: 160 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${globalProgress}%` }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #b8860b, #f37435)', boxShadow: '0 0 6px rgba(184,134,11,0.7)' }}
                  />
                </div>
              </div>
            </motion.div>

            {groups.map(([section, mods]) => (
            <section key={section} className="mb-6">
              {/* Section divider */}
              <div className="mb-3 flex items-center gap-3">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b8860b', boxShadow: '0 0 8px rgba(184,134,11,0.80)', flexShrink: 0 }} />
                <div style={{ height: 2, width: 14, background: 'rgba(184,134,11,0.75)', borderRadius: 2, boxShadow: '0 0 6px rgba(184,134,11,0.50)' }} />
                <h2
                  className="font-body font-bold uppercase tracking-widest"
                  style={{ fontSize: 10.5, color: 'rgba(184,134,11,0.85)', letterSpacing: '0.22em' }}
                >
                  {SECTION_LABEL[section]}
                </h2>
                <div style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.22)', borderRadius: 2 }} />
              </div>
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
            ))}
          </>
        )}

        <div className="flex flex-col items-center gap-2 pb-2 pt-4">
          <img src={brand.simboloPar} alt="" aria-hidden="true" style={{ width: 28, opacity: isLight ? 0.28 : 0.2, filter: isLight ? 'brightness(0) saturate(100%) opacity(0.5)' : FILTER_WHITE }} />
          <p className="text-center font-body" style={{ fontSize: 12, fontStyle: 'italic', color: isLight ? 'rgba(94,55,49,0.45)' : 'rgba(232,207,160,0.30)' }}>
            a prova é ser feliz 🌾
          </p>
        </div>
      </main>

      <BottomNav active="feed" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}
