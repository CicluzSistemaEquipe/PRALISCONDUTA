import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, X, Mail, User, Lock, Users, Trash2, ShieldCheck, AlertTriangle, UserCog,
} from 'lucide-react'
import { listEmployees } from '@/lib/storage'
import type { AdminUser, Employee } from '@/lib/types'
import { listGerentes, addGerente, removeGerente } from '../auth'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState, Skeleton } from '../components/ui'

// ── helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--brand-brown)] font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </div>
  )
}

// ── Modal shell (bottom-sheet no mobile, centralizado no desktop) ────────────
function ModalShell({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-[rgba(26,23,20,0.45)]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" onClick={onClose}>
        <motion.div role="dialog" aria-modal="true"
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 28 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[92dvh] w-full max-w-[460px] overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-md)] sm:rounded-2xl"
        >
          {children}
        </motion.div>
      </div>
    </>
  )
}

function ModalHeader({ icon: Icon, eyebrow, title, onClose }: { icon: typeof ShieldCheck; eyebrow: string; title: string; onClose: () => void }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--accent-tint)]">
          <Icon className="h-5 w-5 text-[#f26b2a]" strokeWidth={1.9} />
        </div>
        <div>
          <p className="adm-eyebrow">{eyebrow}</p>
          <h2 className="mt-0.5 text-[1.15rem] font-semibold text-[var(--ink)]">{title}</h2>
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]">
        <X className="h-[18px] w-[18px]" />
      </button>
    </div>
  )
}

// ── Modal: adicionar gerente ─────────────────────────────────────────────────
function NovoGerenteModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const nome = form.nome.trim()
    const email = form.email.trim().toLowerCase()
    if (!nome) { setErr('Informe o nome do gerente.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('E-mail inválido.'); return }
    if (form.senha.length < 4) { setErr('A senha deve ter ao menos 4 caracteres.'); return }
    setSaving(true)
    addGerente({ nome, email })
    onSaved()
  }

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader icon={ShieldCheck} eyebrow="Equipe" title="Novo gerente" onClose={onClose} />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="adm-label" htmlFor="ng-nome">Nome completo</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.8} />
            <input id="ng-nome" className="adm-input" autoFocus placeholder="Ex.: João Mendes"
              style={{ paddingLeft: 38 }}
              value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="adm-label" htmlFor="ng-email">E-mail</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.8} />
            <input id="ng-email" className="adm-input" type="email" placeholder="gerente@pralis.com.br"
              style={{ paddingLeft: 38 }}
              value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="adm-label" htmlFor="ng-senha">Senha de acesso</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.8} />
            <input id="ng-senha" className="adm-input" type="password" placeholder="Mínimo 4 caracteres"
              style={{ paddingLeft: 38 }}
              value={form.senha} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} />
          </div>
        </div>

        {err && <p className="text-[0.8125rem] font-medium text-[var(--danger)]">{err}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="adm-btn flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="adm-btn adm-btn--primary flex-[2]">
            {saving ? 'Adicionando…' : <><ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} /> Adicionar gerente</>}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ── Modal: confirmar remoção ─────────────────────────────────────────────────
function RemoverGerenteModal({ gerente, count, onClose, onConfirm }: {
  gerente: AdminUser; count: number; onClose: () => void; onConfirm: () => void
}) {
  const [removing, setRemoving] = useState(false)
  const remove = () => { setRemoving(true); onConfirm() }
  return (
    <ModalShell onClose={onClose}>
      <ModalHeader icon={Trash2} eyebrow="Remover gerente" title={gerente.nome} onClose={onClose} />

      <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
        <Avatar name={gerente.nome} size={40} />
        <div className="min-w-0">
          <p className="truncate text-[0.875rem] font-semibold text-[var(--ink)]">{gerente.nome}</p>
          <p className="truncate text-[0.8125rem] text-[var(--text-muted)]">{gerente.email}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#f3d2cd] bg-[var(--danger-bg)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
          <p className="text-[0.875rem] font-semibold text-[var(--danger)]">Confirma a remoção?</p>
        </div>
        <p className="text-[0.8125rem] text-[var(--text-muted)]">
          {count > 0
            ? <>Os <strong className="text-[var(--text-secondary)]">{count} {count === 1 ? 'colaborador' : 'colaboradores'}</strong> sob responsabilidade de {gerente.nome.split(' ')[0]} ficarão sem gerente.</>
            : <>{gerente.nome.split(' ')[0]} não tem colaboradores vinculados. A remoção é segura.</>}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={onClose} className="adm-btn flex-1">Cancelar</button>
        <button type="button" onClick={remove} disabled={removing}
          className="adm-btn flex-[2] border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-[#a93226]">
          {removing ? 'Removendo…' : <><Trash2 className="h-4 w-4" /> Sim, remover</>}
        </button>
      </div>
    </ModalShell>
  )
}

// ── Linha da tabela (desktop) ────────────────────────────────────────────────
function GerenteRow({ gerente, count, onRemove }: {
  gerente: AdminUser; count: number; onRemove: (g: AdminUser) => void
}) {
  return (
    <tr className="group">
      <td>
        <div className="flex items-center gap-3">
          <Avatar name={gerente.nome} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--ink)]">{gerente.nome}</p>
            <p className="truncate text-[0.7rem] text-[var(--text-muted)]">{gerente.email}</p>
          </div>
        </div>
      </td>
      <td><span className="adm-badge adm-badge--muted">Gerente</span></td>
      <td>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Users className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.8} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            <strong className="text-[var(--ink)]">{count}</strong> {count === 1 ? 'colaborador' : 'colaboradores'}
          </span>
        </div>
      </td>
      <td>
        <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button onClick={() => onRemove(gerente)} aria-label={`Remover ${gerente.nome}`} title="Remover gerente"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Card (mobile) ────────────────────────────────────────────────────────────
function GerenteCardMobile({ gerente, count, onRemove }: {
  gerente: AdminUser; count: number; onRemove: (g: AdminUser) => void
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="flex items-start gap-3">
        <Avatar name={gerente.nome} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--ink)]">{gerente.nome}</p>
          <p className="truncate text-[0.8125rem] text-[var(--text-muted)]">{gerente.email}</p>
        </div>
        <span className="adm-badge adm-badge--muted shrink-0">Gerente</span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--bg-subtle)] px-3 py-2.5">
        <Users className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.8} />
        <span className="text-[0.8125rem] text-[var(--text-secondary)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <strong className="text-[var(--ink)]">{count}</strong> {count === 1 ? 'colaborador' : 'colaboradores'} sob responsabilidade
        </span>
      </div>
      <button onClick={() => onRemove(gerente)}
        className="adm-btn adm-btn--danger mt-3 h-9 w-full">
        <Trash2 className="h-4 w-4" /> Remover gerente
      </button>
    </div>
  )
}

// ── Página ───────────────────────────────────────────────────────────────────
export default function AdminGerentes() {
  const [gerentes, setGerentes] = useState<AdminUser[] | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [openForm, setOpenForm] = useState(false)
  const [removing, setRemoving] = useState<AdminUser | null>(null)

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

  const hasGerentes = gerentes !== null && gerentes.length > 0

  return (
    <>
      <AdminPageHeader
        eyebrow="Equipe"
        title="Gerentes"
        description="Cadastre gerentes e acompanhe quantos colaboradores cada um conduz."
        action={
          <button className="adm-btn adm-btn--primary" onClick={() => setOpenForm(true)}>
            <Plus className="h-[18px] w-[18px]" strokeWidth={2} /> Adicionar gerente
          </button>
        }
      />

      {/* conteúdo */}
      {gerentes === null ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
      ) : !hasGerentes ? (
        <div className="rounded-xl border border-[var(--border)] bg-white">
          <EmptyState
            icon={UserCog}
            title="Nenhum gerente cadastrado"
            hint="Adicione o primeiro gerente para distribuir os colaboradores e acompanhar a equipe."
            action={
              <button className="adm-btn adm-btn--primary" onClick={() => setOpenForm(true)}>
                <Plus className="h-[18px] w-[18px]" strokeWidth={2} /> Adicionar o primeiro
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* desktop: tabela */}
          <div className="hidden overflow-hidden rounded-xl border border-[var(--border)] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Gerente</th>
                    <th>Função</th>
                    <th>Colaboradores</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gerentes.map((g) => (
                    <GerenteRow key={g.id} gerente={g} count={countByGerente[g.id] ?? 0} onRemove={setRemoving} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* mobile: cards */}
          <motion.div initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            className="flex flex-col gap-3 md:hidden">
            {gerentes.map((g) => (
              <motion.div key={g.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <GerenteCardMobile gerente={g} count={countByGerente[g.id] ?? 0} onRemove={setRemoving} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* modais */}
      <AnimatePresence>
        {openForm && (
          <NovoGerenteModal
            onClose={() => setOpenForm(false)}
            onSaved={() => { setOpenForm(false); reload() }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {removing && (
          <RemoverGerenteModal
            gerente={removing}
            count={countByGerente[removing.id] ?? 0}
            onClose={() => setRemoving(null)}
            onConfirm={() => { handleRemove(removing.id); setRemoving(null) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
