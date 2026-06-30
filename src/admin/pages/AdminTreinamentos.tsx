import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Users, Layers, Pencil, Globe, ChevronRight, Clock } from 'lucide-react'
import { getTreinamentos, treinamentoIncludes } from '@/lib/content'
import { useCargos, useCargosVersion } from '@/lib/cargos'
import { useAdminStore } from '@/lib/adminStore'
import type { Cargo, Treinamento } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState } from '../components/ui'

const GERAL_ACCENT = '#b8860b'

interface TreinoView {
  t: Treinamento
  cargo?: Cargo
  accent: string
  herdados: number
  especificos: number
  total: number
}

function fmtUpdated(iso?: string): string | null {
  if (!iso) return null
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return null }
}

/** Deriva os treinamentos + contadores a partir dos mesmos módulos (sem duplicar). */
function useTreinoViews(): TreinoView[] {
  useCargosVersion()
  const { data } = useAdminStore()   // re-deriva quando os módulos mudam
  const cargos = useCargos()
  return useMemo(() => {
    return getTreinamentos().map((t) => {
      const all = data.modules.filter((m) => treinamentoIncludes(t.id, m))
      const herdados = all.filter((m) => m.roles === 'all').length
      const total = all.length
      const cargo = t.cargoId ? cargos.find((c) => c.id === t.cargoId) : undefined
      return { t, cargo, accent: t.accent ?? cargo?.accent ?? GERAL_ACCENT, herdados, especificos: total - herdados, total }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.modules, data.treinamentos, cargos])
}

function StatChip({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number; tone: string }) {
  return (
    <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-2.5 py-2 text-center">
      <p className="flex items-center justify-center gap-1 text-[1.05rem] font-bold text-[var(--ink)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <Icon className="h-3.5 w-3.5" style={{ color: tone }} /> {value}
      </p>
      <p className="mt-0.5 text-[0.66rem] text-[var(--text-muted)]">{label}</p>
    </div>
  )
}

function TreinamentoCard({ v, onOpen }: { v: TreinoView; onOpen: () => void }) {
  const { t, cargo, accent } = v
  const geral = t.id === 'geral'
  const inativo = t.ativo === false
  const updated = fmtUpdated(t.updatedAt)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-xs)] transition-all hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]"
    >
      <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent }} />
      <div className="flex flex-col gap-3 p-5 pl-6">
        {/* cabeçalho */}
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}1f`, color: accent }}>
            {geral ? <Globe className="h-[22px] w-[22px]" strokeWidth={1.9} /> : <GraduationCap className="h-[22px] w-[22px]" strokeWidth={1.9} />}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[1rem] font-semibold text-[var(--ink)]">{t.nome}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-[0.78rem] text-[var(--text-muted)]">
              <Users className="h-3.5 w-3.5" />
              {geral ? 'Todos os cargos' : (cargo?.nome ?? t.cargoId ?? 'Cargo')}
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${inativo ? 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-muted)]' : 'border-[#cdebd9] bg-[#ecf7f0] text-[#1e7e4e]'}`}>
            {inativo ? 'Inativo' : 'Ativo'}
          </span>
        </div>

        {/* contadores */}
        <div className="flex gap-2">
          <StatChip icon={Globe} label="Herdados" value={v.herdados} tone={GERAL_ACCENT} />
          <StatChip icon={Layers} label="Específicos" value={v.especificos} tone={accent} />
          <StatChip icon={GraduationCap} label="Total" value={v.total} tone="var(--accent)" />
        </div>

        {/* rodapé */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[0.72rem] text-[var(--text-muted)]">
            {updated ? <><Clock className="h-3.5 w-3.5" /> Atualizado {updated}</> : <span className="opacity-0">.</span>}
          </span>
          <button onClick={onOpen} className="adm-btn adm-btn--primary h-9">
            <Pencil className="h-4 w-4" /> Editar treinamento
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function AdminTreinamentos() {
  const navigate = useNavigate()
  const views = useTreinoViews()

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <AdminPageHeader
        eyebrow="Conteúdo"
        title="Treinamentos"
        description="Organize o treinamento de cada cargo. Módulos 'Para todos' são herdados por todos; os específicos aparecem só no cargo."
      />

      {views.length === 0 ? (
        <div className="adm-card"><EmptyState icon={GraduationCap} title="Nenhum treinamento" hint="Cadastre cargos em Colaboradores → Cargos para ver os treinamentos." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {views.map((v) => (
            <TreinamentoCard key={v.t.id} v={v} onOpen={() => navigate(`/admin/treinamentos/${v.t.id}`)} />
          ))}
        </div>
      )}

      <p className="mt-5 flex items-center gap-1.5 text-center text-[0.78rem] text-[var(--text-muted)]">
        <ChevronRight className="h-3.5 w-3.5" />
        Cada cargo tem seu treinamento. O colaborador vê automaticamente o do seu cargo (a Home passa a usar isso no próximo bloco).
      </p>
    </div>
  )
}
