import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Copy, Check, X, Link2, Users } from 'lucide-react'
import { createEmployee } from '@/lib/storage'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import { ROLES, type Role } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { StatusBadge, statusOf } from '../components/StatusBadge'

function acessoLink(name: string, token: string, role: string): string {
  const q = `mat=${encodeURIComponent(token)}&nome=${encodeURIComponent(name)}&cargo=${encodeURIComponent(role)}`
  return `${window.location.origin}/acesso?${q}`
}

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function AdminColaboradores() {
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', matricula: '', role: ROLES[0] as Role, start: todayISO() })
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = () => loadEmployeeRows().then(setRows)
  useEffect(() => {
    reload()
  }, [])

  const copy = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      /* fallback */
    }
    setCopied(id)
    window.setTimeout(() => setCopied(null), 1600)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const name = form.name.trim()
    const matricula = form.matricula.trim()
    if (!name || !matricula) {
      setErr('Preencha nome e matrícula.')
      return
    }
    if (rows?.some((r) => r.employee.token === matricula || r.employee.phone === matricula)) {
      setErr('Já existe um colaborador com essa matrícula.')
      return
    }
    setSaving(true)
    await createEmployee({ name, phone: matricula, role: form.role, token: matricula })
    setSaving(false)
    setOpen(false)
    setForm({ name: '', matricula: '', role: ROLES[0] as Role, start: todayISO() })
    reload()
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Pessoas"
        title="Colaboradores"
        description="Cadastre colaboradores e compartilhe o link de acesso individual."
        action={
          <button className="adm-btn adm-btn--primary" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Novo colaborador
          </button>
        }
      />

      <div className="adm-card overflow-hidden">
        {rows === null ? (
          <div className="px-5 py-6 text-sm text-[var(--cream-muted)]">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <Users className="h-8 w-8 text-[var(--cream-muted)]" />
            <p className="text-sm text-[var(--cream-muted)]">Nenhum colaborador cadastrado ainda.</p>
            <button className="adm-btn adm-btn--primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Cadastrar o primeiro</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Matrícula</th>
                  <th>Cargo</th>
                  <th>Status</th>
                  <th>Link de acesso</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const link = acessoLink(r.employee.name, r.employee.token, r.employee.role)
                  const isCopied = copied === r.employee.id
                  return (
                    <tr key={r.employee.id}>
                      <td className="font-semibold text-white">{r.employee.name}</td>
                      <td className="font-mono text-xs text-[var(--cream-muted)]">{r.employee.phone || r.employee.token}</td>
                      <td className="text-[var(--cream-muted)]">{r.employee.role}</td>
                      <td><StatusBadge status={statusOf(r)} /></td>
                      <td>
                        <button className={`adm-btn px-3 py-1.5 ${isCopied ? 'adm-btn--primary' : ''}`} onClick={() => copy(link, r.employee.id)}>
                          {isCopied ? <><Check className="h-3.5 w-3.5" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar link</>}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* modal cadastro */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/65" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
              <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="adm-card adm-card--gold w-full max-w-[440px] p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="adm-h1 text-xl">Novo colaborador</h2>
                  <button type="button" onClick={() => setOpen(false)} className="text-[var(--cream-muted)] hover:text-[var(--cream)]"><X className="h-5 w-5" /></button>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="adm-label">Nome completo</label>
                    <input className="adm-input" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Marina Souza" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="adm-label">Matrícula</label>
                      <input className="adm-input" value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} placeholder="0427" />
                    </div>
                    <div>
                      <label className="adm-label">Data de início</label>
                      <input type="date" className="adm-input" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="adm-label">Cargo</label>
                    <select className="adm-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {err && <p className="text-xs font-semibold text-[#e2604f]">{err}</p>}

                  <div className="mt-1 flex items-center gap-2 rounded-xl bg-[rgba(184,134,11,0.08)] p-3 text-[0.72rem] text-[var(--cream-muted)]">
                    <Link2 className="h-4 w-4 shrink-0 text-[var(--gold-light)]" />
                    Ao salvar, geramos o link <code className="text-[var(--gold-light)]">/acesso</code> que já loga o colaborador no app.
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button type="button" className="adm-btn flex-1" onClick={() => setOpen(false)}>Cancelar</button>
                    <button type="submit" className="adm-btn adm-btn--primary flex-1" disabled={saving}>{saving ? 'Salvando…' : 'Cadastrar'}</button>
                  </div>
                </div>
              </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
