# Criar Landing Page — Pralís

**Objetivo:** landing institucional quente da Pralís — identidade própria, sem layout copiado de template.

## Antes de começar, carregue
- `../DESIGN_TOKENS.json` — paleta quente (preto quente, laranja, dourado, creme).
- `../BRAND_RULES.md` e `../../DESIGN_KNOWLEDGE_BASE_PRALIS/01_BRAND_FOUNDATION.md` — voz, "é provar e ser feliz", Lis.
- `../TYPOGRAPHY_SYSTEM.md`, `../COLOR_SYSTEM.md`, `../MOTION_SYSTEM.md`.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/09_REFERENCES.md` — **princípios**, nunca copiar layout.
- `../BEST_PRACTICES/` — extrair princípios, não pixels.
- Assets: `../LOGOS/`, `../ASSETS/` (espiga, padrão de fundo, Lis).

## Perguntas de direção
1. **Objetivo:** conversão de quê? (apresentar a padaria? captar franquia? recrutar?) — define CTA único.
2. **Público:** cliente final, franqueado ou candidato? Muda tom e prova.
3. **Mensagem #1:** qual frase precisa ficar na cabeça? ("padaria artesanal", "é provar e ser feliz").
4. **Tom visual:** institucional **quente/artesanal** — calor de forno, não tech genérico.

## Passo a passo
1. Defina conceito autoral + mensagem #1 + **1 CTA** antes de seções.
2. Hero: identidade forte (espiga/Lis/padrão), título Montserrat, calor de paleta, 1 laranja de ação.
3. Seções escaneáveis: história artesanal → diferencial → prova → CTA. Texto curto, ritmo de espaço.
4. Motion de entrada com propósito (reveal on-scroll suave); nada de carrossel infinito.
5. Responsivo mobile-first; imagens otimizadas (poster p/ vídeo).
6. 3 estados onde houver dados/form (loading/empty/error).

## Restrições / regras (CANON)
- **Não copiar layout** de referência — extrair só princípios.
- Cores só do `DESIGN_TOKENS.json`; **laranja = 1 ação primária**; dourado com parcimônia (brilho, não UI).
- Motion só `transform`/`opacity`, ease `cubic-bezier(0.16,1,0.3,1)`, 120–300ms, `prefers-reduced-motion`.
- Acessibilidade AA; toque ≥44px; foco visível. Sem cara de template/IA.

## Pronto quando
- [ ] Mensagem #1 e CTA únicos, óbvios em <3s; identidade Pralís inconfundível.
- [ ] Layout autoral (não-template); responsivo; motion com propósito; AA ok.
- [ ] Tokens respeitados; performance leve no celular.
- [ ] **Rodar `./design-review.md`** — qualquer 🔴 bloqueia.
