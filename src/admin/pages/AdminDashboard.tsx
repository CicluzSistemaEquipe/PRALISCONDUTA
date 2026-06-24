import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, CheckCircle2, PenLine, BookOpen,
  TrendingUp, Award, BarChart2,
} from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import { useAdminStore } from '@/lib/adminStore'
import { AdminPageHeader } from '../components/AdminPageHeader'

// ── paleta ────────────────────────────────────────────────────────────────────
const C = {
  gold:    '#b8860b',
  goldLt:  '#e8c96a',
  orange:  '#f37435',
  green:   '#4ade80',
  cream:   '#e8cfa0',
  muted:   'rgba(232,207,160,0.45)',
  stroke:  'rgba(232,207,160,0.12)',
  card:    'rgba(30,16,6,0.82)',
  grid:    'rgba(232,207,160,0.07)',
}

// ── helpers SVG ───────────────────────────────────────────────────────────────
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

// ── Gráfico de pizza / rosca ──────────────────────────────────────────────────
interface Seg { label: string; value: number; color: string }

function PieChart({ segs, total }: { segs: Seg[]; total: number }) {
  const SZ = 140, cx = 70, cy = 70, R = 52, sw = 20
  let cur = 0
  const GAP = total > 1 ? 3 : 0
  return (
    <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`} style={{ overflow: 'visible' }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.grid} strokeWidth={sw + 2} />
      {segs.map((s) => {
        if (s.value === 0) return null
        const deg = (s.value / total) * 360
        const start = cur + GAP / 2, end = cur + deg - GAP / 2
        cur += deg
        return (
          <motion.path key={s.label} d={arcD(cx, cy, R, start, end)}
            fill="none" stroke={s.color} strokeWidth={sw} strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          />
        )
      })}
      {/* centro */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={700}
        fontFamily="Playfair Display, serif" fill={C.cream}>{total}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize={9}
        fontFamily="Montserrat, sans-serif" fill={C.muted}>total</text>
    </svg>
  )
}

// ── Gráfico de barras verticais ───────────────────────────────────────────────
function BarChart({
  data, maxVal, color = C.gold, height = 160,
}: { data: { label: string; value: number }[]; maxVal: number; color?: string; height?: number }) {
  const W = 380, H = height, PAD = { l: 36, r: 12, t: 10, b: 36 }
  const iW = W - PAD.l - PAD.r
  const iH = H - PAD.t - PAD.b
  const n = data.length
  const bW = n > 0 ? Math.min(38, (iW / n) * 0.6) : 30
  const gap = n > 1 ? (iW - bW * n) / (n - 1) : 0
  const gridLines = [0, 25, 50, 75, 100]

  const scaleY = (v: number) => iH - (v / (maxVal || 1)) * iH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
        </linearGradient>
      </defs>
      {/* grid */}
      {gridLines.map((g) => {
        const y = PAD.t + scaleY((g / 100) * (maxVal || 1))
        return (
          <g key={g}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
              stroke={C.grid} strokeWidth={1} />
            <text x={PAD.l - 6} y={y + 3.5} textAnchor="end"
              fontSize={8} fontFamily="Montserrat, sans-serif" fill={C.muted}>
              {g}%
            </text>
          </g>
        )
      })}
      {/* barras */}
      {data.map((d, i) => {
        const x = PAD.l + i * (bW + gap)
        const barH = Math.max(2, (d.value / (maxVal || 1)) * iH)
        const y = PAD.t + iH - barH
        return (
          <g key={d.label}>
            <motion.rect
              x={x} y={y} width={bW} height={barH}
              fill="url(#barGrad)" rx={4}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 + i * 0.06 }}
              style={{ transformOrigin: `${x}px ${PAD.t + iH}px` }}
            />
            <text x={x + bW / 2} y={PAD.t + iH + 14} textAnchor="middle"
              fontSize={9} fontFamily="Montserrat, sans-serif" fill={C.muted}>
              {d.label.length > 9 ? d.label.slice(0, 8) + '…' : d.label}
            </text>
            {d.value > 0 && (
              <text x={x + bW / 2} y={y - 4} textAnchor="middle"
                fontSize={9} fontWeight={700} fontFamily="Montserrat, sans-serif" fill={C.cream}>
                {d.value}%
              </text>
            )}
          </g>
        )
      })}
      {/* eixo X */}
      <line x1={PAD.l} y1={PAD.t + iH} x2={W - PAD.r} y2={PAD.t + iH}
        stroke={C.stroke} strokeWidth={1} />
    </svg>
  )
}

// ── Gráfico de linha / área ───────────────────────────────────────────────────
function LineChart({
  data, maxVal = 100, color = C.orange,
}: { data: { label: string; value: number }[]; maxVal?: number; color?: string }) {
  const W = 460, H = 180, PAD = { l: 40, r: 16, t: 14, b: 36 }
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b
  const n = data.length
  const gridLines = [0, 25, 50, 75, 100]

  const pts = data.map((d, i) => ({
    x: PAD.l + (n > 1 ? (i / (n - 1)) * iW : iW / 2),
    y: PAD.t + iH - (d.value / (maxVal || 1)) * iH,
  }))
  const linePath = smoothLine(pts)
  const areaPath = pts.length > 0
    ? `${linePath} L ${pts[pts.length - 1].x} ${PAD.t + iH} L ${pts[0].x} ${PAD.t + iH} Z`
    : ''

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* grid */}
      {gridLines.map((g) => {
        const y = PAD.t + iH - (g / 100) * iH
        return (
          <g key={g}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
              stroke={C.grid} strokeWidth={1} strokeDasharray={g === 0 ? '0' : '3 4'} />
            <text x={PAD.l - 6} y={y + 3.5} textAnchor="end"
              fontSize={8} fontFamily="Montserrat, sans-serif" fill={C.muted}>{g}%</text>
          </g>
        )
      })}
      {/* área */}
      {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
      {/* linha */}
      {linePath && (
        <motion.path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      )}
      {/* pontos */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4.5} fill={color} />
          <circle cx={p.x} cy={p.y} r={2.5} fill="#1a0a00" />
          <text x={p.x} y={PAD.t + iH + 14} textAnchor="middle"
            fontSize={8.5} fontFamily="Montserrat, sans-serif" fill={C.muted}>
            {data[i].label}
          </text>
          <text x={p.x} y={p.y - 10} textAnchor="middle"
            fontSize={9} fontWeight={700} fontFamily="Montserrat, sans-serif" fill={C.cream}>
            {data[i].value > 0 ? `${data[i].value}%` : ''}
          </text>
        </g>
      ))}
      {/* eixo X */}
      <line x1={PAD.l} y1={PAD.t + iH} x2={W - PAD.r} y2={PAD.t + iH}
        stroke={C.stroke} strokeWidth={1} />
    </svg>
  )
}

// ── componente principal ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data } = useAdminStore()
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)

  useEffect(() => {
    let active = true
    loadEmployeeRows().then((r) => active && setRows(r))
    return () => { active = false }
  }, [])

  const total = rows?.length ?? 0

  const kpis = useMemo(() => {
    const r = rows ?? []
    const concluded = r.filter((e) => e.totalModules > 0 && e.completedModules >= e.totalModules).length
    const signed    = r.filter((e) => e.signed).length
    const active    = data.modules.filter((m) => m.active !== false).length
    return { total: r.length, concluded, signed, active }
  }, [rows, data.modules])

  // estágios do funil
  const stages = useMemo(() => {
    const r = rows ?? []
    return [
      { label: 'Pendente',     value: r.filter((e) => e.progress === 0 && !e.signed).length,                                     color: 'rgba(232,207,160,0.28)' },
      { label: 'Em andamento', value: r.filter((e) => e.progress > 0 && e.completedModules < e.totalModules && !e.signed).length, color: C.orange },
      { label: 'Concluído',    value: r.filter((e) => e.completedModules >= e.totalModules && !e.signed).length,                  color: C.gold   },
      { label: 'Assinado',     value: r.filter((e) => e.signed).length,                                                           color: C.green  },
    ]
  }, [rows])

  // barra de progresso por colaborador
  const progressBars = useMemo(() =>
    (rows ?? []).map((r) => ({
      label: r.employee.name.split(' ')[0],
      value: Math.round(r.progress * 100),
    })),
  [rows])

  // funil de retenção para linha
  const funnelLine = useMemo(() => {
    const r = rows ?? []
    const n = r.length || 1
    return [
      { label: 'Cadastrou',  value: pct(r.length, n)                                                                              },
      { label: '25%+',       value: pct(r.filter((e) => e.progress >= 0.25).length, n)                                           },
      { label: '50%+',       value: pct(r.filter((e) => e.progress >= 0.50).length, n)                                           },
      { label: '75%+',       value: pct(r.filter((e) => e.progress >= 0.75).length, n)                                           },
      { label: 'Concluiu',   value: pct(r.filter((e) => e.completedModules >= e.totalModules).length, n)                         },
      { label: 'Assinou',    value: pct(r.filter((e) => e.signed).length, n)                                                     },
    ]
  }, [rows])

  // quiz
  const quizStats = useMemo(() => {
    const r = rows ?? []
    const correct = r.reduce((a, e) => a + e.quizCorrect, 0)
    const qtotal  = r.reduce((a, e) => a + e.quizTotal, 0)
    return { correct, total: qtotal, pct: pct(correct, qtotal || 1) }
  }, [rows])

  const avgProgress = useMemo(() => {
    const r = rows ?? []
    if (!r.length) return 0
    return Math.round((r.reduce((a, e) => a + e.progress, 0) / r.length) * 100)
  }, [rows])

  // ── estilos ────────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.stroke}`,
    borderRadius: 18,
    padding: '18px 20px',
  }
  const sLabel: React.CSSProperties = {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: C.goldLt,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  }
  const statVal: React.CSSProperties = {
    fontFamily: 'Playfair Display, serif',
    fontSize: 32,
    fontWeight: 700,
    color: C.cream,
    lineHeight: 1,
  }
  const statSub: React.CSSProperties = {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  }

  const kpiCards = [
    { label: 'Colaboradores',   value: kpis.total,                           sub: 'cadastrados',          icon: Users,         accent: C.gold   },
    { label: 'Concluíram tudo', value: `${pct(kpis.concluded, total)}%`,     sub: `${kpis.concluded}/${total} pessoas`, icon: CheckCircle2, accent: C.orange },
    { label: 'Assinaram',       value: `${pct(kpis.signed, total)}%`,        sub: `${kpis.signed}/${total} pessoas`,    icon: PenLine,       accent: C.green  },
    { label: 'Módulos ativos',  value: kpis.active,                          sub: `de ${data.modules.length} criados`,  icon: BookOpen,      accent: C.goldLt },
  ]

  return (
    <>
      <AdminPageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="Métricas e gráficos em tempo real dos colaboradores."
      />

      {/* ── KPIs ── */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {kpiCards.map((k) => (
          <motion.div key={k.label}
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            style={{ ...card, borderColor: `${k.accent}28` }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, marginBottom: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${k.accent}18`, border: `1px solid ${k.accent}38`,
            }}>
              <k.icon style={{ width: 16, height: 16, color: k.accent }} />
            </div>
            <div style={statVal}>{rows === null ? '—' : k.value}</div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: C.cream, marginTop: 4 }}>{k.label}</div>
            <div style={statSub}>{k.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── LINHA 2: pizza + barras de progresso ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="mb-4 grid gap-4"
        style={{ gridTemplateColumns: '280px 1fr' }}
      >
        {/* PIZZA */}
        <div style={card}>
          <div style={sLabel}><BarChart2 size={12} /> Etapas da jornada</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <PieChart segs={stages} total={Math.max(total, 1)} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {stages.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: C.muted }}>{s.label}</span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: C.cream }}>{s.value}</span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: C.muted, minWidth: 30, textAlign: 'right' }}>
                    {total > 0 ? `${pct(s.value, total)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BARRAS POR COLABORADOR */}
        <div style={card}>
          <div style={sLabel}><TrendingUp size={12} /> Progresso por colaborador</div>
          {rows === null ? (
            <div style={{ color: C.muted, fontSize: 13, fontFamily: 'Montserrat, sans-serif' }}>Carregando…</div>
          ) : progressBars.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13, fontFamily: 'Montserrat, sans-serif' }}>Nenhum colaborador ainda.</div>
          ) : (
            <BarChart data={progressBars} maxVal={100} color={C.gold} />
          )}
        </div>
      </motion.div>

      {/* ── LINHA 3: linha de retenção + stats quiz ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="mb-4 grid gap-4"
        style={{ gridTemplateColumns: '1fr 260px' }}
      >
        {/* LINHA DE RETENÇÃO */}
        <div style={card}>
          <div style={sLabel}><TrendingUp size={12} /> Curva de retenção</div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: C.muted, marginBottom: 12, marginTop: -8 }}>
            % de colaboradores que chegaram a cada etapa da jornada
          </p>
          <LineChart data={funnelLine} maxVal={100} color={C.orange} />
        </div>

        {/* QUIZZES + RESUMO */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={sLabel}><Award size={12} /> Quizzes</div>
            {/* anel de acertos */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                {(() => {
                  const sz = 100, cx = 50, cy = 50, r = 36, sw = 9
                  const circ = 2 * Math.PI * r
                  const filled = quizStats.total > 0 ? (quizStats.correct / quizStats.total) * circ : 0
                  const col = quizStats.pct >= 70 ? C.green : quizStats.pct >= 40 ? C.gold : C.orange
                  return (
                    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.grid} strokeWidth={sw} />
                      <motion.circle cx={cx} cy={cy} r={r} fill="none"
                        stroke={col} strokeWidth={sw} strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ - filled }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        transform={`rotate(-90 ${cx} ${cy})`}
                      />
                      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={700}
                        fontFamily="Playfair Display, serif" fill={C.cream}>
                        {rows === null ? '—' : `${quizStats.pct}%`}
                      </text>
                      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8}
                        fontFamily="Montserrat, sans-serif" fill={C.muted}>acertos</text>
                    </svg>
                  )
                })()}
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { l: 'Questões',  v: rows === null ? '—' : `${quizStats.total}`,   c: C.cream  },
                  { l: 'Corretas',  v: rows === null ? '—' : `${quizStats.correct}`,  c: C.green  },
                  { l: 'Erradas',   v: rows === null ? '—' : `${quizStats.total - quizStats.correct}`, c: C.orange },
                ].map((item) => (
                  <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: C.muted }}>{item.l}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: item.c }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* linha divisória */}
          <div style={{ height: 1, background: C.stroke }} />

          {/* progresso médio */}
          <div>
            <div style={{ ...sLabel, marginBottom: 10 }}><CheckCircle2 size={12} /> Média geral</div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ ...statVal, fontSize: 40 }}>{rows === null ? '—' : `${avgProgress}%`}</span>
              <p style={{ ...statSub, marginTop: 6 }}>progresso médio dos colaboradores</p>
            </div>
            <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: C.grid, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${avgProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                style={{
                  height: '100%', borderRadius: 4,
                  background: avgProgress >= 75 ? C.green : avgProgress >= 40 ? C.gold : C.orange,
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

    </>
  )
}
