# SPACING_SYSTEM — Pralís

> Valores em `DESIGN_TOKENS.json` (`spacing`, `radius`, `grid`, `breakpoints`,
> `elevation`). Regras abaixo.

---

## 1. Escala base 4

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

Tudo (padding, margin, gap) sai desta escala. **Sem números mágicos.**

| Uso | Valor |
|---|---|
| Padding de card | 20–24 |
| Padding de input | 10×12 |
| Padding de botão | 8×14 |
| Ritmo entre seções | 32–40 |
| Gap de grid | 24 |

> **Hierarquia por espaço, não por caixa.** Agrupe com whitespace + 1 hairline.
> **Nunca card dentro de card dentro de card.**

---

## 2. Raio

| Token | Valor | Uso |
|---|---|---|
| sm | 6 | detalhes |
| **md** | 8 | inputs/botões (admin) |
| **lg** | 12 | cards (admin) |
| **card** | 20 | cards (app) |
| pill | 999 | badges, botões-pílula |

---

## 3. Elevação

- **Admin: borda 1px > sombra.** Cards usam `border #ECEAE7`. Sombra `md`
  (`0 8px 24px rgba(26,23,20,.10)`) **só** em dropdown/popover/modal/toast.
- **App:** borda quente fina (`rgba(184,134,11,.22)`), **sem sombra pesada** nas telas
  críticas. Sombras de marca (`pralis-glow`, `play`) só fora do caminho de performance.

---

## 4. Grid & shell

- **Admin:** sidebar **248px** (rail colapsado **64px**) + conteúdo `max-width 1200`,
  padding 32 (desktop) / 16 (mobile), grid **12 col**, gutter **24**.
- **App:** mobile-first, `app-shell` fullscreen, `safe-area` (notch), barras `max 480`.

## 5. Responsividade

| Breakpoint | Valor | Comportamento |
|---|---|---|
| sm | 640 | — |
| md | 768 | tabelas viram cards abaixo |
| lg | 1024 | sidebar fixa ≥; drawer < |
| xl | 1280 | — |

- **KPIs:** 1 col <480 · 2 col 480–1024 · 4 col ≥1024.
- **Toque ≥44px** (mobile); controles 36px (desktop). Modais viram bottom-sheet no mobile.

---

## 6. Checklist
- [ ] Espaços saem da escala base 4?
- [ ] Hierarquia por espaço (não caixas aninhadas)?
- [ ] Raio correto por mundo (8/12 admin · 20 app)?
- [ ] Admin com borda, não sombra?
- [ ] Responsivo (sidebar→drawer, tabela→cards, KPIs)?
