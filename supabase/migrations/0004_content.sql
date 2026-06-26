-- ============================================================
-- Fase 2 / P2.0 — Conteúdo no Supabase (JSONB)
--
-- Estratégia aprovada: 1 linha = 1 Module, com `content jsonb` = o objeto
-- Module COMPLETO (stories[] incluso). O app continua consumindo Module[]
-- via content.ts → modulesForRole()/getModule(); prepareStories roda no
-- runtime sobre o Module hidratado. Ver docs/PHASE2_SUPABASE_DISCOVERY.md.
--
-- Idempotente (create if not exists). Aditivo — não toca 0001/0002/0003.
-- ============================================================

create table if not exists training_modules (
  id           text primary key,              -- mantém o id do módulo (ex.: 'boas-vindas')
  slug         text,
  section      text,                           -- 'geral' | 'cargo' | 'final'
  roles        jsonb        default '"all"',   -- 'all' | string[]
  active       boolean      default true,
  status       text         default 'draft',   -- 'draft' | 'published'
  sort_order   int          default 0,
  version      int          default 1,
  content      jsonb        not null,          -- = Module (src/lib/types.ts), stories[] incluso
  updated_at   timestamptz  default now(),
  published_at timestamptz
);

-- listagem por seção/ordem e por status de publicação
create index if not exists idx_modules_section on training_modules (section, sort_order);
create index if not exists idx_modules_status  on training_modules (status, active);

-- Falas reutilizáveis da Lis (P2.3 — preparado agora, opcional).
create table if not exists lis_lines (
  id              uuid primary key default gen_random_uuid(),
  locale          text default 'pt-BR',
  text            text not null,
  audio_url       text,                         -- bucket audio/ (null → TTS)
  state           text,                         -- LisState
  cues            jsonb,                         -- OPCIONAL: [{tSec, charIndex}]
  caption_vtt_url text,                          -- OPCIONAL: WebVTT (legenda/i18n)
  updated_at      timestamptz default now()
);

-- Respostas de enquete (tipo 'poll') — espelha PollAnswerRecord.
create table if not exists poll_answers (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade,
  module_id   text not null,
  question    text not null,
  selected    jsonb not null,                   -- string[]
  answered_at timestamptz default now(),
  unique (employee_id, module_id, question)
);
create index if not exists idx_poll_employee on poll_answers (employee_id);

-- RLS desta migration: NÃO habilitada aqui de propósito. As políticas de
-- training_modules/lis_lines/poll_answers entram no hardening (0007), junto
-- com o fechamento do `using(true)` legado. Até lá, manter o projeto Supabase
-- fora de dados reais (ver discovery, R2).
