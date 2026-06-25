import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, Reorder } from 'framer-motion'
import {
  ArrowLeft, Check, Plus, Info, Layers, Video as VideoIcon, HelpCircle,
  Trash2, ChevronDown, Users, Film,
  ClipboardList, Flag, MessageSquare, FileText, Sparkles, Eye,
  Tag, ToggleLeft, Palette, UploadCloud, FileVideo, X as XIcon,
  GripVertical,
} from 'lucide-react'
import { useAdminStore } from '@/lib/adminStore'
import { ROLES, type Module, type Role, type Story } from '@/lib/types'
import { ModulePreview } from '../components/ModulePreview'
import { SlideEditor } from '../components/SlideEditor'
import { QuizEditor } from '../components/QuizEditor'
import { ModuleIcon } from '@/app/components/ModuleIcon'
import {
  isEditableSlide, newTextStory, newQuizQuestion,
  firstQuizIndex, firstVideoIndex, moveItem,
} from '../lib/modules'

type Tab     = 'info' | 'conteudo' | 'video' | 'quiz'
type AddKind = 'texto' | 'destaque' | 'lis'
type VideoStory = Extract<Story, { type: 'video' }>
type QuizStory  = Extract<Story, { type: 'quiz' }>

// ── paleta + ícones ───────────────────────────────────────────────────────────
const QUICK_COLORS = ['#b8860b','#d4a017','#f37435','#c0392b','#27ae60','#2980b9','#8e44ad','#5e3731']

const ICON_TYPES: Module['iconType'][] = ['flower','sprout','grain','wheat','bread','croissant','cake','star','heart','chef']
const ICON_LABEL: Record<Module['iconType'], string> = {
  flower: 'Flor', sprout: 'Broto', grain: 'Grão', wheat: 'Espiga',
  bread: 'Pão', croissant: 'Croissant', cake: 'Bolo', star: 'Estrela', heart: 'Coração', chef: 'Chef',
}

const TABS: { id: Tab; label: string; Icon: typeof Info }[] = [
  { id: 'info',     label: 'Informações', Icon: Info       },
  { id: 'conteudo', label: 'Slides',      Icon: Layers     },
  { id: 'video',    label: 'Vídeo',       Icon: VideoIcon  },
  { id: 'quiz',     label: 'Quiz',        Icon: HelpCircle },
]

const ADD_KINDS: { id: AddKind; label: string; Icon: typeof FileText; hint: string }[] = [
  { id: 'texto',    label: 'Texto',       Icon: FileText,      hint: 'Slide com título e parágrafos' },
  { id: 'destaque', label: 'Destaque',    Icon: Sparkles,      hint: 'Texto com frase em destaque' },
  { id: 'lis',      label: 'Fala da Lis', Icon: MessageSquare, hint: 'A Lis narra este conteúdo' },
]

const READONLY_SLIDE: Record<string, { Icon: typeof Film; label: string; hint: string; accent: string }> = {
  video:      { Icon: Film,          label: 'Vídeo da Lis', hint: 'Configurado na aba Vídeo',  accent: '#2980b9' },
  quiz:       { Icon: HelpCircle,    label: 'Quiz',         hint: 'Configurado na aba Quiz',   accent: '#f37435' },
  summary:    { Icon: ClipboardList, label: 'Resumo',       hint: 'Slide de recapitulação',    accent: '#b8860b' },
  completion: { Icon: Flag,          label: 'Conclusão',    hint: 'Slide final do módulo',     accent: '#5dd87a' },
}

// ── helpers ───────────────────────────────────────────────────────────────────
function slideTypeInfo(s: Story) {
  if (s.type === 'lis') return { label: 'Fala da Lis', Icon: MessageSquare, color: '#f37435' }
  if (s.type === 'text' && s.highlight !== undefined)
    return { label: 'Destaque', Icon: Sparkles, color: '#b8860b' }
  return { label: 'Texto', Icon: FileText, color: 'rgba(232,207,160,0.8)' }
}

function slidePreview(s: Story): string {
  if (s.type === 'text') return s.title || '(sem título)'
  if (s.type === 'lis')  return s.text ? s.text.slice(0, 80) + (s.text.length > 80 ? '…' : '') : '(sem texto)'
  return ''
}

// ── estilos base ──────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(22,10,2,0.85)',
  border: '1px solid rgba(232,207,160,0.1)',
  borderRadius: 18,
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(232,207,160,0.15)', borderRadius: 11,
  padding: '10px 13px', color: '#fff', outline: 'none',
  fontFamily: 'Montserrat, sans-serif', fontSize: 13,
  boxSizing: 'border-box' as const,
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900,
  letterSpacing: '0.14em', textTransform: 'uppercase' as const,
  color: 'rgba(232,207,160,0.45)', display: 'block', marginBottom: 7,
}

// ── componente principal ──────────────────────────────────────────────────────
export default function AdminModuloEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getModule, saveModule } = useAdminStore()
  const original = getModule(id ?? '')

  const [mod,        setMod]        = useState<Module | null>(original ?? null)
  const [tab,        setTab]        = useState<Tab>('info')
  const [sel,        setSel]        = useState(0)
  const [toast]                     = useState(false)
  const [iconsOpen,  setIconsOpen]  = useState(false)

  // IDs estáveis por referência de objeto para o Reorder funcionar corretamente
  const storyIds = useRef(new WeakMap<Story, string>())
  const storyId  = (s: Story) => {
    if (!storyIds.current.has(s)) storyIds.current.set(s, Math.random().toString(36).slice(2))
    return storyIds.current.get(s)!
  }

  const videoIdx = useMemo(() => (mod ? firstVideoIndex(mod.stories) : -1), [mod])
  const quizIdx  = useMemo(() => (mod ? firstQuizIndex(mod.stories)  : -1), [mod])

  if (!mod) {
    return (
      <div>
        <Link to="/admin/modulos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(232,207,160,0.5)', fontFamily: 'Montserrat, sans-serif', fontSize: 13, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Módulos
        </Link>
        <p style={{ marginTop: 20, color: 'rgba(232,207,160,0.5)', fontFamily: 'Montserrat, sans-serif' }}>Módulo não encontrado.</p>
      </div>
    )
  }

  // ── mutadores ─────────────────────────────────────────────────────────────
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
    else                     newStory = newTextStory()
    setStories((s) => { const n = s.slice(); n.splice(insertAt, 0, newStory); return n })
    setSel(insertAt)
  }

  // ── vídeo ─────────────────────────────────────────────────────────────────
  const video = videoIdx >= 0 ? (mod.stories[videoIdx] as VideoStory) : null

  const addVideo = () =>
    setStories((arr) => {
      const next = arr.slice()
      const at = next[0]?.type === 'lis' ? 1 : 0
      next.splice(at, 0, { type: 'video', videoId: `${mod.id}-video`, title: `Vídeo: ${mod.title}`, src: '', duration: '1:30' })
      return next
    })

  // "depois" quando o vídeo aparece após o último slide de texto/lis
  const videoPosition: 'antes' | 'depois' = useMemo(() => {
    if (videoIdx < 0 || !mod) return 'antes'
    const lastSlideIdx = mod.stories.reduce<number>((acc, s, i) => {
      if (i !== videoIdx && (s.type === 'text' || s.type === 'lis')) return i
      return acc
    }, -1)
    if (lastSlideIdx < 0) return 'antes'
    return videoIdx > lastSlideIdx ? 'depois' : 'antes'
  }, [videoIdx, mod])

  const setVideoPosition = (pos: 'antes' | 'depois') =>
    setStories((arr) => {
      if (videoIdx < 0) return arr
      const vid = arr[videoIdx]
      const rest = arr.filter((_, i) => i !== videoIdx)
      if (pos === 'antes') {
        rest.splice(rest[0]?.type === 'lis' ? 1 : 0, 0, vid)
      } else {
        const q = rest.findIndex((s) => s.type === 'quiz')
        const c = rest.findIndex((s) => s.type === 'completion')
        rest.splice(q >= 0 ? q : c >= 0 ? c : rest.length, 0, vid)
      }
      return rest
    })

  // ── quiz ──────────────────────────────────────────────────────────────────
  const quiz = quizIdx >= 0 ? (mod.stories[quizIdx] as QuizStory) : null

  const addQuiz = () =>
    setStories((arr) => {
      const at = arr.findIndex((s) => s.type === 'completion')
      const next = arr.slice()
      next.splice(at >= 0 ? at : next.length, 0, { type: 'quiz', questions: [newQuizQuestion()] })
      return next
    })

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
    tab === 'video' ? video :
    tab === 'quiz'  ? quiz  :
    mod.stories[sel] ?? mod.stories.find(isEditableSlide) ?? null

  // ── salvar ────────────────────────────────────────────────────────────────
  const save = () => {
    saveModule(mod)
    navigate('/admin/modulos', { state: { savedId: mod.id } })
  }

  const inactive = mod.active === false
  const accent   = mod.accent ?? '#b8860b'
  const slidesCount = mod.stories.filter((s) => s.type === 'text' || s.type === 'lis').length

  return (
    <div style={{ paddingBottom: 48 }}>

      {/* breadcrumb */}
      <Link to="/admin/modulos" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20,
        color: 'rgba(232,207,160,0.45)', fontFamily: 'Montserrat, sans-serif', fontSize: 12,
        fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s',
      }}>
        <ArrowLeft size={14} /> Módulos
      </Link>

      {/* ── header do módulo ── */}
      <div style={{
        ...card, marginBottom: 24,
        borderColor: `${accent}35`,
        background: `linear-gradient(135deg, rgba(22,10,2,0.97) 0%, rgba(28,14,0,0.97) 100%)`,
        overflow: 'hidden',
      }}>
        {/* faixa colorida no topo */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, #f37435 60%, transparent)` }} />

        <div style={{ padding: '18px 22px 20px', display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          {/* ícone */}
          <div style={{
            width: 60, height: 60, borderRadius: 18, flexShrink: 0,
            background: `linear-gradient(140deg, ${mod.gradient[0]}, ${mod.gradient[1]})`,
            boxShadow: `0 6px 24px ${accent}45`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            <ModuleIcon type={mod.iconType} size={22} color="#fff" />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>
              {mod.number}
            </span>
          </div>

          {/* info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: accent, marginBottom: 4, textTransform: 'uppercase' as const }}>
              {mod.tag || 'Módulo'}
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#fff', lineHeight: 1.15, marginBottom: 4 }}>
              {mod.title}
            </h1>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {mod.subtitle}
            </p>

            {/* chips de conteúdo */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' as const }}>
              <span style={{
                fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
                background: 'rgba(232,207,160,0.06)', border: '1px solid rgba(232,207,160,0.14)',
                borderRadius: 7, padding: '3px 10px', color: 'rgba(232,207,160,0.55)',
              }}>
                {slidesCount} {slidesCount === 1 ? 'slide' : 'slides'}
              </span>
              {video && (
                <span style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
                  background: 'rgba(41,128,185,0.1)', border: '1px solid rgba(41,128,185,0.28)',
                  borderRadius: 7, padding: '3px 10px', color: '#60a5fa',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <VideoIcon size={10} /> Vídeo
                </span>
              )}
              {quiz && (
                <span style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
                  background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.28)',
                  borderRadius: 7, padding: '3px 10px', color: '#a78bfa',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <HelpCircle size={10} /> Quiz
                </span>
              )}
              {inactive && (
                <span style={{
                  fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
                  borderRadius: 7, padding: '3px 10px', color: '#f87171',
                }}>
                  Inativo
                </span>
              )}
            </div>
          </div>

          {/* botão salvar */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <button onClick={save} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 14, cursor: 'pointer', border: 'none',
              background: 'linear-gradient(135deg, #f37435 0%, #b8860b 100%)',
              fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 800, color: '#fff',
              boxShadow: `0 4px 20px ${accent}50`,
              whiteSpace: 'nowrap' as const,
            }}>
              <Check size={15} /> Salvar módulo
            </button>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.3)', textAlign: 'right' as const }}>
              Módulo #{mod.number} · {mod.estimatedMinutes} min
            </p>
          </div>
        </div>
      </div>

      {/* ── abas ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' as const }}>
        {TABS.map(({ id: tid, label, Icon }) => {
          const active = tab === tid
          return (
            <button
              key={tid}
              onClick={() => setTab(tid)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 12, cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700,
                transition: 'all 0.18s',
                background: active ? `${accent}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? `${accent}50` : 'rgba(232,207,160,0.1)'}`,
                color: active ? accent : 'rgba(232,207,160,0.45)',
              }}
            >
              <Icon size={13} /> {label}
            </button>
          )
        })}
      </div>

      {/* ── conteúdo das abas + preview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>

        <div style={{ minWidth: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
          >

            {/* ══ INFORMAÇÕES ══════════════════════════════════════════════ */}
            {tab === 'info' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* esquerda: identificação */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* ── título + subtítulo ── */}
                  <div style={{ ...card, padding: '18px 18px 16px' }}>
                    <SectionHead icon={<Tag size={12} />} label="Identificação" accent={accent} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Título</label>
                        <input style={inputStyle} value={mod.title}
                          onChange={(e) => setMod({ ...mod, title: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Subtítulo</label>
                        <input style={inputStyle} value={mod.subtitle}
                          onChange={(e) => setMod({ ...mod, subtitle: e.target.value })} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={labelStyle}>Etiqueta</label>
                          <input style={inputStyle} placeholder="FUNDAMENTOS" value={mod.tag}
                            onChange={(e) => setMod({ ...mod, tag: e.target.value })} />
                        </div>
                        <div>
                          <label style={labelStyle}>Tempo (min)</label>
                          <div style={{ position: 'relative' }}>
                            <input type="number" min={1} style={{ ...inputStyle, paddingRight: 36 }}
                              value={mod.estimatedMinutes}
                              onChange={(e) => setMod({ ...mod, estimatedMinutes: Number(e.target.value) || 1 })} />
                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.4)', pointerEvents: 'none' }}>
                              min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── aparência ── */}
                  <div style={{ ...card, padding: '18px 18px 16px' }}>
                    <SectionHead icon={<Palette size={12} />} label="Aparência" accent={accent} />

                    {/* ── cor RGB ── */}
                    <label style={labelStyle}>Cor do módulo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      {/* native color picker */}
                      <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={mod.accent ?? '#b8860b'}
                          onChange={(e) => {
                            const c = e.target.value
                            setMod({ ...mod, accent: c, color: c, gradient: [c, mod.gradient[1]] })
                          }}
                          style={{ opacity: 0, position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
                        />
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, cursor: 'pointer',
                          background: mod.accent ?? '#b8860b',
                          border: '2px solid rgba(255,255,255,0.18)',
                          boxShadow: `0 2px 10px ${mod.accent ?? '#b8860b'}55`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Palette size={16} color="rgba(255,255,255,0.7)" />
                        </div>
                      </label>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.5)', marginBottom: 5 }}>
                          Clique para escolher qualquer cor
                        </p>
                        {/* cores rápidas */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                          {QUICK_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setMod({ ...mod, accent: c, color: c, gradient: [c, mod.gradient[1]] })}
                              style={{
                                width: 24, height: 24, borderRadius: 7, cursor: 'pointer',
                                background: c, border: 'none', flexShrink: 0, position: 'relative',
                                outline: mod.accent === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                                outlineOffset: 2,
                              }}
                            >
                              {mod.accent === c && (
                                <Check size={11} color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── símbolo colapsável ── */}
                    <label style={{ ...labelStyle, marginTop: 8 }}>Símbolo do módulo</label>
                    <button
                      onClick={() => setIconsOpen((v) => !v)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                        background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}35`,
                        marginBottom: iconsOpen ? 10 : 0, transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${accent}18`, border: `1px solid ${accent}35`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ModuleIcon type={mod.iconType} size={18} color={accent} />
                      </div>
                      <div style={{ flex: 1, textAlign: 'left' as const }}>
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 1 }}>
                          {ICON_LABEL[mod.iconType]}
                        </p>
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.4)' }}>
                          Clique para escolher outro símbolo
                        </p>
                      </div>
                      <ChevronDown size={14} color="rgba(232,207,160,0.4)"
                        style={{ transform: iconsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                      />
                    </button>

                    {iconsOpen && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                        {ICON_TYPES.map((it) => {
                          const active = mod.iconType === it
                          return (
                            <button
                              key={it}
                              onClick={() => { setMod({ ...mod, iconType: it }); setIconsOpen(false) }}
                              style={{
                                padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                background: active ? `${accent}18` : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${active ? `${accent}50` : 'rgba(232,207,160,0.1)'}`,
                                transition: 'all 0.15s',
                              }}
                            >
                              <ModuleIcon type={it} size={20} color={active ? accent : 'rgba(232,207,160,0.4)'} />
                              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 700, color: active ? accent : 'rgba(232,207,160,0.35)' }}>
                                {ICON_LABEL[it]}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* direita: público + visibilidade */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* ── cargos ── */}
                  <div style={{ ...card, padding: '18px 18px 16px' }}>
                    <SectionHead icon={<Users size={12} />} label="Quem vê este módulo" accent={accent} />
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                      <button
                        onClick={() => setMod({ ...mod, roles: 'all' })}
                        style={{
                          padding: '6px 12px', borderRadius: 9, cursor: 'pointer',
                          fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700,
                          background: isAll ? `${accent}18` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isAll ? `${accent}45` : 'rgba(232,207,160,0.1)'}`,
                          color: isAll ? accent : 'rgba(232,207,160,0.45)',
                        }}
                      >
                        Todos os cargos
                      </button>
                      {ROLES.map((r) => {
                        const on = !isAll && (mod.roles as Role[]).includes(r)
                        return (
                          <button key={r} onClick={() => toggleRole(r)} style={{
                            padding: '6px 12px', borderRadius: 9, cursor: 'pointer',
                            fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700,
                            background: on ? `${accent}18` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${on ? `${accent}45` : 'rgba(232,207,160,0.1)'}`,
                            color: on ? accent : 'rgba(232,207,160,0.45)',
                          }}>
                            {r}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── visibilidade ── */}
                  <div style={{ ...card, padding: '18px 18px 16px' }}>
                    <SectionHead icon={<Eye size={12} />} label="Visibilidade" accent={accent} />
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,207,160,0.1)',
                      borderRadius: 12, padding: '12px 14px',
                    }}>
                      <div>
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                          Módulo ativo no app
                        </p>
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.4)' }}>
                          Módulos inativos ficam ocultos.
                        </p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={!inactive}
                        onClick={() => setMod({ ...mod, active: mod.active === false ? undefined : false })}
                        style={{
                          position: 'relative', width: 42, height: 24, borderRadius: 12,
                          border: 'none', cursor: 'pointer', flexShrink: 0,
                          background: inactive ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${accent}, #f37435)`,
                          transition: 'background 0.25s',
                          boxShadow: inactive ? 'none' : `0 2px 10px ${accent}44`,
                        }}
                      >
                        <span style={{
                          position: 'absolute', top: 4, width: 16, height: 16,
                          borderRadius: '50%', background: '#fff',
                          transition: 'left 0.2s', left: inactive ? 4 : 22,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }} />
                      </button>
                    </div>

                    {inactive && (
                      <div style={{
                        marginTop: 12, display: 'flex', gap: 8, alignItems: 'center',
                        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
                        borderRadius: 10, padding: '8px 12px',
                      }}>
                        <ToggleLeft size={13} color="#f87171" />
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: '#f87171' }}>
                          Este módulo está inativo e não aparece para os colaboradores.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── seção no app ── */}
                  <div style={{ ...card, padding: '18px 18px 16px' }}>
                    <SectionHead icon={<Layers size={12} />} label="Seção no app" accent={accent} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(['geral', 'cargo', 'final'] as const).map((sec) => {
                        const labels = { geral: 'Para todos', cargo: 'Por cargo', final: 'Para concluir' }
                        const descs  = { geral: 'Obrigatório para todos os cargos', cargo: 'Específico por função', final: 'Penalidades e assinatura' }
                        const on = (mod.section ?? 'geral') === sec
                        return (
                          <button key={sec} onClick={() => setMod({ ...mod, section: sec })} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                            background: on ? `${accent}14` : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${on ? `${accent}40` : 'rgba(232,207,160,0.08)'}`,
                            transition: 'all 0.15s',
                          }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                              background: on ? accent : 'rgba(232,207,160,0.2)',
                            }} />
                            <div>
                              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: on ? accent : 'rgba(232,207,160,0.55)', marginBottom: 1 }}>
                                {labels[sec]}
                              </p>
                              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.35)' }}>
                                {descs[sec]}
                              </p>
                            </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.4)' }}>
                    {mod.stories.length} slide{mod.stories.length !== 1 ? 's' : ''} · clique para editar
                  </p>
                  {/* toolbar de adição compacta */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {ADD_KINDS.map(({ id: kid, label, hint }) => (
                      <button key={kid} title={hint} onClick={() => addSlide(kid)} style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
                        background: 'rgba(243,116,53,0.1)', border: '1px solid rgba(243,116,53,0.25)',
                        fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: '#f37435',
                      }}>
                        <Plus size={11} /> {label}
                      </button>
                    ))}
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
                  style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}
                >
                {mod.stories.map((s, i) => {
                  if (isEditableSlide(s)) {
                    const isExpanded = i === sel
                    const info = slideTypeInfo(s)
                    const TypeIcon = info.Icon

                    if (isExpanded) {
                      // Não usa Reorder.Item: o objeto muda a cada tecla e quebraria o WeakMap→key→foco
                      return (
                        <div key={`expanded-${i}`} style={{ listStyle: 'none' }}>
                          <div style={{ borderRadius: 18, overflow: 'hidden', border: `2px solid ${accent}50`, boxShadow: `0 6px 24px ${accent}20` }}>
                            <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, #f37435)` }} />
                            <SlideEditor story={s} index={i} total={mod.stories.length}
                              onChange={(ns) => updateStory(i, ns)}
                              onDelete={() => deleteStory(i)}
                              onMove={(dir) => moveStory(i, dir)} />
                          </div>
                        </div>
                      )
                    }

                    return (
                      <Reorder.Item key={storyId(s)} value={s} style={{ listStyle: 'none' }}>
                        <motion.div
                          layout
                          onClick={() => setSel(i)}
                          whileHover={{ scale: 1.003 }}
                          style={{
                            ...card, cursor: 'pointer',
                            borderLeft: `3px solid rgba(184,134,11,0.2)`,
                            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                          }}
                        >
                          {/* alça de arrasto */}
                          <div
                            style={{ cursor: 'grab', color: 'rgba(232,207,160,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', paddingRight: 2 }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical size={15} />
                          </div>
                          <div style={{
                            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                            background: `${info.color}1a`, border: `1px solid ${info.color}38`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <TypeIcon size={14} color={info.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, color: 'rgba(232,207,160,0.35)', letterSpacing: '0.1em' }}>SLIDE {i + 1}</span>
                              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 700, color: info.color, background: `${info.color}18`, borderRadius: 5, padding: '1px 6px' }}>{info.label}</span>
                            </div>
                            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                              {slidePreview(s)}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => deleteStory(i)} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={12} />
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
                    <Reorder.Item key={storyId(s)} value={s} style={{ listStyle: 'none' }}>
                      <div style={{
                        ...card, display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                        borderLeft: `3px solid ${meta.accent}`,
                      }}>
                        <div style={{ cursor: 'grab', color: 'rgba(232,207,160,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', paddingRight: 2 }}>
                          <GripVertical size={15} />
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${meta.accent}18`, border: `1px solid ${meta.accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <SlideIcon size={14} color={meta.accent} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff' }}>{meta.label}</p>
                          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.4)' }}>{meta.hint}</p>
                        </div>
                        {deletable && (
                          <button onClick={() => deleteStory(i)} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </Reorder.Item>
                  )
                })}
                </Reorder.Group>

                {mod.stories.length === 0 && (
                  <div style={{ ...card, padding: '40px 20px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'rgba(232,207,160,0.12)' }}>
                    <Layers size={32} color="rgba(232,207,160,0.15)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(232,207,160,0.4)' }}>
                      Nenhum slide ainda. Clique em "+ Texto" acima para começar.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ══ VÍDEO ════════════════════════════════════════════════════ */}
            {tab === 'video' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {video ? (
                  <>
                    <div style={{ ...card, padding: '18px 18px 16px' }}>
                      <SectionHead icon={<Film size={12} />} label="Arquivo do vídeo" accent={accent} />
                      <VideoUpload
                        currentSrc={video.src ?? ''}
                        onFile={(filename) =>
                          updateStory(videoIdx, { ...video, src: `/videos/${filename}` })
                        }
                        onClear={() =>
                          updateStory(videoIdx, { ...video, src: '' })
                        }
                      />
                    </div>

                    <div style={{ ...card, padding: '18px 18px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Título do vídeo</label>
                        <input style={inputStyle} value={video.title}
                          onChange={(e) => updateStory(videoIdx, { ...video, title: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Duração</label>
                        <input style={inputStyle} placeholder="2:10" value={video.duration ?? ''}
                          onChange={(e) => updateStory(videoIdx, { ...video, duration: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ ...card, padding: '18px 18px 16px' }}>
                      <label style={labelStyle}>Posição no módulo</label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {(['antes', 'depois'] as const).map((pos) => {
                          const on = videoPosition === pos
                          return (
                            <button key={pos} onClick={() => setVideoPosition(pos)} style={{
                              flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                              fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700,
                              background: on ? `${accent}18` : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${on ? `${accent}45` : 'rgba(232,207,160,0.1)'}`,
                              color: on ? accent : 'rgba(232,207,160,0.45)',
                            }}>
                              {pos === 'antes' ? '↑ Antes dos slides' : '↓ Depois dos slides'}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => deleteStory(videoIdx)} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#f87171',
                      }}>
                        <Trash2 size={13} /> Remover vídeo
                      </button>
                    </div>
                  </>
                ) : (
                  <EmptyCard
                    icon={<VideoIcon size={28} color="#2980b9" />}
                    iconBg="rgba(41,128,185,0.12)" iconBorder="rgba(41,128,185,0.25)"
                    title="Nenhum vídeo configurado"
                    desc="Adicione um vídeo da Lis para apresentar o módulo."
                    action={<button onClick={addVideo} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, cursor: 'pointer', background: 'linear-gradient(135deg,#f37435,#b8860b)', border: 'none', fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff' }}><Plus size={13} /> Adicionar vídeo</button>}
                  />
                )}
              </div>
            )}

            {/* ══ QUIZ ═════════════════════════════════════════════════════ */}
            {tab === 'quiz' && (
              quiz ? (
                <QuizEditor
                  questions={quiz.questions}
                  sampleSize={quiz.sampleSize}
                  randomize={quiz.randomize}
                  onChange={(qs) => updateStory(quizIdx, { ...quiz, questions: qs })}
                  onConfigChange={(patch) => updateStory(quizIdx, { ...quiz, ...patch })}
                />
              ) : (
                <EmptyCard
                  icon={<HelpCircle size={28} color="#f37435" />}
                  iconBg="rgba(243,116,53,0.12)" iconBorder="rgba(243,116,53,0.25)"
                  title="Nenhum quiz configurado"
                  desc="Adicione um quiz para testar o aprendizado ao final do módulo."
                  action={<button onClick={addQuiz} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, cursor: 'pointer', background: 'linear-gradient(135deg,#f37435,#b8860b)', border: 'none', fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff' }}><Plus size={13} /> Adicionar quiz</button>}
                />
              )
            )}

          </motion.div>
        </AnimatePresence>
        </div>

        {/* ── coluna de preview ── */}
        <div style={{ position: 'sticky', top: 20 }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', color: 'rgba(232,207,160,0.35)', marginBottom: 10 }}>PRÉ-VISUALIZAÇÃO</p>
          <ModulePreview module={mod} story={previewStory} />
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 60,
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(135deg, rgba(74,222,128,0.18), rgba(22,163,74,0.18))',
              border: '1px solid rgba(74,222,128,0.35)', borderRadius: 14,
              padding: '12px 18px', fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#4ade80',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <Check size={15} /> Módulo salvo com sucesso
          </motion.div>
        )}
      </AnimatePresence>
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
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(41,128,185,0.08)', border: '1px solid rgba(41,128,185,0.25)',
        borderRadius: 12, padding: '14px 16px',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'rgba(41,128,185,0.15)', border: '1px solid rgba(41,128,185,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileVideo size={18} color="#60a5fa" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
            {filename}
          </p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.4)' }}>
            Coloque em <code style={{ color: '#e8c96a', fontFamily: 'monospace', background: 'rgba(184,134,11,0.15)', borderRadius: 4, padding: '0 5px' }}>/public/videos/</code>
          </p>
        </div>
        <button onClick={onClear} style={{
          width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0,
          background: 'rgba(239,68,68,0.1)', color: '#f87171',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <XIcon size={13} />
        </button>
      </div>
    )
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        padding: '32px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
        border: `2px dashed ${dragging ? 'rgba(41,128,185,0.6)' : 'rgba(232,207,160,0.15)'}`,
        background: dragging ? 'rgba(41,128,185,0.07)' : 'rgba(255,255,255,0.02)',
        transition: 'all 0.18s',
      }}
    >
      <input type="file" accept="video/*" style={{ display: 'none' }} onChange={onInputChange} />
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: dragging ? 'rgba(41,128,185,0.2)' : 'rgba(232,207,160,0.06)',
        border: `1px solid ${dragging ? 'rgba(41,128,185,0.4)' : 'rgba(232,207,160,0.12)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s',
      }}>
        <UploadCloud size={22} color={dragging ? '#60a5fa' : 'rgba(232,207,160,0.35)'} />
      </div>
      <div>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          Arraste o vídeo aqui
        </p>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(232,207,160,0.4)', marginBottom: 8 }}>
          ou clique para selecionar um arquivo
        </p>
        <span style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700,
          color: 'rgba(232,207,160,0.35)', background: 'rgba(232,207,160,0.06)',
          border: '1px solid rgba(232,207,160,0.1)', borderRadius: 6, padding: '3px 10px',
        }}>
          MP4 · WebM · MOV
        </span>
      </div>
      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: 'rgba(232,207,160,0.3)' }}>
        Após selecionar, copie o arquivo para <code style={{ color: '#e8c96a', fontFamily: 'monospace' }}>/public/videos/</code>
      </p>
    </label>
  )
}

// ── auxiliares ────────────────────────────────────────────────────────────────
function SectionHead({ icon, label, accent }: { icon: React.ReactNode; label: string; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8,
        background: `${accent}18`, border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent,
      }}>
        {icon}
      </div>
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', color: accent, textTransform: 'uppercase' as const }}>
        {label}
      </span>
    </div>
  )
}

function EmptyCard({ icon, iconBg, iconBorder, title, desc, action }: {
  icon: React.ReactNode; iconBg: string; iconBorder: string
  title: string; desc: string; action: React.ReactNode
}) {
  return (
    <div style={{
      background: 'rgba(22,10,2,0.85)', border: '1px dashed rgba(232,207,160,0.12)',
      borderRadius: 18, padding: '48px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center',
    }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, background: iconBg, border: `1px solid ${iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: '#fff', marginBottom: 4 }}>{title}</p>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(232,207,160,0.4)' }}>{desc}</p>
      </div>
      {action}
    </div>
  )
}
