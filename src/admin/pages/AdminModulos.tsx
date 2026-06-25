import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, Reorder } from 'framer-motion'
import {
  Plus, Pencil, Trash2,
  HelpCircle, Video, Layers, Users, Globe, Award,
  GripVertical,
} from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import type { Module } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { makeBlankModule } from '../lib/modules'
import { ModuleIcon } from '@/app/components/ModuleIcon'

type SectionKey = 'geral' | 'cargo' | 'final'

const SECTION_META: Record<SectionKey, { label: string; description: string; color: string; Icon: typeof Globe }> = {
  geral: { label: 'Para todos',    description: 'Obrigatórios para todos os cargos',  color: '#b8860b', Icon: Globe  },
  cargo: { label: 'Por cargo',     description: 'Específicos por função na empresa',   color: '#f37435', Icon: Users  },
  final: { label: 'Para concluir', description: 'Penalidades e assinatura dos termos', color: '#5dd87a', Icon: Award  },
}

function rolesLabel(m: Module): string {
  if (m.roles === 'all') return 'Todos os cargos'
  if (m.roles.length <= 3) return m.roles.join(' · ')
  return `${m.roles.slice(0, 2).join(', ')} +${m.roles.length - 2}`
}

function counts(m: Module) {
  return {
    slides: m.stories.filter((s) => s.type === 'text' || s.type === 'lis').length,
    quiz:   m.stories.some((s) => s.type === 'quiz'),
    video:  m.stories.some((s) => s.type === 'video'),
  }
}

// ── chip de conteúdo ──────────────────────────────────────────────────────────
function ContentChip({ icon: Icon, label, accent }: { icon: typeof Layers; label: string; accent?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 7,
      fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
      background: accent ? `${accent}14` : 'rgba(232,207,160,0.07)',
      border: `1px solid ${accent ? `${accent}30` : 'rgba(232,207,160,0.12)'}`,
      color: accent ?? 'rgba(232,207,160,0.55)',
    }}>
      <Icon size={10} />
      {label}
    </span>
  )
}

// ── card de módulo ────────────────────────────────────────────────────────────
function ModuleCard({ m, highlight, cardRef, onToggle, onEdit, onDelete }: {
  m: Module
  highlight?: boolean
  cardRef?: React.Ref<HTMLDivElement>
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (m: Module) => void
}) {
  const c        = counts(m)
  const inactive = m.active === false
  const accent   = m.gradient?.[0] ?? '#b8860b'

  return (
    <motion.div
      ref={cardRef}
      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
      animate={highlight ? {
        boxShadow: ['0 0 0 0px rgba(243,116,53,0)', '0 0 0 3px rgba(243,116,53,0.5)', '0 0 0 0px rgba(243,116,53,0)'],
      } : {}}
      transition={highlight ? { duration: 1.2, repeat: 2, ease: 'easeInOut' } : {}}
      style={{
        display: 'flex', alignItems: 'stretch', gap: 0,
        background: inactive ? 'rgba(14,6,0,0.7)' : 'rgba(22,10,2,0.88)',
        border: `1px solid ${highlight ? 'rgba(243,116,53,0.5)' : inactive ? 'rgba(232,207,160,0.06)' : 'rgba(232,207,160,0.1)'}`,
        borderLeft: `3px solid ${highlight ? '#f37435' : inactive ? 'rgba(255,255,255,0.08)' : accent}`,
        borderRadius: 16, overflow: 'hidden',
        opacity: inactive ? 0.65 : 1,
        transition: 'opacity 0.2s, border-color 0.2s',
      }}
    >
      {/* alça de drag */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '0 10px', borderRight: '1px solid rgba(232,207,160,0.06)',
      }}>
        <div style={{ cursor: 'grab', color: 'rgba(232,207,160,0.22)', display: 'flex', alignItems: 'center' }}>
          <GripVertical size={15} />
        </div>
      </div>

      {/* ícone com número */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 14px 14px 12px' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: inactive
            ? 'rgba(255,255,255,0.06)'
            : `linear-gradient(140deg, ${m.gradient[0]}, ${m.gradient[1]})`,
          boxShadow: inactive ? 'none' : `0 4px 16px ${accent}44`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <ModuleIcon type={m.iconType} size={16} color={inactive ? 'rgba(232,207,160,0.3)' : '#fff'} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8, fontWeight: 900, color: inactive ? 'rgba(232,207,160,0.3)' : 'rgba(255,255,255,0.7)' }}>
            {m.number}
          </span>
        </div>
      </div>

      {/* info principal */}
      <div style={{ flex: 1, minWidth: 0, padding: '14px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: inactive ? 'rgba(255,255,255,0.45)' : '#fff' }}>
            {m.title}
          </span>
          {inactive && (
            <span style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
              color: 'rgba(232,207,160,0.35)', background: 'rgba(232,207,160,0.06)',
              border: '1px solid rgba(232,207,160,0.12)', borderRadius: 6, padding: '1px 7px',
            }}>
              INATIVO
            </span>
          )}
        </div>

        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
          {rolesLabel(m)}
        </p>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const, marginTop: 2 }}>
          <ContentChip icon={Layers} label={`${c.slides} slide${c.slides !== 1 ? 's' : ''}`} accent={inactive ? undefined : accent} />
          {c.video && <ContentChip icon={Video} label="vídeo" />}
          {c.quiz  && <ContentChip icon={HelpCircle} label="quiz" accent={inactive ? undefined : '#a78bfa'} />}
        </div>
      </div>

      {/* ações */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px',
        borderLeft: '1px solid rgba(232,207,160,0.06)',
      }}>
        {/* toggle ativo/inativo */}
        <button
          role="switch"
          aria-checked={!inactive}
          onClick={() => onToggle(m.id)}
          title={inactive ? 'Ativar módulo' : 'Desativar módulo'}
          style={{
            position: 'relative', width: 40, height: 22, borderRadius: 11,
            border: 'none', cursor: 'pointer', flexShrink: 0,
            transition: 'background 0.25s',
            background: inactive
              ? 'rgba(255,255,255,0.1)'
              : `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})`,
            boxShadow: inactive ? 'none' : `0 2px 10px ${accent}44`,
          }}
        >
          <span style={{
            position: 'absolute', top: 3, width: 16, height: 16,
            borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s',
            left: inactive ? 3 : 21,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </button>

        {/* editar */}
        <button
          onClick={() => onEdit(m.id)}
          title="Editar módulo"
          style={{
            width: 34, height: 34, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
            background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8c96a',
          }}
        >
          <Pencil size={13} />
        </button>

        {/* excluir */}
        <button
          onClick={() => onDelete(m)}
          title="Excluir módulo"
          style={{
            width: 34, height: 34, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171',
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
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

  const sectionKeys: SectionKey[] = ['geral', 'cargo', 'final']
  const grouped = sectionKeys
    .map((key) => ({
      key,
      meta: SECTION_META[key],
      modules: mods.map((m, i) => ({ m, i })).filter(({ m }) => (m.section ?? 'geral') === key),
    }))
    .filter((g) => g.modules.length > 0)

  const totalActive = mods.filter((m) => m.active !== false).length

  return (
    <>
      <AdminPageHeader
        eyebrow="Conteúdo"
        title="Módulos"
        description="Gerencie, reordene e configure os módulos de treinamento do app."
        action={
          <button className="adm-btn adm-btn--primary" onClick={createNew}>
            <Plus className="h-4 w-4" /> Novo módulo
          </button>
        }
      />

      {/* resumo rápido */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' as const,
        }}
      >
        {[
          { label: 'Total de módulos',  value: mods.length,                                    color: '#e8cfa0' },
          { label: 'Ativos no app',     value: totalActive,                                    color: '#4ade80' },
          { label: 'Inativos',          value: mods.length - totalActive,                      color: 'rgba(232,207,160,0.35)' },
          { label: 'Com quiz',          value: mods.filter((m) => m.stories.some((s) => s.type === 'quiz')).length, color: '#a78bfa' },
        ].map((s) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(22,10,2,0.7)', border: '1px solid rgba(232,207,160,0.09)',
            borderRadius: 12, padding: '10px 16px',
          }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
            </span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.45)' }}>
              {s.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* seções */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {grouped.map(({ key, meta, modules }) => {
          const SectionIcon = meta.Icon
          return (
            <section key={key}>
              {/* cabeçalho de seção */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: `${meta.color}18`, border: `1px solid ${meta.color}38`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <SectionIcon size={14} color={meta.color} />
                </div>
                <div>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 800, color: meta.color }}>
                    {meta.label}
                  </span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(232,207,160,0.4)', marginLeft: 8 }}>
                    — {meta.description}
                  </span>
                </div>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${meta.color}25, transparent)`, marginLeft: 4 }} />
                <span style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
                  color: meta.color, background: `${meta.color}12`,
                  border: `1px solid ${meta.color}28`, borderRadius: 8, padding: '2px 10px',
                }}>
                  {modules.length} módulo{modules.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* lista com drag-and-drop */}
              <Reorder.Group
                as="div"
                axis="y"
                values={modules.map(({ m }) => m)}
                onReorder={(newSectionOrder) => {
                  const sectionMods = modules.map(({ m }) => m)
                  const sectionIndices = sectionMods.map((sm) => mods.findIndex((m) => m.id === sm.id))
                  const newIds = mods.map((m) => m.id)
                  sectionIndices.forEach((globalIdx, idx) => { newIds[globalIdx] = newSectionOrder[idx].id })
                  reorderModules(newIds)
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                {modules.map(({ m }) => (
                  <Reorder.Item as="div" key={m.id} value={m} style={{ listStyle: 'none' }}>
                    <ModuleCard
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
          )
        })}
      </div>

      {mods.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'rgba(22,10,2,0.5)', border: '1px dashed rgba(232,207,160,0.12)',
            borderRadius: 20,
          }}
        >
          <Layers size={40} color="rgba(232,207,160,0.15)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'rgba(232,207,160,0.6)', marginBottom: 8 }}>
            Nenhum módulo ainda
          </p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(232,207,160,0.35)', marginBottom: 20 }}>
            Crie o primeiro módulo de treinamento.
          </p>
          <button className="adm-btn adm-btn--primary" onClick={createNew}>
            <Plus size={15} /> Criar primeiro módulo
          </button>
        </motion.div>
      )}
    </>
  )
}
