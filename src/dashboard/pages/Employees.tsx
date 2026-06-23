import { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { ROLES, type Employee, type Role } from '@/lib/types'
import {
  deleteEmployee,
  regenerateEmployeeAccess,
  updateEmployee,
} from '@/lib/storage'
import { employeeLink, loadEmployeeRows, type EmployeeRow } from '../data'

type EditState = Pick<Employee, 'id' | 'name' | 'phone' | 'role'>

export default function Employees() {
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const reload = () => loadEmployeeRows().then(setRows)

  useEffect(() => {
    void reload()
  }, [])

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      setError('Nao foi possivel copiar automaticamente.')
    }
  }

  const copyAccess = (row: EmployeeRow) =>
    copy(
      [
        `Link: ${row.link}`,
        `ID: ${row.accessId}`,
        `Senha: ${row.accessCode}`,
      ].join('\n'),
      `access-${row.employee.id}`,
    )

  const startEdit = (employee: Employee) =>
    setEditing({
      id: employee.id,
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
    })

  const saveEdit = async () => {
    if (!editing) return
    if (!editing.name.trim()) {
      setError('Informe o nome do colaborador.')
      return
    }
    setBusyId(editing.id)
    setError('')
    try {
      await updateEmployee(editing.id, {
        name: editing.name.trim(),
        phone: editing.phone.trim(),
        role: editing.role,
      })
      setEditing(null)
      await reload()
    } catch {
      setError('Nao foi possivel salvar o colaborador.')
    } finally {
      setBusyId(null)
    }
  }

  const regenerate = async (employee: Employee) => {
    if (!confirm(`Gerar novo link e senha para ${employee.name}? O link antigo deixara de ser usado.`)) return
    setBusyId(employee.id)
    setError('')
    try {
      const updated = await regenerateEmployeeAccess(employee.id)
      await reload()
      if (updated) {
        await copy(
          [
            `Link: ${employeeLink(updated.token)}`,
            `ID: ${updated.token}`,
            `Senha: ${updated.access_code ?? 'Sem senha'}`,
          ].join('\n'),
          `access-${updated.id}`,
        )
      }
    } catch {
      setError('Nao foi possivel regenerar o acesso.')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (employee: Employee) => {
    if (!confirm(`Excluir ${employee.name}? O progresso, quizzes e assinatura local tambem serao removidos.`)) return
    setBusyId(employee.id)
    setError('')
    try {
      await deleteEmployee(employee.id)
      await reload()
    } catch {
      setError('Nao foi possivel excluir o colaborador.')
    } finally {
      setBusyId(null)
    }
  }

  if (!rows) return <div className="skeleton h-64" />

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-pralis-branco">Colaboradores</h1>
          <p className="mt-1 font-body text-sm text-pralis-creme/60">
            {rows.length} cadastrado{rows.length === 1 ? '' : 's'} com link, ID e senha.
          </p>
        </div>
        <button onClick={() => void reload()} className="btn-ghost self-start md:self-auto">
          <RefreshCw className="h-4 w-4" /> Atualizar
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-pralis-vermelho/30 bg-pralis-vermelho/10 px-4 py-3 font-body text-sm text-pralis-vermelho">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-card border border-pralis-marrom-lk/50">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="bg-pralis-marrom-dk/60 text-left font-body text-xs uppercase tracking-wide text-pralis-creme/60">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Progresso</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acesso</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody className="font-body text-sm">
            {rows.map((row) => {
              const employee = row.employee
              const pending = busyId === employee.id
              return (
                <tr key={employee.id} className="border-t border-pralis-marrom-lk/30 align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-pralis-branco">{employee.name}</p>
                    <p className="mt-1 text-xs text-pralis-creme/50">{employee.phone || 'Sem WhatsApp'}</p>
                  </td>
                  <td className="px-4 py-3 text-pralis-creme/80">{employee.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-pralis-laranja"
                          style={{ width: `${Math.round(row.progress * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-pralis-creme/70">
                        {row.completedModules}/{row.totalModules}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Status row={row} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-[260px] rounded-xl border border-pralis-marrom-lk/50 bg-pralis-marrom-dk/40 p-3">
                      <p className="truncate text-xs text-pralis-creme/60">ID: {row.accessId}</p>
                      <p className="mt-1 text-xs font-black text-pralis-branco">Senha: {row.accessCode}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => copyAccess(row)}
                          className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-pralis-creme/80 hover:bg-white/10"
                        >
                          {copied === `access-${employee.id}` ? <Check className="h-3.5 w-3.5 text-pralis-verde" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied === `access-${employee.id}` ? 'Copiado' : 'Copiar'}
                        </button>
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-pralis-creme/50 hover:text-pralis-laranja"
                          aria-label="Abrir link"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <IconButton label="Editar" disabled={pending} onClick={() => startEdit(employee)}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Regenerar" disabled={pending} onClick={() => void regenerate(employee)}>
                        <RefreshCw className={`h-4 w-4 ${pending ? 'animate-spin' : ''}`} />
                      </IconButton>
                      <IconButton label="Excluir" danger disabled={pending} onClick={() => void remove(employee)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-pralis-creme/50">
                  Nenhum colaborador cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-5">
          <div className="w-full max-w-[520px] rounded-card border border-pralis-marrom-lk/70 bg-pralis-marrom p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-pralis-branco">Editar colaborador</h2>
                <p className="font-body text-sm text-pralis-creme/60">Atualize nome, WhatsApp e cargo.</p>
              </div>
              <button onClick={() => setEditing(null)} className="btn-ghost px-3 py-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4">
              <Field label="Nome completo">
                <input
                  className="input-dash"
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  className="input-dash"
                  inputMode="tel"
                  value={editing.phone}
                  onChange={(event) => setEditing({ ...editing, phone: event.target.value })}
                />
              </Field>
              <Field label="Cargo">
                <select
                  className="input-dash"
                  value={editing.role}
                  onChange={(event) => setEditing({ ...editing, role: event.target.value as Role })}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => setEditing(null)} className="btn-ghost flex-1">
                Cancelar
              </button>
              <button onClick={() => void saveEdit()} disabled={busyId === editing.id} className="btn-laranja flex-1">
                <Save className="h-5 w-5" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Status({ row }: { row: EmployeeRow }) {
  if (row.signed) {
    return <span className="rounded-pill bg-pralis-verde/15 px-2.5 py-1 text-xs font-semibold text-pralis-verde">Assinado</span>
  }
  if (row.progress >= 1) {
    return <span className="rounded-pill bg-pralis-ouro/15 px-2.5 py-1 text-xs font-semibold text-pralis-ouro-lt">Aguardando assinatura</span>
  }
  return <span className="rounded-pill bg-pralis-laranja/15 px-2.5 py-1 text-xs font-semibold text-pralis-laranja">Em andamento</span>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-body text-sm font-semibold text-pralis-creme">{label}</span>
      {children}
    </label>
  )
}

function IconButton({
  label,
  children,
  danger,
  disabled,
  onClick,
}: {
  label: string
  children: React.ReactNode
  danger?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors ${
        danger
          ? 'bg-pralis-vermelho/10 text-pralis-vermelho hover:bg-pralis-vermelho/20'
          : 'bg-white/5 text-pralis-creme/80 hover:bg-white/10'
      } disabled:cursor-not-allowed disabled:opacity-45`}
      title={label}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}
