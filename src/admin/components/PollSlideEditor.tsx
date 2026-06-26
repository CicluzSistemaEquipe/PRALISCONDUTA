import { ArrowUp, ArrowDown, Trash2, Plus, X, BarChart3 } from 'lucide-react'
import type { Story } from '@/lib/types'

type PollStory = Extract<Story, { type: 'poll' }>

interface Props {
  story: PollStory
  index: number
  total: number
  onChange: (s: Story) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}

const MAX_OPTIONS = 5
const MIN_OPTIONS = 2

export function PollSlideEditor({ story, index, total, onChange, onDelete, onMove }: Props) {
  const set = (patch: Partial<PollStory>) => onChange({ ...story, ...patch })
  const setOption = (i: number, v: string) => set({ options: story.options.map((o, idx) => (idx === i ? v : o)) })
  const addOption = () => story.options.length < MAX_OPTIONS && set({ options: [...story.options, `Opção ${story.options.length + 1}`] })
  const removeOption = (i: number) => story.options.length > MIN_OPTIONS && set({ options: story.options.filter((_, idx) => idx !== i) })

  return (
    <div className="p-4">
      {/* cabeçalho */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-tint)] text-[#f26b2a]"><BarChart3 size={15} /></span>
          <div>
            <p className="adm-eyebrow">Slide {index + 1}</p>
            <p className="text-[0.875rem] font-semibold text-[var(--ink)]">Enquete</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Mover para cima"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] disabled:opacity-30"><ArrowUp size={15} /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index >= total - 1} aria-label="Mover para baixo"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] disabled:opacity-30"><ArrowDown size={15} /></button>
          <button type="button" onClick={onDelete} aria-label="Excluir enquete"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]"><Trash2 size={15} /></button>
        </div>
      </div>

      {/* pergunta */}
      <label className="block">
        <span className="adm-label">Pergunta</span>
        <textarea className="adm-input" rows={2} value={story.question}
          onChange={(e) => set({ question: e.target.value })} placeholder="O que você quer perguntar?" />
      </label>

      {/* opções */}
      <div className="mt-3">
        <span className="adm-label">Opções de resposta</span>
        <div className="flex flex-col gap-2">
          {story.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--bg-muted)] text-[0.7rem] font-bold text-[var(--text-muted)]">{i + 1}</span>
              <input className="adm-input" value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`Opção ${i + 1}`} />
              <button type="button" onClick={() => removeOption(i)} disabled={story.options.length <= MIN_OPTIONS}
                aria-label={`Remover opção ${i + 1}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] disabled:opacity-30">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
        {story.options.length < MAX_OPTIONS && (
          <button type="button" onClick={addOption}
            className="mt-2 flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border-strong)] px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]">
            <Plus size={14} /> Adicionar opção
          </button>
        )}
      </div>

      {/* múltipla escolha */}
      <label className="mt-3 flex items-center gap-2.5 rounded-lg bg-[var(--bg-subtle)] px-3 py-2.5">
        <input type="checkbox" checked={Boolean(story.allowMultiple)} onChange={(e) => set({ allowMultiple: e.target.checked })}
          className="h-4 w-4 accent-[var(--accent)]" />
        <span className="text-[0.8125rem] text-[var(--text-secondary)]">Permitir selecionar mais de uma opção</span>
      </label>
    </div>
  )
}
