# LAYOUT_PATTERNS — Pralís (estrutura de tela)

> Como montar o esqueleto de cada superfície. Valores em `DESIGN_TOKENS.json`
> (`grid`, `spacing`, `breakpoints`). Filosofia em `../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md`.
> Por superfície: `DASHBOARD_PATTERNS.md` · `CMS_PATTERNS.md` · `TRAINING_APP_PATTERNS.md`.
> Comportamento e copy em `UX_PATTERNS.md`.

**Grid base (admin):** 12 colunas · gutter `24px` · conteúdo `max 1200px`.
**Escala de espaço:** base **4** (4/8/12/16/20/24/32/40/48/64).
**Breakpoints:** `sm 640` · `md 768` · `lg 1024` · `xl 1280`.

---

## 1. App-shell — 🌙 colaborador (mobile fullscreen)

Tela cheia, sem chrome de desktop. Respeita `safe-area`. BottomNav fixa.

```
┌─────────────────────────────┐  ← safe-area-top (notch)
│  status / saudação           │
│                              │
│   CONTEÚDO (scroll vertical) │  ← 1 mensagem principal no topo
│   story / feed / progresso   │     responde <3s: onde parei?
│                              │
│                              │
├─────────────────────────────┤
│  🏠   📚   📈   👤           │  ← BottomNav fixa (z-40)
└─────────────────────────────┘  ← safe-area-bottom
```

- **Container:** fullscreen; barras (BottomNav) limitadas a `max 480px` centralizado.
- **BottomNav:** fixa, z-40, toque ≥44px, item ativo = pill laranja (spring `navPill`).
- **Sem sombra pesada, sem blur** (performance). Fundo `#0d0800` via AnimatedBackground.
- **Story player:** fullscreen, navegação por toque/seta, progress no topo (z-30).

```
STORY (fullscreen)
┌─────────────────────────────┐
│ ▰▰▰▱▱  progress (z-30)       │
│                              │
│        CONTEÚDO DO PASSO     │  ← 1 ideia por tela
│                              │
│  ‹ anterior      próximo ›   │  ← toque/teclado, Esc sai
└─────────────────────────────┘
```

---

## 2. Shell — ☀️ admin / CMS (sidebar + topbar)

```
┌──────────┬──────────────────────────────────────────┐
│          │  TOPBAR  (busca · perfil · ação contextual)│ z-30 sticky
│ SIDEBAR  ├──────────────────────────────────────────┤
│  248px   │   AdminPageHeader                          │
│          │   eyebrow → H1 22/700 → [ 1 ação laranja ] │
│ nav      │                                            │
│ agrupada │   ── conteúdo (max 1200, padding 32) ──    │
│          │   grid 12 / gutter 24                       │
│ (colapsa │                                            │
│  rail 64)│                                            │
└──────────┴──────────────────────────────────────────┘
```

- **Sidebar:** `248px` fixa ≥1024; colapsa para **rail 64px** (só ícones, tooltip no hover).
- **Topbar:** sticky (z-30), altura enxuta; ação primária contextual à direita.
- **AdminPageHeader:** `eyebrow → título → (subtítulo) → 1 ação`. Uma ação laranja por tela.
- **Conteúdo:** `max-width 1200px`, padding `32px` desktop / `16px` mobile.
- **Elevação:** preferir **borda 1px** (`#ECEAE7`) a sombra; sombra só em dropdown/modal/toast.

---

## 3. Grids (admin)

**KPIs** — colunas por breakpoint (token `grid.kpiColumns`):

```
< 480px        480–1024px           ≥ 1024px
┌────────┐     ┌─────┬─────┐        ┌───┬───┬───┬───┐
│  KPI 1 │     │KPI 1│KPI 2│        │ 1 │ 2 │ 3 │ 4 │
├────────┤     ├─────┼─────┤        └───┴───┴───┴───┘
│  KPI 2 │     │KPI 3│KPI 4│         1 destaque (laranja),
│  ...   │     └─────┴─────┘         demais neutros
└────────┘
   1 col          2 col                 4 col
```

**Cards / listas:** grid 12, gutter `24px`. Card padding `20–24px`, radius `12px` (admin) / `20px` (app).
Ritmo entre seções `32–40px`. **Sem card-dentro-de-card** — agrupe por espaço + hairline.

---

## 4. Responsividade (3 transformações-chave)

| Elemento | Desktop (≥1024) | Tablet/Mobile (<1024 / <768) |
|---|---|---|
| **Sidebar** | fixa 248px | **drawer off-canvas** (hambúrguer), overlay z-60, Esc fecha |
| **Tabela** | linhas com colunas | **cards empilhados** < 768 (label: valor por linha) |
| **Modal** | centralizado | **bottom-sheet** no mobile (sobe de baixo, arrasta p/ fechar) |

```
TABELA ≥768            CARDS <768
Nome    | Equipe | %   ┌─────────────────┐
Joana   | Forno  | 80  │ Joana           │
Marcos  | Massa  | 45  │ Equipe   Forno   │
                       │ Progresso  80%   │
                       └─────────────────┘
```

- KPIs: 4 → 2 → 1 coluna conforme tabela do item 3.
- Touch target ≥44px no mobile; controles desktop 36px.

---

## 5. Composição de página (admin) — sempre a mesma espinha

```
eyebrow         RELATÓRIOS            ← 11px UPPER, tracking, muted
título          Evolução da equipe    ← H1 22/700
                                      → 1 ação laranja (canto sup. direito)
─────────────────────────────────────
[ filtros / segmentação ]             ← opcional, leve
[ KPIs ]                              ← grid do item 3
[ conteúdo: gráfico / tabela / lista ]← 3 estados sempre (ver UX_PATTERNS §5)
```

- **Uma** ação primária por tela (laranja). Secundárias = neutras/ghost.
- Ordem de leitura = ordem de DOM = ordem de Tab (acessibilidade).

---

## 6. Split layouts — editor = form + preview

Editor do módulo (CMS): formulário à esquerda, **preview real** à direita.

```
≥1024px                                  <1024px (empilha)
┌───────────────┬──────────────────┐     ┌──────────────────┐
│  FORM (edição)│  PREVIEW (real)  │     │  [ Editar ][ Ver ]│ ← abas
│  blocos       │  story do app    │     ├──────────────────┤
│  progressive  │  atualiza ao vivo│     │  FORM   (ativo)  │
│  disclosure   │  (mundo escuro)  │     │  …               │
│  scroll indep.│  scroll indep.   │     └──────────────────┘
└───────────────┴──────────────────┘
   ~55%               ~45%
```

- **Preview mostra o mundo do app** (escuro/quente) dentro do admin (claro) — fronteira nítida, não misturar tokens.
- Painéis com **scroll independente**; o preview reflete o estado salvo/rascunho ao vivo.
- < 1024px: vira **abas** (Editar | Visualizar), nunca dois scrolls competindo no mobile.
- Outros splits: lista + detalhe (master-detail), filtros + resultados.

---

## 7. Checklist de layout

- [ ] Mundo certo? (app fullscreen escuro vs admin sidebar claro) — sem misturar tokens.
- [ ] App: safe-area respeitada, BottomNav fixa, sem blur/sombra pesada.
- [ ] Admin: sidebar 248 (rail 64), conteúdo `max 1200`, padding 32/16, grid 12 / gutter 24.
- [ ] Página segue eyebrow → título → conteúdo → **1 ação** laranja.
- [ ] KPIs 1/2/4 por breakpoint; sem card-dentro-de-card; ritmo de seção 32–40px.
- [ ] Sidebar→drawer <1024 · tabela→cards <768 · modal→bottom-sheet no mobile.
- [ ] Ordem visual = ordem de DOM = ordem de Tab.
- [ ] Os 3 estados em todo bloco de dados (ver `UX_PATTERNS.md` §5).

> Detalhe por superfície: `DASHBOARD_PATTERNS.md` (métricas), `CMS_PATTERNS.md`
> (edição/tabelas), `TRAINING_APP_PATTERNS.md` (story/feed/trilha).
