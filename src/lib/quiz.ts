import type { QuizQuestion } from './types'

function hashSeed(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed: number) {
  let state = seed || 1
  return () => {
    state = Math.imul(1664525, state) + 1013904223
    return ((state >>> 0) / 4294967296)
  }
}

export function pickQuizQuestions(
  questions: QuizQuestion[],
  options: {
    sampleSize?: number
    randomize?: boolean
    seed?: string
  } = {},
) {
  const sampleSize = Math.max(1, Math.min(options.sampleSize ?? questions.length, questions.length))
  if (!options.randomize || questions.length <= sampleSize) return questions.slice(0, sampleSize)

  const random = seededRandom(hashSeed(options.seed ?? 'pralis-quiz'))
  const pool = questions.slice()

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, sampleSize)
}

export function quizOptionExplanation(question: QuizQuestion, selectedIndex: number) {
  return question.optionExplanations?.[selectedIndex] || question.explain
}
