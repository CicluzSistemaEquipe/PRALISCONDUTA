# Design Knowledge Base — Pralís

> **Fonte oficial de Design, Produto e UX da Pralís.**
> Esta pasta ensina como a Pralís **pensa, comunica, desenha, organiza informação e
> constrói interfaces**. Qualquer pessoa ou IA deve conseguir criar material visual
> da marca lendo apenas estes documentos.
>
> Não é documentação técnica — é documentação de **Design e Produto**.

---

## Como usar (resumo)

1. **Internalize a base:** leia `01` → `02` → `03` → `10` (fundação, filosofia,
   identidade, regras).
2. **Defina a direção** antes de construir (mundo, objetivo, conceito, paleta, motion).
3. **Construa** com os tokens (`03`) e componentes (`04`).
4. **Revise** com o checklist (`11`) antes de entregar.

IA: o manual de uso é o **`12_AI_CONTEXT.md`** — comece por ele.

---

## Índice

| # | Documento | O que ensina |
|---|---|---|
| 01 | [`01_BRAND_FOUNDATION.md`](01_BRAND_FOUNDATION.md) | Quem é a Pralís: propósito, posicionamento, personalidade, valores, tom, Lis |
| 02 | [`02_DESIGN_PHILOSOPHY.md`](02_DESIGN_PHILOSOPHY.md) | Como pensar o design; os dois mundos; hierarquia, UX, motion, a11y |
| 03 | [`03_VISUAL_IDENTITY.md`](03_VISUAL_IDENTITY.md) | Cores, tipografia, espaçamento, tokens reais, componentes base (a fonte da verdade visual) |
| 04 | [`04_COMPONENT_LIBRARY.md`](04_COMPONENT_LIBRARY.md) | Todos os componentes reais: o que é, quando usar/não usar, como evoluir |
| 05 | [`05_PRODUCT_GUIDELINES.md`](05_PRODUCT_GUIDELINES.md) | Como construir dashboard, CMS, editor, treinamentos, relatórios, por papel |
| 06 | [`06_UX_GUIDELINES.md`](06_UX_GUIDELINES.md) | Hierarquia, escaneabilidade, estados, feedback, acessibilidade |
| 07 | [`07_MOTION_GUIDELINES.md`](07_MOTION_GUIDELINES.md) | Manual de motion: tokens, padrões, quando usar/evitar, 60fps |
| 08 | [`08_PRESENTATION_GUIDELINES.md`](08_PRESENTATION_GUIDELINES.md) | Como criar apresentações/keynotes premium |
| 09 | [`09_REFERENCES.md`](09_REFERENCES.md) | Quais empresas estudar e o que aprender — princípios, nunca cópia |
| 10 | [`10_DESIGN_RULES.md`](10_DESIGN_RULES.md) | Regras permanentes e inegociáveis |
| 11 | [`11_DESIGN_REVIEW_CHECKLIST.md`](11_DESIGN_REVIEW_CHECKLIST.md) | Checklist por gates, rodar antes de finalizar qualquer tela |
| 12 | [`12_AI_CONTEXT.md`](12_AI_CONTEXT.md) | Como a IA deve usar toda esta base |

---

## A Pralís em uma frase

> **Quente, claro, premium e inconfundivelmente Pralís** — princípios de produto de
> classe mundial com **alma de padaria artesanal**.

## Os dois mundos (a decisão mais importante)

| 🌙 **Colaborador (app)** | ☀️ **Admin / CMS** |
|---|---|
| Escuro quente · emocional · engajamento | Claro · produtivo · clareza e velocidade |
| `#0d0800` · laranja ação · dourado brilho | `#ffffff` · laranja ação · sem dourado na UI |
| Story, Lis, jornada, celebração | Tabela herói, KPIs, drill-down |
| Motion expressivo (sem loop/blur) | Motion snappy (Linear) |

Saber em qual mundo você está é a **primeira** decisão de qualquer peça.

---

## Fontes de verdade (código real)

Esta base foi extraída do projeto. Para valores exatos, o código vence:
- `tailwind.config.ts` · `src/styles/pralis.css` · `src/admin/admin.css`
- `docs/ADMIN_DESIGN_SYSTEM.md` · `docs/apresentacao/` (identidade aplicada)
- `src/assets/brand/` · `src/assets/lis/`

Para **princípios e direção**, esta base vence.

---

*Versão inicial · documentação de Design/Produto/UX · não altera código do sistema.*
