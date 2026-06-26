import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Leaf, PenLine, Sparkles } from 'lucide-react'
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

// Saudação por gênero (heurística PT-BR + exceções). Editável depois no admin.
const FEM_NAMES = new Set(['isabel', 'raquel', 'rachel', 'beatriz', 'ester', 'esther', 'ruth', 'carmem', 'carmen', 'ines', 'agnes', 'lais', 'iris', 'mercedes', 'lourdes', 'solange', 'eliane', 'cristiane', 'rosane', 'adriane', 'jaqueline', 'jacqueline', 'eveline', 'evelyn', 'karen', 'miriam', 'mirian', 'heloise', 'noemi', 'rute'])
const MASC_NAMES = new Set(['luca', 'juca', 'noa', 'josua', 'jeova', 'elias', 'tobias', 'matias', 'dinis', 'nicola', 'aleixa'])
function welcomeFor(name: string): string {
  const f = firstName(name).toLowerCase()
  const female = MASC_NAMES.has(f) ? false : FEM_NAMES.has(f) ? true : f.endsWith('a')
  return female ? 'Seja bem-vinda' : 'Seja bem-vindo'
}

// Mensagens boas que passam acima do rodapé (futuramente editáveis no admin geral).
const TAGLINES = [
  'é provar e ser feliz',
  'cada módulo te deixa mais preparado',
  'seu cuidado faz a Pralís melhor',
  'conhecimento que vira confiança',
  'um passo hoje, orgulho amanhã',
]

/** Anel de progresso global (gradiente ouro→laranja). Desenha uma vez na entrada. */
function ProgressRing({ progress, size = 92, reduce }: { progress: number; size?: number; reduce?: boolean }) {
  const strokeW = 7
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
        transition={{ duration: reduce ? 0 : 1.3, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.3 }}
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

  const rise = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay } }

  return (
    <div className="app-shell">
      <AnimatedBackground accent="#b8860b" />

      {/* ── TOPO compacto e moderno ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 px-5 pb-3.5"
        style={{
          paddingTop: 'calc(var(--safe-top) + 0.55rem)',
          background: isLight ? 'linear-gradient(180deg, #fff7ef 0%, #ffffff 100%)' : 'linear-gradient(180deg, #45221b 0%, #2c1611 100%)',
          borderBottom: `1.5px solid ${isLight ? 'rgba(243,116,53,0.22)' : 'rgba(243,116,53,0.34)'}`,
          boxShadow: isLight ? '0 2px 14px rgba(94,55,49,0.06)' : '0 6px 20px rgba(0,0,0,0.28)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <motion.div className="min-w-0 flex-1" {...rise(0)}>
            <img
              src={isLight ? brand.logoSVGPreta : brand.logoSVGBranca}
              alt="padaria pralis"
              style={{ width: 82, height: 'auto', filter: isLight ? 'none' : FILTER_WHITE }}
            />
            <p className="mt-2 font-body" style={{ fontSize: 10.5, fontWeight: 600, color: isLight ? 'var(--text-secondary)' : '#e8cfa0' }}>
              {welcomeFor(employee.name)},
            </p>
            <span
              className="mt-1 inline-flex items-center font-body uppercase"
              style={{
                fontSize: 8.5,
                fontWeight: 800,
                letterSpacing: '0.18em',
                color: '#ffb486',
                background: 'rgba(243,116,53,0.18)',
                border: '1px solid rgba(243,116,53,0.40)',
                borderRadius: 999,
                padding: '3px 9px',
              }}
            >
              {employee.role}
            </span>
            <h1 className="mt-1.5 font-display leading-none" style={{ fontSize: 'clamp(20px, 5.6vw, 26px)', color: isLight ? 'var(--text-primary)' : '#fff6ea' }}>
              Ol&aacute;, {firstName(employee.name)}!
            </h1>
          </motion.div>

          <motion.div className="flex shrink-0 flex-col items-center gap-1" {...rise(0.06)}>
            <LisHeaderAvatar globalProgress={globalProgress} size={80} onClick={() => navigate('/progresso')} />
            <div className="text-center font-body" style={{ color: isLight ? '#1a0e00' : '#fff6ea' }}>
              <p style={{ fontSize: 13, fontWeight: 900, lineHeight: 1 }}>{timeLabel}</p>
              <p style={{ fontSize: 8.5, lineHeight: 1.25, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', opacity: 0.85 }}>{dateLabel}</p>
            </div>
          </motion.div>
        </div>
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
            <motion.div className="mb-3 flex items-center gap-2.5" {...rise(0.1)}>
              <span
                className="flex shrink-0 items-center justify-center"
                style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(243,116,53,0.14)', border: '1px solid rgba(243,116,53,0.30)' }}
              >
                <Sparkles size={14} color="#f37435" strokeWidth={2.2} />
              </span>
              <p className="font-body" style={{ fontSize: 'clamp(11.5px, 3.3vw, 13px)', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                {lisMessage}
              </p>
            </motion.div>

            {/* HERÓI "Continuar" — fino e minimalista; responde onde/o que/quanto */}
            <motion.button
              onClick={onHero}
              whileTap={{ scale: 0.985 }}
              {...rise(0.14)}
              className="relative mb-6 block w-full overflow-hidden text-left"
              style={{
                padding: 13,
                background: isLight ? '#ffffff' : 'var(--bg-card)',
                border: `1.5px solid ${allDone ? 'rgba(93,216,122,0.45)' : heroAccent}`,
                borderRadius: 18,
                boxShadow: allDone ? 'none' : `0 12px 30px -22px ${heroAccent}`,
              }}
            >
              <span aria-hidden="true" className="absolute left-0 top-3 bottom-3" style={{ width: 4, borderRadius: 999, background: allDone ? '#5dd87a' : heroAccent }} />

              <div className="relative flex items-center gap-3">
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <ProgressRing progress={globalProgress} size={52} reduce={reduce} />
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {Math.round(globalProgress)}%
                  </span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="font-body uppercase" style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.14em', color: allDone ? '#5dd87a' : heroAccent }}>
                    {heroEyebrow}
                    {!allDone && ordered.length > 0 && (
                      <span style={{ color: 'var(--text-secondary)', letterSpacing: '0.03em' }}> · faltam {remaining} de {ordered.length}</span>
                    )}
                  </p>
                  <p className="font-display" style={{ fontSize: 'clamp(15px, 4.3vw, 18.5px)', color: 'var(--text-primary)', lineHeight: 1.12, marginTop: 1, overflowWrap: 'anywhere' }}>
                    {heroTitle}
                  </p>
                  {heroState && (
                    <p className="font-body" style={{ fontSize: 'clamp(10.5px, 3.1vw, 12px)', color: 'var(--text-secondary)', marginTop: 1 }}>
                      {heroState}
                    </p>
                  )}
                </div>
              </div>

              {nextInProgress && nextModule && (
                <div className="relative mt-2.5 overflow-hidden rounded-full" style={{ height: 4, background: 'var(--stroke-soft)' }}>
                  <motion.div
                    initial={{ width: reduce ? `${Math.round(fractionOf(nextModule.id) * 100)}%` : 0 }}
                    animate={{ width: `${Math.round(fractionOf(nextModule.id) * 100)}%` }}
                    transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    style={{ height: '100%', borderRadius: 999, background: heroAccent }}
                  />
                </div>
              )}

              <span
                className="relative mt-3 flex w-full items-center justify-center gap-2 font-display"
                style={{ height: 38, borderRadius: 11, background: allDone ? '#5dd87a' : heroAccent, color: '#fff', fontSize: 'clamp(13px, 3.6vw, 14.5px)', boxShadow: `0 8px 18px -12px ${allDone ? '#5dd87a' : heroAccent}` }}
              >
                {allDone ? <Check size={17} strokeWidth={2.6} /> : nextModule?.kind === 'signature' ? <PenLine size={16} strokeWidth={2.4} /> : null}
                {heroCTA}
                {!allDone && nextModule?.kind !== 'signature' && <ArrowRight size={17} strokeWidth={2.4} />}
              </span>
            </motion.button>

            {/* TRILHA — 3 grupos separados visualmente; recomendado em destaque */}
            {groups.map(([section, mods], gi) => {
              const doneInSection = mods.filter(isModuleDone).length
              const lockedHint = section === 'cargo' ? employee.role : SECTION_LABEL[section]
              return (
                <section key={section} style={{ marginTop: gi === 0 ? 0 : 22 }} className="mb-2">
                  <SectionHeader label={SECTION_LABEL[section]} accent={SECTION_ACCENT[section]} done={doneInSection} total={mods.length} reduce={reduce} />
                  <div className="flex flex-col gap-2.5">
                    {mods.map((m, i) => (
                      <motion.div
                        key={m.id}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
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
                          lockedHint={lockedHint}
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        {/* frase rotativa com motion, acima do rodapé */}
        <RotatingTagline isLight={isLight} reduce={reduce} />
      </main>

      <BottomNav active="feed" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}

function SectionHeader({ label, accent, done, total, reduce }: { label: string; accent: string; done: number; total: number; reduce: boolean }) {
  const complete = total > 0 && done === total
  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0
  const color = complete ? '#5dd87a' : accent
  const band = complete ? '#5dd87a' : accent
  return (
    <div
      className="mb-3"
      style={{
        borderRadius: 13,
        padding: '8px 11px 9px',
        background: `color-mix(in srgb, ${band} 9%, transparent)`,
        border: `1px solid color-mix(in srgb, ${band} 24%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ width: 4, height: 14, borderRadius: 999, background: color, flexShrink: 0 }} />
        <h2 className="font-body font-bold uppercase" style={{ fontSize: 11, color, letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>
          {label}
        </h2>
        <span className="flex-1" />
        <span
          className="font-body font-bold"
          style={{ fontSize: 10, color, background: `color-mix(in srgb, ${band} 18%, transparent)`, borderRadius: 999, padding: '2px 8px', fontVariantNumeric: 'tabular-nums' }}
        >
          {done}/{total}
        </span>
      </div>
      <div className="relative mt-2 overflow-hidden rounded-full" style={{ height: 3, background: 'rgba(255,255,255,0.10)' }}>
        <motion.div
          initial={{ width: reduce ? `${donePercent}%` : 0 }}
          whileInView={{ width: `${donePercent}%` }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', borderRadius: 999, background: complete ? 'linear-gradient(90deg, #5dd87a, #a7f3b7)' : `linear-gradient(90deg, ${accent}, rgba(232,207,160,0.7))` }}
        />
      </div>
    </div>
  )
}

function RotatingTagline({ isLight, reduce }: { isLight: boolean; reduce: boolean }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % TAGLINES.length), 4800)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="flex flex-col items-center gap-2.5 pb-2 pt-6">
      <Leaf size={18} color="#f37435" strokeWidth={2} style={{ opacity: isLight ? 0.7 : 0.85 }} aria-hidden="true" />
      <div className="relative flex h-5 w-full items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -7 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute text-center font-body"
            style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-secondary)' }}
          >
            {TAGLINES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
