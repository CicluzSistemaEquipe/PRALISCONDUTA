import { useEffect, useRef, type Ref } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, Reorder, useReducedMotion } from 'framer-motion'
import {
  Plus, Pencil, Trash2, ChevronRight,
  HelpCircle, Video, Layers, GripVertical,
} from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import type { Module } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { makeBlankModule } from '../lib/modules'
import { ModuleIcon } from '@/app/components/ModuleIcon'
import { EmptyState } from '../components/ui'

type SectionKey = 'geral' | 'cargo' | 'final'

const SECTION_META: Record<SectionKey, { label: string; description: string }> = {
  geral: { label: 'Para todos',    description: 'Obrigatórios para todos os cargos' },
  cargo: { label: 'Por cargo',     description: 'Específicos por função na empresa' },
  final: { label: 'Para concluir', description: 'Penalidades e assinatura dos termos' },
}

const SECTION_KEYS: SectionKey[] = ['geral', 'cargo', 'final']

function rolesLabel(m: Module): string {
  if (m.roles === 'all') return 'Todos os cargos'
  if (m.roles.length <= 3) return m.roles.join(' · ')
  return `${m.roles.slice(0, 2).join(', ')} +${m.roles.length - 2}`
}

function counts(m: Module) {
  return {
    blocks: m.stories.length,
    quiz:   m.stories.some((s) => s.type === 'quiz'),
    video:  m.stories.some((s) => s.type === 'video'),
  }
}

// ── chip de conteúdo (neutro) ─────────────────────────────────────────────────
function ContentChip({ icon: Icon, label }: { icon: typeof Layers; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--bg-muted)] px-1.5 py-0.5 text-[0.6875rem] font-semibold text-[var(--text-secondary)]">
      <Icon className="h-3 w-3" strokeWidth={1.8} />
      {label}
    </span>
  )
}

// ── switch ativo/inativo (laranja quando on) ──────────────────────────────────
function ActiveSwitch({ active, onToggle, title }: {
  active: boolean
  onToggle: () => void
  title: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={title}
      title={title}
      onClick={onToggle}
      className="relative h-[22px] w-10 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring)]"
      style={{ background: active ? 'var(--accent)' : 'var(--bg-inset)' }}
    >
      <span
        className="absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(26,23,20,0.25)] transition-[left] duration-200"
        style={{ left: active ? 21 : 3 }}
      />
    </button>
  )
}

// ── linha de módulo ───────────────────────────────────────────────────────────
function ModuleRow({ m, highlight, cardRef, onToggle, onEdit, onDelete }: {
  m: Module
  highlight?: boolean
  cardRef?: Ref<HTMLDivElement>
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (m: Module) => void
}) {
  const c        = counts(m)
  const inactive = m.active === false
  const reduce   = useReducedMotion()

  return (
    <motion.div
      ref={cardRef}
      variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
      animate={highlight && !reduce ? {
        boxShadow: [
          '0 0 0 0px rgba(242,107,42,0)',
          '0 0 0 3px rgba(242,107,42,0.35)',
          '0 0 0 0px rgba(242,107,42,0)',
        ],
      } : {}}
      transition={highlight ? { duration: 1.2, repeat: 2, ease: 'easeInOut' } : { duration: 0.18 }}
      className="group flex items-stretch overflow-hidden rounded-xl border bg-white"
      style={{
        borderColor: highlight ? 'var(--accent)' : 'var(--border)',
        opacity: inactive ? 0.72 : 1,
      }}
    >
      {/* alça de drag (desktop-first) */}
      <div
        className="hidden cursor-grab items-center border-r border-[var(--border)] px-2 text-[var(--text-disabled)] transition-colors hover:text-[var(--text-muted)] active:cursor-grabbing sm:flex"
        aria-hidden="true"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* ícone + número */}
      <div className="flex items-center py-3.5 pl-3.5 pr-3 sm:pl-3">
        <div
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[11px]"
          style={{ background: inactive ? 'var(--bg-muted)' : 'var(--brown-tint)' }}
        >
          <ModuleIcon
            type={m.iconType}
            size={15}
            color={inactive ? 'var(--text-disabled)' : 'var(--brand-brown)'}
          />
          <span
            className="text-[8px] font-bold tabular-nums"
            style={{ color: inactive ? 'var(--text-disabled)' : 'var(--brand-brown)' }}
          >
            {m.number}
          </span>
        </div>
      </div>

      {/* info principal */}
      <button
        type="button"
        onClick={() => onEdit(m.id)}
        className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3.5 pr-2 text-left focus-visible:outline-none"
      >
        <div className="flex items-center gap-2">
          <span className={`truncate text-[0.9375rem] font-semibold ${inactive ? 'text-[var(--text-muted)]' : 'text-[var(--ink)]'}`}>
            {m.title}
          </span>
          {(m.status ?? 'published') === 'draft' && <span className="adm-badge adm-badge--gold">Rascunho</span>}
          {inactive && <span className="adm-badge adm-badge--muted">Inativo</span>}
        </div>

        <p className="truncate text-[0.75rem] text-[var(--text-muted)]">{rolesLabel(m)}</p>

        <div className="mt-0.5 flex flex-wrap gap-1.5">
          <ContentChip icon={Layers} label={`${c.blocks} bloco${c.blocks !== 1 ? 's' : ''}`} />
          {c.video && <ContentChip icon={Video} label="vídeo" />}
          {c.quiz && <ContentChip icon={HelpCircle} label="quiz" />}
        </div>
      </button>

      {/* ações */}
      <div className="flex items-center gap-1.5 border-l border-[var(--border)] px-3 sm:gap-2 sm:px-4">
        <ActiveSwitch
          active={!inactive}
          onToggle={() => onToggle(m.id)}
          title={inactive ? 'Ativar módulo' : 'Desativar módulo'}
        />

        <button
          type="button"
          onClick={() => onEdit(m.id)}
          aria-label="Editar módulo"
          title="Editar módulo"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:shadow-[var(--ring)]"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(m)}
          aria-label="Excluir módulo"
          title="Excluir módulo"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:shadow-[var(--ring)]"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <ChevronRight className="hidden h-4 w-4 text-[var(--text-disabled)] transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden="true" />
      </div>
    </motion.div>
  )
}

// ── mini-stat (resumo) ────────────────────────────────────────────────────────
function MiniStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5">
      <span
        className="adm-tabular text-[1.375rem] font-bold leading-none"
        style={{ color: accent ? 'var(--accent-text)' : 'var(--ink)' }}
      >
        {value}
      </span>
      <span className="text-[0.75rem] font-medium text-[var(--text-muted)]">{label}</span>
    </div>
  )
}

// ── página principal ──────────────────────────────────────────────────────────
export default function AdminModulos() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const savedId    = (location.state as { savedId?: string } | null)?.savedId ?? null
  const savedRef   = useRef<HTMLDivElement>(null)
  const { data, reorderModules, toggleActive, deleteModule, saveModule } = useAdminStore()
  const mods = data.modules

  useEffect(() => {
    if (savedId && savedRef.current) {
      savedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [savedId])

  const createNew = () => {
    const m = makeBlankModule(mods.length + 1)
    saveModule(m)
    navigate(`/admin/modulos/${m.id}`)
  }

  const handleDelete = (m: Module) => {
    if (confirm(`Excluir "${m.title}"?\n\nEsta ação não pode ser desfeita.`))
      deleteModule(m.id)
  }

  const grouped = SECTION_KEYS
    .map((key) => ({
      key,
      meta: SECTION_META[key],
      modules: mods.filter((m) => (m.section ?? 'geral') === key),
    }))
    .filter((g) => g.modules.length > 0)

  const totalActive = mods.filter((m) => m.active !== false).length
  const withQuiz = mods.filter((m) => m.stories.some((s) => s.type === 'quiz')).length

  return (
    <>
      <AdminPageHeader
        eyebrow="Conteúdo"
        title="Módulos"
        description="Gerencie, reordene e configure os módulos de treinamento do app."
        action={
          <button className="adm-btn adm-btn--primary" onClick={createNew}>
            <Plus className="h-[18px] w-[18px]" strokeWidth={2} /> Novo módulo
          </button>
        }
      />

      {mods.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-white">
          <EmptyState
            icon={Layers}
            title="Nenhum módulo ainda"
            hint="Crie o primeiro módulo de treinamento para começar a montar a trilha do app."
            action={
              <button className="adm-btn adm-btn--primary" onClick={createNew}>
                <Plus className="h-[18px] w-[18px]" strokeWidth={2} /> Criar primeiro módulo
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* resumo rápido */}
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
            className="mb-7 flex flex-wrap gap-2.5"
          >
            <MiniStat label="módulos no total" value={mods.length} />
            <MiniStat label="ativos no app" value={totalActive} accent />
            <MiniStat label="inativos" value={mods.length - totalActive} />
            <MiniStat label="com quiz" value={withQuiz} />
          </motion.div>

          {/* seções */}
          <div className="flex flex-col gap-8">
            {grouped.map(({ key, meta, modules }) => (
              <section key={key}>
                {/* cabeçalho de seção (eyebrow discreto) */}
                <div className="mb-3.5 flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="adm-eyebrow">{meta.label}</p>
                    <p className="truncate text-[0.75rem] text-[var(--text-muted)]">{meta.description}</p>
                  </div>
                  <div className="h-px flex-1 bg-[var(--border)]" />
                  <span className="adm-badge adm-badge--muted shrink-0">
                    {modules.length} módulo{modules.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* lista com drag-and-drop */}
                <Reorder.Group
                  as="div"
                  axis="y"
                  values={modules}
                  onReorder={(newSectionOrder: Module[]) => {
                    const sectionIndices = modules.map((sm) => mods.findIndex((m) => m.id === sm.id))
                    const newIds = mods.map((m) => m.id)
                    sectionIndices.forEach((globalIdx, idx) => { newIds[globalIdx] = newSectionOrder[idx].id })
                    reorderModules(newIds)
                  }}
                  className="flex flex-col gap-2"
                >
                  {modules.map((m) => (
                    <Reorder.Item as="div" key={m.id} value={m} className="list-none">
                      <ModuleRow
                        m={m}
                        highlight={m.id === savedId}
                        cardRef={m.id === savedId ? savedRef : undefined}
                        onToggle={toggleActive}
                        onEdit={(id) => navigate(`/admin/modulos/${id}`)}
                        onDelete={handleDelete}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  )
}
