import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Store, CheckCircle2, PenLine, Target, Trophy } from 'lucide-react'
import type { EmployeeRow } from '@/dashboard/data'

interface StoreAgg {
  store: string
  total: number
  concluded: number
  signed: number
  avg: number          // progresso médio (0..100)
  quiz: number | null  // % acerto quiz
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)

/** Métricas de desempenho agregadas por loja, ranqueadas. Reaproveita EmployeeRow. */
export function aggregateByStore(rows: EmployeeRow[]): StoreAgg[] {
  const map = new Map<string, EmployeeRow[]>()
  for (const e of rows) {
    const k = e.employee.store?.trim() || 'Sem loja'
    map.set(k, [...(map.get(k) ?? []), e])
  }
  return [...map.entries()]
    .map(([store, list]) => {
      const total = list.length
      const concluded = list.filter((e) => e.totalModules > 0 && e.completedModules >= e.totalModules).length
      const signed = list.filter((e) => e.signed).length
      const avg = total ? Math.round((list.reduce((a, e) => a + e.progress, 0) / total) * 100) : 0
      const qc = list.reduce((a, e) => a + e.quizCorrect, 0)
      const qt = list.reduce((a, e) => a + e.quizTotal, 0)
      return { store, total, concluded, signed, avg, quiz: qt ? Math.round((qc / qt) * 100) : null }
    })
    // ranking inteligente: desempenho (progresso) e, em empate, mais gente
    .sort((a, b) => b.avg - a.avg || b.total - a.total)
}

function MetricChip({ icon: Icon, label, value, tone }: {
  icon: typeof CheckCircle2; label: string; value: string; tone: 'green' | 'gold' | 'brown'
}) {
  const c = tone === 'green' ? { fg: '#1e7e4e', bg: '#ecf7f0', bd: '#cdebd9' }
    : tone === 'gold' ? { fg: '#b8860b', bg: 'rgba(184,134,11,0.10)', bd: '#f0e2c4' }
    : { fg: 'var(--brand-brown)', bg: 'var(--brown-tint)', bd: 'var(--border)' }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[0.72rem] font-semibold"
      style={{ color: c.fg, background: c.bg, borderColor: c.bd }} title={label}>
      <Icon className="h-3 w-3" strokeWidth={2.2} /> {value}
    </span>
  )
}

/** Barra de desempenho por loja — leitura rápida + ranking. Não substitui nada;
 *  é uma visão adicional sobre os mesmos dados. */
export function StorePerformance({ rows, title = 'Desempenho por loja' }: { rows: EmployeeRow[]; title?: string }) {
  const stores = useMemo(() => aggregateByStore(rows), [rows])
  const [hover, setHover] = useState<string | null>(null)
  const best = stores[0]?.store

  if (stores.length === 0) return null

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-xs)]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--brown-tint)', color: 'var(--brand-brown)' }}>
            <Store className="h-[15px] w-[15px]" strokeWidth={2} />
          </span>
          <h2 className="text-[0.95rem] font-semibold text-[var(--ink)]">{title}</h2>
        </div>
        <span className="adm-badge adm-badge--muted">{stores.length} {stores.length === 1 ? 'loja' : 'lojas'}</span>
      </header>

      <ul className="flex flex-col gap-2.5">
        {stores.map((s, i) => {
          const isBest = s.store === best && s.total > 0 && stores.length > 1
          return (
            <li key={s.store}
              onMouseEnter={() => setHover(s.store)} onMouseLeave={() => setHover(null)}
              className="rounded-xl border px-3.5 py-3 transition-colors"
              style={{ borderColor: hover === s.store ? 'var(--border-strong)' : 'var(--border)', background: hover === s.store ? 'var(--bg-subtle)' : '#fff' }}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[0.72rem] font-bold"
                    style={isBest ? { background: 'rgba(184,134,11,0.16)', color: '#b8860b' } : { background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                    {isBest ? <Trophy className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="truncate text-[0.875rem] font-semibold text-[var(--ink)]">{s.store}</span>
                  <span className="shrink-0 text-[0.72rem] text-[var(--text-muted)]">· {s.total} {s.total === 1 ? 'pessoa' : 'pessoas'}</span>
                </div>
                <span className="shrink-0 text-[0.95rem] font-bold text-[var(--ink)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.avg}%</span>
              </div>

              {/* barra de progresso médio */}
              <div className="mb-2.5 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-inset)]">
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.avg}%` }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 + i * 0.05 }}
                  className="h-full rounded-full" style={{ background: isBest ? 'linear-gradient(90deg,#b8860b,#f37435)' : 'var(--accent)' }} />
              </div>

              {/* métricas */}
              <div className="flex flex-wrap gap-1.5">
                <MetricChip icon={CheckCircle2} label="Concluíram tudo" value={`${pct(s.concluded, s.total)}% concl.`} tone="green" />
                <MetricChip icon={PenLine} label="Assinaram" value={`${pct(s.signed, s.total)}% assin.`} tone="gold" />
                {s.quiz != null && <MetricChip icon={Target} label="Acerto no quiz" value={`${s.quiz}% quiz`} tone="brown" />}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
