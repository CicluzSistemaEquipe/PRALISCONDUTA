# TYPOGRAPHY_SYSTEM — Pralís

> Valores em `DESIGN_TOKENS.json` (`typography.*`). Regras de aplicação abaixo.

---

## 1. Famílias

| Família | Papel | Regra |
|---|---|---|
| **MadeByDillan** | Display / logo | **SÓ dentro do logotipo.** Nunca em texto de UI. |
| **Montserrat** (400/600/700) | UI / corpo | A fonte de trabalho de **tudo** no produto. |
| **TR Freehand** | Manuscrita / acento | Raro: toque humano, fala da Lis, assinatura. |
| **Mono** (`JetBrains/IBM Plex Mono`) | Códigos / IDs | Tokens, `ACCESS-CODE`, ids. |
| **Fraunces / serif** | Apresentação | **Só em keynote/landing**, nunca na UI do produto. |

> Números **sempre** `font-variant-numeric: tabular-nums`.

---

## 2. Escala — Admin (referência de produto)

| Estilo | Tam/Linha | Peso | Uso |
|---|---|---|---|
| H1 (page title) | 22/28 | 700 | título da tela |
| H2 (section) | 17/24 | 600 | bloco |
| H3 (subsection) | 15/22 | 600 | cards |
| Body | 14/22 | 400 | texto padrão |
| Body-strong | 14/22 | 600 | nome/valor |
| Label | 13/18 | 500 | labels de input |
| Eyebrow | 11/16 | 600 · `0.06em` UPPER | overline, header de tabela |
| KPI | 28–32 | 700 | métricas (tabular) |

## 3. Escala — App (mais expressiva)

- **Hero/título:** `clamp(28px, 6vw, 40px)`, 700 — story fullscreen pede tamanho.
- **Título de story:** 20–26px, 700.
- **Corpo:** 15–17px, 400 (legibilidade > densidade).
- **Caption/tag:** 11–13px, 600, UPPER.

---

## 4. Regras de aplicação

1. **Hierarquia clara:** título grande → corpo legível → label pequeno. Nunca "tudo do
   mesmo tamanho".
2. **Montserrat resolve quase tudo.** Mude **peso/tamanho**, não a fonte.
3. **MadeByDillan = marca**, não conteúdo.
4. **Tracking:** levemente negativo em títulos grandes (`-0.01em`); positivo em
   eyebrows UPPER (`0.06em`).
5. **Linha:** corpo confortável (1.4–1.6); títulos justos (1.04–1.2).
6. **Comprimento de linha:** ~60–75 caracteres no corpo longo.
7. **Apresentação:** serifa editorial permitida nos títulos para o ar de keynote.

---

## 5. Checklist
- [ ] UI em Montserrat (MadeByDillan só no logo)?
- [ ] Hierarquia de tamanho/peso evidente?
- [ ] Números tabulares em dados/KPIs?
- [ ] Serifa só em apresentação, não no produto?
- [ ] Linha legível (comprimento e altura)?
