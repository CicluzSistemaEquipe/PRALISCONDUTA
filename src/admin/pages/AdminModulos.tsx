import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  HelpCircle,
  Video,
  Layers,
} from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import type { Module } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { makeBlankModule, moveItem } from '../lib/modules'

function rolesLabel(m: Module): string {
  if (m.roles === 'all') return 'Todos os cargos'
  return m.roles.join(' · ')
}
function counts(m: Module) {
  return {
    slides: m.stories.filter((s) => s.type === 'text' || s.type === 'lis').length,
    quiz: m.stories.some((s) => s.type === 'quiz'),
    video: m.stories.some((s) => s.type === 'video'),
  }
}

export default function AdminModulos() {
  const navigate = useNavigate()
  const { data, reorderModules, toggleActive, deleteModule, saveModule } = useAdminStore()
  const mods = data.modules

  const move = (index: number, dir: -1 | 1) => {
    const ids = mods.map((m) => m.id)
    reorderModules(moveItem(ids, index, index + dir))
  }

  const createNew = () => {
    const m = makeBlankModule(mods.length + 1)
    saveModule(m)
    navigate(`/admin/modulos/${m.id}`)
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Conteúdo"
        title="Módulos"
        description="Reordene, ative/desative e edite cada módulo do app."
        action={
          <button className="adm-btn adm-btn--primary" onClick={createNew}>
            <Plus className="h-4 w-4" /> Novo módulo
          </button>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        className="flex flex-col gap-3"
      >
        {mods.map((m, i) => {
          const c = counts(m)
          const inactive = m.active === false
          return (
            <motion.div
              key={m.id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className={`adm-card flex items-center gap-3 p-3.5 sm:gap-4 ${inactive ? 'opacity-55' : ''}`}
            >
              {/* reorder */}
              <div className="flex flex-col items-center text-[var(--cream-muted)]">
                <button className="adm-btn px-1.5 py-1" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Mover para cima">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <GripVertical className="my-0.5 h-4 w-4 opacity-40" />
                <button className="adm-btn px-1.5 py-1" disabled={i === mods.length - 1} onClick={() => move(i, 1)} aria-label="Mover para baixo">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* selo número/cor */}
              <div
                className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white sm:flex"
                style={{ background: `linear-gradient(140deg, ${m.gradient[0]}, ${m.gradient[1]})` }}
              >
                {m.number}
              </div>

              {/* info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-bold text-white">{m.title}</h3>
                  {inactive && <span className="adm-badge adm-badge--muted">Inativo</span>}
                </div>
                <p className="truncate text-xs text-[var(--cream-muted)]">{rolesLabel(m)}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="adm-badge adm-badge--gold"><Layers className="h-3 w-3" /> {c.slides} slides</span>
                  {c.video && <span className="adm-badge adm-badge--muted"><Video className="h-3 w-3" /> vídeo</span>}
                  {c.quiz && <span className="adm-badge adm-badge--muted"><HelpCircle className="h-3 w-3" /> quiz</span>}
                </div>
              </div>

              {/* ações */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  role="switch"
                  aria-checked={!inactive}
                  onClick={() => toggleActive(m.id)}
                  title={inactive ? 'Ativar módulo' : 'Desativar módulo'}
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{ background: inactive ? 'rgba(255,245,220,0.12)' : 'linear-gradient(135deg,#b8860b,#f37435)' }}
                >
                  <span
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                    style={{ left: inactive ? 2 : 22 }}
                  />
                </button>
                <button className="adm-btn px-2.5 py-2" onClick={() => navigate(`/admin/modulos/${m.id}`)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="adm-btn adm-btn--danger px-2.5 py-2"
                  onClick={() => {
                    if (confirm(`Excluir o módulo "${m.title}"? Esta ação não pode ser desfeita.`)) deleteModule(m.id)
                  }}
                  aria-label="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </>
  )
}
