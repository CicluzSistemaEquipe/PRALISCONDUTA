import type { Module, Story, QuizQuestion } from '@/lib/types'

// ---------- Fábricas ----------

export function makeBlankModule(order: number): Module {
  const id = `modulo-${Date.now().toString(36)}`
  return {
    id,
    title: 'Novo módulo',
    icon: 'BookOpen',
    color: '#b8860b',
    estimatedMinutes: 3,
    mandatory: true,
    roles: 'all',
    section: 'geral',
    description: 'Descrição do módulo.',
    stories: [
      { type: 'lis', state: 'talking', text: 'Olá! Vamos começar este módulo.' },
      { type: 'text', tag: 'Conteúdo', title: 'Título do conteúdo', paragraphs: ['Escreva aqui o conteúdo principal deste slide.'] },
    ],
    number: String(order).padStart(2, '0'),
    gradient: ['#b8860b', '#7a5a08'],
    accent: '#b8860b',
    iconType: 'wheat',
    tag: 'NOVO',
    subtitle: 'Subtítulo do módulo',
    kind: 'stories',
    active: true,
  }
}

export function newTextStory(): Story {
  return { type: 'text', tag: 'Seção', title: 'Novo slide', paragraphs: ['Texto do slide.'] }
}

export function newQuizQuestion(): QuizQuestion {
  return {
    id: `q-${Date.now().toString(36)}`,
    prompt: 'Nova pergunta?',
    options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
    correctIndex: 0,
    explain: 'Explicação exibida após a resposta.',
  }
}

// ---------- Slide "simples" (texto / destaque / citação) ----------

export type SlideKind = 'texto' | 'destaque' | 'citacao'

export const SLIDE_KIND_LABEL: Record<SlideKind, string> = {
  texto: 'Texto',
  destaque: 'Destaque',
  citacao: 'Citação',
}

/** Identifica o "tipo" simplificado de um slide editável, ou null se for vídeo/quiz/etc. */
export function slideKind(s: Story): SlideKind | null {
  if (s.type === 'lis') return 'citacao'
  if (s.type === 'text') return s.highlight ? 'destaque' : 'texto'
  return null
}

/** Indica se o slide é editável no editor de slides. */
export function isEditableSlide(s: Story): boolean {
  return s.type === 'text' || s.type === 'lis'
}

/** Converte um slide entre os tipos simplificados, preservando o texto. */
export function setSlideKind(s: Story, kind: SlideKind): Story {
  // texto principal / secundário extraídos do slide atual
  const main = s.type === 'text' ? s.title : s.type === 'lis' ? s.text : ''
  const secondary =
    s.type === 'text' ? s.paragraphs.join('\n\n') : ''

  if (kind === 'citacao') {
    return { type: 'lis', state: 'talking', text: main || secondary || '' }
  }
  const base = {
    type: 'text' as const,
    tag: s.type === 'text' ? s.tag : 'Seção',
    title: main || 'Novo slide',
    paragraphs: secondary ? secondary.split(/\n{2,}/) : s.type === 'lis' ? [s.text] : [''],
  }
  if (kind === 'destaque') {
    return { ...base, highlight: s.type === 'text' && s.highlight ? s.highlight : 'Texto em destaque.' }
  }
  return base
}

// ---------- Acesso a stories por tipo ----------

export function firstQuizIndex(stories: Story[]): number {
  return stories.findIndex((s) => s.type === 'quiz')
}

export function firstVideoIndex(stories: Story[]): number {
  return stories.findIndex((s) => s.type === 'video')
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr
  const next = arr.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
