import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Volume2, VolumeX, Award, BookOpen,
  ArrowRight, FileSignature, LockKeyhole,
  PlayCircle, Sparkles, Check, RotateCcw, Settings,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { modulesForRole } from '@/lib/content'
import { useAdminStore } from '@/lib/adminStore'
import type { Module, ModuleProgress } from '@/lib/types'
import { getAdminSession } from '@/admin/auth'
import { useSession } from '../context/SessionContext'
import { getSignature } from '@/lib/storage'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'
import { isSoundOn, setSoundOn } from '@/lib/effects'

// ── tabs do "Começo da Pralis" (herdadas da aba Lis) ─────────────────────────
const INTRO_TABS = [
  { id: 'inicio',  label: 'Começo', icon: PlayCircle },
  { id: 'missao',  label: 'Missão', icon: Sparkles   },
  { id: 'visao',   label: 'Visão',  icon: BookOpen   },
  { id: 'valores', label: 'Valores', icon: Check     },
] as const

type IntroTab = (typeof INTRO_TABS)[number]['id']

function moduleDone(module: Module, progress: Record<string, ModuleProgress>, signed: boolean) {
  return module.kind === 'signature' ? signed : Boolean(progress[module.id]?.completed)
}

export default function Profile() {
  const navigate  = useNavigate()
  const { employee, progress } = useSession()
  const { data }  = useAdminStore()
  const [sound, setSound]         = useState(isSoundOn())
  const [signed, setSigned]       = useState(false)
  const [introTab, setIntroTab]   = useState<IntroTab>('inicio')

  useEffect(() => {
    if (employee) getSignature(employee.id).then((s) => setSigned(Boolean(s)))
  }, [employee, progress])

  const mods         = useMemo(() => (employee ? modulesForRole(employee.role) : []), [employee])
  const contentMods  = useMemo(() => mods.filter((m) => m.kind !== 'signature'), [mods])
  const completedContent = contentMods.filter((m) => moduleDone(m, progress, signed)).length
  const allContentDone   = contentMods.length > 0 && completedContent === contentMods.length

  const nextModule = useMemo(
    () => contentMods.find((m) => !progress[m.id]?.completed) ?? null,
    [contentMods, progress],
  )

  const introContent = useMemo(() => {
    const splash = data.splashConfig
    if (introTab === 'missao')  return { title: 'Nossa missão', body: splash.mission }
    if (introTab === 'visao')   return { title: 'Nossa visão',  body: splash.vision  }
    if (introTab === 'valores') return { title: 'Nossos valores', body: splash.values.join(' · ') }
    return {
      title: 'Rever o começo',
      body: `${splash.welcomeText}. Aqui você pode revisar missão, visão e valores antes de continuar sua jornada.`,
    }
  }, [data.splashConfig, introTab])

  if (!employee) return null

  // Admin/Gerente já logado na sua área: oferece voltar ao painel (igual ao
  // "Ver o app" do admin, no sentido inverso). Colaborador comum não vê.
  const adminSession = getAdminSession()
  const canBackToAdmin = adminSession?.role === 'dono' || adminSession?.role === 'gerente'

  const firstName    = employee.name.trim().split(/\s+/)[0] || 'colaborador'
  const intro        = INTRO_TABS.find((t) => t.id === introTab) ?? INTRO_TABS[0]
  const IntroIcon    = intro.icon
  const termsUnlocked = allContentDone || signed
  const termsDisabled = !termsUnlocked

  const openNext = () => {
    if (nextModule) navigate(`/modulo/${nextModule.id}`)
    else if (termsUnlocked) navigate('/conclusao')
  }

  const lisMessage = allContentDone
    ? `Mandou bem, ${firstName}! Agora falta só revisar os termos antes da assinatura.`
    : `Oi, ${firstName}! Eu deixei aqui o começo da Pralis e o que falta para você continuar sem se perder.`

  const toggleSound = () => {
    const n = !sound
    setSoundOn(n)
    setSound(n)
  }

  return (
    <div className="app-shell">
      <AnimatedBackground accent="#b8860b" />

      <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-4 pb-28 pt-6">

        {/* engrenagem: voltar ao Admin (só p/ admin/gerente já logado) */}
        {canBackToAdmin && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/admin')}
            aria-label="Voltar para o painel administrativo"
            className="absolute right-4 z-20 flex items-center gap-1.5"
            style={{
              top: 'calc(var(--safe-top, 0px) + 6px)',
              background: 'rgba(184,134,11,0.16)',
              border: '1px solid rgba(184,134,11,0.42)',
              color: '#e8cfa0',
              borderRadius: 999,
              padding: '6px 11px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 11.5,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            <Settings size={14} /> Painel
          </motion.button>
        )}

        {/* ════ HERO ════ */}
        <div className="mb-5 flex flex-col items-center gap-3 text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="font-body uppercase tracking-widest"
            style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: '0.22em' }}
          >
            sua guia de jornada
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div style={{
              position: 'relative',
              width: 160, height: 160, borderRadius: '50%',
              background: '#ffffff',
              border: '3px solid rgba(184,134,11,0.6)',
              boxShadow: '0 0 0 6px rgba(184,134,11,0.15), 0 16px 48px rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}>
              <video
                src="/videocirculo-dashboard.mp4"
                autoPlay loop muted playsInline
                style={{ width: '130%', height: '130%', objectFit: 'cover', objectPosition: 'center 20%', marginLeft: '-2%', marginTop: '-10%' }}
              />
            </div>
          </motion.div>

          <div>
            <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>{employee.name}</h1>
            <p className="font-body text-sm" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{employee.role}</p>
          </div>

          {signed && (
            <span
              className="flex items-center gap-1.5 px-3 py-1 font-body text-xs font-semibold"
              style={{ borderRadius: 99, background: 'rgba(74,222,128,0.14)', border: '1px solid rgba(74,222,128,0.30)', color: '#4ade80' }}
            >
              <Award size={13} /> Código assinado
            </span>
          )}
        </div>

        {/* balão da Lis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="mb-5 px-4 py-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--stroke)',
            borderRadius: '6px 18px 18px 18px',
          }}
        >
          <p className="font-body" style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {lisMessage}
          </p>
        </motion.div>

        {/* ════ CARD: SUA JORNADA ════ */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="mb-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--stroke)', borderRadius: 22, overflow: 'hidden' }}
        >
          {/* header do card */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3"
            style={{ borderBottom: '1px solid var(--stroke)' }}>
            <p className="font-body uppercase" style={{ fontSize: 10, fontWeight: 900, color: '#f37435', letterSpacing: '0.18em' }}>
              sua jornada
            </p>
            <div className="flex items-center gap-2">
              <MiniDonut done={completedContent} total={contentMods.length} />
              <div className="text-right">
                <p className="font-body text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  {completedContent}/{contentMods.length} módulos
                </p>
                <p className="font-body" style={{ fontSize: 10, color: contentMods.length - completedContent > 0 ? '#f37435' : '#4ade80' }}>
                  {contentMods.length - completedContent > 0
                    ? `${contentMods.length - completedContent} pendente${contentMods.length - completedContent !== 1 ? 's' : ''}`
                    : 'Tudo concluído!'}
                </p>
              </div>
            </div>
          </div>

          {/* barra de segmentos */}
          <div className="px-4 pt-3 pb-1">
            <ModuleSegments modules={contentMods} progress={progress} />
          </div>

          {/* próximo módulo */}
          <button
            disabled={!nextModule && termsDisabled}
            onClick={openNext}
            className="flex w-full items-center gap-3 text-left px-4 py-3"
            style={{
              borderTop: '1px solid var(--stroke)',
              opacity: !nextModule && termsDisabled ? 0.5 : 1,
            }}
          >
            <span className="flex shrink-0 items-center justify-center rounded-xl"
              style={{ width: 38, height: 38, background: '#f37435', color: '#fff' }}>
              {nextModule ? <ArrowRight size={16} /> : <FileSignature size={16} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display" style={{ fontSize: 15, lineHeight: 1.2, color: 'var(--text-primary)' }}>
                {nextModule?.title ?? (signed ? 'Certificado liberado' : 'Assinatura final')}
              </span>
              <span className="block font-body" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                {nextModule
                  ? `${nextModule.subtitle} · ${nextModule.estimatedMinutes} min`
                  : `${Math.round((completedContent / (contentMods.length || 1)) * 100)}% concluídos`}
              </span>
            </span>
            <span className="font-body text-xs font-bold shrink-0" style={{ color: '#f37435' }}>
              {nextModule ? 'Continuar' : signed ? 'Ver' : 'Assinar'}
            </span>
          </button>
        </motion.section>

        {/* ════ CARD: COMEÇO DA PRALIS ════ */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="mb-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--stroke)', borderRadius: 22, overflow: 'hidden' }}
        >
          {/* header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3"
            style={{ borderBottom: '1px solid var(--stroke)' }}>
            <p className="font-body uppercase" style={{ fontSize: 10, fontWeight: 900, color: '#f37435', letterSpacing: '0.18em' }}>
              começo da Pralis
            </p>
            <button onClick={() => navigate('/conheca?review=1')} className="font-body text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              Rever tour
            </button>
          </div>

          {/* tabs */}
          <div className="grid grid-cols-4 gap-1.5 px-4 pt-3 pb-2">
            {INTRO_TABS.map((tab) => {
              const Icon   = tab.icon
              const active = introTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setIntroTab(tab.id)}
                  className="flex min-w-0 items-center justify-center gap-1 rounded-full px-1 py-2 font-body font-bold"
                  style={{
                    background: active ? '#f37435' : 'rgba(255,255,255,0.05)',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${active ? '#f37435' : 'var(--stroke)'}`,
                    fontSize: 'clamp(9px, 2.5vw, 11px)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={11} />
                  <span className="min-w-0 truncate">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>

          {/* conteúdo da tab */}
          <motion.button
            key={introTab}
            type="button"
            onClick={() => navigate('/conheca?review=1')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex w-full items-start gap-3 px-4 pt-2 pb-4 text-left"
          >
            <span className="flex shrink-0 items-center justify-center rounded-xl"
              style={{ width: 38, height: 38, background: 'rgba(243,116,53,0.12)', color: '#f37435', marginTop: 2 }}>
              <IntroIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {introContent.title}
              </p>
              <p className="mt-1 font-body" style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {introContent.body}
              </p>
            </div>
          </motion.button>
        </motion.section>

        {/* ════ CARD: TERMOS E ASSINATURA ════ */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="mb-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--stroke)', borderRadius: 22, overflow: 'hidden' }}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3"
            style={{ borderBottom: '1px solid var(--stroke)' }}>
            <p className="font-body uppercase" style={{ fontSize: 10, fontWeight: 900, color: '#f37435', letterSpacing: '0.18em' }}>
              termos e assinatura
            </p>
            <span className="font-body text-[10px] font-black uppercase"
              style={{ color: termsUnlocked ? '#4ade80' : 'var(--text-secondary)', letterSpacing: '0.1em' }}>
              {signed ? 'Assinado ✓' : allContentDone ? 'Liberado' : 'Bloqueado'}
            </span>
          </div>

          <button
            disabled={termsDisabled}
            onClick={() => !termsDisabled && navigate('/conclusao')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
            style={{ opacity: termsDisabled ? 0.6 : 1 }}
          >
            <span className="flex shrink-0 items-center justify-center rounded-xl"
              style={{
                width: 38, height: 38,
                background: termsUnlocked ? '#5dd87a' : 'rgba(255,255,255,0.06)',
                color: termsUnlocked ? '#fff' : 'var(--text-secondary)',
              }}>
              {termsUnlocked ? <FileSignature size={16} /> : <LockKeyhole size={16} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Documentos finais
              </span>
              <span className="block font-body" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                {signed
                  ? 'Você já assinou. Pode rever o certificado.'
                  : allContentDone
                    ? 'Leia os termos e confirme quando concordar.'
                    : 'Conclua todos os módulos para liberar.'}
              </span>
            </span>
            {termsUnlocked && (
              <ArrowRight size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
            )}
          </button>
        </motion.section>

        {/* ════ CARD: CONFIGURAÇÕES ════ */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="mb-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--stroke)', borderRadius: 22, overflow: 'hidden' }}
        >
          <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--stroke)' }}>
            <p className="font-body uppercase" style={{ fontSize: 10, fontWeight: 900, color: '#f37435', letterSpacing: '0.18em' }}>
              configurações
            </p>
          </div>

          <Row onClick={toggleSound}
            icon={sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            label="Som e feedback"
            value={sound ? 'Ligado' : 'Desligado'} />
          <div style={{ height: 1, background: 'var(--stroke)', margin: '0 16px' }} />
          <Row onClick={() => navigate('/feed')}
            icon={<RotateCcw size={16} />}
            label="Voltar para home"
            value="" />
        </motion.section>

        <p className="mb-2 text-center font-body text-sm italic" style={{ color: 'var(--text-secondary)' }}>
          é provar e ser feliz 🌾
        </p>
      </main>

      <BottomNav active="profile" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}

// ── componentes auxiliares ────────────────────────────────────────────────────

// ── gráfico de rosca mini ─────────────────────────────────────────────────────

function MiniDonut({ done, total }: { done: number; total: number }) {
  const pct  = total > 0 ? done / total : 0
  const r    = 13
  const circ = 2 * Math.PI * r           // ≈ 81.68
  const dash = pct * circ

  return (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
      {/* trilha de fundo */}
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="4" />
      {/* arco de progresso */}
      <circle
        cx="18" cy="18" r={r}
        fill="none"
        stroke={pct >= 1 ? '#4ade80' : '#f37435'}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 18 18)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* texto central */}
      <text
        x="18" y="22"
        textAnchor="middle"
        fontSize="8"
        fontWeight="800"
        fontFamily="Montserrat, sans-serif"
        fill={pct >= 1 ? '#4ade80' : 'rgba(232,207,160,0.9)'}
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}

// ── barra de segmentos por módulo ─────────────────────────────────────────────

function ModuleSegments({
  modules,
  progress,
}: {
  modules: import('@/lib/types').Module[]
  progress: Record<string, import('@/lib/types').ModuleProgress>
}) {
  if (modules.length === 0) return null

  return (
    <div className="mb-3" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* barra de segmentos */}
      <div style={{ display: 'flex', gap: 3 }}>
        {modules.map((m) => {
          const done = Boolean(progress[m.id]?.completed)
          return (
            <div
              key={m.id}
              title={m.title}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: done
                  ? `linear-gradient(90deg, ${m.gradient[0]}, ${m.gradient[1]})`
                  : 'rgba(255,255,255,0.12)',
                transition: 'background 0.3s ease',
              }}
            />
          )
        })}
      </div>

      {/* legenda compacta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.55)' }}>
          {modules.filter((m) => Boolean(progress[m.id]?.completed)).length} de {modules.length} módulos concluídos
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Montserrat, sans-serif', fontSize: 9, color: 'rgba(243,116,53,0.8)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f37435', display: 'inline-block' }} /> concluído
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Montserrat, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.18)', display: 'inline-block' }} /> pendente
          </span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function Row({ onClick, icon, label, value, danger }: { onClick: () => void; icon: React.ReactNode; label: string; value: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      style={{
        background: danger ? 'rgba(243,116,53,0.10)' : 'transparent',
      }}
    >
      <span
        className="flex items-center justify-center rounded-xl"
        style={{ width: 36, height: 36, background: danger ? 'var(--orange)' : 'var(--gold)', color: '#000000' }}
      >
        {icon}
      </span>
      <span className="flex-1 font-body text-sm font-semibold" style={{ color: danger ? 'var(--orange)' : 'var(--text-primary)' }}>
        {label}
      </span>
      {value && <span className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>{value}</span>}
    </button>
  )
}
