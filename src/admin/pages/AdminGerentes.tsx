import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X, Mail, User, Lock, Users, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { listEmployees } from '@/lib/storage'
import type { AdminUser, Employee } from '@/lib/types'
import { listGerentes, addGerente, removeGerente } from '../auth'
import { AdminPageHeader } from '../components/AdminPageHeader'

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

// ── Modal adicionar gerente ───────────────────────────────────────────────────
function NovoGerenteModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [err, setErr] = useState('')

  const fieldBase: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(232,207,160,0.18)', borderRadius: 12,
    padding: '12px 14px 12px 40px', color: '#fff', outline: 'none',
    fontFamily: 'Montserrat, sans-serif', fontSize: 14, boxSizing: 'border-box',
  }
  const labelBase: React.CSSProperties = {
    fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
    color: 'rgba(232,207,160,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase',
    display: 'block', marginBottom: 7,
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const nome = form.nome.trim()
    const email = form.email.trim().toLowerCase()
    if (!nome) { setErr('Informe o nome do gerente.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('E-mail inválido.'); return }
    if (form.senha.length < 4) { setErr('A senha deve ter ao menos 4 caracteres.'); return }
    addGerente({ nome, email })
    onSaved()
  }

  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/75"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ overflowY: 'auto' }}>
        <motion.form onSubmit={submit}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            background: 'linear-gradient(160deg, rgba(26,12,2,0.98), rgba(14,6,0,0.99))',
            border: '1px solid rgba(184,134,11,0.3)', borderRadius: 24,
            width: '100%', maxWidth: 440, padding: 28, boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13, background: 'rgba(184,134,11,0.15)',
                border: '1px solid rgba(184,134,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={18} color="#e8c96a" />
              </div>
              <div>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: '#e8c96a', marginBottom: 2 }}>EQUIPE</p>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#fff', lineHeight: 1 }}>Novo gerente</h2>
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
            <div>
              <label style={labelBase}>Nome completo</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(232,207,160,0.4)' }} />
                <input style={fieldBase} autoFocus placeholder="Ex.: João Mendes"
                  value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelBase}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(232,207,160,0.4)' }} />
                <input style={fieldBase} type="email" placeholder="gerente@pralis.com.br"
                  value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelBase}>Senha de acesso</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(232,207,160,0.4)' }} />
                <input style={fieldBase} type="password" placeholder="Mínimo 4 caracteres"
                  value={form.senha} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} />
              </div>
            </div>

            {err && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600, color: '#f87171' }}>{err}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,207,160,0.15)',
                fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(232,207,160,0.6)',
              }}>
                Cancelar
              </button>
              <button type="submit" style={{
                flex: 2, padding: '12px', borderRadius: 12, cursor: 'pointer',
                background: 'linear-gradient(135deg,#f37435,#b8860b)', border: 'none',
                fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <ShieldCheck size={15} /> Adicionar gerente
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </>
  )
}

// ── Card de gerente ───────────────────────────────────────────────────────────
function GerenteCard({ gerente, count, onRemove }: {
  gerente: AdminUser; count: number; onRemove: (id: string) => void
}) {
  const [confirm, setConfirm] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(22,10,2,0.9)', border: '1px solid rgba(232,207,160,0.1)',
        borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: 'linear-gradient(135deg,#b8860b,#7a5a07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: '#fff',
        }}>
          {initials(gerente.nome)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            {gerente.nome}
          </p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {gerente.email}
          </p>
        </div>
        <span style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#e8c96a', background: 'rgba(184,134,11,0.14)',
          border: '1px solid rgba(184,134,11,0.3)', borderRadius: 8, padding: '3px 8px', flexShrink: 0,
        }}>
          Gerente
        </span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,207,160,0.08)', borderRadius: 12,
      }}>
        <Users size={14} color="#f37435" />
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(232,207,160,0.7)' }}>
          <strong style={{ color: '#fff' }}>{count}</strong> {count === 1 ? 'colaborador' : 'colaboradores'} sob responsabilidade
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!confirm ? (
          <motion.button key="rm" onClick={() => setConfirm(true)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#f87171',
            }}>
            <Trash2 size={13} /> Remover gerente
          </motion.button>
        ) : (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <AlertTriangle size={13} color="#f87171" />
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: '#f87171' }}>
                Remover {gerente.nome.split(' ')[0]}? Os colaboradores ficam sem gerente.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirm(false)} style={{
                flex: 1, padding: '7px', borderRadius: 9, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,207,160,0.13)',
                fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(232,207,160,0.6)',
              }}>
                Cancelar
              </button>
              <button onClick={() => onRemove(gerente.id)} style={{
                flex: 1, padding: '7px', borderRadius: 9, cursor: 'pointer',
                background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#f87171',
              }}>
                Sim, remover
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Página ─────────────────────────────────────────────────────────────────────
export default function AdminGerentes() {
  const [gerentes, setGerentes] = useState<AdminUser[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [openForm, setOpenForm] = useState(false)

  const reload = () => {
    setGerentes(listGerentes())
    listEmployees().then(setEmployees)
  }
  useEffect(() => { reload() }, [])

  const countByGerente = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of employees) {
      if (e.gerenteId) map[e.gerenteId] = (map[e.gerenteId] ?? 0) + 1
    }
    return map
  }, [employees])

  const handleRemove = (id: string) => {
    removeGerente(id)
    reload()
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Equipe"
        title="Gerentes"
        description="Cadastre gerentes e acompanhe quantos colaboradores cada um conduz."
        action={
          <button className="adm-btn adm-btn--primary" onClick={() => setOpenForm(true)}>
            <Plus className="h-4 w-4" /> Adicionar gerente
          </button>
        }
      />

      {gerentes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            background: 'rgba(22,10,2,0.5)', border: '1px solid rgba(232,207,160,0.08)', borderRadius: 20,
            padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
          <ShieldCheck size={44} color="rgba(232,207,160,0.15)" />
          <div>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#e8cfa0', marginBottom: 6 }}>Nenhum gerente cadastrado</p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(232,207,160,0.4)' }}>Adicione o primeiro gerente para distribuir os colaboradores.</p>
          </div>
          <button className="adm-btn adm-btn--primary" onClick={() => setOpenForm(true)}>
            <Plus size={15} /> Adicionar o primeiro
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {gerentes.map((g) => (
            <GerenteCard key={g.id} gerente={g} count={countByGerente[g.id] ?? 0} onRemove={handleRemove} />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {openForm && (
          <NovoGerenteModal
            onClose={() => setOpenForm(false)}
            onSaved={() => { setOpenForm(false); reload() }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
