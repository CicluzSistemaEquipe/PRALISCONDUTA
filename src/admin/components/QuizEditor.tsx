import { Reorder, useDragControls } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Circle, Hash, Shuffle, GripVertical } from 'lucide-react'
import type { QuizQuestion } from '@/lib/types'
import { newQuizQuestion } from '../lib/modules'

function QuestionCard({ q, index, total, onPatch, onDelete, onOption, onOptionExpl, onCorrect }: {
  q: QuizQuestion
  index: number
  total: number
  onPatch: (patch: Partial<QuizQuestion>) => void
  onDelete: () => void
  onOption: (oi: number, value: string) => void
  onOptionExpl: (oi: number, value: string) => void
  onCorrect: (oi: number) => void
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item value={q} dragListener={false} dragControls={controls} className="adm-card overflow-hidden list-none">
      {/* header da pergunta (com alça de arrasto) */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="cursor-grab text-[var(--text-disabled)]" onPointerDown={(e) => controls.start(e)} aria-hidden><GripVertical className="h-4 w-4" /></span>
          <span className="adm-eyebrow">Pergunta {index + 1} de {total}</span>
        </div>
        <button type="button" onClick={onDelete} aria-label="Excluir pergunta"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <label className="adm-label">Enunciado</label>
          <textarea className="adm-input" rows={2} value={q.prompt} onChange={(e) => onPatch({ prompt: e.target.value })} />
        </div>

        <label className="adm-label mb-3">Alternativas — clique no círculo para marcar a correta</label>
        <div className="flex flex-col gap-3">
          {q.options.map((opt, oi) => {
            const isCorrect = q.correctIndex === oi
            return (
              <div key={oi} className={`rounded-xl border p-3 transition-colors ${isCorrect ? 'border-[#cdebd9] bg-[var(--success-bg)]' : 'border-[var(--border)] bg-[var(--bg-subtle)]'}`}>
                <div className="mb-2 flex items-center gap-2.5">
                  <button type="button" onClick={() => onCorrect(oi)} className="shrink-0 transition-transform hover:scale-110"
                    aria-label={`Marcar alternativa ${String.fromCharCode(65 + oi)} como correta`}>
                    {isCorrect ? <CheckCircle2 className="h-5 w-5 text-[var(--success)]" /> : <Circle className="h-5 w-5 text-[var(--text-muted)]" />}
                  </button>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs font-bold ${isCorrect ? 'bg-[#cdebd9] text-[var(--success)]' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <input className="adm-input flex-1" style={{ padding: '8px 12px', borderColor: isCorrect ? '#cdebd9' : undefined }}
                    value={opt} onChange={(e) => onOption(oi, e.target.value)} placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                    aria-label={`Texto da alternativa ${String.fromCharCode(65 + oi)}`} />
                </div>
                <textarea className="adm-input" rows={1} style={{ fontSize: '0.78rem', padding: '7px 10px', resize: 'none' }}
                  placeholder="Explicação específica desta alternativa (opcional)"
                  value={q.optionExplanations?.[oi] ?? ''} onChange={(e) => onOptionExpl(oi, e.target.value)}
                  aria-label={`Explicação da alternativa ${String.fromCharCode(65 + oi)}`} />
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <label className="adm-label">Explicação geral (exibida após a resposta)</label>
          <textarea className="adm-input" rows={2} value={q.explain} onChange={(e) => onPatch({ explain: e.target.value })} />
        </div>
      </div>
    </Reorder.Item>
  )
}

export function QuizEditor({
  questions,
  sampleSize,
  randomize,
  onChange,
  onConfigChange,
}: {
  questions: QuizQuestion[]
  sampleSize?: number
  randomize?: boolean
  onChange: (q: QuizQuestion[]) => void
  onConfigChange?: (patch: { sampleSize?: number; randomize?: boolean }) => void
}) {
  const updateQ = (i: number, patch: Partial<QuizQuestion>) =>
    onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))
  const updateOption = (qi: number, oi: number, value: string) =>
    updateQ(qi, { options: questions[qi].options.map((o, idx) => (idx === oi ? value : o)) })
  const updateOptionExplanation = (qi: number, oi: number, value: string) => {
    const base = questions[qi].optionExplanations ?? questions[qi].options.map(() => '')
    updateQ(qi, { optionExplanations: base.map((item, idx) => (idx === oi ? value : item)) })
  }

  const isRandomized  = randomize ?? true
  const currentSample = sampleSize ?? Math.min(3, Math.max(1, questions.length))

  return (
    <div className="flex flex-col gap-5">
      {/* ── configuração ── */}
      <div className="adm-card p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-4 w-[3px] rounded-full bg-[var(--accent)]" />
          <h3 className="text-[0.95rem] font-semibold text-[var(--ink)]">Configuração do quiz</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="adm-label flex items-center gap-1.5" htmlFor="qz-sample"><Hash className="h-3.5 w-3.5" /> Perguntas por sessão</label>
            <input id="qz-sample" className="adm-input" type="number" min={1} max={Math.max(1, questions.length)} value={currentSample}
              onChange={(e) => onConfigChange?.({ sampleSize: Number(e.target.value) || 1 })} />
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">Banco com {questions.length} pergunta{questions.length !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <label className="adm-label flex items-center gap-1.5"><Shuffle className="h-3.5 w-3.5" /> Ordem aleatória</label>
            <button type="button" role="switch" aria-checked={isRandomized} onClick={() => onConfigChange?.({ randomize: !isRandomized })}
              className={`flex h-9 w-full items-center gap-3 rounded-lg border px-3.5 text-sm font-semibold transition-colors ${isRandomized ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]' : 'border-[var(--border-strong)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`}>
              <span className="relative h-5 w-9 shrink-0 rounded-full transition-colors" style={{ background: isRandomized ? 'var(--accent)' : 'var(--border-strong)' }}>
                <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" style={{ left: isRandomized ? 18 : 2 }} />
              </span>
              {isRandomized ? 'Ativado' : 'Desativado'}
            </button>
          </div>
        </div>
      </div>

      {/* ── banco de perguntas (arrastável) ── */}
      {questions.length === 0 ? (
        <div className="adm-card flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-tint)]"><Plus className="h-6 w-6 text-[var(--accent-text)]" /></div>
          <p className="text-sm text-[var(--text-muted)]">Nenhuma pergunta no banco ainda.</p>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => onChange([...questions, newQuizQuestion()])}>
            <Plus className="h-4 w-4" /> Adicionar primeira pergunta
          </button>
        </div>
      ) : (
        <>
          <Reorder.Group axis="y" values={questions} onReorder={onChange} className="m-0 flex list-none flex-col gap-5 p-0">
            {questions.map((q, qi) => (
              <QuestionCard key={q.id} q={q} index={qi} total={questions.length}
                onPatch={(patch) => updateQ(qi, patch)}
                onDelete={() => onChange(questions.filter((_, i) => i !== qi))}
                onOption={(oi, v) => updateOption(qi, oi, v)}
                onOptionExpl={(oi, v) => updateOptionExplanation(qi, oi, v)}
                onCorrect={(oi) => updateQ(qi, { correctIndex: oi })} />
            ))}
          </Reorder.Group>
          <button type="button" className="adm-btn adm-btn--primary self-start" onClick={() => onChange([...questions, newQuizQuestion()])}>
            <Plus className="h-4 w-4" /> Adicionar pergunta
          </button>
        </>
      )}
    </div>
  )
}
