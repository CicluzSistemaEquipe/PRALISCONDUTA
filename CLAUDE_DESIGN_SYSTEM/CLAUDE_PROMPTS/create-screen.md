# Criar Tela Nova — Pralís

**Objetivo:** desenhar uma tela nova qualquer — **decidindo o mundo primeiro** e seguindo o pattern dele.

## Antes de começar, carregue
- `../DESIGN_TOKENS.json` — cores/spacing/raio (NUNCA inventar hex).
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md` — hierarquia, 3 estados.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/04_COMPONENT_LIBRARY.md` — reusar antes de criar.
- `../DESIGN_SYSTEM.md`, `../MOTION_SYSTEM.md`.
- Telas aprovadas do mundo certo em `../SCREENSHOTS/APPROVED_SCREENS/` (`colaborador-*` ou `admin-*`).

## Perguntas de direção (decidir ANTES)
1. **Mundo:** 🌙 APP colaborador (escuro, emocional, mobile) **ou** ☀️ ADMIN (claro, produtivo, desktop)?
2. **Objetivo:** qual a 1 ação principal? O usuário sai daqui tendo feito o quê?
3. **Público + tarefa:** colaborador aprendendo/agindo, ou gestor administrando?
4. **App:** responde "onde parei / o que faço / quanto falta"?

## Passo a passo
1. Escolha o mundo e abra as telas aprovadas correspondentes como base visual.
2. Defina hierarquia: mensagem #1 que salta em <3s; 1 laranja de ação.
3. Estruture em blocos previsíveis e escaneáveis; reuse componentes da biblioteca.
4. Aplique tokens (cor/spacing/raio); tipografia Montserrat.
5. Desenhe os **3 estados**: loading (skeleton), empty (ícone+texto+CTA), error (retry).
6. Adicione motion com propósito (entrada/feedback), respeitando reduced-motion.

## Restrições / regras (CANON)
- 🌙 APP: fundo quente `#0d0800`, ação `#f37435`, dourado = brilho emocional; **sem blur, sem loop infinito**; mobile-first.
- ☀️ ADMIN: fundo `#fff`, ação `#F26B2A` (1/tela), **SEM dourado na UI**; sidebar 248; tabela herói.
- Light opcional do app = creme `#fdf8f2` (mesma alma, mais claro).
- Tokens, não números mágicos. Status por cor+ícone+texto. Sem cara de template/IA.

## Pronto quando
- [ ] Mundo correto e coerente; 1 ação principal óbvia em <3s.
- [ ] 3 estados presentes; componentes reusados; tokens respeitados.
- [ ] Motion com propósito + reduced-motion; AA ok.
- [ ] **Rodar `./design-review.md`** — qualquer 🔴 bloqueia.
