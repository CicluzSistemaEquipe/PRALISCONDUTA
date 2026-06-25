# Pralís Admin — Design System (v1)

> **Direção oficial:** SaaS moderno e premium — **Conceito B (Linear + Notion + Vercel)**,
> executado com a **leveza e o espaço em branco do Conceito A (Apple)**.
> Objetivo do painel: **organização · produtividade · rapidez · clareza · simplicidade.**
> A identidade Pralís aparece por **paleta, tipografia, ícones, componentes e detalhes** —
> **nunca por decoração** (sem tema de padaria, sem texturas, sem modo escuro).
>
> Este documento é **obrigatório** para TODAS as telas administrativas (atuais e futuras).
> Escopo: `/admin/*`. Não altera app do colaborador, Supabase ou lógica de negócio.

---

## 0. Identidade Pralís disponível no sistema (fonte da verdade)

**Cores oficiais da marca** (de `PROMPT_CORES.md` + `tailwind.config.ts` + `pralis.css`):
`#000000` preto · `#5e3731` marrom · `#b8860b` dourado · `#f37435` laranja · `#ffffff` branco
· auxiliares `#5dd87a` verde, `#e8cfa0` creme.

**Assets de marca** (`src/assets/brand/`): `logo-preta.svg`, `logo-branca.svg`,
`logo-primario-laranja/bege/fundo-bordo.png`, `logo-secundario-bege/bordo.png`,
`simbolo-pralis.svg`, `simbolo-par.svg`, `simbolo-espiga.svg`, `padrao-fundo.svg`, `pattern-brand.svg`.
**Fontes** (`src/assets/fonts/`): MadeByDillan (display), Montserrat (UI), TR Freehand (hand).

**Tradução para o admin claro:**
- **Laranja `#f37435`** → única cor de **ação**.
- **Marrom `#5e3731`** → só **detalhe/secundário** (wordmark, avatar fallback, ênfase rara).
- **Dourado `#b8860b`** → praticamente **não usar** (fica sujo no branco); reservado a um eventual detalhe premium.
- **`logo-preta.svg` / símbolo preto** → marca na sidebar e favicon (fundo claro).
- **MadeByDillan** → só dentro do logotipo. UI inteira em **Montserrat**. **Mono** para códigos.

---

## 1. Paleta (tema claro — neutros quentes)

```
/* Canvas & superfícies */
--bg-app:        #FFFFFF;   /* fundo geral */
--bg-subtle:     #FAF9F8;   /* seções, header de tabela, hover de linha */
--bg-muted:      #F5F4F2;   /* hover de botão ghost, fills sutis */
--bg-inset:      #F2F0ED;   /* divisórias de linha, trilhos */

/* Bordas (preferir borda 1px a sombra) */
--border:        #ECEAE7;   /* hairline padrão (cards, tabelas) */
--border-strong: #DAD6D1;   /* inputs, botões secundários */

/* Texto (near-black quente, nunca #000 puro) */
--ink:           #1A1714;   /* texto primário / títulos */
--text-secondary:#57514B;   /* corpo secundário */
--text-muted:    #8A837C;   /* labels, captions, placeholders */
--text-disabled: #B8B2AB;

/* Marca — AÇÃO (laranja) */
--accent:        #F26B2A;   /* botão primário, nav ativo, foco, séries de gráfico */
--accent-hover:  #E25E1F;
--accent-active: #C9501A;
--accent-text:   #C9501A;   /* laranja escuro p/ link/legenda sobre branco (AA) */
--accent-tint:   #FEF1EA;   /* fundo de seleção/realce suave */

/* Marca — DETALHE (marrom) */
--brand-brown:   #5E3731;   /* wordmark, ênfase rara, avatar fallback */
--brown-tint:    #F4EFEE;

/* Status */
--success:#1E7E4E; --success-bg:#ECF7F0;
--danger: #C0392B; --danger-bg: #FCEEEC;
--warning:#B7791F; --warning-bg:#FBF3E5;

/* Foco */
--ring: 0 0 0 3px rgba(242,107,42,0.25);
```

**Regras de cor:** branco predomina; **1 laranja por tela** (a ação principal); marrom só
em detalhe; status só para feedback; cinzas elegantes para tudo que é estrutura. Sem
gradientes (exceto, se necessário, 1 micro-gradiente em gráfico). Sem dourado na UI.

---

## 2. Tipografia

- **UI/corpo:** Montserrat (400 / 600 / 700).
- **Display:** MadeByDillan — **somente no logotipo** (não usar em texto de UI).
- **Mono:** `"JetBrains Mono", "IBM Plex Mono", ui-monospace` — códigos, tokens, IDs.
- **Números:** sempre `font-variant-numeric: tabular-nums`.

| Estilo | Tam/Linha | Peso | Tracking | Uso |
|---|---|---|---|---|
| Page title (H1) | 22 / 28 | 700 | -0.01em | título da tela |
| Section (H2) | 17 / 24 | 600 | — | títulos de bloco |
| Subsection (H3)| 15 / 22 | 600 | — | cards, grupos |
| Body | 14 / 22 | 400 | — | texto padrão / células |
| Body-strong | 14 / 22 | 600 | — | nome, valor em destaque |
| Label | 13 / 18 | 500 | — | labels de input |
| Eyebrow/Caption| 11 / 16 | 600 | 0.06em UPPER | overline, header de tabela |
| KPI number | 28–32 | 700 | -0.01em | métricas (tabular) |
| Mono | 13 / 20 | 500 | — | `ACCESS-CODE`, ids |

---

## 3. Grid & layout
- **App shell:** sidebar fixa **248px** (colapsa para rail de **64px**) + área de conteúdo.
- **Conteúdo:** `max-width 1200px`, centralizado; padding **32px** desktop / **16px** mobile.
- **Grid:** 12 colunas, gutter **24px**.
- **Breakpoints:** sm 640 · md 768 · lg 1024 · xl 1280.
- **< lg (1024):** sidebar vira **drawer off-canvas** (hambúrguer + overlay).
- **Header de página padrão:** `[eyebrow] Título + subtítulo` à esquerda, **1 ação primária** à direita.

## 4. Espaçamento (escala base 4)
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`
- Padding de card: 20–24 · input: 10×12 · botão: 8×14.
- Ritmo vertical entre seções: **32–40**. Hierarquia por **espaço**, não por caixa.

## 5. Raio & elevação
- **Raio:** sm 6 · **md 8** (inputs/botões) · **lg 12** (cards) · pill 999.
- **Sombra (discreta, só camadas flutuantes):**
  - `xs` `0 1px 2px rgba(26,23,20,.05)`
  - `sm` `0 1px 3px rgba(26,23,20,.06), 0 1px 2px rgba(26,23,20,.04)`
  - `md` `0 8px 24px rgba(26,23,20,.10)` — **só** dropdown/popover/modal/toast.
  - **Cards usam borda 1px, não sombra.** Foco usa `--ring`.

## 6. Botões
- Altura **36** (sm 32 · lg 40), raio 8, peso 600, 14px, gap 8, ícone 16.
- **Primary:** bg `--accent`, texto branco; hover `--accent-hover`; active `scale(.98)`; foco `--ring`.
- **Secondary:** branco, borda `--border-strong`, texto `--ink`; hover `--bg-subtle`.
- **Ghost:** transparente, texto secundário; hover `--bg-muted`.
- **Danger:** texto/borda `--danger`; sólido só em confirmação destrutiva.
- **Icon-button:** 32×32 ghost. **Disabled:** opacity .5.
- **1 primary por tela.**

## 7. Inputs
- Altura 36, raio 8, borda `--border-strong`, bg branco, texto 14 `--ink`, placeholder `--text-muted`.
- **Foco:** borda `--accent` + `--ring`. **Erro:** borda `--danger` + helper text.
- Label 13/500 `--text-secondary` acima. Variantes: text, textarea, **select**, **search** (ícone à esquerda),
  **switch** (laranja quando on), checkbox/radio (laranja), **segmented control** (estilo Linear), combobox.

## 8. Tabelas (componente herói — Linear/Notion)
- Container: borda 1px `--border`, raio 12, branco.
- **Header:** bg `--bg-subtle`, texto eyebrow 11 UPPER `--text-muted`, sticky, altura 40, hairline inferior.
- **Linhas:** altura **48**, padding 12–16, 14px; divisória `--bg-inset`; **hover** `--bg-subtle`; **sem zebra**.
- **Selecionada:** faixa/borda-esquerda `--accent` + bg `--accent-tint`.
- Números **tabular**; status como **pills**; célula primária com avatar+nome; **ações aparecem no hover** (direita).
- Header **ordenável** (caret); coluna redimensionável (opcional); **< 768 → vira cards** (label:valor) ou scroll-x com 1ª coluna fixa.
- **Empty/loading/error** dentro da área da tabela (ver §14).

## 9. Cards (usar com parcimônia)
- Padrão: branco, borda 1px `--border`, raio 12, padding 20–24, **sem sombra**. Título H3 + ação opcional.
- **KPI/stat:** eyebrow (label muted) + número grande (28–32 tabular) + delta (verde/vermelho pequeno) + sparkline opcional.
- Preferir **agrupar por espaço + hairline** a aninhar cards. Nunca card dentro de card dentro de card.

## 10. Gráficos
- Biblioteca leve (Recharts ou SVG custom — definir na implementação). Regras visuais:
  - **Linha/área:** stroke 2px `--accent`, área `--accent` @8% (chapado, sem gradiente pesado), sem grid vertical, baseline fraca, dot só no hover.
  - **Donut/progresso:** trilho `--border`, valor `--accent`; centro com número (tabular) + caption.
  - **Barras:** `--accent`, topo arredondado 4; série secundária em marrom dessaturado.
  - **Sparklines** em cards/linhas de tabela.
  - **Tooltip:** card branco, sombra `md`, borda 1px, números mono.
  - **Ordem de cor (máx 4–5, dessaturada):** laranja → marrom → slate‑500 → teal‑gray → âmbar‑700.
  - **Sem dados:** baseline tracejada + "Sem dados ainda" `--text-muted` — nunca um "0%" parecendo quebrado.

## 11. Ícones
- **lucide-react** (já no projeto): stroke 1.5, **18px** na nav, **16px** inline/botões.
- Cor padrão `--text-secondary`; **laranja quando ativo/selecionado**; nunca multicor.
- **Marca:** `logo-preta.svg` no topo da sidebar; `simbolo-pralis` (preto/laranja) no favicon/rail colapsado.

## 12. Animações (Motion — Linear-snappy + refinado)
- **Durações:** micro 120 · ui 180 · painel 240 · página 280 (ms).
- **Easing:** padrão `cubic-bezier(0.2, 0, 0, 1)`; enfático `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Padrões:**
  - Entrada de página/seção: fade + 4–8px rise, **stagger 40ms**.
  - Hover: transição de bg/borda 120ms; primary active `scale(.98)`.
  - **KPIs:** count-up 600ms ease-out no 1º load.
  - Drawer/command-palette/modal: 240ms slide+fade.
  - Toast: slide-up + fade. Skeletons: shimmer sutil.
  - **`prefers-reduced-motion`:** desliga transforms, mantém opacity.
  - **Nada decorativo/looping.** Movimento = feedback e continuidade.

## 13. Responsividade
- Sidebar fixa ≥1024; **drawer < 1024**. Conteúdo `max 1200`, padding 16→32.
- **KPIs:** 1col <480 · 2col 480–1024 · 4col ≥1024.
- **Tabelas:** stacked cards <768 (ou scroll-x com 1ª coluna fixa).
- **Touch ≥44px** no mobile; controles 36px no desktop. Modais viram **bottom-sheet** no mobile.

## 14. Regras de UX (obrigatórias)
- **1 ação primária por tela**; ação destrutiva exige **confirmação** e nunca é o foco padrão.
- **Todo** bloco/lista tem os 3 estados: **loading (skeleton) · empty (ícone+texto+CTA) · error (retry)**.
- **UI otimista** em toggles/edições + **toast** de feedback (com undo quando possível).
- Header de página consistente (eyebrow + título + subtítulo + 1 ação).
- **Teclado:** foco sempre visível; Esc fecha; Enter envia; (⌘K command palette — futuro).
- **Acessibilidade AA:** contraste ≥4.5 (texto) / ≥3 (grande); labels em inputs; `aria` em toggles/tabelas; ordem de foco; reduced-motion.
- Datas: relativas + absolutas no hover. Números **tabular**. Copy PT-BR clara e orientada à ação.
- **Densidade:** confortável por padrão, tabelas compactas. **Sem aninhar cards.** O branco é o layout.

---

## 15. Aplicação por tela (escopo `/admin/*`)
A ordem de implementação (1 tela por vez, com validação de build/responsividade/a11y/consistência):
1. **Fundação** — tokens deste DS em `admin.css` (sem mudar telas ainda).
2. **AdminSidebar** — nav clara, marca preta, ativo laranja, rail colapsável, drawer mobile.
3. **AdminLogin** — card central clean (fundo branco), 1 primary, foco/erro AA.
4. **AdminDashboard** — KPIs (grid), gráficos do §10, count-up, empty data.
5. **AdminColaboradores** — tabela herói + empty/loading + responsivo (cards <768).
6. **AdminGerentes** — tabela + empty state.
7. **AdminModulos** — lista organizada, toggles, largura disciplinada.
8. **AdminModuloEditor + AdminTermos** — editor + preview limpos.

Cada tela: **Design Gate + UX Gate + Motion Gate + A11y Gate + Build Gate** antes de seguir.
