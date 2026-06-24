// ============================================================
// Tipos de domínio — Pralis Conduta
// ============================================================

export type Role =
  | 'Padeiro'
  | 'Confeiteiro'
  | 'Atendente de Balcão'
  | 'Caixa'
  | 'Auxiliar de Cozinha'
  | 'Auxiliar de Produção'
  | 'Gerente de Loja'
  | 'Estoquista'
  | 'Entregador'
  | 'Serviços Gerais'

export const ROLES: Role[] = [
  'Padeiro',
  'Confeiteiro',
  'Atendente de Balcão',
  'Caixa',
  'Auxiliar de Cozinha',
  'Auxiliar de Produção',
  'Gerente de Loja',
  'Estoquista',
  'Entregador',
  'Serviços Gerais',
]

export interface Employee {
  id: string
  name: string
  phone: string
  role: Role
  token: string
  access_code?: string
  created_at: string
}

export interface ModuleProgress {
  module_id: string
  story_index: number
  completed: boolean
  completed_at: string | null
}

export interface QuizAnswerRecord {
  module_id: string
  question_id: string
  answer: string
  correct: boolean
  answered_at: string
  reviewed?: boolean
  reviewed_at?: string
}

export interface SignatureRecord {
  signed_at: string
  ip_address: string | null
  confirmed: boolean
  terms: string[]
}

export interface VideoView {
  module_id: string
  video_id: string
  watched_at: string
}

// ---------- Conteúdo dos módulos ----------

export type LisState =
  | 'neutral'
  | 'idle'
  | 'talking'
  | 'celebrating'
  | 'thinking'
  | 'alert'
  | 'correct'
  | 'wrong'

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  /** explicação geral exibida depois da resposta */
  explain: string
  /** explicação específica por alternativa; se ausente, usa explain */
  optionExplanations?: string[]
  /** trecho recomendado para revisão quando a pessoa erra */
  reviewTarget?: {
    storyIndex: number
    label?: string
  }
}

export interface QuizConfig {
  intro?: {
    eyebrow?: string
    title: string
    description: string
    voiceText?: string
    cta?: string
  }
  questions: QuizQuestion[]
  /** quantidade sorteada a partir do banco de perguntas */
  sampleSize?: number
  /** quando true, sorteia de forma estável por colaborador/módulo */
  randomize?: boolean
}

export type Story =
  | { type: 'lis'; text: string; state?: LisState; videoSrc?: string }
  | {
      type: 'text'
      title: string
      tag: string
      paragraphs: string[]
      highlight?: string
      highlights?: string[] // palavras a destacar em laranja
      keywords?: string[] // chips de conceito (opcional)
      audioSrc?: string // MP3 narrado pela Lis; sincroniza barra e leitura
      audioIncludesTitle?: boolean // false quando o MP3 começa direto nos parágrafos
      narratorVideoSrc?: string // vídeo circular da Lis falando junto com o áudio
    }
  | {
      type: 'video'
      videoId: string
      title: string
      description?: string
      duration?: string
      src?: string // URL opcional; se ausente vira placeholder
    }
  | { type: 'summary'; title: string; bullets: string[] }
  | ({ type: 'quiz' } & QuizConfig)
  | { type: 'completion'; badge: string; message: string }

export type ModuleIconType = 'flower' | 'sprout' | 'grain' | 'wheat' | 'bread' | 'croissant' | 'cake' | 'star' | 'heart' | 'chef'

export interface Module {
  id: string
  title: string
  /** nome de ícone do lucide-react (legado) */
  icon: string
  color: string
  estimatedMinutes: number
  mandatory: boolean
  /** 'all' = todos os cargos, ou lista de cargos específicos */
  roles: 'all' | Role[]
  /** 'final' agrupa penalidades/assinatura ao final do feed */
  section?: 'geral' | 'cargo' | 'final'
  description: string
  stories: Story[]

  // --- metadados visuais (estilo rede social) ---
  /** número de ordem exibido no card ("01".."12") */
  number: string
  /** gradiente do card no feed [topo, base] */
  gradient: [string, string]
  /** cor de acento do módulo (header dos stories, quiz, etc.) */
  accent: string
  /** um dos 4 símbolos da marca */
  iconType: ModuleIconType
  /** etiqueta curta (FUNDAMENTOS, CARREIRA…) */
  tag: string
  /** subtítulo curto do card */
  subtitle: string
  /** rota especial: 'signature' abre a tela de assinatura no lugar dos stories */
  kind?: 'stories' | 'signature'
  /** módulo visível no app (editável no admin). undefined === ativo */
  active?: boolean
}
