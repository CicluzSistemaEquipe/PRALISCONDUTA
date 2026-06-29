# Criar Tela Mobile (App Colaborador) — Pralís

**Objetivo:** desenhar uma tela 🌙 do app colaborador, **mobile-first**, emocional e leve (PWA).

## Antes de começar, carregue
- `../DESIGN_TOKENS.json` — `appDark` (fundo quente, ação, dourado de brilho).
- `../LAYOUT_PATTERNS.md`.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md`, `07_MOTION_GUIDELINES.md`.
- `../MOTION_SYSTEM.md`.
- Telas aprovadas: `../SCREENSHOTS/APPROVED_SCREENS/colaborador-home-feed.png`, `colaborador-progresso.png`, `colaborador-storyplayer-modulo.png`, `colaborador-perfil.png`; `../SCREENSHOTS/COMPONENT_SCREENSHOTS/bottomnav.png`.

## Perguntas de direção
1. **Objetivo:** qual a 1 ação principal nesta tela? (continuar trilha, ver progresso…)
2. **Emoção:** que sensação queremos? (acolhimento, orgulho, calor de forno — guia Lis).
3. **Contexto de uso:** celular, possivelmente fraco, em pé no trabalho — leveza é requisito.
4. Responde "onde parei / o que faço / quanto falta"?

## Passo a passo
1. Base mobile (largura ~390): conteúdo em coluna, polegar-friendly, **bottom nav** consistente.
2. Hierarquia emocional: mensagem #1 e próximo passo óbvios; 1 laranja `#f37435` de ação.
3. Toque ≥44px; tipografia Montserrat legível; dourado só como brilho/realce, não na maioria da UI.
4. 3 estados: skeleton, empty (ícone+texto+CTA), error (retry).
5. Motion de entrada/feedback com propósito; **sem blur, sem loop infinito**; reduced-motion.
6. Light opcional = creme `#fdf8f2` (mesma alma, mais claro), se a tela tiver toggle.

## Restrições / regras (CANON)
- 🌙 APP: fundo `#0d0800` (nunca preto puro), ação `#f37435`; **proibido `backdrop-filter: blur` e `repeat: Infinity`**.
- Leve em celular fraco; só `transform`/`opacity`; imagens otimizadas.
- Tokens, não números mágicos; contrato congelado intacto; AA.

## Pronto quando
- [ ] Mobile-first, polegar-friendly, emocional e leve; 1 ação óbvia.
- [ ] 3 estados; sem blur/loop; reduced-motion; toque ≥44px; AA.
- [ ] Tokens `appDark` respeitados; identidade Pralís presente.
- [ ] **Rodar `./design-review.md`** — qualquer 🔴 bloqueia.
