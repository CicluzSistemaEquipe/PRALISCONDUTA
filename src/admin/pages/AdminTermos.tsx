import { useState } from 'react'
import { AnimatePresence, motion, Reorder } from 'framer-motion'
import {
  Check, AlertTriangle, X, Eye,
  Tag, CalendarDays, ShieldCheck, Save,
  Plus, Pencil, Trash2, GripVertical, ChevronDown,
} from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import { AdminPageHeader } from '../components/AdminPageHeader'

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
    <Reorder.Item value={term} dragListener={!editing}>
      <motion.div
        layout
        style={{
          background: 'rgba(22,10,2,0.85)',
          border: editing
            ? '1px solid rgba(184,134,11,0.4)'
            : '1px solid rgba(232,207,160,0.1)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 10,
          transition: 'border-color 0.2s',
        }}
      >
        {/* ── cabeçalho do card ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: editing ? '12px 14px 10px' : '13px 14px',
          borderBottom: editing ? '1px solid rgba(232,207,160,0.08)' : 'none',
        }}>
          {/* drag handle */}
          <div style={{ color: 'rgba(232,207,160,0.2)', cursor: 'grab', flexShrink: 0, display: 'flex' }}>
            <GripVertical size={16} />
          </div>

          {/* número */}
          <span style={{
            fontFamily: 'Playfair Display, serif', fontSize: 11, fontWeight: 700,
            color: 'rgba(184,134,11,0.7)', background: 'rgba(184,134,11,0.1)',
            border: '1px solid rgba(184,134,11,0.2)',
            borderRadius: 6, padding: '1px 7px', flexShrink: 0,
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* título / input */}
          {editing ? (
            <input
              autoFocus
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700,
                color: '#fff', caretColor: '#f37435',
              }}
              placeholder="Título do termo"
            />
          ) : (
            <span style={{
              flex: 1, fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
            }}>
              {term.title || <span style={{ color: 'rgba(232,207,160,0.3)', fontStyle: 'italic' }}>Sem título</span>}
            </span>
          )}

          {/* ações */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {!editing && (
              <>
                <button
                  onClick={() => onMoveUp(term.id)}
                  disabled={index === 0}
                  title="Mover para cima"
                  style={{
                    width: 26, height: 26, borderRadius: 7, cursor: index === 0 ? 'not-allowed' : 'pointer',
                    background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: index === 0 ? 'rgba(232,207,160,0.15)' : 'rgba(232,207,160,0.4)',
                    transform: 'rotate(180deg)',
                  }}
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  onClick={() => onMoveDown(term.id)}
                  disabled={index === total - 1}
                  title="Mover para baixo"
                  style={{
                    width: 26, height: 26, borderRadius: 7, cursor: index === total - 1 ? 'not-allowed' : 'pointer',
                    background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: index === total - 1 ? 'rgba(232,207,160,0.15)' : 'rgba(232,207,160,0.4)',
                  }}
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  onClick={() => setEditing(true)}
                  title="Editar"
                  style={{
                    width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8c96a',
                  }}
                >
                  <Pencil size={12} />
                </button>
                {!confirmDel ? (
                  <button
                    onClick={() => setConfirmDel(true)}
                    title="Excluir"
                    style={{
                      width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setConfirmDel(false)} style={{
                      padding: '3px 8px', borderRadius: 7, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,207,160,0.13)',
                      fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.5)',
                    }}>
                      Não
                    </button>
                    <button onClick={() => onDelete(term.id)} style={{
                      padding: '3px 8px', borderRadius: 7, cursor: 'pointer',
                      background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)',
                      fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: '#f87171',
                    }}>
                      Excluir
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── corpo: visualização ou edição ── */}
        <AnimatePresence initial={false}>
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '12px 14px' }}>
                <label style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900,
                  letterSpacing: '0.14em', color: 'rgba(232,207,160,0.4)',
                  textTransform: 'uppercase' as const, display: 'block', marginBottom: 6,
                }}>
                  Texto do termo
                </label>
                <textarea
                  rows={4}
                  value={localBody}
                  onChange={(e) => setLocalBody(e.target.value)}
                  placeholder="Descreva o conteúdo deste termo…"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(232,207,160,0.15)', borderRadius: 10,
                    padding: '10px 12px', color: 'rgba(232,207,160,0.9)',
                    fontFamily: 'Montserrat, sans-serif', fontSize: 13, lineHeight: 1.6,
                    outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const,
                  }}
                />
              </div>

              <div style={{
                display: 'flex', gap: 8, padding: '0 14px 14px',
              }}>
                <button onClick={cancel} style={{
                  flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(232,207,160,0.12)',
                  fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: 'rgba(232,207,160,0.5)',
                }}>
                  Cancelar
                </button>
                <button onClick={commit} style={{
                  flex: 2, padding: '9px', borderRadius: 10, cursor: 'pointer',
                  background: 'linear-gradient(135deg,#f37435,#b8860b)', border: 'none',
                  fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Check size={13} /> Salvar termo
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ padding: '0 14px 13px 46px' }}
            >
              <p style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 12,
                color: 'rgba(232,207,160,0.5)', lineHeight: 1.6,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
              }}>
                {term.body || <span style={{ fontStyle: 'italic', color: 'rgba(232,207,160,0.25)' }}>Sem conteúdo</span>}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  )
}

// ── campo de formulário ───────────────────────────────────────────────────────
const fieldBase: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(232,207,160,0.18)', borderRadius: 12,
  padding: '11px 14px', color: '#fff', outline: 'none',
  fontFamily: 'Montserrat, sans-serif', fontSize: 14,
  boxSizing: 'border-box' as const,
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 900,
  letterSpacing: '0.15em', textTransform: 'uppercase' as const,
  color: 'rgba(232,207,160,0.55)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
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
        eyebrow="Compliance"
        title="Termos de Conduta"
        description="Gerencie, edite e publique os termos que os colaboradores assinam no app."
        action={
          <button
            onClick={() => setConfirm(true)}
            className="adm-btn adm-btn--primary"
            style={{ opacity: dirty ? 1 : 0.45, pointerEvents: dirty ? 'auto' : 'none' }}
          >
            <Save className="h-4 w-4" /> Publicar termos
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* ══ coluna esquerda ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* versão + data */}
          <div style={{ background: 'rgba(22,10,2,0.85)', border: '1px solid rgba(232,207,160,0.12)', borderRadius: 20, padding: '20px 20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={15} color="#e8c96a" />
              </div>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#fff' }}>
                Identificação da versão
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}><Tag size={10} /> Versão</label>
                <input style={fieldBase} value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0" />
              </div>
              <div>
                <label style={labelStyle}><CalendarDays size={10} /> Vigência</label>
                <input type="date" style={fieldBase} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* lista de termos */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: '#f37435', marginBottom: 2 }}>CLÁUSULAS</p>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#fff' }}>
                  Termos individuais
                </p>
              </div>
              <button
                onClick={addTerm}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(243,116,53,0.12)', border: '1px solid rgba(243,116,53,0.3)',
                  fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#f37435',
                }}
              >
                <Plus size={14} /> Novo termo
              </button>
            </div>

            {terms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(22,10,2,0.5)', border: '1px dashed rgba(232,207,160,0.15)',
                  borderRadius: 16, padding: '36px 20px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}
              >
                <ShieldCheck size={32} color="rgba(232,207,160,0.15)" />
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(232,207,160,0.4)' }}>
                  Nenhum termo criado ainda.<br />Clique em <strong style={{ color: '#f37435' }}>Novo termo</strong> para começar.
                </p>
              </motion.div>
            ) : (
              <Reorder.Group axis="y" values={terms} onReorder={setTermsList} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: 'rgba(232,176,75,0.08)', border: '1px solid rgba(232,176,75,0.25)',
              borderRadius: 14, padding: '14px 16px',
            }}>
              <AlertTriangle size={15} color="#e8b04b" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(232,207,160,0.7)', lineHeight: 1.6 }}>
                Colaboradores que <strong style={{ color: '#e8b04b' }}>já assinaram</strong> ficam vinculados à versão anterior.
                A nova versão vale apenas para assinaturas futuras.
              </p>
            </div>
          )}
        </div>

        {/* ══ coluna direita: preview ══ */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Eye size={13} color="rgba(232,207,160,0.4)" />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', color: 'rgba(232,207,160,0.45)' }}>
              PRÉ-VISUALIZAÇÃO
            </span>
            {dirty && (
              <span style={{
                marginLeft: 'auto',
                fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 700,
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: 6, padding: '2px 8px', color: '#fbbf24',
              }}>
                não publicado
              </span>
            )}
          </div>

          <div style={{ background: 'rgba(22,10,2,0.85)', border: '1px solid rgba(232,207,160,0.12)', borderRadius: 20, overflow: 'hidden' }}>
            {/* header do preview */}
            <div style={{
              padding: '16px 22px', borderBottom: '1px solid rgba(232,207,160,0.08)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 900,
                background: 'rgba(184,134,11,0.2)', border: '1px solid rgba(184,134,11,0.4)',
                borderRadius: 7, padding: '3px 10px', color: '#e8c96a',
              }}>
                {version || 'v—'}
              </span>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.45)' }}>
                vigência: {formattedDate}
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.3)' }}>
                {terms.length} {terms.length === 1 ? 'cláusula' : 'cláusulas'}
              </span>
            </div>

            {/* conteúdo renderizado */}
            {terms.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(232,207,160,0.25)', fontFamily: 'Montserrat, sans-serif', fontSize: 13 }}>
                Nenhum termo para exibir.
              </div>
            ) : (
              <div
                style={{ padding: '20px 24px', maxHeight: 480, overflowY: 'auto' }}
                className="adm-terms-preview no-scrollbar"
                dangerouslySetInnerHTML={{ __html: serialized }}
              />
            )}
          </div>

          {/* botão publicar */}
          <button
            onClick={() => setConfirm(true)}
            disabled={!dirty}
            style={{
              marginTop: 14, width: '100%', padding: '13px', borderRadius: 14,
              cursor: dirty ? 'pointer' : 'not-allowed',
              background: dirty ? 'linear-gradient(135deg, #f37435, #b8860b)' : 'rgba(184,134,11,0.12)',
              border: dirty ? 'none' : '1px solid rgba(184,134,11,0.18)',
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 800, color: dirty ? '#fff' : 'rgba(232,207,160,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.25s',
            }}
          >
            <Save size={15} /> {dirty ? 'Publicar alterações' : 'Nenhuma alteração pendente'}
          </button>
        </div>
      </div>

      {/* ── modal de confirmação ── */}
      <AnimatePresence>
        {confirm && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/75"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirm(false)} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                style={{
                  background: 'linear-gradient(160deg, rgba(22,10,2,0.99), rgba(10,4,0,0.99))',
                  border: '1px solid rgba(184,134,11,0.3)',
                  borderRadius: 22, width: '100%', maxWidth: 420,
                  padding: 28, boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 11,
                      background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ShieldCheck size={17} color="#e8c96a" />
                    </div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#fff' }}>
                      Publicar termos
                    </h2>
                  </div>
                  <button onClick={() => setConfirm(false)} style={{
                    width: 32, height: 32, borderRadius: 9, background: 'rgba(232,207,160,0.07)',
                    border: '1px solid rgba(232,207,160,0.12)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'rgba(232,207,160,0.5)', cursor: 'pointer',
                  }}>
                    <X size={15} />
                  </button>
                </div>

                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(232,207,160,0.65)', lineHeight: 1.65, marginBottom: 8 }}>
                  Publicar{' '}
                  <span style={{ fontWeight: 800, color: '#e8c96a', background: 'rgba(184,134,11,0.15)', borderRadius: 6, padding: '1px 8px' }}>
                    {version}
                  </span>{' '}
                  com <strong style={{ color: '#fff' }}>{terms.length} {terms.length === 1 ? 'cláusula' : 'cláusulas'}</strong>, vigência a partir de <strong style={{ color: '#fff' }}>{formattedDate}</strong>?
                </p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(232,207,160,0.4)', lineHeight: 1.6, marginBottom: 22 }}>
                  Assinaturas anteriores permanecem vinculadas à versão antiga.
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setConfirm(false)} style={{
                    flex: 1, padding: '11px', borderRadius: 12, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,207,160,0.13)',
                    fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(232,207,160,0.55)',
                  }}>
                    Cancelar
                  </button>
                  <button onClick={save} style={{
                    flex: 2, padding: '11px', borderRadius: 12, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f37435, #b8860b)', border: 'none',
                    fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 800, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}>
                    <Check size={15} /> Confirmar publicação
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
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 60,
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(135deg, rgba(74,222,128,0.18), rgba(22,163,74,0.18))',
              border: '1px solid rgba(74,222,128,0.35)', borderRadius: 14,
              padding: '12px 18px',
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#4ade80',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <Check size={15} /> Termos publicados com sucesso
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
