import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Download, Search, X, SlidersHorizontal, Users, FileSignature, TrendingUp, Clock, ChevronRight,
} from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import { listGerentes } from '../auth'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { StatusBadge, statusOf, type EmpStatus } from '../components/StatusBadge'
import { EmptyState, Skeleton, Avatar } from '../components/ui'
import { StorePerformance } from '../components/StorePerformance'
import { ColaboradorDetailModal } from './AdminColaboradores'

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtDateTime(dt: string | null) {
  return dt ? new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
}
const quizPctOf = (r: EmployeeRow) => (r.quizTotal > 0 ? Math.round((r.quizCorrect / r.quizTotal) * 100) : null)

const STATUS_LABEL: Record<EmpStatus, string> = {
  pendente: 'Pendentes', andamento: 'Em andamento', concluido: 'Falta assinar', assinou: 'Concluídos',
}
const QUICK_VIEWS: { id: EmpStatus | ''; label: string }[] = [
  { id: '', label: 'Todos' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'andamento', label: 'Em andamento' },
  { id: 'concluido', label: 'Falta assinar' },
  { id: 'assinou', label: 'Concluídos' },
]
type GroupBy = 'none' | 'gerente' | 'loja' | 'cargo' | 'status'
const GROUP_OPTIONS: { id: GroupBy; label: string }[] = [
  { id: 'none', label: 'Sem agrupamento' },
  { id: 'gerente', label: 'Por gerente' },
  { id: 'loja', label: 'Por loja' },
  { id: 'cargo', label: 'Por cargo' },
  { id: 'status', label: 'Por status' },
]

interface Filters {
  search: string; loja: string; gerente: string; cargo: string
  assinatura: '' | 'sim' | 'nao'; progresso: '' | 'zero' | 'parcial' | 'cheio'
  admDe: string; admAte: string
}
const EMPTY_FILTERS: Filters = { search: '', loja: '', gerente: '', cargo: '', assinatura: '', progresso: '', admDe: '', admAte: '' }

function exportCSV(rows: EmployeeRow[], gerenteName: Record<string, string>) {
  const head = ['Nome', 'CPF', 'Cargo', 'Loja', 'Gerente', 'Situação', 'Admissão', 'Módulos concluídos', 'Total', 'Progresso %', 'Status', 'Assinou', 'Data assinatura', 'Quiz %']
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const statusTxt: Record<EmpStatus, string> = { pendente: 'Pendente', andamento: 'Em andamento', concluido: 'Falta assinar', assinou: 'Concluído' }
  const lines = rows.map((r) => {
    const e = r.employee
    return [
      e.name, e.phone || '', e.role, e.store || '', e.gerenteId ? (gerenteName[e.gerenteId] ?? '') : '',
      e.status ?? 'ativo', e.admission_date ?? '', r.completedModules, r.totalModules, Math.round(r.progress * 100),
      statusTxt[statusOf(r)], r.signed ? 'Sim' : 'Não', r.signedAt ? new Date(r.signedAt).toLocaleString('pt-BR') : '',
      quizPctOf(r) != null ? quizPctOf(r)! : '',
    ].map(esc).join(',')
  })
  const csv = '﻿' + [head.map(esc).join(','), ...lines].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pralis-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── cards de resumo ──────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, value, label, tone }: { icon: typeof Users; value: ReactNode; label: string; tone?: string }) {
  return (
    <div className="adm-card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent-tint)]">
        <Icon className="h-5 w-5" style={{ color: tone ?? '#f26b2a' }} strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-[1.35rem] font-bold leading-none text-[var(--ink)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</p>
        <p className="mt-1 text-[0.75rem] text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  )
}

// ── linha / card de colaborador ──────────────────────────────────────────────
function ReportRow({ row, gerenteName, onOpen }: { row: EmployeeRow; gerenteName?: string; onOpen: (r: EmployeeRow) => void }) {
  const pct = Math.round(row.progress * 100)
  return (
    <tr className="group cursor-pointer" tabIndex={0} aria-label={`Ver ${row.employee.name}`}
      onClick={() => onOpen(row)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(row) } }}>
      <td>
        <div className="flex items-center gap-3">
          <Avatar name={row.employee.name} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--ink)]">{row.employee.name}</p>
            <p className="text-[0.7rem] text-[var(--text-muted)]">{row.employee.role}</p>
          </div>
        </div>
      </td>
      <td className="text-[var(--text-secondary)]">{row.employee.store || '—'}</td>
      <td className="text-[var(--text-secondary)]">{gerenteName ?? '—'}</td>
      <td className="w-[22%]">
        <div className="flex items-center gap-2">
          <div className="adm-pbar flex-1"><i style={{ width: `${pct}%` }} /></div>
          <span className="w-10 text-right text-xs text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.completedModules}/{row.totalModules}</span>
        </div>
      </td>
      <td className="text-xs text-[var(--text-secondary)]">{row.signed ? fmtDateTime(row.signedAt) : 'Não'}</td>
      <td><StatusBadge status={statusOf(row)} /></td>
      <td><ChevronRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" /></td>
    </tr>
  )
}

function ReportCardMobile({ row, gerenteName, onOpen }: { row: EmployeeRow; gerenteName?: string; onOpen: (r: EmployeeRow) => void }) {
  const pct = Math.round(row.progress * 100)
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4" onClick={() => onOpen(row)}>
      <div className="flex items-start gap-3">
        <Avatar name={row.employee.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--ink)]">{row.employee.name}</p>
          <p className="text-[0.75rem] text-[var(--text-muted)]">{row.employee.role}{row.employee.store ? ` · ${row.employee.store}` : ''}</p>
        </div>
        <StatusBadge status={statusOf(row)} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="adm-pbar flex-1"><i style={{ width: `${pct}%` }} /></div>
        <span className="text-xs text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.completedModules}/{row.totalModules}</span>
      </div>
      <p className="mt-2 text-[0.72rem] text-[var(--text-muted)]">{row.signed ? `Assinou em ${fmtDateTime(row.signedAt)}` : 'Ainda não assinou'}{gerenteName ? ` · ${gerenteName}` : ''}</p>
    </div>
  )
}

function ReportGroup({ rows, gerenteName, onOpen }: { rows: EmployeeRow[]; gerenteName: Record<string, string>; onOpen: (r: EmployeeRow) => void }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-[var(--border)] bg-white md:block">
        <div className="overflow-x-auto">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Colaborador</th><th>Loja</th><th>Gerente</th><th className="w-[22%]">Progresso</th><th>Assinou</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <ReportRow key={r.employee.id} row={r} onOpen={onOpen}
                  gerenteName={r.employee.gerenteId ? gerenteName[r.employee.gerenteId] : undefined} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((r) => (
          <ReportCardMobile key={r.employee.id} row={r} onOpen={onOpen}
            gerenteName={r.employee.gerenteId ? gerenteName[r.employee.gerenteId] : undefined} />
        ))}
      </div>
    </>
  )
}

// ── página ───────────────────────────────────────────────────────────────────
export default function AdminAcompanhamento() {
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)
  const [status, setStatus] = useState<EmpStatus | ''>('')
  const [f, setF] = useState<Filters>(EMPTY_FILTERS)
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [showFilters, setShowFilters] = useState(false)
  const [viewing, setViewing] = useState<EmployeeRow | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const setFilter = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }))

  useEffect(() => { loadEmployeeRows().then(setRows) }, [])

  const gerentes = useMemo(() => listGerentes(), [])
  const gerenteName = useMemo(() => {
    const m: Record<string, string> = {}
    for (const g of gerentes) m[g.id] = g.nome
    return m
  }, [gerentes])

  const lojas = useMemo(() => [...new Set((rows ?? []).map((r) => r.employee.store).filter(Boolean) as string[])].sort(), [rows])
  const cargos = useMemo(() => [...new Set((rows ?? []).map((r) => r.employee.role))].sort(), [rows])

  const copy = async (link: string, id: string) => {
    try { await navigator.clipboard.writeText(link) } catch { /* noop */ }
    setCopied(id); setTimeout(() => setCopied(null), 1800)
  }

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = f.search.toLowerCase().trim()
    return rows.filter((r) => {
      const e = r.employee
      if (status && statusOf(r) !== status) return false
      if (q && !e.name.toLowerCase().includes(q)) return false
      if (f.loja && (e.store || '') !== f.loja) return false
      if (f.gerente && (e.gerenteId || '') !== f.gerente) return false
      if (f.cargo && e.role !== f.cargo) return false
      if (f.assinatura === 'sim' && !r.signed) return false
      if (f.assinatura === 'nao' && r.signed) return false
      if (f.progresso === 'zero' && r.progress !== 0) return false
      if (f.progresso === 'parcial' && !(r.progress > 0 && r.progress < 1)) return false
      if (f.progresso === 'cheio' && r.progress < 1) return false
      if (f.admDe && (e.admission_date || '') < f.admDe) return false
      if (f.admAte && (e.admission_date || '') > f.admAte) return false
      return true
    })
  }, [rows, status, f])

  const summary = useMemo(() => {
    const total = filtered.length
    const assinaram = filtered.filter((r) => r.signed).length
    const pendentes = filtered.filter((r) => statusOf(r) === 'pendente').length
    const avg = total ? Math.round((filtered.reduce((s, r) => s + r.progress, 0) / total) * 100) : 0
    return { total, assinaram, pendentes, avg }
  }, [filtered])

  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: '', label: '', rows: filtered }]
    const map = new Map<string, EmployeeRow[]>()
    for (const r of filtered) {
      const e = r.employee
      const label =
        groupBy === 'gerente' ? (e.gerenteId ? gerenteName[e.gerenteId] ?? 'Sem gerente' : 'Sem gerente')
        : groupBy === 'loja' ? (e.store || 'Sem loja')
        : groupBy === 'cargo' ? e.role
        : STATUS_LABEL[statusOf(r)]
      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(r)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([label, rs]) => ({ key: label, label, rows: rs }))
  }, [filtered, groupBy, gerenteName])

  const activeCount = [f.loja, f.gerente, f.cargo, f.assinatura, f.progresso, f.admDe, f.admAte].filter(Boolean).length
  const anyFilter = activeCount > 0 || Boolean(f.search) || Boolean(status)
  const clearAll = () => { setF(EMPTY_FILTERS); setStatus('') }

  return (
    <>
      <AdminPageHeader
        eyebrow="Análise"
        title="Relatórios"
        description="Filtre, agrupe e exporte o acompanhamento de treinamento e assinaturas."
        action={
          <button className="adm-btn adm-btn--primary" disabled={!filtered.length} onClick={() => exportCSV(filtered, gerenteName)}>
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
        }
      />

      {rows === null ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[72px] w-full rounded-xl" />)}
          </div>
          <div className="adm-card p-5"><div className="flex flex-col gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div></div>
        </div>
      ) : rows.length === 0 ? (
        <div className="adm-card"><EmptyState icon={Users} title="Nenhum colaborador para analisar" hint="Cadastre colaboradores em Pessoas para gerar relatórios." /></div>
      ) : (
        <>
          {/* cards de resumo */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard icon={Users} value={summary.total} label="Colaboradores" />
            <SummaryCard icon={FileSignature} value={summary.assinaram} label="Assinaram o termo" tone="#1e7e4e" />
            <SummaryCard icon={TrendingUp} value={`${summary.avg}%`} label="Progresso médio" />
            <SummaryCard icon={Clock} value={summary.pendentes} label="Pendentes" tone="#9a6b15" />
          </div>

          {/* desempenho por loja — visão executiva sobre o conjunto filtrado */}
          {filtered.length > 0 && (
            <div className="mb-4">
              <StorePerformance rows={filtered} title="Desempenho por loja (filtro atual)" />
            </div>
          )}

          {/* visões rápidas (status) */}
          <div className="adm-no-scrollbar mb-3 flex gap-2 overflow-x-auto">
            {QUICK_VIEWS.map((v) => (
              <button key={v.id || 'all'} onClick={() => setStatus(v.id)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  status === v.id ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}>
                {v.label}
              </button>
            ))}
          </div>

          {/* busca + filtros + agrupar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.8} />
              <input value={f.search} onChange={(e) => setFilter({ search: e.target.value })} placeholder="Buscar por nome…"
                className="adm-input" style={{ paddingLeft: 38, paddingRight: 34 }} />
              {f.search && (
                <button onClick={() => setFilter({ search: '' })} aria-label="Limpar busca"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"><X className="h-4 w-4" /></button>
              )}
            </div>
            <button onClick={() => setShowFilters((v) => !v)}
              className={`adm-btn ${activeCount ? 'border-[var(--accent)] text-[var(--accent-text)]' : ''}`}>
              <SlidersHorizontal className="h-4 w-4" /> Filtros {activeCount > 0 && <span className="ml-1 rounded-full bg-[var(--accent)] px-1.5 text-[0.65rem] font-bold text-white">{activeCount}</span>}
            </button>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className="adm-input w-auto" aria-label="Agrupar por">
              {GROUP_OPTIONS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>

          {/* painel de filtros combináveis */}
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <div className="adm-card mb-3 grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
                  <label className="block"><span className="adm-label">Loja</span>
                    <select value={f.loja} onChange={(e) => setFilter({ loja: e.target.value })} className="adm-input">
                      <option value="">Todas</option>{lojas.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select></label>
                  <label className="block"><span className="adm-label">Gerente</span>
                    <select value={f.gerente} onChange={(e) => setFilter({ gerente: e.target.value })} className="adm-input">
                      <option value="">Todos</option>{gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                    </select></label>
                  <label className="block"><span className="adm-label">Cargo</span>
                    <select value={f.cargo} onChange={(e) => setFilter({ cargo: e.target.value })} className="adm-input">
                      <option value="">Todos</option>{cargos.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select></label>
                  <label className="block"><span className="adm-label">Assinatura</span>
                    <select value={f.assinatura} onChange={(e) => setFilter({ assinatura: e.target.value as Filters['assinatura'] })} className="adm-input">
                      <option value="">Todas</option><option value="sim">Assinou</option><option value="nao">Não assinou</option>
                    </select></label>
                  <label className="block"><span className="adm-label">Progresso</span>
                    <select value={f.progresso} onChange={(e) => setFilter({ progresso: e.target.value as Filters['progresso'] })} className="adm-input">
                      <option value="">Qualquer</option><option value="zero">Não iniciou (0%)</option><option value="parcial">Em andamento (1–99%)</option><option value="cheio">Concluído (100%)</option>
                    </select></label>
                  <label className="block"><span className="adm-label">Admissão — de</span>
                    <input type="date" value={f.admDe} onChange={(e) => setFilter({ admDe: e.target.value })} className="adm-input" /></label>
                  <label className="block"><span className="adm-label">Admissão — até</span>
                    <input type="date" value={f.admAte} onChange={(e) => setFilter({ admAte: e.target.value })} className="adm-input" /></label>
                  <div className="flex items-end">
                    <button onClick={clearAll} disabled={!anyFilter} className="adm-btn w-full"><X className="h-4 w-4" /> Limpar filtros</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* resultados */}
          {filtered.length === 0 ? (
            <div className="adm-card">
              <EmptyState icon={Search} title="Nenhum colaborador neste filtro"
                hint="Ajuste os filtros ou limpe para ver todos."
                action={anyFilter ? <button className="adm-btn" onClick={clearAll}><X className="h-4 w-4" /> Limpar filtros</button> : undefined} compact />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map((g) => {
                const assinaram = g.rows.filter((r) => r.signed).length
                return (
                  <section key={g.key || 'all'}>
                    {g.label && (
                      <div className="mb-2 flex items-center gap-2.5 px-1">
                        <h3 className="text-[0.95rem] font-semibold text-[var(--ink)]">{g.label}</h3>
                        <span className="adm-badge adm-badge--muted">{g.rows.length}</span>
                        <span className="text-[0.78rem] text-[var(--text-muted)]">· {assinaram} assinaram</span>
                      </div>
                    )}
                    <ReportGroup rows={g.rows} gerenteName={gerenteName} onOpen={setViewing} />
                  </section>
                )
              })}
            </div>
          )}

          <p className="mt-4 text-center text-[0.78rem] text-[var(--text-muted)]">
            Mostrando <strong className="text-[var(--text-secondary)]">{filtered.length}</strong> de {rows.length} colaboradores
          </p>
        </>
      )}

      {/* visão 360° do colaborador (reusada) */}
      <AnimatePresence>
        {viewing && (
          <ColaboradorDetailModal row={viewing} onClose={() => setViewing(null)}
            gerenteName={viewing.employee.gerenteId ? gerenteName[viewing.employee.gerenteId] : undefined}
            onCopy={copy} copied={copied} />
        )}
      </AnimatePresence>
    </>
  )
}
