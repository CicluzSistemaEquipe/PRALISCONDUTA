import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, FileText, Home, LockKeyhole, ShieldCheck, Volume2, X } from 'lucide-react'
import { MODULES, TERMS, modulesForRole } from '@/lib/content'
import { useAdminStore } from '@/lib/adminStore'
import { useSession } from '../context/SessionContext'
import { getSignature, saveSignature } from '@/lib/storage'
import type { SignatureRecord } from '@/lib/types'
import { SproutLogo } from '../components/SproutLogo'
import { PralisSymbolX } from '../components/PralisSymbol'
import { brand } from '@/lib/brand'
import { LisAvatar } from '../components/LisAvatar'
import { fireConfetti, hapticSuccess, soundComplete } from '@/lib/effects'
import { fadeUp, spring, staggerChildren } from '@/lib/animations'

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractTermHtml(allHtml: string, title: string, fallback: string) {
  const titlePattern = escapeRegExp(title)
  const match = allHtml.match(new RegExp(`<h3[^>]*>\\s*${titlePattern}\\s*</h3>([\\s\\S]*?)(?=<h3|$)`, 'i'))
  if (match) return `<h3>${title}</h3>${match[1]}`
  return `<h3>${title}</h3><p>${fallback}</p>`
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
    const quizzes = MODULES.reduce((acc, module) => acc + module.stories.filter((story) => story.type === 'quiz').length, 0)
    return { modules: completedModules, totalModules: contentModules.length, quizzes }
  }, [completedModules, contentModules.length])

  if (!employee) {
    navigate('/login', { replace: true })
    return null
  }

  const allChecked = TERMS.every((term) => checked[term.id])
  const selectedTerm = TERMS.find((term) => term.id === selectedTermId) ?? null
  const selectedTermHtml = selectedTerm
    ? extractTermHtml(data.termsText, selectedTerm.title, selectedTerm.text)
    : ''

  const sign = async () => {
    if (!allChecked || busy || !allModulesDone) return
    setBusy(true)
    const sig: SignatureRecord = {
      signed_at: new Date().toISOString(),
      ip_address: null,
      confirmed: true,
      terms: TERMS.map((term) => term.id),
    }
    await saveSignature(employee.id, sig)
    setSignature(sig)
    setBusy(false)
    fireConfetti(2600)
    soundComplete()
    hapticSuccess()
  }

  if (signature) {
    const date = new Date(signature.signed_at)
    return (
      <div className="app-shell bg-pralis-radial px-6 pb-10 pt-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="flex flex-1 flex-col items-center justify-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="flex h-32 w-32 items-center justify-center rounded-full bg-pralis-ouro/15 ring-2 ring-pralis-ouro/40"
          >
            <PralisSymbolX size={96} animate delay={0.2} />
          </motion.div>

          <div className="flex flex-col items-center">
            <img src={brand.logoBege} alt="Padaria Pralís" className="h-10 w-auto" />
            <p className="mt-2 font-body text-xs uppercase tracking-widest text-pralis-creme/60">
              Certificado de Conclusão
            </p>
          </div>

          <div className="w-full rounded-card border border-pralis-ouro/30 bg-pralis-marrom-dk/50 p-6">
            <p className="font-body text-sm text-pralis-creme/80">Certificamos que</p>
            <p className="my-2 font-display text-2xl text-pralis-branco">{employee.name}</p>
            <p className="font-body text-sm leading-relaxed text-pralis-creme/80">
              concluiu o <strong className="text-pralis-creme">Código de Ética e Conduta</strong> da Padaria Pralís e assinou todos os termos.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 font-body text-xs text-pralis-ouro-lt">
              <ShieldCheck className="h-4 w-4" />
              {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LisAvatar state="celebrating" size={48} />
            <p className="font-body text-xl italic text-pralis-creme">Parabéns, {employee.name.split(' ')[0]}!</p>
          </div>

          <button onClick={() => navigate('/feed')} className="btn-ghost w-full">
            <ArrowLeft className="h-5 w-5" /> Voltar para home
          </button>
        </motion.div>
      </div>
    )
  }

  if (!allModulesDone) {
    return (
      <div className="app-shell bg-pralis-radial px-6 pb-10 pt-12">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
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
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell bg-pralis-radial px-6 pb-32 pt-10">
      <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="flex flex-col gap-5">
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

        <motion.div variants={fadeUp} className="rounded-3xl border border-pralis-ouro/25 bg-pralis-marrom-dk/50 p-4">
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
      </motion.div>

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
