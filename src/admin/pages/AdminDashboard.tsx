import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, CheckCircle2, PenLine, BookOpen, ArrowRight } from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import { useAdminStore } from '@/lib/adminStore'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { StatusBadge, statusOf } from '../components/StatusBadge'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0
}

export default function AdminDashboard() {
  const { data } = useAdminStore()
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)

  useEffect(() => {
    let active = true
    loadEmployeeRows().then((r) => active && setRows(r))
    return () => {
      active = false
    }
  }, [])

  const kpis = useMemo(() => {
    const total = rows?.length ?? 0
    const concluded = rows?.filter((r) => r.totalModules > 0 && r.completedModules >= r.totalModules).length ?? 0
    const signed = rows?.filter((r) => r.signed).length ?? 0
    const activeModules = data.modules.filter((m) => m.active !== false).length
    return { total, concluded, signed, activeModules }
  }, [rows, data.modules])

  const recent = (rows ?? []).slice(0, 6)

  const cards = [
    { label: 'Colaboradores', value: kpis.total, icon: Users, sub: 'cadastrados no total' },
    { label: 'Concluíram tudo', value: `${pct(kpis.concluded, kpis.total)}%`, icon: CheckCircle2, sub: `${kpis.concluded} de ${kpis.total}` },
    { label: 'Assinaram os termos', value: `${pct(kpis.signed, kpis.total)}%`, icon: PenLine, sub: `${kpis.signed} de ${kpis.total}` },
    { label: 'Módulos ativos', value: kpis.activeModules, icon: BookOpen, sub: `de ${data.modules.length} no total` },
  ]

  return (
    <>
      <AdminPageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="Resumo do progresso e das assinaturas dos colaboradores."
      />

      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <motion.div key={c.label} variants={fadeUp} className="adm-card adm-card--gold p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)' }}>
              <c.icon className="h-5 w-5 text-[var(--gold-light)]" />
            </div>
            <div className="adm-kpi-val">{rows === null ? '—' : c.value}</div>
            <div className="mt-1 text-xs font-semibold text-[var(--cream)]">{c.label}</div>
            <div className="text-[0.7rem] text-[var(--cream-muted)]">{c.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="adm-card mt-6 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-bold text-[var(--cream)]">Atividade recente</h2>
          <Link to="/admin/acompanhamento" className="flex items-center gap-1 text-xs font-semibold text-[var(--gold-light)] hover:underline">
            Ver acompanhamento <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {rows === null ? (
          <div className="px-5 pb-6 text-sm text-[var(--cream-muted)]">Carregando…</div>
        ) : recent.length === 0 ? (
          <div className="px-5 pb-8 pt-2 text-center text-sm text-[var(--cream-muted)]">
            Nenhum colaborador ainda. Cadastre em <Link to="/admin/colaboradores" className="text-[var(--gold-light)] underline">Colaboradores</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Cargo</th>
                  <th className="w-[34%]">Progresso</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.employee.id}>
                    <td className="font-semibold text-white">{r.employee.name}</td>
                    <td className="text-[var(--cream-muted)]">{r.employee.role}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="adm-pbar flex-1"><i style={{ width: `${Math.round(r.progress * 100)}%` }} /></div>
                        <span className="w-9 text-right text-xs text-[var(--cream-muted)]">{Math.round(r.progress * 100)}%</span>
                      </div>
                    </td>
                    <td><StatusBadge status={statusOf(r)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </>
  )
}
