import { Plus, Trash2, CheckCircle2, Circle, Hash, Shuffle } from 'lucide-react'
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

  const isRandomized  = randomize ?? true
  const currentSample = sampleSize ?? Math.min(3, Math.max(1, questions.length))

  return (
    <div className="flex flex-col gap-5">

      {/* ── configuração ── */}
      <div className="adm-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--gold-light)]">
          Configuração do Quiz
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">

          {/* quantidade */}
          <div>
            <label className="adm-label flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" /> Perguntas por sessão
            </label>
            <input
              className="adm-input"
              type="number"
              min={1}
              max={Math.max(1, questions.length)}
              value={currentSample}
              onChange={(e) => onConfigChange?.({ sampleSize: Number(e.target.value) || 1 })}
            />
            <p className="mt-1.5 text-xs text-[var(--cream-muted)]">
              Banco com {questions.length} pergunta{questions.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* ordem aleatória */}
          <div>
            <label className="adm-label flex items-center gap-1.5">
              <Shuffle className="h-3.5 w-3.5" /> Ordem aleatória
            </label>
            <button
              type="button"
              onClick={() => onConfigChange?.({ randomize: !isRandomized })}
              className="flex h-[46px] w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors"
              style={{
                background: isRandomized ? 'rgba(184,134,11,0.18)' : 'rgba(255,245,220,0.05)',
                border:     `1px solid ${isRandomized ? 'rgba(184,134,11,0.45)' : 'rgba(184,134,11,0.15)'}`,
                color:      isRandomized ? 'var(--gold-light)' : 'var(--cream-muted)',
              }}
            >
              {/* mini toggle visual */}
              <span
                className="relative h-5 w-9 rounded-full transition-colors"
                style={{
                  background: isRandomized
                    ? 'linear-gradient(135deg,#b8860b,#f37435)'
                    : 'rgba(255,255,255,0.12)',
                }}
              >
                <span
                  className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                  style={{ left: isRandomized ? 16 : 2 }}
                />
              </span>
              {isRandomized ? 'Ativado' : 'Desativado'}
            </button>
          </div>
        </div>
      </div>

      {/* ── banco de perguntas ── */}
      {questions.length === 0 ? (
        <div className="adm-card flex flex-col items-center gap-4 py-12 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'rgba(243,116,53,0.14)', border: '1px solid rgba(243,116,53,0.3)' }}
          >
            <Plus className="h-6 w-6 text-[#f37435]" />
          </div>
          <p className="text-sm text-[var(--cream-muted)]">Nenhuma pergunta no banco ainda.</p>
          <button
            className="adm-btn adm-btn--primary"
            onClick={() => onChange([...questions, newQuizQuestion()])}
          >
            <Plus className="h-4 w-4" /> Adicionar primeira pergunta
          </button>
        </div>
      ) : (
        <>
          {questions.map((q, qi) => (
            <div key={q.id} className="adm-card overflow-hidden">

              {/* header da pergunta */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  borderBottom: '1px solid rgba(184,134,11,0.14)',
                  background:   'rgba(255,245,220,0.03)',
                }}
              >
                <span className="text-xs font-bold text-[var(--cream-muted)]">
                  Pergunta {qi + 1} de {questions.length}
                </span>
                <button
                  className="adm-btn adm-btn--danger"
                  style={{ padding: '5px 8px' }}
                  onClick={() => onChange(questions.filter((_, i) => i !== qi))}
                  aria-label="Excluir pergunta"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-4">
                {/* enunciado */}
                <div className="mb-4">
                  <label className="adm-label">Enunciado</label>
                  <textarea
                    className="adm-input"
                    rows={2}
                    value={q.prompt}
                    onChange={(e) => updateQ(qi, { prompt: e.target.value })}
                  />
                </div>

                {/* alternativas */}
                <label className="adm-label mb-3">
                  Alternativas — clique no círculo para marcar a correta
                </label>
                <div className="flex flex-col gap-3">
                  {q.options.map((opt, oi) => {
                    const isCorrect = q.correctIndex === oi
                    return (
                      <div
                        key={oi}
                        className="rounded-2xl p-3 transition-colors"
                        style={{
                          background: isCorrect ? 'rgba(93,216,122,0.08)' : 'rgba(255,245,220,0.04)',
                          border:     `1px solid ${isCorrect ? 'rgba(93,216,122,0.4)' : 'rgba(184,134,11,0.14)'}`,
                        }}
                      >
                        {/* linha superior: check + letra + input */}
                        <div className="mb-2 flex items-center gap-2.5">
                          <button
                            onClick={() => updateQ(qi, { correctIndex: oi })}
                            className="shrink-0 transition-transform hover:scale-110"
                            aria-label={`Marcar alternativa ${String.fromCharCode(65 + oi)} como correta`}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-[#5dd87a]" />
                            ) : (
                              <Circle className="h-5 w-5 text-[var(--cream-muted)]" />
                            )}
                          </button>

                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                            style={{
                              background: isCorrect ? 'rgba(93,216,122,0.2)' : 'rgba(255,245,220,0.08)',
                              color:      isCorrect ? '#5dd87a' : 'var(--cream-muted)',
                            }}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>

                          <input
                            className="adm-input flex-1"
                            style={{
                              padding:     '8px 12px',
                              borderColor: isCorrect ? 'rgba(93,216,122,0.4)' : undefined,
                            }}
                            value={opt}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                          />
                        </div>

                        {/* explicação específica da alternativa */}
                        <textarea
                          className="adm-input text-xs"
                          rows={1}
                          style={{ fontSize: '0.78rem', padding: '7px 10px', resize: 'none' }}
                          placeholder="Explicação específica desta alternativa (opcional)"
                          value={q.optionExplanations?.[oi] ?? ''}
                          onChange={(e) => updateOptionExplanation(qi, oi, e.target.value)}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* explicação geral */}
                <div className="mt-4">
                  <label className="adm-label">Explicação geral (exibida após a resposta)</label>
                  <textarea
                    className="adm-input"
                    rows={2}
                    value={q.explain}
                    onChange={(e) => updateQ(qi, { explain: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            className="adm-btn adm-btn--primary self-start"
            onClick={() => onChange([...questions, newQuizQuestion()])}
          >
            <Plus className="h-4 w-4" /> Adicionar pergunta
          </button>
        </>
      )}
    </div>
  )
}
