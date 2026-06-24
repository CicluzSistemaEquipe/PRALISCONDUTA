import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Copy, Check, X, Users,
  Search, BookOpen, Award, ShieldCheck,
  Clock, MessageCircle, Link2, CheckCircle2,
  Briefcase, CalendarDays, CreditCard, UserPlus,
  Pencil, Trash2, AlertTriangle, Save,
} from 'lucide-react'
import { createEmployee, updateEmployee, deleteEmployee } from '@/lib/storage'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import { ROLES, type Role } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { statusOf } from '../components/StatusBadge'

// ── helpers ───────────────────────────────────────────────────────────────────

function loginLink(token: string): string {
  return `${window.location.origin}/login?t=${encodeURIComponent(token)}`
}

function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3)  return d
  if (d.length <= 6)  return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9)  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function rawCPF(v: string) { return v.replace(/\D/g, '') }

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

const todayISO = () => new Date().toISOString().slice(0, 10)

const ROLE_COLORS: Record<string, [string, string]> = {
  'Padeiro':             ['#f37435', '#b8500a'],
  'Confeiteiro':         ['#e879f9', '#a21caf'],
  'Atendente de Balcão': ['#6366f1', '#4338ca'],
  'Caixa':              ['#b8860b', '#7a5a07'],
  'Auxiliar de Cozinha': ['#f59e0b', '#b45309'],
  'Auxiliar de Produção':['#10b981', '#065f46'],
  'Gerente de Loja':    ['#4ade80', '#16a34a'],
  'Estoquista':         ['#38bdf8', '#0369a1'],
  'Entregador':         ['#fb7185', '#be123c'],
  'Serviços Gerais':    ['#a8a29e', '#57534e'],
}
function roleColor(role: string): [string, string] {
  return ROLE_COLORS[role] ?? ['#b8860b', '#7a5a07']
}

// ── Card de colaborador ───────────────────────────────────────────────────────
function ColaboradorCard({ row, onCopy, copied, onEdit }: {
  row: EmployeeRow; onCopy: (link: string, id: string) => void; copied: string | null; onEdit: (row: EmployeeRow) => void
}) {
  const [c1, c2]    = roleColor(row.employee.role)
  const link        = loginLink(row.employee.token)
  const isCopied    = copied === row.employee.id
  const status      = statusOf(row)
  const pct         = Math.round(row.progress * 100)
  const quizPct     = row.quizTotal > 0 ? Math.round((row.quizCorrect / row.quizTotal) * 100) : null

  const statusColors = {
    Assinado:       { text: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)',  left: '#4ade80' },
    Concluído:      { text: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)',  left: '#4ade80' },
    'Em andamento': { text: '#f37435', bg: 'rgba(243,116,53,0.12)',  border: 'rgba(243,116,53,0.3)',  left: '#f37435' },
    Pendente:       { text: 'rgba(232,207,160,0.5)', bg: 'rgba(232,207,160,0.06)', border: 'rgba(232,207,160,0.15)', left: 'rgba(232,207,160,0.2)' },
  }[status] ?? { text: 'rgba(232,207,160,0.5)', bg: 'rgba(232,207,160,0.06)', border: 'rgba(232,207,160,0.15)', left: 'rgba(232,207,160,0.2)' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(22,10,2,0.9)', borderRadius: 18, overflow: 'hidden',
        border: '1px solid rgba(232,207,160,0.1)',
        borderLeft: `3px solid ${statusColors.left}`,
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      {/* header — clicável para editar */}
      <div
        onClick={() => onEdit(row)}
        style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: '#fff',
          boxShadow: `0 4px 14px ${c1}44`,
        }}>
          {initials(row.employee.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
            {row.employee.name}
          </p>
          <span style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
            color: c1, background: `${c1}1a`, border: `1px solid ${c1}44`,
            borderRadius: 6, padding: '2px 8px',
          }}>
            {row.employee.role}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            color: statusColors.text, background: statusColors.bg, border: `1px solid ${statusColors.border}`,
            borderRadius: 8, padding: '3px 8px', whiteSpace: 'nowrap' as const,
          }}>
            {status === 'Assinado' ? '✓ ' : ''}{status}
          </span>
          <span style={{
            fontFamily: 'Montserrat, sans-serif', fontSize: 9, color: 'rgba(232,207,160,0.3)',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Pencil size={9} /> editar
          </span>
        </div>
      </div>

      {/* progress */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.45)' }}>Progresso da jornada</span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: pct > 0 ? '#f37435' : 'rgba(232,207,160,0.35)' }}>{pct}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 3,
              background: row.signed ? '#4ade80' : pct >= 100 ? '#b8860b' : pct > 0 ? 'linear-gradient(90deg,#f37435,#b8860b)' : 'transparent',
            }}
          />
        </div>
      </div>

      {/* métricas */}
      <div style={{ display: 'flex', borderTop: '1px solid rgba(232,207,160,0.07)', borderBottom: '1px solid rgba(232,207,160,0.07)' }}>
        {[
          { Icon: BookOpen,    label: 'Módulos',   value: `${row.completedModules}/${row.totalModules}`, color: '#b8860b' },
          { Icon: Award,       label: 'Quiz',      value: quizPct != null ? `${quizPct}%` : '—', color: quizPct != null && quizPct >= 70 ? '#4ade80' : '#f37435' },
          { Icon: row.signed ? ShieldCheck : Clock, label: 'Assinatura', value: row.signed ? 'Sim' : 'Pendente', color: row.signed ? '#4ade80' : 'rgba(232,207,160,0.35)' },
        ].map((m, i) => (
          <div key={m.label} style={{
            flex: 1, padding: '9px 12px',
            borderRight: i < 2 ? '1px solid rgba(232,207,160,0.07)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <m.Icon size={10} color="rgba(232,207,160,0.35)" />
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, color: 'rgba(232,207,160,0.35)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{m.label}</span>
            </div>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* rodapé: token único + botões */}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8, color: 'rgba(232,207,160,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 2 }}>
            ID único
          </span>
          <span style={{
            fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
            color: 'rgba(232,207,160,0.55)',
            background: 'rgba(232,207,160,0.05)', border: '1px solid rgba(232,207,160,0.12)',
            borderRadius: 6, padding: '2px 8px', display: 'inline-block',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '100%',
          }}>
            {row.employee.token}
          </span>
        </div>
        <button onClick={() => onCopy(link, row.employee.id)} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, flexShrink: 0,
          fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          background: isCopied ? 'rgba(74,222,128,0.15)' : 'rgba(184,134,11,0.14)',
          border: `1px solid ${isCopied ? 'rgba(74,222,128,0.4)' : 'rgba(184,134,11,0.3)'}`,
          color: isCopied ? '#4ade80' : '#e8c96a',
        }}>
          {isCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Olá, ${row.employee.name.split(' ')[0]}! Aqui está o seu link de acesso ao treinamento da Padaria Pralís:\n\n${link}\n\nClique no link para começar sua jornada! 🥐`)}`}
          target="_blank" rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, flexShrink: 0,
            fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, textDecoration: 'none',
            background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366',
          }}
        >
          <MessageCircle size={11} /> WhatsApp
        </a>
      </div>
    </motion.div>
  )
}

// ── Stat mini ─────────────────────────────────────────────────────────────────
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'rgba(22,10,2,0.7)', border: '1px solid rgba(232,207,160,0.1)', borderRadius: 14, padding: '12px 16px' }}>
      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color, lineHeight: 1, display: 'block' }}>{value}</span>
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.45)' }}>{label}</span>
    </div>
  )
}

// ── Modal novo colaborador ────────────────────────────────────────────────────
interface NewEmployee { name: string; cpf: string; start: string; role: Role }

function NovoColaboradorModal({ onClose, onSaved }: {
  onClose: () => void
  onSaved: (emp: { name: string; role: string; link: string }) => void
}) {
  const [form, setForm]   = useState<NewEmployee>({ name: '', cpf: '', start: todayISO(), role: ROLES[0] })
  const [err, setErr]     = useState('')
  const [saving, setSaving] = useState(false)
  const [c1, c2]          = roleColor(form.role)

  const handleCPF = (v: string) => setForm((f) => ({ ...f, cpf: maskCPF(v) }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const name = form.name.trim()
    const cpf  = rawCPF(form.cpf)
    if (!name)        { setErr('Informe o nome do colaborador.'); return }
    if (cpf.length !== 11) { setErr('CPF inválido — informe os 11 dígitos.'); return }
    setSaving(true)
    try {
      const emp = await createEmployee({ name, phone: cpf, role: form.role })
      const link = loginLink(emp.token)
      onSaved({ name: emp.name, role: emp.role, link })
    } catch {
      setErr('Erro ao cadastrar. Tente novamente.')
      setSaving(false)
    }
  }

  const fieldBase: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(232,207,160,0.18)', borderRadius: 12,
    padding: '12px 14px', color: '#fff', outline: 'none',
    fontFamily: 'Montserrat, sans-serif', fontSize: 14,
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  }

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/75"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ overflowY: 'auto' }}>
        <motion.form onSubmit={submit}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            background: 'linear-gradient(160deg, rgba(26,12,2,0.98) 0%, rgba(14,6,0,0.99) 100%)',
            border: '1px solid rgba(184,134,11,0.3)',
            borderRadius: 24, width: '100%', maxWidth: 480,
            padding: 28, boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
            position: 'relative',
          }}
        >
          {/* header modal */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13,
                background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <UserPlus size={18} color="#e8c96a" />
              </div>
              <div>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: '#e8c96a', marginBottom: 2 }}>PESSOAS</p>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#fff', lineHeight: 1 }}>Novo colaborador</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(232,207,160,0.07)',
              border: '1px solid rgba(232,207,160,0.12)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'rgba(232,207,160,0.5)', cursor: 'pointer',
            }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* nome */}
            <div>
              <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <Users size={11} /> Nome completo
              </label>
              <input
                style={fieldBase} autoFocus
                placeholder="Ex.: Marina Souza"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* cpf + data */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <CreditCard size={11} /> CPF
                </label>
                <input
                  style={fieldBase}
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => handleCPF(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <CalendarDays size={11} /> Data de início
                </label>
                <input
                  type="date" style={fieldBase}
                  value={form.start}
                  onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                />
              </div>
            </div>

            {/* cargo */}
            <div>
              <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <Briefcase size={11} /> Cargo
              </label>
              <select
                style={{ ...fieldBase, cursor: 'pointer' }}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              >
                {ROLES.map((r) => <option key={r} value={r} style={{ background: '#1a0a02', color: '#fff' }}>{r}</option>)}
              </select>
            </div>

            {/* preview do colaborador */}
            {form.name.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,207,160,0.1)',
                  borderRadius: 14, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: '#fff',
                }}>
                  {initials(form.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{form.name}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: c1 }}>{form.role}</span>
                    {form.cpf && <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(232,207,160,0.35)' }}>{form.cpf}</span>}
                  </div>
                </div>
                <CheckCircle2 size={16} color="rgba(74,222,128,0.5)" />
              </motion.div>
            )}

            {/* aviso link */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.18)',
              borderRadius: 12, padding: '10px 14px',
            }}>
              <Link2 size={13} color="#25d366" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.6)', lineHeight: 1.55 }}>
                Após o cadastro, um link único será gerado automaticamente. Você poderá enviar direto para o WhatsApp do colaborador — ao clicar, ele já entra no treinamento autenticado.
              </p>
            </div>

            {err && (
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600, color: '#f87171' }}>{err}</p>
            )}

            {/* botões */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,207,160,0.15)',
                fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(232,207,160,0.6)',
              }}>
                Cancelar
              </button>
              <button type="submit" disabled={saving} style={{
                flex: 2, padding: '12px', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer',
                background: saving ? 'rgba(184,134,11,0.4)' : 'linear-gradient(135deg,#f37435,#b8860b)',
                border: 'none', fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Cadastrando…</>
                ) : (
                  <><UserPlus size={15} /> Cadastrar colaborador</>
                )}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </>
  )
}

// ── Modal editar / excluir colaborador ───────────────────────────────────────
function EditColaboradorModal({ row, onClose, onSaved, onDeleted }: {
  row: EmployeeRow
  onClose: () => void
  onSaved: () => void
  onDeleted: () => void
}) {
  const emp = row.employee
  const [form, setForm] = useState({
    name: emp.name,
    cpf:  maskCPF(emp.phone ?? ''),
    role: emp.role as Role,
  })
  const [saving,  setSaving]  = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')
  const [c1, c2] = roleColor(form.role)

  const handleCPF = (v: string) => setForm((f) => ({ ...f, cpf: maskCPF(v) }))

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const name = form.name.trim()
    const cpf  = rawCPF(form.cpf)
    if (!name)           { setErr('Informe o nome.'); return }
    if (cpf.length !== 11) { setErr('CPF inválido.'); return }
    setSaving(true)
    try {
      await updateEmployee(emp.id, { name, phone: cpf, role: form.role })
      onSaved()
    } catch {
      setErr('Erro ao salvar. Tente novamente.')
      setSaving(false)
    }
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await deleteEmployee(emp.id)
      onDeleted()
    } catch {
      setDeleting(false)
      setConfirm(false)
    }
  }

  const link = loginLink(emp.token)

  const fieldBase: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(232,207,160,0.18)', borderRadius: 12,
    padding: '12px 14px', color: '#fff', outline: 'none',
    fontFamily: 'Montserrat, sans-serif', fontSize: 14,
    boxSizing: 'border-box' as const,
  }

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/75"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            background: 'linear-gradient(160deg, rgba(20,10,2,0.98), rgba(10,4,0,0.99))',
            border: '1px solid rgba(184,134,11,0.28)',
            borderRadius: 24, width: '100%', maxWidth: 480,
            padding: 28, boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
          }}
        >
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 13,
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#fff',
                boxShadow: `0 4px 14px ${c1}44`,
              }}>
                {initials(form.name || emp.name)}
              </div>
              <div>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: '#e8c96a', marginBottom: 2 }}>EDITAR CADASTRO</p>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#fff', lineHeight: 1 }}>{emp.name}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(232,207,160,0.07)',
              border: '1px solid rgba(232,207,160,0.12)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'rgba(232,207,160,0.5)', cursor: 'pointer',
            }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={save}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* nome */}
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Users size={10} /> Nome completo
                </label>
                <input style={fieldBase} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>

              {/* CPF + cargo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                    <CreditCard size={10} /> CPF
                  </label>
                  <input style={fieldBase} value={form.cpf} onChange={(e) => handleCPF(e.target.value)} inputMode="numeric" />
                </div>
                <div>
                  <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                    <Briefcase size={10} /> Cargo
                  </label>
                  <select style={{ ...fieldBase, cursor: 'pointer' }} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
                    {ROLES.map((r) => <option key={r} value={r} style={{ background: '#1a0a02', color: '#fff' }}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* link de acesso (somente leitura) */}
              <div>
                <label style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(232,207,160,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Link2 size={10} /> Link de acesso
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,207,160,0.1)',
                  borderRadius: 12, padding: '10px 14px',
                }}>
                  <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 11, color: 'rgba(232,207,160,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {link}
                  </span>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Olá, ${emp.name.split(' ')[0]}! Aqui está o seu link de acesso ao treinamento da Padaria Pralís:\n\n${link}\n\nClique para começar! 🥐`)}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textDecoration: 'none', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.28)', color: '#25d366', flexShrink: 0 }}>
                    <MessageCircle size={11} /> WhatsApp
                  </a>
                </div>
              </div>

              {err && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600, color: '#f87171' }}>{err}</p>}

              {/* botões salvar */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose} style={{
                  flex: 1, padding: '11px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(232,207,160,0.13)',
                  fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(232,207,160,0.5)',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{
                  flex: 2, padding: '11px', borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg,#f37435,#b8860b)', border: 'none',
                  fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? 'Salvando…' : <><Save size={14} /> Salvar alterações</>}
                </button>
              </div>
            </div>
          </form>

          {/* zona de perigo */}
          <div style={{ marginTop: 20, padding: '16px', borderRadius: 14, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}>
            <AnimatePresence mode="wait">
              {!confirm ? (
                <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 2 }}>Zona de perigo</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.4)' }}>Remove o colaborador e todos os dados de progresso.</p>
                  </div>
                  <button onClick={() => setConfirm(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', flexShrink: 0,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                    fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#f87171',
                  }}>
                    <Trash2 size={13} /> Excluir
                  </button>
                </motion.div>
              ) : (
                <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <AlertTriangle size={15} color="#f87171" />
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#f87171' }}>
                      Confirma a exclusão de <strong>{emp.name}</strong>?
                    </p>
                  </div>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.45)', marginBottom: 14 }}>
                    Todo o progresso, quizzes e assinatura serão apagados permanentemente.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setConfirm(false)} style={{
                      flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,207,160,0.13)',
                      fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: 'rgba(232,207,160,0.6)',
                    }}>
                      Cancelar
                    </button>
                    <button onClick={remove} disabled={deleting} style={{
                      flex: 2, padding: '9px', borderRadius: 10, cursor: deleting ? 'not-allowed' : 'pointer',
                      background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                      fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#f87171',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      {deleting ? 'Excluindo…' : <><Trash2 size={13} /> Sim, excluir permanentemente</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// ── Modal de sucesso + link ───────────────────────────────────────────────────
function SuccessModal({ name, role, link, onClose }: {
  name: string; role: string; link: string; onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [c1, c2] = roleColor(role)
  const firstName = name.split(' ')[0]

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(link) } catch { /* noop */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waMessage = `Olá, ${firstName}! 👋\n\nAqui está o seu link de acesso ao treinamento da Padaria Pralís:\n\n${link}\n\nClique no link para começar a sua jornada! 🥐✨`

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/80"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          style={{
            background: 'linear-gradient(160deg, rgba(14,26,14,0.98) 0%, rgba(6,14,6,0.99) 100%)',
            border: '1px solid rgba(74,222,128,0.25)',
            borderRadius: 24, width: '100%', maxWidth: 460,
            padding: 28, boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(74,222,128,0.08)',
            textAlign: 'center',
          }}
        >
          {/* ícone sucesso */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
              background: 'rgba(74,222,128,0.12)', border: '1.5px solid rgba(74,222,128,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={34} color="#4ade80" />
          </motion.div>

          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#fff', marginBottom: 6 }}>
            Colaborador cadastrado!
          </p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(232,207,160,0.6)', marginBottom: 24, lineHeight: 1.5 }}>
            O link de acesso de <strong style={{ color: '#fff' }}>{name}</strong> foi gerado.<br/>
            Envie pelo WhatsApp para ele começar o treinamento.
          </p>

          {/* avatar preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(232,207,160,0.1)',
            borderRadius: 14, padding: '12px 14px', marginBottom: 20,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#fff',
            }}>
              {initials(name)}
            </div>
            <div>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>{name}</p>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: c1 }}>{role}</span>
            </div>
          </div>

          {/* link */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(232,207,160,0.12)',
            borderRadius: 12, padding: '10px 14px', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Link2 size={13} color="rgba(232,207,160,0.4)" style={{ flexShrink: 0 }} />
            <span style={{
              flex: 1, fontFamily: 'monospace', fontSize: 11, color: 'rgba(232,207,160,0.55)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, textAlign: 'left',
            }}>
              {link}
            </span>
          </div>

          {/* botões de ação */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <button onClick={copyLink} style={{
              flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700,
              background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(184,134,11,0.15)',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.4)' : 'rgba(184,134,11,0.3)'}`,
              color: copied ? '#4ade80' : '#e8c96a',
              transition: 'all 0.2s',
            }}>
              {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar link</>}
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(waMessage)}`}
              target="_blank" rel="noreferrer"
              style={{
                flex: 1.4, padding: '12px', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                background: 'linear-gradient(135deg, rgba(37,211,102,0.22), rgba(18,140,66,0.22))',
                border: '1px solid rgba(37,211,102,0.35)', color: '#25d366',
              }}
            >
              <MessageCircle size={14} /> Enviar no WhatsApp
            </a>
          </div>

          <button onClick={onClose} style={{
            width: '100%', padding: '11px', borderRadius: 12, cursor: 'pointer',
            background: 'transparent', border: '1px solid rgba(232,207,160,0.12)',
            fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(232,207,160,0.45)',
          }}>
            Fechar
          </button>
        </motion.div>
      </div>
    </>
  )
}

// ── SVG helpers ──────────────────────────────────────────────────────────────
function polarXY(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  if (Math.abs(endDeg - startDeg) >= 360) endDeg = startDeg + 359.99
  const s = polarXY(cx, cy, r, startDeg)
  const e = polarXY(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

// ── Gráfico donut de status ───────────────────────────────────────────────────
function StatusDonut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total  = segments.reduce((s, seg) => s + seg.value, 0)
  const CX = 80; const CY = 80; const R = 58; const SW = 16; const GAP = 4

  let cursor = -90
  const arcs = segments
    .filter((seg) => seg.value > 0)
    .map((seg) => {
      const deg   = (seg.value / total) * 360
      const start = cursor + GAP / 2
      const end   = cursor + deg - GAP / 2
      cursor += deg
      return { ...seg, start, end }
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={160} height={160}>
        {/* trilho */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={SW} />
        {total === 0 ? (
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={SW} />
        ) : (
          arcs.map((seg, i) => (
            <motion.path
              key={i}
              d={arcPath(CX, CY, R, seg.start, seg.end)}
              stroke={seg.color} strokeWidth={SW} fill="none" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
            />
          ))
        )}
        <text x={CX} y={CY - 6} textAnchor="middle" fill="#fff" fontSize={22} fontFamily="Playfair Display, serif" fontWeight={700}>{total}</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fill="rgba(232,207,160,0.45)" fontSize={9} fontFamily="Montserrat, sans-serif">colaboradores</text>
      </svg>

      {/* legenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.55)' }}>
              {seg.label} <strong style={{ color: '#fff' }}>{seg.value}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Barras de progresso individuais ──────────────────────────────────────────
function ProgressBars({ rows }: { rows: EmployeeRow[] }) {
  const sorted = [...rows].sort((a, b) => b.progress - a.progress).slice(0, 10)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {sorted.map((row) => {
        const pct = Math.round(row.progress * 100)
        const [c1] = roleColor(row.employee.role)
        const barColor = row.signed ? '#4ade80' : pct >= 100 ? '#b8860b' : pct > 0 ? c1 : 'rgba(255,255,255,0.1)'
        return (
          <div key={row.employee.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: `linear-gradient(135deg, ${c1}, ${roleColor(row.employee.role)[1]})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Playfair Display, serif', fontSize: 8, fontWeight: 700, color: '#fff',
                }}>
                  {initials(row.employee.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {row.employee.name.split(' ')[0]}
                  </p>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, color: 'rgba(232,207,160,0.35)', lineHeight: 1 }}>
                    {row.employee.role}
                  </p>
                </div>
              </div>
              <span style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 900,
                color: pct === 0 ? 'rgba(232,207,160,0.3)' : barColor, flexShrink: 0, marginLeft: 8,
              }}>{pct}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                style={{ height: '100%', borderRadius: 3, background: barColor }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Ring de média geral ───────────────────────────────────────────────────────
function AvgRing({ pct, label }: { pct: number; label: string }) {
  const SZ = 72; const SW = 7; const R = (SZ - SW * 2) / 2
  const C  = 2 * Math.PI * R
  const color = pct >= 80 ? '#4ade80' : pct >= 40 ? '#f37435' : '#b8860b'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={SZ} height={SZ}>
        <circle cx={SZ/2} cy={SZ/2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
        <motion.circle
          cx={SZ/2} cy={SZ/2} r={R} fill="none" stroke={color} strokeWidth={SW}
          strokeLinecap="round"
          transform={`rotate(-90 ${SZ/2} ${SZ/2})`}
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (pct / 100) * C }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
        <text x={SZ/2} y={SZ/2 + 5} textAnchor="middle" fill={color} fontSize={13} fontFamily="Playfair Display, serif" fontWeight={700}>{pct}%</text>
      </svg>
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.5)', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

// ── Seção de gráficos ─────────────────────────────────────────────────────────
function ChartsSection({ rows }: { rows: EmployeeRow[] }) {
  const pendente   = rows.filter((r) => r.progress === 0 && !r.signed).length
  const andamento  = rows.filter((r) => r.progress > 0 && r.progress < 1 && !r.signed).length
  const concluido  = rows.filter((r) => r.completedModules >= r.totalModules && !r.signed).length
  const assinado   = rows.filter((r) => r.signed).length
  const avgPct     = rows.length ? Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length * 100) : 0
  const quizRows   = rows.filter((r) => r.quizTotal > 0)
  const avgQuiz    = quizRows.length ? Math.round(quizRows.reduce((s, r) => s + r.quizCorrect / r.quizTotal, 0) / quizRows.length * 100) : 0

  const donutSegs = [
    { label: 'Pendente',    value: pendente,  color: 'rgba(232,207,160,0.25)' },
    { label: 'Em andamento',value: andamento, color: '#f37435' },
    { label: 'Concluído',   value: concluido, color: '#b8860b' },
    { label: 'Assinado',    value: assinado,  color: '#4ade80' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-5"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
    >
      {/* card donut de status */}
      <div style={{ background: 'rgba(22,10,2,0.8)', border: '1px solid rgba(232,207,160,0.1)', borderRadius: 18, padding: '18px 16px' }}>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: '#f37435', marginBottom: 14 }}>
          DISTRIBUIÇÃO DE STATUS
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <StatusDonut segments={donutSegs} />
        </div>
      </div>

      {/* card barras por colaborador + mini-rings */}
      <div style={{ background: 'rgba(22,10,2,0.8)', border: '1px solid rgba(232,207,160,0.1)', borderRadius: 18, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: '#f37435' }}>
          PROGRESSO INDIVIDUAL
        </p>

        <ProgressBars rows={rows} />

        {/* mini rings: média geral + quiz */}
        <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 8, borderTop: '1px solid rgba(232,207,160,0.07)' }}>
          <AvgRing pct={avgPct}  label="Média de progresso" />
          <AvgRing pct={avgQuiz} label="Média de quiz" />
          <AvgRing pct={rows.length ? Math.round(assinado / rows.length * 100) : 0} label="Taxa de assinatura" />
        </div>
      </div>
    </motion.div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminColaboradores() {
  const [rows, setRows]         = useState<EmployeeRow[] | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [success, setSuccess]   = useState<{ name: string; role: string; link: string } | null>(null)
  const [editing, setEditing]   = useState<EmployeeRow | null>(null)
  const [copied, setCopied]     = useState<string | null>(null)
  const [search, setSearch]     = useState('')

  const reload = () => loadEmployeeRows().then(setRows)
  useEffect(() => { reload() }, [])

  const copy = async (link: string, id: string) => {
    try { await navigator.clipboard.writeText(link) } catch { /* noop */ }
    setCopied(id)
    setTimeout(() => setCopied(null), 1800)
  }

  const handleSaved = (emp: { name: string; role: string; link: string }) => {
    setOpenForm(false)
    setSuccess(emp)
    reload()
  }

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = search.toLowerCase()
    return q
      ? rows.filter((r) =>
          r.employee.name.toLowerCase().includes(q) ||
          r.employee.role.toLowerCase().includes(q))
      : rows
  }, [rows, search])

  const stats = useMemo(() => {
    const r = rows ?? []
    return {
      total:     r.length,
      andamento: r.filter((e) => e.progress > 0 && !e.signed).length,
      concluido: r.filter((e) => e.completedModules >= e.totalModules && !e.signed).length,
      assinado:  r.filter((e) => e.signed).length,
    }
  }, [rows])

  return (
    <>
      <AdminPageHeader
        eyebrow="Pessoas"
        title="Colaboradores"
        description="Cadastre, acompanhe e envie o link de treinamento para cada colaborador."
        action={
          <button className="adm-btn adm-btn--primary" onClick={() => setOpenForm(true)}>
            <Plus className="h-4 w-4" /> Novo colaborador
          </button>
        }
      />

      {/* gráficos */}
      {rows !== null && rows.length > 0 && <ChartsSection rows={rows} />}

      {/* busca */}
      {rows !== null && rows.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4"
          style={{ background: 'rgba(22,10,2,0.7)', border: '1px solid rgba(232,207,160,0.12)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={14} color="rgba(232,207,160,0.35)" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cargo…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#fff', caretColor: '#f37435' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ color: 'rgba(232,207,160,0.35)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}><X size={13} /></button>}
        </motion.div>
      )}

      {/* lista */}
      {rows === null ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(232,207,160,0.5)', fontFamily: 'Montserrat, sans-serif', fontSize: 13 }}>
          <div style={{ width: 16, height: 16, border: '2px solid #b8860b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Carregando…
        </div>
      ) : rows.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'rgba(22,10,2,0.5)', border: '1px solid rgba(232,207,160,0.08)', borderRadius: 20, padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Users size={44} color="rgba(232,207,160,0.15)" />
          <div>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#e8cfa0', marginBottom: 6 }}>Nenhum colaborador cadastrado</p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(232,207,160,0.4)' }}>Cadastre o primeiro e compartilhe o link via WhatsApp.</p>
          </div>
          <button className="adm-btn adm-btn--primary" onClick={() => setOpenForm(true)}>
            <Plus size={15} /> Cadastrar o primeiro
          </button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(232,207,160,0.4)' }}>
          Nenhum resultado para "<strong>{search}</strong>".
        </div>
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((row) => (
            <ColaboradorCard key={row.employee.id} row={row} onCopy={copy} copied={copied} onEdit={setEditing} />
          ))}
        </motion.div>
      )}

      {/* modais */}
      <AnimatePresence>
        {openForm && <NovoColaboradorModal onClose={() => setOpenForm(false)} onSaved={handleSaved} />}
      </AnimatePresence>
      <AnimatePresence>
        {success && <SuccessModal {...success} onClose={() => setSuccess(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editing && (
          <EditColaboradorModal
            row={editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload() }}
            onDeleted={() => { setEditing(null); reload() }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
