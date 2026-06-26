import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, X, Mail, User, Lock, Users, Trash2, ShieldCheck, AlertTriangle, UserCog,
  MessageCircle, Copy, Check, ChevronRight, FileSignature,
} from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import type { AdminUser } from '@/lib/types'
import { listGerentes, addGerente, removeGerente } from '../auth'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState, Skeleton } from '../components/ui'
import { StatusBadge, statusOf } from '../components/StatusBadge'
import { ColaboradorDetailModal, acessoLink, waLink } from './AdminColaboradores'

type TeamFilter = 'todos' | 'pendentes' | 'emdia' | 'assinou'
const TEAM_FILTERS: { id: TeamFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendentes', label: 'Pendentes' },
  { id: 'emdia', label: 'Em dia' },
  { id: 'assinou', label: 'Assinaram' },
]
const isEmDia = (r: EmployeeRow) => r.progress >= 1 && r.signed

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
function GerenteRow({ gerente, count, pendentes, onRemove, onOpen }: {
  gerente: AdminUser; count: number; pendentes: number; onRemove: (g: AdminUser) => void; onOpen: (g: AdminUser) => void
}) {
  return (
    <tr className="group cursor-pointer" tabIndex={0} aria-label={`Ver equipe de ${gerente.nome}`}
      onClick={() => onOpen(gerente)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(gerente) } }}>
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
        {pendentes > 0 ? (
          <span className="inline-flex items-center rounded-full border border-[#f5e2c0] bg-[#fdf4e3] px-2.5 py-0.5 text-[0.72rem] font-semibold text-[#9a6b15]">
            {pendentes} pendente{pendentes === 1 ? '' : 's'}
          </span>
        ) : count > 0 ? (
          <span className="inline-flex items-center rounded-full border border-[#cdebd9] bg-[#ecf7f0] px-2.5 py-0.5 text-[0.72rem] font-semibold text-[#1e7e4e]">
            Equipe em dia
          </span>
        ) : (
          <span className="text-[0.78rem] text-[var(--text-muted)]">—</span>
        )}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <span className="hidden items-center gap-1 text-[0.75rem] font-medium text-[var(--text-muted)] group-hover:flex">
            Ver equipe <ChevronRight className="h-3.5 w-3.5" />
          </span>
          <button onClick={() => onRemove(gerente)} aria-label={`Remover ${gerente.nome}`} title="Remover gerente"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] opacity-0 transition-opacity hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] group-hover:opacity-100 focus-within:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Card (mobile) ────────────────────────────────────────────────────────────
function GerenteCardMobile({ gerente, count, pendentes, onRemove, onOpen }: {
  gerente: AdminUser; count: number; pendentes: number; onRemove: (g: AdminUser) => void; onOpen: (g: AdminUser) => void
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4" onClick={() => onOpen(gerente)}>
      <div className="flex items-start gap-3">
        <Avatar name={gerente.nome} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--ink)]">{gerente.nome}</p>
          <p className="truncate text-[0.8125rem] text-[var(--text-muted)]">{gerente.email}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--bg-subtle)] px-3 py-2.5">
        <Users className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.8} />
        <span className="flex-1 text-[0.8125rem] text-[var(--text-secondary)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <strong className="text-[var(--ink)]">{count}</strong> {count === 1 ? 'colaborador' : 'colaboradores'}
        </span>
        {pendentes > 0 ? (
          <span className="rounded-full border border-[#f5e2c0] bg-[#fdf4e3] px-2 py-0.5 text-[0.7rem] font-semibold text-[#9a6b15]">{pendentes} pend.</span>
        ) : count > 0 ? (
          <span className="rounded-full border border-[#cdebd9] bg-[#ecf7f0] px-2 py-0.5 text-[0.7rem] font-semibold text-[#1e7e4e]">Em dia</span>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onOpen(gerente)} className="adm-btn adm-btn--primary h-9 flex-1">
          <Users className="h-4 w-4" /> Ver equipe
        </button>
        <button onClick={() => onRemove(gerente)} aria-label="Remover gerente" className="adm-btn adm-btn--danger h-9 w-9 shrink-0 px-0">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Item da equipe (dentro do drill-down) ────────────────────────────────────
function TeamMemberItem({ row, onOpen, onCopy, copied }: {
  row: EmployeeRow; onOpen: (r: EmployeeRow) => void; onCopy: (link: string, id: string) => void; copied: string | null
}) {
  const pct = Math.round(row.progress * 100)
  const link = acessoLink(row.employee.id)
  const isCopied = copied === row.employee.id
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-3 transition-colors hover:border-[var(--border-strong)]"
      role="button" tabIndex={0} onClick={() => onOpen(row)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(row) } }}>
      <Avatar name={row.employee.name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.875rem] font-semibold text-[var(--ink)]">{row.employee.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="adm-pbar w-20"><i style={{ width: `${pct}%` }} /></div>
          <span className="text-[0.7rem] text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.completedModules}/{row.totalModules}</span>
        </div>
      </div>
      <StatusBadge status={statusOf(row)} />
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onCopy(link, row.employee.id)} title="Copiar link"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]">
          {isCopied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
        </button>
        <a href={waLink(row.employee.name, link)} target="_blank" rel="noopener noreferrer" title="WhatsApp"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1e7e4e] hover:bg-[#ecf7f0]">
          <MessageCircle className="h-4 w-4" />
        </a>
        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
    </div>
  )
}

function TeamStat({ value, label, tone }: { value: ReactNode; label: string; tone?: 'amber' | 'green' }) {
  const color = tone === 'amber' ? 'text-[#9a6b15]' : tone === 'green' ? 'text-[#1e7e4e]' : 'text-[var(--ink)]'
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white px-2 py-2.5 text-center">
      <p className={`text-[1.15rem] font-bold ${color}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p className="text-[0.66rem] text-[var(--text-muted)]">{label}</p>
    </div>
  )
}

// ── Modal: visão 360° do gerente (equipe interligada) ────────────────────────
function GerenteDetailModal({ gerente, team, onClose, onOpenColab, onCopy, copied }: {
  gerente: AdminUser; team: EmployeeRow[]
  onClose: () => void; onOpenColab: (r: EmployeeRow) => void; onCopy: (link: string, id: string) => void; copied: string | null
}) {
  const [filter, setFilter] = useState<TeamFilter>('todos')
  const total = team.length
  const emDia = team.filter(isEmDia).length
  const assinaram = team.filter((r) => r.signed).length
  const pendentes = total - emDia
  const avg = total ? Math.round((team.reduce((s, r) => s + r.progress, 0) / total) * 100) : 0

  const filtered = team.filter((r) => {
    if (filter === 'pendentes') return !isEmDia(r)
    if (filter === 'emdia') return isEmDia(r)
    if (filter === 'assinou') return r.signed
    return true
  })

  return (
    <ModalShell onClose={onClose}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={gerente.nome} size={48} />
          <div className="min-w-0">
            <h2 className="truncate text-[1.15rem] font-semibold text-[var(--ink)]">{gerente.nome}</h2>
            <p className="truncate text-[0.8125rem] text-[var(--text-muted)]">{gerente.email}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]">
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* status geral da equipe */}
      <div className="grid grid-cols-4 gap-2">
        <TeamStat value={total} label="Equipe" />
        <TeamStat value={emDia} label="Em dia" tone={emDia > 0 ? 'green' : undefined} />
        <TeamStat value={pendentes} label="Pendentes" tone={pendentes > 0 ? 'amber' : undefined} />
        <TeamStat value={`${avg}%`} label="Progresso" />
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-[0.78rem] text-[var(--text-secondary)]">
        <FileSignature className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.8} />
        <strong className="text-[var(--ink)]">{assinaram}</strong> de {total} já assinaram o termo
      </div>

      {/* filtros + equipe */}
      {total === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-8 text-center">
          <Users className="mx-auto mb-2 h-7 w-7 text-[var(--text-disabled)]" strokeWidth={1.6} />
          <p className="text-[0.875rem] font-medium text-[var(--text-secondary)]">Nenhum colaborador vinculado</p>
          <p className="mt-0.5 text-[0.78rem] text-[var(--text-muted)]">Atribua este gerente ao cadastrar ou editar um colaborador.</p>
        </div>
      ) : (
        <>
          <div className="adm-no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {TEAM_FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f.id ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {filtered.length === 0 ? (
              <p className="px-1 py-6 text-center text-[0.82rem] text-[var(--text-muted)]">Ninguém neste filtro.</p>
            ) : (
              filtered.map((r) => (
                <TeamMemberItem key={r.employee.id} row={r} onOpen={onOpenColab} onCopy={onCopy} copied={copied} />
              ))
            )}
          </div>
        </>
      )}
    </ModalShell>
  )
}

// ── Página ───────────────────────────────────────────────────────────────────
export default function AdminGerentes() {
  const [gerentes, setGerentes] = useState<AdminUser[] | null>(null)
  const [rows, setRows] = useState<EmployeeRow[]>([])
  const [openForm, setOpenForm] = useState(false)
  const [removing, setRemoving] = useState<AdminUser | null>(null)
  const [viewing, setViewing] = useState<AdminUser | null>(null)
  const [viewingColab, setViewingColab] = useState<EmployeeRow | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const reload = () => {
    setGerentes(listGerentes())
    loadEmployeeRows().then(setRows)
  }
  useEffect(() => { reload() }, [])

  const teamByGerente = useMemo(() => {
    const map: Record<string, EmployeeRow[]> = {}
    for (const r of rows) {
      const gid = r.employee.gerenteId
      if (gid) (map[gid] ??= []).push(r)
    }
    return map
  }, [rows])

  const copy = async (link: string, id: string) => {
    try { await navigator.clipboard.writeText(link) } catch { /* noop */ }
    setCopied(id); setTimeout(() => setCopied(null), 1800)
  }

  const handleRemove = (id: string) => {
    removeGerente(id)
    reload()
  }

  const teamOf = (g: AdminUser) => teamByGerente[g.id] ?? []
  const pendentesOf = (g: AdminUser) => teamOf(g).filter((r) => !isEmDia(r)).length
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
                    <th>Equipe</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {gerentes.map((g) => (
                    <GerenteRow key={g.id} gerente={g} count={teamOf(g).length} pendentes={pendentesOf(g)} onRemove={setRemoving} onOpen={setViewing} />
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
                <GerenteCardMobile gerente={g} count={teamOf(g).length} pendentes={pendentesOf(g)} onRemove={setRemoving} onOpen={setViewing} />
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
            count={teamOf(removing).length}
            onClose={() => setRemoving(null)}
            onConfirm={() => { handleRemove(removing.id); setRemoving(null) }}
          />
        )}
      </AnimatePresence>

      {/* drill-down: visão 360° do gerente */}
      <AnimatePresence>
        {viewing && (
          <GerenteDetailModal
            gerente={viewing}
            team={teamOf(viewing)}
            onClose={() => setViewing(null)}
            onOpenColab={(r) => setViewingColab(r)}
            onCopy={copy}
            copied={copied}
          />
        )}
      </AnimatePresence>

      {/* visão 360° do colaborador (reusada) sobre a equipe do gerente */}
      <AnimatePresence>
        {viewingColab && (
          <ColaboradorDetailModal
            row={viewingColab}
            gerenteName={viewing?.nome}
            onClose={() => setViewingColab(null)}
            onCopy={copy}
            copied={copied}
          />
        )}
      </AnimatePresence>
    </>
  )
}
