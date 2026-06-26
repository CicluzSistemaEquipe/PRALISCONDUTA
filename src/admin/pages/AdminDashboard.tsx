import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, CheckCircle2, PenLine, BookOpen, TrendingUp, UserPlus,
} from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import { useAdminStore } from '@/lib/adminStore'
import { getAdminSession, isDono } from '../auth'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { StatusBadge, statusOf } from '../components/StatusBadge'
import { StatCard, SectionCard, EmptyState, AnimatedNumber } from '../components/ui'

// ── paleta clara dos gráficos ───────────────────────────────────────────────
const LC = {
  grid: '#eceae7',
  inset: '#f2f0ed',
  axis: '#dad6d1',
  text: '#8a837c',
  ink: '#1a1714',
  orange: '#f26b2a',
  gold: '#b8860b',
  green: '#1e7e4e',
  brown: '#5e3731',
  neutral: '#c9c3bc',
}

// ── helpers SVG ─────────────────────────────────────────────────────────────
function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
function arcD(cx: number, cy: number, r: number, s: number, e: number) {
  if (e - s >= 359.9) e = s + 359.9
  const a = polarToXY(cx, cy, r, s), b = polarToXY(cx, cy, r, e)
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}
function smoothLine(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i]
    const cpx = (p.x + q.x) / 2
    d += ` C ${cpx} ${p.y} ${cpx} ${q.y} ${q.x} ${q.y}`
  }
  return d
}
function pct(n: number, d: number) { return d ? Math.round((n / d) * 100) : 0 }

// ── Rosca ───────────────────────────────────────────────────────────────────
interface Seg { label: string; value: number; color: string }

function Donut({ segs, total }: { segs: Seg[]; total: number }) {
  const SZ = 150, cx = 75, cy = 75, R = 56, sw = 18
  let cur = 0
  const GAP = total > 1 ? 4 : 0
  const ariaLabel = `Etapas da jornada, total ${total}: ${segs.map((s) => `${s.label} ${s.value}`).join(', ')}`
  return (
    <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`} style={{ overflow: 'visible' }} role="img" aria-label={ariaLabel}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={LC.inset} strokeWidth={sw} />
      {segs.map((s) => {
        if (s.value === 0) return null
        const deg = (s.value / total) * 360
        const start = cur + GAP / 2, end = cur + deg - GAP / 2
        cur += deg
        return (
          <motion.path key={s.label} d={arcD(cx, cy, R, start, end)}
            fill="none" stroke={s.color} strokeWidth={sw} strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          />
        )
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={26} fontWeight={700}
        fontFamily="Montserrat, sans-serif" fill={LC.ink} style={{ fontVariantNumeric: 'tabular-nums' }}>{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10}
        fontFamily="Montserrat, sans-serif" fill={LC.text}>total</text>
    </svg>
  )
}

// ── Barras ──────────────────────────────────────────────────────────────────
function BarChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) {
  const W = 420, H = 200, PAD = { l: 34, r: 12, t: 16, b: 34 }
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b
  const n = data.length
  const bW = n > 0 ? Math.min(40, (iW / n) * 0.55) : 30
  const gap = n > 1 ? (iW - bW * n) / (n - 1) : 0
  const gridLines = [0, 25, 50, 75, 100]
  const scaleY = (v: number) => iH - (v / (maxVal || 1)) * iH
  const ariaLabel = `Progresso por colaborador: ${data.map((d) => `${d.label} ${d.value}%`).join(', ')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id="adm-barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LC.orange} stopOpacity={1} />
          <stop offset="100%" stopColor={LC.orange} stopOpacity={0.62} />
        </linearGradient>
      </defs>
      {gridLines.map((g) => {
        const y = PAD.t + scaleY((g / 100) * (maxVal || 1))
        return (
          <g key={g}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke={LC.grid} strokeWidth={1} />
            <text x={PAD.l - 8} y={y + 3.5} textAnchor="end" fontSize={9} fontFamily="Montserrat, sans-serif" fill={LC.text}>{g}%</text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const x = PAD.l + i * (bW + gap)
        const barH = Math.max(2, (d.value / (maxVal || 1)) * iH)
        const y = PAD.t + iH - barH
        return (
          <g key={`${d.label}-${i}`}>
            <motion.rect x={x} y={y} width={bW} height={barH} fill="url(#adm-barGrad)" rx={5}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 + i * 0.05 }}
              style={{ transformOrigin: `${x}px ${PAD.t + iH}px` }}
            />
            <text x={x + bW / 2} y={PAD.t + iH + 16} textAnchor="middle" fontSize={9.5} fontFamily="Montserrat, sans-serif" fill={LC.text}>
              {d.label.length > 9 ? d.label.slice(0, 8) + '…' : d.label}
            </text>
            {d.value > 0 && (
              <text x={x + bW / 2} y={y - 5} textAnchor="middle" fontSize={10} fontWeight={700}
                fontFamily="Montserrat, sans-serif" fill={LC.ink} style={{ fontVariantNumeric: 'tabular-nums' }}>{d.value}%</text>
            )}
          </g>
        )
      })}
      <line x1={PAD.l} y1={PAD.t + iH} x2={W - PAD.r} y2={PAD.t + iH} stroke={LC.axis} strokeWidth={1} />
    </svg>
  )
}

// ── Linha / área ────────────────────────────────────────────────────────────
function LineChart({ data, maxVal = 100 }: { data: { label: string; value: number }[]; maxVal?: number }) {
  const W = 520, H = 210, PAD = { l: 38, r: 18, t: 18, b: 34 }
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b
  const n = data.length
  const gridLines = [0, 25, 50, 75, 100]
  const pts = data.map((d, i) => ({
    x: PAD.l + (n > 1 ? (i / (n - 1)) * iW : iW / 2),
    y: PAD.t + iH - (d.value / (maxVal || 1)) * iH,
  }))
  const linePath = smoothLine(pts)
  const areaPath = pts.length > 0
    ? `${linePath} L ${pts[pts.length - 1].x} ${PAD.t + iH} L ${pts[0].x} ${PAD.t + iH} Z` : ''
  const ariaLabel = `Curva de retenção: ${data.map((d) => `${d.label} ${d.value}%`).join(', ')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id="adm-areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LC.orange} stopOpacity={0.14} />
          <stop offset="100%" stopColor={LC.orange} stopOpacity={0} />
        </linearGradient>
      </defs>
      {gridLines.map((g) => {
        const y = PAD.t + iH - (g / 100) * iH
        return (
          <g key={g}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke={LC.grid} strokeWidth={1} strokeDasharray={g === 0 ? '0' : '3 5'} />
            <text x={PAD.l - 8} y={y + 3.5} textAnchor="end" fontSize={9} fontFamily="Montserrat, sans-serif" fill={LC.text}>{g}%</text>
          </g>
        )
      })}
      {areaPath && <path d={areaPath} fill="url(#adm-areaGrad)" />}
      {linePath && (
        <motion.path d={linePath} fill="none" stroke={LC.orange} strokeWidth={2.5} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeOut' }} />
      )}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={LC.orange} />
          <circle cx={p.x} cy={p.y} r={1.8} fill="#fff" />
          <text x={p.x} y={PAD.t + iH + 16} textAnchor="middle" fontSize={9} fontFamily="Montserrat, sans-serif" fill={LC.text}>{data[i].label}</text>
          {data[i].value > 0 && (
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={9.5} fontWeight={700}
              fontFamily="Montserrat, sans-serif" fill={LC.ink} style={{ fontVariantNumeric: 'tabular-nums' }}>{data[i].value}%</text>
          )}
        </g>
      ))}
      <line x1={PAD.l} y1={PAD.t + iH} x2={W - PAD.r} y2={PAD.t + iH} stroke={LC.axis} strokeWidth={1} />
    </svg>
  )
}

// ── Dashboard do Dono ───────────────────────────────────────────────────────
function DonoDashboard() {
  const { data } = useAdminStore()
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)

  useEffect(() => {
    let active = true
    loadEmployeeRows().then((r) => active && setRows(r))
    return () => { active = false }
  }, [])

  const loading = rows === null
  const total = rows?.length ?? 0

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
      { label: 'Pendente', value: r.filter((e) => e.progress === 0 && !e.signed).length, color: LC.neutral },
      { label: 'Em andamento', value: r.filter((e) => e.progress > 0 && e.completedModules < e.totalModules && !e.signed).length, color: LC.orange },
      { label: 'Concluído', value: r.filter((e) => e.completedModules >= e.totalModules && !e.signed).length, color: LC.gold },
      { label: 'Assinado', value: r.filter((e) => e.signed).length, color: LC.green },
    ]
  }, [rows])

  const progressBars = useMemo(() =>
    (rows ?? []).map((r) => ({ label: r.employee.name.split(' ')[0], value: Math.round(r.progress * 100) })), [rows])

  const funnelLine = useMemo(() => {
    const r = rows ?? []
    const n = r.length || 1
    return [
      { label: 'Cadastrou', value: pct(r.length, n) },
      { label: '25%+', value: pct(r.filter((e) => e.progress >= 0.25).length, n) },
      { label: '50%+', value: pct(r.filter((e) => e.progress >= 0.50).length, n) },
      { label: '75%+', value: pct(r.filter((e) => e.progress >= 0.75).length, n) },
      { label: 'Concluiu', value: pct(r.filter((e) => e.completedModules >= e.totalModules).length, n) },
      { label: 'Assinou', value: pct(r.filter((e) => e.signed).length, n) },
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

  const kpiCards = [
    { label: 'Colaboradores', value: kpis.total, sub: 'cadastrados', icon: Users, tone: 'orange' as const },
    { label: 'Concluíram tudo', value: `${pct(kpis.concluded, total)}%`, sub: `${kpis.concluded}/${total} pessoas`, icon: CheckCircle2, tone: 'green' as const },
    { label: 'Assinaram', value: `${pct(kpis.signed, total)}%`, sub: `${kpis.signed}/${total} pessoas`, icon: PenLine, tone: 'gold' as const },
    { label: 'Módulos ativos', value: kpis.active, sub: `de ${data.modules.length} criados`, icon: BookOpen, tone: 'brown' as const },
  ]

  const hasPeople = !loading && total > 0

  return (
    <>
      <AdminPageHeader eyebrow="Visão geral" title="Dashboard" description="Métricas e progresso dos colaboradores." />

      {/* KPIs */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((k) => (
          <motion.div key={k.label} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard icon={k.icon} tone={k.tone} value={k.value} label={k.label} sub={k.sub} loading={loading} />
          </motion.div>
        ))}
      </motion.div>

      {/* Linha 2: rosca + barras */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <SectionCard title="Etapas da jornada">
          <div className="flex flex-col items-center gap-5">
            <Donut segs={stages} total={Math.max(total, 1)} />
            <div className="flex w-full flex-col gap-2.5">
              {stages.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
                  <span className="flex-1 text-[0.8125rem] text-[var(--text-secondary)]">{s.label}</span>
                  <span className="text-[0.875rem] font-semibold text-[var(--ink)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
                  <span className="min-w-[34px] text-right text-[0.75rem] text-[var(--text-muted)]">{total > 0 ? `${pct(s.value, total)}%` : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Progresso por colaborador">
          {!hasPeople ? (
            <EmptyState
              icon={UserPlus}
              title="Nenhum colaborador ainda"
              hint="Cadastre o primeiro colaborador para acompanhar o progresso por aqui."
            />
          ) : (
            <BarChart data={progressBars} maxVal={100} />
          )}
        </SectionCard>
      </div>

      {/* Linha 3: retenção + quizzes/média */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <SectionCard title="Curva de retenção">
          <p className="-mt-2 mb-2 text-[0.8125rem] text-[var(--text-muted)]">% de colaboradores que chegaram a cada etapa da jornada</p>
          {!hasPeople ? (
            <EmptyState icon={TrendingUp} title="Sem dados ainda" hint="A curva aparece quando houver colaboradores em treinamento." compact />
          ) : (
            <LineChart data={funnelLine} maxVal={100} />
          )}
        </SectionCard>

        <div className="flex flex-col gap-4">
          <SectionCard title="Quizzes">
            <div className="flex flex-col items-center gap-4">
              {(() => {
                const sz = 104, cx = 52, cy = 52, r = 38, sw = 9
                const circ = 2 * Math.PI * r
                const filled = quizStats.total > 0 ? (quizStats.correct / quizStats.total) * circ : 0
                const col = quizStats.pct >= 70 ? LC.green : quizStats.pct >= 40 ? LC.gold : LC.orange
                return (
                  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} role="img" aria-label={`${loading ? 0 : quizStats.pct}% de acertos nos quizzes`}>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={LC.inset} strokeWidth={sw} />
                    <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round"
                      strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - filled }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }} transform={`rotate(-90 ${cx} ${cy})`} />
                    <text x={cx} y={cy - 2} textAnchor="middle" fontSize={20} fontWeight={700} fontFamily="Montserrat, sans-serif" fill={LC.ink} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {loading ? '—' : `${quizStats.pct}%`}
                    </text>
                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fontFamily="Montserrat, sans-serif" fill={LC.text}>acertos</text>
                  </svg>
                )
              })()}
              <div className="flex w-full flex-col gap-2">
                {[
                  { l: 'Questões', v: loading ? '—' : `${quizStats.total}`, c: 'var(--ink)' },
                  { l: 'Corretas', v: loading ? '—' : `${quizStats.correct}`, c: 'var(--success)' },
                  { l: 'Erradas', v: loading ? '—' : `${quizStats.total - quizStats.correct}`, c: 'var(--danger)' },
                ].map((item) => (
                  <div key={item.l} className="flex items-center justify-between">
                    <span className="text-[0.8125rem] text-[var(--text-secondary)]">{item.l}</span>
                    <span className="text-[0.875rem] font-semibold" style={{ color: item.c, fontVariantNumeric: 'tabular-nums' }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Média geral">
            <div className="text-center">
              <span className="adm-kpi-val" style={{ fontSize: '2.4rem' }}><AnimatedNumber value={loading ? '—' : `${avgProgress}%`} /></span>
              <p className="mt-1 text-[0.8125rem] text-[var(--text-muted)]">progresso médio dos colaboradores</p>
            </div>
            <div className="adm-pbar mt-3">
              <motion.i initial={{ width: 0 }} animate={{ width: `${avgProgress}%` }} transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }} />
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  )
}

// ── Dashboard do Gerente ────────────────────────────────────────────────────
function GerenteDashboard() {
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
    { label: 'Minha equipe', value: team.length, sub: 'colaboradores', icon: Users, tone: 'orange' as const },
    { label: 'Concluíram', value: `${pct(concluded, team.length)}%`, sub: `${concluded}/${team.length} pessoas`, icon: CheckCircle2, tone: 'green' as const },
    { label: 'Assinaram', value: `${pct(signed, team.length)}%`, sub: `${signed}/${team.length} pessoas`, icon: PenLine, tone: 'gold' as const },
    { label: 'Progresso médio', value: `${avg}%`, sub: 'da equipe', icon: TrendingUp, tone: 'brown' as const },
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
            <StatCard icon={k.icon} tone={k.tone} value={k.value} label={k.label} sub={k.sub} loading={loading} />
          </motion.div>
        ))}
      </motion.div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {loading ? (
          <div className="px-5 py-6 text-[0.875rem] text-[var(--text-muted)]">Carregando…</div>
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
