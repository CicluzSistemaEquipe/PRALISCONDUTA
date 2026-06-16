import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Plus, Info, Layers, Video as VideoIcon, HelpCircle, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import { ROLES, type Module, type Role, type Story } from '@/lib/types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { ModulePreview } from '../components/ModulePreview'
import { SlideEditor } from '../components/SlideEditor'
import { QuizEditor } from '../components/QuizEditor'
import { isEditableSlide, newTextStory, newQuizQuestion, firstQuizIndex, firstVideoIndex, moveItem } from '../lib/modules'

type Tab = 'info' | 'conteudo' | 'video' | 'quiz'
type VideoStory = Extract<Story, { type: 'video' }>
type QuizStory = Extract<Story, { type: 'quiz' }>

const PALETTE = ['#b8860b', '#d4a017', '#f37435', '#5e3731', '#c0392b', '#27ae60', '#2980b9', '#8e44ad']
const ICON_TYPES: Module['iconType'][] = ['flower', 'sprout', 'grain', 'wheat']
const ICON_LABEL: Record<Module['iconType'], string> = { flower: '🌸 Flor', sprout: '🌱 Broto', grain: '🌾 Grão', wheat: '🌿 Espiga' }

const TABS: { id: Tab; label: string; icon: typeof Info }[] = [
  { id: 'info', label: 'Info', icon: Info },
  { id: 'conteudo', label: 'Conteúdo', icon: Layers },
  { id: 'video', label: 'Vídeo', icon: VideoIcon },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
]

export default function AdminModuloEditor() {
  const { id } = useParams()
  const { getModule, saveModule } = useAdminStore()
  const original = getModule(id ?? '')

  const [mod, setMod] = useState<Module | null>(original ?? null)
  const [tab, setTab] = useState<Tab>('info')
  const [sel, setSel] = useState(0)
  const [toast, setToast] = useState(false)

  const videoIdx = useMemo(() => (mod ? firstVideoIndex(mod.stories) : -1), [mod])
  const quizIdx = useMemo(() => (mod ? firstQuizIndex(mod.stories) : -1), [mod])

  if (!mod) {
    return (
      <>
        <AdminPageHeader eyebrow="Editor de módulo" title="Módulo não encontrado" />
        <Link to="/admin/modulos" className="adm-btn"><ArrowLeft className="h-4 w-4" /> Voltar aos módulos</Link>
      </>
    )
  }

  // ---- mutadores de stories ----
  const setStories = (fn: (s: Story[]) => Story[]) => setMod((m) => (m ? { ...m, stories: fn(m.stories) } : m))
  const updateStory = (i: number, s: Story) => setStories((arr) => arr.map((x, idx) => (idx === i ? s : x)))
  const deleteStory = (i: number) => setStories((arr) => arr.filter((_, idx) => idx !== i))
  const moveStory = (i: number, dir: -1 | 1) => setStories((arr) => moveItem(arr, i, i + dir))

  const addSlide = () =>
    setStories((arr) => {
      const at = arr.findIndex((s) => s.type === 'completion')
      const next = arr.slice()
      next.splice(at >= 0 ? at : next.length, 0, newTextStory())
      return next
    })

  // ---- vídeo ----
  const video = videoIdx >= 0 ? (mod.stories[videoIdx] as VideoStory) : null
  const addVideo = () =>
    setStories((arr) => {
      const next = arr.slice()
      const at = next[0]?.type === 'lis' ? 1 : 0
      next.splice(at, 0, { type: 'video', videoId: `${mod.id}-video`, title: `Vídeo: ${mod.title}`, src: '', duration: '1:30' })
      return next
    })
  const videoPosition: 'antes' | 'depois' = videoIdx >= 0 && quizIdx >= 0 && videoIdx > quizIdx ? 'depois' : 'antes'
  const setVideoPosition = (pos: 'antes' | 'depois') =>
    setStories((arr) => {
      if (videoIdx < 0) return arr
      const vid = arr[videoIdx]
      const rest = arr.filter((_, i) => i !== videoIdx)
      if (pos === 'antes') {
        const at = rest[0]?.type === 'lis' ? 1 : 0
        rest.splice(at, 0, vid)
      } else {
        const q = rest.findIndex((s) => s.type === 'quiz')
        const c = rest.findIndex((s) => s.type === 'completion')
        const at = q >= 0 ? q : c >= 0 ? c : rest.length
        rest.splice(at, 0, vid)
      }
      return rest
    })

  // ---- quiz ----
  const quiz = quizIdx >= 0 ? (mod.stories[quizIdx] as QuizStory) : null
  const addQuiz = () =>
    setStories((arr) => {
      const at = arr.findIndex((s) => s.type === 'completion')
      const next = arr.slice()
      next.splice(at >= 0 ? at : next.length, 0, { type: 'quiz', questions: [newQuizQuestion()] })
      return next
    })

  // ---- roles ----
  const isAll = mod.roles === 'all'
  const toggleRole = (r: Role) =>
    setMod((m) => {
      if (!m) return m
      const cur = m.roles === 'all' ? [] : m.roles.slice()
      const i = cur.indexOf(r)
      if (i >= 0) cur.splice(i, 1)
      else cur.push(r)
      return { ...m, roles: cur.length ? cur : 'all' }
    })

  // ---- preview ----
  const previewStory: Story | null =
    tab === 'video' ? video : tab === 'quiz' ? quiz : mod.stories[sel] ?? mod.stories.find(isEditableSlide) ?? null

  const save = () => {
    saveModule(mod)
    setToast(true)
    window.setTimeout(() => setToast(false), 1800)
  }

  return (
    <>
      <Link to="/admin/modulos" className="mb-3 inline-flex items-center gap-1.5 text-sm text-[var(--cream-muted)] hover:text-[var(--cream)]">
        <ArrowLeft className="h-4 w-4" /> Módulos
      </Link>
      <AdminPageHeader eyebrow={`Editor · ${mod.number}`} title={mod.title} />

      {/* abas */}
      <div className="adm-no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                active ? 'text-white' : 'text-[var(--cream-muted)] hover:text-[var(--cream)]'
              }`}
              style={active ? { background: 'linear-gradient(135deg,#b8860b,#f37435)', boxShadow: '0 8px 22px rgba(243,116,53,0.3)' } : { background: 'rgba(255,245,220,0.05)', border: '1px solid rgba(184,134,11,0.2)' }}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-7 lg:grid-cols-[1fr_280px]">
        {/* coluna de edição */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {/* ---------- INFO ---------- */}
              {tab === 'info' && (
                <div className="flex flex-col gap-4">
                  <div className="adm-card p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="adm-label">Título</label>
                        <input className="adm-input" value={mod.title} onChange={(e) => setMod({ ...mod, title: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="adm-label">Subtítulo</label>
                        <input className="adm-input" value={mod.subtitle} onChange={(e) => setMod({ ...mod, subtitle: e.target.value })} />
                      </div>
                      <div>
                        <label className="adm-label">Etiqueta (tag)</label>
                        <input className="adm-input" value={mod.tag} onChange={(e) => setMod({ ...mod, tag: e.target.value })} />
                      </div>
                      <div>
                        <label className="adm-label">Tempo estimado (min)</label>
                        <input type="number" min={1} className="adm-input" value={mod.estimatedMinutes} onChange={(e) => setMod({ ...mod, estimatedMinutes: Number(e.target.value) || 1 })} />
                      </div>
                    </div>
                  </div>

                  <div className="adm-card p-5">
                    <label className="adm-label">Cor de acento</label>
                    <div className="flex flex-wrap gap-2">
                      {PALETTE.map((c) => (
                        <button
                          key={c}
                          onClick={() => setMod({ ...mod, accent: c, color: c, gradient: [c, mod.gradient[1]] })}
                          aria-label={`Cor ${c}`}
                          className="h-9 w-9 rounded-lg transition-transform hover:scale-110"
                          style={{ background: c, outline: mod.accent === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.15)', outlineOffset: 2 }}
                        />
                      ))}
                    </div>

                    <label className="adm-label mt-4">Ícone (símbolo da marca)</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_TYPES.map((it) => (
                        <button
                          key={it}
                          onClick={() => setMod({ ...mod, iconType: it })}
                          className={`rounded-lg px-3 py-2 text-sm font-semibold ${mod.iconType === it ? 'text-[var(--gold-light)] ring-1 ring-[rgba(184,134,11,0.4)]' : 'text-[var(--cream-muted)]'}`}
                          style={{ background: mod.iconType === it ? 'rgba(184,134,11,0.16)' : 'rgba(255,245,220,0.05)' }}
                        >
                          {ICON_LABEL[it]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="adm-card p-5">
                    <label className="adm-label">Cargos associados</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setMod({ ...mod, roles: 'all' })}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${isAll ? 'text-[var(--gold-light)] ring-1 ring-[rgba(184,134,11,0.4)]' : 'text-[var(--cream-muted)]'}`}
                        style={{ background: isAll ? 'rgba(184,134,11,0.16)' : 'rgba(255,245,220,0.05)' }}
                      >
                        Todos os cargos
                      </button>
                      {ROLES.map((r) => {
                        const on = !isAll && (mod.roles as Role[]).includes(r)
                        return (
                          <button
                            key={r}
                            onClick={() => toggleRole(r)}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold ${on ? 'text-[var(--gold-light)] ring-1 ring-[rgba(184,134,11,0.4)]' : 'text-[var(--cream-muted)]'}`}
                            style={{ background: on ? 'rgba(184,134,11,0.16)' : 'rgba(255,245,220,0.05)' }}
                          >
                            {r}
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[rgba(184,134,11,0.15)] pt-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--cream)]">Módulo ativo</p>
                        <p className="text-xs text-[var(--cream-muted)]">Quando inativo, não aparece no app.</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={mod.active !== false}
                        onClick={() => setMod({ ...mod, active: mod.active === false })}
                        className="relative h-6 w-11 rounded-full"
                        style={{ background: mod.active === false ? 'rgba(255,245,220,0.12)' : 'linear-gradient(135deg,#b8860b,#f37435)' }}
                      >
                        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: mod.active === false ? 2 : 22 }} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------- CONTEÚDO (slides) ---------- */}
              {tab === 'conteudo' && (
                <div className="flex flex-col gap-3">
                  {mod.stories.map((s, i) => {
                    if (isEditableSlide(s)) {
                      return (
                        <div key={i} onClick={() => setSel(i)} className={i === sel ? 'rounded-[20px] ring-1 ring-[rgba(184,134,11,0.35)]' : ''}>
                          <SlideEditor
                            story={s}
                            index={i}
                            total={mod.stories.length}
                            onChange={(ns) => updateStory(i, ns)}
                            onDelete={() => deleteStory(i)}
                            onMove={(dir) => moveStory(i, dir)}
                          />
                        </div>
                      )
                    }
                    // stories não editáveis aqui (vídeo/quiz/resumo/conclusão)
                    const label =
                      s.type === 'video' ? '🎬 Vídeo (edite na aba Vídeo)' :
                      s.type === 'quiz' ? '❓ Quiz (edite na aba Quiz)' :
                      s.type === 'summary' ? '📋 Resumo' : '🏁 Conclusão'
                    return (
                      <div key={i} className="adm-card flex items-center justify-between px-4 py-3 opacity-80">
                        <button onClick={() => setSel(i)} className="text-sm font-semibold text-[var(--cream)]">{label}</button>
                        <div className="flex gap-1">
                          <button className="adm-btn px-2 py-1.5" disabled={i === 0} onClick={() => moveStory(i, -1)}><ChevronUp className="h-4 w-4" /></button>
                          <button className="adm-btn px-2 py-1.5" disabled={i === mod.stories.length - 1} onClick={() => moveStory(i, 1)}><ChevronDown className="h-4 w-4" /></button>
                          {(s.type === 'summary') && (
                            <button className="adm-btn adm-btn--danger px-2 py-1.5" onClick={() => deleteStory(i)}><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <button className="adm-btn self-start" onClick={addSlide}><Plus className="h-4 w-4" /> Adicionar slide</button>
                </div>
              )}

              {/* ---------- VÍDEO ---------- */}
              {tab === 'video' && (
                <div className="adm-card p-5">
                  {video ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="adm-label">Nome do arquivo de vídeo</label>
                        <input
                          className="adm-input"
                          placeholder="modulo-caixa-1.mp4"
                          value={(video.src ?? '').replace('/videos/', '')}
                          onChange={(e) => updateStory(videoIdx, { ...video, src: e.target.value ? `/videos/${e.target.value.replace(/^\/?videos\//, '')}` : '' })}
                        />
                        <p className="mt-1.5 text-xs text-[var(--cream-muted)]">Coloque o arquivo em <code className="rounded bg-[rgba(184,134,11,0.14)] px-1.5 py-0.5 text-[var(--gold-light)]">/public/videos/</code></p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="adm-label">Título</label>
                          <input className="adm-input" value={video.title} onChange={(e) => updateStory(videoIdx, { ...video, title: e.target.value })} />
                        </div>
                        <div>
                          <label className="adm-label">Duração</label>
                          <input className="adm-input" placeholder="2:10" value={video.duration ?? ''} onChange={(e) => updateStory(videoIdx, { ...video, duration: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="adm-label">Posição no módulo</label>
                        <div className="flex gap-2">
                          {(['antes', 'depois'] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setVideoPosition(p)}
                              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold ${videoPosition === p ? 'text-[var(--gold-light)] ring-1 ring-[rgba(184,134,11,0.4)]' : 'text-[var(--cream-muted)]'}`}
                              style={{ background: videoPosition === p ? 'rgba(184,134,11,0.16)' : 'rgba(255,245,220,0.05)' }}
                            >
                              {p === 'antes' ? 'Antes dos slides' : 'Depois dos slides'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button className="adm-btn adm-btn--danger self-start" onClick={() => deleteStory(videoIdx)}><Trash2 className="h-4 w-4" /> Remover vídeo</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <VideoIcon className="h-8 w-8 text-[var(--cream-muted)]" />
                      <p className="text-sm text-[var(--cream-muted)]">Este módulo ainda não tem vídeo.</p>
                      <button className="adm-btn adm-btn--primary" onClick={addVideo}><Plus className="h-4 w-4" /> Adicionar vídeo</button>
                    </div>
                  )}
                </div>
              )}

              {/* ---------- QUIZ ---------- */}
              {tab === 'quiz' && (
                <div>
                  {quiz ? (
                    <QuizEditor questions={quiz.questions} onChange={(qs) => updateStory(quizIdx, { type: 'quiz', questions: qs })} />
                  ) : (
                    <div className="adm-card flex flex-col items-center gap-3 py-8 text-center">
                      <HelpCircle className="h-8 w-8 text-[var(--cream-muted)]" />
                      <p className="text-sm text-[var(--cream-muted)]">Este módulo ainda não tem quiz.</p>
                      <button className="adm-btn adm-btn--primary" onClick={addQuiz}><Plus className="h-4 w-4" /> Adicionar quiz</button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* coluna de preview */}
        <div className="hidden lg:block">
          <ModulePreview module={mod} story={previewStory} />
        </div>
      </div>

      {/* salvar flutuante */}
      <button onClick={save} className="adm-btn adm-btn--primary fixed bottom-6 right-6 z-50 shadow-lg" style={{ boxShadow: '0 0 30px rgba(184,134,11,0.45), 0 10px 30px rgba(0,0,0,0.4)' }}>
        <Check className="h-4 w-4" /> Salvar
      </button>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="adm-toast">
            <Check className="h-4 w-4" /> Salvo ✓
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
