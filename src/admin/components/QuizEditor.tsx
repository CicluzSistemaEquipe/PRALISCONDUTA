import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import type { QuizQuestion } from '@/lib/types'
import { newQuizQuestion } from '../lib/modules'

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

  return (
    <div className="flex flex-col gap-4">
      <div className="adm-card grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label className="adm-label">Quantidade sorteada</label>
          <input
            className="adm-input"
            type="number"
            min={1}
            max={Math.max(1, questions.length)}
            value={sampleSize ?? Math.min(3, Math.max(1, questions.length))}
            onChange={(e) => onConfigChange?.({ sampleSize: Number(e.target.value) || 1 })}
          />
          <p className="mt-2 text-xs text-[var(--cream-muted)]">
            Cadastre mais perguntas no banco e escolha quantas entram para cada colaborador.
          </p>
        </div>
        <button
          className="adm-btn"
          onClick={() => onConfigChange?.({ randomize: !(randomize ?? true) })}
          type="button"
        >
          {randomize ?? true ? 'Sorteio ligado' : 'Sorteio desligado'}
        </button>
      </div>

      {questions.length === 0 && (
        <div className="adm-card px-5 py-8 text-center text-sm text-[var(--cream-muted)]">
          Nenhuma pergunta. Adicione a primeira abaixo.
        </div>
      )}

      {questions.map((q, qi) => (
        <div key={q.id} className="adm-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--cream-muted)]">Pergunta {qi + 1}</span>
            <button className="adm-btn adm-btn--danger px-2 py-1.5" onClick={() => onChange(questions.filter((_, i) => i !== qi))} aria-label="Excluir pergunta">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <label className="adm-label">Enunciado</label>
          <input className="adm-input" value={q.prompt} onChange={(e) => updateQ(qi, { prompt: e.target.value })} />

          <label className="adm-label mt-3">Alternativas (marque a correta)</label>
          <div className="flex flex-col gap-2">
            {q.options.map((opt, oi) => {
              const correct = q.correctIndex === oi
              return (
                <div key={oi} className="grid gap-2 rounded-xl border border-white/10 p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQ(qi, { correctIndex: oi })}
                      aria-label={`Marcar alternativa ${String.fromCharCode(65 + oi)} como correta`}
                      className={correct ? 'text-[#5dd87a]' : 'text-[var(--cream-muted)]'}
                    >
                      {correct ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </button>
                    <span className="w-4 text-xs font-bold text-[var(--cream-muted)]">{String.fromCharCode(65 + oi)}</span>
                    <input
                      className="adm-input"
                      style={correct ? { borderColor: 'rgba(93,216,122,0.5)' } : undefined}
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                    />
                  </div>
                  <textarea
                    className="adm-input"
                    rows={2}
                    placeholder="Explicação específica desta alternativa"
                    value={q.optionExplanations?.[oi] ?? ''}
                    onChange={(e) => updateOptionExplanation(qi, oi, e.target.value)}
                  />
                </div>
              )
            })}
          </div>

          <label className="adm-label mt-3">Explicação (pós-resposta)</label>
          <textarea className="adm-input" rows={2} value={q.explain} onChange={(e) => updateQ(qi, { explain: e.target.value })} />
        </div>
      ))}

      <button className="adm-btn self-start" onClick={() => onChange([...questions, newQuizQuestion()])}>
        <Plus className="h-4 w-4" /> Adicionar pergunta
      </button>
    </div>
  )
}
