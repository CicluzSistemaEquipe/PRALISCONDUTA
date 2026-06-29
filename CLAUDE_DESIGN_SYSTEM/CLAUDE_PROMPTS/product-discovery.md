# Product Discovery — Pralís

**Objetivo:** clarificar o problema real, escopo (MVP vs depois), público e métrica **antes** de desenhar qualquer tela.

## Antes de começar, carregue
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/01_BRAND_FOUNDATION.md` — propósito Pralís, Lis, "é provar e ser feliz".
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/05_PRODUCT_GUIDELINES.md` — contrato congelado, o que não mexer.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/02_DESIGN_PHILOSOPHY.md` — as 8 leis e a filosofia dos dois mundos.

## Perguntas de direção (o coração desta etapa)
1. **Problema real:** que dor concreta isso resolve? (não a solução — a dor). Qual evidência de que existe?
2. **Público:** 🌙 colaborador (aprendizado/conduta) ou ☀️ gestor (administração)? Persona específica?
3. **Sucesso/métrica:** como sabemos que funcionou? (ex.: % de Modules concluídos, tempo de cadastro).
4. **MVP vs depois:** qual é o menor recorte que entrega valor? O que fica para v2?
5. **Restrições:** o que NÃO pode mudar (contrato congelado)? Prazo? Mundo?
6. **Por quê agora:** qual o ganho de fazer isso antes de outras coisas?

## Passo a passo
1. Escreva o problema em 1 frase ("Usuário X não consegue Y, o que causa Z").
2. Confirme público e o mundo (app vs admin) — define toda a direção visual depois.
3. Defina **1 métrica de sucesso** verificável.
4. Recorte o **MVP**: lista do que entra (mínimo viável) e do que fica explicitamente **fora**.
5. Liste premissas e restrições (contrato congelado, LGPD, prazo).
6. Só com isso fechado, encaminhe para `create-screen.md` / `create-flow.md` / etc.

## Restrições / regras (CANON)
- **Não desenhar antes** de problema, público, métrica e MVP estarem claros.
- Não fabricar requisito que ninguém pediu (sem scope creep).
- Contrato de produto congelado é restrição, não tema de discussão aqui.
- Privacidade LGPD: só coletar dado que vira decisão.

## Pronto quando
- [ ] Problema, público, métrica, MVP e fora-de-escopo escritos e claros.
- [ ] Premissas/restrições listadas; mundo definido.
- [ ] Handoff para o prompt de criação correto.
- [ ] (Ao desenhar) **rodar `./design-review.md`** no fim.
