# CLAUDE_DESIGN_SYSTEM — Pralís

> **Pacote pronto para o Claude Design.** Importe esta pasta e qualquer IA gera
> materiais da Pralís mantendo identidade visual, UX, motion e filosofia de produto
> **automaticamente**.

Esta pasta **não repete** a documentação — ela **organiza e operacionaliza**. A
teoria/filosofia completa vive em [`../DESIGN_KNOWLEDGE_BASE_PRALIS/`](../DESIGN_KNOWLEDGE_BASE_PRALIS/).
Aqui estão os **tokens, mapas, padrões, telas reais e prompts** prontos para uso.

---

## 🚀 Como o Claude Design deve usar (ordem de carregamento)

1. **`DESIGN_TOKENS.json`** — a fonte única de valores (cores, espaço, tipografia,
   motion, grid…). **Nunca invente hex/px; use estes tokens.**
2. **`DESIGN_SYSTEM.md`** — o mapa: os dois mundos, como navegar este pacote.
3. **`BRAND_RULES.md`** — o que é inegociável.
4. **`COMPONENT_MAP.json` + `COMPONENTS.md`** — o que usar e com quais tokens.
5. O **padrão da superfície** que você vai criar (`DASHBOARD_PATTERNS`,
   `CMS_PATTERNS`, `TRAINING_APP_PATTERNS`, `PRESENTATION_SYSTEM`, `LAYOUT_PATTERNS`).
6. O **prompt pronto** correspondente em `CLAUDE_PROMPTS/`.
7. Antes de entregar: rode o **Design Review** (`CLAUDE_PROMPTS/design-review.md`).

---

## 📁 Conteúdo

### Sistema (tokens & regras)
| Arquivo | O que é |
|---|---|
| `DESIGN_TOKENS.json` | **Fonte única** de tokens (cores, spacing, radius, type, motion, z-index, elevation, grid, breakpoints) |
| `COMPONENT_MAP.json` | Mapa componente → tokens · quando usar · quando evitar |
| `DESIGN_SYSTEM.md` | Visão geral e índice operacional |
| `COLOR_SYSTEM.md` · `TYPOGRAPHY_SYSTEM.md` · `SPACING_SYSTEM.md` | Sistemas detalhados (derivam dos tokens) |
| `MOTION_SYSTEM.md` | Motion operacional (curvas, durações, snippets) |
| `ICONOGRAPHY.md` | Ícones (lucide) + ícones de marca |
| `BRAND_RULES.md` | Regras permanentes da marca |

### Padrões (como construir cada superfície)
| Arquivo | Para |
|---|---|
| `COMPONENTS.md` | Biblioteca de componentes (uso) |
| `UX_PATTERNS.md` | Hierarquia, estados, feedback |
| `LAYOUT_PATTERNS.md` | Grids, shells, responsividade |
| `DASHBOARD_PATTERNS.md` | Dashboards/KPIs/gráficos |
| `CMS_PATTERNS.md` | Admin/CMS, tabelas, editor |
| `TRAINING_APP_PATTERNS.md` | App do colaborador (story, Lis, jornada) |
| `PRESENTATION_SYSTEM.md` | Apresentações/keynotes |

### Recursos
| Pasta | Conteúdo |
|---|---|
| `SCREENSHOTS/APPROVED_SCREENS/` | **Telas reais aprovadas** (13) — referência visual canônica |
| `SCREENSHOTS/COMPONENT_SCREENSHOTS/` | Componentes isolados |
| `WIREFRAMES/` | Wireframes (estrutura/hierarquia) de cada tela |
| `EXAMPLES/` | Por tela: objetivo, hierarquia, fluxo, componentes |
| `LOGOS/` · `ASSETS/` | Logos, símbolos (espigas), Lis, patterns |
| `REFERENCES/` | Materiais de referência aplicada |
| `CLAUDE_PROMPTS/` | Prompts prontos (dashboard, apresentação, landing, telas, motion, fluxos, CMS, mobile, desktop, redesign, auditorias, review, discovery) |
| `BEST_PRACTICES/` | Princípios de Apple, Stripe, Linear, Notion, Framer, Figma, Arc, Raycast, Duolingo, Coursera, ClickUp, Shopify |

---

## 🌍 A regra de uma frase

> A **primeira decisão** de qualquer peça: **em qual mundo?**
> 🌙 **App colaborador** (escuro `#0d0800`, laranja `#f37435`, emocional/engajamento) ou
> ☀️ **Admin/CMS** (claro `#fff`, laranja `#f26b2a`, produtivo, **sem dourado na UI**).
> Nunca misture as linguagens.

---

## ⚖️ Precedência

- **Valores exatos** (hex, px, ms): o **código do projeto** vence
  (`tailwind.config.ts`, `src/styles/pralis.css`, `src/admin/admin.css`).
  `DESIGN_TOKENS.json` é o espelho fiel desses valores.
- **Princípios e direção:** a `DESIGN_KNOWLEDGE_BASE_PRALIS/` vence.
- **Operação (como aplicar agora):** esta pasta.

*Pacote v1.0 · documentação de design · não altera código do sistema.*
