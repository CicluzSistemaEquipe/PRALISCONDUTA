-- ============================================================
-- Pralis Conduta — schema inicial
-- ============================================================

-- Colaboradores
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  role text not null,
  token text unique not null,
  created_at timestamptz default now()
);

-- Progresso por módulo
create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade,
  module_id text not null,
  story_index int default 0,
  completed boolean default false,
  completed_at timestamptz,
  unique (employee_id, module_id)
);

-- Respostas dos quizzes
create table if not exists quiz_answers (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade,
  module_id text not null,
  question_id text not null,
  answer text not null,
  correct boolean not null,
  answered_at timestamptz default now()
);

-- Assinatura digital final
create table if not exists signatures (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade unique,
  signed_at timestamptz default now(),
  ip_address text,
  confirmed boolean default true
);

-- Vídeos assistidos
create table if not exists video_views (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade,
  module_id text not null,
  video_id text not null,
  watched_at timestamptz default now(),
  unique (employee_id, video_id)
);

create index if not exists idx_progress_employee on progress (employee_id);
create index if not exists idx_quiz_employee on quiz_answers (employee_id);
create index if not exists idx_video_employee on video_views (employee_id);
