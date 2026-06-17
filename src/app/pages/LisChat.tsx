import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Check,
  FileSignature,
  LockKeyhole,
  PlayCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { modulesForRole } from '@/lib/content'
import { useAdminStore } from '@/lib/adminStore'
import { getSignature } from '@/lib/storage'
import type { Module, ModuleProgress } from '@/lib/types'
import { useSession } from '../context/SessionContext'
import { LisAvatar } from '../components/LisAvatar'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'

const INTRO_TABS = [
  { id: 'inicio', label: 'Começo', icon: PlayCircle },
  { id: 'missao', label: 'Missão', icon: Sparkles },
  { id: 'visao', label: 'Visão', icon: BookOpen },
  { id: 'valores', label: 'Valores', icon: Check },
] as const

type IntroTab = (typeof INTRO_TABS)[number]['id']

function moduleDone(module: Module, progress: Record<string, ModuleProgress>, signed: boolean) {
  return module.kind === 'signature' ? signed : Boolean(progress[module.id]?.completed)
}

export default function LisChat() {
  const navigate = useNavigate()
  const { employee, progress } = useSession()
  const { data } = useAdminStore()
  const [introTab, setIntroTab] = useState<IntroTab>('inicio')
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    if (!employee) return
    getSignature(employee.id).then((signature) => setSigned(Boolean(signature)))
  }, [employee, progress])

  const modules = useMemo(() => (employee ? modulesForRole(employee.role) : []), [employee])
  const contentModules = useMemo(() => modules.filter((module) => module.kind !== 'signature'), [modules])
  const completedContent = contentModules.filter((module) => moduleDone(module, progress, signed)).length
  const allContentDone = contentModules.length > 0 && completedContent === contentModules.length
  const progressPct = contentModules.length ? Math.round((completedContent / contentModules.length) * 100) : 0

  const nextModule = useMemo(
    () => contentModules.find((module) => !progress[module.id]?.completed) ?? null,
    [contentModules, progress],
  )

  const introContent = useMemo(() => {
    const splash = data.splashConfig
    if (introTab === 'missao') return { title: 'Nossa missão', body: splash.mission }
    if (introTab === 'visao') return { title: 'Nossa visão', body: splash.vision }
    if (introTab === 'valores') return { title: 'Nossos valores', body: splash.values.join(' · ') }
    return {
      title: 'Rever o começo',
      body: `${splash.welcomeText}. Aqui você pode revisar missão, visão e valores antes de continuar sua jornada.`,
    }
  }, [data.splashConfig, introTab])

  if (!employee) return null

  const firstName = employee.name.trim().split(/\s+/)[0] || 'colaborador'
  const intro = INTRO_TABS.find((tab) => tab.id === introTab) ?? INTRO_TABS[0]
  const IntroIcon = intro.icon
  const termsUnlocked = allContentDone || signed
  const termsDisabled = !termsUnlocked

  const openNext = () => {
    if (nextModule) navigate(`/modulo/${nextModule.id}`)
    else if (termsUnlocked) navigate('/conclusao')
  }

  const lisMessage = allContentDone
    ? `Mandou bem, ${firstName}! Agora falta so revisar os termos antes da assinatura.`
    : `Oi, ${firstName}! Eu deixei aqui o começo da Pralis e o que falta para você continuar sem se perder.`

  return (
    <div className="app-shell">
      <AnimatedBackground accent="#b8860b" />

      <main className="no-scrollbar relative z-10 flex flex-1 flex-col items-center justify-start gap-5 overflow-y-auto px-5 pb-28 pt-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-body uppercase tracking-widest"
          style={{ fontSize: 10, color: '#e8cfa0', letterSpacing: '0.22em' }}
        >
          sua guia de jornada
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <LisAvatar state={allContentDone ? 'celebrating' : 'talking'} size={166} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.2 }}
          className="w-full px-5 py-5 text-left"
          style={{
            background: 'linear-gradient(135deg, rgba(94,55,49,0.90), rgba(117,72,63,0.76))',
            border: '1px solid rgba(232,207,160,0.30)',
            borderRadius: '8px 22px 22px 22px',
            boxShadow: '0 16px 34px rgba(43,22,15,0.20)',
          }}
        >
          <p className="font-body" style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.65, color: '#ffffff' }}>
            {lisMessage}
          </p>
        </motion.div>

        <section className="w-full text-left">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-body uppercase" style={{ fontSize: 10, fontWeight: 900, color: '#f37435', letterSpacing: '0.18em' }}>
              começo da Pralis
            </p>
            <button onClick={() => navigate('/conheca?review=1')} className="font-body text-xs font-bold" style={{ color: '#ffe6b8' }}>
              Rever tour
            </button>
          </div>

          <div className="grid w-full grid-cols-4 gap-1.5 pb-2">
            {INTRO_TABS.map((tab) => {
              const Icon = tab.icon
              const active = introTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setIntroTab(tab.id)}
                  className="flex min-w-0 items-center justify-center gap-1 rounded-full px-1.5 py-2 font-body font-bold"
                  style={{
                    background: active ? '#ffffff' : 'rgba(255,255,255,0.10)',
                    color: active ? '#f37435' : '#ffe6b8',
                    border: `1px solid ${active ? '#ffffff' : 'rgba(255,255,255,0.20)'}`,
                    fontSize: 'clamp(9px, 2.65vw, 11px)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={12} />
                  <span className="min-w-0 truncate">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>

          <motion.button
            key={introTab}
            type="button"
            onClick={() => navigate('/conheca?review=1')}
            whileTap={{ scale: 0.985 }}
            whileHover={{ scale: 1.01 }}
            aria-label="Rever o começo da Pralis"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 210, damping: 22 }}
            className="relative mt-2 w-full overflow-hidden p-5 text-left"
            style={{
              borderRadius: 22,
              background: 'linear-gradient(135deg, rgba(139,63,35,0.90), rgba(94,55,49,0.92))',
              border: '1px solid rgba(232,207,160,0.28)',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex shrink-0 items-center justify-center rounded-2xl"
                style={{ width: 44, height: 44, background: '#ffffff', color: '#f37435' }}
              >
                <IntroIcon size={20} />
              </span>
              <div>
                <h2 className="font-display" style={{ fontSize: 22, lineHeight: 1.05, color: '#ffffff' }}>
                  {introContent.title}
                </h2>
                <p className="mt-2 font-body" style={{ fontSize: 13, lineHeight: 1.65, color: '#ffe6d2' }}>
                  {introContent.body}
                </p>
              </div>
            </div>
          </motion.button>
        </section>

        <section className="w-full text-left">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-body uppercase" style={{ fontSize: 10, fontWeight: 900, color: '#f37435', letterSpacing: '0.18em' }}>
              próximo passo
            </p>
            <span className="font-body text-xs font-bold" style={{ color: '#ffe6b8', whiteSpace: 'nowrap' }}>
              {contentModules.length - completedContent} pendente(s)
            </span>
          </div>
          <motion.button
            whileTap={{ scale: !nextModule && termsDisabled ? 1 : 0.97 }}
            whileHover={{ scale: !nextModule && termsDisabled ? 1 : 1.01 }}
            disabled={!nextModule && termsDisabled}
            onClick={openNext}
            className="relative flex w-full items-center gap-3 overflow-hidden text-left"
            style={{
              padding: '15px 16px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #ffffff, #fff4eb)',
              border: '1px solid rgba(255,255,255,0.72)',
              opacity: !nextModule && termsDisabled ? 0.55 : 1,
            }}
          >
            <span className="flex shrink-0 items-center justify-center rounded-xl" style={{ width: 42, height: 42, background: '#f37435', color: '#ffffff' }}>
              {nextModule ? <ArrowRight size={18} /> : <FileSignature size={18} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display" style={{ fontSize: 16, lineHeight: 1.15, color: '#2b160f' }}>
                {nextModule?.title ?? (signed ? 'Certificado liberado' : 'Assinatura final')}
              </span>
              <span className="block font-body" style={{ fontSize: 11, color: '#5e3731', marginTop: 2 }}>
                {nextModule ? `${nextModule.subtitle} · ${nextModule.estimatedMinutes} min` : `${progressPct}% dos módulos concluídos`}
              </span>
            </span>
            <span className="font-body text-xs font-bold" style={{ color: '#f37435' }}>
              {nextModule ? 'Continuar' : signed ? 'Ver' : 'Assinar'}
            </span>
          </motion.button>
        </section>

        <section className="w-full text-left">
          <p className="mb-2 font-body uppercase" style={{ fontSize: 10, fontWeight: 900, color: '#f37435', letterSpacing: '0.18em' }}>
            termos e assinatura
          </p>
          <motion.button
            whileTap={{ scale: termsDisabled ? 1 : 0.98 }}
            onClick={() => !termsDisabled && navigate('/conclusao')}
            disabled={termsDisabled}
            className="w-full rounded-3xl p-4 text-left"
            style={{
              background: termsUnlocked
                ? 'linear-gradient(135deg, rgba(30,126,78,0.30), rgba(94,55,49,0.82))'
                : 'rgba(94,55,49,0.74)',
              border: `1px solid ${termsUnlocked ? '#5dd87a' : 'rgba(232,207,160,0.26)'}`,
              opacity: termsDisabled ? 0.72 : 1,
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex shrink-0 items-center justify-center rounded-2xl"
                style={{
                  width: 44,
                  height: 44,
                  background: termsUnlocked ? '#5dd87a' : 'rgba(255,255,255,0.10)',
                  color: termsUnlocked ? '#102617' : '#ffe6b8',
                }}
              >
                {termsUnlocked ? <FileSignature size={18} /> : <LockKeyhole size={18} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <strong className="font-display" style={{ fontSize: 18, color: '#ffffff' }}>
                    Documentos finais
                  </strong>
                  <span className="font-body text-[10px] font-black uppercase" style={{ color: termsUnlocked ? '#5dd87a' : '#ffe6b8', letterSpacing: '0.12em' }}>
                    {signed ? 'Assinado' : allContentDone ? 'Liberado' : `${contentModules.length - completedContent} pendente(s)`}
                  </span>
                </span>
                <span className="mt-1 block font-body" style={{ fontSize: 12, lineHeight: 1.55, color: '#ffe6d2' }}>
                  {signed
                    ? 'Você já assinou os documentos. Pode rever o certificado quando quiser.'
                    : allContentDone
                      ? 'Leia cada termo com calma, ouça a narração e confirme apenas quando concordar.'
                      : 'Os documentos aparecem aqui quando todos os módulos forem concluídos.'}
                </span>
                <span className="mt-3 flex items-center gap-2 font-body text-xs font-bold" style={{ color: termsDisabled ? '#d4a38f' : '#ffffff' }}>
                  {signed ? 'Ver certificado' : allContentDone ? 'Ler termos e assinar' : 'Termos bloqueados'}
                  {termsUnlocked ? <ArrowRight size={16} /> : <LockKeyhole size={16} />}
                </span>
              </span>
            </div>
          </motion.button>
        </section>

        <button onClick={() => navigate('/feed')} className="btn-ghost w-full">
          <RotateCcw className="h-4 w-4" />
          Voltar para home
        </button>
      </main>

      <BottomNav active="lis" onChange={(tab) => navigate(TAB_PATH[tab])} />
    </div>
  )
}
