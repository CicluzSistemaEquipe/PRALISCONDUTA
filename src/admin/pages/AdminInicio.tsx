import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react'
import { useAdminStore, type SplashConfig } from '@/lib/adminStore'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { moveItem } from '../lib/modules'

export default function AdminInicio() {
  const { data, setSplash } = useAdminStore()
  const [draft, setDraft] = useState<SplashConfig>(data.splashConfig)
  const [toast, setToast] = useState(false)

  const set = (patch: Partial<SplashConfig>) => setDraft((d) => ({ ...d, ...patch }))
  const setValue = (i: number, v: string) => set({ values: draft.values.map((x, idx) => (idx === i ? v : x)) })
  const setIntro = (k: 'geral' | 'cargo' | 'final', v: string) => set({ homeIntros: { ...draft.homeIntros, [k]: v } })
  const setPhrase = (i: number, v: string) => set({ footerPhrases: draft.footerPhrases.map((x, idx) => (idx === i ? v : x)) })
  const save = () => {
    setSplash(draft)
    setToast(true)
    window.setTimeout(() => setToast(false), 1800)
  }

  return (
    <>
      <AdminPageHeader eyebrow="Tela inicial" title="Início" description="Boas-vindas, missão, visão e valores exibidos no app." />

      <div className="grid gap-7 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          <div className="adm-card p-5">
            <label className="adm-label">Texto de boas-vindas (splash)</label>
            <textarea className="adm-input" rows={2} value={draft.welcomeText} onChange={(e) => set({ welcomeText: e.target.value })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="adm-card p-5">
              <label className="adm-label">Missão</label>
              <textarea className="adm-input" rows={4} value={draft.mission} onChange={(e) => set({ mission: e.target.value })} />
            </div>
            <div className="adm-card p-5">
              <label className="adm-label">Visão</label>
              <textarea className="adm-input" rows={4} value={draft.vision} onChange={(e) => set({ vision: e.target.value })} />
            </div>
          </div>

          <div className="adm-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="adm-label mb-0">Valores</label>
              <button className="adm-btn px-3 py-1.5" onClick={() => set({ values: [...draft.values, 'Novo valor'] })}>
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {draft.values.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className="adm-input" value={v} onChange={(e) => setValue(i, e.target.value)} />
                  <button className="adm-btn px-2 py-2" disabled={i === 0} onClick={() => set({ values: moveItem(draft.values, i, i - 1) })}><ChevronUp className="h-4 w-4" /></button>
                  <button className="adm-btn px-2 py-2" disabled={i === draft.values.length - 1} onClick={() => set({ values: moveItem(draft.values, i, i + 1) })}><ChevronDown className="h-4 w-4" /></button>
                  <button className="adm-btn adm-btn--danger px-2 py-2" onClick={() => set({ values: draft.values.filter((_, idx) => idx !== i) })}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {draft.values.length === 0 && <p className="text-sm text-[var(--cream-muted)]">Nenhum valor cadastrado.</p>}
            </div>
          </div>

          <div className="adm-card p-5">
            <label className="adm-label mb-0">Descrição das seções da Home</label>
            <p className="mb-3 mt-1 text-[0.8rem] text-[var(--text-muted)]">Texto curto que aparece em cada grupo do treinamento (Para todos · Para o seu cargo · Para concluir).</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="adm-label">Para todos</label>
                <input className="adm-input" value={draft.homeIntros.geral} onChange={(e) => setIntro('geral', e.target.value)} />
              </div>
              <div>
                <label className="adm-label">Para o seu cargo</label>
                <input className="adm-input" value={draft.homeIntros.cargo} onChange={(e) => setIntro('cargo', e.target.value)} />
              </div>
              <div>
                <label className="adm-label">Para concluir</label>
                <input className="adm-input" value={draft.homeIntros.final} onChange={(e) => setIntro('final', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="adm-card p-5">
            <div className="mb-1 flex items-center justify-between">
              <label className="adm-label mb-0">Frases do rodapé</label>
              <button className="adm-btn px-3 py-1.5" onClick={() => set({ footerPhrases: [...draft.footerPhrases, 'Nova frase'] })}>
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
            <p className="mb-3 text-[0.8rem] text-[var(--text-muted)]">Mensagens que se alternam acima do rodapé da Home.</p>
            <div className="flex flex-col gap-2">
              {draft.footerPhrases.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className="adm-input" value={v} onChange={(e) => setPhrase(i, e.target.value)} />
                  <button className="adm-btn px-2 py-2" disabled={i === 0} onClick={() => set({ footerPhrases: moveItem(draft.footerPhrases, i, i - 1) })}><ChevronUp className="h-4 w-4" /></button>
                  <button className="adm-btn px-2 py-2" disabled={i === draft.footerPhrases.length - 1} onClick={() => set({ footerPhrases: moveItem(draft.footerPhrases, i, i + 1) })}><ChevronDown className="h-4 w-4" /></button>
                  <button className="adm-btn adm-btn--danger px-2 py-2" onClick={() => set({ footerPhrases: draft.footerPhrases.filter((_, idx) => idx !== i) })}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {draft.footerPhrases.length === 0 && <p className="text-sm text-[var(--cream-muted)]">Nenhuma frase.</p>}
            </div>
          </div>
        </div>

        {/* preview */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <p className="adm-label mb-2 text-center">Pré-visualização</p>
            <div
              className="mx-auto flex flex-col items-center"
              style={{ width: 240, height: 470, borderRadius: 36, border: '7px solid #2b2620', background: '#0a0600', overflow: 'hidden', position: 'relative' }}
            >
              <div
                className="adm-no-scrollbar"
                style={{ position: 'absolute', inset: 0, padding: '34px 16px 16px', overflowY: 'auto', textAlign: 'center', background: 'radial-gradient(120% 55% at 50% 0%, rgba(184,134,11,0.35), transparent 65%), #0a0600' }}
              >
                <img src={brand.logoSVGBranca} alt="" style={{ width: 120, margin: '8px auto 14px', filter: FILTER_WHITE }} />
                <p style={{ fontSize: '0.66rem', fontStyle: 'italic', color: 'rgba(232,207,160,0.75)' }}>{draft.welcomeText}</p>
                <div style={{ marginTop: 16, textAlign: 'left' }}>
                  <p style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.1em', color: '#d4a017', textTransform: 'uppercase' }}>Missão</p>
                  <p style={{ fontSize: '0.6rem', color: 'rgba(247,236,214,0.82)', marginTop: 3, lineHeight: 1.45 }}>{draft.mission}</p>
                  <p style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.1em', color: '#d4a017', textTransform: 'uppercase', marginTop: 12 }}>Valores</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                    {draft.values.map((v, i) => (
                      <span key={i} style={{ fontSize: '0.52rem', padding: '3px 8px', borderRadius: 999, background: 'rgba(184,134,11,0.16)', border: '1px solid rgba(184,134,11,0.3)', color: '#e8cfa0' }}>{v}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button onClick={save} className="adm-btn adm-btn--primary fixed bottom-6 right-6 z-50" style={{ boxShadow: '0 0 30px rgba(184,134,11,0.45), 0 10px 30px rgba(0,0,0,0.4)' }}>
        <Check className="h-4 w-4" /> Salvar
      </button>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="adm-toast">
            <Check className="h-4 w-4" /> Salvo ✓
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
