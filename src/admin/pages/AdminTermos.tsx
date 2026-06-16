import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertTriangle, X, Eye } from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import { AdminPageHeader } from '../components/AdminPageHeader'

export default function AdminTermos() {
  const { data, setTerms } = useAdminStore()
  const [text, setText] = useState(data.termsText)
  const [version, setVersion] = useState(data.termsVersion)
  const [date, setDate] = useState(data.termsEffectiveDate)
  const [confirm, setConfirm] = useState(false)
  const [toast, setToast] = useState(false)

  const save = () => {
    setTerms({ termsText: text, termsVersion: version, termsEffectiveDate: date })
    setConfirm(false)
    setToast(true)
    window.setTimeout(() => setToast(false), 1800)
  }

  return (
    <>
      <AdminPageHeader eyebrow="Compliance" title="Termos de Conduta" description="Texto, versão e vigência dos termos assinados no app." />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="adm-card p-4">
              <label className="adm-label">Versão</label>
              <input className="adm-input" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0" />
            </div>
            <div className="adm-card p-4">
              <label className="adm-label">Data de vigência</label>
              <input type="date" className="adm-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="adm-card p-4">
            <label className="adm-label">Texto dos termos (aceita HTML simples: &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;)</label>
            <textarea className="adm-input font-mono text-xs" rows={16} value={text} onChange={(e) => setText(e.target.value)} />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[rgba(232,176,75,0.35)] bg-[rgba(232,176,75,0.1)] p-3.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[#e8b04b]" />
            <p className="text-xs text-[var(--cream)]">
              Colaboradores que <strong>já assinaram</strong> ficam vinculados à versão anterior. A nova versão vale apenas para assinaturas futuras.
            </p>
          </div>
        </div>

        {/* preview renderizado */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-[var(--cream-muted)]">
            <Eye className="h-4 w-4" /> <span className="adm-label mb-0">Pré-visualização</span>
          </div>
          <div className="adm-card max-h-[520px] overflow-y-auto p-6">
            <div className="mb-3 flex items-center gap-2 text-xs text-[var(--cream-muted)]">
              <span className="adm-badge adm-badge--gold">{version}</span>
              <span>vigência: {date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</span>
            </div>
            <div className="adm-terms-preview" dangerouslySetInnerHTML={{ __html: text }} />
          </div>
        </div>
      </div>

      <button onClick={() => setConfirm(true)} className="adm-btn adm-btn--primary fixed bottom-6 right-6 z-40" style={{ boxShadow: '0 0 30px rgba(184,134,11,0.45), 0 10px 30px rgba(0,0,0,0.4)' }}>
        <Check className="h-4 w-4" /> Salvar termos
      </button>

      {/* modal de confirmação */}
      <AnimatePresence>
        {confirm && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/65" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="adm-card adm-card--gold w-full max-w-[400px] p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="adm-h1 text-lg">Confirmar publicação</h2>
                  <button onClick={() => setConfirm(false)} className="text-[var(--cream-muted)]"><X className="h-5 w-5" /></button>
                </div>
                <p className="text-sm text-[var(--cream-muted)]">
                  Publicar os termos <strong className="text-[var(--cream)]">{version}</strong>? Assinaturas anteriores permanecem vinculadas à versão antiga.
                </p>
                <div className="mt-5 flex gap-2">
                  <button className="adm-btn flex-1" onClick={() => setConfirm(false)}>Cancelar</button>
                  <button className="adm-btn adm-btn--primary flex-1" onClick={save}>Publicar</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="adm-toast">
            <Check className="h-4 w-4" /> Termos salvos ✓
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
