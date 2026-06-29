# Criar Fluxo de Usuário — Pralís

**Objetivo:** mapear e desenhar um fluxo ponta a ponta (várias telas/passos) com caminho feliz curto.

## Antes de começar, carregue
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md` — caminho feliz, 3 estados, feedback.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/05_PRODUCT_GUIDELINES.md` — contrato de produto congelado.
- `../DESIGN_TOKENS.json`, `../DESIGN_SYSTEM.md`.
- `../UX_PATTERNS.md`.
- Telas aprovadas relacionadas em `../SCREENSHOTS/APPROVED_SCREENS/`.

## Perguntas de direção
1. **Mundo:** 🌙 APP colaborador ou ☀️ ADMIN?
2. **Objetivo do fluxo:** qual tarefa o usuário completa? (ex.: concluir um Module, cadastrar colaborador.)
3. **Entrada e saída:** de onde ele chega? Para onde vai ao terminar (estado de sucesso)?
4. **Decisões/ramos:** onde há escolha, erro ou bloqueio (desbloqueio/progresso)?

## Passo a passo
1. Liste os passos do **caminho feliz** — menor número de cliques/decisões possível.
2. Para cada passo: tela, ação principal (1 laranja), feedback esperado.
3. Mapeie **estados por passo**: loading, empty, error, sucesso. Defina o retry.
4. Mapeie ramos: validação, bloqueio (locked), permissões — sem mexer no contrato congelado.
5. Defina feedback otimista + toast onde couber; estado de conclusão claro.
6. Desenhe transições entre passos com motion de propósito (reduced-motion).

## Restrições / regras (CANON)
- **Contrato de produto congelado**: não alterar desbloqueio/progresso/conclusão/assinatura/`Module`/`Story`.
- Feature nova é aditiva e desacoplada; gamificação não vira regra de negócio.
- App: responder sempre "onde parei / o que faço / quanto falta". Tokens, não números mágicos.
- Privacidade LGPD: só coletar o que vira decisão. Sem dark patterns.

## Pronto quando
- [ ] Caminho feliz mínimo mapeado; entrada/saída e sucesso definidos.
- [ ] Todos os estados e ramos cobertos por passo; retry definido.
- [ ] Contrato congelado intacto; sem dark patterns; AA ok.
- [ ] **Rodar `./design-review.md`** — qualquer 🔴 bloqueia.
