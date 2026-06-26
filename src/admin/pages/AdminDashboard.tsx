import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, CheckCircle2, PenLine, TrendingUp, UserPlus, ChevronRight, ArrowRight,
} from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import { useAdminStore } from '@/lib/adminStore'
import { getAdminSession, isDono } from '../auth'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { StatusBadge, statusOf } from '../components/StatusBadge'
import { StatCard, SectionCard, EmptyState, AnimatedNumber, Skeleton } from '../components/ui'

// cores das etapas (identidade Pralís)
const SEG = { neutral: '#c9c3bc', orange: '#f26b2a', gold: '#b8860b', green: '#1e7e4e' }

function pct(n: number, d: number) { return d ? Math.round((n / d) * 100) : 0 }
function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

interface Seg { label: string; value: number; color: string }

/** Distribuição da jornada — barra empilhada horizontal (1 olhada = o time inteiro). */
function StackedBar({ stages, total }: { stages: Seg[]; total: number }) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--bg-inset)]">
        {total > 0 && stages.map((s, i) =>
          s.value > 0 ? (
            <motion.div
              key={s.label}
              initial={{ width: 0 }}
              animate={{ width: `${(s.value / total) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.06 }}
              style={{ background: s.color }}
              className={i > 0 ? 'border-l-2 border-white' : ''}
            />
          ) : null,
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
        {stages.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
            <span className="text-[0.8125rem] text-[var(--text-secondary)]">{s.label}</span>
            <span className="text-[0.8125rem] font-semibold text-[var(--ink)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
            <span className="text-[0.75rem] text-[var(--text-muted)]">{total > 0 ? `${pct(s.value, total)}%` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Dashboard do Dono ───────────────────────────────────────────────────────
function DonoDashboard() {
  const navigate = useNavigate()
  const { data } = useAdminStore()
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)

  useEffect(() => {
    let active = true
    loadEmployeeRows().then((r) => active && setRows(r))
    return () => { active = false }
  }, [])

  const loading = rows === null
  const total = rows?.length ?? 0
  const hasPeople = !loading && total > 0

  const kpis = useMemo(() => {
    const r = rows ?? []
    const concluded = r.filter((e) => e.totalModules > 0 && e.completedModules >= e.totalModules).length
    const signed = r.filter((e) => e.signed).length
    const active = data.modules.filter((m) => m.active !== false).length
    return { total: r.length, concluded, signed, active }
  }, [rows, data.modules])

  const stages = useMemo<Seg[]>(() => {
    const r = rows ?? []
    return [
      { label: 'Pendente', value: r.filter((e) => e.progress === 0 && !e.signed).length, color: SEG.neutral },
      { label: 'Em andamento', value: r.filter((e) => e.progress > 0 && e.completedModules < e.totalModules && !e.signed).length, color: SEG.orange },
      { label: 'Concluído', value: r.filter((e) => e.completedModules >= e.totalModules && !e.signed).length, color: SEG.gold },
      { label: 'Assinado', value: r.filter((e) => e.signed).length, color: SEG.green },
    ]
  }, [rows])

  const quizStats = useMemo(() => {
    const r = rows ?? []
    const correct = r.reduce((a, e) => a + e.quizCorrect, 0)
    const qtotal = r.reduce((a, e) => a + e.quizTotal, 0)
    return { correct, total: qtotal, pct: pct(correct, qtotal || 1) }
  }, [rows])

  const avgProgress = useMemo(() => {
    const r = rows ?? []
    if (!r.length) return 0
    return Math.round((r.reduce((a, e) => a + e.progress, 0) / r.length) * 100)
  }, [rows])

  const attention = useMemo(() => {
    const r = rows ?? []
    const out: { e: EmployeeRow; reason: string; gold: boolean }[] = []
    for (const e of r) {
      if (!e.signed && e.progress === 0) out.push({ e, reason: 'Não começou', gold: false })
      else if (!e.signed && e.totalModules > 0 && e.completedModules >= e.totalModules) out.push({ e, reason: 'Falta assinar', gold: true })
    }
    return out
  }, [rows])

  const notStarted = (rows ?? []).filter((e) => !e.signed && e.progress === 0).length

  const kpiCards = [
    { label: 'Concluíram tudo', value: `${pct(kpis.concluded, total)}%`, sub: `${kpis.concluded}/${total} pessoas`, icon: CheckCircle2, tone: 'green' as const, to: '/admin/colaboradores' },
    { label: 'Assinaram', value: `${pct(kpis.signed, total)}%`, sub: `${kpis.signed}/${total} pessoas`, icon: PenLine, tone: 'gold' as const, to: '/admin/colaboradores' },
    { label: 'Colaboradores', value: kpis.total, sub: 'cadastrados', icon: Users, tone: 'orange' as const, to: '/admin/colaboradores' },
  ]

  const saude = [
    { l: 'Acertos nos quizzes', v: `${quizStats.pct}%`, s: `${quizStats.correct}/${quizStats.total}` },
    { l: 'Módulos ativos', v: `${kpis.active}`, s: `de ${data.modules.length}` },
    { l: 'Média de progresso', v: `${avgProgress}%`, s: 'da equipe' },
  ]

  return (
    <>
      <AdminPageHeader eyebrow="Visão geral" title="Dashboard" />

      {/* Status em linguagem humana — "como estamos?" em 1 olhada */}
      {loading ? (
        <Skeleton className="mb-6 h-5 w-80" />
      ) : total === 0 ? (
        <p className="mb-6 -mt-2 text-[0.95rem] text-[var(--text-secondary)]">Nenhum colaborador cadastrado ainda.</p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="mb-6 -mt-2 flex items-start gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
          <p className="text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">
            <strong className="font-semibold text-[var(--ink)]">{kpis.concluded}</strong> de <strong className="font-semibold text-[var(--ink)]">{total}</strong> concluíram o treinamento
            {' · '}<strong className="font-semibold text-[var(--ink)]">{kpis.signed}</strong> {kpis.signed === 1 ? 'assinou' : 'assinaram'}
            {notStarted > 0 && (<>{' · '}<strong className="font-semibold text-[var(--ink)]">{notStarted}</strong> ainda não {notStarted === 1 ? 'começou' : 'começaram'}</>)}
          </p>
        </motion.div>
      )}

      {/* KPIs — outcomes primeiro, clicáveis (drill-down) */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {kpiCards.map((k) => (
          <motion.div key={k.label} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard icon={k.icon} tone={k.tone} value={k.value} label={k.label} sub={k.sub} loading={loading} onClick={() => navigate(k.to)} />
          </motion.div>
        ))}
      </motion.div>

      {/* Distribuição da jornada — uma visão escaneável do time inteiro */}
      <div className="mb-4">
        <SectionCard title="Distribuição da jornada">
          {!hasPeople ? (
            <EmptyState icon={Users} title="Sem dados ainda" hint="A distribuição aparece quando houver colaboradores." compact />
          ) : (
            <StackedBar stages={stages} total={total} />
          )}
        </SectionCard>
      </div>

      {/* Herói (ação) + Saúde do treinamento (contexto, quieto) */}
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
        <SectionCard
          title="Precisam de atenção"
          action={attention.length > 0 ? <span className="adm-badge adm-badge--gold">{attention.length}</span> : undefined}
        >
          {!hasPeople ? (
            <EmptyState icon={UserPlus} title="Nenhum colaborador ainda" hint="Cadastre o primeiro colaborador para acompanhar por aqui." />
          ) : attention.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Tudo certo" hint="Toda a equipe está em dia — ninguém parado ou pendente de assinatura." compact />
          ) : (
            <motion.ul
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
              className="-mx-1 flex flex-col"
            >
              {attention.slice(0, 7).map(({ e, reason, gold }) => (
                <motion.li key={e.employee.id} variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/colaboradores?q=${encodeURIComponent(e.employee.name)}`)}
                    className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--bg-subtle)] focus-visible:bg-[var(--bg-subtle)] focus-visible:outline-none"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-brown)] text-[0.7rem] font-bold text-white">{initials(e.employee.name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.875rem] font-medium text-[var(--ink)]">{e.employee.name}</span>
                      <span className="block truncate text-[0.75rem] text-[var(--text-muted)]">{e.employee.role}</span>
                    </span>
                    <span className={`adm-badge ${gold ? 'adm-badge--gold' : 'adm-badge--muted'}`}>{reason}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </motion.li>
              ))}
              {attention.length > 7 && (
                <li>
                  <button type="button" onClick={() => navigate('/admin/colaboradores')} className="mt-1 w-full rounded-lg px-2 py-2 text-left text-[0.8125rem] font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--bg-subtle)]">
                    Ver todos os {attention.length} →
                  </button>
                </li>
              )}
            </motion.ul>
          )}
        </SectionCard>

        <SectionCard title="Saúde do treinamento">
          <ul className="flex flex-col gap-3">
            {saude.map((item) => (
              <li key={item.l} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.875rem] text-[var(--text-secondary)]">{item.l}</p>
                  <p className="text-[0.72rem] text-[var(--text-muted)]">{item.s}</p>
                </div>
                <span className="text-[1.05rem] font-bold text-[var(--ink)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {loading ? '—' : <AnimatedNumber value={item.v} />}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => navigate('/admin/relatorios')}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-2 text-[0.8125rem] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--ink)]"
          >
            Ver relatórios <ArrowRight className="h-4 w-4" />
          </button>
        </SectionCard>
      </div>
    </>
  )
}

// ── Dashboard do Gerente ────────────────────────────────────────────────────
function GerenteDashboard() {
  const navigate = useNavigate()
  const session = getAdminSession()
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)

  useEffect(() => {
    let active = true
    loadEmployeeRows().then((all) => {
      if (active) setRows(all.filter((r) => r.employee.gerenteId === session?.id))
    })
    return () => { active = false }
  }, [session?.id])

  const loading = rows === null
  const team = rows ?? []
  const concluded = team.filter((e) => e.totalModules > 0 && e.completedModules >= e.totalModules).length
  const signed = team.filter((e) => e.signed).length
  const avg = team.length ? Math.round((team.reduce((a, e) => a + e.progress, 0) / team.length) * 100) : 0

  const kpiCards = [
    { label: 'Minha equipe', value: team.length, sub: 'colaboradores', icon: Users, tone: 'orange' as const, to: '/admin/colaboradores' },
    { label: 'Concluíram', value: `${pct(concluded, team.length)}%`, sub: `${concluded}/${team.length} pessoas`, icon: CheckCircle2, tone: 'green' as const, to: '/admin/colaboradores' },
    { label: 'Assinaram', value: `${pct(signed, team.length)}%`, sub: `${signed}/${team.length} pessoas`, icon: PenLine, tone: 'gold' as const, to: '/admin/colaboradores' },
    { label: 'Progresso médio', value: `${avg}%`, sub: 'da equipe', icon: TrendingUp, tone: 'brown' as const, to: '/admin/colaboradores' },
  ]

  return (
    <>
      <AdminPageHeader
        eyebrow={session ? session.nome : 'Gerente'}
        title="Minha equipe"
        description="Acompanhe o progresso dos colaboradores sob sua responsabilidade."
      />

      <motion.div
        initial="hidden" animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((k) => (
          <motion.div key={k.label} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard icon={k.icon} tone={k.tone} value={k.value} label={k.label} sub={k.sub} loading={loading} onClick={() => navigate(k.to)} />
          </motion.div>
        ))}
      </motion.div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
          </div>
        ) : team.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum colaborador vinculado" hint="Quando o Dono associar colaboradores a você, eles aparecem aqui." />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Cargo</th>
                  <th className="w-[26%]">Progresso</th>
                  <th>Quiz</th>
                  <th>Assinou</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((r) => {
                  const p = Math.round(r.progress * 100)
                  const quizPct = r.quizTotal > 0 ? Math.round((r.quizCorrect / r.quizTotal) * 100) : null
                  return (
                    <tr key={r.employee.id}>
                      <td className="font-semibold text-[var(--ink)]">{r.employee.name}</td>
                      <td className="text-[var(--text-secondary)]">{r.employee.role}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="adm-pbar flex-1"><i style={{ width: `${p}%` }} /></div>
                          <span className="w-12 text-right text-xs text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{r.completedModules}/{r.totalModules}</span>
                        </div>
                      </td>
                      <td className="text-xs text-[var(--text-secondary)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{quizPct != null ? `${quizPct}%` : '—'}</td>
                      <td className="text-xs text-[var(--text-secondary)]">{r.signed ? 'Sim' : 'Não'}</td>
                      <td><StatusBadge status={statusOf(r)} /></td>
                    </tr>
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

export default function AdminDashboard() {
  return isDono() ? <DonoDashboard /> : <GerenteDashboard />
}
