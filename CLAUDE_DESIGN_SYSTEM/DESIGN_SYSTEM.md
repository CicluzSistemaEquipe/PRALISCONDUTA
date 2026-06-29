# DESIGN_SYSTEM — Pralís (visão operacional)

> O mapa central. Como o Claude Design pensa antes de produzir qualquer material.
> Valores em `DESIGN_TOKENS.json`. Filosofia em `../DESIGN_KNOWLEDGE_BASE_PRALIS/`.

---

## 1. Os dois mundos (decisão #1)

Tudo começa aqui. Identifique o mundo antes de qualquer pixel.

| | 🌙 **App colaborador** | ☀️ **Admin / CMS** |
|---|---|---|
| Objetivo | Engajar, acolher, **fazer concluir** | **Produtividade**, clareza, velocidade |
| Tema | Escuro quente `#0d0800` | Claro `#ffffff` (neutros quentes) |
| Ação | Laranja `#f37435` | Laranja `#f26b2a` (1 por tela) |
| Dourado | Brilho/detalhe premium | **Não usar na UI** |
| Tipografia | Montserrat + display expressivo | Montserrat (sem serifa) |
| Motion | Expressivo c/ propósito (sem loop/blur) | Snappy (Linear, 120–280ms) |
| Layout | Mobile-first, fullscreen, story | Sidebar 248px + conteúdo max 1200 |
| Telas-âncora | `colaborador-*` em APPROVED_SCREENS | `admin-*` em APPROVED_SCREENS |

> Há um **light mode opcional do app** (creme `#fdf8f2`) — é o mesmo mundo emocional,
> mais claro. **Não** é o admin. O admin é sempre claro e blindado.

---

## 2. As 8 leis de ouro (resumo de `BRAND_RULES.md`)

1. **Identidade primeiro** — toda peça nasce da marca, não de um estilo.
2. **Nunca cara de template/IA** — erro capital, bloqueia entrega.
3. **Laranja = ação** (um por tela). **Dourado = brilho** (não no admin).
4. **Tokens, não números mágicos.**
5. **Motion com propósito** — comunica estado; app sem loop/blur; reduced-motion sempre.
6. **3 estados sempre** — loading, empty, error. Feedback em toda ação.
7. **Acessibilidade AA** — contraste, foco, teclado, toque ≥44px, status nunca só por cor.
8. **Contrato de produto congelado** — não tocar desbloqueio/progresso/conclusão/
   assinatura/`Module`/`Story`.

---

## 3. Fluxo de trabalho (sempre)

```
1. DIREÇÃO   → mundo? objetivo? público? conceito? (antes de construir)
2. TOKENS    → DESIGN_TOKENS.json (cores/espaço/type/motion)
3. PADRÃO    → o doc da superfície (dashboard / cms / training / presentation)
4. COMPONENTES → COMPONENT_MAP.json (reusar antes de criar)
5. REVISÃO   → CLAUDE_PROMPTS/design-review.md (gates; 🔴 bloqueia)
```

---

## 4. Onde olhar, por tarefa

| Vou criar… | Leia |
|---|---|
| Dashboard | `DASHBOARD_PATTERNS.md` + `LAYOUT_PATTERNS.md` + `CLAUDE_PROMPTS/create-dashboard.md` |
| Tela do admin / CMS | `CMS_PATTERNS.md` + `COMPONENTS.md` + `CLAUDE_PROMPTS/create-cms.md` |
| Tela do app (colaborador) | `TRAINING_APP_PATTERNS.md` + `CLAUDE_PROMPTS/create-screen.md` |
| Apresentação | `PRESENTATION_SYSTEM.md` + `CLAUDE_PROMPTS/create-presentation.md` |
| Landing page | `PRESENTATION_SYSTEM.md` + `BEST_PRACTICES/` + `CLAUDE_PROMPTS/create-landing.md` |
| Animação/motion | `MOTION_SYSTEM.md` + `CLAUDE_PROMPTS/create-animation.md` |
| Fluxo de usuário | `UX_PATTERNS.md` + `CLAUDE_PROMPTS/create-flow.md` |
| Tela mobile / desktop | `LAYOUT_PATTERNS.md` + prompts `create-mobile`/`create-desktop` |
| Redesign | `CLAUDE_PROMPTS/redesign.md` + telas em APPROVED_SCREENS |
| Auditoria UX / Motion | `CLAUDE_PROMPTS/audit-ux.md` / `audit-motion.md` |
| Design Review | `CLAUDE_PROMPTS/design-review.md` |
| Product Discovery | `CLAUDE_PROMPTS/product-discovery.md` |

---

## 5. Telas reais como referência

Em `SCREENSHOTS/APPROVED_SCREENS/` estão **13 telas aprovadas** capturadas do produto
rodando. Use-as como **verdade visual** — ao criar algo novo, ele deve "caber" no
mesmo idioma dessas telas. Cada uma tem documentação em `EXAMPLES/` (objetivo,
hierarquia, fluxo, componentes) e estrutura em `WIREFRAMES/`.

**Mundo app 🌙:** home/feed (Trilha Viva), storyplayer (módulo), progresso, perfil, login.
**Mundo admin ☀️:** dashboard, colaboradores, gerentes, módulos, editor (preview real),
relatórios, termos, login.
**Planejado (P3):** Avisos — sem tela ainda; existe só wireframe + padrão.

---

## 6. Anti-objetivos (o que este sistema impede)

- ❌ Material genérico / cara de IA.
- ❌ Misturar a linguagem dos dois mundos.
- ❌ Cor/ível inventado fora dos tokens.
- ❌ Motion decorativo, loop infinito ou blur no app.
- ❌ Quebra do contrato de produto.
- ❌ Entregar sem rodar o Design Review.

---

## 7. Definição de "entregue"
Direção definida → tokens/componentes oficiais usados → padrão da superfície seguido →
acessível e on-brand → Design Review sem 🔴 → **parece Pralís, não template.**
