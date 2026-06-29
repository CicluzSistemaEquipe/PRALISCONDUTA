import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, Reorder } from 'framer-motion'
import {
  ArrowLeft, Check, Plus, Info, Layers, Video as VideoIcon, HelpCircle,
  Trash2, ChevronDown, Users, Film,
  ClipboardList, Flag, MessageSquare, FileText, Sparkles, Eye,
  Tag, Palette, UploadCloud, FileVideo, X as XIcon,
  GripVertical, Save, BarChart3, ArrowUp, ArrowDown, Send,
} from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import { ROLES, type Module, type Role, type Story } from '@/lib/types'
import { ModulePreview } from '../components/ModulePreview'
import { SlideEditor } from '../components/SlideEditor'
import { PollSlideEditor } from '../components/PollSlideEditor'
import { QuizEditor } from '../components/QuizEditor'
import { ModuleIcon } from '@/app/components/ModuleIcon'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState } from '../components/ui'
import {
  isEditableSlide, newTextStory, newPollStory, newQuizQuestion,
  firstQuizIndex, firstVideoIndex, moveItem,
} from '../lib/modules'

type Tab     = 'info' | 'conteudo'
type AddKind = 'texto' | 'destaque' | 'lis' | 'enquete' | 'video' | 'quiz'
type VideoStory = Extract<Story, { type: 'video' }>
type QuizStory  = Extract<Story, { type: 'quiz' }>

// ── paleta de cor do módulo (apenas dado do módulo — não é chrome do admin) ──
const QUICK_COLORS = ['#b8860b', '#d4a017', '#f37435', '#c0392b', '#27ae60', '#2980b9', '#8e44ad', '#5e3731']

const ICON_TYPES: Module['iconType'][] = ['flower', 'sprout', 'grain', 'wheat', 'bread', 'croissant', 'cake', 'star', 'heart', 'chef']
const ICON_LABEL: Record<Module['iconType'], string> = {
  flower: 'Flor', sprout: 'Broto', grain: 'Grão', wheat: 'Espiga',
  bread: 'Pão', croissant: 'Croissant', cake: 'Bolo', star: 'Estrela', heart: 'Coração', chef: 'Chef',
}

const TABS: { id: Tab; label: string; Icon: typeof Info }[] = [
  { id: 'info',     label: 'Informações', Icon: Info   },
  { id: 'conteudo', label: 'Conteúdo',    Icon: Layers },
]

const ADD_KINDS: { id: AddKind; label: string; Icon: typeof FileText; hint: string }[] = [
  { id: 'texto',    label: 'Texto',       Icon: FileText,      hint: 'Slide com título e parágrafos' },
  { id: 'destaque', label: 'Destaque',    Icon: Sparkles,      hint: 'Texto com frase em destaque' },
  { id: 'lis',      label: 'Fala da Lis', Icon: MessageSquare, hint: 'A Lis narra este conteúdo' },
  { id: 'enquete',  label: 'Enquete',     Icon: BarChart3,     hint: 'Pergunta de opinião, sem certo/errado' },
]

const READONLY_SLIDE: Record<string, { Icon: typeof Film; label: string; hint: string }> = {
  video:      { Icon: Film,          label: 'Vídeo da Lis', hint: 'Configurado na aba Vídeo' },
  quiz:       { Icon: HelpCircle,    label: 'Quiz',         hint: 'Configurado na aba Quiz'  },
  summary:    { Icon: ClipboardList, label: 'Resumo',       hint: 'Slide de recapitulação'   },
  completion: { Icon: Flag,          label: 'Conclusão',    hint: 'Slide final do módulo'    },
}

// ── helpers ───────────────────────────────────────────────────────────────────
function slideTypeInfo(s: Story) {
  if (s.type === 'lis') return { label: 'Fala da Lis', Icon: MessageSquare }
  if (s.type === 'poll') return { label: 'Enquete', Icon: BarChart3 }
  if (s.type === 'video') return { label: 'Vídeo', Icon: Film }
  if (s.type === 'quiz') return { label: 'Quiz', Icon: HelpCircle }
  if (s.type === 'text' && s.highlight !== undefined)
    return { label: 'Destaque', Icon: Sparkles }
  return { label: 'Texto', Icon: FileText }
}

function slidePreview(s: Story): string {
  if (s.type === 'text') return s.title || '(sem título)'
  if (s.type === 'lis')  return s.text ? s.text.slice(0, 80) + (s.text.length > 80 ? '…' : '') : '(sem texto)'
  if (s.type === 'poll') return s.question || '(sem pergunta)'
  if (s.type === 'video') return s.title || 'Vídeo'
  if (s.type === 'quiz') return `${s.questions.length} pergunta${s.questions.length === 1 ? '' : 's'}`
  return ''
}

/** Tipos com editor inline na timeline (vídeo e quiz agora são blocos). */
function inlineEditable(s: Story): boolean {
  return s.type === 'text' || s.type === 'lis' || s.type === 'poll' || s.type === 'video' || s.type === 'quiz'
}

// ── componente principal ──────────────────────────────────────────────────────
export default function AdminModuloEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getModule, saveModule } = useAdminStore()
  const original = getModule(id ?? '')

  const [mod,       setMod]       = useState<Module | null>(original ?? null)
  const [tab,       setTab]       = useState<Tab>('info')
  const [sel,       setSel]       = useState(0)
  const [iconsOpen, setIconsOpen] = useState(false)

  // IDs estáveis por referência de objeto para o Reorder funcionar corretamente
  const storyIds = useRef(new WeakMap<Story, string>())
  const storyId  = (s: Story) => {
    if (!storyIds.current.has(s)) storyIds.current.set(s, Math.random().toString(36).slice(2))
    return storyIds.current.get(s)!
  }

  const videoIdx = useMemo(() => (mod ? firstVideoIndex(mod.stories) : -1), [mod])
  const quizIdx  = useMemo(() => (mod ? firstQuizIndex(mod.stories)  : -1), [mod])

  // ── módulo não encontrado ───────────────────────────────────────────────────
  if (!mod) {
    return (
      <>
        <Link
          to="/admin/modulos"
          className="mb-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--ink)]"
        >
          <ArrowLeft size={15} /> Módulos
        </Link>
        <div className="adm-card">
          <EmptyState
            icon={Layers}
            title="Módulo não encontrado"
            hint="O módulo que você tentou abrir não existe mais ou o link está incorreto."
            action={
              <Link to="/admin/modulos" className="adm-btn adm-btn--primary no-underline">
                <ArrowLeft size={16} /> Voltar para módulos
              </Link>
            }
          />
        </div>
      </>
    )
  }

  // ── mutadores ───────────────────────────────────────────────────────────────
  const setStories = (fn: (s: Story[]) => Story[]) =>
    setMod((m) => m ? { ...m, stories: fn(m.stories) } : m)

  const updateStory = (i: number, s: Story) =>
    setStories((arr) => arr.map((x, idx) => idx === i ? s : x))

  const deleteStory = (i: number) => {
    setStories((arr) => arr.filter((_, idx) => idx !== i))
    setSel((p) => i < p ? p - 1 : i === p ? Math.max(0, p - 1) : p)
  }

  const moveStory = (i: number, dir: -1 | 1) =>
    setStories((arr) => moveItem(arr, i, i + dir))

  const addSlide = (kind: AddKind = 'texto') => {
    const arr = mod.stories
    const insertAt = (() => {
      const at = arr.findIndex((s) => s.type === 'completion')
      return at >= 0 ? at : arr.length
    })()
    let newStory: Story
    if (kind === 'lis')      newStory = { type: 'lis', state: 'talking', text: 'Escreva aqui o que a Lis vai falar…' }
    else if (kind === 'destaque') newStory = { type: 'text', tag: 'Seção', title: 'Novo slide', paragraphs: ['Texto do slide.'], highlight: 'Frase em destaque.' }
    else if (kind === 'enquete') newStory = newPollStory()
    else if (kind === 'video') newStory = { type: 'video', videoId: `${mod.id}-video`, title: `Vídeo: ${mod.title}`, src: '', duration: '1:30' }
    else if (kind === 'quiz')  newStory = { type: 'quiz', questions: [newQuizQuestion()] }
    else                     newStory = newTextStory()
    setStories((s) => { const n = s.slice(); n.splice(insertAt, 0, newStory); return n })
    setSel(insertAt)
  }

  // vídeo e quiz agora são blocos editáveis na própria timeline (sem abas)
  const video = videoIdx >= 0 ? (mod.stories[videoIdx] as VideoStory) : null
  const quiz = quizIdx >= 0 ? (mod.stories[quizIdx] as QuizStory) : null

  // ── cargos ────────────────────────────────────────────────────────────────
  const isAll = mod.roles === 'all'

  const toggleRole = (r: Role) =>
    setMod((m) => {
      if (!m) return m
      const cur = m.roles === 'all' ? [] : m.roles.slice()
      const i = cur.indexOf(r)
      if (i >= 0) { cur.splice(i, 1) } else { cur.push(r) }
      return { ...m, roles: cur.length ? cur : 'all' }
    })

  // ── preview ───────────────────────────────────────────────────────────────
  const previewStory: Story | null =
    mod.stories[sel] ?? mod.stories.find(isEditableSlide) ?? null
  const previewIndex = previewStory ? mod.stories.indexOf(previewStory) : sel

  // ── salvar / publicar ──────────────────────────────────────────────────────
  const isDraft = (mod.status ?? 'published') === 'draft'
  const saveDraft = () => {
    saveModule({ ...mod, status: 'draft' })
    navigate('/admin/modulos', { state: { savedId: mod.id } })
  }
  const publish = () => {
    saveModule({ ...mod, status: 'published', active: true })
    navigate('/admin/modulos', { state: { savedId: mod.id } })
  }

  const inactive = mod.active === false
  const slidesCount = mod.stories.length

  return (
    <div className="pb-24">
      {/* breadcrumb */}
      <Link
        to="/admin/modulos"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft size={15} /> Módulos
      </Link>

      <AdminPageHeader
        eyebrow="Conteúdo"
        title={mod.title}
        description={mod.subtitle || `Módulo #${mod.number} · ${mod.estimatedMinutes} min`}
        action={
          <div className="flex items-center gap-2.5">
            {/* chips de status */}
            <div className="hidden items-center gap-2 sm:flex">
              <span className="adm-badge adm-badge--muted">{slidesCount} {slidesCount === 1 ? 'bloco' : 'blocos'}</span>
              {isDraft
                ? <span className="adm-badge adm-badge--gold">Rascunho</span>
                : <span className="adm-badge adm-badge--green">Publicado</span>}
              {inactive && <span className="adm-badge adm-badge--red">Inativo</span>}
            </div>
            <button onClick={saveDraft} className="adm-btn"><Save size={16} /> Salvar rascunho</button>
            <button onClick={publish} className="adm-btn adm-btn--primary"><Send size={16} strokeWidth={2} /> Publicar</button>
          </div>
        }
      />

      {/* ── abas (segmented control claro) ── */}
      <div role="tablist" aria-label="Seções do módulo" className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ id: tid, label, Icon }) => {
          const active = tab === tid
          return (
            <button
              key={tid}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tid)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[0.8125rem] font-semibold transition-colors ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]'
                  : 'border-[var(--border-strong)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          )
        })}
      </div>

      {/* ── conteúdo das abas + preview ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            >

              {/* ══ INFORMAÇÕES ══════════════════════════════════════════════ */}
              {tab === 'info' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  {/* esquerda: identificação + aparência */}
                  <div className="flex flex-col gap-4">

                    {/* ── título + subtítulo ── */}
                    <div className="adm-card p-5">
                      <SectionHead icon={<Tag size={14} />} label="Identificação" hint="Nome, etiqueta e tempo do módulo." />
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="adm-label" htmlFor="mi-title">Título</label>
                          <input id="mi-title" className="adm-input" value={mod.title}
                            onChange={(e) => setMod({ ...mod, title: e.target.value })} />
                        </div>
                        <div>
                          <label className="adm-label" htmlFor="mi-subtitle">Subtítulo</label>
                          <input id="mi-subtitle" className="adm-input" value={mod.subtitle}
                            onChange={(e) => setMod({ ...mod, subtitle: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="adm-label" htmlFor="mi-tag">Etiqueta</label>
                            <input id="mi-tag" className="adm-input" placeholder="FUNDAMENTOS" value={mod.tag}
                              onChange={(e) => setMod({ ...mod, tag: e.target.value })} />
                          </div>
                          <div>
                            <label className="adm-label" htmlFor="mi-min">Tempo (min)</label>
                            <div className="relative">
                              <input id="mi-min" type="number" min={1} className="adm-input" style={{ paddingRight: 38 }}
                                value={mod.estimatedMinutes}
                                onChange={(e) => setMod({ ...mod, estimatedMinutes: Number(e.target.value) || 1 })} />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
                                min
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── aparência ── */}
                    <div className="adm-card p-5">
                      <SectionHead icon={<Palette size={14} />} label="Aparência" hint="Cor e símbolo que identificam o módulo no app." />

                      {/* ── cor do módulo ── */}
                      <label className="adm-label">Cor do módulo</label>
                      <div className="mb-4 flex items-center gap-3">
                        {/* native color picker */}
                        <label className="relative shrink-0 cursor-pointer" aria-label="Escolher cor do módulo">
                          <input
                            type="color"
                            value={mod.accent ?? '#b8860b'}
                            onChange={(e) => {
                              const c = e.target.value
                              setMod({ ...mod, accent: c, color: c, gradient: [c, mod.gradient[1]] })
                            }}
                            className="pointer-events-none absolute h-0 w-0 opacity-0"
                          />
                          <span
                            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-strong)]"
                            style={{ background: mod.accent ?? '#b8860b' }}
                          >
                            <Palette size={16} color="rgba(255,255,255,0.92)" />
                          </span>
                        </label>
                        <div className="flex-1">
                          <p className="mb-1.5 text-xs text-[var(--text-muted)]">
                            Clique no quadro para escolher qualquer cor
                          </p>
                          {/* cores rápidas */}
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_COLORS.map((c) => {
                              const on = mod.accent === c
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setMod({ ...mod, accent: c, color: c, gradient: [c, mod.gradient[1]] })}
                                  aria-label={`Usar a cor ${c}`}
                                  aria-pressed={on}
                                  className="relative h-6 w-6 shrink-0 rounded-md"
                                  style={{
                                    background: c,
                                    outline: on ? '2px solid var(--ink)' : '1px solid var(--border-strong)',
                                    outlineOffset: 2,
                                  }}
                                >
                                  {on && (
                                    <Check size={11} color="#fff" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* ── símbolo colapsável ── */}
                      <label className="adm-label">Símbolo do módulo</label>
                      <button
                        type="button"
                        onClick={() => setIconsOpen((v) => !v)}
                        aria-expanded={iconsOpen}
                        className={`flex w-full items-center gap-3 rounded-lg border border-[var(--border-strong)] bg-white px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)] ${iconsOpen ? 'mb-2.5' : ''}`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-muted)]">
                          <ModuleIcon type={mod.iconType} size={18} color="var(--brand-brown)" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-[0.8125rem] font-semibold text-[var(--ink)]">{ICON_LABEL[mod.iconType]}</span>
                          <span className="block text-xs text-[var(--text-muted)]">Clique para escolher outro símbolo</span>
                        </span>
                        <ChevronDown size={16} className="shrink-0 text-[var(--text-muted)] transition-transform" style={{ transform: iconsOpen ? 'rotate(180deg)' : 'none' }} />
                      </button>

                      {iconsOpen && (
                        <div className="grid grid-cols-5 gap-2">
                          {ICON_TYPES.map((it) => {
                            const on = mod.iconType === it
                            return (
                              <button
                                key={it}
                                type="button"
                                onClick={() => { setMod({ ...mod, iconType: it }); setIconsOpen(false) }}
                                aria-pressed={on}
                                className={`flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 transition-colors ${
                                  on
                                    ? 'border-[var(--accent)] bg-[var(--accent-tint)]'
                                    : 'border-[var(--border)] bg-white hover:bg-[var(--bg-subtle)]'
                                }`}
                              >
                                <ModuleIcon type={it} size={20} color={on ? 'var(--accent)' : 'var(--text-muted)'} />
                                <span className={`text-[0.6875rem] font-semibold ${on ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`}>
                                  {ICON_LABEL[it]}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* direita: público + visibilidade + seção */}
                  <div className="flex flex-col gap-4">

                    {/* ── cargos ── */}
                    <div className="adm-card p-5">
                      <SectionHead icon={<Users size={14} />} label="Quem vê este módulo" hint="Todos os cargos ou cargos específicos." />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setMod({ ...mod, roles: 'all' })}
                          aria-pressed={isAll}
                          className={`rounded-lg border px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors ${
                            isAll
                              ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]'
                              : 'border-[var(--border-strong)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                          }`}
                        >
                          Todos os cargos
                        </button>
                        {ROLES.map((r) => {
                          const on = !isAll && (mod.roles as Role[]).includes(r)
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => toggleRole(r)}
                              aria-pressed={on}
                              className={`rounded-lg border px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors ${
                                on
                                  ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]'
                                  : 'border-[var(--border-strong)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                              }`}
                            >
                              {r}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* ── visibilidade ── */}
                    <div className="adm-card p-5">
                      <SectionHead icon={<Eye size={14} />} label="Visibilidade" hint="Mostrar ou ocultar o módulo no app." />
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3.5 py-3">
                        <div>
                          <p className="text-[0.8125rem] font-semibold text-[var(--ink)]">Módulo ativo no app</p>
                          <p className="text-xs text-[var(--text-muted)]">Módulos inativos ficam ocultos.</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!inactive}
                          aria-label="Módulo ativo no app"
                          onClick={() => setMod({ ...mod, active: mod.active === false ? undefined : false })}
                          className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                          style={{ background: inactive ? 'var(--border-strong)' : 'var(--accent)' }}
                        >
                          <span
                            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all"
                            style={{ left: inactive ? 4 : 24 }}
                          />
                        </button>
                      </div>

                      {inactive && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#f3d2cd] bg-[var(--danger-bg)] px-3 py-2">
                          <Info size={14} className="shrink-0 text-[var(--danger)]" />
                          <p className="text-xs text-[var(--danger)]">
                            Este módulo está inativo e não aparece para os colaboradores.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ── seção no app ── */}
                    <div className="adm-card p-5">
                      <SectionHead icon={<Layers size={14} />} label="Seção no app" hint="Onde o módulo aparece na trilha do colaborador." />
                      <div className="flex flex-col gap-2">
                        {(['geral', 'cargo', 'final'] as const).map((sec) => {
                          const labels = { geral: 'Para todos', cargo: 'Por cargo', final: 'Para concluir' }
                          const descs  = { geral: 'Obrigatório para todos os cargos', cargo: 'Específico por função', final: 'Penalidades e assinatura' }
                          const on = (mod.section ?? 'geral') === sec
                          return (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => setMod({ ...mod, section: sec })}
                              aria-pressed={on}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                                on
                                  ? 'border-[var(--accent)] bg-[var(--accent-tint)]'
                                  : 'border-[var(--border)] bg-white hover:bg-[var(--bg-subtle)]'
                              }`}
                            >
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ background: on ? 'var(--accent)' : 'var(--border-strong)' }}
                              />
                              <span>
                                <span className={`block text-[0.8125rem] font-semibold ${on ? 'text-[var(--accent-text)]' : 'text-[var(--ink)]'}`}>
                                  {labels[sec]}
                                </span>
                                <span className="block text-xs text-[var(--text-muted)]">{descs[sec]}</span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ SLIDES ═══════════════════════════════════════════════════ */}
              {tab === 'conteudo' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[var(--text-muted)]">
                      {mod.stories.length} bloco{mod.stories.length !== 1 ? 's' : ''} · clique para editar · arraste para reordenar
                    </p>
                    {/* toolbar de adição */}
                    <div className="flex flex-wrap gap-2">
                      {ADD_KINDS.map(({ id: kid, label, Icon, hint }) => (
                        <button
                          key={kid}
                          type="button"
                          title={hint}
                          onClick={() => addSlide(kid)}
                          className="flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]"
                        >
                          <Icon size={14} /> <Plus size={12} /> {label}
                        </button>
                      ))}
                      {!video && (
                        <button type="button" title="Vídeo da Lis" onClick={() => addSlide('video')}
                          className="flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]">
                          <VideoIcon size={14} /> <Plus size={12} /> Vídeo
                        </button>
                      )}
                      {!quiz && (
                        <button type="button" title="Quiz do módulo" onClick={() => addSlide('quiz')}
                          className="flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]">
                          <HelpCircle size={14} /> <Plus size={12} /> Quiz
                        </button>
                      )}
                    </div>
                  </div>

                  <Reorder.Group
                    axis="y"
                    values={mod.stories}
                    onReorder={(newOrder) => {
                      const selStory = mod.stories[sel]
                      const newSel = newOrder.findIndex((s) => s === selStory)
                      if (newSel >= 0) setSel(newSel)
                      setStories(() => newOrder)
                    }}
                    className="m-0 flex list-none flex-col gap-2 p-0"
                  >
                    {mod.stories.map((s, i) => {
                      if (inlineEditable(s)) {
                        const isExpanded = i === sel
                        const info = slideTypeInfo(s)
                        const TypeIcon = info.Icon

                        if (isExpanded) {
                          // Não usa Reorder.Item: o objeto muda a cada tecla e quebraria o WeakMap→key→foco
                          return (
                            <div key={`expanded-${i}`} className="list-none">
                              <div className="overflow-hidden rounded-xl border-2 border-[var(--accent)] bg-white">
                                {s.type === 'poll' ? (
                                  <PollSlideEditor story={s} index={i} total={mod.stories.length}
                                    onChange={(ns) => updateStory(i, ns)} onDelete={() => deleteStory(i)} onMove={(dir) => moveStory(i, dir)} />
                                ) : s.type === 'video' ? (
                                  <VideoBlockEditor story={s} index={i} total={mod.stories.length}
                                    onChange={(ns) => updateStory(i, ns)} onDelete={() => deleteStory(i)} onMove={(dir) => moveStory(i, dir)} />
                                ) : s.type === 'quiz' ? (
                                  <QuizBlockEditor story={s} index={i} total={mod.stories.length}
                                    onChange={(ns) => updateStory(i, ns)} onDelete={() => deleteStory(i)} onMove={(dir) => moveStory(i, dir)} />
                                ) : (
                                  <SlideEditor story={s} index={i} total={mod.stories.length}
                                    onChange={(ns) => updateStory(i, ns)} onDelete={() => deleteStory(i)} onMove={(dir) => moveStory(i, dir)} />
                                )}
                              </div>
                            </div>
                          )
                        }

                        return (
                          <Reorder.Item key={storyId(s)} value={s} className="list-none">
                            <motion.div
                              layout
                              onClick={() => setSel(i)}
                              whileHover={{ scale: 1.003 }}
                              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[var(--border-strong)] bg-white px-3.5 py-3 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]"
                            >
                              {/* alça de arrasto */}
                              <span
                                className="flex shrink-0 cursor-grab items-center text-[var(--text-disabled)]"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                aria-hidden
                              >
                                <GripVertical size={16} />
                              </span>
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                                <TypeIcon size={15} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="mb-0.5 flex items-center gap-2">
                                  <span className="adm-eyebrow">Bloco {i + 1}</span>
                                  <span className="adm-badge adm-badge--muted">{info.label}</span>
                                </div>
                                <p className="truncate text-[0.875rem] font-semibold text-[var(--ink)]">
                                  {slidePreview(s)}
                                </p>
                              </div>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => deleteStory(i)}
                                  aria-label={`Excluir bloco ${i + 1}`}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </motion.div>
                          </Reorder.Item>
                        )
                      }

                      /* slide não editável (vídeo, quiz, completion) */
                      const meta = READONLY_SLIDE[s.type] ?? READONLY_SLIDE['completion']
                      const SlideIcon = meta.Icon
                      const deletable = s.type === 'summary'

                      return (
                        <Reorder.Item key={storyId(s)} value={s} className="list-none">
                          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[var(--brand-brown)] bg-[var(--bg-subtle)] px-3.5 py-3">
                            <span className="flex shrink-0 cursor-grab items-center text-[var(--text-disabled)]" aria-hidden>
                              <GripVertical size={16} />
                            </span>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brown-tint)] text-[var(--brand-brown)]">
                              <SlideIcon size={15} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[0.875rem] font-semibold text-[var(--ink)]">{meta.label}</p>
                              <p className="text-xs text-[var(--text-muted)]">{meta.hint}</p>
                            </div>
                            {deletable && (
                              <button
                                type="button"
                                onClick={() => deleteStory(i)}
                                aria-label="Excluir resumo"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </Reorder.Item>
                      )
                    })}
                  </Reorder.Group>

                  {mod.stories.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-white">
                      <EmptyState
                        icon={Layers}
                        title="Nenhum bloco ainda"
                        hint="Use os botões acima (Texto, Lis, Vídeo, Quiz, Enquete…) para montar o módulo."
                        compact
                      />
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── coluna de preview (StoryPlayer real do app, ao vivo) ── */}
        <div className="sticky top-5 hidden lg:block">
          <ModulePreview module={mod} startIndex={previewIndex} />
        </div>
      </div>
    </div>
  )
}

// ── cabeçalho de bloco (vídeo/quiz inline) ───────────────────────────────────
function BlockHeader({ icon, label, index, total, onDelete, onMove }: {
  icon: React.ReactNode; label: string; index: number; total: number; onDelete: () => void; onMove: (dir: -1 | 1) => void
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-[#f26b2a]">{icon}</span>
        <div>
          <p className="adm-eyebrow">Bloco {index + 1}</p>
          <p className="text-[0.875rem] font-semibold text-[var(--ink)]">{label}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Mover para cima"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] disabled:opacity-30"><ArrowUp size={15} /></button>
        <button type="button" onClick={() => onMove(1)} disabled={index >= total - 1} aria-label="Mover para baixo"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] disabled:opacity-30"><ArrowDown size={15} /></button>
        <button type="button" onClick={onDelete} aria-label="Excluir bloco"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]"><Trash2 size={15} /></button>
      </div>
    </div>
  )
}

function VideoBlockEditor({ story, index, total, onChange, onDelete, onMove }: {
  story: VideoStory; index: number; total: number; onChange: (s: Story) => void; onDelete: () => void; onMove: (dir: -1 | 1) => void
}) {
  const set = (patch: Partial<VideoStory>) => onChange({ ...story, ...patch })
  return (
    <div className="p-4">
      <BlockHeader icon={<Film size={15} />} label="Vídeo" index={index} total={total} onDelete={onDelete} onMove={onMove} />
      <p className="mb-3 text-[0.78rem] text-[var(--text-muted)]">Vídeo curto narrado pela Lis. A posição é a do bloco na timeline (arraste para mover).</p>
      <VideoUpload currentSrc={story.src ?? ''} onFile={(f) => set({ src: `/videos/${f}` })} onClear={() => set({ src: '' })} />
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="adm-label">Título do vídeo</span>
          <input className="adm-input" value={story.title} onChange={(e) => set({ title: e.target.value })} />
          <span className="mt-1 block text-[0.72rem] text-[var(--text-muted)]">Aparece no player do app.</span>
        </label>
        <label className="block">
          <span className="adm-label">Duração</span>
          <input className="adm-input" placeholder="2:10" value={story.duration ?? ''} onChange={(e) => set({ duration: e.target.value })} />
          <span className="mt-1 block text-[0.72rem] text-[var(--text-muted)]">Ex.: 1:30 — detecção automática chega na próxima fase.</span>
        </label>
      </div>
    </div>
  )
}

function QuizBlockEditor({ story, index, total, onChange, onDelete, onMove }: {
  story: QuizStory; index: number; total: number; onChange: (s: Story) => void; onDelete: () => void; onMove: (dir: -1 | 1) => void
}) {
  return (
    <div className="p-4">
      <BlockHeader icon={<HelpCircle size={15} />} label="Quiz" index={index} total={total} onDelete={onDelete} onMove={onMove} />
      <QuizEditor questions={story.questions} sampleSize={story.sampleSize} randomize={story.randomize} intro={story.intro}
        onChange={(qs) => onChange({ ...story, questions: qs })}
        onConfigChange={(patch) => onChange({ ...story, ...patch })} />
    </div>
  )
}

// ── upload de vídeo ──────────────────────────────────────────────────────────
function VideoUpload({ currentSrc, onFile, onClear }: {
  currentSrc: string
  onFile: (filename: string) => void
  onClear: () => void
}) {
  const filename = currentSrc.replace('/videos/', '')
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) return
    onFile(file.name)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (filename) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brown-tint)] text-[var(--brand-brown)]">
          <FileVideo size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8125rem] font-semibold text-[var(--ink)]">{filename}</p>
          <p className="text-xs text-[var(--text-muted)]">
            Coloque em <code className="rounded bg-[var(--bg-muted)] px-1 font-mono text-[var(--text-secondary)]">/public/videos/</code>
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Remover arquivo de vídeo"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]"
        >
          <XIcon size={14} />
        </button>
      </div>
    )
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors"
      style={{
        borderColor: dragging ? 'var(--accent)' : 'var(--border-strong)',
        background: dragging ? 'var(--accent-tint)' : 'var(--bg-subtle)',
      }}
    >
      <input type="file" accept="video/*" className="hidden" onChange={onInputChange} />
      <span
        className="flex items-center justify-center rounded-xl"
        style={{
          width: 52, height: 52,
          background: dragging ? 'var(--accent-tint)' : 'var(--bg-muted)',
        }}
      >
        <UploadCloud size={22} color={dragging ? 'var(--accent)' : 'var(--text-muted)'} />
      </span>
      <div>
        <p className="text-[0.875rem] font-semibold text-[var(--ink)]">Arraste o vídeo aqui</p>
        <p className="mb-2 text-xs text-[var(--text-muted)]">ou clique para selecionar um arquivo</p>
        <span className="adm-badge adm-badge--muted">MP4 · WebM · MOV</span>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Por enquanto, copie o arquivo para <code className="font-mono text-[var(--text-secondary)]">/public/videos/</code> · upload direto chega na próxima fase.
      </p>
    </label>
  )
}

// ── auxiliares ────────────────────────────────────────────────────────────────
function SectionHead({ icon, label, hint }: { icon: React.ReactNode; label: string; hint?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-[var(--accent-text)]">
          {icon}
        </span>
        <span className="adm-eyebrow">{label}</span>
      </div>
      {hint && <p className="mt-1.5 text-[0.75rem] text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}
