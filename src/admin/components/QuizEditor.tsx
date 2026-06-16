import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import type { QuizQuestion } from '@/lib/types'
import { newQuizQuestion } from '../lib/modules'

export function QuizEditor({
  questions,
  onChange,
}: {
  questions: QuizQuestion[]
  onChange: (q: QuizQuestion[]) => void
}) {
  const updateQ = (i: number, patch: Partial<QuizQuestion>) =>
    onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)))

  const updateOption = (qi: number, oi: number, value: string) =>
    updateQ(qi, { options: questions[qi].options.map((o, idx) => (idx === oi ? value : o)) })

  return (
    <div className="flex flex-col gap-4">
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
                <div key={oi} className="flex items-center gap-2">
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
