import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowLeft, ShieldCheck } from 'lucide-react'
import { MODULES, TERMS, modulesForRole } from '@/lib/content'
import { getAdminData } from '@/lib/adminStore'
import { useSession } from '../context/SessionContext'
import { getSignature, saveSignature } from '@/lib/storage'
import type { SignatureRecord } from '@/lib/types'
import { SproutLogo } from '../components/SproutLogo'
import { PralisSymbolX } from '../components/PralisSymbol'
import { brand } from '@/lib/brand'
import { LisAvatar } from '../components/LisAvatar'
import { fireConfetti, soundComplete, hapticSuccess } from '@/lib/effects'
import { fadeUp, staggerChildren, spring } from '@/lib/animations'

export default function Completion() {
  const navigate = useNavigate()
  const { employee, progress } = useSession()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [signature, setSignature] = useState<SignatureRecord | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!employee) return
    getSignature(employee.id).then(setSignature)
  }, [employee])

  const stats = useMemo(() => {
    if (!employee) return { modules: 0, quizzes: 0 }
    const mods = modulesForRole(employee.role)
    const completed = mods.filter((m) => progress[m.id]?.completed).length
    const quizzes = MODULES.reduce(
      (acc, m) => acc + m.stories.filter((s) => s.type === 'quiz').length,
      0,
    )
    return { modules: completed, quizzes }
  }, [employee, progress])

  if (!employee) {
    navigate('/login', { replace: true })
    return null
  }

  const allChecked = TERMS.every((t) => checked[t.id])

  const sign = async () => {
    if (!allChecked) return
    setBusy(true)
    const sig: SignatureRecord = {
      signed_at: new Date().toISOString(),
      ip_address: null,
      confirmed: true,
      terms: TERMS.map((t) => t.id),
    }
    await saveSignature(employee.id, sig)
    setSignature(sig)
    setBusy(false)
    fireConfetti(2600)
    soundComplete()
    hapticSuccess()
  }

  // ----- certificado (já assinou) -----
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
              concluiu o <strong className="text-pralis-creme">Código de Ética e Conduta</strong> da
              Padaria Pralís e assinou todos os termos.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 font-body text-xs text-pralis-ouro-lt">
              <ShieldCheck className="h-4 w-4" />
              {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LisAvatar state="celebrating" size={48} />
            <p className="font-body text-xl italic text-pralis-creme">Parabéns, {employee.name.split(' ')[0]}! 🎉</p>
          </div>

          <button onClick={() => navigate('/feed')} className="btn-ghost w-full">
            <ArrowLeft className="h-5 w-5" /> Rever os módulos
          </button>
        </motion.div>
      </div>
    )
  }

  // ----- fluxo de assinatura -----
  return (
    <div className="app-shell bg-pralis-radial px-6 pb-28 pt-12">
      <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="flex flex-col gap-5">
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
          <SproutLogo size={56} />
          <h1 className="font-display text-3xl text-pralis-branco text-balance">
            Parabéns, {employee.name.split(' ')[0]}!
          </h1>
          <p className="font-body text-sm text-pralis-creme/80">
            Você concluiu o Código de Ética e Conduta da Pralís 🎉
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-center gap-3">
          <Stat label="Módulos" value={stats.modules} />
          <Stat label="Quizzes" value={stats.quizzes} />
          <Stat label="Data" value={new Date().toLocaleDateString('pt-BR')} small />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="max-h-56 overflow-y-auto rounded-card border border-pralis-ouro/25 bg-pralis-marrom-dk/40 p-4"
        >
          <div
            className="font-body text-sm leading-relaxed text-pralis-creme/85 [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:font-display [&_h3]:text-base [&_h3]:text-pralis-ouro-lt [&_h3]:first:mt-0 [&_p]:mb-2 [&_strong]:text-pralis-branco"
            dangerouslySetInnerHTML={{ __html: getAdminData().termsText }}
          />
        </motion.div>

        <motion.p variants={fadeUp} className="font-body text-sm font-semibold text-pralis-ouro-lt">
          Para finalizar, confirme a ciência dos termos:
        </motion.p>

        <motion.div variants={staggerChildren} className="flex flex-col gap-3">
          {TERMS.map((t) => {
            const on = checked[t.id]
            return (
              <motion.button
                key={t.id}
                variants={fadeUp}
                onClick={() => setChecked((p) => ({ ...p, [t.id]: !p[t.id] }))}
                className={`flex items-start gap-3 rounded-card border p-4 text-left transition-colors ${
                  on
                    ? 'border-pralis-verde bg-pralis-verde/10'
                    : 'border-pralis-marrom-lk bg-pralis-marrom-dk/40'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    on ? 'border-pralis-verde bg-pralis-verde' : 'border-pralis-creme/40'
                  }`}
                >
                  {on && <Check className="h-4 w-4 text-pralis-marrom-dk" />}
                </span>
                <span>
                  <span className="block font-display text-base text-pralis-branco">{t.title}</span>
                  <span className="block font-body text-xs leading-snug text-pralis-creme/70">{t.text}</span>
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-card border border-pralis-marrom-lk bg-pralis-marrom-dk/40 p-4"
        >
          <p className="font-body text-base italic text-pralis-creme">
            Confirmo que li e concordo, {employee.name}.
          </p>
          <p className="mt-1 font-body text-xs text-pralis-creme/50">
            {new Date().toLocaleString('pt-BR')}
          </p>
        </motion.div>
      </motion.div>

      {/* CTA fixo */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] px-6 pb-6 pt-3">
        <AnimatePresence>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            disabled={!allChecked || busy}
            onClick={sign}
            className={`btn-laranja w-full ${allChecked ? '' : 'cursor-not-allowed opacity-40'}`}
          >
            {busy ? 'Assinando…' : 'Assinar e concluir'}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
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
