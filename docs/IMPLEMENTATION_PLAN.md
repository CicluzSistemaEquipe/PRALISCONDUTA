# Plano de Implementação — Plataforma de Treinamento Pralís

> Documento de **síntese**. Reúne e amarra os cinco documentos técnicos desta etapa:
> [`TRAINING_PLATFORM_ARCHITECTURE.md`](./TRAINING_PLATFORM_ARCHITECTURE.md),
> [`DASHBOARD_CONTENT_FLOW.md`](./DASHBOARD_CONTENT_FLOW.md),
> [`MODULE_STRUCTURE.md`](./MODULE_STRUCTURE.md),
> [`MEDIA_ARCHITECTURE.md`](./MEDIA_ARCHITECTURE.md) e
> [`FUTURE_ROADMAP.md`](./FUTURE_ROADMAP.md).
> Cada um deles é a **fonte canônica** do seu tema; aqui a gente conecta tudo e mostra a sequência.

---

## Sumário executivo

A Pralís Conduta já é um produto que **funciona de ponta a ponta**: o colaborador entra,
percorre os 12 módulos no formato de "stories", responde quizzes adaptativos, vê a Lis
(personagem-guia) com sincronização de fala em tempo real e, ao final, assina os quatro
termos. A Home do colaborador acabou de ser evoluída para a **Trilha Viva** (herói
"Continuar", Lis como guia, bandas de seção com marquee, cadeado glass, topo/rodapé marrom)
e está **aprovada como base oficial**.

O que **não** está pronto é o lado de **autoria e operação** do conteúdo. Hoje todo o
conteúdo nasce **hardcoded** em `src/lib/content.ts` (12 módulos) e/ou é editado no admin e
gravado em `localStorage` (chave `pralis_admin_data`). Isso significa: cada navegador/admin
tem a sua cópia, sem sincronização; a mídia (vídeos da Lis, áudios MP3) é copiada **à mão**
para `/public`; e não há publicação versionada nem upload pelo painel.

Este plano propõe **evoluir a camada de autoria, storage e mídia sem tocar na experiência
do colaborador**. O contrato `Module`/`Story` (`src/lib/types.ts`) é o eixo que preserva
tudo: o app continua lendo `modulesForRole()` / `getModule()` (`src/lib/content.ts:1148` e
`:1155`) e renderizando `module.stories[]` na ordem do array. A diferença é a **origem** do
dado — passa a ser hidratado do Supabase, com `localStorage` virando apenas **cache**.

> **Importante (escopo desta etapa):** nesta entrega **não** se implementa a plataforma.
> Entrega-se a **análise + os 6 documentos** (este + os 5 referenciados). A única alteração
> de código feita foi um ajuste pequeno e já concluído na Home (o texto que passa nas bandas
> de seção). A implementação da **Fase 1** começa **somente após a aprovação deste plano**.

### Tabela de faseamento

| Fase | Foco | Entregáveis principais | Risco / refactor | Depende de |
|------|------|------------------------|------------------|------------|
| **P1** | Conteúdo → Supabase + Mídia → Storage + Upload no admin | Tabela `training_modules` (`content jsonb` = `Module`); loader que hidrata `Module[]` com cache local; buckets de Storage; upload drag&drop no admin gravando URL em `audioSrc`/`videoSrc`/`src` | Baixo — retrocompatível, app não muda (D2, D3) | Aprovação deste plano |
| **P2** | Lis records + cues + enquete + versionamento | Lis como registros reutilizáveis/traduzíveis + cues/legendas opcionais; novo tipo de Story `poll`; coluna `order`; publish/rascunho | Médio — aditivo, sem quebrar contrato (D5, D6, D7) | P1 estável |
| **P3** | Avisos + Push | Feature `announcements` mínima (audiência); arquitetura de push (`push_subscriptions`, `notifications`, Web Push); `enviarNotificacao()` como costura | Médio — features novas, isoladas (D8, D9) | P1/P2 |
| **P4** | Analytics | Métricas de conclusão, acerto de quiz, tempo por módulo, vídeos vistos | Baixo — leitura sobre dados já gravados | P1–P3 |

> Princípio transversal (D10): **retrocompatível, sem grande refactor.** Cada fase entrega
> valor sozinha e nunca quebra o que já está aprovado.

---

## 1. O que JÁ está correto e será preservado

Esta é a fundação. Nada aqui se mexe — só ganha uma nova **fonte de dados** por baixo.

- **Contrato `Module` / `Story`** (`src/lib/types.ts:162` e `:134`). Os 6 tipos de Story
  (`lis`, `text`, `video`, `summary`, `quiz`, `completion`) são o vocabulário do conteúdo.
  É o **eixo de compatibilidade**: tudo o que evoluímos continua produzindo este mesmo shape.
  Detalhe canônico em [`MODULE_STRUCTURE.md`](./MODULE_STRUCTURE.md).
- **Experiência do colaborador / Home aprovada** — a **Trilha Viva** (herói "Continuar",
  Lis guia, bandas de seção com marquee, cadeado glass, topo/rodapé marrom). É o app do
  colaborador e **não se altera** nesta evolução (D1).
- **Lógica de desbloqueio** — `prevDone` em cadeia (AND) dentro de `statusOf`
  (`src/app/pages/Feed.tsx:130`–`:154`): um módulo só abre quando o anterior está concluído
  (`status = 'locked'` quando `!prevDone`). Mantida intacta.
- **Lis em tempo real** — char-sync da fala **sem timestamps**, com TTS como fallback
  (renderização em `StoryPlayer`, `src/app/pages/Module.tsx`). É o **default** que
  permanece (D5). Cues/legendas só entram como opção aditiva na P2.
- **Quiz adaptativo** — sorteio estável por colaborador/módulo (`sampleSize`, `randomize`)
  e `reviewTarget` para "rever esse trecho" ao errar (preparados em
  `src/lib/content.ts:1033`–`:1053`). Regras preservadas.
- **Progresso, quiz e assinatura** — toda a persistência vive em `src/lib/storage.ts`, com
  as chaves `pralis:progress:<id>`, `pralis:quiz:<id>`, `pralis:signature:<id>` e
  `pralis:videos:<id>` (`storage.ts:18`–`:23`). A camada **já é uma abstração** sobre
  `localStorage` + Supabase opcional (`hasSupabase && supabase`) — exatamente o ponto de
  costura que vamos usar, sem mudar as chaves nem os shapes.
- **adminStore + drag&drop existentes** — reordenação com Framer Reorder já funciona em
  módulos, slides e termos (a estender, não reescrever — D6).
- **PWA** — service worker e instalação já em pé; mantido.

---

## 2. O que precisa apenas ser MELHOR INTEGRADO

Aqui não há "feature nova": são costuras que já existem, mas hoje param no `localStorage`.

- **Conteúdo preso no `localStorage`.** Os módulos editados no admin vão para a chave
  `pralis_admin_data` e são lidos por `activeModules()` (`src/lib/content.ts:1126`). Cada
  navegador tem sua cópia. **Integração:** mover a fonte para o Supabase (D2) e deixar o
  `localStorage` como **cache**. Detalhe em
  [`TRAINING_PLATFORM_ARCHITECTURE.md`](./TRAINING_PLATFORM_ARCHITECTURE.md).
- **Falta de sync entre admins.** Como o conteúdo é local, dois admins (dono / gerente) não
  enxergam as edições um do outro. **Integração:** com `training_modules` no Supabase, a
  fonte passa a ser única e compartilhada.
- **Mídia manual em `/public`.** Vídeos da Lis (`.webm`) e áudios (`.mp3`) hoje são copiados
  à mão para `/public` e referenciados por caminho relativo em `videoSrc`/`audioSrc`.
  **Integração:** subir para Supabase Storage e gravar a **URL** nesses mesmos campos (D3) —
  detalhe em [`MEDIA_ARCHITECTURE.md`](./MEDIA_ARCHITECTURE.md).
- **`tracking.ts` e `notifications.ts` só locais.** Existem como esqueleto local. **Integração:**
  `notifications.ts` recebe a costura `enviarNotificacao()` (sem implementar push agora — D9);
  `tracking.ts` vira base para o analytics da P4.

---

## 3. O que precisa ser EVOLUÍDO no Dashboard

O painel admin deixa de ser só "editor de texto" e vira o **centro de controle** do conteúdo.
Fonte canônica do fluxo: [`DASHBOARD_CONTENT_FLOW.md`](./DASHBOARD_CONTENT_FLOW.md).

- **Centro de controle** — navegação clara **Treinamentos → Módulo → Slides/Stories → Quiz**,
  refletindo a estrutura de [`MODULE_STRUCTURE.md`](./MODULE_STRUCTURE.md).
- **Upload de mídia** — drag&drop no admin que envia o arquivo ao Storage e cola a URL
  retornada em `audioSrc` / `videoSrc` / `src` (D3). Fim da cópia manual para `/public`.
- **Enquete** — UI para o novo tipo de Story `poll` (aditivo, P2 — D7).
- **Versionamento / publish** — separar rascunho de publicado, para o admin editar com
  segurança antes de o colaborador ver (P2).
- **Estender drag&drop** — a reordenação já existente (módulos/slides/termos) passa a valer
  também para **perguntas do quiz**, com a ordem persistida numa coluna `order` no Supabase.
  **Regra de ouro (D6):** ordem no dashboard === ordem no app (o app já renderiza
  `stories[]` na ordem do array).

---

## 4. Como ficará o FLUXO DE CRIAÇÃO de conteúdos

Resumo de [`DASHBOARD_CONTENT_FLOW.md`](./DASHBOARD_CONTENT_FLOW.md). O autor monta um módulo
seguindo a mesma ordem pedagógica que o colaborador vai viver:

1. **Criar módulo** — título, ícone, cor, cargo (`roles`), seção (`geral`/`cargo`/`final`),
   obrigatório?, minutos estimados.
2. **Lis** (abertura) — fala da personagem-guia + estado (`talking`, `alert`,
   `celebrating`…) + vídeo opcional.
3. **Áudio** — upload do MP3 narrado pela Lis (vai para o Storage; URL em `audioSrc`).
4. **Texto sincronizado** — parágrafos + destaques; o áudio sincroniza a barra e a leitura
   (char-sync atual — D5).
5. **Vídeo** — upload MP4 (URL em `src`/`videoSrc`).
6. **Quiz** — banco de perguntas, alternativas, `correctIndex`, explicações e
   `reviewTarget`; sorteio adaptativo preservado.
7. **Enquete** (`poll`) — opcional, aditiva (P2).
8. **Publicar** — sai do rascunho e vira conteúdo visível (versionamento, P2).

A ordem pedagógica garantida hoje pelo código (vídeo/Lis antes do quiz —
`ensureVideoBeforeQuiz`, `src/lib/content.ts:1011`) continua valendo.

---

## 5. Como a HOME CONSUMIRÁ esses conteúdos

**O app não muda.** Esta é a garantia central do plano (D1, D2).

- A Home/Feed continua chamando `modulesForRole(role)` e `getModule(id)`
  (`src/lib/content.ts:1148` e `:1155`), recebendo `Module[]` exatamente como hoje.
- A diferença fica **dentro** dessas funções: em vez de ler só o `localStorage`
  (`pralis_admin_data`), o **loader hidrata os módulos do Supabase** e mantém o
  `localStorage` como **cache** (offline-first e PWA continuam funcionando).
- O `Module` hidratado passa por `prepareStories()` (`src/lib/content.ts:1033`) como já
  acontece — então quiz adaptativo, `reviewTarget` e a injeção de vídeo antes do quiz
  seguem idênticos.
- **Ordem preservada:** `stories[]` é renderizado na ordem do array; a coluna `order` do
  Supabase determina essa ordem (D6). Dashboard e app sempre concordam.
- Desbloqueio (`prevDone`/`statusOf`, `Feed.tsx:130`) e persistência de progresso
  (`storage.ts`) ficam **inalterados** — o conteúdo muda de origem, o comportamento não.

Arquitetura completa em [`TRAINING_PLATFORM_ARCHITECTURE.md`](./TRAINING_PLATFORM_ARCHITECTURE.md).

---

## 6. Como funcionará a ARQUITETURA DE MÍDIA

Resumo de [`MEDIA_ARCHITECTURE.md`](./MEDIA_ARCHITECTURE.md):

- **Supabase Storage (buckets)** como casa dos arquivos, com CDN por trás — substitui a
  cópia manual em `/public` (D3).
- **Vídeo:** MP4 (H.264 / AAC) **baseline** como padrão, **WebM opcional**; **sem HLS**
  por enquanto; alvo **720p / 1–2 Mbps** (D4).
- **Upload no admin** grava a **URL** do Storage diretamente em `audioSrc` / `videoSrc` /
  `src` do Story — os mesmos campos que o app já lê.
- **Lis:** mantém o **sync atual** (char-sync em tempo real, sem timestamps) como **default**;
  **cues / legendas** entram como camada **opcional** na P2 (D5), sem substituir o
  comportamento aprovado.

---

## 7. Como funcionará a futura área de AVISOS

Resumo de [`FUTURE_ROADMAP.md`](./FUTURE_ROADMAP.md). **Hoje não existe** enquete nem Avisos —
ambos são adições futuras.

- **Avisos = feature mínima e separada** (`announcements`), isolada do fluxo de módulos (D8).
- **Audiência:** segmentar por cargo (`roles`) ou por colaborador, reaproveitando o modelo
  de acesso já existente (`AdminUser` / `gerente` / `colaborador`).
- **Base para push:** os Avisos são a primeira superfície que se beneficia da arquitetura de
  notificações da P3 — `push_subscriptions` + `notifications` no Supabase + Web Push, com
  `enviarNotificacao()` como costura (D9). **Nada de push é implementado agora.**

---

## 8. O que será implementado AGORA

**Nesta etapa, NÃO se implementa a plataforma.** Para evitar qualquer ambiguidade:

- O que se entrega é a **ANÁLISE + os 6 documentos**: este `IMPLEMENTATION_PLAN.md` (síntese)
  e os cinco referenciados —
  [`TRAINING_PLATFORM_ARCHITECTURE.md`](./TRAINING_PLATFORM_ARCHITECTURE.md),
  [`DASHBOARD_CONTENT_FLOW.md`](./DASHBOARD_CONTENT_FLOW.md),
  [`MODULE_STRUCTURE.md`](./MODULE_STRUCTURE.md),
  [`MEDIA_ARCHITECTURE.md`](./MEDIA_ARCHITECTURE.md) e
  [`FUTURE_ROADMAP.md`](./FUTURE_ROADMAP.md).
- A **única** mudança de código desta etapa foi um **ajuste pequeno na Home**: o texto que
  passa nas bandas de seção — **já feito**. Fora isso, nenhum código foi alterado.
- A implementação da **Plataforma (Fase 1)** começa **somente após a aprovação deste plano**.

---

## 9. O que fica para VERSÕES FUTURAS

Conforme o faseamento (D10) e [`FUTURE_ROADMAP.md`](./FUTURE_ROADMAP.md):

- **P2** — Lis como **records reutilizáveis/traduzíveis** + **cues/legendas** opcionais;
  **enquete** (`poll`); **versionamento/publish**; reordenação de perguntas.
- **P3** — **Avisos** (`announcements`) e **push** (arquitetura preparada: `push_subscriptions`,
  `notifications`, Web Push; `enviarNotificacao()` como costura).
- **P4** — **Analytics** (conclusão, acerto de quiz, tempo por módulo, vídeos vistos),
  apoiado em `tracking.ts`.

Tudo aditivo e retrocompatível: nenhuma fase futura quebra o contrato nem a Home aprovada.

---

## 10. O que NÃO deve ser alterado

Linha vermelha. Estes itens são **invioláveis** em todas as fases:

- **Regras de negócio** do Código de Conduta (conteúdo fiel ao documento original).
- **Contrato `Module` / `Story`** (`src/lib/types.ts`) — o eixo de compatibilidade.
- **Lógica de desbloqueio** — `prevDone`/`statusOf` (`src/app/pages/Feed.tsx:130`–`:154`).
- **Lis** — char-sync em tempo real (sem timestamps) + TTS fallback, como default.
- **Quizzes** — sorteio adaptativo, `correctIndex`, `reviewTarget`.
- **Progresso, assinaturas e suas chaves/shapes** — `ModuleProgress`, `QuizAnswerRecord`,
  `SignatureRecord`, `VideoView` (`types.ts:48`–`:76`) e as chaves
  `pralis:progress:` / `pralis:quiz:` / `pralis:signature:` / `pralis:videos:`
  (`storage.ts:18`–`:23`).
- **A experiência / Home aprovada do colaborador** — a Trilha Viva permanece como está.

A evolução acontece **por baixo** (origem do dado, mídia, autoria); a superfície do
colaborador **não se toca**.

---

## Critérios de Aceite — Fase 1

A Fase 1 só é considerada concluída quando **todos** os itens abaixo forem verdadeiros:

- [ ] Existe a tabela `training_modules` no Supabase com `content jsonb` que serializa
      exatamente o shape `Module` (`types.ts:162`), incluindo `stories[]` e `order`.
- [ ] O loader (`modulesForRole()` / `getModule()`) **hidrata do Supabase** e usa
      `localStorage` apenas como **cache**; offline-first/PWA seguem funcionando.
- [ ] **O app do colaborador não muda** visual nem comportamentalmente: mesma Home aprovada,
      mesmo desbloqueio (`prevDone`), mesmo quiz adaptativo, mesma Lis.
- [ ] **Retrocompatibilidade total:** se o Supabase estiver indisponível, o app cai no
      conteúdo padrão (`MODULES`) sem erro (mesmo comportamento de fallback de hoje).
- [ ] Dois admins enxergam o **mesmo** conteúdo (fonte única no Supabase) — fim do drift
      entre navegadores.
- [ ] Buckets de Storage criados; **upload drag&drop** no admin funcionando e gravando a
      **URL** em `audioSrc` / `videoSrc` / `src`.
- [ ] Vídeo MP4 (H.264/AAC) baseline servindo via Storage/CDN (alvo 720p / 1–2 Mbps).
- [ ] **Ordem do dashboard === ordem do app** (coluna `order` respeitada).
- [ ] Nenhuma chave/shape de progresso, quiz ou assinatura foi alterada.

---

## Próximos passos

1. **Aguardar a aprovação deste plano** pelo Marco. Nenhuma linha da plataforma é escrita
   antes disso.
2. Aprovado: iniciar a **Fase 1** (conteúdo → Supabase + mídia → Storage + upload),
   guiada por [`TRAINING_PLATFORM_ARCHITECTURE.md`](./TRAINING_PLATFORM_ARCHITECTURE.md) e
   [`MEDIA_ARCHITECTURE.md`](./MEDIA_ARCHITECTURE.md).
3. Validar os **Critérios de Aceite da Fase 1** acima antes de seguir para a P2.
4. Reavaliar P2–P4 com base no aprendizado da Fase 1, mantendo o princípio: **aditivo,
   retrocompatível, sem grande refactor** (D10).
