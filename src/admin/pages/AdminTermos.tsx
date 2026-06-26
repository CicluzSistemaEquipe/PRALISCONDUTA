import { useState } from 'react'
import { AnimatePresence, motion, Reorder } from 'framer-motion'
import {
  Check, AlertTriangle, X, Eye,
  Tag, CalendarDays, ShieldCheck, Save,
  Plus, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown,
} from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState } from '../components/ui'

// ── tipos ────────────────────────────────────────────────────────────────────
interface TermItem {
  id: string
  title: string
  body: string
}

// ── helpers ──────────────────────────────────────────────────────────────────
function parseTerms(html: string): TermItem[] {
  const matches = [...html.matchAll(/<h3>(.*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)]
  if (matches.length === 0) return []
  return matches.map((m, i) => ({
    id: `t-${Date.now()}-${i}`,
    title: m[1].trim(),
    body: m[2].trim(),
  }))
}

function serializeTerms(terms: TermItem[]): string {
  return terms.map((t) => `<h3>${t.title}</h3>\n<p>${t.body}</p>`).join('\n\n')
}

function makeId() { return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

// ── card de um termo ──────────────────────────────────────────────────────────
function TermCard({
  term, index, total,
  onChange, onDelete, onMoveUp, onMoveDown,
}: {
  term: TermItem
  index: number
  total: number
  onChange: (id: string, patch: Partial<TermItem>) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}) {
  const [editing,    setEditing]    = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [localTitle, setLocalTitle] = useState(term.title)
  const [localBody,  setLocalBody]  = useState(term.body)

  const commit = () => {
    onChange(term.id, { title: localTitle, body: localBody })
    setEditing(false)
  }

  const cancel = () => {
    setLocalTitle(term.title)
    setLocalBody(term.body)
    setEditing(false)
  }

  return (
    <Reorder.Item value={term} dragListener={!editing} className="list-none">
      <motion.div
        layout
        className={`mb-2.5 overflow-hidden rounded-xl border bg-white transition-colors ${
          editing ? 'border-[var(--accent)]' : 'border-[var(--border)]'
        }`}
      >
        {/* ── cabeçalho do card ── */}
        <div className={`flex items-center gap-2.5 px-3.5 py-3 ${editing ? 'border-b border-[var(--border)]' : ''}`}>
          {/* drag handle */}
          <span
            className="flex shrink-0 cursor-grab text-[var(--text-disabled)] active:cursor-grabbing"
            aria-hidden="true"
          >
            <GripVertical size={16} />
          </span>

          {/* número */}
          <span className="adm-badge adm-badge--muted shrink-0 font-mono tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* título / input */}
          {editing ? (
            <input
              autoFocus
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              aria-label="Título do termo"
              placeholder="Título do termo"
              className="adm-input min-w-0 flex-1 border-transparent !px-2 font-semibold"
            />
          ) : (
            <span className="min-w-0 flex-1 truncate font-semibold text-[var(--ink)]">
              {term.title || <span className="italic text-[var(--text-muted)]">Sem título</span>}
            </span>
          )}

          {/* ações */}
          {!editing && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onMoveUp(term.id)}
                disabled={index === 0}
                aria-label="Mover para cima"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronUp size={15} />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(term.id)}
                disabled={index === total - 1}
                aria-label="Mover para baixo"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronDown size={15} />
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Editar termo"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
              >
                <Pencil size={14} />
              </button>
              {!confirmDel ? (
                <button
                  type="button"
                  onClick={() => setConfirmDel(true)}
                  aria-label="Excluir termo"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]"
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 pl-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDel(false)}
                    className="rounded-md px-2 py-1 text-[0.6875rem] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)]"
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(term.id)}
                    className="rounded-md border border-[var(--danger)] bg-[var(--danger)] px-2 py-1 text-[0.6875rem] font-semibold text-white transition-colors hover:bg-[#a93226]"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── corpo: visualização ou edição ── */}
        <AnimatePresence initial={false}>
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3.5 pt-3.5">
                <label className="adm-label" htmlFor={`term-body-${term.id}`}>Texto do termo</label>
                <textarea
                  id={`term-body-${term.id}`}
                  rows={4}
                  value={localBody}
                  onChange={(e) => setLocalBody(e.target.value)}
                  placeholder="Descreva o conteúdo deste termo…"
                  className="adm-input"
                />
              </div>

              <div className="flex gap-2.5 px-3.5 pb-3.5 pt-3">
                <button type="button" onClick={cancel} className="adm-btn flex-1">
                  Cancelar
                </button>
                <button type="button" onClick={commit} className="adm-btn adm-btn--primary flex-[2]">
                  <Check size={15} strokeWidth={2.2} /> Salvar termo
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3.5 pb-3 pl-[46px]"
            >
              <p className="line-clamp-2 text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
                {term.body || <span className="italic text-[var(--text-muted)]">Sem conteúdo</span>}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  )
}

// ── página principal ──────────────────────────────────────────────────────────
export default function AdminTermos() {
  const { data, setTerms } = useAdminStore()

  const [terms,   setTermsList] = useState<TermItem[]>(() => parseTerms(data.termsText))
  const [version, setVersion]   = useState(data.termsVersion)
  const [date,    setDate]      = useState(data.termsEffectiveDate)
  const [confirm, setConfirm]   = useState(false)
  const [toast,   setToast]     = useState(false)

  const serialized = serializeTerms(terms)

  const dirty =
    serialized !== data.termsText ||
    version    !== data.termsVersion ||
    date       !== data.termsEffectiveDate

  const save = () => {
    setTerms({ termsText: serialized, termsVersion: version, termsEffectiveDate: date })
    setConfirm(false)
    setToast(true)
    window.setTimeout(() => setToast(false), 2000)
  }

  const addTerm = () => {
    setTermsList((prev) => [...prev, { id: makeId(), title: '', body: '' }])
  }

  const updateTerm = (id: string, patch: Partial<TermItem>) => {
    setTermsList((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const deleteTerm = (id: string) => {
    setTermsList((prev) => prev.filter((t) => t.id !== id))
  }

  const moveUp = (id: string) => {
    setTermsList((prev) => {
      const i = prev.findIndex((t) => t.id === id)
      if (i <= 0) return prev
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
  }

  const moveDown = (id: string) => {
    setTermsList((prev) => {
      const i = prev.findIndex((t) => t.id === id)
      if (i >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next
    })
  }

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  return (
    <>
      <AdminPageHeader
        eyebrow="Conformidade"
        title="Termos de Conduta"
        description="Gerencie, edite e publique os termos que os colaboradores assinam no app."
        action={
          <button
            type="button"
            onClick={() => setConfirm(true)}
            disabled={!dirty}
            className="adm-btn adm-btn--primary"
          >
            <Save className="h-[18px] w-[18px]" strokeWidth={2} /> Publicar versão
          </button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">

        {/* ══ coluna esquerda: editor ══ */}
        <div className="flex flex-col gap-4">

          {/* versão + data */}
          <div className="adm-card p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-4 w-[3px] rounded-full bg-[var(--accent)]" />
              <h2 className="text-[0.95rem] font-semibold text-[var(--ink)]">Identificação da versão</h2>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="adm-label flex items-center gap-1.5" htmlFor="terms-version">
                  <Tag size={12} strokeWidth={1.8} /> Versão
                </label>
                <input
                  id="terms-version"
                  className="adm-input"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                />
              </div>
              <div>
                <label className="adm-label flex items-center gap-1.5" htmlFor="terms-date">
                  <CalendarDays size={12} strokeWidth={1.8} /> Vigência
                </label>
                <input
                  id="terms-date"
                  type="date"
                  className="adm-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* lista de termos */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-4 w-[3px] rounded-full bg-[var(--accent)]" />
                <h2 className="text-[0.95rem] font-semibold text-[var(--ink)]">Termos individuais</h2>
              </div>
              <button type="button" onClick={addTerm} className="adm-btn h-9">
                <Plus size={16} strokeWidth={2} /> Novo termo
              </button>
            </div>

            {terms.length === 0 ? (
              <div className="adm-card">
                <EmptyState
                  icon={ShieldCheck}
                  title="Nenhum termo criado ainda"
                  hint="Adicione a primeira cláusula para montar o documento que os colaboradores irão assinar."
                  action={
                    <button type="button" onClick={addTerm} className="adm-btn adm-btn--primary">
                      <Plus size={16} strokeWidth={2} /> Novo termo
                    </button>
                  }
                />
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={terms}
                onReorder={setTermsList}
                className="m-0 list-none p-0"
              >
                {terms.map((term, i) => (
                  <TermCard
                    key={term.id}
                    term={term}
                    index={i}
                    total={terms.length}
                    onChange={updateTerm}
                    onDelete={deleteTerm}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* aviso */}
          {terms.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-[#f6e7c4] bg-[var(--warning-bg)] px-4 py-3.5">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--warning)]" strokeWidth={1.8} />
              <p className="text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
                Colaboradores que <strong className="font-semibold text-[var(--ink)]">já assinaram</strong> ficam vinculados à versão anterior.
                A nova versão vale apenas para assinaturas futuras.
              </p>
            </div>
          )}
        </div>

        {/* ══ coluna direita: preview ══ */}
        <div className="lg:sticky lg:top-6">
          <div className="mb-3 flex items-center gap-2">
            <Eye size={14} className="text-[var(--text-muted)]" strokeWidth={1.8} />
            <span className="adm-eyebrow">Pré-visualização</span>
            {dirty && (
              <span className="adm-badge adm-badge--gold ml-auto">não publicado</span>
            )}
          </div>

          <div className="adm-card overflow-hidden">
            {/* header do preview */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-[var(--border)] bg-[var(--bg-subtle)] px-5 py-3.5">
              <span className="adm-badge adm-badge--gold tabular-nums">{version || 'v—'}</span>
              <span className="text-[0.75rem] text-[var(--text-muted)]">vigência: {formattedDate}</span>
              <span className="ml-auto text-[0.75rem] tabular-nums text-[var(--text-muted)]">
                {terms.length} {terms.length === 1 ? 'cláusula' : 'cláusulas'}
              </span>
            </div>

            {/* conteúdo renderizado */}
            {terms.length === 0 ? (
              <div className="px-6 py-10 text-center text-[0.875rem] text-[var(--text-muted)]">
                Nenhum termo para exibir.
              </div>
            ) : (
              <div
                className="adm-terms-preview adm-no-scrollbar max-h-[480px] overflow-y-auto px-6 py-5"
                dangerouslySetInnerHTML={{ __html: serialized }}
              />
            )}
          </div>

          {/* botão publicar */}
          <button
            type="button"
            onClick={() => setConfirm(true)}
            disabled={!dirty}
            className="adm-btn adm-btn--primary mt-3.5 w-full"
          >
            <Save size={16} strokeWidth={2} /> {dirty ? 'Publicar alterações' : 'Nenhuma alteração pendente'}
          </button>
        </div>
      </div>

      {/* ── modal de confirmação ── */}
      <AnimatePresence>
        {confirm && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[rgba(26,23,20,0.45)]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirm(false)}
            />
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" onClick={() => setConfirm(false)}>
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Publicar versão dos termos"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 28 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[92dvh] w-full max-w-[440px] overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-md)] sm:rounded-2xl"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--accent-tint)]">
                      <ShieldCheck className="h-5 w-5 text-[#f26b2a]" strokeWidth={1.9} />
                    </div>
                    <div>
                      <p className="adm-eyebrow">Conformidade</p>
                      <h2 className="mt-0.5 text-[1.15rem] font-semibold text-[var(--ink)]">Publicar versão</h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirm(false)}
                    aria-label="Fechar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                </div>

                <p className="text-[0.875rem] leading-relaxed text-[var(--text-secondary)]">
                  Publicar{' '}
                  <span className="adm-badge adm-badge--gold tabular-nums">{version}</span>{' '}
                  com <strong className="font-semibold text-[var(--ink)]">{terms.length} {terms.length === 1 ? 'cláusula' : 'cláusulas'}</strong>,
                  vigência a partir de <strong className="font-semibold text-[var(--ink)]">{formattedDate}</strong>?
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-muted)]">
                  Assinaturas anteriores permanecem vinculadas à versão antiga.
                </p>

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setConfirm(false)} className="adm-btn flex-1">
                    Cancelar
                  </button>
                  <button type="button" onClick={save} className="adm-btn adm-btn--primary flex-[2]">
                    <Check size={16} strokeWidth={2.2} /> Confirmar publicação
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="adm-toast"
            role="status"
            aria-live="polite"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success)]">
              <Check size={14} strokeWidth={2.4} />
            </span>
            Salvo ✓
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
