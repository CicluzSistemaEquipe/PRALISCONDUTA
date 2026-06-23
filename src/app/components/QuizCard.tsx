import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowRight, BookOpen, BrainCircuit, Headphones, Sparkles } from 'lucide-react'
import type { QuizConfig, QuizQuestion } from '@/lib/types'
import { pickQuizQuestions, quizOptionExplanation } from '@/lib/quiz'
import { useTheme } from '../context/ThemeContext'
import { hapticError, hapticSuccess, soundCorrect, soundWrong, fireConfetti, isSoundOn } from '@/lib/effects'

interface QuizCardProps {
  intro?: QuizConfig['intro']
  questions: QuizQuestion[]
  onAnswer: (q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  onComplete: () => void
  onReviewStory?: (storyIndex: number) => void
  onReviewQuestion?: (q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  initialState?: QuizRuntimeState
  onStateChange?: (state: QuizRuntimeState) => void
  accent?: string
  sampleSize?: number
  randomize?: boolean
  quizSeed?: string
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']

export interface QuizRuntimeState {
  currentIndex: number
  answers: Record<string, { selectedIndex: number; correct: boolean; reviewed?: boolean }>
}

export function QuizCard({
  intro,
  questions,
  onAnswer,
  onComplete,
  onReviewStory,
  onReviewQuestion,
  initialState,
  onStateChange,
  sampleSize,
  randomize,
  quizSeed,
  accent = '#f37435',
}: QuizCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const activeQuestions = useMemo(
    () => pickQuizQuestions(questions, { sampleSize, randomize, seed: quizSeed }),
    [questions, sampleSize, randomize, quizSeed],
  )
  const [qIndex, setQIndex] = useState(() =>
    Math.min(initialState?.currentIndex ?? 0, Math.max(0, activeQuestions.length - 1)),
  )
  const [answers, setAnswers] = useState<QuizRuntimeState['answers']>(() => initialState?.answers ?? {})
  const [showIntro, setShowIntro] = useState(() => {
    const hasProgress = (initialState?.currentIndex ?? 0) > 0 || Object.keys(initialState?.answers ?? {}).length > 0
    return Boolean(intro && !hasProgress)
  })
  const headerRef = useRef<HTMLDivElement | null>(null)

  const q = activeQuestions[qIndex]
  if (!q) return null

  const savedAnswer = answers[q.id]
  const selected = savedAnswer?.selectedIndex ?? null
  const revealed = Boolean(savedAnswer)
  const isLast = qIndex === activeQuestions.length - 1
  const isCorrect = savedAnswer?.correct ?? false
  const feedbackText = selected === null ? q.explain : quizOptionExplanation(q, selected)
  const canReview = revealed && !isCorrect && q.reviewTarget && onReviewStory

  useEffect(() => {
    if (!showIntro || !intro?.voiceText || !isSoundOn() || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(intro.voiceText)
    utter.lang = 'pt-BR'
    utter.rate = 1.04
    utter.pitch = 1.05
    utter.volume = 0.86
    const voices = window.speechSynthesis.getVoices()
    const ptBR =
      voices.find((v) => v.lang === 'pt-BR' && v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.lang.startsWith('pt'))
    if (ptBR) utter.voice = ptBR

    const timer = window.setTimeout(() => window.speechSynthesis.speak(utter), 250)
    return () => {
      window.clearTimeout(timer)
      window.speechSynthesis.cancel()
    }
  }, [intro?.voiceText, showIntro])

  const reviewCurrent = () => {
    if (selected === null || !q.reviewTarget) return
    setAnswers((prev) => ({
      ...prev,
      [q.id]: { ...prev[q.id], selectedIndex: selected, correct: isCorrect, reviewed: true },
    }))
    onReviewQuestion?.(q, selected, isCorrect)
    onReviewStory?.(q.reviewTarget.storyIndex)
  }

  const choose = (i: number) => {
    if (revealed) return
    const correct = i === q.correctIndex
    setAnswers((prev) => ({ ...prev, [q.id]: { selectedIndex: i, correct } }))
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
    }
  }

  const startQuiz = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setShowIntro(false)
  }

  useEffect(() => {
    onStateChange?.({ currentIndex: qIndex, answers })
  }, [answers, qIndex])

  useEffect(() => {
    if (!revealed) return
    window.setTimeout(() => {
      headerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }, 80)
  }, [revealed])

  if (showIntro && intro) {
    return (
      <div
        className="flex min-h-full flex-col px-5 pb-36 pt-6"
        style={{
          background: 'transparent',
          justifyContent: 'flex-start',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 190, damping: 22 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 22,
            padding: '18px 18px 20px',
            background: isLight
              ? 'linear-gradient(145deg, #fff7e8, #ffffff 58%, #ffe9d6)'
              : 'linear-gradient(145deg, rgba(61,35,24,0.98), rgba(92,49,32,0.96) 62%, rgba(61,35,24,0.98))',
            border: `2px solid ${accent}`,
            boxShadow: '0 18px 36px rgba(43,22,15,0.24)',
          }}
        >
          <motion.div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 18% 12%, rgba(255,230,184,0.30), transparent 28%), radial-gradient(circle at 86% 70%, rgba(243,116,53,0.20), transparent 34%)',
              pointerEvents: 'none',
            }}
            animate={{ opacity: [0.55, 0.85, 0.55] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: '50%',
                background: '#ffffff',
                border: '3px solid rgba(255,230,184,0.95)',
                boxShadow: '0 0 0 5px rgba(184,134,11,0.18), 0 12px 24px rgba(43,22,15,0.24)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <video
                src="/video-lis-questionario.webm"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '108%',
                  height: '108%',
                  objectFit: 'cover',
                  objectPosition: '60% 8%',
                  transform: 'translate(-4%, -3%)',
                }}
              />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: '#fff1cf',
                  color: '#7a3b1f',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 8px 18px rgba(43,22,15,0.12)',
                }}
              >
                <BrainCircuit size={13} />
                {intro.eyebrow ?? 'Questionário'}
              </span>

              <h2
                style={{
                  marginTop: 12,
                  fontFamily: 'MadeByDillan, serif',
                  fontSize: 'clamp(28px, 8vw, 40px)',
                  lineHeight: 1.02,
                  color: 'var(--text-primary)',
                  overflowWrap: 'anywhere',
                }}
              >
                {intro.title}
              </h2>
            </div>
          </div>

          <p
            style={{
              position: 'relative',
              zIndex: 1,
              marginTop: 18,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(14px, 4vw, 16px)',
              fontWeight: 700,
              lineHeight: 1.55,
              color: 'var(--text-primary)',
            }}
          >
            {intro.description}
          </p>

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              marginTop: 16,
            }}
          >
            {[
              { icon: Sparkles, label: `${activeQuestions.length} perguntas`, text: 'Responda com calma.' },
              { icon: Headphones, label: 'Com apoio da Lis', text: 'Ela orienta a etapa.' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  style={{
                    borderRadius: 14,
                    padding: '12px 10px',
                    background: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,230,184,0.10)',
                    border: '1px solid rgba(255,230,184,0.34)',
                  }}
                >
                  <Icon size={17} color={accent} />
                  <strong
                    style={{
                      display: 'block',
                      marginTop: 6,
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 12,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item.label}
                  </strong>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 3,
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 11,
                      fontWeight: 650,
                      lineHeight: 1.35,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              )
            })}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, scale: [1, 1.025, 1] }}
            transition={{
              opacity: { delay: 0.18 },
              y: { delay: 0.18 },
              scale: { delay: 0.8, duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileTap={{ scale: 0.97 }}
            onClick={startQuiz}
            className="btn-next-white w-full"
            style={{ position: 'relative', zIndex: 1, marginTop: 18 }}
          >
            <span>{intro.cta ?? 'Começar questionário'}</span>
            <ArrowRight className="h-5 w-5" color="#f37435" />
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-full flex-col gap-4 px-5 pb-36 pt-5"
      style={{
        background: 'transparent',
        justifyContent: 'flex-start',
      }}
    >
      {/* cabeçalho: Lis + pergunta */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
        style={{ scrollMarginTop: 16 }}
      >
        <div style={{
          position: 'relative',
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: '#ffffff',
          border: '3px solid rgba(184,134,11,0.6)',
          boxShadow: '0 0 0 5px rgba(184,134,11,0.15), 0 8px 24px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <video
            src="/video-lis-questionario.webm"
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              width: '108%',
              height: '108%',
              objectFit: 'cover',
              objectPosition: '60% 8%',
              top: '-3%',
              left: '-4%',
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: isLight ? '#fdf6e8' : '#3d2318',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            border: '2px solid #b8860b',
            borderRadius: '6px 18px 18px 18px',
            padding: '13px 15px',
            boxShadow: '0 4px 16px rgba(184,134,11,0.18)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              marginBottom: 8,
              padding: '4px 9px',
              borderRadius: 999,
              background: 'var(--orange)',
              color: '#ffffff',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}
          >
            Pergunta {qIndex + 1} de {activeQuestions.length}
          </span>

          {/* pontos de progresso das perguntas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            {activeQuestions.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === qIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: answers[activeQuestions[i].id]
                    ? answers[activeQuestions[i].id].correct
                      ? 'var(--green)'
                      : 'var(--red)'
                    : i === qIndex
                      ? 'var(--orange)'
                      : 'var(--stroke-soft)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <p
            style={{
              fontFamily: 'MadeByDillan, serif',
              fontSize: 'clamp(18px, 5vw, 24px)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              lineHeight: 1.28,
              textShadow: 'none',
              overflowWrap: 'anywhere',
              hyphens: 'auto',
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
                padding: '13px 14px',
                border: `1.5px solid ${
                  showCorrect ? 'var(--green)' : showWrong ? 'var(--red)' : 'var(--stroke)'
                }`,
                background: showCorrect
                  ? isLight ? '#effff3' : '#31543a'
                  : showWrong
                    ? isLight ? '#fff0ec' : '#744034'
                    : isLight ? 'var(--bg-card)' : '#6a4038',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                boxShadow: 'none',
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
                    ? 'var(--green)'
                    : showWrong
                      ? 'var(--red)'
                      : 'var(--bg-surface-2)',
                  color: showCorrect || showWrong ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${
                    showCorrect ? 'var(--green)' : showWrong ? 'var(--red)' : 'var(--stroke)'
                  }`,
                }}
              >
                {showCorrect ? <Check size={14} /> : showWrong ? <X size={14} /> : OPTION_LETTERS[i]}
              </span>
              <span
                style={{
                  flex: 1,
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 'clamp(13px, 3.8vw, 15px)',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: showCorrect ? (isLight ? '#155724' : '#ffffff') : showWrong ? 'var(--text-primary)' : 'var(--text-primary)',
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  hyphens: 'auto',
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
                borderLeft: `4px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
                background: isCorrect ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                border: `1px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
              }}
            >
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                {isCorrect ? 'Correto!' : 'Quase lá!'}
              </span>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {feedbackText}
              </p>
              {!isCorrect && (
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                  Resposta certa: <strong style={{ color: isLight ? '#2f8a44' : '#4ade80' }}>{q.options[q.correctIndex]}</strong>
                </p>
              )}
            </div>

            {canReview && (
              <motion.button
                initial={{ opacity: 0, y: 8, backgroundPosition: '120% 0%' }}
                animate={{ opacity: 1, y: 0, backgroundPosition: ['120% 0%', '-120% 0%'] }}
                transition={{
                  opacity: { delay: 0.42, duration: 0.18 },
                  y: { delay: 0.42, type: 'spring', stiffness: 200, damping: 22 },
                  backgroundPosition: { duration: 4.2, repeat: Infinity, ease: 'linear' },
                }}
                whileTap={{ scale: 0.97 }}
                onClick={reviewCurrent}
                className="flex w-full items-center justify-center gap-2 rounded-pill px-5 py-3 font-body font-bold"
                style={{
                  background: 'linear-gradient(110deg, #f37435 0%, #f37435 42%, #b8860b 70%, #f37435 100%)',
                  backgroundSize: '220% 100%',
                  border: '1px solid rgba(255,255,255,0.45)',
                  color: '#2b160f',
                  boxShadow: '0 12px 26px rgba(43,22,15,0.20), 0 0 0 1px rgba(255,230,184,0.12) inset',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <BookOpen className="h-4 w-4" color="#2b160f" />
                <span style={{ color: '#2b160f', fontWeight: 900 }}>{q.reviewTarget?.label ?? 'Rever esse trecho'}</span>
              </motion.button>
            )}

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: [1, 1.025, 1],
              }}
              transition={{
                opacity: { delay: 0.7 },
                y: { delay: 0.7 },
                scale: { delay: 0.9, duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileTap={{ scale: 0.97 }}
              onClick={next}
              className="btn-next-white w-full"
            >
              <span>{isLast ? 'Ver resultado' : 'Próxima pergunta'}</span>
              <ArrowRight className="h-5 w-5" color="#f37435" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
