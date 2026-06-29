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
  // Segmentos amplos usados para direcionar módulos em content.ts (não são
  // cargos selecionáveis — por isso ficam fora de ROLES).
  | 'Preparo de alimentos'
  | 'Atendimento ao cliente'
  | 'Limpeza'
  | 'Função externa'

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

export type EmployeeStatus = 'ativo' | 'afastado' | 'inativo'

export interface Employee {
  id: string
  name: string
  /** mantém o CPF (apenas dígitos) por compatibilidade com o token/link atual */
  phone: string
  role: Role
  token: string
  access_code?: string
  /** ID do AdminUser com role 'gerente' responsável por este colaborador */
  gerenteId?: string
  created_at: string
  // ── Cadastro completo (aditivo, opcional) — gestão documental/RH.
  // O app do colaborador ignora estes campos; servem só ao Dashboard.
  email?: string
  whatsapp?: string
  /** data de nascimento (YYYY-MM-DD) */
  birth_date?: string
  /** data de admissão (YYYY-MM-DD) */
  admission_date?: string
  /** loja/unidade (texto livre por enquanto) */
  store?: string
  status?: EmployeeStatus
  notes?: string
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

export interface PollAnswerRecord {
  module_id: string
  question: string
  selected: string[]
  answered_at: string
}

export interface SignatureRecord {
  signed_at: string
  ip_address: string | null
  confirmed: boolean
  terms: string[]
  // Metadados aditivos para robustez probatória (Lei 14.063/2020).
  // Capturados no cliente; IP/timestamp de servidor entram quando o Supabase
  // for ligado (ver docs/IMPLEMENTATION_PLAN.md). Todos opcionais → retrocompatível.
  terms_version?: string
  /** SHA-256 (hex) do HTML exato dos termos exibidos no momento da assinatura. */
  document_hash?: string
  user_agent?: string
  signer_name?: string
  signer_cpf?: string
  app_version?: string
}

export interface VideoView {
  module_id: string
  video_id: string
  watched_at: string
}

// ── Controle de acesso (diferente dos cargos de trabalho) ──────────
export type UserRole = 'dono' | 'gerente' | 'colaborador'

export interface AdminUser {
  id: string
  email: string
  nome: string
  role: UserRole
  /** Apenas para gerente: IDs dos colaboradores sob sua responsabilidade */
  colaboradoresIds?: string[]
  /** foto de perfil (data URL no modo localStorage; Storage/CDN na producao) */
  avatarUrl?: string
  createdAt: string
}

// ── Social / Comunicados / Notificacoes ────────────────────
export type SocialPostType =
  | 'aviso'
  | 'gratidao'
  | 'aniversariante'
  | 'importante'
  | 'treinamento'
  | 'motivacao'
  | 'geral'

/** Publico-alvo do post. 'all' = todos; senao filtra por loja/cargo/colaborador. */
export type SocialAudience =
  | { kind: 'all' }
  | { kind: 'store'; value: string }
  | { kind: 'role'; value: Role }
  | { kind: 'employee'; value: string } // employeeId

export type SocialPostStatus = 'draft' | 'published' | 'archived'

export interface SocialPost {
  id: string
  title: string
  message: string
  type: SocialPostType
  audience: SocialAudience
  pinned: boolean
  status: SocialPostStatus
  /** ISO quando publicado (null em rascunho/arquivado nunca publicado) */
  published_at: string | null
  /** AdminUser.id do autor */
  created_by: string
  created_by_name?: string
  /** papel do autor (para avatar/permissoes no feed) */
  created_by_role?: UserRole
  /** imagem opcional (data URL base64 no modo localStorage; Storage/CDN na producao) */
  image?: string
  /** cor do card (override do preset do tipo); undefined = usa preset */
  cardColor?: string
  /** cor do texto sobre o card (validada por contraste) */
  textColor?: string
  created_at: string
  updated_at: string
}

/** Leitura de um post por um colaborador (persistida por colaborador). */
export interface SocialPostRead {
  post_id: string
  read_at: string
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
  // Enquete (aditivo): coleta a opinião do colaborador, sem resposta certa/errada.
  | { type: 'poll'; question: string; options: string[]; allowMultiple?: boolean; anonymous?: boolean }
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
  /** rascunho vs publicado. undefined === publicado (retrocompatível). */
  status?: 'draft' | 'published'
}
