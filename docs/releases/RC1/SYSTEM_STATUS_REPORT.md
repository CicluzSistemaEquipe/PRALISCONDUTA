# SYSTEM STATUS REPORT — Pralís Conduta (RC1)

> Release Candidate 1 — auditoria sênior multidisciplinar (Staff Eng · QA · Front-end Arch · UX · Product · Mobile · Performance · Security) antes do **Vercel Preview**.
> Gerado em **2026-06-30**. Branch: `feature/colaborador-login-social`. Protocolo IADOMARCO. **Sem** novas funcionalidades, redesign ou refactor de gosto — só correção do que a auditoria encontrou.

---

# Estado geral do sistema

**Veredito: ✅ APTO para Vercel Preview.** `tsc -b` e `npm run build` verdes; smoke completo (colaborador + admin, desktop + mobile) **51/51**, feed Social **17/17**, RC-fixes **6/6**; **overflow 0px** em 390/414/768/1024/1440; **console limpo**. PWA gerado (manifest + service worker + ícones). Supabase **desligado** por design (roda 100% localStorage).

A auditoria correu 4 gates em paralelo (Arquitetura/Código, Performance, UX/A11y, Security). **Nenhum bug 🔴 Crítico** que bloqueie o Preview. Foram corrigidos **7 itens reais** (5 🟠 Alto + 2 🟡 Médio de a11y) — todos seguros, sem alterar design ou comportamento aprovado. O restante (mídia pesada, blur no app, ícones PWA em SVG, hardening de produção) está registrado com prioridade, sem ser tocado nesta RC.

---

## Funcionalidades prontas

**App colaborador (dark, mobile-first, PWA):** Splash · Onboarding · Login por link (`/acesso?id=`) e `/entrar` · Home/Feed com Treinamento por Cargo (banner, ordem, ocultos) · Stories/Player (personagem Lis, áudio/MP3, legendas, char-sync) · Vídeo · Quiz adaptativo · Progresso · Perfil · Social (feed de comunicados refinado: imagem inteira, duplo-toque "ciente", confirmação de leitura) · Assinatura/Compromisso · BottomNav com badge e safe-area · empty/loading/error states.

**Plataforma admin (claro, CMS):** Dashboard · Colaboradores (+ drill-down) · Gerentes (360) · Treinamentos por Cargo + Editor (construtor fiel à Home + prévia real) · Editor de Módulos (identidade/aparência/visibilidade + preview do celular) · Social (compositor + relatório de engajamento) · Mensagens/Inbox · Relatórios/Acompanhamento · Termos · Cargos & Lojas · Sidebar/Topbar · Modais (ModalShell) · Upload de imagem · Drag/Reorder.

**Infra:** React 18 + Vite 5 + TS strict (`noUnusedLocals`) + Tailwind 3 + Framer Motion 11 + React Router 6 (rotas **lazy**) + PWA (Workbox). `vercel.json` com rewrites SPA.

---

## Funcionalidades mockadas (hoje em localStorage)

Tudo persiste no navegador (chave `pralis:*` / `pralis_admin_data`), pronto para virar backend:
- **Colaboradores / progresso / quiz / assinaturas / views de vídeo** (`lib/storage.ts`).
- **Conteúdo** (módulos, stories, termos, splash) — `adminStore` / `content.ts`.
- **Social** (posts + engajamento) — `lib/social.ts`.
- **Inbox/Mensagens** — `lib/inbox.ts`.
- **Cargos / Lojas / Treinamentos por cargo** — `lib/cargos.ts`, `lib/lojas.ts`, `content.ts`.
- **Sessão admin** (`sessionStorage`) e **usuários admin** demo.
- **Imagens** são data URLs base64 (redimensionadas ≤1280px, ~700KB) — `lib/image.ts`.

---

## Preparado para Supabase

Arquitetura já costurada (gated por `hasSupabase` em `lib/supabase.ts` — sem env, 100% local):
- `lib/storage.ts` já abstrai localStorage **+** Supabase para employees/progress/quiz/signatures/video_views.
- Migrations `0001`–`0003` (schema, RLS, access_code) existentes.
- Planos detalhados: `docs/PHASE2_SUPABASE_DISCOVERY.md` (JSONB de módulos, ordem faseada), `docs/RLS_SECURITY_PROPOSAL.md`, `docs/SOCIAL_SUPABASE_PROPOSAL.md`, `docs/MEDIA_ARCHITECTURE.md`.
- **⚠️ Pendências antes de ligar:** **schema drift** (código grava colunas que não existem nas migrations — ex.: employees email/whatsapp/store/status; signatures probatórios) → migration `0005` antes; **RLS aberta** (`using(true)`) → `0007` hardening + RPC com token; **Auth** dono/gerente é client-side → Supabase Auth.

---

## Preparado para Push Notification

- Estrutura de **"Jornada e comunicação"** já no cadastro do colaborador (campos para automação).
- `lib/notifications.ts` (camada de notificação local; logs **gated por `import.meta.env.DEV`**, não vazam em produção).
- **Falta:** service worker push (Web Push/VAPID), permissão, e o canal real (Supabase/Edge Function ou serviço externo). Hoje não há push real — só a base de dados/UX.

---

## Preparado para Storage

- `lib/image.ts` e `lib/audio.ts` geram data URLs prontos para virar upload (a Story aceita qualquer URL).
- `docs/MEDIA_ARCHITECTURE.md` define buckets (`video/audio/image/poster/lis/attachment`), Cache-Control imutável e path versionado.
- `VideoUpload` no editor hoje só lê `file.name` (placeholder) — trocar por `useUpload(bucket)` quando o Storage entrar.
- **Falta:** instanciar buckets + policies + hook de upload (gated por `hasSupabase`).

---

## Preparado para IA

- **Lis** (mascote) com estados de animação (idle/talking/celebrating/correct/wrong) — camada de apresentação pronta para um "agente" guiado.
- **TTS** já presente (`speechSynthesis` em `TextCard`/`Completion`) com cancelamento no unmount.
- **Quiz adaptativo** (`prepareStories`/`reviewTarget`) — lógica de reforço por desempenho.
- **Falta para IA real:** nenhuma integração LLM/voz por API ainda; a arquitetura suporta plugar (conteúdo dinâmico, fala da Lis, sugestões) na Fase 2+. *(O runtime do **Rive** foi removido nesta RC por estar sem asset — ver Dívidas técnicas.)*

---

## Dívidas técnicas (reais)

| # | Dívida | Onde | Natureza |
|---|---|---|---|
| DT1 | **Vídeo de avatar de 1.98MB autoplay** no header do Feed (e Login/Profile) — pesa no LCP em celular fraco | `LisHeaderAvatar.tsx`, `Login.tsx`, `Profile.tsx` | Perf — precisa asset leve/poster ou autoplay diferido (muda asset/comportamento → **decisão**) |
| DT2 | **`backdrop-filter: blur`** ativo em ~8 componentes do app — viola a regra de performance do próprio projeto | LisCard, TextCard, QuizCard, CompletionCard, Onboarding, Profile, ValuesCard, SocialPostModal | Perf/Design — trocar por fundo sólido **altera o visual** → decisão |
| DT3 | **`repeat: Infinity`** em várias animações do app (Lis, StoryPlayer, Splash, Login) — contra a regra do projeto | LisAvatar, StoryPlayer, Splash, Login | Perf/Motion — bateria; **altera motion** → decisão |
| DT4 | **Ícones PWA em SVG** — iOS não exibe ícone de home-screen com SVG (apple-touch-icon e manifest) | `index.html`, `public/icons/*.svg` | Precisa **PNG** 180/192/512 (asset novo) |
| DT5 | **Sanitização de termos por blocklist regex** (colaborador) — contornável | `Completion.tsx:42-49` | Trocar por **DOMPurify** (allowlist) — nova dependência → produção |
| DT6 | **Sem headers de segurança/CSP** no `vercel.json` | `vercel.json` | Produção (defense-in-depth) |
| DT7 | **Login legado do colaborador** cria sessão a partir de query sem token | `Acesso.tsx`, `SessionContext.tsx` | Fechar/exigir token na Fase 2 |
| DT8 | **Auth admin/dashboard 100% client-side** + **PII (CPF/telefone/assinatura) em localStorage em claro** | `AdminGuard`, `storage.ts` | Fase 2 (Supabase Auth + RLS) |
| DT9 | **`ADMIN_DATA_KEY` duplicado** como literal em 2 arquivos (intencional p/ evitar dependência circular) | `adminStore.ts`, `content.ts:1093` | Manutenção — extrair constante neutra |
| DT10 | **`lint` aponta para eslint não instalado** (gate real é o `tsc` strict) | `package.json` | Instalar eslint **ou** remover o script |
| DT11 | **~8,5MB de mídia versionada** em `/public` (um marcado "temporário") | `public/*.mp4/webm` | Migrar p/ Storage/CDN (Fase 2) |

---

## Bugs encontrados (por prioridade)

### 🔴 Crítico
**Nenhum.** Nenhum bug que bloqueie o Preview (sem tela branca, sem crash de render, sem dead-end).

### 🟠 Alto — **TODOS CORRIGIDOS nesta RC**
- **Rive de 171KB sem asset:** `LisAvatar` carregava o runtime `@rive-app` (`/lis.riv` inexistente) e caía SEMPRE no fallback — peso morto no chunk do Player. ✅ Removido (render idêntico; `vendor-rive` saiu do bundle; precache −167KB).
- **Botão de cadastro travava para sempre** se a promise falhasse (RH não recadastra sem reload) — `AddEmployee.tsx`. ✅ `try/catch/finally` + mensagem de erro.
- **Sort de posts podia lançar no render** se um post não tivesse `published_at` nem `created_at` (`undefined.localeCompare`) — `social.ts`. ✅ Fallback `?? ''`.
- **Módulo "bloqueado" abria na tela Progresso** (gating inconsistente com o Feed) — `Progress.tsx`. ✅ Não navega quando `locked` + `aria-disabled`.
- **Preview de Termos do admin sem sanitização** (XSS persistido self-admin; o colaborador já sanitizava) — `AdminTermos.tsx`. ✅ Render estrutural (React escapa título/corpo; sink `dangerouslySetInnerHTML` removido).

### 🟡 Médio — **a11y CORRIGIDO**; demais REGISTRADOS
- ✅ **Drawer mobile do admin** sem ESC/role — `AdminSidebar.tsx`: ESC fecha + `role="dialog" aria-modal`.
- ✅ **Dropdown de notificações** sem ESC — `AdminTopbar.tsx`: ESC fecha.
- ⏸️ DT1 vídeo LCP · DT2 blur · DT3 loops · DT4 ícones PWA (ver Dívidas técnicas — exigem decisão/asset, não tocados para não alterar design).

### ⚪ Baixo — REGISTRADOS (não corrigidos)
- `QuizCard.tsx`/`Onboarding.tsx`: `setTimeout` sem `clearTimeout` (null-safe, sem efeito prático).
- Cards "mobile" do admin (`AdminColaboradores`/`AdminGerentes`/`AdminAcompanhamento`): abrir detalhe é mouse/touch-only (ações internas já têm `<button>`).
- Reorder de módulos só por drag (sem teclado) — há "Mover ↑/↓" acessível no editor de bloco.
- Naming de chave localStorage inconsistente (`pralis_admin_data` vs `pralis:*`).

> **Sem memory leaks reais** (todos os timers/listeners/RAF/áudio/vídeo com cleanup correto — auditado componente a componente). **Sem imports/variáveis mortos** (garantido pelo `tsc` strict). `npm audit --omit=dev`: **0 vulnerabilidades**.

---

## Melhorias futuras (relevantes)

1. **DT1/DT2/DT3** — alinhar app às regras de perf do próprio projeto (asset leve no avatar; remover blur; loops one-shot) → ganho real de bateria/LCP em celular fraco. *Decisão de design.*
2. **Ícones PWA em PNG** (DT4) → instalação correta no iPhone.
3. **`runtimeCaching` de mídia** no Workbox (CacheFirst para `.mp4/.webm`) → menos re-download em revisita.
4. **DOMPurify** nos sinks de HTML (DT5) e **CSP/headers** (DT6) antes de produção.
5. Extrair `ADMIN_DATA_KEY` para um módulo de constantes (DT9).

---

## Checklist Release Candidate

**Pronto:**
- [x] `tsc -b` verde · `npm run build` verde
- [x] Smoke colaborador + admin (desktop/mobile) 51/51
- [x] Feed Social 17/17 · RC-fixes 6/6
- [x] Responsividade 390/414/768/1024/1440 → overflow **0px**
- [x] Console sem erros reais
- [x] PWA: manifest + service worker + ícones + safe-area (`viewport-fit=cover`)
- [x] Supabase desligado (gating de produção do login demo confirmado)
- [x] Sem memory leak / sem código morto / `npm audit` limpo
- [x] 7 bugs reais corrigidos (5 Alto + 2 Médio a11y)

**Ainda falta (não bloqueia Preview):**
- [ ] Decidir DT1–DT4 (mídia/blur/loops/ícones) — design/asset
- [ ] DT5/DT6 (DOMPurify, CSP) — produção
- [ ] eslint instalado ou script removido (DT10)

---

## Checklist Preview Vercel (validar amanhã)

- [x] `vercel.json`: framework Vite + `outputDirectory dist` + **rewrites SPA**
- [x] Build de produção verde com `VITE_ADMIN_PASSWORD`
- [ ] **Definir env no Vercel:** `VITE_ADMIN_PASSWORD` (**obrigatória** — sem ela o login admin não abre em prod); opcionais `VITE_ADMIN_LEGACY_PASSWORD`, `VITE_DASH_PASSWORD`. **Não** definir `VITE_SUPABASE_*` (mantém modo local).
- [ ] **Escolher a branch a publicar** — todo o trabalho está em `feature/colaborador-login-social` (à frente de `main`); nada foi enviado.
- [x] Assets/caminhos: imagens (data URL), vídeos em `/public` servidos, ícones presentes
- [x] Lazy/code-splitting por rota (Suspense)
- [ ] Pós-deploy: deep-link SPA (ex.: abrir `/admin/treinamentos/caixa` direto) graças ao rewrite
- [ ] Conferir LCP do Feed em rede 4G (DT1 — vídeo do avatar)

---

## Checklist Produção (antes da publicação oficial)

- [ ] **Supabase:** migrations `0004`–`0008` (conteúdo, **schema drift `0005`**, Storage, **RLS hardening `0007`**, Auth) — RLS forte **antes** de dados reais
- [ ] **Segurança:** DOMPurify nos sinks de HTML; CSP + headers no `vercel.json`; fechar login legado; mover PII para o banco (não localStorage)
- [ ] **Push:** service worker push + VAPID + canal real
- [ ] **Storage/CDN:** buckets + upload real; aposentar a mídia pesada de `/public`
- [ ] **PWA:** ícones PNG (iOS); `runtimeCaching` de mídia
- [ ] **Auth:** Supabase Auth para dono/gerente (guardas client-side viram RLS no banco)
- [ ] **Performance:** resolver DT1–DT3 (mídia/blur/loops)
- [ ] **Qualidade:** eslint no CI; (opcional) testes e2e Playwright versionados

---

## Entrega — resumo

- **Arquivos alterados (7):** `src/app/components/LisAvatar.tsx` · `src/app/pages/Progress.tsx` · `src/dashboard/pages/AddEmployee.tsx` · `src/lib/social.ts` · `src/admin/pages/AdminTermos.tsx` · `src/admin/components/AdminSidebar.tsx` · `src/admin/components/AdminTopbar.tsx`.
- **Componentes alterados:** LisAvatar (remoção do Rive morto), Progress (gating), AddEmployee (estado de erro), AdminTermos (preview seguro), AdminSidebar/AdminTopbar (a11y ESC).
- **Bugs encontrados:** 5 🟠 Alto + 2 🟡 Médio a11y + diversos ⚪ Baixo + dívidas de perf/segurança/PWA.
- **Bugs corrigidos:** os 5 Alto + os 2 Médio a11y (7 no total).
- **Melhorias realizadas:** −171KB de bundle (Rive), preview de Termos sem XSS, gating consistente, a11y de teclado nos overlays do admin.
- **Riscos:** baixos. Mudanças cirúrgicas e retrocompatíveis; render da Lis idêntico; nenhum design/comportamento aprovado alterado. DT1–DT4 ficaram intencionalmente fora (exigem decisão/asset).
- **Compatibilidade:** sem regressão (51/51 + 17/17 + 6/6 + responsivo OK). Player/Story/Quiz/Social/Admin/PWA intactos.
- **Build:** ✅ verde (precache 74 entradas / ~1,70MB; `vendor-rive`/`vendor-lottie` removidos).
- **Smoke:** ✅ 51/51 (geral) · 17/17 (Social) · 6/6 (RC-fixes) · 5 breakpoints 0px overflow · console limpo.
- **Pronto para Preview?** ✅ **SIM** — apto, pendente apenas dos passos operacionais do Vercel (branch + `VITE_ADMIN_PASSWORD`).

*Sem push, merge, deploy, Supabase ou novas funcionalidades. Parado para aprovação.*
