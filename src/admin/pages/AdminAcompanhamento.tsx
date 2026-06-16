import { Fragment, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ChevronDown, ChevronRight, Check, X } from 'lucide-react'
import { listEmployees, getProgress, getSignature } from '@/lib/storage'
import { modulesForRole } from '@/lib/content'
import type { Employee } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { StatusBadge, statusOf, type EmpStatus } from '../components/StatusBadge'

interface ModuleCell {
  id: string
  title: string
  completed: boolean
  completedAt: string | null
}
interface DetailRow {
  employee: Employee
  modules: ModuleCell[]
  done: number
  total: number
  progress: number
  signed: boolean
  signedAt: string | null
}

async function loadDetail(): Promise<DetailRow[]> {
  const employees = await listEmployees()
  return Promise.all(
    employees.map(async (employee) => {
      const [progress, signature] = await Promise.all([getProgress(employee.id), getSignature(employee.id)])
      const mods = modulesForRole(employee.role)
      const modules: ModuleCell[] = mods.map((m) => {
        const p = progress.find((x) => x.module_id === m.id)
        return { id: m.id, title: m.title, completed: Boolean(p?.completed), completedAt: p?.completed_at ?? null }
      })
      const done = modules.filter((m) => m.completed).length
      return {
        employee,
        modules,
        done,
        total: modules.length,
        progress: modules.length ? done / modules.length : 0,
        signed: Boolean(signature),
        signedAt: signature?.signed_at ?? null,
      }
    }),
  )
}

const FILTERS: { id: EmpStatus | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendente', label: 'Pendente' },
  { id: 'andamento', label: 'Em andamento' },
  { id: 'concluido', label: 'Concluído' },
  { id: 'assinou', label: 'Assinou' },
]

function fmt(dt: string | null) {
  return dt ? new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
}

function exportCSV(rows: DetailRow[]) {
  const head = ['Nome', 'Matrícula', 'Cargo', 'Módulos concluídos', 'Total', 'Progresso %', 'Assinou', 'Data assinatura']
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const lines = rows.map((r) =>
    [r.employee.name, r.employee.phone || r.employee.token, r.employee.role, r.done, r.total, Math.round(r.progress * 100), r.signed ? 'Sim' : 'Não', r.signedAt ? new Date(r.signedAt).toLocaleString('pt-BR') : '']
      .map(esc)
      .join(','),
  )
  const csv = '﻿' + [head.map(esc).join(','), ...lines].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pralis-acompanhamento-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminAcompanhamento() {
  const [rows, setRows] = useState<DetailRow[] | null>(null)
  const [filter, setFilter] = useState<EmpStatus | 'todos'>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadDetail().then(setRows)
  }, [])

  const filtered = useMemo(() => {
    if (!rows) return []
    if (filter === 'todos') return rows
    return rows.filter((r) => statusOf(r) === filter)
  }, [rows, filter])

  return (
    <>
      <AdminPageHeader
        eyebrow="Relatórios"
        title="Acompanhamento"
        description="Progresso módulo a módulo, assinaturas e exportação."
        action={
          <button className="adm-btn adm-btn--primary" disabled={!rows?.length} onClick={() => rows && exportCSV(rows)}>
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
        }
      />

      {/* filtros */}
      <div className="adm-no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap rounded-pill px-4 py-2 text-xs font-semibold ${
              filter === f.id ? 'text-[var(--gold-light)] ring-1 ring-[rgba(184,134,11,0.4)]' : 'text-[var(--cream-muted)]'
            }`}
            style={{ background: filter === f.id ? 'rgba(184,134,11,0.16)' : 'rgba(255,245,220,0.05)' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="adm-card overflow-hidden">
        {rows === null ? (
          <div className="px-5 py-6 text-sm text-[var(--cream-muted)]">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[var(--cream-muted)]">Nenhum colaborador neste filtro.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="w-8"></th>
                  <th>Colaborador</th>
                  <th>Cargo</th>
                  <th className="w-[26%]">Progresso</th>
                  <th>Assinou</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isOpen = expanded === r.employee.id
                  return (
                    <Fragment key={r.employee.id}>
                      <tr className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : r.employee.id)}>
                        <td>{isOpen ? <ChevronDown className="h-4 w-4 text-[var(--cream-muted)]" /> : <ChevronRight className="h-4 w-4 text-[var(--cream-muted)]" />}</td>
                        <td className="font-semibold text-white">{r.employee.name}</td>
                        <td className="text-[var(--cream-muted)]">{r.employee.role}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="adm-pbar flex-1"><i style={{ width: `${Math.round(r.progress * 100)}%` }} /></div>
                            <span className="w-12 text-right text-xs text-[var(--cream-muted)]">{r.done}/{r.total}</span>
                          </div>
                        </td>
                        <td className="text-xs text-[var(--cream-muted)]">{r.signed ? fmt(r.signedAt) : 'não'}</td>
                        <td><StatusBadge status={statusOf(r)} /></td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={6} style={{ background: 'rgba(0,0,0,0.25)' }}>
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid gap-2 px-2 py-1 sm:grid-cols-2">
                              {r.modules.map((m) => (
                                <div key={m.id} className="flex items-center justify-between rounded-lg bg-[rgba(255,245,220,0.04)] px-3 py-2">
                                  <span className="flex items-center gap-2 text-sm text-[var(--cream)]">
                                    {m.completed ? (
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(93,216,122,0.18)] text-[#5dd87a]"><Check className="h-3 w-3" /></span>
                                    ) : (
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(255,245,220,0.08)] text-[var(--cream-muted)]"><X className="h-3 w-3" /></span>
                                    )}
                                    {m.title}
                                  </span>
                                  <span className="text-[0.7rem] text-[var(--cream-muted)]">{m.completed ? fmt(m.completedAt) : 'pendente'}</span>
                                </div>
                              ))}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
