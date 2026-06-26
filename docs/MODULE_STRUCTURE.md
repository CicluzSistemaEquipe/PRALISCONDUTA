# Estrutura de Módulos — Pralis Conduta

> **O que é este documento.** A referência única (single source of truth) de como o
> conteúdo de treinamento é modelado hoje, como o app consome esse conteúdo e qual é o
> esquema-alvo para migrar a autoria do código para o Supabase **sem mudar a experiência
> do colaborador**.
>
> **Para quem é.** Quem vai editar conteúdo (admin/autoria), evoluir o storage (Supabase)
> ou implementar novos tipos de bloco (ex.: enquete). Para o leitor não-técnico há resumos
> em PT-BR; os contratos (tipos TypeScript, SQL) ficam em inglês e exatos.

**Contrato inviolável.** O app consome `Module[]` via `modulesForRole()` / `getModule()`
(`src/lib/content.ts:1148` e `src/lib/content.ts:1155`) e renderiza `module.stories[]` **na
ordem do array** (o `StoryPlayer` em `src/app/pages/Module.tsx`). Qualquer evolução de
storage/autoria/mídia/admin deve **preservar esse shape e essa ordem**. Tudo o que está
abaixo é descrito para manter esse contrato intacto.

---

## 1. Modelo de dados atual (completo)

Todos os tipos estão em `src/lib/types.ts`. O conteúdo concreto dos 12 módulos está em
`src/lib/content.ts` (array `RAW_MODULES`, `src/lib/content.ts:14`).

### 1.1 `Module` — `src/lib/types.ts:162-194`

A unidade que o app renderiza. Os campos dividem-se em **conteúdo** e **metadados visuais**
(estes últimos vêm de `MODULE_META`, ver §1.10).

| Campo              | Tipo                              | Obrigatório | Descrição |
|--------------------|-----------------------------------|-------------|-----------|
| `id`               | `string`                          | sim         | Identificador estável (slug). Ex.: `'boas-vindas'`. |
| `title`            | `string`                          | sim         | Título do módulo. |
| `icon`             | `string`                          | sim         | Nome de ícone lucide-react (legado). Ex.: `'HeartHandshake'`. |
| `color`            | `string`                          | sim         | Cor base (hex). |
| `estimatedMinutes` | `number`                          | sim         | Tempo estimado de conclusão. |
| `mandatory`        | `boolean`                         | sim         | Se é obrigatório. |
| `roles`            | `'all' \| Role[]`                 | sim         | Direcionamento por cargo/segmento (ver §2). |
| `section`          | `'geral' \| 'cargo' \| 'final'`   | não         | Agrupa o módulo no feed (ver §2). |
| `description`      | `string`                          | sim         | Descrição curta. |
| `stories`          | `Story[]`                         | sim         | **A sequência de blocos, renderizada na ordem do array.** |
| `number`           | `string`                          | sim (meta)  | Ordem exibida no card: `"01".."12"`. |
| `gradient`         | `[string, string]`                | sim (meta)  | Gradiente do card `[topo, base]`. |
| `accent`           | `string`                          | sim (meta)  | Cor de acento (header dos stories, quiz). |
| `iconType`         | `ModuleIconType`                  | sim (meta)  | 1 de 10 ícones da marca (ver §1.11). |
| `tag`              | `string`                          | sim (meta)  | Etiqueta curta (`FUNDAMENTOS`, `CARREIRA`…). |
| `subtitle`         | `string`                          | sim (meta)  | Subtítulo do card. |
| `kind`             | `'stories' \| 'signature'`        | não         | `'signature'` abre a tela de assinatura no lugar dos stories. Default `'stories'`. |
| `active`           | `boolean`                         | não         | Visibilidade no app (editável no admin). `undefined` === ativo. |

> Em `content.ts`, os módulos são declarados como `RawModule` (`src/lib/content.ts:9-12`),
> que é o `Module` **sem** os campos de metadado visual; estes são mesclados depois a partir
> de `MODULE_META` em `MODULES` (`src/lib/content.ts:1055-1060`).

### 1.2 `Story` — união de 6 tipos — `src/lib/types.ts:134-158`

```ts
export type Story =
  | { type: 'lis'; text: string; state?: LisState; videoSrc?: string }
  | { type: 'text'; title: string; tag: string; paragraphs: string[];
      highlight?: string; highlights?: string[]; keywords?: string[];
      audioSrc?: string; audioIncludesTitle?: boolean; narratorVideoSrc?: string }
  | { type: 'video'; videoId: string; title: string; description?: string;
      duration?: string; src?: string }
  | { type: 'summary'; title: string; bullets: string[] }
  | ({ type: 'quiz' } & QuizConfig)
  | { type: 'completion'; badge: string; message: string }
```

A ordem dos elementos no array `stories[]` **é** a ordem de apresentação. Os 6 tipos:

### 1.3 Story `'lis'` — fala da Lis (mascote)

| Campo      | Tipo        | Descrição |
|------------|-------------|-----------|
| `type`     | `'lis'`     | — |
| `text`     | `string`    | Fala da Lis. |
| `state`    | `LisState?` | Expressão/pose (ver §1.9). |
| `videoSrc` | `string?`   | Vídeo `.webm` da Lis (alpha). Ex.: `'/lis-conduta1-alpha.webm'`. |

Exemplo real (`src/lib/content.ts:29-34`):

```ts
{ type: 'lis', state: 'celebrating', videoSrc: '/lis-conduta1-alpha.webm',
  text: 'Oi! Eu sou a Lis. Antes de tudo, quero te apresentar algo muito importante: o nosso Código de Ética e Conduta...' }
```

### 1.4 Story `'text'` — bloco de leitura narrado

| Campo               | Tipo        | Descrição |
|---------------------|-------------|-----------|
| `type`              | `'text'`    | — |
| `title`             | `string`    | Título do bloco. |
| `tag`               | `string`    | Etiqueta curta (ex.: `'O que é'`). |
| `paragraphs`        | `string[]`  | Parágrafos do conteúdo. |
| `highlight`         | `string?`   | Frase de destaque (callout). |
| `highlights`        | `string[]?` | Palavras a realçar em laranja no texto. |
| `keywords`          | `string[]?` | Chips de conceito (opcional). |
| `audioSrc`          | `string?`   | MP3 narrado pela Lis; sincroniza barra de progresso e leitura. |
| `audioIncludesTitle`| `boolean?`  | `false` quando o MP3 começa direto nos parágrafos. |
| `narratorVideoSrc`  | `string?`   | Vídeo circular da Lis falando junto ao áudio. |

Exemplo real (`src/lib/content.ts:36-48`):

```ts
{ type: 'text', tag: 'O que é', title: 'Por que este Código existe?',
  audioSrc: '/audio-boas-vindas-codigo-existe.mp3',
  paragraphs: [ 'O Código de Ética e Conduta da Pralís existe para garantir...', /* … */ ],
  highlights: ['respeito', 'clareza', 'cultura', 'obrigação'],
  highlight: 'Se você tiver comprometimento, humildade e respeito, terá evolução e resultado!' }
```

### 1.5 Story `'video'` — vídeo

| Campo         | Tipo       | Descrição |
|---------------|------------|-----------|
| `type`        | `'video'`  | — |
| `videoId`     | `string`   | ID estável do vídeo (usado em `VideoView`, ver §1.8). |
| `title`       | `string`   | Título exibido. |
| `description` | `string?`  | Legenda curta. |
| `duration`    | `string?`  | Duração exibida (ex.: `'1:30'`). |
| `src`         | `string?`  | URL do vídeo; **se ausente vira placeholder**. |

Vídeos podem ser **injetados automaticamente** antes do quiz (ver §1.12 e §3).

### 1.6 Story `'summary'` — resumo em tópicos

| Campo     | Tipo        | Descrição |
|-----------|-------------|-----------|
| `type`    | `'summary'` | — |
| `title`   | `string`    | Título do resumo. |
| `bullets` | `string[]`  | Pontos-chave. |

### 1.7 Story `'quiz'` — `({ type: 'quiz' } & QuizConfig)`

Estende `QuizConfig` (`src/lib/types.ts:119-132`):

```ts
export interface QuizConfig {
  intro?: { eyebrow?: string; title: string; description: string; voiceText?: string; cta?: string }
  questions: QuizQuestion[]
  sampleSize?: number   // quantas perguntas sortear do banco
  randomize?: boolean   // sorteio estável por colaborador/módulo
}
```

`QuizQuestion` (`src/lib/types.ts:103-117`):

| Campo                | Tipo                                   | Descrição |
|----------------------|----------------------------------------|-----------|
| `id`                 | `string`                               | ID estável da pergunta (ex.: `'bv-q1'`). |
| `prompt`             | `string`                               | Enunciado. |
| `options`            | `string[]`                             | Alternativas. |
| `correctIndex`       | `number`                               | Índice da correta em `options`. |
| `explain`            | `string`                               | Explicação geral após responder. |
| `optionExplanations` | `string[]?`                            | Explicação por alternativa; se ausente usa `explain`. |
| `reviewTarget`       | `{ storyIndex: number; label?: string }?` | Trecho recomendado para revisão ao errar. |

Exemplo real de pergunta (`src/lib/content.ts:75-87`):

```ts
{ id: 'bv-q1', prompt: 'Qual é a obrigação de todo colaborador em relação ao Código de Conduta?',
  options: [ 'Apenas assiná-lo no primeiro dia sem precisar ler', 'Conhecer e cumprir com as suas normas', /* … */ ],
  correctIndex: 1,
  explain: 'Exato! Todo colaborador tem a obrigação de conhecer e cumprir as normas...' }
```

> `sampleSize`, `randomize` e `reviewTarget` são **autocompletados** por `prepareStories()`
> quando ausentes (ver §1.12). Na autoria você normalmente só declara `intro` + `questions`.

### 1.8 Story `'completion'` — encerramento do módulo

| Campo     | Tipo           | Descrição |
|-----------|----------------|-----------|
| `type`    | `'completion'` | — |
| `badge`   | `string`       | Nome da conquista (ex.: `'Base Sólida'`). |
| `message` | `string`       | Mensagem de parabéns. |

### 1.9 `LisState` — 8 valores — `src/lib/types.ts:93-101`

`'neutral' | 'idle' | 'talking' | 'celebrating' | 'thinking' | 'alert' | 'correct' | 'wrong'`

### 1.10 Metadados visuais — `MODULE_META` — `src/lib/content.ts:991-1004`

Mapa `id → { number, gradient, accent, iconType, tag, subtitle }`, mesclado em cada módulo.
A coluna `number` (`"01".."12"`) **espelha a ordem do array** `RAW_MODULES`.

### 1.11 `ModuleIconType` — 10 ícones — `src/lib/types.ts:160`

`'flower' | 'sprout' | 'grain' | 'wheat' | 'bread' | 'croissant' | 'cake' | 'star' | 'heart' | 'chef'`

### 1.12 Termos e assinatura

`TERMS` (`src/lib/content.ts:1064-1085`) define os 4 documentos assináveis ao final:

| `id`               | `title`                              |
|--------------------|--------------------------------------|
| `compromisso`      | Termo de Compromisso                 |
| `imagem`           | Termo de Uso de Nome, Voz e Imagem   |
| `confidencialidade`| Termo de Confidencialidade           |
| `nao-aliciamento`  | Termo de Não Aliciamento             |

O módulo 12 (`assinatura`) usa `kind: 'signature'`, que troca os stories pela tela de
assinatura. O registro fica em `SignatureRecord` (ver §1.13).

### 1.13 Entidades de runtime (progresso e auditoria)

São persistidas pelo storage (hoje localStorage; alvo Supabase), **separadas do conteúdo**.

**`Employee`** — `src/lib/types.ts:36-46`

| Campo         | Tipo      | Descrição |
|---------------|-----------|-----------|
| `id`          | `string`  | ID do colaborador. |
| `name`        | `string`  | Nome. |
| `phone`       | `string`  | Telefone/matrícula (usado como token de acesso). |
| `role`        | `Role`    | Cargo selecionável (1 dos 10, ver §2). |
| `token`       | `string`  | Token de acesso. |
| `access_code` | `string?` | Código de acesso opcional. |
| `gerenteId`   | `string?` | ID do `AdminUser` role `'gerente'` responsável. |
| `created_at`  | `string`  | ISO. |

**`ModuleProgress`** — `src/lib/types.ts:48-53`: `{ module_id, story_index, completed, completed_at }`.
Marca até onde o colaborador avançou em cada módulo (`story_index` = posição no array).

**`QuizAnswerRecord`** — `src/lib/types.ts:55-63`:
`{ module_id, question_id, answer, correct, answered_at, reviewed?, reviewed_at? }`.

**`SignatureRecord`** — `src/lib/types.ts:65-70`:
`{ signed_at, ip_address, confirmed, terms[] }`.

**`VideoView`** — `src/lib/types.ts:72-76`: `{ module_id, video_id, watched_at }`.

> **Fronteira importante.** `Module`/`Story` = **conteúdo** (autoria). `Employee`,
> `ModuleProgress`, `QuizAnswerRecord`, `SignatureRecord`, `VideoView` = **runtime/auditoria
> por colaborador**. A migração para Supabase trata as duas famílias em tabelas distintas.

---

## 2. Section, roles e ordem

### 2.1 `section` — agrupamento no feed

Cada módulo declara uma `section` que organiza o feed em três faixas (na ordem do array):

| `section` | Quantos | Módulos | Direcionamento |
|-----------|---------|---------|----------------|
| `geral`   | 4       | `boas-vindas`, `jornada-colaborador`, `deveres`, `proibido` | `roles: 'all'` |
| `cargo`   | 5       | `preparo-alimentos`, `atendimento-cliente`, `caixa`, `limpeza`, `funcao-externa` | `roles: [<segmento>]` |
| `final`   | 3       | `fornecedores-sociedade`, `penalidades`, `assinatura` | `roles: 'all'` |

(Refs: `src/lib/content.ts:26, 122, 232, 365, 504, 571, 637, 703, 768, 835, 903, 971`.)

### 2.2 `roles` — direcionamento

`modulesForRole(role)` (`src/lib/content.ts:1148-1153`) filtra:

```ts
return activeModules().filter((m) => {
  if (m.roles === 'all') return true
  return role ? m.roles.includes(role as never) : false
})
```

Ou seja: **`m.roles === 'all'` OU `role ∈ m.roles`.** A comparação é por **igualdade exata
de string**.

### 2.3 Os 10 cargos selecionáveis vs. os 4 segmentos amplos

O tipo `Role` (`src/lib/types.ts:5-21`) tem 14 valores, divididos em dois grupos:

- **10 cargos selecionáveis** — array `ROLES` (`src/lib/types.ts:23-34`), os únicos
  oferecidos no admin/onboarding (`AdminColaboradores.tsx:149` e `:231` iteram `ROLES`):
  `Padeiro`, `Confeiteiro`, `Atendente de Balcão`, `Caixa`, `Auxiliar de Cozinha`,
  `Auxiliar de Produção`, `Gerente de Loja`, `Estoquista`, `Entregador`, `Serviços Gerais`.
- **4 segmentos amplos** — fazem parte de `Role` mas **NÃO** estão em `ROLES`, portanto
  **não são selecionáveis**. Servem só para **agrupar módulos de cargo**:
  `Preparo de alimentos`, `Atendimento ao cliente`, `Limpeza`, `Função externa`
  (`src/lib/types.ts:16-21`).

Os 5 módulos de `section: 'cargo'` são direcionados a **segmentos**, não a cargos:

| Módulo               | `roles`                      | Segmento alvo            |
|----------------------|------------------------------|--------------------------|
| `preparo-alimentos`  | `['Preparo de alimentos']`   | Preparo de alimentos     |
| `atendimento-cliente`| `['Atendimento ao cliente']` | Atendimento ao cliente   |
| `caixa`              | `['Caixa']`                  | (cargo `Caixa`)          |
| `limpeza`            | `['Limpeza']`                | Limpeza                  |
| `funcao-externa`     | `['Função externa']`         | Função externa           |

**Mapeamento conceitual cargo → segmento** (intenção de produto: cada cargo pertence a um ou
mais segmentos amplos):

| Cargo (selecionável)   | Preparo de alimentos | Atendimento ao cliente | Limpeza | Função externa |
|------------------------|:--------------------:|:----------------------:|:-------:|:--------------:|
| Padeiro                | ✓                    |                        | ✓       |                |
| Confeiteiro            | ✓                    |                        | ✓       |                |
| Auxiliar de Cozinha    | ✓                    |                        | ✓       |                |
| Auxiliar de Produção   | ✓                    |                        | ✓       |                |
| Atendente de Balcão    |                      | ✓                      | ✓       |                |
| Caixa                  |                      | ✓ (+ módulo `caixa`)   | ✓       |                |
| Gerente de Loja        |                      | ✓                      | ✓       | ✓              |
| Estoquista             |                      |                        | ✓       | ✓              |
| Entregador             |                      |                        |         | ✓              |
| Serviços Gerais        |                      |                        | ✓       |                |

> **Gotcha de implementação a observar (não é mudança deste doc, é um ponto de atenção para
> a evolução).** Hoje `Employee.role` recebe **um dos 10 cargos** e `modulesForRole` faz
> **igualdade exata** contra `m.roles`. Como os módulos de cargo gatilham por **segmento**
> (`'Preparo de alimentos'`, etc.) e não por cargo, a tabela conceitual acima **só será
> respeitada** se houver uma tradução cargo → segmento(s) na seleção dos módulos. O módulo
> `caixa` é a exceção que casa direto (`roles: ['Caixa']` === cargo `Caixa`). Ao migrar para
> Supabase (§4), o loader/`modulesForRole` deve aplicar esse mapa para que cada cargo veja os
> módulos de seus segmentos. **Documentado aqui como contrato esperado; a regra exata de
> mapeamento deve ser confirmada com o solution-architect antes de implementar.**

### 2.4 Ordem

A ordem dos módulos no feed = **ordem do array `RAW_MODULES`** (`src/lib/content.ts:14`),
espelhada em `MODULE_META[id].number` (`"01".."12"`). A ordem dos `stories[]` dentro de cada
módulo = ordem do array. No esquema-alvo isso vira a coluna inteira `order` (§4).

---

## 3. Anatomia de um módulo

Sequência pedagógica típica (não rígida, mas é o padrão observado nos 12 módulos):

```
┌─────────────────────────────────────────────────────────────────┐
│  lis        → Lis abre o tema (fala curta + vídeo .webm)          │
│  text       → bloco(s) de leitura narrada (audioSrc + highlights) │
│  text       → (quantos forem necessários)                         │
│  summary?   → resumo em tópicos (opcional)                        │
│  video      → injetado AUTOMATICAMENTE antes do quiz se faltar    │
│  quiz       → checagem de entendimento (intro + questions)        │
│  completion → badge + mensagem de parabéns                        │
└─────────────────────────────────────────────────────────────────┘
                 ▲ renderizado nesta ordem pelo StoryPlayer
                   (src/app/pages/Module.tsx)
```

Exemplo concreto — módulo `boas-vindas` (`src/lib/content.ts:28-107`):
`lis → text → text → (video injetado) → quiz → completion`.

### Como `prepareStories()` normaliza — `src/lib/content.ts:1033-1053`

Antes de o app receber o `Module`, cada módulo passa por `prepareStories()`:

1. **`ensureVideoBeforeQuiz(m)`** (`:1011-1024`): se o módulo tem um `quiz` mas **nenhum**
   story `'video'`, injeta um `'video'` placeholder (`videoId: '<id>-video'`,
   `title: 'Lis explica: <title>'`, `duration: '1:30'`) **imediatamente antes** do primeiro
   quiz. Garante "ver vídeo antes do quiz".
2. **Autocompleta o quiz**: `sampleSize ?? Math.min(3, questions.length)` e
   `randomize ?? true`.
3. **`reviewTarget`**: para cada pergunta sem `reviewTarget`, aponta para o `text`/`summary`
   anterior mais próximo do quiz (`previousReviewIndex`, `:1026-1031`), com
   `label: 'Rever esse trecho'`.

O sorteio do `randomize` é **estável por colaborador/módulo** (seeded): a mesma pessoa vê
sempre o mesmo subconjunto de perguntas naquele módulo.

> **Importante para a migração.** `prepareStories()` roda **tanto** no conteúdo hardcoded
> (`MODULES`, `:1055-1060`) **quanto** no conteúdo vindo do admin/localStorage
> (`activeModules`, `:1126-1145`). No esquema Supabase, o `content jsonb` deve ser o
> `Module` **antes** dessa normalização (autoria "crua"), e o loader continua aplicando
> `prepareStories()` na hidratação — assim o app recebe exatamente o mesmo shape de hoje.

---

## 4. Esquema-alvo de conteúdo (Decisão D2)

**Princípio.** O `content jsonb` **É** o `Module` atual. Migrar = **empacotar** cada um dos
12 módulos hardcoded numa linha da tabela. O app **não muda**: um loader lê as linhas,
desempacota o `content` em `Module`, aplica `prepareStories()` e entrega o mesmo `Module[]`.
O `localStorage` (`pralis_admin_data`) passa a ser **cache**, não a fonte.

### 4.1 Tabela `training_modules`

```sql
create table public.training_modules (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,              -- = Module.id (ex.: 'boas-vindas')
  section      text not null,                     -- 'geral' | 'cargo' | 'final'
  roles        jsonb not null,                    -- 'all' (string) OU array de Role
  active       boolean not null default true,     -- = Module.active (visível no app)
  "order"      integer not null,                  -- ordem no feed (espelha number "01".."12")
  version      integer not null default 1,        -- versão do conteúdo (incrementa ao publicar)
  content      jsonb not null,                    -- = Module COMPLETO (autoria crua, pré-prepareStories)
  updated_at   timestamptz not null default now(),
  published_at timestamptz                        -- null = rascunho; data = publicado/visível
);

create index training_modules_order_idx on public.training_modules ("order");
create index training_modules_section_idx on public.training_modules (section);
```

> **Boundary público/secreto.** A leitura de `training_modules` é feita pelo client com a
> **anon key** sob RLS — só linhas `active = true` e `published_at is not null` devem ser
> legíveis publicamente. **Escrita** (autoria no admin) exige usuário autenticado
> dono/gerente. **Nunca** usar a `service_role` no client. (A política RLS exata pertence ao
> supabase-specialist; este doc define apenas o shape.)

### 4.2 Exemplo de 1 linha

```jsonc
{
  "slug": "boas-vindas",
  "section": "geral",
  "roles": "all",
  "active": true,
  "order": 1,
  "version": 1,
  "content": {
    "id": "boas-vindas",
    "title": "Código de Conduta",
    "icon": "HeartHandshake",
    "color": "#b8860b",
    "estimatedMinutes": 3,
    "mandatory": true,
    "roles": "all",
    "section": "geral",
    "description": "Por que ele existe e o que ele significa para você.",
    "number": "01",
    "gradient": ["#b8860b", "#7a5a08"],
    "accent": "#b8860b",
    "iconType": "flower",
    "tag": "FUNDAMENTOS",
    "subtitle": "Conheça a Pralís",
    "kind": "stories",
    "stories": [
      { "type": "lis", "state": "celebrating", "videoSrc": "/lis-conduta1-alpha.webm",
        "text": "Oi! Eu sou a Lis..." },
      { "type": "text", "tag": "O que é", "title": "Por que este Código existe?",
        "audioSrc": "/audio-boas-vindas-codigo-existe.mp3",
        "paragraphs": ["..."], "highlights": ["respeito"], "highlight": "..." },
      { "type": "quiz", "intro": { "title": "Vamos ver o que ficou claro?", "description": "..." },
        "questions": [ { "id": "bv-q1", "prompt": "...", "options": ["..."], "correctIndex": 1, "explain": "..." } ] },
      { "type": "completion", "badge": "Base Sólida", "message": "Você entendeu o propósito do nosso Código..." }
    ]
  }
}
```

> Note que `roles`, `section`, `active`, `order` aparecem **tanto** como colunas (para
> filtrar/ordenar em SQL, Decisão D6) **quanto** dentro de `content` (porque o app lê o
> `Module` inteiro). O loader deve manter os dois em sincronia — a coluna é a autoridade para
> consulta; o espelho em `content` mantém o shape do `Module`.

### 4.3 Ordenação no dashboard === ordenação no app (Decisão D6)

A coluna inteira `order` é a fonte única de ordem. Reordenar no dashboard = `UPDATE` em
`order`. As **perguntas de quiz também são ordenáveis** — mas a ordem delas vive **dentro**
do `content.stories[].questions[]` (ordem do array), não em coluna própria.

### 4.4 Entidade reutilizável `lis_lines` (Decisão D5 — opcional/futuro)

Hoje a fala da Lis é **inline** (`'lis'.text` e `'text'.audioSrc`). Proposta **aditiva e
retrocompatível** de uma entidade reutilizável para reaproveitamento e tradução:

```sql
create table public.lis_lines (
  id        uuid primary key default gen_random_uuid(),
  key       text not null unique,   -- chave estável legível (ex.: 'boas-vindas.abertura')
  text      text not null,          -- fala da Lis
  audio_url text,                   -- MP3 narrado
  state     text,                   -- LisState (ex.: 'celebrating')
  captions  jsonb                   -- legendas/timestamps (opcional, p/ acessibilidade/i18n)
);
```

Um story `'lis'` poderia **referenciar** `lis_line_id` **OU** manter `text` inline. Como é
opcional, o shape atual continua válido (quem não usa `lis_line_id` segue como hoje).
**Não é necessária para a migração inicial** — entra quando houver demanda de
reaproveitamento/tradução.

---

## 5. Como adicionar a Enquete sem quebrar nada (Decisão D7)

A enquete é um **novo membro da união `Story`**, `'poll'`, **aditivo**: não altera nenhum dos
6 tipos atuais. Quem não usa `'poll'` não percebe diferença.

### 5.1 Shape proposto (aditivo a `src/lib/types.ts:134-158`)

```ts
export type Story =
  | { type: 'lis'; /* … */ }
  | { type: 'text'; /* … */ }
  | { type: 'video'; /* … */ }
  | { type: 'summary'; /* … */ }
  | ({ type: 'quiz' } & QuizConfig)
  | { type: 'completion'; /* … */ }
  // NOVO — aditivo:
  | { type: 'poll'; question: string; options: string[];
      allowMultiple?: boolean; anonymous?: boolean }
```

Registro de resposta (runtime, futuro — análogo a `QuizAnswerRecord`):

```ts
export interface PollAnswer {
  module_id: string
  story_index: number   // posição da enquete no array de stories
  selected: number[]    // índices escolhidos em options (múltiplos se allowMultiple)
  answered_at: string
}
```

### 5.2 O que cada camada precisa

1. **Tipo** (`src/lib/types.ts`): adicionar o membro `'poll'` à união `Story` e (quando
   houver coleta) a interface `PollAnswer`.
2. **App** (`src/app/pages/Module.tsx`): adicionar um `PollCard` ao `switch`/render do
   `StoryPlayer`. Como o app já itera `module.stories[]` por `type`, um novo `case 'poll'`
   é puramente aditivo — os outros casos não mudam.
3. **Admin**: adicionar um editor de `'poll'` ao editor de stories (`AdminModuloEditor.tsx`),
   permitindo criar/ordenar o bloco como qualquer outro story.
4. **`prepareStories()`**: nenhuma mudança obrigatória — `'poll'` passa intacto (a função só
   trata `'quiz'`). Se no futuro a enquete precisar de normalização, segue o mesmo padrão.

> **Sem impacto retroativo.** Nenhum módulo existente passa a ter `'poll'` automaticamente;
> ele aparece só onde o autor inserir. Isso satisfaz D7 (opcional e aditivo).

---

## 6. Integridade e versionamento de conteúdo

Como o app continua consumindo o **mesmo `Module[]`** enquanto o storage evolui:

| Mecanismo      | Regra |
|----------------|-------|
| `active`       | `active = false` (ou coluna `active = false`) **esconde** o módulo do feed. `undefined`/`true` === visível. Hoje filtrado em `activeModules()` (`src/lib/content.ts:1133`); no Supabase, filtrado por coluna/RLS. |
| `published_at` | `null` = rascunho (autoria em andamento, invisível ao colaborador); data preenchida = publicado. O loader público só lê linhas publicadas. |
| `version`      | Inteiro que **incrementa a cada publicação**. Permite auditar qual versão um colaborador viu e detectar drift entre cache (localStorage) e Supabase. |
| `order`        | Inteiro, fonte única de ordem (dashboard === app, D6). |

**Fluxo de hidratação alvo** (mantendo o contrato):

```
Supabase training_modules (linhas, content jsonb)
        │  loader: filtra active + published_at, ordena por "order"
        ▼
content jsonb  →  Module (autoria crua)
        │  prepareStories()  (mesma função de hoje, src/lib/content.ts:1033)
        ▼
Module[]  →  modulesForRole() / getModule()  →  StoryPlayer renderiza stories[] na ordem
        │
        └─ localStorage 'pralis_admin_data' = CACHE (não fonte)
```

O app (`modulesForRole`, `getModule`, `StoryPlayer`) **não muda**: ele recebe `Module[]` com
o shape de §1, na ordem de §2.4, com os stories normalizados de §3. Toda a evolução
(Supabase, mídia, enquete, `lis_lines`) é **aditiva** ou acontece **antes** da fronteira
`Module[]`.

---

## Referências de código (single source of truth)

| Assunto | Arquivo:linha |
|---------|---------------|
| `Module`                         | `src/lib/types.ts:162-194` |
| `Story` (união de 6)             | `src/lib/types.ts:134-158` |
| `QuizConfig` / `QuizQuestion`    | `src/lib/types.ts:119-132` / `:103-117` |
| `LisState`                       | `src/lib/types.ts:93-101` |
| `ModuleIconType`                 | `src/lib/types.ts:160` |
| `Employee` / `ModuleProgress`    | `src/lib/types.ts:36-46` / `:48-53` |
| `QuizAnswerRecord` / `SignatureRecord` / `VideoView` | `src/lib/types.ts:55-63` / `:65-70` / `:72-76` |
| `Role` / `ROLES`                 | `src/lib/types.ts:5-21` / `:23-34` |
| `RAW_MODULES` (12 módulos)       | `src/lib/content.ts:14` |
| `MODULE_META` (metadados)        | `src/lib/content.ts:991-1004` |
| `ensureVideoBeforeQuiz`          | `src/lib/content.ts:1011-1024` |
| `prepareStories`                 | `src/lib/content.ts:1033-1053` |
| `MODULES` (export final)         | `src/lib/content.ts:1055-1060` |
| `TERMS`                          | `src/lib/content.ts:1064-1085` |
| `activeModules` (override admin) | `src/lib/content.ts:1126-1145` |
| `modulesForRole` / `getModule`   | `src/lib/content.ts:1148-1153` / `:1155-1157` |
| Render dos stories (StoryPlayer) | `src/app/pages/Module.tsx` |
