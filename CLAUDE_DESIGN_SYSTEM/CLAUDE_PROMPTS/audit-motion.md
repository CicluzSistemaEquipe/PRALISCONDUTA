# Auditar Motion — Pralís

**Objetivo:** rodar um checklist de animação numa tela/componente e devolver problemas + correção.

## Antes de começar, carregue
- A tela/componente com animação (código de preferência).
- `../MOTION_SYSTEM.md` e `../../DESIGN_KNOWLEDGE_BASE_PRALIS/07_MOTION_GUIDELINES.md`.
- `../DESIGN_TOKENS.json` — tokens de duração/easing.

## Perguntas de direção
1. **Mundo:** 🌙 APP (restrições duras: sem blur/loop) ou ☀️ ADMIN?
2. **Onde:** entrada, hover, clique, transição de estado/rota?
3. **Alvo:** roda em celular fraco?

## Checklist de auditoria (marcar 🟢/🟡/🔴 + nota)
- [ ] Toda animação tem **função nomeável** (não decora)?
- [ ] Anima **só `transform`/`opacity`** (60fps)?
- [ ] Durações 120–300ms e ease enfático `cubic-bezier(0.16,1,0.3,1)` (dentro dos tokens)?
- [ ] **App:** sem `repeat: Infinity`? sem `backdrop-filter: blur`?
- [ ] **`prefers-reduced-motion`** tratado?
- [ ] Transição de página **não** começa em `opacity:0` total (anti-tela-preta)?
- [ ] `will-change` controlado; sem reflow/animação custosa em loop?

## Passo a passo
1. Percorra o checklist; marque severidade (🔴 crítico bloqueia, ex.: blur/loop no app).
2. Para cada falha, descreva problema + correção (snippet Framer quando útil).
3. Verifique fluidez percebida em cenário de celular fraco.
4. Feche com veredito de Motion (🟢/🟡/🔴) e correções priorizadas.

## Restrições / regras (CANON)
- 🌙 APP: blur e loop infinito são **proibidos** — falha crítica automática.
- Motion sempre com propósito; tokens, não números mágicos.

## Pronto quando
- [ ] Todos os itens avaliados com severidade + correção.
- [ ] Veredito de Motion + lista priorizada entregues.
- [ ] **Ao aplicar correções, rodar `./design-review.md`.**
