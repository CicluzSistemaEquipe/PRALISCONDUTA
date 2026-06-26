import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, PenLine } from 'lucide-react'
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

/** Anel de progresso global (gradiente ouro→laranja). Desenha uma vez na entrada. */
function ProgressRing({ progress, size = 92, reduce }: { progress: number; size?: number; reduce?: boolean }) {
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
        initial={{ strokeDashoffset: reduce ? offset : circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: reduce ? 0 : 1.4, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.35 }}
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
  const reduce = useReducedMotion() ?? false
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

  // ── Próximo passo: 1º módulo acionável (em andamento ou disponível) ──────────
  const nextModule = ordered.find((m) => {
    const s = statusOf(m.id)
    return s === 'in-progress' || s === 'active'
  })
  const allDone = ordered.length > 0 && completedCount === ordered.length
  const remaining = ordered.length - completedCount

  const dateLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(now)
  const timeLabel = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(now)
  const currentSection = groups.find(([, mods]) => mods.some((m) => !isModuleDone(m)))?.[0]

  // ── Lis como guia da jornada (mensagem derivada do estado — sem nova regra) ──
  const lisMessage = allDone
    ? 'Você concluiu tudo. Que orgulho! 🎉'
    : ordered.length === 0
      ? 'Seu treinamento aparece aqui assim que for liberado.'
      : completedCount === 0
        ? 'Bora começar? Eu te acompanho em cada passo. 🌾'
        : nextModule && statusOf(nextModule.id) === 'in-progress'
          ? 'Você parou no meio desse módulo. Vamos terminar?'
          : `Faltam ${remaining} para concluir. Você consegue!`

  // ── Conteúdo do herói (responde: onde parei / o que faço agora) ─────────────
  const heroAccent = nextModule?.accent ?? '#f37435'
  const nextInProgress = nextModule ? statusOf(nextModule.id) === 'in-progress' : false
  const heroEyebrow = allDone
    ? 'Jornada concluída'
    : completedCount === 0
      ? 'Comece sua jornada'
      : nextInProgress
        ? 'Continue de onde parou'
        : 'Próximo passo'
  const heroTitle = allDone ? 'Você concluiu tudo 🎉' : (nextModule?.title ?? 'Tudo certo por aqui')
  const heroState = allDone
    ? 'Toque para rever sua trilha'
    : nextModule?.kind === 'signature'
      ? 'Última etapa: sua assinatura'
      : nextInProgress && nextModule
        ? `${Math.round(fractionOf(nextModule.id) * 100)}% concluído`
        : nextModule
          ? `${nextModule.subtitle} · ${nextModule.estimatedMinutes} min`
          : ''
  const heroCTA = allDone
    ? 'Ver meu progresso'
    : nextModule?.kind === 'signature'
      ? 'Assinar e concluir'
      : completedCount === 0
        ? 'Começar agora'
        : 'Continuar'
  const onHero = () => (allDone || !nextModule ? navigate('/progresso') : open(nextModule))

  // helpers de motion (com propósito; respeitam prefers-reduced-motion)
  const rise = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay } }

  return (
    <div className="app-shell">
      <AnimatedBackground accent="#b8860b" />

      {/* ── HEADER (leve, sem loops) ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex flex-col gap-2 px-5 pb-3"
        style={{
          paddingTop: 'calc(var(--safe-top) + 0.75rem)',
          background: isLight ? '#ffffff' : '#150900',
          borderBottom: `1px solid ${isLight ? '#e5d5c5' : 'rgba(184,134,11,0.18)'}`,
          boxShadow: isLight ? '0 2px 10px rgba(26,14,0,0.05)' : 'none',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <motion.img
            src={isLight ? brand.logoSVGPreta : brand.logoSVGBranca}
            alt="padaria pralis"
            style={{ width: 104, height: 'auto', filter: isLight ? 'none' : FILTER_WHITE, transformOrigin: 'left center' }}
            whileTap={{ scale: 0.96 }}
            {...rise(0)}
          />
          <motion.div className="flex flex-col items-center gap-1" {...rise(0.06)}>
            <LisHeaderAvatar globalProgress={globalProgress} size={64} onClick={() => navigate('/progresso')} />
            <div className="text-center font-body" style={{ color: isLight ? '#1a0e00' : 'rgba(255,255,255,0.90)' }}>
              <p style={{ fontSize: 12, fontWeight: 900, lineHeight: 1 }}>{timeLabel}</p>
              <p style={{ fontSize: 8.5, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{dateLabel}</p>
            </div>
          </motion.div>
        </div>

        <motion.div className="flex flex-col gap-0.5" {...rise(0.1)}>
          <p className="font-body uppercase" style={{ fontSize: 9, fontWeight: 800, color: '#f37435', letterSpacing: '0.20em' }}>
            {employee.role}
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: 'clamp(19px, 5.2vw, 25px)', color: 'var(--text-primary)' }}>
            Ol&aacute;, {firstName(employee.name)}!
          </h1>
        </motion.div>
      </header>

      {/* ── FEED ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 pb-28 pt-4">
        {!ready ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Lis guia — fala contextual, aponta para o próximo passo */}
            <motion.div className="mb-3 flex items-center gap-2.5" {...rise(0.12)}>
              <span
                className="flex shrink-0 items-center justify-center overflow-hidden"
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(243,116,53,0.14)', border: '1px solid rgba(243,116,53,0.30)' }}
              >
                <img src={brand.simboloPar} alt="Lis" style={{ width: 18, height: 18 }} />
              </span>
              <p className="font-body" style={{ fontSize: 'clamp(11.5px, 3.3vw, 13px)', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                {lisMessage}
              </p>
            </motion.div>

            {/* HERÓI "Continuar" — responde onde parei / o que faço / quanto falta */}
            <motion.button
              onClick={onHero}
              whileTap={{ scale: 0.985 }}
              {...rise(0.16)}
              className="relative mb-6 block w-full overflow-hidden text-left"
              style={{
                padding: 18,
                background: isLight ? '#ffffff' : 'var(--bg-card)',
                border: `1.5px solid ${allDone ? 'rgba(93,216,122,0.45)' : heroAccent}`,
                borderRadius: 22,
                boxShadow: allDone ? 'none' : `0 16px 40px -22px ${heroAccent}`,
              }}
            >
              <img
                src={brand.simboloPar}
                aria-hidden="true"
                alt=""
                style={{ position: 'absolute', right: -14, bottom: -14, width: 96, opacity: isLight ? 0.05 : 0.09, filter: isLight ? 'brightness(0) saturate(100%) opacity(0.5)' : 'brightness(0) invert(1)', pointerEvents: 'none' }}
              />
              <span aria-hidden="true" className="absolute left-0 top-4 bottom-4" style={{ width: 4, borderRadius: 999, background: allDone ? '#5dd87a' : heroAccent }} />

              <div className="relative flex items-center gap-4">
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <ProgressRing progress={globalProgress} size={78} reduce={reduce} />
                  <span
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}
                  >
                    {Math.round(globalProgress)}%
                  </span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="font-body uppercase" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.16em', color: allDone ? '#5dd87a' : heroAccent }}>
                    {heroEyebrow}
                    {!allDone && ordered.length > 0 && (
                      <span style={{ color: 'var(--text-secondary)', letterSpacing: '0.04em' }}> · faltam {remaining} de {ordered.length}</span>
                    )}
                  </p>
                  <p className="font-display" style={{ fontSize: 'clamp(17px, 4.8vw, 21px)', color: 'var(--text-primary)', lineHeight: 1.15, marginTop: 3, overflowWrap: 'anywhere' }}>
                    {heroTitle}
                  </p>
                  {heroState && (
                    <p className="font-body" style={{ fontSize: 'clamp(11.5px, 3.3vw, 13px)', color: 'var(--text-secondary)', marginTop: 3 }}>
                      {heroState}
                    </p>
                  )}
                </div>
              </div>

              {nextInProgress && nextModule && (
                <div className="relative mt-3 overflow-hidden rounded-full" style={{ height: 5, background: 'var(--stroke-soft)' }}>
                  <motion.div
                    initial={{ width: reduce ? `${Math.round(fractionOf(nextModule.id) * 100)}%` : 0 }}
                    animate={{ width: `${Math.round(fractionOf(nextModule.id) * 100)}%` }}
                    transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    style={{ height: '100%', borderRadius: 999, background: heroAccent }}
                  />
                </div>
              )}

              <span
                className="relative mt-4 flex w-full items-center justify-center gap-2 font-display"
                style={{
                  height: 46,
                  borderRadius: 13,
                  background: allDone ? '#5dd87a' : heroAccent,
                  color: '#fff',
                  fontSize: 'clamp(14px, 4vw, 16px)',
                  boxShadow: `0 10px 24px -12px ${allDone ? '#5dd87a' : heroAccent}`,
                }}
              >
                {allDone ? <Check size={18} strokeWidth={2.6} /> : nextModule?.kind === 'signature' ? <PenLine size={17} strokeWidth={2.4} /> : null}
                {heroCTA}
                {!allDone && nextModule?.kind !== 'signature' && <ArrowRight size={18} strokeWidth={2.4} />}
              </span>
            </motion.button>

            {/* TRILHA — seções com estado claro; recomendado em destaque */}
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
                    reduce={reduce}
                  />
                  <div className="flex flex-col gap-2">
                    {mods.map((m, i) => (
                      <motion.div
                        key={m.id}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: reduce ? 0 : Math.min(i * 0.05, 0.2), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ModuleCard
                          module={m}
                          status={statusOf(m.id)}
                          progress={fractionOf(m.id)}
                          onOpen={() => open(m)}
                          highlight={m.id === nextModule?.id}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        <div className="flex flex-col items-center gap-2 pb-2 pt-2">
          <img src={brand.simboloPar} alt="" aria-hidden="true" style={{ width: 28, opacity: isLight ? 0.28 : 0.2, filter: isLight ? 'brightness(0) saturate(100%) opacity(0.5)' : FILTER_WHITE }} />
          <p className="text-center font-body" style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            é provar e ser feliz
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
  reduce,
}: {
  label: string
  accent: string
  state: SectionState
  done: number
  missing: number
  total: number
  isLight: boolean
  reduce: boolean
}) {
  const complete = state === 'complete'
  const current = state === 'current'
  const bg = complete
    ? isLight
      ? '#effff3'
      : 'rgba(93,216,122,0.16)'
    : current
      ? isLight
        ? '#fff0e8'
        : 'rgba(243,116,53,0.16)'
      : isLight
        ? '#f7f2ec'
        : 'var(--bg-card)'
  const color = complete ? '#5dd87a' : current ? '#f37435' : accent
  const missingPercent = total > 0 ? Math.round((missing / total) * 100) : 0
  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0
  const labelText = complete ? 'Concluído' : `${missingPercent}% falta`

  return (
    <div
      className="mb-3 overflow-hidden"
      style={{
        padding: '9px 10px 10px',
        borderRadius: 15,
        background: bg,
        border: `1px solid ${complete ? 'rgba(93,216,122,0.45)' : current ? 'rgba(243,116,53,0.48)' : 'rgba(232,207,160,0.22)'}`,
      }}
    >
      <div className="flex items-center gap-3">
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <h2 className="font-body font-bold uppercase" style={{ fontSize: 10.5, color, letterSpacing: '0.20em', whiteSpace: 'nowrap' }}>
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
          initial={{ width: reduce ? `${donePercent}%` : 0 }}
          whileInView={{ width: `${donePercent}%` }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
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
      </div>
    </div>
  )
}
