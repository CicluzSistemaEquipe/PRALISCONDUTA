# Auditar UX — Pralís

**Objetivo:** rodar um checklist de UX numa tela/fluxo e devolver problemas com severidade e correção.

## Antes de começar, carregue
- A tela/fluxo a auditar (código ou print).
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md` — base das regras.
- `../UX_PATTERNS.md`.
- `../DESIGN_TOKENS.json`; telas aprovadas em `../SCREENSHOTS/APPROVED_SCREENS/`.

## Perguntas de direção
1. **Mundo:** 🌙 APP ou ☀️ ADMIN? (muda expectativas de UX).
2. **Tarefa:** qual é o trabalho que o usuário quer concluir aqui?
3. **Escopo:** auditar 1 tela ou um fluxo inteiro?

## Checklist de auditoria (marcar 🟢/🟡/🔴 + nota)
- [ ] **Hierarquia:** mensagem/ação #1 salta em <3s?
- [ ] **Escaneabilidade:** blocos previsíveis, texto curto, ícone+rótulo?
- [ ] **Caminho feliz:** mínimo de cliques/decisões? Próximo passo óbvio?
- [ ] **3 estados:** loading (skeleton), empty (ícone+texto+CTA), error (retry)?
- [ ] **Feedback:** toda ação responde (otimista + toast quando couber)?
- [ ] **Status:** comunicado por cor + ícone + texto (não só cor)?
- [ ] **App:** responde "onde parei / o que faço / quanto falta"?
- [ ] **Ação primária:** exatamente 1 laranja por tela?
- [ ] **Dark patterns / LGPD:** sem coação; só coleta o que vira decisão?

## Passo a passo
1. Percorra o checklist item a item, anotando severidade (🔴 crítico bloqueia).
2. Para cada falha, descreva o problema **e** a correção concreta.
3. Compare com as telas aprovadas como referência de qualidade.
4. Feche com veredito de UX (🟢/🟡/🔴) e lista priorizada de correções.

## Restrições / regras (CANON)
- Apontar, não inventar requisito novo fora do contrato congelado.
- Severidade honesta: "cara de IA/genérico", estados faltando e violação de AA são críticos.

## Pronto quando
- [ ] Todos os itens avaliados com severidade + correção.
- [ ] Veredito de UX + lista priorizada entregues.
- [ ] **Encaminhar correções e, ao aplicar, rodar `./design-review.md`.**
