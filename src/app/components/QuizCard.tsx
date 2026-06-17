import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowRight } from 'lucide-react'
import type { QuizQuestion } from '@/lib/types'
import { LisAvatar } from './LisAvatar'
import { useTheme } from '../context/ThemeContext'
import { hapticError, hapticSuccess, soundCorrect, soundWrong, fireConfetti } from '@/lib/effects'

interface QuizCardProps {
  questions: QuizQuestion[]
  onAnswer: (q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  onComplete: () => void
  accent?: string
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

export function QuizCard({ questions, onAnswer, onComplete }: QuizCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const q = questions[qIndex]
  const isLast = qIndex === questions.length - 1
  const isCorrect = selected === q.correctIndex

  const choose = (i: number) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    const correct = i === q.correctIndex
    onAnswer(q, i, correct)
    if (correct) {
      hapticSuccess()
      soundCorrect()
      fireConfetti(1200)
    } else {
      hapticError()
      soundWrong()
    }
  }

  const next = () => {
    if (isLast) {
      onComplete()
    } else {
      setQIndex((n) => n + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const lisState = !revealed ? 'thinking' : isCorrect ? 'correct' : 'wrong'

  return (
    <div
      className="flex h-full flex-col justify-center gap-5 px-5 pb-28 pt-14"
      style={{ background: isLight ? '#fdf8f2' : '#0d0800' }}
    >
      {/* cabeçalho: Lis + pergunta */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
      >
        <LisAvatar state={lisState} size={54} />
        <div
          style={{
            flex: 1,
            background: isLight ? 'rgba(255,248,235,0.85)' : 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isLight ? 'rgba(184,134,11,0.20)' : 'rgba(255,255,255,0.10)'}`,
            borderRadius: '6px 18px 18px 18px',
            padding: '14px 16px',
          }}
        >
          {/* pontos de progresso das perguntas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            {questions.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === qIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i < qIndex ? '#4ade80' : i === qIndex ? '#f37435' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <p
            style={{
              fontFamily: 'MadeByDillan, serif',
              fontSize: 'clamp(20px, 5.5vw, 26px)',
              color: isLight ? 'var(--text-primary)' : '#ffffff',
              fontWeight: 700,
              lineHeight: 1.35,
              textShadow: isLight ? 'none' : '0 2px 12px rgba(0,0,0,0.60)',
            }}
          >
            {q.prompt}
          </p>
        </div>
      </motion.div>

      {/* opções com letras A/B/C/D */}
      <motion.div
        key={qIndex}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="flex flex-col gap-2.5"
      >
        {q.options.map((opt, i) => {
          const isThis = selected === i
          const showCorrect = revealed && i === q.correctIndex
          const showWrong = revealed && isThis && !isCorrect
          return (
            <motion.button
              key={i}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              onClick={() => choose(i)}
              disabled={revealed}
              whileTap={revealed ? undefined : { scale: 0.97 }}
              animate={showWrong ? { x: [0, -8, 8, -6, 6, 0] } : showCorrect ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="flex w-full items-center gap-3 text-left"
              style={{
                borderRadius: 16,
                padding: '15px 16px',
                border: `1.5px solid ${
                  showCorrect ? 'rgba(74,222,128,0.60)' : showWrong ? 'rgba(226,96,79,0.50)' : isLight ? 'rgba(184,134,11,0.20)' : 'rgba(255,245,220,0.18)'
                }`,
                background: showCorrect
                  ? 'rgba(74,222,128,0.15)'
                  : showWrong
                    ? 'rgba(226,96,79,0.12)'
                    : isLight
                      ? 'rgba(255,248,235,0.85)'
                      : 'rgba(255,245,220,0.10)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: revealed ? undefined : isLight ? 'var(--shadow-card)' : '0 4px 20px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)',
                transition: 'background 0.2s ease, border-color 0.2s ease',
                cursor: revealed ? 'default' : 'pointer',
              }}
            >
              {/* letra / estado */}
              <span
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 13,
                  fontWeight: 800,
                  background: showCorrect
                    ? 'rgba(74,222,128,0.20)'
                    : showWrong
                      ? 'rgba(226,96,79,0.20)'
                      : isLight
                        ? 'rgba(94,55,49,0.08)'
                        : 'rgba(255,255,255,0.08)',
                  color: showCorrect ? (isLight ? '#2f8a44' : '#4ade80') : showWrong ? (isLight ? '#c14a39' : '#f87171') : isLight ? 'var(--text-secondary)' : 'rgba(232,207,160,0.60)',
                  border: `1px solid ${
                    showCorrect ? 'rgba(74,222,128,0.40)' : showWrong ? 'rgba(226,96,79,0.40)' : isLight ? 'rgba(94,55,49,0.15)' : 'rgba(255,255,255,0.10)'
                  }`,
                }}
              >
                {showCorrect ? <Check size={14} /> : showWrong ? <X size={14} /> : OPTION_LETTERS[i]}
              </span>
              <span
                style={{
                  flex: 1,
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: showCorrect ? (isLight ? '#2f8a44' : '#4ade80') : showWrong ? (isLight ? 'var(--text-primary)' : 'rgba(255,255,255,0.85)') : isLight ? 'var(--text-primary)' : '#ffffff',
                }}
              >
                {opt}
              </span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* feedback + avançar */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 22 }}
            className="flex flex-col gap-3"
          >
            <div
              style={{
                borderRadius: 16,
                padding: '14px 16px',
                borderLeft: `4px solid ${isCorrect ? '#4ade80' : '#f87171'}`,
                background: isCorrect ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: isCorrect ? '#4ade80' : '#f87171',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                {isCorrect ? '✓ Correto!' : '✗ Quase lá!'}
              </span>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, lineHeight: 1.6, color: isLight ? 'var(--text-primary)' : 'rgba(232,207,160,0.90)' }}>
                {q.explain}
              </p>
              {!isCorrect && (
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: isLight ? 'var(--text-secondary)' : 'rgba(232,207,160,0.50)', marginTop: 6 }}>
                  Resposta certa: <strong style={{ color: isLight ? '#2f8a44' : '#4ade80' }}>{q.options[q.correctIndex]}</strong>
                </p>
              )}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={next}
              className="btn-laranja w-full"
            >
              {isLast ? 'Ver resultado 🏆' : 'Próxima pergunta'}
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
