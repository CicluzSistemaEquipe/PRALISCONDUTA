# DASHBOARD_PATTERNS — Pralís Admin ☀️

> Padrões acionáveis para dashboards, KPIs, gráficos e drill-down no **mundo admin**
> (claro, produtivo). Valores em `DESIGN_TOKENS.json`. Mundo, leis e tom em
> `BRAND_RULES.md` / `DESIGN_SYSTEM.md`.
> Telas-âncora: `SCREENSHOTS/APPROVED_SCREENS/admin-dashboard.png`,
> `admin-relatorios.png`, `admin-gerentes.png`.

**Regra-mãe:** admin é sempre claro. **Sem dourado na UI** (dourado é brilho do app).
**1 laranja por tela** (`color.admin.accent #F26B2A`), reservado à ação/foco principal.
Preferir **borda 1px** (`color.admin.border`) a sombra. Sombra só em popover/modal.

---

## 1. Anatomia da tela de dashboard

```
┌──────────┬───────────────────────────────────────────────────────────┐
│          │  Olá, {nome}                              [período ▾] [↻]   │ ← header da tela
│ SIDEBAR  │  Visão geral da conduta · atualizado há 3 min              │   h1 22/700, subtítulo muted
│  248px   ├───────────────────────────────────────────────────────────┤
│          │  ┌─KPI─┐ ┌─KPI─┐ ┌─KPI─┐ ┌─KPI─┐                          │ ← faixa de KPIs (4 col ≥1024)
│ • Dash   │  │     │ │     │ │     │ │     │                          │
│ • Colab  │  └─────┘ └─────┘ └─────┘ └─────┘                          │
│ • Gerent ├───────────────────────────────────────────────────────────┤
│ • Módulo │  ┌── Gráfico principal (área) ──────┐ ┌── Lista/rank ───┐ │ ← 2/3 + 1/3
│ • Relat  │  │  conclusão ao longo do tempo     │ │ equipes top     │ │
│          │  └──────────────────────────────────┘ └─────────────────┘ │
│ ___      ├───────────────────────────────────────────────────────────┤
│ rail 64  │  ┌── Tabela herói (atividade / pendências) ──────────────┐ │ ← ver CMS_PATTERNS
│          │  └────────────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────────┘
```

Conteúdo `max-width 1200px`, padding `32px` desktop / `16px` mobile. Ritmo de seção
`32–40px`. Sidebar fixa ≥1024, colapsa para rail 64px, vira drawer off-canvas < 1024.

**Do**
- Uma pergunta por seção: KPIs respondem "como estamos?", gráfico "para onde vamos?",
  tabela "o que fazer agora?".
- Header com período selecionável + timestamp de atualização (honestidade do dado).

**Don't**
- Card-dentro-de-card. Hierarquia por **espaço e tipografia**, não por molduras aninhadas.
- Mais de um laranja competindo. Mais de 4 KPIs na faixa principal.

---

## 2. KPI card (anatomia)

```
┌─────────────────────────────┐
│ TAXA DE CONCLUSÃO           │ ← eyebrow 11/600 uppercase, tracking .06em, muted
│                             │
│ 78,4%   ▲ 6,2 p.p.          │ ← número kpi 28–32/700 tabular  +  delta (verde/vermelho)
│                             │
│ ╱╲__╱‾╲___╱‾  (30 dias)     │ ← sparkline accent, sem eixos, sem grid
└─────────────────────────────┘
```

- **Eyebrow** (`typography.scaleAdmin.eyebrow`) + **número grande tabular**
  (`numeric: tabular-nums`, `kpi` 28–32/700) + **delta** + **sparkline**.
- **Count-up 600ms** na entrada (`motion.durations.kpiCountUp`), easing `standard`.
  Respeitar `prefers-reduced-motion` → mostrar valor final direto.
- Delta: ▲ verde (`admin.success #1E7E4E`) / ▼ vermelho (`admin.danger #C0392B`),
  sempre **cor + ícone + sinal** (nunca só cor). Use "p.p." para pontos percentuais.
- Grid: 1 col < 480 · 2 col 480–1024 · 4 col ≥1024 (`grid.kpiColumns`).

**Don't:** sparkline com eixo/grid; número não-tabular (dança no count-up); delta sem
baseline ("vs. período anterior" implícito pelo período do header).

---

## 3. Gráficos

**Ordem de cores fixa** (`color.chartOrder`):
`#F26B2A` laranja → `#5E3731` marrom → `#64748b` slate → `#5f7d7a` teal-gray → `#B7791F` âmbar.
Máx 4–5 séries. A 1ª série (laranja) é sempre a métrica-herói.

- **Área:** preenchimento **8% de opacidade** da cor da linha, linha 2px, sem marcadores
  por ponto (só no hover). Sem grid pesado: no máx. linhas-guia horizontais sutis
  (`admin.border`), eixo X com poucos ticks.
- **Tooltip:** card branco, borda 1px, sombra `elevation.adminMd`, valor tabular.
- **Barras:** uma cor (accent) quando há 1 dimensão; ordem de cores só com séries
  múltiplas. Cantos `radius.sm 6px`.
- Eixos com `textMuted`, sem títulos de eixo redundantes (o título do card já diz).

```
100%┤
    │            ╭──╮      ← linha accent 2px
 75%┤        ╭───╯  ╰──    ← área accent @8%
    │    ╭───╯
 50%┤────╯
    └────┬────┬────┬────┬───
        jan  fev  mar  abr
```

**Don't:** 3D, gradientes vibrantes, legendas-poluição, dourado, mais de 5 cores,
gridlines escuras.

---

## 4. Estado "sem dados ainda" (elegante)

Obrigatório nos 3 estados (loading/empty/error). O empty é o mais negligenciado — aqui é
**de primeira classe**.

```
┌──────────────────────────────────────────┐
│            ◌  (ícone lucide, 1.5, muted)  │
│                                           │
│        Sem dados ainda                    │ ← h3 15/600 ink
│  Os números aparecem quando o primeiro    │ ← body 14 muted, 1 frase
│  colaborador concluir um módulo.          │
│                                           │
│        [ Convidar equipe ]                │ ← ação opcional, secundária
└──────────────────────────────────────────┘
```

**Do:** explicar **quando** o dado chega (causa), oferecer a próxima ação útil.
Skeleton no loading (blocos `bgMuted`), não spinner solitário.
**Don't:** "0%" gigante sem contexto (parece falha); gráfico vazio com eixos fantasma;
"No data" em inglês.

---

## 5. Drill-down: Gerente → Equipe → Colaborador

Padrão de navegação 360 (já entregue — ver `admin-gerentes.png`). Profundidade progressiva:
cada nível responde mais fundo sem perder o caminho de volta.

```
NÍVEL 1 — GERENTES (lista/tabela herói)
  Gerente            Equipe   Conclusão   Pendências
  Ana Souza            12        82% ●●●●○      2     →  (linha clicável)
  Bruno Lima           8         64% ●●●○○      5     →
        │ clique abre…
        ▼
NÍVEL 2 — EQUIPE DA ANA (header com breadcrumb + KPIs da equipe)
  ‹ Gerentes / Ana Souza
  [KPI equipe] [KPI equipe] [KPI equipe]
  Colaborador        Módulos   Último acesso   Status
  Caio Reis           5/6       ontem          ● Em dia      →
  Duda Alves          2/6       há 9 dias       ● Atrasado    →
        │ clique abre…
        ▼
NÍVEL 3 — COLABORADOR (perfil + trilha + assinaturas)
  ‹ Gerentes / Ana Souza / Caio Reis
  timeline de módulos · datas de conclusão · termos assinados
```

**Regras**
- **Breadcrumb sempre visível** no topo (`‹ pai / filho`), clicável em cada nó.
- Linha inteira clicável → afunda; ações pontuais ficam no hover (não competem com o clique
  de navegação). Cursor pointer + hover row (`bgSubtle`).
- Cada nível tem seus **próprios KPIs** (contextuais), não repetir os globais.
- Status sempre **cor + ícone + texto** (Em dia / Atrasado / Concluído).
- Transição de nível: `motion.durations.page` 280ms, easing `standard`; respeitar
  reduced-motion. Wrapper **nunca** inicia em `opacity:0`.
- < 768: a tabela vira **cards** (ver CMS_PATTERNS §tabela), drill-down vira push de tela.

**Don't:** modais empilhados para descer níveis (perde contexto); perder o breadcrumb;
recarregar KPIs globais em cada nível.

---

## 6. Checklist de dashboard
- [ ] 1 laranja na tela · sem dourado · borda > sombra.
- [ ] KPIs: eyebrow + número tabular + delta(cor+ícone) + sparkline + count-up 600ms.
- [ ] Gráfico na ordem de cores oficial · área 8% · sem grid pesado.
- [ ] 3 estados (skeleton / "sem dados ainda" elegante / erro).
- [ ] Drill-down com breadcrumb, KPIs contextuais, status cor+ícone+texto.
- [ ] reduced-motion respeitado · tabular-nums em todo dado · AA (texto laranja = `#C9501A`).
