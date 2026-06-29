# PRESENTATION_SYSTEM — Pralís Keynote

> Sistema acionável para o **keynote** da Pralís — "**Do forno à jornada**". Apresentação
> editorial dark, premium, uma ideia por slide. Valores em `DESIGN_TOKENS.json`. Mundo/leis
> em `BRAND_RULES.md`. Filosofia em `../DESIGN_KNOWLEDGE_BASE_PRALIS/` (08_PRESENTATION).
> **Exemplo real e fonte de verdade:** `../../docs/apresentacao/index.html`.

**Mundo próprio:** não é o app nem o admin — é **keynote dark editorial**. Fundo escuro
quente, **serif editorial Fraunces** (permitida **só** em apresentação) + **Montserrat** no
corpo/UI. Assinatura gráfica: **espigas** + a **Lis** + **fio dourado**. Dourado é
**bem-vindo** aqui (é o brilho da marca). 1 ideia por slide, **pouco texto**.

---

## 1. Anatomia do deck

```
CAPA → SUMÁRIO → [ DIVISOR → CONTEÚDO × n ] × seções → ENCERRAMENTO
```

### Capa
```
┌───────────────────────────────────────────┐
│                                           │
│   trio de espigas (sutil, fio dourado)    │
│                                           │
│   Do forno à jornada                      │ ← Fraunces grande, editorial
│   Pralís · Conduta                        │ ← Montserrat eyebrow uppercase
│                                           │
│   Lis (full, discreta)                    │
│              ‹ • • • • ›   ⛶              │ ← dots + fullscreen
└───────────────────────────────────────────┘
```

### Sumário
Lista numerada das seções, tipografia grande, muito ar. 1 nível só.

### Divisor de seção
Slide-respiro: número da seção + título em Fraunces, fio dourado, quase sem mais nada.
Marca a virada de assunto.

### Slide de conteúdo
```
┌───────────────────────────────────────────┐
│  EYEBROW DA SEÇÃO                          │ ← Montserrat 11/600 uppercase, muted
│                                           │
│  Uma afirmação forte                      │ ← Fraunces, a ÚNICA ideia do slide
│                                           │
│  [ elemento de apoio: card / diagrama /   │ ← no máx. 1 elemento visual
│    timeline / matriz / mockup / nota Lis ]│
│                                           │
│  · fio dourado ·            ‹ • ● • › ⛶   │
└───────────────────────────────────────────┘
```

### Encerramento
Assinatura da marca ("*é provar e ser feliz*"), espigas, Lis, CTA/contato. Volta ao tom da capa.

**Do:** 1 ideia por slide; pouco texto (o apresentador fala); ar generoso.
**Don't:** bullets densos; 2 mensagens competindo; serif fora da apresentação.

---

## 2. Elementos de apoio (1 por slide)

- **Card:** afirmação curta + ícone; fundo de superfície sutil, borda fina dourada discreta.
- **Diagrama (ASCII/SVG):** fluxo simples, 3–5 nós, fio conector dourado.
  ```
  Forno ──▸ Massa ──▸ Trilha ──▸ Conduta
  ```
- **Timeline:** marcos na horizontal, ponto dourado no marco atual, rótulos curtos.
- **Matriz 2×2:** posicionamento/priorização; eixos rotulados, 1 quadrante em destaque.
- **Mockup:** frame de celular mostrando o **app real** (mundo escuro) ou frame de browser
  para o admin — apresenta o produto, não um desenho genérico.
- **Nota da Lis:** balão com a Lis (bust) trazendo a voz humana da marca — 1 frase, calorosa.

**Do:** reaproveitar espigas/Lis/fio dourado como fios condutores entre slides.
**Don't:** mais de 1 elemento por slide; gráfico poluído; clip-art genérico.

---

## 3. Motion

- **Entrada de conteúdo:** fade+slide curto, easing **`emphasized`**
  (`cubic-bezier(0.16,1,0.3,1)` — ease assinatura), stagger **`presentation` 70ms**.
- **Transição de slide:** `motion.durations.page`, `transform`+`opacity` só.
- **Fio dourado / espigas:** revelar com draw/opacity **pontual**, sem loop.
- **`prefers-reduced-motion`:** desliga transforms, mantém opacity (conteúdo sempre legível).
- **Modo PDF:** sem animação, layout estático imprimível.

**Don't:** transições 3D/cube; auto-play cronometrado; movimento que distrai da fala.

---

## 4. Navegação

- **Teclado:** ← → (slides), Espaço (avança), Esc (sai do fullscreen), Home/End.
- **Dots:** indicador clicável de posição.
- **Swipe:** em touch.
- **Fullscreen:** botão ⛶ + tecla F.
- **Modo PDF:** rota/flag que renderiza tudo estático para exportar/imprimir.

---

## 5. Formato técnico

- **HTML self-contained** (um `index.html`), como `../../docs/apresentacao/index.html` —
  abre em qualquer browser, sem build, sem dependência externa de runtime.
- Fontes: Fraunces (serif editorial) + Montserrat — embutidas/carregadas com fallback
  (`Georgia, serif` / `system-ui`).
- Assets (espigas, Lis, logo) referenciados localmente; deck portátil.
- Acessível: contraste AA mesmo no dark, foco visível, navegação por teclado, reduced-motion.

---

## 6. Checklist do keynote
- [ ] Keynote dark editorial · Fraunces + Montserrat · dourado/espigas/Lis/fio dourado.
- [ ] 1 ideia por slide · pouco texto · ar generoso.
- [ ] Estrutura: capa → sumário → (divisor → conteúdo) → encerramento.
- [ ] Máx. 1 elemento de apoio por slide (card/diagrama/timeline/matriz/mockup/nota Lis).
- [ ] Motion `emphasized` + stagger 70ms · só transform/opacity · sem loop.
- [ ] Navegação teclado + dots + swipe + fullscreen.
- [ ] reduced-motion **e** modo PDF · contraste AA no dark.
- [ ] HTML self-contained (espelha `../../docs/apresentacao/index.html`).
