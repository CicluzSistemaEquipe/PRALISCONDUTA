# Proposta de tabelas Supabase — Social / Comunicados (NÃO APLICAR)

> **Status: PROPOSTA.** Nenhuma migration foi criada nem aplicada. Serve para virar
> uma migration futura (ex.: `0008_social`) **quando você aprovar**, junto do
> hardening de RLS (`docs/RLS_SECURITY_PROPOSAL.md`). A Opção A (localStorage) **não
> depende disto**.

---

## 1. Mapeamento localStorage → Supabase

| Hoje (localStorage) | Futuro (Supabase) |
|---|---|
| `pralis:social-posts` | tabela `social_posts` |
| `pralis:social-reads:{employeeId}` | tabela `social_post_reads` |
| (derivado) badge de novidade | view/contagem + futura `notification_events` |

O `social.ts` já está **gated**: ao ligar o Supabase, as mesmas funções ganham o
caminho remoto sem mudar a UI.

---

## 2. Tabelas propostas (DDL de referência — não aplicar)

```sql
-- PROPOSTA — social_posts
create table if not exists social_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  message      text not null,
  type         text not null default 'geral',   -- aviso|gratidao|aniversariante|importante|treinamento|geral
  audience_kind text not null default 'all',     -- all|store|role|employee
  audience_value text,                            -- loja|cargo|employee_id (null quando 'all')
  pinned       boolean not null default false,
  status       text not null default 'draft',     -- draft|published|archived
  published_at timestamptz,
  created_by   uuid,                               -- admin (auth.users) — ver RLS
  created_by_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_social_posts_status on social_posts (status, pinned, published_at desc);

-- PROPOSTA — social_post_reads (leitura por colaborador)
create table if not exists social_post_reads (
  post_id      uuid references social_posts(id) on delete cascade,
  employee_id  uuid references employees(id) on delete cascade,
  read_at      timestamptz not null default now(),
  primary key (post_id, employee_id)
);

-- PROPOSTA — notification_events (base para push futuro)
create table if not exists notification_events (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,            -- social_post|treinamento_concluido|...
  ref_id      uuid,                     -- ex.: social_posts.id
  audience_kind text not null default 'all',
  audience_value text,
  created_at  timestamptz not null default now()
);
```

> Targeting de audiência: o app filtra `audience_kind/value` contra o colaborador
> (loja=`store`, cargo=`role`, colaborador=`employees.id`). Mesma lógica de
> `social.ts:audienceMatches`.

---

## 3. RLS proposta (resumo — detalhe em RLS_SECURITY_PROPOSAL.md)
- **`social_posts`:** leitura pública só de `status='published'`; escrita só por
  **admin autenticado** (Dono + Gerentes). Idealmente via **Supabase Auth** + checagem
  de papel.
- **`social_post_reads`:** colaborador (anon) grava/recupera **apenas as próprias
  leituras** — via **RPC `security definer`** validando o token (o colaborador não tem
  login Supabase; mesmo modelo do progresso/quiz).
- **`notification_events`:** escrita só admin/servidor; leitura conforme audiência.

---

## 4. Push notification (futuro, fora deste escopo)
- `notification_events` vira a **fonte** do push.
- A costura `enviarNotificacao()` (já existente) ganha o caminho: `INSERT` em
  `notification_events` → Edge Function → Web Push para `push_subscriptions`
  (ver `RLS_SECURITY_PROPOSAL.md`).
- **Nada de push implementado agora.**

---

## 5. Ordem proposta (quando aprovado)
1. Aplicar `0001–0006` + hardening `0007` (RLS por RPC).
2. Aplicar `0008_social` (estas tabelas + RLS).
3. Ligar `social.ts`/`storage` ao Supabase (gated já pronto).
4. Migrar dados de localStorage (opcional) e testar com dados falsos.

---

## 6. Adendo (evolução v2) — engajamento, mensagens, mídia

```sql
-- PROPOSTA — engajamento (substitui pralis:social-engagement)
create table if not exists social_engagement (
  post_id     uuid references social_posts(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  viewed_at    timestamptz,
  confirmed_at timestamptz,   -- "Li e estou ciente"
  primary key (post_id, employee_id)
);

-- PROPOSTA — mensagens privadas Gerente -> Admin (pralis:admin-inbox)
create table if not exists admin_messages (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid,            -- AdminUser (gerente)
  from_name  text,
  title      text not null,
  message    text not null,
  read       boolean not null default false,
  archived   boolean not null default false,
  created_at timestamptz not null default now()
);
```

**Mídia (hoje base64 no localStorage):**
- **Imagens de post** e **avatares de admin** (`AdminUser.avatarUrl`) devem ir para
  **Supabase Storage** (bucket `image`/`avatar`), guardando a **URL** (não o base64).
- Upload já tem a UI (admin); trocar `lib/image.ts` (data URL) por upload ao Storage
  quando `hasSupabase`. RLS de escrita: só admin autenticado.

**RLS resumida:** `social_engagement` via **RPC por token** (colaborador grava só o
seu); `admin_messages` só `authenticated` (gerente insere; dono lê/atualiza os seus).

---

> **Reforço:** proposta apenas. Nenhuma migration/RLS aplicada.
