# Fase 2 — Discovery Técnica (Mídia, Lis, Storage, Supabase)

> **Discovery, não implementação.** Branch: `lab/phase2-supabase-discovery`.
> Objetivo: transformar o CMS local em **plataforma compartilhada** (persistência real +
> upload de mídia) **sem quebrar nada aprovado**: contrato `Module`/`Story`, experiência do
> colaborador, regras de desbloqueio/progresso/conclusão/assinatura, e o **modo local/demo**.
>
> Princípio mestre: **tudo atrás do gate `hasSupabase`** (`src/lib/supabase.ts`). Sem
> `VITE_SUPABASE_*`, o app continua 100% localStorage — exatamente como hoje. Supabase é
> **progressive enhancement**, nunca requisito.

---

## 0. Estado atual verificado (ponto de partida)

| Camada | Hoje | Implicação p/ Fase 2 |
|---|---|---|
| Cliente | `supabase.ts` instancia só com env vars; `hasSupabase` flag | A costura já existe; é só ligar por feature-detect |
| Dados do colaborador | `storage.ts` já abstrai localStorage **+** Supabase (employees/progress/quiz/signatures/video_views) | Reusar; **mas** o schema está defasado (ver risco R1) |
| Migrations | `0001` schema, `0002` RLS **aberta `using(true)`**, `0003` access_code | Precisam de continuação + **hardening de RLS** |
| Conteúdo (módulos/termos/splash) | **100% localStorage** (`adminStore`, chave `pralis_admin_data`); lido por `content.ts:activeModules()` | **Núcleo da Fase 2**: migrar p/ Supabase como JSONB |
| Mídia | arquivos manuais em `/public`; `VideoUpload` só lê `file.name` | Substituir por upload real → Storage |
| Lis/áudio | `audioSrc`/`videoSrc` por caminho; char-sync em tempo real (sem cues) | Adicionar upload + (opcional) cues |
| Preview | `StoryPlayer` REAL escalado, lê o **Module-rascunho do estado do editor** | **Não muda** — independe de onde o conteúdo persiste |
| Admin (dono/gerente) | sessão local (`sessionStorage`), sem Supabase Auth | RLS forte depende de migrar p/ Supabase Auth |

**Drift de schema (crítico de notar):** desde as migrations `0001-0003` foram adicionados,
no código, campos que **não existem** nas tabelas: `employees` (`email`, `whatsapp`,
`birth_date`, `admission_date`, `store`, `status`), `signatures` (probatórios:
`terms`, `terms_version`, `document_hash`, `user_agent`, `signer_name`, `signer_cpf`,
`app_version`), além de `Module.status` e do tipo `poll` (sem tabela `poll_answers`). Hoje
isso é inofensivo (Supabase desligado), mas **ao ligar o Supabase**, `updateEmployee`
manda o patch completo e **quebra** se as colunas não existirem (R1).

---

## 1. Migrar módulos do localStorage para o Supabase

**Estratégia: JSONB por módulo** (uma linha = um `Module`), não tabelas normalizadas — o
app já consome `Module` aninhado e os `Story` são heterogêneos; JSONB = refactor mínimo.

```sql
create table if not exists training_modules (
  id          text primary key,          -- mantém o id atual do módulo (ex.: 'boas-vindas')
  slug        text,
  section     text,                       -- 'geral' | 'cargo' | 'final'
  roles       jsonb default '"all"',      -- 'all' | string[]
  active      boolean default true,
  status      text default 'draft',       -- 'draft' | 'published'
  "order"     int default 0,
  version     int default 1,
  content     jsonb not null,             -- = o objeto Module COMPLETO (stories[] incluso)
  updated_at  timestamptz default now(),
  published_at timestamptz
);
```

- **Loader** (em `content.ts`): `activeModules()` ganha um caminho `hasSupabase` que lê
  `training_modules` (status `published`, active) e devolve **o mesmo `Module[]`** (o
  `content` jsonb já É o Module). Mantém `localStorage` como **cache** (offline/PWA) e cai
  no `MODULES` default se Supabase indisponível. Como `content.ts` não é React, a leitura é
  feita em um pequeno cache em memória + revalidação (ou um hook `useModules()` no app que
  já busca async; ver R6).
- **Escrita** (admin): `saveModule()` (`adminStore`) passa a **upsert** em
  `training_modules` quando `hasSupabase`; sem Supabase, segue no `pralis_admin_data`.
- **Migração inicial (seed):** um script/admin-action que pega os 12 módulos default +
  qualquer edição local e faz upsert no Supabase (idempotente por `id`).

> `prepareStories()` continua rodando **no runtime** sobre o `Module` hidratado — quiz
> adaptativo, `reviewTarget`, injeção de vídeo-antes-do-quiz: **inalterados**.

## 2. Compatibilidade com o contrato `Module`/`Story`

- O `content jsonb` **é** o shape `Module` de `src/lib/types.ts`. O app continua chamando
  `modulesForRole()` / `getModule()` e recebendo `Module[]` idêntico. **Zero mudança no
  StoryPlayer/Feed.**
- Campos novos (`status`, `poll`) já existem no tipo e são retrocompatíveis (opcionais /
  aditivos). O filtro `status !== 'draft'` (já implementado em `content.ts`) vale igual.
- **Sem mudança de tipos** — só a **origem** dos dados muda (Supabase → mesmo `Module[]`).

## 3. Buckets de mídia (Supabase Storage)

| Bucket | Conteúdo | Acesso |
|---|---|---|
| `video` | MP4 (+ WebM opcional) | público (read) |
| `audio` | narrações da Lis (M4A/MP3) | público (read) |
| `image` | imagens de conteúdo | público (read) |
| `poster` | thumbnails de vídeo | público (read) |
| `attachment` | PDFs/materiais extras | **privado** → signed URL |
| `lis` | cues/WebVTT + bubble video | público (read) |

- **Cache-Control imutável** (`public, max-age=31536000, immutable`) + **path versionado**
  (`video/<moduleId>/<storyKey>--v<n>.mp4`) → nunca sobrescrever, cache eterno.
- Público para conteúdo de treinamento (não sensível); `attachment` privado com signed URL.
  O contrato da `Story` (`src/`/`audioSrc` = string URL) **não muda** — só passa a receber
  URL do Storage.
- Detalhe técnico (encode MP4 baseline, runtime cache do PWA) já em
  `docs/MEDIA_ARCHITECTURE.md`.

## 4. Upload de vídeos/áudios/imagens/anexos pelo Admin

Substituir o "upload" atual (que só lê `file.name`) por upload real **gated por
`hasSupabase`**:

```
Admin (drag&drop)
  → valida MIME/tamanho/dimensão no cliente
  → supabase.storage.from(bucket).upload(path, file, { cacheControl: '31536000', upsert:false })
  → getPublicUrl(path)  (ou createSignedUrl p/ attachment)
  → grava a URL no campo da Story (src / videoSrc / audioSrc / posterSrc)
```

- `VideoBlockEditor` / um novo `AudioField` / `ImageField` usam um hook `useUpload(bucket)`
  com barra de progresso. **Sem `hasSupabase`** → cai no comportamento atual (referência por
  caminho `/public`) para o modo local seguir funcionando.
- (Opcional, fase posterior) Edge Function de transcode/normalização + geração de poster.

## 5. Áudio da Lis + texto sincronizado

- **Default mantém o char-sync em tempo real** (sem timestamps) — zero regressão.
- **Aditivo:** entidade reutilizável `lis_lines` + cues opcionais:

```sql
create table if not exists lis_lines (
  id        uuid primary key default gen_random_uuid(),
  locale    text default 'pt-BR',
  text      text not null,
  audio_url text,                 -- bucket audio/ (null → TTS)
  state     text,                 -- reusa LisState
  cues      jsonb,                -- OPCIONAL: [{tSec, charIndex}] p/ sync preciso
  caption_vtt_url text,           -- OPCIONAL: WebVTT (legenda/i18n)
  updated_at timestamptz default now()
);
```

- O `Story type:'text'`/`'lis'` continua aceitando `audioSrc` inline **ou** (futuro) um
  `lisLineId`. Precedência no player: **cues → char-sync atual → TTS** (camada aditiva,
  detalhada em `MEDIA_ARCHITECTURE.md §5`).
- **Autoria visual** (timeline de cues) é incremento da Fase 2 — começa só com upload de
  áudio + texto; cues entram depois.

## 6. Como o preview real continua funcionando

**Não muda.** O `ModulePreview` renderiza o `StoryPlayer` REAL alimentado pelo
**Module-rascunho do estado do editor** — independe de onde o conteúdo é persistido. A
única diferença: os campos de mídia passam a apontar para **URLs do Storage** em vez de
`/public`, e o player já aceita qualquer URL absoluta. A prop aditiva `preview` segue
intacta. **Edição → preview ao vivo continua instantâneo.**

## 7. Proteção de dados e mídia com RLS

A RLS atual é **`using(true)` (aberta)** — aceitável hoje (Supabase desligado), **Crítico ao
ligar**. Hardening proposto:

- **`training_modules`:** `select` público só de `status='published' and active` (anon do
  app); `insert/update/delete` só para **`authenticated`** (admin via Supabase Auth) com
  checagem de papel.
- **Dados do colaborador (employees/progress/quiz/signatures/video_views):** fechar o
  `using(true)`. O app do colaborador escreve via **RPC `security definer`** que **valida o
  token** no servidor e só grava a linha daquele colaborador; remover `select`/`delete`
  amplos de `anon`. `signatures` vira **append-only** (proteção probatória).
- **CPF:** restringir leitura a admin autenticado (nunca `anon`); avaliar coluna dedicada.
- **Storage:** buckets de conteúdo públicos com Cache-Control imutável; `attachment`
  privado (signed URL). Upload só por `authenticated` (admin).
- **Admin (dono/gerente):** migrar para **Supabase Auth** (JWT) — o filtro dono/gerente
  passa a valer no banco (`gerente vê where gerenteId = auth.uid()`), não só no cliente.

> Esta é a frente de **maior risco e maior valor**; deve vir cedo e com ADR dedicado.

## 8. Manter o modo local/demo funcionando

- **`hasSupabase` em todo ponto de I/O.** Sem env vars → 100% localStorage (idêntico a
  hoje). O "demo" e o `?dev=1` seguem funcionando.
- Loaders sempre com **fallback**: Supabase indisponível/erro → cai no localStorage/cache →
  default `MODULES`. Nunca tela branca.
- Os reports e a experiência aprovada (Home, treinamento, CMS) **não dependem** do Supabase
  para rodar em dev.

## 9. Migrations necessárias (ordem)

| Migration | Conteúdo | Risco |
|---|---|---|
| **0004_content** | `training_modules` (JSONB) + `lis_lines` + `poll_answers` | Baixo (tabelas novas) |
| **0005_schema_drift** | `alter table employees add column …` (email/whatsapp/birth_date/admission_date/store/status) + `signatures` (terms/terms_version/document_hash/user_agent/signer_name/signer_cpf/app_version) | **Médio** — alinha o código atual ao banco (R1) |
| **0006_storage** | criar buckets (video/audio/image/poster/attachment/lis) + policies de Storage | Médio (one-way; ADR) |
| **0007_rls_hardening** | fechar `using(true)`; RPCs `security definer` validando token; `signatures` append-only; CPF restrito; policies de `training_modules` por papel | **Alto** (segurança; testar bem) |
| **0008_auth** (opcional, faseável) | `admin_users` + integração Supabase Auth p/ dono/gerente | Médio/Alto |

Todas **idempotentes** (`if not exists` / `add column if not exists`).

## 10. Riscos

| # | Risco | Mitigação |
|---|---|---|
| **R1** | **Drift de schema:** ao ligar Supabase, `updateEmployee`/`saveSignature` mandam colunas inexistentes → erro | Migration **0005** antes de ligar; **ou** whitelist de colunas no `storage.ts` por enquanto |
| **R2** | **RLS aberta** vira Crítico ao ligar (qualquer um lê/edita CPF e assinaturas) | **0007** + RPC token **antes** de produção com dados reais; ADR de segurança |
| **R3** | **content.ts é síncrono** hoje; ler do Supabase é async | Introduzir cache em memória + revalidação, **ou** um `useModules()`/loader async no boot; manter fallback local |
| **R4** | **Integridade probatória** da assinatura (IP/timestamp ainda client-side) | IP/`now()` via RPC no servidor (0007); `signatures` append-only |
| **R5** | **Mídia órfã / custo de Storage** (arquivos sem referência) | Path versionado + (futuro) job de limpeza; nunca deletar em uso |
| **R6** | **Migração de conteúdo** (localStorage → Supabase) com 2 admins editando | Seed idempotente por `id`; "fonte da verdade" passa a ser o Supabase quando ligado |
| **R7** | **Quebrar o modo local** | `hasSupabase` em todo I/O + fallback; testes nos 2 modos |
| **R8** | **Build pesado** ainda copia `/public` (já filtrado p/ formatos servidos) | Após migrar mídia p/ Storage, aposentar binários de `/public` |
| **R9** | **One-way** (Storage/ownership de mídia) | ADR dedicado em `docs/adr/` antes de mexer no código (D3) |

---

## Ordem de execução proposta (faseada)

- **P2.0 — Migrations base (sem ligar no app):** `0004` (conteúdo) + `0005` (drift) +
  `0006` (buckets). Criar projeto Supabase, aplicar, **sem** `VITE_SUPABASE_*` no app ainda.
- **P2.1 — Conteúdo:** loader `content.ts` com caminho Supabase + cache + fallback; `adminStore.saveModule` upsert; **seed** dos módulos atuais. Validar que o app lê do Supabase **e** continua funcionando sem ele.
- **P2.2 — Mídia/upload:** `useUpload(bucket)` + campos de upload no editor (vídeo/áudio/imagem/anexo) gravando URL na Story; runtime cache do PWA p/ mídia; migrar assets de `/public` um por um.
- **P2.3 — Lis/áudio:** upload de áudio + texto; `lis_lines` (reuso); **cues opcionais** (timeline) como incremento.
- **P2.4 — Segurança (crítico, antes de dados reais):** `0007` RLS + RPC token + `signatures` append-only + CPF restrito; `0008` Auth dono/gerente.
- **P2.5 — Aposentadoria do legado:** remover binários de `/public` + `copyPublicAssetsPlugin`; revisar.

> Recomendo **não** expor dados reais até a **P2.4** concluída (a RLS atual é aberta).

---

## Arquivos afetados (previsão)

- **Novos:** `supabase/migrations/0004…0008_*.sql`; `src/lib/contentRepo.ts` (loader/upsert de módulos); `src/lib/mediaStorage.ts` + hook `useUpload`; `src/admin/components/MediaField.tsx` (vídeo/áudio/imagem/anexo); `docs/adr/0001-media-storage.md`.
- **Alterados:** `src/lib/content.ts` (loader async/cache + fallback), `src/lib/adminStore.ts` (upsert Supabase), `src/lib/storage.ts` (alinhar colunas / RPC token), `src/admin/pages/AdminModuloEditor.tsx` (`VideoBlockEditor` → upload real; novos campos de mídia), `src/lib/types.ts` (se entrar `lisLineId`/poster), `vite.config.ts` (runtime cache de mídia; depois aposentar copy de `/public`).
- **Inalterados (linha vermelha):** `StoryPlayer.tsx`, `Feed.tsx`, todo `src/app/*` de runtime, `prepareStories`, regras de desbloqueio/progresso/conclusão/assinatura, contrato `Module`/`Story`.

---

## Checklist de validação (por fase)

**Conteúdo (P2.1)**
- [ ] Com `VITE_SUPABASE_*`: o app lê os módulos do `training_modules` e renderiza igual.
- [ ] Sem env vars: o app roda 100% localStorage (modo demo intacto).
- [ ] Supabase indisponível → fallback p/ cache/`MODULES` sem tela branca.
- [ ] Editar+Publicar no admin reflete no app (após reload); rascunho não aparece.
- [ ] `prepareStories`/desbloqueio/quiz adaptativo idênticos.

**Mídia (P2.2/2.3)**
- [ ] Upload de vídeo/áudio/imagem grava URL do Storage na Story; preview real toca a URL.
- [ ] Anexo privado abre via signed URL; público via Cache-Control imutável.
- [ ] Sem Supabase: campos de mídia caem no modo `/public` (sem quebrar).
- [ ] PWA: runtime cache de mídia (CacheFirst + rangeRequests) funcionando.

**Segurança (P2.4)**
- [ ] `anon` **não** lê `employees`/`signatures` de terceiros (RLS fechada).
- [ ] Escrita do colaborador só via RPC com token válido; `signatures` append-only.
- [ ] CPF não exposto a `anon`. Dono/gerente filtrados por `auth.uid()` no banco.
- [ ] Upload só por admin autenticado.

**Gate final**
- [ ] `tsc -b` + `vite build` verdes nos 2 modos.
- [ ] Nenhuma regressão na Home/treinamento aprovados.

---

## Decisão pendente (sua)
1. Aprova a **estratégia JSONB** para `training_modules` (vs. normalizar)?
2. Confirma a **ordem faseada** (P2.0 migrations → P2.1 conteúdo → P2.2 mídia → P2.3 Lis →
   **P2.4 segurança antes de dados reais** → P2.5 legado)?
3. Topa migrar o **admin para Supabase Auth** (necessário p/ RLS forte dono/gerente) nesta
   fase, ou deixar o login admin como está por enquanto (RLS de conteúdo/colaborador
   primeiro)?
4. Quer que eu comece por **P2.0 + P2.1 (conteúdo)** — o menor passo que já prova a
   plataforma compartilhada — e só depois mídia/segurança?

**Não implemento nada até sua aprovação.**
