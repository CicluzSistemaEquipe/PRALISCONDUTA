import { Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import type { Story } from '@/lib/types'
import { setSlideKind, slideKind, SLIDE_KIND_LABEL, type SlideKind } from '../lib/modules'

const KINDS: SlideKind[] = ['texto', 'destaque', 'citacao']

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
  const kind = slideKind(story)

  return (
    <div className="adm-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--cream-muted)]">
          <GripVertical className="h-4 w-4 opacity-50" />
          <span className="text-xs font-bold">Slide {index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="adm-btn px-2 py-1.5" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Mover para cima">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button className="adm-btn px-2 py-1.5" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Mover para baixo">
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="adm-btn adm-btn--danger px-2 py-1.5" onClick={onDelete} aria-label="Excluir slide">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* tipo do slide */}
      <div className="mb-3 flex gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => onChange(setSlideKind(story, k))}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
              kind === k
                ? 'bg-[rgba(184,134,11,0.18)] text-[var(--gold-light)] ring-1 ring-[rgba(184,134,11,0.35)]'
                : 'bg-[rgba(255,245,220,0.04)] text-[var(--cream-muted)]'
            }`}
          >
            {SLIDE_KIND_LABEL[k]}
          </button>
        ))}
      </div>

      {story.type === 'text' && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="adm-label">Etiqueta (tag)</label>
            <input className="adm-input" value={story.tag} onChange={(e) => onChange({ ...story, tag: e.target.value })} placeholder="Ex.: Deveres" />
          </div>
          <div>
            <label className="adm-label">Texto principal (título)</label>
            <input className="adm-input" value={story.title} onChange={(e) => onChange({ ...story, title: e.target.value })} />
          </div>
          <div>
            <label className="adm-label">Texto secundário (parágrafos — separe por linha em branco)</label>
            <textarea
              className="adm-input"
              rows={4}
              value={story.paragraphs.join('\n\n')}
              onChange={(e) => onChange({ ...story, paragraphs: e.target.value.split(/\n{2,}/) })}
            />
          </div>
          {story.highlight !== undefined && (
            <div>
              <label className="adm-label">Frase em destaque</label>
              <input className="adm-input" value={story.highlight} onChange={(e) => onChange({ ...story, highlight: e.target.value })} />
            </div>
          )}
        </div>
      )}

      {story.type === 'lis' && (
        <div>
          <label className="adm-label">Fala da Lis (citação)</label>
          <textarea className="adm-input" rows={3} value={story.text} onChange={(e) => onChange({ ...story, text: e.target.value })} />
        </div>
      )}
    </div>
  )
}
