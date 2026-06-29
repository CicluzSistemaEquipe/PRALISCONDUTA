# Redesenhar Tela Existente — Pralís

**Objetivo:** auditar uma tela atual contra as aprovadas + regras, e **propor antes de executar**.

## Antes de começar, carregue
- A tela atual (código/print) que será redesenhada.
- `../DESIGN_TOKENS.json`, `../DESIGN_SYSTEM.md`, `../MOTION_SYSTEM.md`.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/10_DESIGN_RULES.md` — as 8 leis.
- Telas aprovadas do mundo certo em `../SCREENSHOTS/APPROVED_SCREENS/` (referência de qualidade).

## Perguntas de direção
1. **Mundo:** 🌙 APP ou ☀️ ADMIN? (a tela já tem um — confirmar.)
2. **Problema real:** o que está ruim hoje? (estética genérica? hierarquia? performance? estados faltando?)
3. **Objetivo:** o que precisa melhorar de fato — e o que **NÃO** mudar (contrato congelado)?
4. **Restrição:** mexer só no visual ou também no fluxo?

## Passo a passo
1. **Auditar** a tela atual item a item contra as 8 leis e as telas aprovadas. Listar problemas com severidade.
2. Comparar: identidade, hierarquia, 1 laranja, tokens, 3 estados, motion, AA, performance.
3. **Propor** o redesenho (antes/depois em palavras + mudanças concretas) e **aguardar aprovação**.
4. Só então executar — preservando contrato congelado e reusando componentes.
5. Aplicar tokens, corrigir estados faltantes, ajustar motion com propósito.
6. Validar contra as telas aprovadas.

## Restrições / regras (CANON)
- **Propor antes de executar** — não refazer direto.
- Não inventar hex; tokens do `DESIGN_TOKENS.json`. App sem blur/loop; admin sem dourado.
- Contrato congelado intacto; mudança aditiva e desacoplada quando possível.
- Sem cara de template/IA; AA; performance leve no app.

## Pronto quando
- [ ] Auditoria com severidades + proposta aprovada ANTES da execução.
- [ ] Redesenho fiel ao mundo, às 8 leis e às telas aprovadas.
- [ ] Contrato intacto; tokens, estados, motion e AA ok.
- [ ] **Rodar `./design-review.md`** — qualquer 🔴 bloqueia.
