import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, FileText, Home, LockKeyhole, ShieldCheck, Volume2, X } from 'lucide-react'
import { TERMS, modulesForRole } from '@/lib/content'
import { useAdminStore } from '@/lib/adminStore'
import { useSession } from '../context/SessionContext'
import { getSignature, saveSignature } from '@/lib/storage'
import { getAdminUsers } from '@/admin/auth'
import { enviarNotificacao } from '@/lib/notifications'
import { registrarEvento } from '@/lib/tracking'
import type { SignatureRecord } from '@/lib/types'
import { SproutLogo } from '../components/SproutLogo'
import { PralisSymbolX } from '../components/PralisSymbol'
import { brand } from '@/lib/brand'
import { LisAvatar } from '../components/LisAvatar'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { fireConfetti, hapticSuccess, soundComplete } from '@/lib/effects'
import { fadeUp, spring, staggerChildren } from '@/lib/animations'
import { isDevMode } from '@/lib/devMode'

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractTermHtml(allHtml: string, title: string, fallback: string) {
  const source = allHtml.trim()
  if (!source) return `<h3>${title}</h3><p>${fallback}</p>`

  const titlePattern = escapeRegExp(title)
  const headingPattern = `<h[1-4][^>]*>\\s*${titlePattern}\\s*</h[1-4]>`
  const match = source.match(new RegExp(`${headingPattern}([\\s\\S]*?)(?=<h[1-4][^>]*>|$)`, 'i'))
  if (match) return sanitizeTermHtml(`<h3>${title}</h3>${match[1]}`)

  return sanitizeTermHtml(`<h3>${title}</h3><p>${fallback}</p>`)
}

function sanitizeTermHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\s(on\w+)=(["']).*?\2/gi, '')
    .replace(/\s(on\w+)=([^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

export default function Completion() {
  const navigate = useNavigate()
  const { employee, progress } = useSession()
  const { data } = useAdminStore()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [signature, setSignature] = useState<SignatureRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null)

  useEffect(() => {
    if (!employee) return
    getSignature(employee.id).then(setSignature)
  }, [employee])

  const modules = useMemo(() => (employee ? modulesForRole(employee.role) : []), [employee])
  const contentModules = useMemo(() => modules.filter((module) => module.kind !== 'signature'), [modules])
  const completedModules = contentModules.filter((module) => progress[module.id]?.completed).length
  const allModulesDone = contentModules.length > 0 && completedModules === contentModules.length

  const stats = useMemo(() => {
    const quizzes = contentModules.reduce((acc, module) => acc + module.stories.filter((story) => story.type === 'quiz').length, 0)
    return { modules: completedModules, totalModules: contentModules.length, quizzes }
  }, [completedModules, contentModules])

  // notifica (uma única vez) quando o colaborador conclui todos os módulos
  useEffect(() => {
    if (!employee || !allModulesDone) return
    const flag = `pralis:notif:treinamento:${employee.id}`
    if (localStorage.getItem(flag)) return
    localStorage.setItem(flag, new Date().toISOString())
    const gerente = employee.gerenteId
      ? getAdminUsers().find((u) => u.id === employee.gerenteId)
      : undefined
    void enviarNotificacao({
      tipo: 'treinamento_concluido',
      colaboradorNome: employee.name,
      colaboradorId: employee.id,
      gerenteNome: gerente?.nome,
      gerenteEmail: gerente?.email,
      data: new Date().toISOString(),
      extra: { cargo: employee.role, modulos: contentModules.length },
    })
  }, [employee, allModulesDone, contentModules.length])

  if (!employee) {
    return <Navigate to="/login" replace />
  }

  const allChecked = TERMS.every((term) => checked[term.id])
  const selectedTerm = TERMS.find((term) => term.id === selectedTermId) ?? null
  const selectedTermHtml = selectedTerm
    ? extractTermHtml(data.termsText ?? '', selectedTerm.title, selectedTerm.text)
    : ''

  const sign = async () => {
    if (!allChecked || busy || (!allModulesDone && !isDevMode())) return
    setBusy(true)

    // Hash do documento exato que o colaborador assinou (integridade probatória).
    let documentHash: string | undefined
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.termsText ?? ''))
        documentHash = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      }
    } catch {
      /* hash best-effort — não bloqueia a assinatura */
    }

    const sig: SignatureRecord = {
      signed_at: new Date().toISOString(),
      ip_address: null,
      confirmed: true,
      terms: TERMS.map((term) => term.id),
      terms_version: data.termsVersion,
      document_hash: documentHash,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      signer_name: employee.name,
      signer_cpf: employee.phone || undefined,
      app_version: '1.0.0',
    }
    await saveSignature(employee.id, sig)
    setSignature(sig)
    setBusy(false)
    fireConfetti(2600)
    soundComplete()
    hapticSuccess()

    // tracking + notificação de assinatura concluída
    void registrarEvento({ tipo: 'assinatura', colaboradorId: employee.id })
    const gerente = employee.gerenteId
      ? getAdminUsers().find((u) => u.id === employee.gerenteId)
      : undefined
    void enviarNotificacao({
      tipo: 'assinatura_concluida',
      colaboradorNome: employee.name,
      colaboradorId: employee.id,
      gerenteNome: gerente?.nome,
      gerenteEmail: gerente?.email,
      data: sig.signed_at,
      extra: { cargo: employee.role },
    })
  }

  if (signature) {
    const date = new Date(signature.signed_at)
    const firstName = employee.name.trim().split(/\s+/)[0]
    return (
      <div className="app-shell">
        <AnimatedBackground accent="#b8860b" />
        <main className="no-scrollbar relative z-10 flex-1 overflow-y-auto px-5 pb-10 pt-10">

          {/* ── avatar celebrando ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-5 flex flex-col items-center gap-2"
          >
            <LisAvatar state="celebrating" size={88} />
            <p className="font-display text-2xl text-pralis-branco">
              Parabéns, {firstName}!
            </p>
            <p className="font-body text-sm text-pralis-creme/70">
              Você concluiu sua jornada na Pralís.
            </p>
          </motion.div>

          {/* ── card certificado ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="relative mb-5 overflow-hidden rounded-[28px] px-6 py-7 text-center"
            style={{
              background: 'linear-gradient(160deg, rgba(60,35,18,0.95) 0%, rgba(30,16,8,0.98) 100%)',
              border: '1px solid rgba(184,134,11,0.45)',
              boxShadow: '0 0 0 1px rgba(184,134,11,0.12), 0 24px 64px rgba(0,0,0,0.55)',
            }}
          >
            {/* decoração de fundo */}
            <img
              src={brand.simboloEspiga}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-[0.055]"
            />
            <img
              src={brand.simboloEspiga}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rotate-180 opacity-[0.055]"
            />

            {/* logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.28, duration: 0.35 }}
              className="mb-4 flex flex-col items-center gap-2"
            >
              <PralisSymbolX size={52} animate delay={0.3} />
              <img src={brand.logoBege} alt="Padaria Pralís" className="h-7 w-auto opacity-90" />
            </motion.div>

            {/* separador */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'rgba(184,134,11,0.3)' }} />
              <span className="font-body text-[9px] font-black uppercase tracking-[0.25em] text-pralis-ouro-lt opacity-80">
                Certificado de Conclusão
              </span>
              <div className="h-px flex-1" style={{ background: 'rgba(184,134,11,0.3)' }} />
            </div>

            {/* nome */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.35 }}
            >
              <p className="font-body text-xs text-pralis-creme/60">Certificamos que</p>
              <p className="my-1.5 font-display text-3xl leading-tight text-pralis-branco">
                {employee.name}
              </p>
              <p className="font-body text-sm leading-relaxed text-pralis-creme/80">
                concluiu o{' '}
                <strong className="font-semibold text-pralis-creme">Código de Ética e Conduta</strong>{' '}
                da Padaria Pralís e assinou todos os termos de compromisso.
              </p>
            </motion.div>

            {/* separador */}
            <div className="my-5 h-px w-full" style={{ background: 'rgba(184,134,11,0.2)' }} />

            {/* data + cargo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-body text-[10px] text-pralis-creme/50 uppercase tracking-widest">Cargo</p>
                <p className="font-body text-sm font-semibold text-pralis-creme/90">{employee.role}</p>
              </div>
              <div className="text-right">
                <p className="font-body text-[10px] text-pralis-creme/50 uppercase tracking-widest">Assinado em</p>
                <div className="flex items-center justify-end gap-1 font-body text-sm font-semibold text-pralis-ouro-lt">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {date.toLocaleDateString('pt-BR')}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── tagline ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mb-6 text-center font-body text-sm italic text-pralis-creme/50"
          >
            a prova é ser feliz 🌾
          </motion.p>

          {/* ── botão ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.35 }}
          >
            <button onClick={() => navigate('/feed')} className="btn-ghost w-full">
              <ArrowLeft className="h-5 w-5" /> Voltar para home
            </button>
          </motion.div>

        </main>
      </div>
    )
  }

  if (!allModulesDone && !isDevMode()) {
    return (
      <div className="app-shell">
        <AnimatedBackground />
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 pb-10 pt-12 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pralis-marrom-dk/70 ring-1 ring-pralis-creme/20">
            <LockKeyhole className="h-9 w-9 text-pralis-creme" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-pralis-branco">Assinatura bloqueada</h1>
            <p className="mt-3 font-body text-sm leading-relaxed text-pralis-creme/80">
              Os termos aparecem depois que todos os módulos forem concluídos. Você já concluiu {completedModules} de {contentModules.length}.
            </p>
          </div>
          <button onClick={() => navigate('/feed')} className="btn-laranja w-full">
            <Home className="h-5 w-5" /> Voltar para home
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AnimatedBackground />
      <motion.main
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 overflow-y-auto px-6 pb-32 pt-10"
      >
        <div className="flex flex-col gap-5">
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
          <SproutLogo size={56} />
          <h1 className="font-display text-3xl text-pralis-branco text-balance">
            Parabéns, {employee.name.split(' ')[0]}!
          </h1>
          <p className="font-body text-sm text-pralis-creme/80">
            Antes de assinar, abra cada documento, leia com calma e use a voz se quiser acompanhar.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center gap-3">
          <Stat label="Módulos" value={`${stats.modules}/${stats.totalModules}`} />
          <Stat label="Quizzes" value={stats.quizzes} />
          <Stat label="Versão" value={data.termsVersion} small />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-pralis-ouro/25 bg-pralis-marrom-dk/50 p-4"
        >
          <img
            src={brand.simboloEspiga}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 opacity-[0.06]"
          />
          <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-pralis-ouro-lt">
            documentos para revisar
          </p>
          <p className="mt-2 font-body text-sm leading-relaxed text-pralis-creme/80">
            O conteúdo vem do admin e está preparado para crescer. Hoje cada termo abre em uma leitura própria antes de liberar a concordância.
          </p>
        </motion.div>

        <motion.div variants={staggerChildren} className="flex flex-col gap-3">
          {TERMS.map((term) => {
            const agreed = Boolean(checked[term.id])
            return (
              <motion.button
                key={term.id}
                variants={fadeUp}
                onClick={() => setSelectedTermId(term.id)}
                className="flex items-start gap-3 rounded-3xl border p-4 text-left"
                style={{
                  background: agreed ? 'rgba(93,216,122,0.16)' : 'rgba(63,36,31,0.58)',
                  borderColor: agreed ? 'rgba(93,216,122,0.55)' : 'rgba(232,207,160,0.24)',
                }}
              >
                <span
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: agreed ? '#5dd87a' : '#ffffff', color: agreed ? '#102617' : '#f37435' }}
                >
                  {agreed ? <Check className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base text-pralis-branco">{term.title}</span>
                  <span className="mt-1 block font-body text-xs leading-snug text-pralis-creme/70">
                    {agreed ? 'Lido e confirmado.' : 'Toque para ler antes de concordar.'}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-3xl border border-pralis-marrom-lk bg-pralis-marrom-dk/40 p-4">
          <p className="font-body text-base italic text-pralis-creme">
            Confirmo que li e concordo, {employee.name}.
          </p>
          <p className="mt-1 font-body text-xs text-pralis-creme/50">{new Date().toLocaleString('pt-BR')}</p>
        </motion.div>
        </div>
      </motion.main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[480px] gap-2 px-6 pb-6 pt-3">
        <button onClick={() => navigate('/feed')} className="btn-ghost flex-1">
          <Home className="h-5 w-5" /> Home
        </button>
        <button
          disabled={!allChecked || busy}
          onClick={sign}
          className={`btn-laranja flex-[1.5] ${allChecked ? '' : 'cursor-not-allowed opacity-40'}`}
        >
          {busy ? 'Assinando...' : 'Assinar e concluir'}
        </button>
      </div>

      <AnimatePresence>
        {selectedTerm && (
          <TermReader
            key={selectedTerm.id}
            title={selectedTerm.title}
            html={selectedTermHtml}
            agreed={Boolean(checked[selectedTerm.id])}
            onClose={() => setSelectedTermId(null)}
            onAgree={() => {
              setChecked((prev) => ({ ...prev, [selectedTerm.id]: true }))
              setSelectedTermId(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TermReader({
  title,
  html,
  agreed,
  onClose,
  onAgree,
}: {
  title: string
  html: string
  agreed: boolean
  onClose: () => void
  onAgree: () => void
}) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  const speak = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(stripHtml(html))
    utter.lang = 'pt-BR'
    utter.rate = 0.92
    utter.pitch = 1.04
    utter.onend = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utter)
  }

  const stop = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col bg-pralis-marrom px-5 pb-6 pt-5"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 32 }}
      transition={spring}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] font-black uppercase tracking-[0.18em] text-pralis-laranja">leitura do termo</p>
          <h2 className="mt-1 font-display text-2xl leading-none text-pralis-branco">{title}</h2>
        </div>
        <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-pralis-laranja">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={speaking ? stop : speak} className="btn-ghost flex-1">
          <Volume2 className="h-5 w-5" />
          {speaking ? 'Parar voz' : 'Ouvir termo'}
        </button>
      </div>

      <div
        className="no-scrollbar mt-4 flex-1 overflow-y-auto rounded-3xl border border-pralis-creme/20 bg-pralis-marrom-dk/58 p-5 font-body text-sm leading-relaxed text-pralis-creme/90 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-pralis-branco [&_p]:mb-3 [&_strong]:text-white"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="btn-ghost flex-1">
          Voltar
        </button>
        <button onClick={onAgree} className="btn-laranja flex-[1.4]">
          {agreed ? 'Já confirmado' : 'Li e concordo'}
        </button>
      </div>
    </motion.div>
  )
}

function Stat({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="flex min-w-[88px] flex-col items-center rounded-2xl bg-pralis-marrom-dk/50 px-3 py-3">
      <span className={`font-display text-pralis-laranja ${small ? 'text-base' : 'text-2xl'}`}>{value}</span>
      <span className="font-body text-xs text-pralis-creme/60">{label}</span>
    </div>
  )
}
