import { Trash2, ChevronUp, ChevronDown, FileText, MessageSquare, Sparkles, Info } from 'lucide-react'
import type { Story } from '@/lib/types'
import { setSlideKind, slideKind, type SlideKind } from '../lib/modules'

// Tom neutro/marrom restrito por tipo de slide (sem cores arco-íris).
const KINDS: { id: SlideKind; label: string; Icon: typeof FileText; hint: string }[] = [
  { id: 'texto',    label: 'Texto',       Icon: FileText,      hint: 'Slide com título e parágrafos' },
  { id: 'destaque', label: 'Destaque',    Icon: Sparkles,      hint: 'Texto com frase em destaque visual' },
  { id: 'citacao',  label: 'Fala da Lis', Icon: MessageSquare, hint: 'A Lis narra este texto em voz' },
]

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

  return (
    <div className="bg-white">

      {/* ── header ── */}
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-[var(--accent-text)]">
          <KindIcon size={14} />
        </div>

        <div className="flex flex-1 items-center gap-2">
          <span className="adm-eyebrow">Slide {index + 1}</span>
          <span className="adm-badge adm-badge--muted">{currentKind.label}</span>
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
        <div className="mb-5 grid grid-cols-3 gap-2">
          {KINDS.map(({ id, label, Icon, hint }) => {
            const active = kind === id
            return (
              <button
                key={id}
                type="button"
                title={hint}
                onClick={() => onChange(setSlideKind(story, id))}
                aria-pressed={active}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[0.8125rem] font-semibold transition-colors ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]'
                    : 'border-[var(--border-strong)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            )
          })}
        </div>

        {/* ── TIPO: TEXTO ── */}
        {story.type === 'text' && story.highlight === undefined && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <div>
                <label className="adm-label" htmlFor="se-tag">Etiqueta</label>
                <input id="se-tag" className="adm-input" value={story.tag}
                  onChange={(e) => onChange({ ...story, tag: e.target.value })}
                  placeholder="Ex.: Deveres" />
              </div>
              <div>
                <label className="adm-label" htmlFor="se-title">Título do slide</label>
                <input id="se-title" className="adm-input" value={story.title}
                  onChange={(e) => onChange({ ...story, title: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="adm-label" htmlFor="se-content">Conteúdo</label>
              <p className="mb-2 text-[0.75rem] text-[var(--text-muted)]">
                Separe cada parágrafo com uma linha em branco.
              </p>
              <textarea
                id="se-content"
                rows={5}
                className="adm-input"
                value={story.paragraphs.join('\n\n')}
                onChange={(e) => onChange({ ...story, paragraphs: e.target.value.split(/\n{2,}/) })}
              />
            </div>
          </div>
        )}

        {/* ── TIPO: DESTAQUE ── */}
        {story.type === 'text' && story.highlight !== undefined && (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <div>
                <label className="adm-label" htmlFor="se-htag">Etiqueta</label>
                <input id="se-htag" className="adm-input" value={story.tag}
                  onChange={(e) => onChange({ ...story, tag: e.target.value })}
                  placeholder="Ex.: Atenção" />
              </div>
              <div>
                <label className="adm-label" htmlFor="se-htitle">Título</label>
                <input id="se-htitle" className="adm-input" value={story.title}
                  onChange={(e) => onChange({ ...story, title: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="adm-label" htmlFor="se-hcontent">Conteúdo</label>
              <textarea
                id="se-hcontent"
                rows={3}
                className="adm-input"
                value={story.paragraphs.join('\n\n')}
                onChange={(e) => onChange({ ...story, paragraphs: e.target.value.split(/\n{2,}/) })}
              />
            </div>
            <div>
              <label className="adm-label" htmlFor="se-highlight">Frase em destaque</label>
              <div className="relative">
                <Sparkles size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                <input
                  id="se-highlight"
                  className="adm-input"
                  style={{ paddingLeft: 36 }}
                  value={story.highlight}
                  onChange={(e) => onChange({ ...story, highlight: e.target.value })}
                  placeholder="Frase exibida em destaque visual ao final do slide"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── TIPO: FALA DA LIS ── */}
        {story.type === 'lis' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--accent-tint)] px-3.5 py-3">
              <Info size={14} className="mt-0.5 shrink-0 text-[var(--accent-text)]" />
              <p className="text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
                A Lis vai narrar este texto em voz. Escreva de forma natural, como ela falaria — sem listas ou formatação especial.
              </p>
            </div>
            <div>
              <label className="adm-label" htmlFor="se-lis">Fala da Lis</label>
              <textarea
                id="se-lis"
                rows={5}
                className="adm-input"
                value={story.text}
                onChange={(e) => onChange({ ...story, text: e.target.value })}
                placeholder="Olá! Hoje vamos falar sobre..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
