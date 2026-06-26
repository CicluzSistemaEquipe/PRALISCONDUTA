# Nightly Quality Report — Pralís Conduta

> Sprint de **qualidade/hardening** (pré-Beta). Branch: `lab/nightly-quality-pass`.
> Sem novas features, sem redesign, sem mudar regras de negócio, fluxos aprovados,
> arquitetura ou a experiência aprovada do colaborador (Home/Trilha Viva).
> Auditoria 360° por especialistas (segurança, performance, UX/UI/a11y) + correções
> seguras aplicadas + build verde.

**Data:** 2026-06-26 · **Gate de build:** `tsc -b` ✅ + `vite build` ✅ (12.5s).

---

## Resumo executivo

A base é **sólida e acima da média**: TypeScript estrito (`tsc -b` é o gate real e está verde),
code-splitting por rota (`lazyWithRetry`), `SessionContext` exemplar (memoizado, sem leaks),
identidade visual própria e forte (não tem cara de template/IA), admin com design system
próprio. Os problemas reais eram **operacionais e de hardening**, não de produto.

O maior achado foi de **build/deploy**: cada build copiava **~5,0 GB** de `public/` para `dist/`
(4,6 GB de `.mov` + 355 MB de `.gif` **nunca referenciados**). Corrigido → **165 MB (-96,7%)** e
build de ~5 min → **12,5 s**. Também foram aplicadas correções seguras de acessibilidade,
performance e robustez jurídica da assinatura. As frentes que dependem de **Supabase/Auth/RLS**
foram **documentadas** (fora do escopo desta etapa, por decisão do projeto).

---

## Melhorias implementadas

| # | Melhoria | Arquivo(s) | Impacto |
|---|----------|-----------|---------|
| 1 | **Build enxuto**: `copyPublicAssetsPlugin` só copia formatos servidos (`.mp4/.webm/.mp3/.svg/.png/.jpeg/.json…`); `.mov`/`.gif` mortos ficam fora | `vite.config.ts` | **Alto** — dist 5,0 GB → 165 MB; build ~5 min → 12,5 s |
| 2 | **`manualChunks`**: vendors separados (`react`, `framer-motion`, `supabase`, `rive`, `router`, `icons`) | `vite.config.ts` | Médio — cache estável entre deploys |
| 3 | **`prefers-reduced-motion` global** no app do colaborador (espelha o admin) | `src/styles/globals.css` | Alto (a11y/bateria) — desliga animações CSS p/ quem pede menos movimento |
| 4 | **`:focus-visible` global** no app do colaborador | `src/styles/globals.css` | Alto (a11y) — foco de teclado visível (WCAG 2.4.7) |
| 5 | **Robustez jurídica da assinatura** (aditivo, Lei 14.063/2020): `document_hash` (SHA-256 do HTML assinado), `terms_version`, `user_agent`, `signer_name`, `signer_cpf`, `app_version` | `src/lib/types.ts`, `src/app/pages/Completion.tsx` | Alto — fortalece valor probatório sem mudar o fluxo |
| 6 | **Tokens CSPRNG**: `makeToken`/`makeAccessCode` usam `crypto.getRandomValues` (não `Math.random`) | `src/lib/storage.ts` | Médio (segurança) — tokens de acesso imprevisíveis |
| 7 | **Contraste**: `--text-locked` 0.30 → 0.46 (passa AA em Progress/Profile) | `src/styles/pralis.css` | Médio (a11y) |
| 8 | **Fallback de copy**: `welcomeText` do Splash com default se store vazio | `src/app/pages/Splash.tsx` | Baixo |

> A correção **cargo→segmento (Opção A)**, a **enquete (`poll`)** e o **módulo de teste** já
> haviam sido entregues na Fase 0 (branch `lab/training-home-product-evolution`, da qual esta
> branch deriva) — portanto também estão presentes aqui.

---

## Bugs encontrados

| Sev | Bug | Onde | Status |
|-----|-----|------|--------|
| **Alto** | Build copiava ~5 GB de mídia morta (`.mov`/`.gif`) para `dist/` → deploy inviável (estoura limites de host) | `vite.config.ts:9-32` | ✅ Corrigido |
| **Alto** | `cargo→segmento`: 7 de 10 cargos não recebiam o módulo de cargo (match exato de string) | `src/lib/content.ts` (modulesForRole) | ✅ Corrigido (Fase 0, Opção A) |
| **Médio** | Assinatura sem hash do documento, versão dos termos, dispositivo nem identificador forte → fraca como prova | `Completion.tsx`, `types.ts` | ✅ Mitigado (metadados aditivos; IP/timestamp de servidor dependem de Supabase) |
| **Médio** | App do colaborador ignorava `prefers-reduced-motion` (só o admin respeitava) | global | ✅ Corrigido (CSS); loops Framer ainda pendentes (ver "permaneceram") |
| **Médio** | Sem foco de teclado visível no app do colaborador | global | ✅ Corrigido |
| **Baixo** | Tokens/códigos de acesso com `Math.random()` (não-CSPRNG) | `storage.ts:56-63` | ✅ Corrigido |

> **Não foram encontrados** bugs de lógica de negócio, leaks de timer/listener (todos têm
> cleanup), N+1 de dados, nem regressões no fluxo aprovado. `SessionContext` está impecável.

---

## Bugs corrigidos

Todos os marcados ✅ acima. Build verde após cada correção (`tsc -b` + `vite build`).

---

## Problemas que permaneceram (documentados — fora do escopo desta etapa)

### Segurança (dependem de Supabase Auth/RLS — Fase 2)
- **RLS `using (true)`** em todas as tabelas (inclusive `signatures`): quando o Supabase for
  ligado em produção, qualquer um com a chave `anon` (pública no bundle) lê/edita/apaga
  assinaturas e CPF de todos. **Crítico no instante em que o Supabase entrar.** Hoje, rodando
  100% em localStorage, **não é explorável remotamente** (cada device é isolado).
- **CPF em texto plano** no campo `phone`, exposto pela RLS aberta.
- **Autorização dono/gerente só no cliente** (sem reflexo no RLS).
- **XSS armazenado nos termos** (HTML autorável): `Completion.tsx` sanitiza por regex (frágil);
  `AdminTermos` renderiza **sem** sanitizar. Recomendado: `DOMPurify` nos dois pontos.
- **GPS no tracking sem consentimento explícito** (LGPD).
- **Sem cabeçalhos de segurança** (CSP, Referrer-Policy) no host.

### Performance (seguros, mas com mais risco/escopo)
- **Rive (`@rive-app/react-canvas`, 171 KB)** carregado em `LisAvatar` mas o `.riv` não existe →
  sempre cai no fallback PNG. Render direto do fallback removeria o WASM do bundle. (Hoje já
  está isolado em `vendor-rive` via `manualChunks`.)
- **`lottie-react`** sem consumidor real (`Lottie.tsx` não é renderizado).
- **Loops Framer `repeat: Infinity`** sem `useReducedMotion()` em `StoryPlayer`, `Onboarding`,
  `CompletionCard`, `QuizCard`, `ValuesCard`, `TextCard`, `LisCard` (o CSS global cobre só
  animações CSS, não o `animate` do Framer).
- **`boxShadow`/`backgroundPosition` animados** (repaint contínuo) em `TextCard`, `QuizCard`,
  `StoryPlayer`.
- **`<video>`/`<audio>` sem `poster`/`preload="metadata"`** em vários cards.

### UX/A11y (seguros, deixados para uma rodada dedicada)
- **Modais sem `role="dialog"`/focus-trap/ESC** uniformes (StoryPlayer, TermReader; modais do
  admin têm `role` mas sem ESC).
- **`SummaryCard`** sem botão "Continuar" (descarta `onNext`).
- **Selos pequenos branco-sobre-laranja** (~2,6:1) abaixo de AA.
- **Microcopy ausente** quando o avanço é bloqueado por narração/vídeo.
- **Emojis decorativos** sem `aria-hidden`.
- **Tagline divergente**: Completion usa "a prova é ser feliz" vs. "é provar e ser feliz" no
  resto — **possível trocadilho intencional da conclusão; deixado como está p/ você confirmar.**

---

## Melhorias sugeridas (próxima rodada)

1. **Segurança Supabase (bloqueador antes de Beta com dados reais):** Auth + RLS por papel +
   RPC `security definer` validando token; `signatures` *append-only*; CPF restrito/cifrado.
2. **DOMPurify** nos dois `dangerouslySetInnerHTML` dos termos.
3. **Remover Rive** de `LisAvatar` (render direto do fallback) enquanto não houver `.riv` real.
4. **`useReducedMotion()`** nos componentes de loop Framer do colaborador.
5. **PWA runtime cache de mídia** (`CacheFirst` + `rangeRequests`) — ver `MEDIA_ARCHITECTURE.md`.
6. **Padrão único de modal** (role+aria-modal+ESC+focus-trap).

---

## Performance

- **Build/deploy:** `dist` 5,0 GB → **165 MB**; tempo ~5 min → **12,5 s**; 0 `.mov`/`.gif` no output.
- **Bundles (gzip):** `vendor-react` 45,6 KB · `vendor-rive` 50,7 KB · `vendor-motion` 38,9 KB ·
  `index` 20,3 KB · `Module` 12,5 KB · `Feed` 6,8 KB. Code-splitting por rota mantido.
- **PWA precache:** 1,6 MB (só o shell js/css/html/svg/png; mídia sob demanda — correto).
- **Sem leaks:** todos os `setInterval`/`addEventListener`/`requestAnimationFrame` têm cleanup.
- **Pendências:** Rive no caminho do `LisAvatar`, loops Framer sem reduced-motion, `<video>` sem
  `poster`/`preload`. (Não bloqueiam; alívio incremental.)

## Responsividade
- App mobile-first (`.app-shell` `max-w-[480px]`), admin responsivo (sidebar desktop / drawer
  mobile). Sem quebras encontradas na auditoria. Áreas de toque pequenas pontuais (botão fechar
  do StoryPlayer ~28px; tabs do Profile 9px) — documentadas, baixo risco.

## UX
- Fluxo do colaborador coeso e premium; admin consistente (empty/loading/skeletons em toda parte).
- Pendências de polimento documentadas (modais, `SummaryCard`, microcopy de bloqueio, contraste
  de selos). Nenhum blocker de fluxo.

## Motion
- Feed/Trilha Viva já otimizado (composite puro, `willChange`, reduced-motion). **Não tocado.**
- Global CSS agora respeita `prefers-reduced-motion`. Loops Framer JS em telas de story ainda
  precisam do hook por componente (próxima rodada).

## Acessibilidade
- ✅ Foco de teclado visível (global). ✅ `prefers-reduced-motion` (CSS). ✅ Contraste `--text-locked`.
- Pendências: contraste de selos laranja, focus-trap em modais, `aria-hidden` em emojis,
  `role="dialog"` no StoryPlayer/TermReader. WCAG melhora significativamente, mas não está 100% AA.

## Segurança
- ✅ CSPRNG nos tokens. ✅ Metadados probatórios da assinatura (hash/versão/dispositivo/CPF/nome).
- ⚠️ **Bloqueador para Beta com dados reais:** RLS/Auth/CPF (Supabase). **Enquanto rodar só em
  localStorage, não é explorável remotamente** — mas é a primeira frente ao ligar o Supabase.

---

## Próximas prioridades (ordem)

1. **Segurança Supabase** (RLS por papel, Auth, CPF, `signatures` append-only) — *antes de qualquer
   Beta com dados reais.*
2. **DOMPurify** nos termos.
3. **Rive → fallback direto** + **`useReducedMotion`** nos loops Framer.
4. **PWA media cache** + `poster`/`preload` nos vídeos.
5. **Padrão único de modal** (a11y).

---

## Nota geral do projeto

### **7,5 / 10** (estado atual — MVP localStorage, pré-Beta)

**Por quê (honesto):**
- **A favor (8–9):** produto coeso e com identidade própria; frontend premium; TypeScript estrito
  verde; arquitetura limpa e bem separada (`content.ts`/`storage.ts`/`adminStore.ts`);
  code-splitting; `SessionContext` exemplar; admin profissional. **Não parece feito por IA/template.**
- **Contra (puxa para baixo):** a segurança de backend (RLS/Auth/CPF) é o **calcanhar de Aquiles** —
  hoje inerte porque o app roda em localStorage, mas **vira Crítico no segundo em que o Supabase for
  ligado em produção**. Há também pendências de a11y (não-100% AA) e perf (Rive/loops) que são
  seguras mas reais.
- **O build de 5 GB** (agora corrigido) sozinho impediria um deploy real — era o item mais grave e
  foi resolvido nesta sprint.

**Veredito de CTO:** *"Eu teria confiança para continuar desenvolvendo sobre esta base nos próximos
meses?"* → **Sim, para evolução de produto/conteúdo localmente.** A base é limpa, organizada e
estável o suficiente para receber as próximas features. **Porém, há UMA linha vermelha:** **não
exponha a Beta a dados reais (Supabase em produção) antes de fechar RLS/Auth/CPF.** Esse é o único
item que, se ignorado, transforma um bom projeto em um incidente de LGPD. Com essa frente endereçada
(Fase 2 de segurança), a nota sobe para **8,5–9**.
