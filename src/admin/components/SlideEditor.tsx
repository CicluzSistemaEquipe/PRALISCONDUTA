import { useRef, useState } from 'react'
import { Trash2, ChevronUp, ChevronDown, FileText, MessageSquare, Sparkles, Info, Music, X } from 'lucide-react'
import type { Story } from '@/lib/types'
import { setSlideKind, slideKind, type SlideKind } from '../lib/modules'
import { fileToAudioDataURL } from '@/lib/audio'

// Tom discreto por tipo de slide (sem cores arco-iris): neutro / laranja / marrom.
const KINDS: { id: SlideKind; label: string; Icon: typeof FileText; hint: string; color: string }[] = [
  { id: 'texto',    label: 'Texto',       Icon: FileText,      hint: 'Slide com titulo e paragrafos',     color: '#8a837c' },
  { id: 'destaque', label: 'Destaque',    Icon: Sparkles,      hint: 'Texto com frase em destaque visual', color: '#f26b2a' },
  { id: 'citacao',  label: 'Fala da Lis', Icon: MessageSquare, hint: 'A Lis narra este texto em voz',       color: '#5e3731' },
]

/** Rotulo de campo + texto auxiliar abaixo. */
function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="adm-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-[0.72rem] text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}

export function SlideEditor({
  story,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  story: Story
  index: number
  total: number
  onChange: (s: Story) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const kind        = slideKind(story)
  const currentKind = KINDS.find((k) => k.id === kind)!
  const KindIcon    = currentKind.Icon
  const color       = currentKind.color

  const audioRef = useRef<HTMLInputElement>(null)
  const [audioBusy, setAudioBusy] = useState(false)
  const [audioErr, setAudioErr] = useState('')
  const handleAudio = async (file?: File) => {
    if (!file || story.type !== 'lis') return
    setAudioErr(''); setAudioBusy(true)
    try {
      const res = await fileToAudioDataURL(file)
      onChange({ ...story, audioSrc: res.dataUrl })
    } catch (e) {
      setAudioErr(e instanceof Error ? e.message : 'Falha ao anexar o áudio.')
    } finally {
      setAudioBusy(false)
      if (audioRef.current) audioRef.current.value = ''
    }
  }

  return (
    <div className="bg-white">

      {/* faixa fina com a cor do tipo */}
      <div style={{ height: 3, background: color }} aria-hidden />

      {/* ── header ── */}
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}1f`, color }}>
          <KindIcon size={15} />
        </div>

        <div className="flex flex-1 items-center gap-2">
          <span className="adm-eyebrow">Slide {index + 1}</span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.04em]"
            style={{ color, background: `${color}1a`, border: `1px solid ${color}40` }}
          >
            {currentKind.label}
          </span>
        </div>

        {/* ações */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Mover slide para cima"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Mover slide para baixo"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Excluir slide"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">

        {/* ── seletor de tipo (segmented control claro) ── */}
        <div className="mb-1.5 grid grid-cols-3 gap-2">
          {KINDS.map(({ id, label, Icon, hint, color: c }) => {
            const active = kind === id
            return (
              <button
                key={id}
                type="button"
                title={hint}
                onClick={() => onChange(setSlideKind(story, id))}
                aria-pressed={active}
                className="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[0.8125rem] font-semibold transition-colors"
                style={
                  active
                    ? { borderColor: c, background: `${c}14`, color: c }
                    : undefined
                }
              >
                <span className={active ? '' : 'text-[var(--text-secondary)]'}>
                  <Icon size={14} />
                </span>
                <span className={active ? '' : 'text-[var(--text-secondary)]'}>{label}</span>
              </button>
            )
          })}
        </div>
        <p className="mb-5 text-[0.72rem] text-[var(--text-muted)]">{currentKind.hint}.</p>

        {/* ── TIPO: TEXTO ── */}
        {story.type === 'text' && story.highlight === undefined && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <Field label="Etiqueta" hint="Aparece acima do título." htmlFor="se-tag">
                <input id="se-tag" className="adm-input" value={story.tag}
                  onChange={(e) => onChange({ ...story, tag: e.target.value })}
                  placeholder="Ex.: Deveres" />
              </Field>
              <Field label="Título do slide" htmlFor="se-title">
                <input id="se-title" className="adm-input" value={story.title}
                  onChange={(e) => onChange({ ...story, title: e.target.value })} />
              </Field>
            </div>
            <Field label="Conteúdo" hint="Separe cada parágrafo com uma linha em branco." htmlFor="se-content">
              <textarea
                id="se-content"
                rows={5}
                className="adm-input"
                value={story.paragraphs.join('\n\n')}
                onChange={(e) => onChange({ ...story, paragraphs: e.target.value.split(/\n{2,}/) })}
              />
            </Field>
          </div>
        )}

        {/* ── TIPO: DESTAQUE ── */}
        {story.type === 'text' && story.highlight !== undefined && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <Field label="Etiqueta" hint="Aparece acima do título." htmlFor="se-htag">
                <input id="se-htag" className="adm-input" value={story.tag}
                  onChange={(e) => onChange({ ...story, tag: e.target.value })}
                  placeholder="Ex.: Atenção" />
              </Field>
              <Field label="Título" htmlFor="se-htitle">
                <input id="se-htitle" className="adm-input" value={story.title}
                  onChange={(e) => onChange({ ...story, title: e.target.value })} />
              </Field>
            </div>
            <Field label="Conteúdo" hint="Texto de apoio do slide." htmlFor="se-hcontent">
              <textarea
                id="se-hcontent"
                rows={3}
                className="adm-input"
                value={story.paragraphs.join('\n\n')}
                onChange={(e) => onChange({ ...story, paragraphs: e.target.value.split(/\n{2,}/) })}
              />
            </Field>
            <Field label="Frase em destaque" hint="Exibida com destaque visual ao final do slide." htmlFor="se-highlight">
              <div className="relative">
                <Sparkles size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color }} />
                <input
                  id="se-highlight"
                  className="adm-input"
                  style={{ paddingLeft: 36 }}
                  value={story.highlight}
                  onChange={(e) => onChange({ ...story, highlight: e.target.value })}
                  placeholder="Frase exibida em destaque"
                />
              </div>
            </Field>
          </div>
        )}

        {/* ── TIPO: FALA DA LIS ── */}
        {story.type === 'lis' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5 rounded-lg border px-3.5 py-3" style={{ borderColor: `${color}33`, background: `${color}0f` }}>
              <Info size={14} className="mt-0.5 shrink-0" style={{ color }} />
              <p className="text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
                A Lis vai narrar este texto em voz. Escreva de forma natural, como ela falaria — sem listas ou formatação especial.
              </p>
            </div>
            <Field label="Fala da Lis" htmlFor="se-lis">
              <textarea
                id="se-lis"
                rows={5}
                className="adm-input"
                value={story.text}
                onChange={(e) => onChange({ ...story, text: e.target.value })}
                placeholder="Olá! Hoje vamos falar sobre..."
              />
            </Field>

            {/* áudio MP3 opcional — legenda sincroniza com o tempo do áudio */}
            <div>
              <label className="adm-label">Áudio da Lis (MP3, opcional)</label>
              {story.audioSrc ? (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2">
                  <Music size={16} style={{ color }} />
                  <audio src={story.audioSrc} controls className="h-8 min-w-0 flex-1" />
                  <button type="button" onClick={() => onChange({ ...story, audioSrc: undefined })}
                    aria-label="Remover áudio"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => audioRef.current?.click()} disabled={audioBusy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-3 text-[0.85rem] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-60">
                  <Music size={16} /> {audioBusy ? 'Processando...' : 'Anexar MP3'}
                </button>
              )}
              <input ref={audioRef} type="file" accept="audio/mpeg,.mp3" className="hidden" onChange={(e) => handleAudio(e.target.files?.[0])} />
              <p className="mt-1 text-[0.72rem] text-[var(--text-muted)]">A legenda sincroniza com o tempo do áudio. Máx ~1MB — fica salvo no navegador; em produção vai para Storage/CDN.</p>
              {audioErr && <p className="mt-1 text-[0.72rem] text-[var(--danger)]">{audioErr}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
