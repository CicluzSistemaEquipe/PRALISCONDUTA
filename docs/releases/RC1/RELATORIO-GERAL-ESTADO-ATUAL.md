# RELATÓRIO GERAL — ESTADO ATUAL DA BRANCH

> **Pente-fino geral** para revisão manual, Vercel Preview e futura integração Supabase.
> Gerado em **2026-06-29**. Protocolo IADOMARCO aplicado (auditar → validar → corrigir só o seguro → registrar → parar).
> **Sem** push, merge, deploy, migrations ou Supabase. Nenhuma funcionalidade nova.

---

## 1. Resumo executivo

O sistema está **funcional, estável e pronto para Vercel Preview** do ponto de vista técnico: `tsc -b` e `npm run build` verdes, **51/51** checagens de smoke aprovadas (desktop + mobile), **console limpo** (0 erros reais) e **overflow 0px** em todas as telas principais.

Esta sessão fechou a **FASE 3.6 (Treinamentos por Cargo)**: corrigiu o bug do botão *Ocultar* (que não gravava) e transformou o editor de treinamento num **construtor fiel à Home** com **prévia real**. O pente-fino subsequente **não encontrou nenhum bug seguro a corrigir** — o estado já estava limpo.

Há **2 pendências que exigem sua decisão** (não são bugs de código): (a) **qual branch o Vercel deve publicar** — todo o trabalho está em `feature/colaborador-login-social`, 59 commits à frente de `main`, e nada foi enviado; (b) o **schema drift** já documentado para quando o Supabase for ligado.

**Veredito:** ✅ **Pronto para Preview**, dependendo apenas de 2 passos operacionais (escolher a branch a publicar + definir `VITE_ADMIN_PASSWORD` no Vercel). Nenhum bloqueio de código.

---

## 2. O que existe hoje (estado da plataforma)

**App do colaborador (tema escuro, mobile-first, PWA):**
- Splash, Onboarding, Login, acesso por link (`/acesso?id=`), novo `/entrar`.
- Home (Feed) com **Treinamento por Cargo** aplicado (banner + ordem + módulos ocultos).
- Player/Story (personagem Lis), Quiz adaptativo, Progresso, Perfil.
- **Assinatura/Compromisso** (módulo final).
- **Social** (comunicados) com empty-state.

**Plataforma administrativa (tema claro, CMS enterprise):**
- Login admin (Dono/Gerente), Dashboard, Colaboradores, Relatórios (Acompanhamento), Social, Mensagens (Inbox).
- **Treinamentos por Cargo**: lista por cargo + Geral, **Editor de Treinamento** (agora construtor fiel à Home), Editor de Módulos, Termos, Início.
- Gestão de **Cargos** e **Lojas**, drill-down 360 de Gerentes → Equipe → Colaborador.

**Infra/arquitetura:**
- React 18 + Vite 5 + TS strict + Tailwind 3 + Framer Motion 11 + React Router 6 + PWA (Workbox).
- **localStorage-first**; **Supabase desligado** atrás do gate `hasSupabase` (`src/lib/supabase.ts`) — sem `VITE_SUPABASE_*`, roda 100% no navegador.
- `vercel.json` com framework Vite + **rewrites SPA** (`/(.*) → /index.html`).

---

## 3. O que foi criado nesta branch e ainda **não está no Vercel**

> Branch atual: **`feature/colaborador-login-social`** · **59 commits à frente de `main`** · `main = origin/main = ecbec15` (não contém nada disto).
> Diff vs `main`: **56 arquivos, +5.777 / −626**. Working tree **limpo** (fora este relatório).

Principais entregas ainda não publicadas:
- **Login do colaborador + Social** (`EntrarColaborador`, `Social`, `SocialPostCard/Modal`, `lib/social.ts`).
- **Treinamentos por Cargo** A–E (`AdminTreinamentos`, `AdminTreinamentoEditor`, `treinamentoForRole`/`modulesForTreinamento`/`hiddenModuleIds` em `content.ts`).
- **Cargos & Lojas** cadastráveis (`CargoSelect`/`CargosManager`/`LojaSelect`/`LojasManager`, `lib/cargos.ts`, `lib/lojas.ts`).
- **Inbox admin** (`AdminInbox`, `lib/inbox.ts`), **AdminProfileButton**, **StorePerformance**.
- Libs novas: `audio.ts`, `image.ts`, `normalize.ts`, `socialFormat.ts`, `socialPresets.ts`.
- **Último commit (esta sessão):** `feat(admin): editor de treinamento vira construtor fiel à Home + prévia real` (`f7394d4`).

---

## 4. Bugs encontrados

Nenhum **bug de código** novo no pente-fino: build/typecheck/smoke todos verdes, sem erro de console, sem overflow. Achados (não-bloqueantes):

| # | Achado | Severidade | Natureza |
|---|---|---|---|
| F1 | Botão **Ocultar** não gravava (`commit()` descartava `hiddenModuleIds` e `...patch`) | Média | **Bug — já corrigido** (ver §5) |
| F2 | Script `npm run lint` aponta para **eslint que não está instalado** (não é devDependency) | Baixa | Higiene — script morto |
| F3 | **Mídia pesada versionada** em `/public` (~8,5 MB): `lis-conduta1.mp4` 5,1 MB, `videocirculo-dashboard.mp4` 1,9 MB, `lis-conduta1-alpha.webm` 1,5 MB (um commit marca como "temporário") | Baixa | Peso de repo/build (watch) |

---

## 5. Bugs corrigidos (nesta sessão)

| Bug | Causa real | Correção | Validação |
|---|---|---|---|
| **Botão Ocultar não funcionava** | `commit()` **reconstruía** o `Treinamento` campo-a-campo, sem incluir `hiddenModuleIds` e sem `...patch` → `toggleHidden` era ignorado e qualquer edição/reorder **apagava** ocultos existentes | `commit()` agora espalha **`...t` primeiro** (preserva tudo) e **`...patch` por último** | commit `c8a9725` + **regressão no smoke F** (editar nome NÃO apaga ocultos) |
| **Editor parecia lista/CRUD** | — (evolução de UX pedida) | Editor virou **construtor fiel à Home**: reutiliza o `ModuleCard` real do colaborador (via `HomeCanvas`, que força o tema escuro numa subárvore) + **Prévia da Home** que renderiza o celular real, com ocultos já removidos | commit `f7394d4` + smoke E/F + tsc/build |

**Nenhuma correção adicional foi necessária** no pente-fino (estado já limpo).

---

## 6. Bugs / itens que **precisam de decisão** (PARE — não implementado)

| # | Item | Por que precisa de você |
|---|---|---|
| **D1** | **Qual branch o Vercel publica?** Todo o trabalho está em `feature/colaborador-login-social` (59 commits à frente), **nada enviado**; `main` está sem a fase 3.6 | Envolve **push/merge/deploy** — explicitamente proibido nesta tarefa. Decisão sua: criar Preview a partir desta branch, ou abrir PR p/ `main`. |
| **D2** | **Schema drift (R1)** — o código grava colunas que **não existem** nas migrations (`employees`: email/whatsapp/store/status…; `signatures`: probatórios) | Inofensivo hoje (Supabase off); **quebra ao ligar** o Supabase. Exige migration `0005` antes — decisão de produto/ordem. Já documentado em [docs/PHASE2_SUPABASE_DISCOVERY.md](docs/PHASE2_SUPABASE_DISCOVERY.md). |
| **D3** | **RLS aberta (`using(true)`)** nas migrations atuais | Crítico **só ao ligar** o Supabase com dados reais. Hardening proposto em [docs/RLS_SECURITY_PROPOSAL.md](docs/RLS_SECURITY_PROPOSAL.md) — exige aprovação antes de produção. |

> Nenhum destes foi tocado: são estruturais e/ou envolvem ações proibidas (push/merge/deploy/Supabase).

---

## 7. Riscos

- **R-deploy:** divergência grande branch↔main (59 commits). Quanto mais tempo sem PR/Preview, maior o risco de drift. **Mitigação:** decidir D1 logo; Preview desta branch é seguro (build verde).
- **R-auth-prod:** em produção, o login admin **exige `VITE_ADMIN_PASSWORD`** (o default de DEV fica desativado). Sem a env no Vercel, **o admin não loga online**. **Mitigação:** definir a env antes do Preview.
- **R-mídia:** `/public` carrega ~8,5 MB de vídeo (um "temporário"). Não entra no precache do PWA (acima do limite), mas pesa no repo/deploy. **Mitigação:** mover p/ Storage na Fase 2 (R8 do discovery) e remover o temporário.
- **R-supabase-futuro:** drift de schema (D2) + RLS aberta (D3) — **só** ao ligar. Cobertos pelos docs de discovery; não afetam o Preview local/atual.
- **R-segredo:** `VITE_*` é **público** (vai no bundle) — correto para senha demo; a auth real é o Supabase Auth (Fase 2). Nenhum segredo real versionado (`.env` ignorado; só `.env.example`).

---

## 8. Checklist tela por tela (para revisar amanhã)

Legenda: ✅ = smoke automatizado passou (sem erro de página/console, overflow ≤1px). Revisar manualmente o **conteúdo/UX**.

**App do colaborador**
- [ ] ✅ Login (`/login`) · EntrarColaborador (`/entrar`) · Onboarding (`/conheca`)
- [ ] ✅ Acesso por link (`/acesso?id=`) cria sessão
- [ ] ✅ **Home / Feed** (mobile + desktop) — banner de treinamento, ordem, ocultos removidos
- [ ] ✅ **Social** (mobile + desktop) — empty-state, bottom nav
- [ ] ✅ Progresso · Perfil
- [ ] ✅ **Player/Story/Quiz** (Lis renderiza, barra de progresso) — *validar quiz adaptativo a fundo na mão*
- [ ] ✅ **Assinatura/Compromisso** — *validar fluxo de assinatura completo na mão*

**Plataforma administrativa**
- [ ] ✅ **Login admin** (dono) → Dashboard
- [ ] ✅ Colaboradores · Relatórios · Social · Mensagens (Inbox)
- [ ] ✅ **Gerentes** (drill-down 360) · **Treinamentos** (cards por cargo)
- [ ] ✅ **Editor de Treinamento** — construtor fiel à Home + Prévia real + Ocultar/Mostrar/Mover
- [ ] ✅ **Editor de Módulos** (identidade/aparência/visibilidade + preview do celular)
- [ ] ✅ Termos · Início

**Transversais**
- [ ] ✅ Console limpo · ✅ Overflow 0px (desktop 1440/1280 + mobile 390)
- [ ] Revisar responsividade em **tablet** (768) na mão (smoke cobriu 390/1280/1440)

---

## 9. Checklist Vercel Preview

- [x] `vercel.json` com framework `vite`, `buildCommand`, `outputDirectory: dist`, **rewrites SPA** ✓
- [x] `npm run build` verde (`tsc -b && vite build`) · PWA gerado (`sw.js`, precache 75 entradas / ~1,86 MB)
- [x] Sem `.env` versionado (só `.env.example`); Supabase desligado por ausência de env ✓
- [ ] **Definir env vars no Vercel:** `VITE_ADMIN_PASSWORD` (**obrigatória** — sem ela o admin não loga em prod); opcionais: `VITE_ADMIN_LEGACY_PASSWORD`, `VITE_DASH_PASSWORD`. **Não** definir `VITE_SUPABASE_*` (mantém modo local).
- [ ] **Escolher a branch de Preview** (decisão D1) — esta branch builda limpa.
- [ ] Conferir **mídia pesada** (`/public` ~8,5 MB) — aceitável para teste; planejar Storage.
- [ ] Pós-deploy: smoke manual de rotas SPA (deep-link direto, ex.: `/admin/treinamentos/caixa`) graças ao rewrite.
- Referência: [docs/DEPLOY_VERCEL_TEST.md](docs/DEPLOY_VERCEL_TEST.md).

---

## 10. Checklist Supabase (futuro — apenas planejamento, nada implementado)

> Detalhe completo já existe em [docs/PHASE2_SUPABASE_DISCOVERY.md](docs/PHASE2_SUPABASE_DISCOVERY.md), [docs/RLS_SECURITY_PROPOSAL.md](docs/RLS_SECURITY_PROPOSAL.md), [docs/SOCIAL_SUPABASE_PROPOSAL.md](docs/SOCIAL_SUPABASE_PROPOSAL.md), [docs/MEDIA_ARCHITECTURE.md](docs/MEDIA_ARCHITECTURE.md). Resumo:

- **Tabelas necessárias:** `training_modules` (JSONB por módulo), `lis_lines`, `poll_answers`; **alter** em `employees` (email/whatsapp/birth_date/admission_date/store/status) e `signatures` (terms/terms_version/document_hash/user_agent/signer_name/signer_cpf/app_version) — corrige o **drift D2**. Social/Inbox: tabelas de posts/comentários/mensagens.
- **Storage (buckets):** `video`, `audio`, `image`, `poster`, `lis` (públicos, Cache-Control imutável) + `attachment` (privado, signed URL). Path versionado.
- **RLS:** fechar `using(true)`; `training_modules` `select` público só `published & active`, escrita só `authenticated`; dados do colaborador via **RPC `security definer`** validando token; `signatures` **append-only**; CPF restrito a admin.
- **Auth:** migrar Dono/Gerente para **Supabase Auth** (JWT) p/ RLS forte (`gerente vê where gerenteId = auth.uid()`).
- **Uploads:** `useUpload(bucket)` no editor (vídeo/áudio/imagem/anexo) gravando URL na Story; gated por `hasSupabase`.
- **Push/notificações:** estrutura de "Jornada e comunicação" já preparada no cadastro do colaborador (sem backend ainda).
- **Treinamento por cargo / social / jornada / mídias:** todos com caminho `hasSupabase` + **fallback localStorage** (progressive enhancement; nunca requisito).
- **Ordem segura:** migrations base → conteúdo → mídia → **segurança (RLS/Auth) antes de dados reais** → aposentar legado.

---

## 11. Próximos passos recomendados

1. **Decidir D1** (branch a publicar) e abrir o **Vercel Preview** desta branch com `VITE_ADMIN_PASSWORD` definida.
2. **Revisão manual** amanhã pela checklist §8 (foco em quiz adaptativo, assinatura e tablet).
3. (Higiene) **F2:** instalar `eslint` como devDependency **ou** remover o script `lint` morto.
4. (Higiene) **F3:** remover a mídia "temporária" pesada de `/public` quando não for mais necessária para teste.
5. Quando aprovar a Fase 2: começar por **P2.0 (migrations base) + P2.1 (conteúdo)** — o menor passo que prova a plataforma compartilhada — com **segurança (RLS/Auth) antes de qualquer dado real**.

---

## 12. Validação final (registro)

| Gate | Resultado |
|---|---|
| `npx tsc -b` (strict, noUnusedLocals) | ✅ verde |
| `npm run build` (`tsc -b && vite build`) | ✅ verde (~14 s; PWA gerado) |
| Smoke abrangente (`smoke_full`) — 12 rotas admin + colaborador, desktop+mobile | ✅ **51/51** |
| Smoke Treinamentos/Ocultar (`smoke_e` + `smoke_f`) | ✅ **12/12** + **10/10** |
| Console (erros reais) | ✅ **0** (apenas ruído de mídia headless, ignorável) |
| Overflow horizontal (telas principais) | ✅ **0px** |

**Veredito final:** ✅ **PRONTO PARA VERCEL PREVIEW** — sem bloqueio de código. Pendências operacionais: escolher branch (D1) + `VITE_ADMIN_PASSWORD` no Vercel. Itens estruturais (D2/D3) são **só** para a futura ligação do Supabase.

---

*Parado para sua aprovação. Nenhuma funcionalidade nova iniciada. Sem push, merge, deploy ou Supabase.*
